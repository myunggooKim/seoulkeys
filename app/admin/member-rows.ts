import type { OwnerActivityRow } from "../../db/owner-activity";
import { practiceCurriculum } from "../practice-curriculum";

/**
 * Turns a database row into the row the owner actually reads.
 *
 * Everything the table sorts on is worked out here, on the server, for two
 * reasons. The curriculum is a large module and the country-name table lives in
 * Intl — neither belongs in the browser bundle just to label a column. And a
 * sort is only trustworthy if it orders the same value the cell displays: doing
 * it twice, once for display and once for comparison, is how a column ends up
 * sorted by something other than what you can see.
 */
export type MemberRow = {
  email: string;
  displayName: string;
  country: string;
  countryName: string;
  isTeacher: boolean;
  /** Position in the curriculum, for sorting; null when they never started. */
  stageIndex: number | null;
  stageLabel: string;
  completed: number;
  totalSentences: number | null;
  typingSeconds: number;
  accuracy: number | null;
  streakDays: number;
  longestStreak: number;
  totalVisits: number;
  loginCount: number;
  ownedClasses: number;
  ownedClassNames: string;
  className: string;
  /** True when the account is in the state the console flags: a teacher with no
   *  class, or a learner in none. */
  classMissing: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  /** Days since the last sign-in, or null if never. */
  idleDays: number | null;
};

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["ko"], { type: "region" });
  } catch {
    return null;
  }
})();

export function countryName(code: string) {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  const upper = code.toUpperCase();
  const name = regionNames?.of(upper);
  return name && name !== upper ? name : upper;
}

function timestampOf(value: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value.replace(" ", "T"));
  return Number.isNaN(parsed) ? null : parsed;
}

export function daysAgo(value: string | null) {
  const then = timestampOf(value);
  if (then === null) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

/** Where the learner is, named the way the practice card names it. */
function stageLabelOf(currentLesson: number | null, totalSentences: number | null) {
  if (currentLesson === null) return "시작 전";
  const item = practiceCurriculum[Math.min(currentLesson, practiceCurriculum.length - 1)];
  const label = item ? `${item.stageKo} ${currentLesson + 1}` : `${currentLesson + 1}`;
  // An account still carrying an older, shorter curriculum would otherwise look
  // further along than it is.
  const stale = totalSentences !== null && totalSentences !== practiceCurriculum.length;
  return stale ? `${label} (구 커리큘럼 ${totalSentences})` : label;
}

export function isTeacherRow(row: OwnerActivityRow) {
  return row.role === "teacher" || row.role === "org_admin" || row.ownedClasses > 0;
}

export function toMemberRow(row: OwnerActivityRow): MemberRow {
  const isTeacher = isTeacherRow(row);
  return {
    email: row.email,
    displayName: row.displayName,
    country: row.country,
    countryName: countryName(row.country),
    isTeacher,
    stageIndex: row.currentLesson,
    stageLabel: stageLabelOf(row.currentLesson, row.totalSentences),
    completed: row.completedSentences ?? 0,
    totalSentences: row.totalSentences,
    typingSeconds: row.typingSeconds ?? 0,
    accuracy: row.accuracy,
    streakDays: row.streakDays,
    longestStreak: row.longestStreak,
    totalVisits: row.totalVisits,
    loginCount: row.loginCount,
    ownedClasses: row.ownedClasses,
    ownedClassNames: row.ownedClassNames ?? "",
    className: row.className ?? "",
    classMissing: isTeacher ? row.ownedClasses === 0 : !row.className,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt,
    idleDays: daysAgo(row.lastLoginAt ?? row.createdAt),
  };
}

export function toMemberRows(rows: OwnerActivityRow[]): MemberRow[] {
  return rows.map(toMemberRow);
}
