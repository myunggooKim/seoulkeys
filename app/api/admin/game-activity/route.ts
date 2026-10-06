import { env } from "cloudflare:workers";
import { getAdminUser } from "../../../admin-auth";
import { readGameActivity } from "../../../../db/game-activity";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "private, no-store", "x-content-type-options": "nosniff" };
export async function GET(request: Request) {
  if (!await getAdminUser()) return Response.json({ error: "forbidden" }, { status: 403, headers });
  const email = new URL(request.url).searchParams.get("email");
  if (!email || email.length > 254) return Response.json({ error: "invalid" }, { status: 400, headers });
  try { return Response.json({ games: await readGameActivity(env.DB, email) }, { headers }); }
  catch {
    console.error(JSON.stringify({ event: "game_activity_read_failed" }));
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
