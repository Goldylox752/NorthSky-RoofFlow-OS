import { lockLeadPrice as pricingEngine } from "@/lib/pricingEngine";

export function lockLeadPrice({ lead, contractor, cityRow, systemMetrics }) {
  const result = pricingEngine({
    lead,
    contractor,
    cityRow,
    systemMetrics,
  });

  return {
    final_price: result.finalPrice,
    price_locked_at: new Date().toISOString(),
    breakdown: result.breakdown,
  };
}