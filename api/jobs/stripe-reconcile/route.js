import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// 🔁 SYNC CONTRACTOR SUBSCRIPTIONS (PAGINATED)
// ===============================
async function syncSubscriptions() {
  let hasMore = true;
  let startingAfter = null;

  while (hasMore) {
    const res = await stripe.subscriptions.list({
      limit: 100,
      status: "all",
      starting_after: startingAfter || undefined,
    });

    for (const sub of res.data) {
      const customerId = sub.customer;

      const { data: contractor } = await supabase
        .from("contractors")
        .select("id, active, stripe_subscription_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (!contractor) continue;

      const shouldBeActive =
        sub.status === "active" || sub.status === "trialing";

      const dbMatches =
        contractor.active === shouldBeActive &&
        contractor.stripe_subscription_id === sub.id;

      if (dbMatches) continue;

      await supabase
        .from("contractors")
        .update({
          active: shouldBeActive,
          stripe_subscription_id: sub.id,
        })
        .eq("id", contractor.id);

      console.log(
        `🔄 Reconciled contractor ${contractor.id} → ${shouldBeActive}`
      );
    }

    hasMore = res.has_more;
    startingAfter = res.data.at(-1)?.id;
  }
}

// ===============================
// 💳 SYNC RECENT CHECKOUTS
// ===============================
async function syncRecentCheckouts() {
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
  });

  for (const session of sessions.data) {
    if (session.payment_status !== "paid") continue;

    const email = session.customer_details?.email;
    if (!email) continue;

    const { data: contractor } = await supabase
      .from("contractors")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!contractor) {
      await supabase.from("contractors").insert({
        email,
        stripe_customer_id: session.customer,
        active: true,
        plan: "pro",
      });

      console.log(`🧠 Recovered missing contractor: ${email}`);
    }
  }
}

// ===============================
// 🧹 EVENT DRIFT CHECK
// ===============================
async function reconcileEvents() {
  const { data: failedEvents } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("status", "failed")
    .limit(50);

  for (const event of failedEvents || []) {
    console.log(`⚠️ Needs retry: ${event.id}`);
    // future: reprocess queue
  }
}

// ===============================
// 🧠 MAIN RECONCILIATION JOB
// ===============================
export async function GET(req) {
  // ===============================
  // 🔐 VERCEL CRON AUTH (CORRECT WAY)
  // ===============================
  const isCron = req.headers.get("x-vercel-cron");

  if (!isCron) {
    return new Response("Unauthorized", { status: 401 });
  }

  const start = Date.now();

  try {
    console.log("🚀 Stripe reconciliation started");

    await syncSubscriptions();
    await syncRecentCheckouts();
    await reconcileEvents();

    const duration = Date.now() - start;

    console.log(`✅ Reconciliation complete (${duration}ms)`);

    return Response.json({
      ok: true,
      duration_ms: duration,
    });

  } catch (err) {
    console.error("❌ Reconciliation error:", err);

    return Response.json(
      { ok: false, error: "reconciliation failed" },
      { status: 500 }
    );
  }
}