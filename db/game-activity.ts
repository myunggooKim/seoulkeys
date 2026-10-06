import { GameActivityError, gameIds, type GameActivityPacket, type GameActivitySummary } from "../app/game-activity-model";

/** Unique immutable batches make an unload retry harmless, even out of order.
 * Indexed account/hour guards bound forged writes; client telemetry is not XP. */
export async function recordGameActivity(db: D1Database, email: string, input: GameActivityPacket, now = Date.now()) {
  const results = await db.batch([
    db.prepare(`INSERT OR IGNORE INTO game_activity
      (user_email, batch_id, game_id, active_seconds, last_played_at, received_at)
      SELECT ?, ?, ?, ?, ?, ? WHERE EXISTS(SELECT 1 FROM users WHERE email = ?)
      AND (SELECT COUNT(*) FROM game_activity WHERE user_email = ? AND received_at > ?) < 240
      AND (SELECT COALESCE(SUM(active_seconds), 0) FROM game_activity WHERE user_email = ? AND received_at > ?) + ? <= 3600`)
      .bind(email, input.id, input.game, input.seconds, input.playedAt, now, email, email, now - 3_600_000, email, now - 3_600_000, input.seconds),
    db.prepare(`INSERT INTO game_activity_totals(user_email, game_id, active_seconds, last_played_at)
      SELECT user_email, game_id, active_seconds, last_played_at FROM game_activity
      WHERE user_email = ? AND batch_id = ? AND counted = 0
      ON CONFLICT(user_email, game_id) DO UPDATE SET
      active_seconds = game_activity_totals.active_seconds + excluded.active_seconds,
      last_played_at = MAX(game_activity_totals.last_played_at, excluded.last_played_at)`).bind(email, input.id),
    db.prepare("UPDATE game_activity SET counted = 1 WHERE user_email = ? AND batch_id = ? AND counted = 0").bind(email, input.id),
    db.prepare("SELECT game_id, active_seconds FROM game_activity WHERE user_email = ? AND batch_id = ?").bind(email, input.id),
    // Bounded indexed cleanup prevents a permanent row for every minute played.
    // 48h exceeds the API's 24h packet validity; aggregate totals never expire.
    db.prepare(`DELETE FROM game_activity WHERE rowid IN
      (SELECT rowid FROM game_activity WHERE received_at < ? ORDER BY received_at LIMIT 100)`).bind(now - 172_800_000),
  ]);
  const saved = results[3].results[0];
  if (!saved) throw new GameActivityError("limit", 429);
  if (saved.game_id !== input.game || saved.active_seconds !== input.seconds) throw new GameActivityError("conflict", 409);
}

export async function readGameActivity(db: D1Database, email: string): Promise<GameActivitySummary[]> {
  const { results } = await db.prepare(`SELECT game_id AS game, active_seconds AS seconds,
    last_played_at AS lastPlayedAt FROM game_activity_totals WHERE user_email = ?`).bind(email)
    .all<GameActivitySummary>();
  return gameIds.map(game => results.find(row => row.game === game) ?? { game, seconds: 0, lastPlayedAt: 0 });
}
