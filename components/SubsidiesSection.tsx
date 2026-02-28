import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, ClaimedSubsidy, ViewState } from '../types';
import { api } from '../services/api';
import {
    Receipt, CheckCircle2, AlertTriangle, ExternalLink, Loader2,
    ChevronDown, ChevronUp, DollarSign, Shield, GraduationCap,
    Home as HomeIcon, Car, Briefcase, HelpCircle, Sparkles, X, Check
} from 'lucide-react';

interface SubsidiesSectionProps {
    userProfile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    setView?: (view: ViewState) => void;
}

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    'Cash Aid': { icon: <DollarSign size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'Groceries': { icon: <DollarSign size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'Health': { icon: <Shield size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'Education': { icon: <GraduationCap size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    'Youth': { icon: <Sparkles size={18} />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    'Housing': { icon: <HomeIcon size={18} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    'Transport': { icon: <Car size={18} />, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    'Employment': { icon: <Briefcase size={18} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
};

const FIELD_LABELS: Record<string, string> = {
    state: 'Your State',
    age: 'Your Age',
    income: 'Monthly Income (RM)',
    householdSize: 'Household Size',
    employmentStatus: 'Employment Status',
};

const STATE_OPTIONS = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
    'W.P. Labuan', 'W.P. Putrajaya',
];

const SubsidiesSection: React.FC<SubsidiesSectionProps> = ({ userProfile, updateProfile, setView }) => {
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<any[]>([]);
    const [needsInfo, setNeedsInfo] = useState<any[]>([]);
    const [notEligible, setNotEligible] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [claiming, setClaiming] = useState<Record<string, boolean>>({});
    const [showNotEligible, setShowNotEligible] = useState(false);

    // Missing field prompts
    const [pendingUnlock, setPendingUnlock] = useState<any | null>(null);
    const [fieldInputs, setFieldInputs] = useState<Record<string, string>>({});

    const claimedIds = new Set((userProfile.claimedSubsidies || []).map(s => s.programId));

    const fetchSubsidies = useCallback(async (optimisticPatch?: Partial<UserProfile>) => {
        setLoading(true);
        setError(null);
        try {
            const currentProfile = { ...userProfile, ...optimisticPatch };
            const fullProfile = {
                incomeMonthly: Number(currentProfile.income) || 0,
                income: Number(currentProfile.income) || 0,
                age: Number(currentProfile.age) || 0,
                employmentStatus: currentProfile.employmentStatus || '',
                householdSize: Number(currentProfile.householdSize) || 1,
                state: currentProfile.state || '',
            };
            const result = await api.matchSubsidies(fullProfile);
            setMatches(result.matches || []);

            // Separate "needs info" from truly not eligible
            const needInfo = (result.notEligible || []).filter((s: any) => s.needsInfo);
            const notElig = (result.notEligible || []).filter((s: any) => !s.needsInfo);
            setNeedsInfo(needInfo);
            setNotEligible(notElig);
        } catch (err: any) {
            console.error('Subsidy fetch failed:', err);
            setError(err?.message || 'Failed to fetch subsidies. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [userProfile]);

    useEffect(() => {
        fetchSubsidies();
    }, [fetchSubsidies]);

    const handleClaim = async (sub: any) => {
        if (claimedIds.has(sub.programId)) return;
        setClaiming(prev => ({ ...prev, [sub.programId]: true }));
        try {
            const newClaimed: ClaimedSubsidy = {
                programId: sub.programId,
                name: sub.name,
                monthlyBenefit: sub.monthlyBenefit || 0,
                benefitText: sub.benefitText,
                claimedAt: Date.now(),
            };
            const existing = userProfile.claimedSubsidies || [];
            await updateProfile({
                claimedSubsidies: [...existing, newClaimed],
            });
        } catch (err) {
            console.error('Failed to claim subsidy:', err);
        } finally {
            setTimeout(() => setClaiming(prev => ({ ...prev, [sub.programId]: false })), 500);
        }
    };

    const handleUnclaim = async (programId: string) => {
        try {
            const existing = userProfile.claimedSubsidies || [];
            await updateProfile({
                claimedSubsidies: existing.filter(s => s.programId !== programId),
            });
        } catch (err) {
            console.error('Failed to unclaim subsidy:', err);
        }
    };

    const handleUnlockSubmit = async () => {
        if (!pendingUnlock) return;

        // Immediately show loading overlay to show the page is rescanning
        setLoading(true);
        setPendingUnlock(null);

        const patch: Partial<UserProfile> = {};
        const fields = pendingUnlock.missingFields || [];
        fields.forEach((f: string) => {
            const val = fieldInputs[f];
            if (!val) return;
            if (f === 'state') patch.state = val;
            if (f === 'age') patch.age = Number(val);
            if (f === 'income') patch.income = Number(val);
            if (f === 'householdSize') patch.householdSize = Number(val);
            if (f === 'employmentStatus') patch.employmentStatus = val as any;
        });

        // Wait for profile update to actually finish
        await updateProfile(patch);
        setFieldInputs({});

        // Now trigger the full rescan which naturally toggles setLoading(false)
        await fetchSubsidies(patch);
    };

    const catStyle = (category: string) => CATEGORY_STYLES[category] || CATEGORY_STYLES['Cash Aid'];

    const totalMonthlyBenefit = (userProfile.claimedSubsidies || []).reduce((sum, s) => sum + s.monthlyBenefit, 0);

    if (loading) {
        return (
            <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#a07cf6] mb-4" size={32} />
                <p className="text-slate-400 text-sm">Scanning for available subsidies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#170e2b] border border-slate-200 dark:border-[#a07cf6]/20 flex items-center justify-center">
                            <Receipt className="text-blue-500 dark:text-[#a07cf6]" size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subsidies & Bantuan</h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 ml-[52px]">Auto-matched to your profile — claim what you qualify for</p>
                </div>
                {totalMonthlyBenefit > 0 && (
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Claimed Benefits</p>
                        <p className="text-xl font-black text-emerald-400">+RM{totalMonthlyBenefit}/mo</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Missing Field Prompt Modal */}
            {pendingUnlock && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1238] rounded-3xl border border-slate-200 dark:border-[#a07cf6]/30 p-8 space-y-6 max-w-md w-full shadow-2xl relative">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <HelpCircle size={22} className="text-amber-500 dark:text-amber-400" />
                                Needs More Info
                            </h4>
                            <button onClick={() => setPendingUnlock(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 p-2 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            We need a few more details to check your eligibility for <span className="font-bold text-slate-700 dark:text-white/80">{pendingUnlock.name}</span>.
                        </p>
                        <div className="space-y-3">
                            {(pendingUnlock.missingFields || []).map((field: string) => (
                                <div key={field}>
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5 block">
                                        {FIELD_LABELS[field] || field}
                                    </label>
                                    {field === 'state' ? (
                                        <select
                                            className="w-full bg-slate-50 dark:bg-[#120b22] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-[#a07cf6]/50 transition-all"
                                            value={fieldInputs[field] || ''}
                                            onChange={e => setFieldInputs(prev => ({ ...prev, [field]: e.target.value }))}
                                        >
                                            <option value="">Select your state</option>
                                            {STATE_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    ) : field === 'employmentStatus' ? (
                                        <select
                                            className="w-full bg-slate-50 dark:bg-[#120b22] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-[#a07cf6]/50 transition-all"
                                            value={fieldInputs[field] || ''}
                                            onChange={e => setFieldInputs(prev => ({ ...prev, [field]: e.target.value }))}
                                        >
                                            <option value="">Select status</option>
                                            <option value="employed">Employed</option>
                                            <option value="self-employed">Self-Employed</option>
                                            <option value="student">Student</option>
                                            <option value="unemployed">Unemployed</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-[#120b22] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 dark:focus:border-[#a07cf6]/50 transition-all"
                                            value={fieldInputs[field] || ''}
                                            onChange={e => setFieldInputs(prev => ({ ...prev, [field]: e.target.value }))}
                                            placeholder={`Enter ${FIELD_LABELS[field] || field}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleUnlockSubmit}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b55cff] to-[#8c35ff] text-white text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <CheckCircle2 size={18} /> Update Profile & Re-scan
                        </button>
                    </div>
                </div>
            )}

            {/* === QUALIFIED SUBSIDIES === */}
            {matches.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Qualified ({matches.length})
                    </h4>
                    {matches.map((sub: any) => {
                        const isClaimed = claimedIds.has(sub.programId);
                        const style = catStyle(sub.category);
                        return (
                            <div key={sub.programId} className={`rounded-2xl border p-5 transition-all duration-300 ${isClaimed
                                ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                                : 'bg-white dark:bg-[#120b22] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}`}>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white">{sub.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{sub.benefitText}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${style.bg} ${style.border} border ${style.color} shrink-0`}>
                                        {sub.category}
                                    </span>
                                </div>

                                {sub.monthlyBenefit > 0 && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Monthly Benefit</span>
                                        <span className="text-lg font-black text-emerald-400">+RM{sub.monthlyBenefit}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    {sub.link && (
                                        <a
                                            href={sub.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 font-black text-xs tracking-widest uppercase bg-slate-50 dark:bg-[#1a1333] hover:bg-slate-100 dark:hover:bg-[#231a44] text-blue-600 dark:text-[#a07cf6] border border-blue-200 dark:border-[#a07cf6]/30 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={14} /> Apply Now
                                        </a>
                                    )}
                                    {isClaimed ? (
                                        <button
                                            onClick={() => handleUnclaim(sub.programId)}
                                            className="flex-1 font-black text-xs tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 py-3.5 rounded-xl transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25 flex items-center justify-center gap-2"
                                        >
                                            <Check size={14} /> Claimed ✓
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleClaim(sub)}
                                            disabled={claiming[sub.programId]}
                                            className="flex-1 font-black text-xs tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                                        >
                                            {claiming[sub.programId] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                            I'm in!
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* === NEEDS MORE INFO (unlockable) === */}
            {needsInfo.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                        <HelpCircle size={14} /> Needs More Info ({needsInfo.length})
                    </h4>
                    {needsInfo.map((sub: any) => {
                        const style = catStyle(sub.category);
                        return (
                            <div key={sub.programId} className="rounded-2xl border bg-white dark:bg-[#120b22] border-amber-200 dark:border-amber-500/15 p-5 hover:border-amber-300 dark:hover:border-amber-500/30 transition-all">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center ${style.color} opacity-50`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-700 dark:text-white/70">{sub.name}</h4>
                                            <p className="text-sm text-slate-500">{sub.benefitText}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                                        Locked
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle size={12} className="text-amber-400" />
                                    <span className="text-xs text-amber-400/80">
                                        Missing: {(sub.missingFields || []).map((f: string) => FIELD_LABELS[f] || f).join(', ')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setPendingUnlock(sub);
                                        setFieldInputs({});
                                    }}
                                    className="w-full font-bold text-xs tracking-widest uppercase border border-amber-500/25 bg-amber-500/5 text-amber-400 py-3 rounded-xl transition-all hover:bg-amber-500/15 flex items-center justify-center gap-2"
                                >
                                    <HelpCircle size={14} /> Unlock This Subsidy
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* === NOT ELIGIBLE === */}
            {notEligible.length > 0 && (
                <div className="space-y-3">
                    <button
                        onClick={() => setShowNotEligible(!showNotEligible)}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        {showNotEligible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        Not Eligible ({notEligible.length})
                    </button>
                    {showNotEligible && notEligible.map((sub: any) => {
                        const style = catStyle(sub.category);
                        return (
                            <div key={sub.programId} className="rounded-2xl border bg-white dark:bg-[#120b22] border-slate-200 dark:border-white/5 p-5 opacity-50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 dark:text-white/50">{sub.name}</h4>
                                            <p className="text-xs text-slate-500">{sub.benefitText}</p>
                                            {sub.reasons?.map((r: string, i: number) => (
                                                <p key={i} className="text-xs text-red-400/60 mt-1">• {r}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {matches.length === 0 && needsInfo.length === 0 && notEligible.length === 0 && !error && (
                <div className="py-16 text-center">
                    <Receipt className="mx-auto text-slate-500 mb-4" size={32} />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-white/50 mb-2">No Subsidies Found</h3>
                    <p className="text-sm text-slate-500">Update your profile in Settings for more accurate matching.</p>
                </div>
            )}
        </div>
    );
};

export default SubsidiesSection;
