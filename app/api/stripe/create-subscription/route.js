import { PLANS } from "@/lib/stripe-plans";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  const { plan, user } = await req.json();

  const selected = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    line_items: [
      {
        price: selected.priceId, // 🔥 THIS IS THE KEY FIX
        quantity: 1,
      },
    ],

    metadata: {
      userId: user.id,
      plan,
    },

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return Response.json({ url: session.url });
}