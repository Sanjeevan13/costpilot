import React, { useState } from 'react';
import { ViewState, UserProfile } from './types';
import TopBar from './components/TopBar';
import OptimizationView from './components/OptimizationView';
import DashboardView from './components/DashboardView';
import SubsidiesView from './components/SubsidiesView';
import SettingsView from './components/SettingsView';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import LoginView from './src/components/LoginView';
import { RefreshCw } from 'lucide-react';

// Default user profile for the demo
const DEFAULT_USER: UserProfile = {
  name: "Kisshore",
  photoUrl: "",
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

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);

  React.useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.displayName || user.email?.split('@')[0] || prev.name,
        photoUrl: user.photoURL || prev.photoUrl
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.OPTIMIZATION:
        return <OptimizationView userProfile={userProfile} />;
      case ViewState.DASHBOARD:
        return <DashboardView userProfile={userProfile} setView={setView} />;
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-200">
      <TopBar currentView={currentView} setView={setView} userProfile={userProfile} />
      <main className="pb-12">
        {renderView()}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>&copy; 2026 CostPilot. Built for KitaHack 2026 by TVK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthenticatedApp />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;