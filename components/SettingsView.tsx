import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, Trash2 } from 'lucide-react';
import { useUser } from '../src/contexts/UserContext';

interface SettingsViewProps {
  userProfile: UserProfile;
  // setUserProfile is no longer needed as we use context, but keeping it optional to avoid breaking if passed
  setUserProfile?: (profile: UserProfile | Partial<UserProfile>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userProfile }) => {
  const { updateProfile, uploadProfilePicture } = useUser();
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'income' || name === 'rent' || name === 'householdSize' || name === 'commuteDistanceKm' ||
        name === 'utilities' || name === 'food' || name === 'transportCost' || name === 'debt' ||
        name === 'subscriptions' || name === 'savings' || name === 'age'
        ? Number(value)
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size must be less than 1MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photoUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalPhotoUrl = formData.photoUrl;

      if (selectedFile) {
        finalPhotoUrl = await uploadProfilePicture(selectedFile);
      }

      // Detect if user changed any financial fields
      const financialFields = ['income', 'rent', 'utilities', 'transportCost', 'food', 'debt', 'subscriptions', 'savings'];
      const hasFinancialChange = financialFields.some(field =>
        formData[field as keyof typeof formData] !== userProfile[field as keyof UserProfile]
      );

      const updateData: any = {
        ...formData,
        photoUrl: finalPhotoUrl
      };

      // If financial data changed, clear optimizedCategories to trigger re-analysis
      if (hasFinancialChange) {
        updateData.optimizedCategories = [];
      }

      await updateProfile(updateData);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(`Failed to update profile: ${(error as any).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Detected" };
        setFormData(prev => ({ ...prev, location: loc }));
        await updateProfile({ ...formData, location: loc }); // Use updateProfile from context
        alert("Location updated! We can now find nearby transit for you.");
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve location. Please allow access.");
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Household Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Update your information to get accurate AI predictions.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">📍 Location Context</h3>
        <p className="text-sm text-slate-500 mb-4">
          Enable location to let AI find nearby public transit (MRT/LRT) and suggest relevant housing strategies.
          We only use this to find generic amenities, not to track you.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLocation}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold text-sm"
          >
            <span>📍</span>
            Use My Current Location
          </button>
          {formData.location && typeof formData.location !== 'string' && (
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
              ✅ Active (Lat: {formData.location.lat.toFixed(2)}, Lng: {formData.location.lng.toFixed(2)})
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture</label>
            <div className="flex items-center gap-4">
              {(previewUrl || formData.photoUrl) && (
                <img src={previewUrl || formData.photoUrl} alt="Profile Preview" className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
              )}
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900/30 dark:file:text-blue-300
                  "
                />

              </div>
              {(formData.photoUrl || previewUrl) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Remove Profile Picture"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPG or PNG. Max 1MB.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Household Income (RM)</label>
            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Monthly Rent (RM)</label>
            <input
              type="number"
              name="rent"
              value={formData.rent}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Utilities (RM)</label>
            <input
              type="number"
              name="utilities"
              value={formData.utilities || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Food & Groceries (RM)</label>
            <input
              type="number"
              name="food"
              value={formData.food || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Transport Cost (RM)</label>
            <input
              type="number"
              name="transportCost"
              value={formData.transportCost || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Debt Repayment (RM)</label>
            <input
              type="number"
              name="debt"
              value={formData.debt || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subscriptions (RM)</label>
            <input
              type="number"
              name="subscriptions"
              value={formData.subscriptions || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Savings (RM)</label>
            <input
              type="number"
              name="savings"
              value={formData.savings || 0}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>



          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Household Size</label>
            <input
              type="number"
              name="householdSize"
              value={formData.householdSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Commute Method</label>
            <select
              name="commuteMethod"
              value={formData.commuteMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="car">Private Car</option>
              <option value="transit">Public Transit</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Status</label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Select Status</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
            </select>
          </div>



          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Commute Distance (km)</label>
            <input
              type="number"
              name="commuteDistanceKm"
              value={formData.commuteDistanceKm}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className={`text-sm text-emerald-600 dark:text-emerald-400 font-medium transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
            Changes saved successfully!
          </span>
          <button
            type="submit"
            disabled={uploading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;