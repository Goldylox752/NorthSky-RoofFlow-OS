import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// LEAD ROUTING ENGINE
// ===============================
export async function routeLead(lead) {
  const city = lead.city?.toLowerCase();

  if (!city) return null;

  // ===============================
  // FIND CITY OWNERSHIP
  // ===============================
  const { data: cityRow } = await supabase
    .from("cities")
    .select("*")
    .eq("city", city)
    .single();

  if (!cityRow || !cityRow.active_contractors?.length) {
    console.log("No contractor assigned for city");
    return null;
  }

  const contractorId = cityRow.active_contractors[0]; // exclusive model

  // ===============================
  // PRICING ENGINE
  // ===============================
  const basePrice = 1500; // cents ($15 default)
  const multiplier = cityRow.lead_multiplier || 1;

  const finalPrice = Math.floor(basePrice * multiplier);

  // ===============================
  // UPDATE LEAD
  // ===============================
  const { error: leadError } = await supabase
    .from("leads")
    .update({
      assigned_contractor_id: contractorId,
      price_paid: finalPrice,
      billed: true,
    })
    .eq("id", lead.id);

  if (leadError) {
    console.error("Lead update error:", leadError.message);
  }

  // ===============================
  // LOG REVENUE
  // ===============================
  await supabase.from("contractor_revenue").insert({
    contractor_id: contractorId,
    lead_id: lead.id,
    amount: finalPrice,
    city,
  });

  return {
    contractorId,
    price: finalPrice,
  };
}