import { getQueuedLeads, markLeadProcessing, markLeadDone, markLeadFailed } from "@/lib/queueLead";
import { aiScoreLead } from "@/lib/aiScoreLead";

// =====================
// AI QUEUE WORKER (UPGRADED)
// =====================
export async function GET() {
  try {
    const leads = await getQueuedLeads();

    if (!leads?.length) {
      return Response.json({
        ok: true,
        message: "No leads in queue",
        processed: 0,
      });
    }

    let processed = 0;
    let failed = 0;

    // =====================
    // PROCESS SEQUENTIALLY (SAFE MODE)
    // =====================
    for (const lead of leads) {
      if (!lead?.id) continue;

      try {
        // 🔒 Lock lead so it can't be processed twice
        await markLeadProcessing(lead.id);

        // 🤖 AI scoring
        const scoredLead = await aiScoreLead(lead);

        if (!scoredLead) {
          throw new Error("AI returned empty result");
        }

        // ✅ Mark success
        await markLeadDone(lead.id, scoredLead);

        processed++;
      } catch (err) {
        console.error(`Lead ${lead?.id} failed:`, err.message);

        failed++;

        // 🔁 mark retry-safe failure
        await markLeadFailed(lead.id, err.message);
      }
    }

    return Response.json({
      ok: true,
      processed,
      failed,
      total: leads.length,
    });
  } catch (err) {
    console.error("AI worker crash:", err);

    return Response.json(
      {
        ok: false,
        error: "AI worker failed",
      },
      { status: 500 }
    );
  }
}