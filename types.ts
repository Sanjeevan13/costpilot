export interface UserProfile {
  name: string;
  photoUrl?: string;
  income: number;
  rent: number;
  location?: { lat: number; lng: number; label?: string } | string;
  occupation: string;
  age?: number;
  employmentStatus?: 'employed' | 'unemployed' | 'student' | 'self-employed';
  state?: string;
  householdSize: number;
  commuteMethod: 'car' | 'transit' | 'hybrid';
  commuteDistanceKm: number;
  // Financial specifics (monthly in RM)
  utilities: number;
  transportCost: number; // calculated or estimated
  food: number;
  debt: number;
  subscriptions: number;
  savings: number;
  // Track which optimization categories user has already accepted (e.g., ['housing', 'transport'])
  optimizedCategories?: string[];

}

export interface OptimizationSuggestion {
  id: string;
  type: 'housing' | 'transport' | 'subsidy' | 'career';
  title: string;
  description: string;
  potentialSavings: number;
  impact: 'high' | 'medium' | 'low';
  details?: any; // Flexible for different card types
}

export interface SimulationResult {
  currentSavings: number;
  optimizedSavings: number;
  sixMonthSurvivalProbability: number;
  twoYearSustainabilityScore: number;
  riskFactors: string[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  OPTIMIZATION = 'OPTIMIZATION',

  SETTINGS = 'SETTINGS',
}
