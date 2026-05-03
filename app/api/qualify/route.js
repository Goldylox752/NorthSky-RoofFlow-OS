import OpenAI from "openai";
import Lead from "@/models/Lead";
import dbConnect from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    await dbConnect();

    const { leadId, message } = await req.json();

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return Response.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a roofing sales qualification AI. Score intent from 1 to 10. Respond ONLY with a number.",
        },
        {
          role: "user",
          content: message || "No message provided",
        },
      ],
    });

    const raw = completion.choices[0].message.content || "";
    const score = Math.min(
      10,
      Math.max(1, parseInt(raw.match(/\d+/)?.[0] || "5"))
    );

    lead.score = score;
    lead.status = score >= 7 ? "qualified" : "new";

    await lead.save();

    return Response.json({
      success: true,
      score,
      status: lead.status,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}