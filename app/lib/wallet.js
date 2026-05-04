import { supabase } from "@/lib/supabase";

// ===============================
// GET BALANCE (READ ONLY)
// ===============================
export async function getBalance(contractorId) {
  const { data, error } = await supabase
    .from("contractors")
    .select("balance_cents")
    .eq("id", contractorId)
    .single();

  if (error) return 0;

  return data?.balance_cents || 0;
}

// =====================================================
// DEDUCT CREDIT (ATOMIC + SAFE + RACE CONDITION PROOF)
// =====================================================
export async function deductCredit(contractorId, amount, leadId) {
  if (!amount || amount <= 0) {
    return { success: false, error: "INVALID_AMOUNT" };
  }

  // ===============================
  // ATOMIC UPDATE (NO READ-FIRST)
  // ===============================
  const { data, error } = await supabase
    .from("contractors")
    .update({
      balance_cents: supabase.sql`
        balance_cents - ${amount}
      `,
    })
    .eq("id", contractorId)
    .gte("balance_cents", amount) // prevents overdraft
    .select("balance_cents")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: "INSUFFICIENT_FUNDS",
    };
  }

  // ===============================
  // LEDGER ENTRY (SOURCE OF TRUTH)
  // ===============================
  await supabase.from("transactions").insert({
    contractor_id: contractorId,
    type: "debit",
    amount_cents: amount,
    lead_id,
    description: "Lead claim purchase",
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    balance: data.balance_cents,
  };
}

// =====================================================
// ADD CREDIT (ATOMIC TOP-UP)
// =====================================================
export async function addCredit(contractorId, amount) {
  if (!amount || amount <= 0) {
    return { success: false, error: "INVALID_AMOUNT" };
  }

  // ===============================
  // ATOMIC INCREMENT
  // ===============================
  const { data, error } = await supabase
    .from("contractors")
    .update({
      balance_cents: supabase.sql`
        balance_cents + ${amount}
      `,
    })
    .eq("id", contractorId)
    .select("balance_cents")
    .single();

  if (error) {
    return { success: false, error: "TOPUP_FAILED" };
  }

  // ===============================
  // LEDGER ENTRY
  // ===============================
  await supabase.from("transactions").insert({
    contractor_id: contractorId,
    type: "credit",
    amount_cents: amount,
    description: "Wallet top-up",
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    balance: data.balance_cents,
  };
}