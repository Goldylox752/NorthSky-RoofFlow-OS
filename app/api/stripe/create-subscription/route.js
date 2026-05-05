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
// 🧼 EMAIL NORMALIZATION (CRITICAL FIX)
// ===============================
function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

// ===============================
// 🔐 DISTRIBUTED IDEMPOTENCY KEY
// ===============================
function buildLockId(email, plan) {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return `checkout:${email}:${plan}:${day}`;
}

// ===============================
// 🧠 ATOMIC LOCK (WITH TTL SAFETY)
// ===============================
async function acquireLock(lockId, email) {
  const { error } = await supabase.from("checkout_locks").insert({
    id: lockId,
    email,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  });

  return !error;
}

// ===============================
// 🧹 LOCK RECOVERY (PREVENTS DEADLOCKS)
// ===============================
async function recoverStaleLocks() {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);

  await supabase
    .from("checkout_locks")
    .delete()
    .lt("created_at", cutoff.toISOString());
}

// ===============================
// 🛡️ SLIDING WINDOW ABUSE CHECK
// ===============================
async function abuseCheck(email) {
  const { data } = await supabase
    .from("checkout_locks")
    .select("id")
    .eq("email", email)
    .gte(
      "created_at",
      new Date(Date.now() - 1000 * 60 * 5).toISOString()
    );

  const attempts = data?.length || 0;

  // soft throttle
  if (attempts >= 3) return { allowed: false, type: "soft_block" };

  // hard block
  if (attempts >= 8) return { allowed: false, type: "hard_block" };

  return { allowed: true };
}

// ===============================
// ROUTE
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    let { plan, email } = body;

    // ===============================
    // NORMALIZE INPUT
    // ===============================
    email = normalizeEmail(email);

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
    // 🔁 CLEANUP (NON-BLOCKING)
    // ===============================
    recoverStaleLocks().catch(() => {});

    // ===============================
    // 🛡️ ABUSE CHECK FIRST (CHEAPEST LAYER)
    // ===============================
    const abuse = await abuseCheck(email);

    if (!abuse.allowed) {
      return Response.json(
        {
          error:
            abuse.type === "hard_block"
              ? "Account temporarily blocked"
              : "Too many attempts. Slow down.",
        },
        { status: 429 }
      );
    }

    // ===============================
    // 🔐 IDEMPOTENCY LOCK (SECOND LAYER)
    // ===============================
    const lockId = buildLockId(email, plan);

    const locked = await acquireLock(lockId, email);

    if (!locked) {
      return Response.json(
        { error: "Duplicate checkout blocked" },
        { status: 409 }
      );
    }

    // ===============================
    // 💳 STRIPE SESSION
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

      metadata: {
        plan,
        email,
        lock_id: lockId,
        source: "roofflow_checkout_v4",
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
      lock_id: lockId,
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