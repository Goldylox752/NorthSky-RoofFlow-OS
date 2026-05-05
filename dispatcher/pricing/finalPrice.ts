import { calculateFinalPrice } from "@/lib/pricingEngine";

const PRICING_VERSION = "v1.0";

const LEAD_BASE_BY_SCORE = {
  high: 5000, // 8–10
  mid: 3000,  // 6–7
  low: 1500,  // 1–5
};

function getBaseLeadValue(score: number) {
  if (score >= 8) return LEAD_BASE_BY_SCORE.high;
  if (score >= 6) return LEAD_BASE_BY_SCORE.mid;
  return LEAD_BASE_BY_SCORE.low;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

// smoother curve instead of hard thresholds
function calculateScarcityFactor(active = 0, capacity = 1) {
  const ratio = active / capacity;

  if (ratio >= 1.2) return 2.5;
  if (ratio >= 1.0) return 2.0;
  if (ratio >= 0.75) return 1.5;
  if (ratio >= 0.5) return 1.2;
  return 1;
}

// ===============================
// 🔐 CORE PRICE LOCK ENGINE (HARDENED)
// ===============================
export function lockLeadPrice({
  lead,
  contractor,
  cityRow,
  systemMetrics,
}) {
  const score = clamp(Number(lead?.score ?? 0), 1, 10);

  // 1. BASE VALUE (deterministic)
  const baseLeadValue = getBaseLeadValue(score);

  // 2. DEMAND MULTIPLIER (sandboxed + clamped)
  const demandMultiplier = clamp(
    Number(systemMetrics?.demandMultiplier ?? 1),
    0.5,
    3
  );

  // 3. CONTRACTOR TIER MULTIPLIER
  const contractorTierMultiplier =
    contractor?.plan === "elite"
      ? 2.2
      : contractor?.plan === "growth"
      ? 1.5
      : 1;

  // 4. CITY SCARCITY (smoothed model)
  const cityScarcityFactor = calculateScarcityFactor(
    cityRow?.active_contractors,
    cityRow?.capacity
  );

  // ===============================
  // 💰 FINAL PRICE
  // ===============================
  const rawPrice = calculateFinalPrice({
    baseLeadValue,
    demandMultiplier,
    contractorTierMultiplier,
    cityScarcityFactor,
  });

  const finalPrice = Math.round(
    clamp(rawPrice, 500, 25000)
  );

  // ===============================
  // 🔍 AUDIT HASH (IMPORTANT FOR TRUST + DEBUGGING)
  // ===============================
  const auditHash = [
    lead?.id,
    score,
    baseLeadValue,
    demandMultiplier,
    contractorTierMultiplier,
    cityScarcityFactor,
    PRICING_VERSION,
  ].join("|");

  return {
    finalPrice,
    lockedAt: new Date().toISOString(),

    pricingVersion: PRICING_VERSION,

    auditHash,

    breakdown: {
      score,
      baseLeadValue,
      demandMultiplier,
      contractorTierMultiplier,
      cityScarcityFactor,
      rawPrice,
    },
  };
}