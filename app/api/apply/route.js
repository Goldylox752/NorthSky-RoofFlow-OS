import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ================= SUPABASE ================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ================= POST HANDLER ================= */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name,
      phone,
      email,
      city,
      monthly_jobs,
      lead_spend,
      team_size
    } = body;

    if (!name || !phone || !email || !city) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    /* ================= QUALIFICATION LOGIC ================= */
    let qualified = true;

    if (monthly_jobs === "0–5") qualified = false;
    if (lead_spend === "$0") qualified = false;

    /* ================= SAVE TO SUPABASE ================= */
    const { error } = await supabase.from("applications").insert([
      {
        name,
        phone,
        email,
        city,
        monthly_jobs,
        lead_spend,
        team_size,
        qualified,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "DB insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ qualified });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    );
  }
}
