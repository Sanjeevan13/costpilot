export function fallbackExplain(type, facts) {
  if (type === "scenario") {
    const ds = facts.deltaStressScore ?? 0;
    const dm = facts.deltaMonthlyBalance ?? 0;
    const sm = facts.survivalMonths ?? 999;

    return {
      headline: ds > 0 ? `Stress increases by ${ds}` : `Stress changes by ${ds}`,
      reason: `Monthly balance changes by RM${dm}.`,
      tradeoff: sm === 999 ? "Cashflow is non-negative in this scenario." : `Estimated survival: ${sm} months if income stops.`,
      confidence: 60
    };
  }

  if (type === "stress") {
    const score = facts.stressScore ?? 0;
    const sources = Array.isArray(facts.pressureSources) ? facts.pressureSources.join(" + ") : "key expenses";

    return {
      headline: `Stress score is ${score}`,
      reason: `Main pressure comes from ${sources}.`,
      tradeoff: "Reducing top pressure categories improves score fastest.",
      confidence: 60
    };
  }

  return {
    headline: "Recommendation summary",
    reason: "Based on your spending pattern and constraints.",
    tradeoff: "Higher savings usually requires reducing discretionary spending.",
    confidence: 55
  };
}
