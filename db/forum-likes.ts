import {ForumError, validId} from '../app/community/model';

export type PostLikeState = {likes: number; liked: boolean};
type LikeRow = {likes: number; liked: number; blocked: number};

// Only totals and the caller's own state leave this module, never account IDs.
const stateQuery = `SELECT
  (SELECT COUNT(*) FROM forum_likes WHERE entry_id=p.id) AS likes,
  EXISTS(SELECT 1 FROM forum_likes WHERE entry_id=p.id AND user_email=?) AS liked,
  EXISTS(SELECT 1 FROM forum_profiles WHERE user_email=? AND blocked=1) AS blocked
  FROM forum_entries p WHERE p.id=? AND p.parent_id IS NULL AND p.status='published'`;

export async function readPostLike(db: D1Database, id: string, email: string | null = null): Promise<PostLikeState> {
  if (!validId(id)) throw new ForumError('missing', 404);
  const row = await db.prepare(stateQuery).bind(email, email, id).first<LikeRow>();
  if (!row) throw new ForumError('missing', 404);
  return {likes: row.likes, liked: Boolean(row.liked)};
}

export async function setPostLike(db: D1Database, email: string, input: Record<string, unknown>, now = Date.now()): Promise<PostLikeState> {
  if (!validId(input.id) || typeof input.liked !== 'boolean') throw new ForumError('invalid');
  // Desired-state writes are retry-safe. Identity comes exclusively from the session.
  // Visibility, blocking, and at most 100 active recent likes are checked in SQL.
  const mutation = input.liked
    ? db.prepare(`INSERT INTO forum_likes(entry_id,user_email,created_at)
        SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM forum_entries WHERE id=? AND parent_id IS NULL AND status='published')
        AND NOT EXISTS(SELECT 1 FROM forum_profiles WHERE user_email=? AND blocked=1)
        AND (SELECT COUNT(*) FROM forum_likes WHERE user_email=? AND created_at>?)<100
        ON CONFLICT(entry_id,user_email) DO NOTHING`)
      .bind(input.id, email, now, input.id, email, email, now-3_600_000)
    : db.prepare(`DELETE FROM forum_likes WHERE entry_id=? AND user_email=?
        AND EXISTS(SELECT 1 FROM forum_entries WHERE id=? AND parent_id IS NULL AND status='published')
        AND NOT EXISTS(SELECT 1 FROM forum_profiles WHERE user_email=? AND blocked=1)`)
      .bind(input.id, email, input.id, email);
  // Atomic batch returns the state of this write before another action can intervene.
  const result = await db.batch<LikeRow>([mutation, db.prepare(stateQuery).bind(email, email, input.id)]);
  const row = result[1].results[0];
  if (!row) throw new ForumError('missing', 404);
  if (row.blocked) throw new ForumError('blocked', 403);
  if (input.liked && !row.liked) throw new ForumError('rate', 429);
  return {likes: row.likes, liked: Boolean(row.liked)};
}
