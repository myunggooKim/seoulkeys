CREATE TABLE IF NOT EXISTS community_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_visits INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
  country_count INTEGER NOT NULL DEFAULT 0 CHECK (country_count >= 0),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS community_countries (
  country TEXT PRIMARY KEY NOT NULL CHECK (length(country) = 2)
);

CREATE TRIGGER IF NOT EXISTS community_stats_after_country_insert
AFTER INSERT ON community_countries
BEGIN
  UPDATE community_stats
  SET country_count = country_count + 1, updated_at = unixepoch()
  WHERE id = 1;
END;

CREATE TRIGGER IF NOT EXISTS community_stats_after_visitor_insert
AFTER INSERT ON visitors
BEGIN
  UPDATE community_stats
  SET total_visits = total_visits + 1, updated_at = unixepoch()
  WHERE id = 1;
  INSERT OR IGNORE INTO community_countries(country)
  SELECT NEW.country WHERE length(NEW.country) = 2;
END;

CREATE TRIGGER IF NOT EXISTS community_stats_after_visitor_country_update
AFTER UPDATE OF country ON visitors
WHEN NEW.country <> OLD.country AND length(NEW.country) = 2
BEGIN
  INSERT OR IGNORE INTO community_countries(country) VALUES (NEW.country);
END;

INSERT OR IGNORE INTO community_countries(country)
SELECT country FROM visitor_baseline_countries WHERE length(country) = 2;

INSERT OR IGNORE INTO community_countries(country)
SELECT country FROM visitors WHERE length(country) = 2;

INSERT INTO community_stats(id, total_visits, country_count, updated_at)
VALUES (
  1,
  COALESCE((SELECT value FROM visitor_baseline WHERE metric = 'visits'), 0)
    + (SELECT COUNT(*) FROM visitors),
  (SELECT COUNT(*) FROM community_countries),
  unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  total_visits = excluded.total_visits,
  country_count = excluded.country_count,
  updated_at = excluded.updated_at;
