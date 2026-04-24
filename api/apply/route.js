import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name,
      phone,
      email,
      company,
      city,
      monthly_jobs,
      lead_spend,
      team_size
    } = body;

    // =========================
    // QUALIFICATION LOGIC
    // =========================
    let qualified = true;

    if (monthly_jobs === "0–5") qualified = false;
    if (lead_spend === "$0") qualified = false;

    // =========================
    // SAVE TO SUPABASE
    // =========================
    const { error } = await supabase.from("applications").insert({
      name,
      phone,
      email,
      company,
      city,
      monthly_jobs,
      lead_spend,
      team_size,
      qualified,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return Response.json({ qualified });

  } catch (err) {
    console.error("Server error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}