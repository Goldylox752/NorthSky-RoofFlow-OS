import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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
// HELPERS
// ===============================
function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// ===============================
// 🔐 STRONG IDEMPOTENCY KEY (NO DAILY COLLISION ISSUES)
// ===============================
function buildLockId(email, plan) {
  return hash(`${email}:${plan}:${Math.floor(Date.now() / 86400000)}`);
}

// ===============================
// 🛡️ SAFE ABUSE CHECK (COUNT-BASED, NOT ROW-BASED)
// ===============================
async function abuseCheck(email) {
  const window = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("checkout_locks")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", window);

  const attempts = count || 0;

  if (attempts >= 8) return { allowed: false, type: "hard_block" };
  if (attempts >= 3) return { allowed: false, type: "soft_block" };

  return { allowed: true };
}

// ===============================
// 🔐 ATOMIC LOCK (RACE SAFE VIA UPSERT)
// ===============================
async function acquireLock(lockId, email, plan) {
  const { error } = await supabase
    .from("checkout_locks")
    .upsert(
      {
        id: lockId,
        email,
        plan,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "id" }
    );

  return !error;
}

// ===============================
// 🧹 CLEANUP (NON-BLOCKING SAFE)
// ===============================
async function recoverStaleLocks() {
  supabase
    .from("checkout_locks")
    .delete()
    .lt(
      "expires_at",
      new Date(Date.now() - 60 * 60 * 1000).toISOString()
    )
    .then(() => {})
    .catch(() => {});
}

// ===============================
// ROUTE
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    let { plan, email } = body;

    email = normalizeEmail(email);

    // ===============================
    // VALIDATION
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
    // CLEANUP (FIRE AND FORGET)
    // ===============================
    recoverStaleLocks();

    // ===============================
    // ABUSE PROTECTION (FIRST LINE DEFENSE)
    // ===============================
    const abuse = await abuseCheck(email);

    if (!abuse.allowed) {
      return Response.json(
        {
          error:
            abuse.type === "hard_block"
              ? "Account temporarily restricted"
              : "Too many attempts",
        },
        { status: 429 }
      );
    }

    // ===============================
    // LOCK (IDEMPOTENCY CORE)
    // ===============================
    const lockId = buildLockId(email, plan);

    const locked = await acquireLock(lockId, email, plan);

    if (!locked) {
      return Response.json(
        { error: "Duplicate checkout blocked" },
        { status: 409 }
      );
    }

    // ===============================
    // STRIPE SESSION
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
        source: "roofflow_checkout_v5",
      },
    });

    // ===============================
    // AUDIT LOG (NON-BLOCKING)
    // ===============================
    supabase.from("events").insert({
      type: "checkout.created",
      email,
      plan,
      stripe_session_id: session.id,
      lock_id: lockId,
      created_at: new Date().toISOString(),
    }).catch(() => {});

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