import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ===============================
// INIT
// ===============================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// MAIN ENTRY: ROUTE + BILL LEAD
// ===============================
export async function processLead(lead) {
  try {
    if (!lead?.city) throw new Error("Missing lead city");

    const city = lead.city.toLowerCase();

    // ===============================
    // 1. GET CITY MARKET RULES
    // ===============================
    const { data: cityData } = await supabase
      .from("cities")
      .select("*")
      .eq("city", city)
      .single();

    if (!cityData) {
      throw new Error("City not found in marketplace");
    }

    // ===============================
    // 2. FIND CONTRACTOR
    // ===============================
    const contractorId =
      cityData.active_contractors?.[0] || null;

    if (!contractorId) {
      throw new Error("No contractor assigned to city");
    }

    // ===============================
    // 3. PRICE ENGINE ($15–$50)
    // ===============================
    const base = 1500; // $15 in cents

    let multiplier = 1;

    if (cityData.tier === "priority") multiplier = 1.5;
    if (cityData.tier === "exclusive") multiplier = 3;

    const finalPrice = Math.round(base * multiplier);

    // ===============================
    // 4. STRIPE CHARGE (AUTO BILLING)
    // ===============================
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalPrice,
      currency: "usd",
      customer: cityData.stripe_customer_id || undefined,

      confirm: true,
      off_session: true,

      metadata: {
        leadId: lead.id,
        city,
        contractorId,
        tier: cityData.tier,
        source: "lead_brain_engine",
      },
    });

    // ===============================
    // 5. UPDATE LEAD
    // ===============================
    const { error: leadError } = await supabase
      .from("leads")
      .update({
        assigned_contractor_id: contractorId,
        price_paid: finalPrice,
        billed: true,
        status: "routed",
        stripe_payment_intent: paymentIntent.id,
      })
      .eq("id", lead.id);

    if (leadError) {
      console.error("Lead update error:", leadError.message);
    }

    // ===============================
    // 6. REVENUE LOGGING
    // ===============================
    await supabase.from("revenue_log").insert({
      lead_id: lead.id,
      contractor_id: contractorId,
      city,
      amount: finalPrice,
      stripe_payment_intent: paymentIntent.id,
    });

    // ===============================
    // 7. RETURN RESULT
    // ===============================
    return {
      success: true,
      contractorId,
      city,
      price: finalPrice,
      paymentStatus: paymentIntent.status,
    };
  } catch (err) {
    console.error("Lead Brain Error:", err.message);

    return {
      success: false,
      error: err.message,
    };
  }
}