import { sql } from "drizzle-orm";
import { getDb } from "../../../db";

export const dynamic = "force-dynamic";

/** How long a heartbeat keeps a visitor counted as present. Long enough to ride
 *  out a missed beat, short enough that the number falls when people leave. */
const PRESENCE_WINDOW_SECONDS = 150;

/**
 * Real numbers only.
 *
 * The point of this endpoint is to tell a first-time visitor that other people
 * are here — which is worth doing, but only with figures that are true. A
 * fabricated "37 people online" is trivially the kind of thing a teacher checks
 * before bringing a class, and losing that trust costs far more than the
 * reassurance is worth. So: how many countries the learners come from, how many
 * of them there are, and how many are here now.
 *
 * The caller decides what is worth showing at the current scale; see
 * app/CommunityPulse.tsx.
 */
export async function GET() {
  try {
    const db = getDb();
    const cutoff = Math.floor(Date.now() / 1000) - PRESENCE_WINDOW_SECONDS;
    const [row] = await db.all<{
      learners: number;
      countries: number;
      liveNow: number;
    }>(sql`
      SELECT
        total_visits AS learners,
        country_count AS countries,
        (SELECT COUNT(*) FROM presence WHERE seen_at >= ${cutoff}) AS liveNow
      FROM community_stats
      WHERE id = 1
    `);

    return Response.json(
      {
        learners: Number(row?.learners ?? 0),
        countries: Number(row?.countries ?? 0),
        liveNow: Number(row?.liveNow ?? 0),
      },
      // Never cached: a live count that is a minute stale is not a live count.
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    // A visitor should never see an error because a vanity counter failed.
    return Response.json({ learners: 0, countries: 0, liveNow: 0 });
  }
}

/**
 * Heartbeat. An open tab calls this every 60 seconds while it is visible, and
 * that is the whole of the live count — no fabricated figure, and nothing that
 * identifies anybody: the id is a random value the tab made for itself, and the
 * country comes from Cloudflare's edge header, which is already attached to the
 * request.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { visitorId?: unknown };
    const raw = typeof body.visitorId === "string" ? body.visitorId : "";
    // Bounded and character-restricted so a caller cannot use this as storage.
    const visitorId = /^[A-Za-z0-9_-]{8,64}$/.test(raw) ? raw : "";
    if (!visitorId) return Response.json({ ok: false }, { status: 400 });

    const country = (request.headers.get("cf-ipcountry") ?? "").slice(0, 2).toUpperCase();
    const now = Math.floor(Date.now() / 1000);
    const db = getDb();

    await db.run(sql`
      INSERT INTO presence (visitor_id, country, seen_at)
      VALUES (${visitorId}, ${country}, ${now})
      ON CONFLICT(visitor_id) DO UPDATE SET seen_at = ${now}, country = ${country}
    `);
    /* The cumulative record. `presence` is deliberately short-lived — it answers
       "who is here now" — so the running totals need their own row per visitor,
       kept for good. `beats` and the first/last pair are what let the board say
       "used for at least a minute" rather than "opened the page once". */
    await db.run(sql`
      INSERT INTO visitors (visitor_id, country, first_seen, last_seen, beats)
      VALUES (${visitorId}, ${country}, ${now}, ${now}, 1)
      ON CONFLICT(visitor_id) DO UPDATE SET
        last_seen = ${now},
        beats = beats + 1,
        country = CASE WHEN visitors.country = '' THEN ${country} ELSE visitors.country END
    `);
    // Opportunistic cleanup: an hour past the window is long dead.
    await db.run(sql`DELETE FROM presence WHERE seen_at < ${now - 3600}`);

    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 200 });
  }
}
