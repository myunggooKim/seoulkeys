import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

function runtimeValue(name: string) {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return runtimeEnv[name] ?? process.env[name] ?? "";
}

export async function GET() {
  return Response.json({
    available: Boolean(runtimeValue("SUPERTONIC_TTS_URL")),
    provider: "Supertonic 3",
    fallback: "prerecorded-audio-or-device-voice",
  });
}

export async function POST(request: Request) {
  const endpoint = runtimeValue("SUPERTONIC_TTS_URL").replace(/\/$/, "");
  if (!endpoint) return Response.json({ error: "Neural TTS service is not configured" }, { status: 503 });

  try {
    const payload = await request.json() as { text?: string; voice?: "female" | "male" };
    const text = payload.text?.trim() ?? "";
    if (!text || text.length > 500) return Response.json({ error: "Text must contain 1–500 characters" }, { status: 400 });
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
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "TTS generation failed" }, { status: 500 });
  }
}
