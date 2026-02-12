import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OptimizationSuggestion } from "../types";

const apiKey = process.env.API_KEY || '';

// Mock data fallback if API key is missing or fails (for robustness in demo environment)
const MOCK_SUGGESTIONS: OptimizationSuggestion[] = [
  {
    id: 'opt-1',
    type: 'housing',
    title: 'Housing Trade-off',
    description: 'Relocating to Westwood Suburbs reduces rent burden significantly while maintaining access to work via express transit.',
    potentialSavings: 550,
    impact: 'high',
    details: {
      currentLocation: 'Downtown Core',
      targetLocation: 'Westwood Suburbs',
      currentRent: 2200,
      targetRent: 1650,
      transportIncrease: 150,
      commuteChangeMinutes: 25
    }
  },
  {
    id: 'opt-2',
    type: 'transport',
    title: 'Transport Optimization',
    description: 'Switching to public transit (My50 Pass) for daily commute reduces fuel and parking costs.',
    potentialSavings: 380,
    impact: 'high',
    details: {
      currentMethod: 'Private Vehicle',
      targetMethod: 'Public Transit',
      currentCost: 430,
      targetCost: 50,
      timeImpact: '+20 mins daily'
    }
  },
  {
    id: 'opt-3',
    type: 'subsidy',
    title: 'STR 2024 Relief',
    description: 'Based on household size (4) and income bracket.',
    potentialSavings: 0, // Subsidy might not be direct monthly savings but a grant
    impact: 'medium',
    details: {
      eligibility: 'Eligible',
      probability: 95,
      programName: 'Sumbangan Tunai Rahmah (STR)'
    }
  }
];

export const analyzeProfile = async (profile: UserProfile): Promise<OptimizationSuggestion[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, using mock data.");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_SUGGESTIONS), 1500));
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this household financial profile for cost-of-living optimization in Malaysia (Currency: RM).
        Profile: ${JSON.stringify(profile)}
        
        Provide 3 distinct optimization strategies:
        1. Housing (Relocation trade-offs within Malaysia context)
        2. Transport (Commute changes, e.g., using MRT/LRT vs Car)
        3. Subsidy (Government program matching like STR, e-Tunai, etc.)

        Return a JSON array matching this schema:
        Array<{
          id: string,
          type: 'housing' | 'transport' | 'subsidy',
          title: string,
          description: string,
          potentialSavings: number,
          impact: 'high' | 'medium' | 'low',
          details: object (flexible fields specific to the type)
        }>
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['housing', 'transport', 'subsidy'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              potentialSavings: { type: Type.NUMBER },
              impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
              details: { 
                type: Type.OBJECT,
                properties: {
                  currentLocation: { type: Type.STRING },
                  targetLocation: { type: Type.STRING },
                  currentRent: { type: Type.NUMBER },
                  targetRent: { type: Type.NUMBER },
                  transportIncrease: { type: Type.NUMBER },
                  commuteChangeMinutes: { type: Type.NUMBER },
                  currentMethod: { type: Type.STRING },
                  targetMethod: { type: Type.STRING },
                  currentCost: { type: Type.NUMBER },
                  targetCost: { type: Type.NUMBER },
                  timeImpact: { type: Type.STRING },
                  eligibility: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  programName: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return MOCK_SUGGESTIONS;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return MOCK_SUGGESTIONS;
  }
};