import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save } from 'lucide-react';

interface SettingsViewProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userProfile, setUserProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'income' || name === 'rent' || name === 'householdSize' || name === 'commuteDistanceKm' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Household Profile</h1>
        <p className="text-slate-500">Update your information to get accurate AI predictions.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Display Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Occupation</label>
            <input 
              type="text" 
              name="occupation" 
              value={formData.occupation} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Monthly Household Income (RM)</label>
            <input 
              type="number" 
              name="income" 
              value={formData.income} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Monthly Rent (RM)</label>
            <input 
              type="number" 
              name="rent" 
              value={formData.rent} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Location</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Household Size</label>
            <input 
              type="number" 
              name="householdSize" 
              value={formData.householdSize} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Commute Method</label>
            <select 
              name="commuteMethod" 
              value={formData.commuteMethod} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="car">Private Car</option>
              <option value="transit">Public Transit</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">Commute Distance (km)</label>
             <input 
              type="number" 
              name="commuteDistanceKm" 
              value={formData.commuteDistanceKm} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-sm text-emerald-600 font-medium transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
            Changes saved successfully!
          </span>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;