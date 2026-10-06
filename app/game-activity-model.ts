export const gameIds = ["falling-words", "missing-letter", "crossword"] as const;
export type GameId = typeof gameIds[number];
export const gameNames: Record<GameId, string> = {
  "falling-words": "도시 방어전",
  "missing-letter": "빈 글자 맞추기",
  crossword: "십자말풀이",
};

export type GameActivityPacket = {
  id: string;
  game: GameId;
  seconds: number;
  playedAt: number;
};
export type GameActivitySummary = { game: GameId; seconds: number; lastPlayedAt: number };

export class GameActivityError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

export function validateGameActivity(value: unknown, now = Date.now()): GameActivityPacket {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new GameActivityError("invalid");
  const input = value as Record<string, unknown>;
  if (typeof input.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id)
    || !gameIds.includes(input.game as GameId)
    || typeof input.seconds !== "number" || !Number.isInteger(input.seconds) || input.seconds < 1 || input.seconds > 60
    || typeof input.playedAt !== "number" || !Number.isSafeInteger(input.playedAt)
    || input.playedAt < now - 86_400_000 || input.playedAt > now + 10_000) throw new GameActivityError("invalid");
  // Account identity, totals, and scores are never accepted from the browser.
  return { id: input.id, game: input.game as GameId, seconds: input.seconds, playedAt: Math.min(now, input.playedAt) };
}

export async function readGameActivityRequest(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new GameActivityError("origin", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new GameActivityError("contentType", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new GameActivityError("invalid");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); throw new GameActivityError("tooLarge", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return validateGameActivity(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes))); }
  catch (error) { if (error instanceof GameActivityError) throw error; throw new GameActivityError("invalid"); }
}
