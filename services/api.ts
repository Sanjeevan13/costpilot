import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface MonthlyInputs {
    incomeMonthly: number;
    rentMonthly: number;
    utilitiesMonthly: number;
    transportMonthly: number;
    foodMonthly: number;
    debtMonthly: number;
    subscriptionsMonthly: number;
    savingsBalance: number;
}

export interface StressResult {
    stressScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    expenseRatio: number;
    bufferMonths: number;
    debtRatio: number;
    pressureSources: string[];
}

export interface ScenarioResult {
    base: StressResult;
    after: StressResult;
    delta: {
        stressScore: number;
        monthlyBalance: number;
        survivalMonths: number;
    };
}

export interface ExplainRequest {
    type: 'stress' | 'scenario' | 'optimize';
    facts: any;
}

export interface ExplainResponse {
    headline: string;
    reason: string;
    tradeoff: string;
    confidence: number;
    // New fields for extended recommendation (V2 Design)
    context?: string;
    highlight_box?: {
        title: string;
        tags: string[];
        description: string;
    };
    outcome_headline?: string;
    outcome_bullets?: string[];

    // Legacy/Other
    impact?: string;
    ask_next?: string;
    outcome?: string; // Older string version
    top_drivers?: any[];
    next_moves?: any[];
    eligible?: any[];
    not_eligible?: any[];
    missing_fields?: string[];
}

export interface OptimizationRecommendation {
    type: 'housing' | 'transport' | 'lifestyle' | 'debt';
    title: string;
    changes: Partial<MonthlyInputs>;
    simulationResult: ScenarioResult;
    potentialSavings: number;
    reason: string;
}

export interface OptimizeResult {
    base: StressResult;
    recommendations: OptimizationRecommendation[];
    totalSavings: number;
}

export interface SubsidyMatch {
    programId: string;
    name: string;
    eligible: boolean;
    matchConfidence: number;
    benefitText?: string;
    reasons?: string[];
    missingFields?: string[];
    link?: string;
    locationContext?: {
        city: string;
        state: string;
        nearbyTransit?: any[];
    };
}

// Assuming UserProfile is defined elsewhere or will be added. For now, using 'any' as a placeholder if not provided.
export type UserProfile = any;

export const api = {
    // Removed getSummary

    async simulateScenario(base: MonthlyInputs, changes: Partial<MonthlyInputs>): Promise<ScenarioResult> {
        const res = await fetch(`${API_URL}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base, changes })
        });
        if (!res.ok) throw new Error("Failed to simulate scenario");
        return res.json();
    },

    // Updated to support new insight types
    async getExplanation(type: 'stress' | 'scenario' | 'optimize' | 'dashboard' | 'subsidy', facts: any): Promise<ExplainResponse> {
        // For dashboard/subsidy, we might not strictly need 'stress' compatible response,
        // but our ExplainResponse type is generic enough?
        // Let's check ExplainResponse definition. If it's strict, we might need a Union return type.
        // For now, assuming backend returns JSON that fits or we cast.
        const res = await fetch(`${API_URL}/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, facts })
        });
        if (!res.ok) throw new Error("Failed to get explanation");
        return res.json();
    },

    optimizeProfile: async (inputs: MonthlyInputs) => {
        const response = await axios.post<OptimizeResult>(`${API_URL}/optimize`, inputs);
        return response.data;
    },

    matchSubsidies: async (profile: any) => {
        const response = await axios.post<{ matches: SubsidyMatch[]; notEligible: SubsidyMatch[] }>(`${API_URL}/subsidies/match`, profile);
        return response.data;
    },

    getAnalysis: async (inputs: any) => {
        const response = await axios.post<AnalysisResult>(`${API_URL}/analysis`, inputs);
        return response.data;
    }
};

export interface AnalysisResult {
    financials: {
        stress: StressResult;
        signals: any;
        derived: {
            monthlyBalance: number;
            survivalMonths: number;
        };
    };
    subsidies: {
        matches: SubsidyMatch[];
        notEligible: SubsidyMatch[];
    };
    optimization: {
        base: { stress: StressResult; signals: any };
        recommendations: OptimizationRecommendation[];
        totalSavings: number;
    };
    locationContext?: {
        city: string;
        state: string;
        nearbyTransit?: any[];
    };
}
