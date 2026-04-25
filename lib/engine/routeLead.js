async function routeLead(supabase, lead) {

  // 1. Get active contractors
  const { data: contractors } = await supabase
    .from("contractors")
    .select("*")
    .eq("subscription_status", "active");

  if (!contractors?.length) return;

  // 2. Tier weights
  const weight = {
    elite: 3,
    pro: 2,
    starter: 1
  };

  // 3. Sort best match first
  const sorted = contractors.sort(
    (a, b) => (weight[b.subscription_tier] || 0) - (weight[a.subscription_tier] || 0)
  );

  const selected = sorted[0];

  if (!selected) return;

  // 4. LOCK LEAD (prevents duplication)
  const { data: existing } = await supabase
    .from("lead_assignments")
    .select("*")
    .eq("lead_id", lead.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("lead_assignments").insert([{
    lead_id: lead.id,
    contractor_id: selected.id,
    status: "assigned",
    created_at: new Date().toISOString()
  }]);

  // 5. DELIVERY (SMS / EMAIL / webhook)
  console.log("🎯 Routed lead to:", selected.email);

  return selected;
}

module.exports = { routeLead };
