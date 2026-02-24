import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from './AuthContext';
import { db, storage } from '../firebaseConfig';
import { UserProfile } from '../../types';
import { encryptData, decryptData } from '../utils/encryption';

const SENSITIVE_FIELDS = [
    'income', 'rent', 'utilities', 'transportCost', 'food',
    'debt', 'subscriptions', 'savings', 'emergencySavings',
    'wealthPlusStrategies', 'transportOptimizations',
    'claimedSubsidies', 'smartGoals', 'appliedLifestyleOptimizations'
];

interface UserContextType {
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    uploadProfilePicture: (file: File) => Promise<string>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

// Default user profile for new users
const DEFAULT_USER: UserProfile = {
    name: "New User",
    photoUrl: "",
    income: 0,
    rent: 0,
    location: "",
    occupation: "",
    householdSize: 1,
    commuteMethod: "car",
    commuteDistanceKm: 0,
    utilities: 0,
    transportCost: 0,
    food: 0,
    debt: 0,
    subscriptions: 0,
    savings: 0,
    emergencySavings: 0,
    age: 0,
    employmentStatus: 'employed',
    state: '',
    hasCompletedOnboarding: false,
    transportOptimizations: []
};

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setUserProfile(null);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const rawData = docSnap.data();
                const decryptedData = { ...rawData };
                for (const field of SENSITIVE_FIELDS) {
                    if (decryptedData[field] !== undefined && decryptedData[field] !== null) {
                        // Attempt to decrypt. If it yields null or fails, use fallback.
                        // However, decryptData handles non-encrypted data somewhat gracefully by 
                        // catching errors but if it's plainly unencrypted it might return null.
                        // Actually, if it's already a number, decryptData expects a string. 
                        // Let's ensure decryptData only processes strings.
                        if (typeof decryptedData[field] === 'string') {
                            const decryptedValue = decryptData(decryptedData[field]);
                            if (decryptedValue !== null) {
                                decryptedData[field] = decryptedValue;
                            }
                        }
                    }
                }
                setUserProfile(decryptedData as UserProfile);
            } else {
                // Create default profile if it doesn't exist
                try {
                    const newProfile = {
                        ...DEFAULT_USER,
                        name: user.displayName || user.email?.split('@')[0] || "User",
                        photoUrl: user.photoURL || ""
                    };
                    await setDoc(userRef, newProfile);
                    setUserProfile(newProfile);
                } catch (err: any) {
                    console.error("Error creating user profile:", err);
                    setError(err.message);
                }
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching user profile:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);

        // Sanitize and encrypt data: Firestore does not allow 'undefined' fields
        const sanitizeAndEncrypt = (obj: any) => {
            const result = JSON.parse(JSON.stringify(obj));
            for (const field of SENSITIVE_FIELDS) {
                if (result[field] !== undefined && result[field] !== null) {
                    const encryptedValue = encryptData(result[field]);
                    if (encryptedValue !== null) {
                        result[field] = encryptedValue;
                    }
                }
            }
            return result;
        };

        try {
            // Use setDoc with merge: true so it works even if document doesn't exist yet
            await setDoc(userRef, sanitizeAndEncrypt(data), { merge: true });
        } catch (err: any) {
            console.error("Error updating profile:", err);
            throw err;
        }
    };

    const uploadProfilePicture = async (file: File): Promise<string> => {
        if (!user) throw new Error("User not authenticated");

        // Create a unique filename or use a fixed one per user if you want to overwrite
        // Using fixed 'profile_pic' to overwrite saves storage space
        const storageRef = ref(storage, `users/${user.uid}/profile_pic`);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    };

    return (
        <UserContext.Provider value={{ userProfile, loading, error, updateProfile, uploadProfilePicture }}>
            {children}
        </UserContext.Provider>
    );
};
