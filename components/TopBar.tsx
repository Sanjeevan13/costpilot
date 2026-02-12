import React from 'react';
import { ViewState } from '../types';
import { Bell, User } from 'lucide-react';

interface TopBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentView, setView }) => {
  const navItems = [
    { label: 'Dashboard', value: ViewState.DASHBOARD },
    { label: 'Optimization', value: ViewState.OPTIMIZATION },
    { label: 'Subsidies', value: ViewState.SUBSIDIES },
    { label: 'Settings', value: ViewState.SETTINGS },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
            <img src="/logo.png" alt="CostPilot Logo" className="h-16 w-auto" />

          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setView(item.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentView === item.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400 transform translate-x-1/4 -translate-y-1/4"></span>
            </button>
            <div
              className="h-8 w-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 cursor-pointer"
              onClick={() => setView(ViewState.SETTINGS)}
            >
              <User size={16} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TopBar;