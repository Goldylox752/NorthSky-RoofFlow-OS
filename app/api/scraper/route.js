import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // 🔒 rate limit
  if (!rateLimit(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  try {
    const { url } = await req.json();

    // 🔒 basic validation
    if (!url || typeof url !== "string") {
      return new Response("Invalid URL", { status: 400 });
    }

    // 🔒 allow only http/https
    if (!url.startsWith("http")) {
      return new Response("Invalid protocol", { status: 400 });
    }

    // 🔒 timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RoofFlowBot/1.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return new Response("Failed to fetch", { status: 400 });
    }

    const html = await res.text();

    // 🔥 lightweight extraction (no heavy parsing libs needed)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch?.[1] || "No title found";

    return Response.json({
      url,
      title,
      length: html.length,
      success: true,
    });
  } catch (err) {
    return Response.json(
      {
        error: err.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
