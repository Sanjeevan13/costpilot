import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, OptimizationSuggestion } from '../types';
import { analyzeProfile } from '../services/geminiService';
import {
  ArrowRight,
  Car,
  Home,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Bus,
  RefreshCw
} from 'lucide-react';

interface OptimizationViewProps {
  userProfile: UserProfile;
}

const OptimizationView: React.FC<OptimizationViewProps> = ({ userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const results = await analyzeProfile(userProfile);
      setSuggestions(results);
      const total = results.reduce((acc, curr) => acc + (curr.potentialSavings || 0), 0);
      setTotalSavings(total);
    } catch (e) {
      console.error("Failed to load suggestions", e);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500 font-medium">Analyzing cost pressure & opportunities...</p>
        </div>
      </div>
    );
  }

  const housingOpt = suggestions.find(s => s.type === 'housing');
  const transportOpt = suggestions.find(s => s.type === 'transport');
  const subsidyOpt = suggestions.find(s => s.type === 'subsidy');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CostPilot Optimization</h1>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
            <Zap size={14} className="fill-blue-700" />
            <span>AI Insight: You could save <span className="underline decoration-2 underline-offset-2">RM {totalSavings}/mo</span> by acting on 3 high-impact trade-offs.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">Analysis Period:</span>
          <select className="bg-white border border-slate-200 rounded-md text-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none">
            <option>Current Month</option>
            <option>Last Quarter</option>
          </select>
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            onClick={runSimulation}
          >
            <RefreshCw size={14} />
            Run Simulation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Housing Card */}
          {housingOpt && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Home size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{housingOpt.title}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-0.5">High Impact • Relocation Analysis</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-100">
                  Save RM {housingOpt.potentialSavings}/mo
                </span>
              </div>

              <div className="p-5 grid md:grid-cols-2 gap-6 relative">
                {/* Current Situation */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Situation</span>
                  <div className="relative group">
                    <img src="https://picsum.photos/seed/apartment1/400/200" alt="Current Home" className="w-full h-32 object-cover rounded-lg brightness-90" />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {housingOpt.details?.currentLocation || 'Downtown'}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Rent</span>
                      <span className="font-medium text-slate-900">RM {housingOpt.details?.currentRent}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Utilities</span>
                      <span className="font-medium text-slate-900">RM 350</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Commute Time</span>
                      <span className="font-medium text-emerald-600">15 mins</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector (Desktop) */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md border border-slate-100 z-10">
                  <ArrowRight size={16} className="text-slate-400" />
                </div>

                {/* Opportunity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Opportunity</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">8km Away</span>
                  </div>
                  <div className="relative">
                    <img src="https://picsum.photos/seed/suburb/400/200" alt="Target Home" className="w-full h-32 object-cover rounded-lg" />
                    <div className="absolute bottom-2 left-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {housingOpt.details?.targetLocation || 'Suburbs'}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Rent</span>
                      <span className="font-medium text-emerald-600">RM {housingOpt.details?.targetRent} <span className="text-xs text-emerald-500 font-normal">(-RM{(housingOpt.details?.currentRent || 0) - (housingOpt.details?.targetRent || 0)})</span></span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-600">Transport Adj.</span>
                      <span className="font-medium text-red-500">+RM {housingOpt.details?.transportIncrease} <span className="text-xs text-red-400 font-normal">(Fuel)</span></span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Commute Time</span>
                      <span className="font-medium text-orange-600">{housingOpt.details?.commuteChangeMinutes} mins <span className="text-xs text-orange-400 font-normal">(+25m)</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                <button className="text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">Ignore</button>
                <div className="flex gap-3">
                  <button className="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    See Listings
                  </button>
                  <button className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200">
                    Simulate Move
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">

            {/* Transport Card */}
            {transportOpt && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <Bus size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{transportOpt.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">Route Analysis</p>
                    </div>
                  </div>
                </div>
                <div className="p-0 flex-grow relative">
                  {/* Fake Map */}
                  <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Map_of_New_York_City_Subway.svg/2560px-Map_of_New_York_City_Subway.svg.png')] bg-cover bg-center grayscale"></div>
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow text-slate-700">
                      Route: Home → CBD
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Car size={16} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{transportOpt.details?.currentMethod}</span>
                          <span className="text-[10px] text-slate-500">Fuel + Parking</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">RM {transportOpt.details?.currentCost}<span className="text-xs font-normal text-slate-400">/mo</span></span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 ring-1 ring-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <Bus size={16} className="text-emerald-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-emerald-800">{transportOpt.details?.targetMethod}</span>
                          <span className="text-[10px] text-emerald-600">Monthly Pass</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 block">RM {transportOpt.details?.targetCost}<span className="text-xs font-normal text-emerald-500">/mo</span></span>
                        <span className="text-[10px] text-emerald-600 font-medium">Save RM {transportOpt.potentialSavings}/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertTriangle size={12} />
                      <span>Trade-off: {transportOpt.details?.timeImpact} travel time</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 mt-auto">
                  <button className="w-full py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">Compare Detailed Routes</button>
                </div>
              </div>
            )}

            {/* Subsidy Card */}
            {subsidyOpt && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      {/* Fixed undefined split error */}
                      <h3 className="font-semibold text-slate-900">{(subsidyOpt.title || 'Subsidy').split(' ')[0]} Matcher</h3>
                      <p className="text-xs text-slate-500 font-medium">Government Programs</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-grow space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm">{subsidyOpt.details?.programName}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Eligible</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{subsidyOpt.description}</p>

                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Probability</span>
                        <span>{subsidyOpt.details?.probability}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${subsidyOpt.details?.probability}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm">e-Tunai Belia</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Ineligible</span>
                    </div>
                    <p className="text-xs text-slate-500">Age threshold exceeded.</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-slate-300 rounded-full" style={{ width: `0%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 mt-auto">
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
                    Auto-fill Applications
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Summary Card */}
          <div className="bg-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200">
            <h3 className="text-teal-100 text-sm font-medium mb-1">Total Potential Savings</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">RM {totalSavings}</span>
              <span className="text-teal-200 text-sm">/ month</span>
            </div>

            <div className="space-y-3 mb-6">
              {housingOpt && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span className="text-teal-50">Housing</span>
                  </div>
                  <span className="font-medium">RM {housingOpt.potentialSavings}</span>
                </div>
              )}
              {transportOpt && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-300"></div>
                    <span className="text-teal-50">Transport</span>
                  </div>
                  <span className="font-medium">RM {transportOpt.potentialSavings}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-300"></div>
                  <span className="text-teal-50">Initial Costs</span>
                </div>
                <span className="font-medium">-RM 300</span>
              </div>
            </div>

            <button className="w-full bg-white text-teal-700 font-bold py-3 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
              <Zap size={18} className="fill-teal-700" />
              Apply All Changes
            </button>
          </div>

          {/* Inflation Impact */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Inflation Impact</h3>
              <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">+3.8% YoY</span>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 rounded text-slate-600">
                      <Home size={12} />
                    </div>
                    <span className="font-medium text-slate-700">Groceries</span>
                  </div>
                  <span className="text-red-500 font-medium text-xs">+RM 85</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 rounded text-slate-600">
                      <Zap size={12} />
                    </div>
                    <span className="font-medium text-slate-700">Energy</span>
                  </div>
                  <span className="text-red-500 font-medium text-xs">+RM 32</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 text-blue-600 text-xs font-medium hover:underline text-center">
              View Full Stress Analysis
            </button>
          </div>

          {/* Did you know card */}
          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <TrendingUp size={20} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-1">Did you know?</h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Moving just 3km further from a transit hub (LRT/MRT) reduces average rent by 12% in Klang Valley.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OptimizationView;