import { env } from "cloudflare:workers";
import { getAppUser } from "../../google-auth";

export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const recentRequests = new Map<string, { count: number; resetAt: number }>();

function withinRateLimit(email: string) {
  const now = Date.now();
  const current = recentRequests.get(email);
  if (!current || current.resetAt <= now) {
    recentRequests.set(email, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

function runtimeValue(name: string) {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return runtimeEnv[name] ?? process.env[name] ?? "";
}

export async function GET() {
  const user = await getAppUser();
  return Response.json({
    available: Boolean(user && runtimeValue("SUPERTONIC_TTS_URL")),
    provider: "Supertonic 3",
    fallback: "prerecorded-audio-or-device-voice",
  }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (!withinRateLimit(user.email)) {
    return Response.json({ error: "Too many voice requests" }, { status: 429 });
  }

  const endpoint = runtimeValue("SUPERTONIC_TTS_URL").replace(/\/$/, "");
  if (!endpoint) return Response.json({ error: "Neural TTS service is not configured" }, { status: 503 });

  try {
    const payload = await request.json() as { text?: string; voice?: "female" | "male" };
    const text = payload.text?.trim() ?? "";
    if (!text || text.length > 200) return Response.json({ error: "Text must contain 1–200 characters" }, { status: 400 });
    const voice = payload.voice === "male" ? "M5" : "F1";
    const apiKey = runtimeValue("SUPERTONIC_TTS_API_KEY");
    const upstream = await fetch(`${endpoint}/v1/audio/speech`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ model: "supertonic-3", input: text, voice, speed: 0.9, response_format: "mp3", language: "ko" }),
    });
    if (!upstream.ok || !upstream.body) return Response.json({ error: "TTS generation failed" }, { status: 502 });

    return new Response(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "audio/mpeg",
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "TTS generation failed" }, { status: 500 });
  }
}
