import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET);

export default async function handler(req, res) {
  const { email } = req.body;

  const customer = await stripe.customers.create({ email });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: "YOUR_STRIPE_PRICE_ID",
        quantity: 1,
      },
    ],
    success_url: "https://your-site.com/success",
    cancel_url: "https://your-site.com",
    customer: customer.id
  });

  res.json({ id: session.id });
}
