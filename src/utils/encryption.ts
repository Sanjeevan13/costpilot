import CryptoJS from 'crypto-js';

// The key used for encryption/decryption. In production, this should be a robust key
// provided by an environment variable. Do NOT check the real key into version control.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'LOCAL_DEV_DUMMY_KEY_DO_NOT_USE_IN_PROD';

/**
 * Encrypts a value (string, number, or object) into an AES-256 ciphertext string.
 * @param data The data to encrypt
 * @returns The encrypted string, or null if encryption fails
 */
export const encryptData = (data: any): string | null => {
    if (data === undefined || data === null) return null;

    try {
        const stringData = typeof data === 'string' ? data : JSON.stringify(data);
        return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
};

/**
 * Decrypts an AES-256 ciphertext string back to its original type.
 * @param ciphertext The encrypted string
 * @returns The decrypted data, or null if decryption fails
 */
export const decryptData = (ciphertext: string | null | undefined): any => {
    if (!ciphertext) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        // Attempt to parse it as JSON in case it was an object or number.
        // If it fails, it might just be a regular string.
        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};
