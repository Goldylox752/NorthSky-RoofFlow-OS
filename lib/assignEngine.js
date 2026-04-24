import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Assign a lead to the best available agent
 */
export async function assignLead(lead) {

  // 1. get active agents
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("active", true);

  if (!agents || agents.length === 0) {
    throw new Error("No active agents available");
  }

  // 2. get current load
  const { data: loads } = await supabase
    .from("agent_load")
    .select("*");

  // 3. find lowest load agent (round robin + balancing)
  let selectedAgent = null;
  let lowestLoad = Infinity;

  for (const agent of agents) {
    const load = loads?.find(l => l.agent_id === agent.id)?.active_leads_count || 0;

    if (load < lowestLoad) {
      lowestLoad = load;
      selectedAgent = agent;
    }
  }

  if (!selectedAgent) {
    throw new Error("No agent selected");
  }

  // 4. create assignment
  await supabase.from("assignments").insert({
    lead_id: lead.id,
    agent_id: selectedAgent.id,
    status: "assigned",
    assigned_at: new Date().toISOString()
  });

  // 5. update lead status
  await supabase
    .from("leads")
    .update({ status: "assigned", agent_id: selectedAgent.id })
    .eq("id", lead.id);

  // 6. increment agent load
  await supabase.rpc("increment_agent_load", {
    agent_id_input: selectedAgent.id
  });

  return selectedAgent;
}