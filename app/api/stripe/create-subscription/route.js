import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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
// CITY LOCK CHECK (PREVENT DUPLICATES)
// ===============================
async function isCityAvailable(city, planTier) {
  const { data } = await supabase
    .from("cities")
    .select("*")
    .eq("city", city)
    .single();

  if (!data) return true;

  // 🏙 exclusivity rules
  if (planTier === "exclusive" && data.active_contractors?.length >= 1) {
    return false;
  }

  if (planTier === "priority" && data.active_contractors?.length >= 3) {
    return false;
  }

  return true;
}

// ===============================
// CREATE CHECKOUT SESSION
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      priceId,
      mode = "payment",
      email,
      city,
      contractorId,
      planTier = "basic",
      metadata = {},
    } = body;

    // ===============================
    // VALIDATION
    // ===============================
    if (!priceId) {
      return Response.json(
        { success: false, error: "Missing priceId" },
        { status: 400 }
      );
    }

    if (!city) {
      return Response.json(
        { success: false, error: "Missing city" },
        { status: 400 }
      );
    }

    // ===============================
    // CITY AVAILABILITY CHECK
    // ===============================
    const available = await isCityAvailable(city, planTier);

    if (!available) {
      return Response.json(
        {
          success: false,
          error: "City tier already sold or full",
        },
        { status: 409 }
      );
    }

    // ===============================
    // RESERVE CITY (TEMP LOCK BEFORE PAYMENT)
    // ===============================
    await supabase.from("city_intents").insert({
      city,
      planTier,
      contractorId,
      status: "pending_payment",
      created_at: new Date().toISOString(),
    });

    // ===============================
    // STRIPE SESSION
    // ===============================
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      customer_email: email || undefined,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,

      // ===============================
      // MARKETPLACE CONTEXT (SOURCE OF TRUTH TAGGING)
      // ===============================
      metadata: {
        system: "roofflow_marketplace",
        city,
        planTier,
        contractorId: contractorId || null,
        mode,
        intent: "city_purchase",
        ...metadata,
      },
    });

    return Response.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });

  } catch (err) {
    console.error("🔥 Stripe checkout error:", err);

    return Response.json(
      {
        success: false,
        error: "Checkout session failed",
      },
      { status: 500 }
    );
  }
}