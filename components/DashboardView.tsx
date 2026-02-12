import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { api, StressResult, MonthlyInputs } from '../services/api';
import { TrendingDown, TrendingUp, AlertCircle, DollarSign, RefreshCw } from 'lucide-react';

const DashboardView: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [stressData, setStressData] = useState<StressResult | null>(null);
  const [signals, setSignals] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const inputs: MonthlyInputs = {
          incomeMonthly: userProfile.income,
          rentMonthly: userProfile.rent,
          utilitiesMonthly: userProfile.utilities || 0,
          transportMonthly: userProfile.transportCost || 0,
          foodMonthly: userProfile.food || 0,
          debtMonthly: userProfile.debt || 0,
          subscriptionsMonthly: userProfile.subscriptions || 0,
          savingsBalance: userProfile.savings || 0
        };

        const result = await api.getSummary(inputs);
        setStressData(result.stress);
        setSignals(result.signals);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-slate-400" />
      </div>
    );
  }

  const rentBurden = Math.round((userProfile.rent / userProfile.income) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userProfile.name}</h1>
        <p className="text-slate-500">Here is your financial stability outlook.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rent Burden Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${rentBurden > 30 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <TrendingUp size={20} />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${rentBurden > 30 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
              {rentBurden > 30 ? 'High Burden' : 'Healthy'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Rent Burden</p>
          <h3 className="text-2xl font-bold text-slate-900">{rentBurden}% <span className="text-sm font-normal text-slate-400">of income</span></h3>
        </div>

        {/* Available Subsidies - Keep static or mock for now as backend doesn't provide list yet */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">Available Subsidies</p>
          <h3 className="text-2xl font-bold text-slate-900">2 <span className="text-sm font-normal text-slate-400">programs</span></h3>
        </div>

        {/* Inflation Impact - Keep static logic or use signals if available */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Buying Power (YoY)</p>
          <h3 className="text-2xl font-bold text-slate-900">-3.8% <span className="text-sm font-normal text-slate-400">inflation adj.</span></h3>
        </div>

        {/* Savings Runway - FROM BACKEND */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${stressData?.riskLevel === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
              <AlertCircle size={20} />
            </div>
            {stressData && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stressData.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-500' :
                  stressData.riskLevel === 'Moderate' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-500'
                }`}>
                {stressData.riskLevel} Risk
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-1">Savings Runway</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {stressData?.bufferMonths.toFixed(1) || '-'} <span className="text-sm font-normal text-slate-400">months</span>
          </h3>
        </div>
      </div>

      <div className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">
            {stressData?.stressScore !== undefined
              ? `Stress Score: ${stressData.stressScore}/100 - ${stressData.riskLevel}`
              : 'Your personalized optimization plan is ready.'}
          </h2>
          <p className="text-blue-200 mb-6 leading-relaxed">
            {stressData?.pressureSources?.length
              ? `Main pressure sources: ${stressData.pressureSources.join(', ')}. Our AI has analyzed your rent and costs.`
              : "Our AI has analyzed your rent against local market trends and transport costs. We've found key moves that could save you money."}
          </p>
          <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
            View Optimization Plan
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default DashboardView;