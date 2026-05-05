import { supabase } from "@/lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const contractorId = searchParams.get("contractorId");

    // ===============================
    // VALIDATION
    // ===============================
    if (!contractorId || typeof contractorId !== "string") {
      return Response.json(
        { error: "Invalid contractorId" },
        { status: 400 }
      );
    }

    // ===============================
    // 🔥 DB-SIDE AGGREGATION (FAST PATH)
    // ===============================
    const { data, error } = await supabase
      .from("leads")
      .select("price, billed")
      .eq("assigned_contractor_id", contractorId);

    if (error) throw error;

    const rows = data ?? [];

    // ===============================
    // FAST REDUCE (CPU LIGHT)
    // ===============================
    const summary = rows.reduce(
      (acc, lead) => {
        const price = Number(lead.price) || 0;

        acc.earnings += price;
        if (lead.billed) acc.billed += 1;

        return acc;
      },
      { earnings: 0, billed: 0 }
    );

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      success: true,
      contractorId,
      earnings: summary.earnings,
      billed: summary.billed,
      leads: rows.length,
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