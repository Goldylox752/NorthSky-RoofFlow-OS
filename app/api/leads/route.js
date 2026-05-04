import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// ===============================
// AUTH CLIENT (USER CONTEXT)
// ===============================
function getUserClient(req) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.get("authorization") || "",
        },
      },
    }
  );
}

// ===============================
// GET LEADS (SECURE + PAGINATED)
// ===============================
export async function GET(req) {
  try {
    const userClient = getUserClient(req);

    // ===============================
    // AUTH CHECK
    // ===============================
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return Response.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // ===============================
    // GET USER ROLE
    // ===============================
    const { data: profile } = await supabase
      .from("contractors")
      .select("id, role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "contractor";

    // ===============================
    // QUERY PARAMS (PAGINATION READY)
    // ===============================
    const { searchParams } = new URL(req.url);

    const contractorId = searchParams.get("contractorId");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100
    );
    const offset = parseInt(searchParams.get("offset") || "0");

    // ===============================
    // BASE QUERY
    // ===============================
    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // ===============================
    // ROLE-BASED ACCESS CONTROL
    // ===============================

    if (role === "contractor") {
      // contractors ONLY see their leads
      query = query.eq(
        "assigned_contractor_id",
        profile.id
      );
    }

    if (role === "admin") {
      // admins can optionally filter
      if (contractorId) {
        query = query.eq(
          "assigned_contractor_id",
          contractorId
        );
      }
    }

    // ===============================
    // EXECUTE QUERY
    // ===============================
    const { data, error } = await query;

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      leads: data || [],
      meta: {
        limit,
        offset,
        role,
      },
    });

  } catch (err) {
    console.error("GET leads error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}