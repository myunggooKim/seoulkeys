-- Additive only: no changes to accounts, progress, classes, or presence.
CREATE TABLE IF NOT EXISTS forum_profiles (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  alias TEXT NOT NULL,
  blocked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS forum_entries (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES forum_entries(id),
  author_id TEXT NOT NULL,
  author_alias TEXT NOT NULL,
  language TEXT NOT NULL,
  tag TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published','hidden','deleted')),
  created_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS forum_feed ON forum_entries(parent_id, status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS forum_author_rate ON forum_entries(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS forum_global_rate ON forum_entries(created_at DESC);
CREATE TABLE IF NOT EXISTS forum_reports (
  entry_id TEXT NOT NULL REFERENCES forum_entries(id),
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(entry_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS forum_report_rate ON forum_reports(reporter_id, created_at DESC);
CREATE TABLE IF NOT EXISTS forum_moderation (
  id TEXT PRIMARY KEY,
  actor_email TEXT NOT NULL,
  entry_id TEXT,
  action TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS forum_translations (
  entry_id TEXT NOT NULL REFERENCES forum_entries(id),
  revision INTEGER NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','ready','failed')),
  request_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  PRIMARY KEY(entry_id, revision, language)
);
-- Reservations are never refunded: even a timeout might have been billed.
CREATE TABLE IF NOT EXISTS forum_translation_budget (
  month TEXT PRIMARY KEY,
  reserved_krw INTEGER NOT NULL DEFAULT 0 CHECK(reserved_krw BETWEEN 0 AND 10000)
);
CREATE TABLE IF NOT EXISTS forum_translation_reservations (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS forum_translation_rate ON forum_translation_reservations(requester_id, created_at DESC);
INSERT OR IGNORE INTO forum_entries(id, author_id, author_alias, language, tag, title, body, created_at)
VALUES ('welcome', 'operator', 'Seoul Keys', 'en', 'notice',
  'Welcome. Let’s learn Hangul together.',
  'Hello, I’m the person building and running Seoul Keys. Thank you for finding this small service, wherever you are in the world.\n\nMy goal is simple: anyone should be able to learn Hangul and practise Korean typing without getting stuck on keyboard setup or an unfamiliar language. Fast, reliable practice comes first.\n\nI also want this to become a place where you do not have to learn alone. Ask about a confusing letter, tell us what is difficult, celebrate your first sentence, or just say hello. You may write in the language you are comfortable with. You do not need perfect Korean.\n\nOur direction\n1. Keep improving the first practice session, keyboard guidance, and learning explanations.\n2. Build one welcoming community across countries and languages, rather than isolated rooms.\n3. Translate conversations with the original always available, while keeping Hangul examples intact and costs under control.\n4. Let real learner feedback guide the next improvements. These are priorities, not promised release dates.\n\nThis community is starting small. Please be kind to beginners, do not post personal details, and report spam or harassment. Automated translations can be wrong; check the original when the meaning matters.\n\nWhat was the hardest part of learning Hangul for you? I would love to hear about it.\n\n— Seoul Keys operator',
  CAST(strftime('%s','now') AS INTEGER) * 1000);
-- SQLite string literals do not interpret backslash escapes.
UPDATE forum_entries SET body=replace(body, '\n', char(10)) WHERE id='welcome' AND author_id='operator';
