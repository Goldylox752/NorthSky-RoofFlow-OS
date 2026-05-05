import { calculateFinalPrice } from "@/lib/pricingEngine";
import { calculateLeadValue } from "@/lib/pricingEngine";
import { getDemandMultiplier } from "@/lib/demandEngine";
import { getCityScarcityFactor } from "@/lib/cityPricing";
import crypto from "crypto";

// ===============================
// 🧠 STABLE HASH (AUDIT TRACE)
// ===============================
function hashInput(input) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex")
    .slice(0, 12);
}

// ===============================
// 🔐 MAIN PRICE LOCK ENGINE
// ===============================
export function lockLeadPrice({
  lead,
  contractor,
  cityRow,
  systemMetrics,
}) {
  // ===============================
  // 1. BASE VALUE (DETERMINISTIC)
  // ===============================
  const baseLeadValue = calculateLeadValue(
    lead.score,
    contractor.city_tier || "basic"
  );

  // ===============================
  // 2. MARKET FACTORS (CONTROLLED INPUTS)
  // ===============================
  const demandMultiplier = getDemandMultiplier(systemMetrics);

  const cityScarcity = getCityScarcityFactor(cityRow);

  // ===============================
  // 3. FINAL PRICE (CORE ENGINE)
  // ===============================
  let finalPrice = calculateFinalPrice({
    baseLeadValue,
    demandMultiplier,
    contractorTier: contractor.plan,
    cityScarcity,
  });

  // ===============================
  // 4. SAFETY LAYER (CRITICAL FIX)
  // ===============================
  const MIN_PRICE = 50;
  const MAX_PRICE = 5000;

  finalPrice = Math.max(MIN_PRICE, Math.min(finalPrice, MAX_PRICE));

  // ===============================
  // 5. NORMALIZATION (STRIPE SAFE)
  // ===============================
  finalPrice = Math.round(finalPrice);

  // ===============================
  // 6. AUDIT BREAKDOWN (IMMUTABLE TRACE)
  // ===============================
  const breakdown = {
    baseLeadValue,
    demandMultiplier,
    cityScarcity,
    contractorTier: contractor.plan,
  };

  // ===============================
  // 7. PRICE FINGERPRINT (DEBUG + FRAUD DETECTION)
  // ===============================
  const priceHash = hashInput({
    leadId: lead.id,
    breakdown,
    finalPrice,
  });

  // ===============================
  // RETURN LOCKED RESULT
  // ===============================
  return {
    finalPrice,
    breakdown,
    priceHash,
    lockedAt: new Date().toISOString(),
  };
}