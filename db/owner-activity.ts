import { sql } from "drizzle-orm";
import { getDb } from "./index";

/**
 * Per-account activity for the owner's own dashboard.
 *
 * The existing /api/admin/members endpoint is aggregate-only by design. This one
 * is deliberately not: the owner needs to see which specific account is stuck
 * where — the teacher who signed up and never opened a class, the learner who
 * typed for fifteen minutes and left — because that is what decides the next
 * thing to build. It stays behind the same owner-only guard.
 */
export type OwnerActivityRow = {
  email: string;
  displayName: string;
  role: string;
  country: string;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  streakDays: number;
  longestStreak: number;
  totalVisits: number;
  totalXp: number;
  currentLesson: number | null;
  completedSentences: number | null;
  totalSentences: number | null;
  typingSeconds: number | null;
  accuracy: number | null;
  lessonFinished: number | null;
  progressUpdatedAt: string | null;
  className: string | null;
  ownedClasses: number;
  ownedClassNames: string | null;
  recentVisits: string | null;
};

export async function listOwnerActivity(): Promise<OwnerActivityRow[]> {
  const db = getDb();
  return db.all<OwnerActivityRow>(sql`
    SELECT
      u.email,
      u.display_name       AS displayName,
      u.role,
      COALESCE(NULLIF(u.country, ''), '') AS country,
      u.created_at         AS createdAt,
      u.last_login_at      AS lastLoginAt,
      u.login_count        AS loginCount,
      u.streak_days        AS streakDays,
      u.longest_streak     AS longestStreak,
      u.total_visits       AS totalVisits,
      u.total_xp           AS totalXp,
      lp.current_lesson    AS currentLesson,
      lp.completed_sentences AS completedSentences,
      lp.total_sentences   AS totalSentences,
      lp.typing_seconds    AS typingSeconds,
      lp.accuracy          AS accuracy,
      lp.lesson_finished   AS lessonFinished,
      lp.updated_at        AS progressUpdatedAt,
      joined.class_name    AS className,
      (SELECT COUNT(*) FROM classes c WHERE c.teacher_email = u.email) AS ownedClasses,
      (SELECT GROUP_CONCAT(c.class_name, ' · ') FROM classes c WHERE c.teacher_email = u.email) AS ownedClassNames,
      (
        SELECT GROUP_CONCAT(d.visit_date, ' ')
        FROM (
          SELECT visit_date FROM daily_visits
          WHERE user_email = u.email
          ORDER BY visit_date DESC
          LIMIT 10
        ) d
      ) AS recentVisits
    FROM users u
    LEFT JOIN learning_progress lp ON lp.user_email = u.email
    LEFT JOIN classes joined ON joined.id = u.class_id
    ORDER BY COALESCE(u.last_login_at, u.created_at) DESC
  `);
}
