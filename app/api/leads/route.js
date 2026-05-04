import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// ===============================
// LEADS API (SAAS CORE ENGINE)
// role-aware + routing-safe + scalable
// ===============================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ===============================
    // PAGINATION (SAFE DEFAULTS)
    // ===============================
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20"), 1),
      100
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // ===============================
    // FILTERS
    // ===============================
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const minScore = searchParams.get("minScore");
    const contractorId = searchParams.get("contractorId");

    // ===============================
    // ROLE (CRITICAL SAAS LAYER)
    // ===============================
    const role = searchParams.get("role"); 
    // admin | contractor

    // ===============================
    // BASE QUERY
    // ===============================
    let query = supabase
      .from("leads")
      .select(
        `
        id,
        email,
        phone,
        name,
        city,
        status,
        score,
        price,
        billed,
        created_at,
        assigned_contractor_id,
        locked_at,
        lock_owner,
        lock_expires_at
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    // ===============================
    // ROLE-BASED DATA PROTECTION
    // ===============================
    if (role === "contractor" && contractorId) {
      query = query.eq("assigned_contractor_id", contractorId);
    }

    // admin sees everything (no restriction)

    // ===============================
    // FILTERS
    // ===============================
    if (status) query = query.eq("status", status);
    if (city) query = query.eq("city", city);

    if (contractorId && role === "admin") {
      query = query.eq("assigned_contractor_id", contractorId);
    }

    if (minScore) {
      const score = parseInt(minScore);
      if (!Number.isNaN(score)) {
        query = query.gte("score", score);
      }
    }

    // ===============================
    // EXECUTE
    // ===============================
    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Supabase error:", error.message);

      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    // ===============================
    // SaaS METRICS LAYER (IMPORTANT)
    // ===============================
    const metrics = {
      total,
      returned: data?.length ?? 0,
      avgScore:
        data?.length > 0
          ? (
              data.reduce((acc, l) => acc + (l.score || 0), 0) /
              data.length
            ).toFixed(2)
          : 0,
    };

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      success: true,
      leads: data ?? [],

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: from + limit < total,
      },

      metrics,
    });
  } catch (err) {
    console.error("🔥 Leads API crash:", err);

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}