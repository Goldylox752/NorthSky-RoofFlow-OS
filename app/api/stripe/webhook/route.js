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
// ATOMIC IDEMPOTENCY CHECK (SAFE)
// ===============================
async function isProcessed(eventId) {
  const { data } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  return !!data;
}

// ===============================
// MARK EVENT (ATOMIC INSERT)
// ===============================
async function markProcessed(eventId, type) {
  const { error } = await supabase.from("stripe_events").insert({
    id: eventId,
    type,
    processed_at: new Date().toISOString(),
  });

  // duplicate insert = already processed
  return !error;
}

// ===============================
// SAFE CITY UPDATE (NO RACE OVERWRITE)
// ===============================
async function updateCity(city, contractorId, cityRow) {
  const existing = cityRow.active_contractors || [];

  if (existing.includes(contractorId)) return;

  const updated = [...existing, contractorId];

  await supabase
    .from("cities")
    .update({
      active_contractors: updated,
      status:
        updated.length >= cityRow.max_contractors
          ? "sold"
          : "active",
    })
    .eq("city", city);
}

// ===============================
// WEBHOOK
// ===============================
export async function POST(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    // ===============================
    // VERIFY STRIPE SIGNATURE
    // ===============================
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return new Response("Invalid signature", { status: 400 });
    }

    // ===============================
    // IDEMPOTENCY GUARD (FAST EXIT)
    // ===============================
    const already = await isProcessed(event.id);

    if (already) {
      return Response.json({
        received: true,
        duplicate: true,
      });
    }

    // ===============================
    // ROUTER
    // ===============================
    switch (event.type) {

      // =====================================================
      // 💳 PAYMENT SUCCESS
      // =====================================================
      case "checkout.session.completed": {
        const session = event.data.object;

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const city = session.metadata?.city;

        if (!email) break;

        // ===============================
        // UPSERT CONTRACTOR (SAFE)
        // ===============================
        const { data: contractor, error } = await supabase
          .from("contractors")
          .upsert(
            {
              email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              active: true,
              plan: city ? "city_owner" : "pro",
              city: city || null,
            },
            { onConflict: "email" }
          )
          .select()
          .single();

        if (error || !contractor) {
          console.error("Contractor upsert failed:", error);
          break;
        }

        // ===============================
        // CITY LOGIC (SAFE + OPTIONAL)
        // ===============================
        if (city) {
          const { data: cityRow } = await supabase
            .from("cities")
            .select("*")
            .eq("city", city)
            .single();

          if (cityRow) {
            await updateCity(city, contractor.id, cityRow);
          }

          await supabase
            .from("city_intents")
            .update({ status: "confirmed" })
            .eq("city", city)
            .eq("contractorId", contractor.id);
        }

        // ===============================
        // AUDIT LOG (IMPORTANT FOR DEBUGGING)
        // ===============================
        await supabase.from("events").insert({
          type: "stripe.checkout.completed",
          contractor_id: contractor.id,
          payload: session,
        });

        break;
      }

      // =====================================================
      // 🔄 SUBSCRIPTION UPDATE
      // =====================================================
      case "customer.subscription.updated": {
        const sub = event.data.object;

        await supabase
          .from("contractors")
          .update({
            active: sub.status === "active",
          })
          .eq("stripe_customer_id", sub.customer);

        break;
      }

      // =====================================================
      // ❌ SUBSCRIPTION CANCELLED
      // =====================================================
      case "customer.subscription.deleted": {
        const sub = event.data.object;

        await supabase
          .from("contractors")
          .update({
            active: false,
            plan: "free",
          })
          .eq("stripe_customer_id", sub.customer);

        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

    // ===============================
    // MARK PROCESSED (FINAL STEP)
    // ===============================
    await markProcessed(event.id, event.type);

    return Response.json({ received: true });

  } catch (err) {
    console.error("Webhook crash:", err);

    return Response.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}