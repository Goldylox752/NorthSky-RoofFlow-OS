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
// ATOMIC IDEMPOTENCY INSERT
// ===============================
async function markProcessed(eventId) {
  const { error } = await supabase
    .from("stripe_events")
    .insert({ id: eventId });

  // If duplicate → ignore safely
  return !error;
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
    // IDEMPOTENCY (DB-ATOMIC)
    // ===============================
    const inserted = await markProcessed(event.id);

    if (!inserted) {
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
      // CHECKOUT COMPLETE
      // =====================================================
      case "checkout.session.completed": {
        const session = event.data.object;

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const city = session.metadata?.city;

        if (!email) {
          console.warn("Missing email in session:", session.id);
          break;
        }

        // ===============================
        // UPSERT CONTRACTOR
        // ===============================
        const { data: contractor, error: contractorErr } =
          await supabase
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

        if (contractorErr) {
          console.error("Contractor upsert failed:", contractorErr);
          break;
        }

        // ===============================
        // CITY OWNERSHIP LOCK (SAFE UPDATE)
        // ===============================
        if (city && contractor) {
          const { data: cityRow } = await supabase
            .from("cities")
            .select("*")
            .eq("city", city)
            .single();

          if (cityRow) {
            const existing = cityRow.active_contractors || [];

            if (!existing.includes(contractor.id)) {
              await supabase
                .from("cities")
                .update({
                  active_contractors: [
                    ...existing,
                    contractor.id,
                  ],
                  status:
                    existing.length + 1 >= cityRow.max_contractors
                      ? "sold"
                      : "active",
                })
                .eq("city", city);
            }
          }

          await supabase
            .from("city_intents")
            .update({ status: "confirmed" })
            .eq("city", city)
            .eq("contractorId", contractor.id);
        }

        break;
      }

      // =====================================================
      // SUBSCRIPTION UPDATED
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
      // SUBSCRIPTION DELETED
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

    return Response.json({ received: true });

  } catch (err) {
    console.error("Webhook crash:", err);
    return Response.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}