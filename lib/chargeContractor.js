import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// AUTO CHARGE CONTRACTOR
// ===============================
export async function chargeContractor({
  contractorId,
  leadId,
  amount,
  description,
}) {
  try {
    // 1. Get contractor Stripe customer
    const { data: contractor } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", contractorId)
      .single();

    if (!contractor?.stripe_customer_id) {
      throw new Error("Missing Stripe customer");
    }

    // 2. Create PaymentIntent (AUTO CHARGE)
    const payment = await stripe.paymentIntents.create({
      amount: amount, // cents
      currency: "usd",
      customer: contractor.stripe_customer_id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        leadId,
        contractorId,
        description: description || "RoofFlow lead charge",
      },
    });

    // 3. Mark lead as paid
    await supabase
      .from("leads")
      .update({
        billed: true,
        payment_status: "paid",
        stripe_payment_intent: payment.id,
      })
      .eq("id", leadId);

    // 4. Log revenue
    await supabase.from("revenue_logs").insert({
      contractor_id: contractorId,
      lead_id: leadId,
      amount,
      stripe_payment_intent: payment.id,
    });

    return {
      success: true,
      paymentId: payment.id,
    };
  } catch (err) {
    console.error("Stripe charge failed:", err.message);

    // mark failed billing attempt
    await supabase
      .from("leads")
      .update({
        payment_status: "failed",
      })
      .eq("id", leadId);

    return {
      success: false,
      error: err.message,
    };
  }
}