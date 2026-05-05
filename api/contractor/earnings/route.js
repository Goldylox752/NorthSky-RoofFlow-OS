import { supabase } from "@/lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const contractorId = searchParams.get("contractorId");

    // ===============================
    // VALIDATION
    // ===============================
    if (!contractorId) {
      return Response.json(
        { error: "Missing contractorId" },
        { status: 400 }
      );
    }

    // ===============================
    // 🔐 SAFE AGGREGATION (DB-SIDE)
    // ===============================
    const { data, error } = await supabase
      .from("leads")
      .select("price, billed")
      .eq("assigned_contractor_id", contractorId);

    if (error) {
      throw new Error(error.message);
    }

    // ===============================
    // NULL SAFETY
    // ===============================
    const safeData = data || [];

    // ===============================
    // CALCULATIONS (CONTROLLED LAYER)
    // ===============================
    let earnings = 0;
    let billed = 0;

    for (const lead of safeData) {
      const price = Number(lead.price || 0);

      earnings += price;

      if (lead.billed === true) {
        billed++;
      }
    }

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      success: true,
      contractorId,
      earnings,
      billed,
      leads: safeData.length,
    });

  } catch (err) {
    console.error("Revenue endpoint error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch earnings",
      },
      { status: 500 }
    );
  }
}