import { env } from "cloudflare:workers";
import { getAuthenticatedMember } from "../../server-auth";
import { GameActivityError, readGameActivityRequest } from "../../game-activity-model";
import { recordGameActivity } from "../../../db/game-activity";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "private, no-store", "x-content-type-options": "nosniff" };
export async function POST(request: Request) {
  try {
    const input = await readGameActivityRequest(request);
    const member = await getAuthenticatedMember();
    if (!member) return Response.json({ error: "signIn" }, { status: 401, headers });
    await recordGameActivity(env.DB, member.identity.email, input);
    return Response.json({ saved: true }, { headers });
  } catch (error) {
    if (error instanceof GameActivityError) return Response.json({ error: error.code }, { status: error.status, headers });
    console.error(JSON.stringify({ event: "game_activity_write_failed" }));
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
