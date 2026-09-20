import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const migrationUrl = new URL("../migrations/0001_community_pulse_rollup.sql", import.meta.url);

function createLegacyDatabase() {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE visitors (
      visitor_id TEXT PRIMARY KEY,
      country TEXT NOT NULL DEFAULT '',
      first_seen INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      beats INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE visitor_baseline (metric TEXT PRIMARY KEY, value INTEGER NOT NULL);
    CREATE TABLE visitor_baseline_countries (country TEXT PRIMARY KEY);
    CREATE TABLE presence (visitor_id TEXT PRIMARY KEY, country TEXT NOT NULL, seen_at INTEGER NOT NULL);
    INSERT INTO visitor_baseline(metric, value) VALUES ('visits', 42);
    INSERT INTO visitor_baseline_countries(country) VALUES ('KR'), ('US');
    INSERT INTO visitors(visitor_id, country, first_seen, last_seen, beats)
    VALUES ('existing-1', 'KR', 1, 1, 1), ('existing-2', 'JP', 1, 1, 1);
  `);
  return database;
}

test("community pulse migration backfills and maintains exact counters", async () => {
  const migration = await readFile(migrationUrl, "utf8");
  const database = createLegacyDatabase();
  database.exec(migration);

  assert.deepEqual(
    { ...database.prepare("SELECT total_visits, country_count FROM community_stats WHERE id = 1").get() },
    { total_visits: 44, country_count: 3 },
  );

  database.exec(`
    INSERT INTO visitors(visitor_id, country, first_seen, last_seen, beats)
    VALUES ('existing-1', 'KR', 1, 2, 2)
    ON CONFLICT(visitor_id) DO UPDATE SET last_seen = 2, beats = beats + 1;
  `);
  assert.equal(database.prepare("SELECT total_visits FROM community_stats WHERE id = 1").get().total_visits, 44);

  database.exec("INSERT INTO visitors(visitor_id, country, first_seen, last_seen) VALUES ('new-1', 'KR', 2, 2)");
  assert.deepEqual(
    { ...database.prepare("SELECT total_visits, country_count FROM community_stats WHERE id = 1").get() },
    { total_visits: 45, country_count: 3 },
  );

  database.exec("INSERT INTO visitors(visitor_id, country, first_seen, last_seen) VALUES ('new-2', '', 2, 2)");
  database.exec("UPDATE visitors SET country = 'FR' WHERE visitor_id = 'new-2'");
  assert.deepEqual(
    { ...database.prepare("SELECT total_visits, country_count FROM community_stats WHERE id = 1").get() },
    { total_visits: 46, country_count: 4 },
  );

  database.exec(migration);
  assert.deepEqual(
    { ...database.prepare("SELECT total_visits, country_count FROM community_stats WHERE id = 1").get() },
    { total_visits: 46, country_count: 4 },
  );
  database.close();
});

test("pulse reads only the rollup and visible tabs poll once a minute", async () => {
  const [route, component] = await Promise.all([
    readFile(new URL("../app/api/pulse/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/CommunityPulse.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(route, /FROM community_stats/);
  assert.doesNotMatch(route, /FROM (visitors|learning_progress|daily_visits)/);
  assert.match(component, /const POLL_MS = 60_000/);
  assert.match(component, /const read = \(\) => \{\s*if \(document\.visibilityState !== "visible"\) return;/);
});
