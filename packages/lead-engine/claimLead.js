// packages/lead-engine/claimLead.js

import { supabase } from "@/lib/supabase";

export async function claimLead({ leadId, contractorId }) {
  // 🔒 ATOMIC CLAIM (NO DOUBLE CLAIMS POSSIBLE)
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: "claimed",
      assigned_contractor_id: contractorId,
      lock_owner: contractorId,
      locked_at: new Date().toISOString(),
      lock_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    .eq("id", leadId)
    .eq("status", "new") // race-condition protection
    .select()
    .single();

  if (error || !data) return null;

  return data;
}