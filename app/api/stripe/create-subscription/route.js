import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLANS = {
  starter: 9900,
  growth: 19900,
  elite: 49900,
};

// ===============================
// SIMPLE RATE GUARD (DB-BASED IDEMPOTENCY)
// ===============================
async function createCheckoutLock(email, plan) {
  const key = `${email}-${plan}`;

  const { error } = await supabase.from("checkout_locks").insert({
    id: key,
    created_at: new Date().toISOString(),
  });

  return !error;
}

// ===============================
// ROUTE
// ===============================
export async function POST(req) {
  try {
    const { plan, email } = await req.json();

    // ===============================
    // VALIDATION HARDENING
    // ===============================
    if (!plan || !email) {
      return Response.json(
        { error: "Missing plan or email" },
        { status: 400 }
      );
    }

    const amount = PLANS[plan];

    if (!amount) {
      return Response.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // ===============================
    // IDEMPOTENCY / ANTI-SPAM LAYER
    // ===============================
    const allowed = await createCheckoutLock(email, plan);

    if (!allowed) {
      return Response.json(
        { error: "Duplicate checkout attempt blocked" },
        { status: 429 }
      );
    }

    // ===============================
    // CREATE CHECKOUT SESSION
    // ===============================
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `RoofFlow ${plan}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/success?plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,

      // ===============================
      // CRITICAL: webhook correlation
      // ===============================
      metadata: {
        plan,
        email,
        source: "roofflow_checkout",
      },
    });

    // ===============================
    // AUDIT LOG
    // ===============================
    await supabase.from("events").insert({
      type: "checkout.created",
      email,
      plan,
      stripe_session_id: session.id,
    });

    return Response.json({
      url: session.url,
    });

  } catch (err) {
    console.error("Stripe checkout error:", err);

    return Response.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}