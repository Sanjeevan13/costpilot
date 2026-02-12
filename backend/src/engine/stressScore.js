import { RISK_BANDS, WEIGHTS } from "./constants.js";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreExpenseRatio(r) {
  if (r <= 0.5) return 10;
  if (r <= 0.7) return 30;
  if (r <= 0.85) return 60;
  if (r <= 1.0) return 85;
  return 100;
}

function scoreDebtRatio(r) {
  if (r <= 0.1) return 10;
  if (r <= 0.2) return 35;
  if (r <= 0.35) return 70;
  return 100;
}

function scoreBufferMonths(m) {
  if (m >= 6) return 10;
  if (m >= 3) return 35;
  if (m >= 1) return 70;
  return 100;
}

function riskLevelFromScore(score) {
  for (const b of RISK_BANDS) {
    if (score <= b.max) return b.level;
  }
  return "High";
}

function topPressureSources(inputs, totalExpenses) {
  if (totalExpenses <= 0) return [];
  const cats = [
    ["Rent", inputs.rentMonthly],
    ["Utilities", inputs.utilitiesMonthly],
    ["Transport", inputs.transportMonthly],
    ["Food", inputs.foodMonthly],
    ["Debt", inputs.debtMonthly],
    ["Subscriptions", inputs.subscriptionsMonthly]
  ];

  const shares = cats
    .map(([name, val]) => ({ name, share: val / totalExpenses }))
    .filter(x => x.share >= 0.05) // ignore <5%
    .sort((a, b) => b.share - a.share)
    .slice(0, 2)
    .map(x => x.name);

  return shares;
}

export function calculateStress(inputs) {
  const income = inputs.incomeMonthly ?? 0;

  const totalExpenses =
    (inputs.rentMonthly ?? 0) +
    (inputs.utilitiesMonthly ?? 0) +
    (inputs.transportMonthly ?? 0) +
    (inputs.foodMonthly ?? 0) +
    (inputs.debtMonthly ?? 0) +
    (inputs.subscriptionsMonthly ?? 0);

  const expenseRatio = income > 0 ? totalExpenses / income : 999;
  const debtRatio = income > 0 ? (inputs.debtMonthly ?? 0) / income : 999;
  const bufferMonths = totalExpenses > 0 ? (inputs.savingsBalance ?? 0) / totalExpenses : 12;

  const expenseSub = scoreExpenseRatio(expenseRatio);
  const debtSub = scoreDebtRatio(debtRatio);
  const bufferSub = scoreBufferMonths(bufferMonths);

  const raw =
    WEIGHTS.expense * expenseSub +
    WEIGHTS.buffer * bufferSub +
    WEIGHTS.debt * debtSub;

  const stressScore = Math.round(clamp(raw, 0, 100));
  const riskLevel = riskLevelFromScore(stressScore);

  return {
    stressScore,
    riskLevel,
    expenseRatio: Number(expenseRatio.toFixed(3)),
    bufferMonths: Number(bufferMonths.toFixed(2)),
    debtRatio: Number(debtRatio.toFixed(3)),
    pressureSources: topPressureSources(inputs, totalExpenses)
  };
}
