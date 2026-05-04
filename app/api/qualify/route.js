import OpenAI from "openai";
import Lead from "@/models/Lead";
import dbConnect from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =====================
// LEAD SCORING ENGINE
// =====================
export async function POST(req) {
  try {
    await dbConnect();

    const { leadId, message } = await req.json();

    if (!leadId) {
      return Response.json(
        { success: false, error: "Missing leadId" },
        { status: 400 }
      );
    }

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return Response.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // =====================
    // AI SCORING
    // =====================
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a roofing lead qualification system. Score purchase intent from 1-10. ONLY return a number. No words.",
        },
        {
          role: "user",
          content: message?.trim() || "No message provided",
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";

    const parsedScore = parseInt(raw.match(/\d+/)?.[0]);

    const score = Number.isNaN(parsedScore)
      ? 5
      : Math.max(1, Math.min(10, parsedScore));

    // =====================
    // BUSINESS LOGIC
    // =====================
    lead.score = score;

    if (score >= 8) {
      lead.status = "hot";
    } else if (score >= 6) {
      lead.status = "qualified";
    } else {
      lead.status = "new";
    }

    await lead.save();

    // =====================
    // RESPONSE
    // =====================
    return Response.json({
      success: true,
      score,
      status: lead.status,
    });
  } catch (error) {
    console.error("Scoring error:", error);

    return Response.json(
      {
        success: false,
        error: "Lead scoring failed",
      },
      { status: 500 }
    );
  }
}