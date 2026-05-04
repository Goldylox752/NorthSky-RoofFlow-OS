import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { leadId, contractorId } = await req.json();

    if (!leadId || !contractorId) {
      return Response.json(
        { success: false, error: "Missing leadId or contractorId" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // ===============================
    // ATOMIC CLAIM (NO RACE CONDITIONS)
    // ===============================
    const { data, error } = await supabase
      .from("leads")
      .update({
        status: "locked",
        assigned_contractor_id: contractorId,
        lock_owner: contractorId,
        locked_at: now,
        lock_expires_at: expiresAt,
      })
      .eq("id", leadId)

      // only allow claim if:
      // - new lead OR
      // - lock expired
      .or(`status.eq.new,lock_expires_at.lt.${now}`)

      // prevents double ownership
      .is("lock_owner", null)

      .select()
      .single();

    // ===============================
    // FAILED CLAIM
    // ===============================
    if (error || !data) {
      return Response.json(
        {
          success: false,
          error: "Lead already claimed or unavailable",
        },
        { status: 409 }
      );
    }

    // ===============================
    // SUCCESS
    // ===============================
    return Response.json({
      success: true,
      message: "Lead successfully claimed",
      lead: data,
    });

  } catch (err) {
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}