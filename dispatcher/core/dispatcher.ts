import { claimLead } from "./claimLead";
import { assignLead } from "./assignLead";
import { supabase } from "@/lib/supabase";

const WORKER_ID =
  process.env.WORKER_ID || `worker_${Math.random().toString(36).slice(2, 8)}`;

export async function runDispatcher(batchSize = 10) {
  // 1. fetch queued leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "queued")
    .limit(batchSize);

  if (!leads?.length) return { processed: 0 };

  // 2. fetch contractors
  const { data: contractors } = await supabase
    .from("contractors")
    .select("*")
    .eq("active", true);

  const results = [];

  // 3. process sequentially (safe baseline)
  for (const lead of leads) {
    const claimed = await claimLead(lead.id, WORKER_ID);

    if (!claimed) continue;

    const assigned = await assignLead({
      lead: claimed,
      contractors: contractors || [],
      cityRow: null, // plug city table later
      systemMetrics: {
        demandMultiplier: 1,
      },
    });

    results.push(assigned);
  }

  return {
    worker: WORKER_ID,
    processed: results.length,
  };
}