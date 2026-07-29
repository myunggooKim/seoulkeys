import { sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { getAdminUser } from "../../../admin-auth";

export const dynamic = "force-dynamic";

/**
 * Aggregate member counts for the owner. Deliberately aggregate-only: it returns
 * counts per country and per account type, never individual members' emails or
 * locations.
 */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Not authorised" }, { status: 403 });

  try {
    const db = getDb();

    // A teacher is anyone flagged as one, or anyone who has actually opened a
    // class — the second condition is what the owner asked to count.
    const rows = await db.all<{ country: string; kind: string; total: number }>(sql`
      SELECT
        COALESCE(NULLIF(u.country, ''), '??') AS country,
        CASE
          WHEN u.role IN ('teacher', 'org_admin') THEN 'teacher'
          WHEN EXISTS (SELECT 1 FROM classes c WHERE c.teacher_email = u.email) THEN 'teacher'
          ELSE 'learner'
        END AS kind,
        COUNT(*) AS total
      FROM users u
      GROUP BY country, kind
    `);

    const byCountry = new Map<string, { country: string; teachers: number; learners: number; total: number }>();
    let teachers = 0;
    let learners = 0;

    for (const row of rows) {
      const entry = byCountry.get(row.country)
        ?? { country: row.country, teachers: 0, learners: 0, total: 0 };
      const count = Number(row.total) || 0;
      if (row.kind === "teacher") { entry.teachers += count; teachers += count; }
      else { entry.learners += count; learners += count; }
      entry.total += count;
      byCountry.set(row.country, entry);
    }

    const countries = [...byCountry.values()].sort((a, b) => b.total - a.total || a.country.localeCompare(b.country));

    return Response.json(
      { total: teachers + learners, teachers, learners, countries },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load members" },
      { status: 500 },
    );
  }
}
