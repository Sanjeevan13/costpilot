import axios from 'axios';

const API_URL = 'http://localhost:3001';

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
}

export const api = {
    getSummary: async (inputs: MonthlyInputs) => {
        const response = await axios.post<{ stress: StressResult; signals: any }>(`${API_URL}/summary`, inputs);
        return response.data;
    },

    simulateScenario: async (base: MonthlyInputs, changes: Partial<MonthlyInputs>) => {
        const response = await axios.post<ScenarioResult>(`${API_URL}/simulate`, { base, changes });
        return response.data;
    },

    getExplanation: async (type: 'stress' | 'scenario' | 'optimize', facts: any) => {
        const response = await axios.post<ExplainResponse>(`${API_URL}/explain`, { type, facts });
        return response.data;
    },
};
