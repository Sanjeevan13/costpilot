import React, { useState } from 'react';
import { ViewState, UserProfile } from './types';
import TopBar from './components/TopBar';
import OptimizationView from './components/OptimizationView';
import DashboardView from './components/DashboardView';
import SubsidiesView from './components/SubsidiesView';
import SettingsView from './components/SettingsView';

// Default user profile for the demo
const DEFAULT_USER: UserProfile = {
  name: "Alex",
  income: 4200,
  rent: 1600,
  location: "Kuala Lumpur, Cheras",
  occupation: "Retail Manager",
  householdSize: 4,
  commuteMethod: "car",
  commuteDistanceKm: 15,
  utilities: 250,
  transportCost: 450, // Approx for 15km car commute
  food: 900,
  debt: 350,
  subscriptions: 120,
  savings: 5000
};

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);

  const renderView = () => {
    switch (currentView) {
      case ViewState.OPTIMIZATION:
        return <OptimizationView userProfile={userProfile} />;
      case ViewState.DASHBOARD:
        return <DashboardView userProfile={userProfile} />;
      case ViewState.SUBSIDIES:
        return <SubsidiesView userProfile={userProfile} />;
      case ViewState.SETTINGS:
        return <SettingsView userProfile={userProfile} setUserProfile={setUserProfile} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
            <p className="text-lg">Module under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      <TopBar currentView={currentView} setView={setView} />
      <main className="pb-12">
        {renderView()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2024 CostPilot Financial Intelligence. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;