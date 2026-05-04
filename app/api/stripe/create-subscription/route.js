import Stripe from "stripe";

export const runtime = "nodejs";

// ===============================
// STRIPE INIT
// ===============================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// ===============================
// CREATE CHECKOUT SESSION
// Supports:
// - subscriptions (monthly SaaS)
// - one-time payments (city access / leads)
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      priceId,
      mode = "payment",
      email,
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

    if (!process.env.NEXT_PUBLIC_URL) {
      return Response.json(
        { success: false, error: "Missing NEXT_PUBLIC_URL" },
        { status: 500 }
      );
    }

    // ===============================
    // STRIPE SESSION
    // ===============================
    const session = await stripe.checkout.sessions.create({
      mode, // "payment" | "subscription"

      payment_method_types: ["card"],

      customer_email: email || undefined,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // ===============================
      // REDIRECTS
      // ===============================
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,

      // ===============================
      // SAAS + MARKETPLACE CONTEXT
      // ===============================
      metadata: {
        source: "roofflow",
        mode,
        email,
        ...metadata,
      },
    });

    return Response.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("🔥 Stripe checkout error:", err.message);

    return Response.json(
      {
        success: false,
        error: "Checkout session failed",
      },
      { status: 500 }
    );
  }
}