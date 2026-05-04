import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// ===============================
// GET LEADS (ADMIN DASHBOARD)
// Pagination + filters + safe query handling
// ===============================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20"), 1),
      100
    );

    const status = searchParams.get("status");
    const city = searchParams.get("city");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // base query
    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // optional filters
    if (status) query = query.eq("status", status);
    if (city) query = query.eq("city", city);

    const { data, error, count } = await query;

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const total = count || 0;

    return Response.json({
      success: true,
      leads: data || [],
      pagination: {
        page,
        limit,
        total,
        hasMore: from + limit < total,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Unexpected server error",
      },
      { status: 500 }
    );
  }
}