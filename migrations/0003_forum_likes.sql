-- Isolated, additive reactions. No existing application tables are changed.
CREATE TABLE IF NOT EXISTS forum_likes (
  entry_id TEXT NOT NULL REFERENCES forum_entries(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (entry_id, user_email)
);
CREATE INDEX IF NOT EXISTS forum_likes_member_time ON forum_likes(user_email, created_at);
