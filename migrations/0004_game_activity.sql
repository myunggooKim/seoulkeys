-- Independent analytics only: existing progress, scores, users, and forum stay intact.
CREATE TABLE IF NOT EXISTS game_activity (
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  game_id TEXT NOT NULL CHECK(game_id IN ('falling-words', 'missing-letter', 'crossword')),
  active_seconds INTEGER NOT NULL CHECK(active_seconds BETWEEN 1 AND 60),
  last_played_at INTEGER NOT NULL,
  received_at INTEGER NOT NULL,
  counted INTEGER NOT NULL DEFAULT 0 CHECK(counted IN (0, 1)),
  PRIMARY KEY(user_email, batch_id)
);
CREATE INDEX IF NOT EXISTS game_activity_member_received ON game_activity(user_email, received_at);
CREATE INDEX IF NOT EXISTS game_activity_received ON game_activity(received_at);

-- Only three aggregate rows per account persist long term. Individual batches
-- are short-lived deduplication/rate-limit receipts, never gameplay history.
CREATE TABLE IF NOT EXISTS game_activity_totals (
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  game_id TEXT NOT NULL CHECK(game_id IN ('falling-words', 'missing-letter', 'crossword')),
  active_seconds INTEGER NOT NULL DEFAULT 0 CHECK(active_seconds >= 0),
  last_played_at INTEGER NOT NULL,
  PRIMARY KEY(user_email, game_id)
);
