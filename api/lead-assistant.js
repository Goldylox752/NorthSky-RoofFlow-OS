async function assignLeadToAgent(leadId) {

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("active", true)
    .order("calls_today", { ascending: true })
    .limit(1)
    .single();

  if (!agent) return;

  await supabase
    .from("leads")
    .update({
      assigned_agent: agent.email,
      status: "assigned"
    })
    .eq("id", leadId);

  await supabase
    .from("agents")
    .update({
      calls_today: agent.calls_today + 1
    })
    .eq("email", agent.email);
}