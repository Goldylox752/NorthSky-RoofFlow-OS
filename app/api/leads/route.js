import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// ===============================
// GET LEADS (ADMIN + CONTRACTOR + SAAS)
// Pagination + filters + scoring + routing support
// ===============================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ===============================
    // SAFE PAGINATION
    // ===============================
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20"), 1),
      100
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // ===============================
    // FILTERS (SaaS LAYER)
    // ===============================
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const minScore = searchParams.get("minScore");
    const contractorId = searchParams.get("contractorId");

    // ===============================
    // BASE QUERY
    // ===============================
    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // ===============================
    // DYNAMIC FILTERS
    // ===============================
    if (status) query = query.eq("status", status);
    if (city) query = query.eq("city", city);
    if (contractorId)
      query = query.eq("assigned_contractor_id", contractorId);

    if (minScore) {
      const score = parseInt(minScore);
      if (!Number.isNaN(score)) {
        query = query.gte("score", score);
      }
    }

    // ===============================
    // EXECUTE QUERY
    // ===============================
    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Supabase error:", error.message);

      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    // ===============================
    // RESPONSE (SAAS STRUCTURE)
    // ===============================
    return Response.json({
      success: true,
      leads: data ?? [],

      stats: {
        total,
        returned: data?.length ?? 0,
      },

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: from + limit < total,
      },
    });
  } catch (err) {
    console.error("🔥 Leads API crash:", err);

    return Response.json(
      {
        success: false,
        error: "Unexpected server error",
      },
      { status: 500 }
    );
  }
}