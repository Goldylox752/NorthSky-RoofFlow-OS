import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const PRICE_MAP = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
  domination: process.env.STRIPE_PRICE_DOMINATION,
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, plan, leadScore = 0 } = body;

    // Basic validation
    if (!email || !phone || !plan) {
      return Response.json(
        { error: "email, phone, and plan are required" },
        { status: 400 }
      );
    }

    const priceId = PRICE_MAP[plan];

    if (!priceId) {
      return Response.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      customer_email: email,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        phone,
        plan,
        leadScore: String(leadScore),
      },

      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/apply`,
    });

    return Response.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);

    return Response.json(
      {
        error: "Checkout session creation failed",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
