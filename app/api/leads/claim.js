import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { leadId, contractorId } = await req.json();

    if (!leadId || !contractorId) {
      return Response.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    // ===============================
    // ATOMIC CLAIM (RACE CONDITION SAFE)
    // ===============================
    const { data, error } = await supabase
      .from("leads")
      .update({
        status: "assigned",
        assigned_contractor_id: contractorId,
        lock_owner: contractorId,
        locked_at: new Date().toISOString(),
        lock_expires_at: new Date(Date.now() + 5 * 60 * 1000),
      })
      .eq("id", leadId)
      .eq("status", "new") // prevents double claim
      .select()
      .single();

    if (error || !data) {
      return Response.json(
        { error: "Lead already claimed" },
        { status: 409 }
      );
    }

    return Response.json({
      success: true,
      lead: data,
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}