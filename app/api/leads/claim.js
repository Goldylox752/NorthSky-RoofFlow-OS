import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { leadId, contractorId } = await req.json();

    if (!leadId || !contractorId) {
      return Response.json(
        { success: false, error: "Missing data" },
        { status: 400 }
      );
    }

    // ===============================
    // ATOMIC CLAIM (CRITICAL FIX)
    // ===============================
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (!lead) {
      return Response.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // already claimed
    if (lead.status !== "new") {
      return Response.json(
        { success: false, error: "Already claimed" },
        { status: 409 }
      );
    }

    // ===============================
    // LOCK + ASSIGN
    // ===============================
    const { error } = await supabase
      .from("leads")
      .update({
        status: "locked",
        assigned_contractor_id: contractorId,
        locked_at: new Date().toISOString(),
        lock_owner: contractorId,
        lock_expires_at: new Date(
          Date.now() + 5 * 60 * 1000
        ).toISOString(),
      })
      .eq("id", leadId)
      .eq("status", "new"); // prevents race condition

    if (error) {
      return Response.json(
        { success: false, error: "Lock failed" },
        { status: 409 }
      );
    }

    return Response.json({
      success: true,
      message: "Lead claimed",
    });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}