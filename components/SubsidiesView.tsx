import React from 'react';
import { UserProfile } from '../types';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

const SubsidiesView: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const subsidies = [
    {
      name: "Sumbangan Tunai Rahmah (STR)",
      description: "Direct cash assistance for B40/M40 households based on income and number of children.",
      amount: "Up to RM 3,700/year",
      status: "Eligible",
      probability: 95,
      link: "#"
    },
    {
      name: "Program Subsidi Upah (PSU)",
      description: "Wage subsidy program for employers to retain local employees.",
      amount: "Employer Based",
      status: "Not Eligible",
      reason: "Requires business registration",
      probability: 10,
      link: "#"
    },
    {
      name: "e-Tunai Belia Rahmah",
      description: "One-off e-wallet credit for youth aged 18-20 or full-time students.",
      amount: "RM 200",
      status: "Not Eligible",
      reason: "Age criteria not met",
      probability: 5,
      link: "#"
    },
    {
      name: "My50 Unlimited Travel Pass",
      description: "Unlimited travel on Rapid KL rail and bus services for RM50/month.",
      amount: "RM 50/month",
      status: "Recommended",
      probability: 99,
      link: "#"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Government Relief & Subsidies</h1>
        <p className="text-slate-500 dark:text-slate-400">Matched programs based on your profile: Income RM {userProfile.income}, Household {userProfile.householdSize}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subsidies.map((subsidy, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{subsidy.name}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{subsidy.amount}</span>
              </div>
              {subsidy.status === 'Eligible' && <CheckCircle className="text-emerald-500 dark:text-emerald-400" size={20} />}
              {subsidy.status === 'Not Eligible' && <XCircle className="text-slate-300 dark:text-slate-600" size={20} />}
              {subsidy.status === 'Recommended' && <AlertCircle className="text-blue-500 dark:text-blue-400" size={20} />}
            </div>
            <div className="p-5 flex-grow">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{subsidy.description}</p>

              {subsidy.reason && (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="font-semibold">Note:</span> {subsidy.reason}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>Match Confidence</span>
                  <span>{subsidy.probability}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${subsidy.probability > 80 ? 'bg-emerald-500' :
                        subsidy.probability > 40 ? 'bg-orange-400' : 'bg-slate-300'
                      }`}
                    style={{ width: `${subsidy.probability}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 mt-auto">
              <button className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                Check Details <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubsidiesView;