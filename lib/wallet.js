import { supabase } from "@/lib/supabase";

/**
 * ===============================
 * GET BALANCE
 * ===============================
 */
export async function getBalance(contractorId) {
  const { data, error } = await supabase
    .from("contractors")
    .select("balance_cents")
    .eq("id", contractorId)
    .single();

  if (error) throw new Error(error.message);

  return data?.balance_cents || 0;
}

/**
 * ===============================
 * DEDUCT CREDIT (RPC SAFE)
 * ===============================
 */
export async function deductCredit(contractorId, amount, leadId) {
  const { data, error } = await supabase.rpc("deduct_credit", {
    p_contractor_id: contractorId,
    p_amount: amount,
    p_lead_id: leadId,
  });

  if (error || !data?.success) {
    return {
      success: false,
      error: data?.error || "FAILED",
    };
  }

  return {
    success: true,
    balance: data.balance,
  };
}

/**
 * ===============================
 * ADD CREDIT (RPC SAFE)
 * ===============================
 */
export async function addCredit(contractorId, amount) {
  const { data, error } = await supabase.rpc("add_credit", {
    p_contractor_id: contractorId,
    p_amount: amount,
  });

  if (error || !data?.success) {
    return {
      success: false,
      error: "TOPUP_FAILED",
    };
  }

  return {
    success: true,
    balance: data.balance,
  };
}