import { ForumError, type ForumEntry, type ForumViewer, validatePost, validId, textField } from '../app/community/model';

// A separate, explicitly selected schema keeps existing Drizzle models untouched.
const publicFields = 'id,parent_id,author_id,author_alias,language,tag,title,body,created_at,revision';
export async function forumViewer(db: D1Database, email: string | null, moderator: boolean): Promise<ForumViewer> {
  const profile = email ? await db.prepare('SELECT id,alias FROM forum_profiles WHERE user_email=?').bind(email).first<{id: string; alias: string}>() : null;
  return { authorId: profile?.id ?? null, alias: profile?.alias ?? '', moderator };
}
async function profileForWrite(db: D1Database, email: string, alias: string) {
  const profile = await db.prepare('SELECT id,blocked FROM forum_profiles WHERE user_email=?').bind(email).first<{id: string; blocked: number}>();
  if (profile?.blocked) throw new ForumError('blocked', 403);
  if (profile) return profile.id;
  await db.prepare('INSERT OR IGNORE INTO forum_profiles(id,user_email,alias,created_at) VALUES(?,?,?,?)')
    .bind(crypto.randomUUID(), email, alias, Date.now()).run();
  const created = await db.prepare('SELECT id,blocked FROM forum_profiles WHERE user_email=?').bind(email).first<{id: string; blocked: number}>();
  if (!created || created.blocked) throw new ForumError('blocked', 403);
  return created.id;
}
export async function readFeed(db: D1Database, tag: string | null, before: string | null, email: string | null = null) {
  if (tag && !['question','struggle','win','chat'].includes(tag)) throw new ForumError('invalid');
  const cursor = before?.split(':');
  if (cursor && (cursor.length !== 2 || !/^\d{1,16}$/.test(cursor[0]) || !validId(cursor[1]))) throw new ForumError('invalid');
  const time = cursor ? Number(cursor[0]) : Number.MAX_SAFE_INTEGER;
  const lastId = cursor?.[1] ?? '~';
  const { results } = await db.prepare(`SELECT ${publicFields},
    (SELECT COUNT(*) FROM forum_entries c WHERE c.parent_id=p.id AND c.status='published') AS replies,
    (SELECT COUNT(*) FROM forum_likes l WHERE l.entry_id=p.id) AS likes,
    EXISTS(SELECT 1 FROM forum_likes l WHERE l.entry_id=p.id AND l.user_email=?) AS liked
    FROM forum_entries p WHERE parent_id IS NULL AND status='published' AND id!='welcome'
    AND (? IS NULL OR tag=?) AND (created_at<? OR (created_at=? AND id<?))
    ORDER BY created_at DESC,id DESC LIMIT 21`).bind(email, tag, tag, time, time, lastId).all<ForumEntry>();
  const entries = results.slice(0,20).map(entry=>({...entry,liked:Boolean(entry.liked)})); const last = entries.at(-1);
  return { entries, next: results.length > 20 && last ? `${last.created_at}:${last.id}` : null };
}
export async function readThread(db: D1Database, id: string, before: string | null = null, email: string | null = null) {
  if (!validId(id)) throw new ForumError('missing', 404);
  const post = await db.prepare(`SELECT ${publicFields},
    (SELECT COUNT(*) FROM forum_likes l WHERE l.entry_id=p.id) AS likes,
    EXISTS(SELECT 1 FROM forum_likes l WHERE l.entry_id=p.id AND l.user_email=?) AS liked
    FROM forum_entries p WHERE id=? AND parent_id IS NULL AND status='published'`).bind(email,id).first<ForumEntry>();
  if (!post) throw new ForumError('missing', 404);
  const cursor = before?.split(':');
  if (cursor && (cursor.length !== 2 || !/^\d{1,16}$/.test(cursor[0]) || !validId(cursor[1]))) throw new ForumError('invalid');
  const time = cursor ? Number(cursor[0]) : Number.MAX_SAFE_INTEGER;
  const { results } = await db.prepare(`SELECT ${publicFields} FROM forum_entries WHERE parent_id=? AND status='published'
    AND (created_at<? OR (created_at=? AND id<?)) ORDER BY created_at DESC,id DESC LIMIT 41`)
    .bind(id, time, time, cursor?.[1] ?? '~').all<ForumEntry>();
  const comments = results.slice(0,40); const last = comments.at(-1);
  return { post: {...post,liked:Boolean(post.liked)}, comments, next: results.length > 40 && last ? `${last.created_at}:${last.id}` : null };
}
export async function createEntry(db: D1Database, email: string, input: Record<string, unknown>, now = Date.now()) {
  const post = validatePost(input); const author = await profileForWrite(db, email, post.alias);
  if (post.parentId && !await db.prepare("SELECT id FROM forum_entries WHERE id=? AND parent_id IS NULL AND status='published'").bind(post.parentId).first()) throw new ForumError('missing',404);
  // Rate checks and insertion are ONE SQL operation: concurrent requests cannot bypass limits.
  const result = await db.prepare(`INSERT INTO forum_entries(id,parent_id,author_id,author_alias,language,tag,title,body,created_at)
    SELECT ?,?,?,?,?,?,?,?,? WHERE
    (SELECT blocked FROM forum_profiles WHERE id=?)=0
    AND (SELECT COUNT(*) FROM forum_entries WHERE author_id=? AND created_at>?)<5
    AND (SELECT COUNT(*) FROM forum_entries WHERE author_id=? AND created_at>?)<20
    AND (SELECT COUNT(*) FROM forum_entries WHERE created_at>?)<100
    AND NOT EXISTS(SELECT 1 FROM forum_entries WHERE author_id=? AND body=? AND created_at>?)
    ON CONFLICT(id) DO NOTHING`).bind(post.id, post.parentId, author, post.alias, post.language, post.tag, post.title, post.body, now,
      author, author, now-3_600_000, author, now-86_400_000, now-3_600_000, author, post.body, now-60_000).run();
  if (!result.meta.changes) {
    const existing = await db.prepare('SELECT id FROM forum_entries WHERE id=? AND author_id=?').bind(post.id,author).first();
    if (!existing) throw new ForumError('rate',429);
  }
  return { id: post.parentId ?? post.id };
}
export async function reportEntry(db: D1Database, email: string, input: Record<string, unknown>) {
  if (!validId(input.id)) throw new ForumError('invalid');
  const reason = textField(input.reason,300,3); const now = Date.now();
  // Reports need no public nickname and never cause automatic takedowns.
  const result = await db.prepare(`INSERT OR IGNORE INTO forum_reports(entry_id,reporter_id,reason,created_at)
    SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM forum_entries WHERE id=? AND status='published')
    AND (SELECT COUNT(*) FROM forum_reports WHERE reporter_id=? AND created_at>?)<10`)
    .bind(input.id,email,reason,now,input.id,email,now-86_400_000).run();
  if (!result.meta.changes && !await db.prepare('SELECT entry_id FROM forum_reports WHERE entry_id=? AND reporter_id=?').bind(input.id,email).first()) throw new ForumError('rate',429);
  return { ok:true };
}
export async function removeOrModerate(db: D1Database, email: string, moderator: boolean, input: Record<string, unknown>) {
  if (!validId(input.id) || input.id==='welcome') throw new ForumError('invalid');
  if (input.action==='delete') {
    const result=await db.prepare(`UPDATE forum_entries SET status='deleted' WHERE id=?
      AND author_id=(SELECT id FROM forum_profiles WHERE user_email=?)`).bind(input.id,email).run();
    if (!result.meta.changes) throw new ForumError('forbidden',403);
  } else {
    if (!moderator) throw new ForumError('forbidden',403);
    if (!['hide','restore','block','unblock'].includes(String(input.action))) throw new ForumError('invalid');
    const action=String(input.action);
    const stmt=action==='block'||action==='unblock'
      ? db.prepare('UPDATE forum_profiles SET blocked=? WHERE id=(SELECT author_id FROM forum_entries WHERE id=?)').bind(action==='block'?1:0,input.id)
      : db.prepare('UPDATE forum_entries SET status=? WHERE id=?').bind(action==='hide'?'hidden':'published',input.id);
    await db.batch([stmt,db.prepare('INSERT INTO forum_moderation(id,actor_email,entry_id,action,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),email,input.id,action,Date.now())]);
  }
  return {ok:true};
}
export async function moderationQueue(db: D1Database) {
  const {results}=await db.prepare(`SELECT ${publicFields},status,
    (SELECT COUNT(*) FROM forum_reports r WHERE r.entry_id=e.id) AS reports,
    (SELECT group_concat(reason, char(10)) FROM (SELECT reason FROM forum_reports r WHERE r.entry_id=e.id LIMIT 5)) AS report_reasons,
    (SELECT blocked FROM forum_profiles WHERE id=e.author_id) AS blocked
    FROM forum_entries e WHERE status='hidden' OR EXISTS(SELECT 1 FROM forum_reports r WHERE r.entry_id=e.id)
    ORDER BY created_at DESC LIMIT 50`).all();
  return results;
}
