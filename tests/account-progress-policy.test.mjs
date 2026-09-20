import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  classifySignIn,
  googleSubjectHasDifferentOwner,
  normalizeAccountEmail,
  resolveMemberRole,
} from "../app/account-policy.ts";
import { validateProgressUpdate } from "../db/progress-validation.ts";

const storedProgress = {
  currentLesson: 3,
  completedSentences: 3,
  totalSentences: 47,
  typingSeconds: 120,
  accuracy: 94,
  lessonFinished: false,
  awardedXp: 300,
};

test("distinguishes first signup from a returning Google member", () => {
  assert.equal(classifySignIn(false), "signup");
  assert.equal(classifySignIn(true), "returning");
  assert.equal(normalizeAccountEmail("  Learner@Example.COM "), "learner@example.com");
});

test("repairs a stale Google subject only for the same verified email", () => {
  assert.equal(googleSubjectHasDifferentOwner(undefined, "learner@example.com"), false);
  assert.equal(googleSubjectHasDifferentOwner("Learner@Example.com", "learner@example.com"), false);
  assert.equal(googleSubjectHasDifferentOwner("other@example.com", "learner@example.com"), true);
});

test("a returning learner cannot self-promote by editing the requested role", () => {
  assert.equal(resolveMemberRole("student", "teacher"), "student");
  assert.equal(resolveMemberRole("teacher", "student"), "teacher");
  assert.equal(resolveMemberRole("org_admin", "student"), "teacher");
  assert.equal(resolveMemberRole(null, "teacher"), "teacher");
});

test("one forged progress request can advance at most one curriculum step", () => {
  const validated = validateProgressUpdate(storedProgress, {
    currentLesson: 999,
    completedSentences: 1_000_000,
    totalSentences: 1_000_000,
    typingSeconds: 1_000_000_000,
    accuracy: 999,
    lessonFinished: true,
  });

  assert.equal(validated.totalSentences, 200);
  assert.equal(validated.completedSentences, 4);
  assert.equal(validated.currentLesson, 199);
  assert.equal(validated.accuracy, 100);
  assert.equal(validated.lessonFinished, false);
  assert.equal(validated.xpDelta, 100);
  assert.equal(validated.typingSeconds, storedProgress.typingSeconds + 21_600);
});

test("lesson completion bonus is awarded only when the final step is stored", () => {
  const validated = validateProgressUpdate({
    ...storedProgress,
    currentLesson: 45,
    completedSentences: 46,
    awardedXp: 4_600,
  }, {
    currentLesson: 46,
    completedSentences: 47,
    totalSentences: 47,
    typingSeconds: 300,
    accuracy: 96,
    lessonFinished: true,
  });

  assert.equal(validated.completedSentences, 47);
  assert.equal(validated.lessonFinished, true);
  assert.equal(validated.xpDelta, 600);
});

test("public request headers are not accepted as application identity", async () => {
  const authSource = await readFile(new URL("../app/google-auth.ts", import.meta.url), "utf8");
  assert.doesNotMatch(authSource, /get\("oai-authenticated-user-email"\)/);
  assert.match(authSource, /return readSessionValue/);
});

test("assignment APIs use the persisted email-based ownership model", async () => {
  const [teacherRoute, studentRoute, schema] = await Promise.all([
    readFile(new URL("../app/api/teacher/assignment/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/student/assignment/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);

  assert.match(teacherRoute, /classes\.teacherEmail/);
  assert.match(teacherRoute, /eq\(classes\.teacherEmail, auth\.identity\.email\)/);
  assert.doesNotMatch(teacherRoute, /teacherUserId|user\.id/);
  assert.match(studentRoute, /assignmentSubmissions\.studentEmail/);
  assert.match(studentRoute, /eq\(assignments\.classId, auth\.member\.classId\)/);
  assert.doesNotMatch(studentRoute, /studentUserId|completedAt/);
  assert.match(schema, /category: text\("category"\)/);
  assert.match(schema, /content: text\("content"\)/);
});

// Every account in production reported 100% accuracy. The value posted to
// /api/progress was the live accuracy of the input box, and the sync fires just
// after a line is accepted — when the box has been cleared, so the expression
// short-circuited to 100 on every write. The teacher dashboard's accuracy column
// and the class average built from it therefore carried no information.
test("progress sync stores accuracy earned on graded attempts, not the empty input box", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  // The payload must not post the bare live-input `accuracy` any more.
  assert.doesNotMatch(page, /typingSeconds: totalPracticeSecondsRef\.current \+ elapsedSeconds,\s*\n\s*accuracy,/);
  assert.match(page, /accuracy: gradedAccuracyRef\.current\.count > 0/);
  assert.match(page, /gradedAccuracyRef\.current\.sum \/ gradedAccuracyRef\.current\.count/);

  // And a graded attempt has to be what feeds it.
  assert.match(page, /const advanceLesson = useCallback\(\(attemptAccuracy: number[\s\S]{0,320}?gradedAccuracyRef\.current = \{/);
  assert.match(page, /sum: gradedAccuracyRef\.current\.sum \+ attemptAccuracy/);
});

// class_summary.avg_accuracy is written once as 100 when a class is created and
// never updated, so the `??` fallback that computed the real figure was dead code
// and every class reported a perfect average for ever.
test("class average accuracy is computed from students, never read from the stale summary row", async () => {
  const route = await readFile(new URL("../app/api/teacher/class/route.ts", import.meta.url), "utf8");
  assert.doesNotMatch(route, /avgAccuracy: summary\?\.avgAccuracy/);
  assert.match(route, /const avgAccuracy = studentReports\.length/);
  assert.match(route, /studentReports\.reduce\(\(total, s\) => total \+ s\.accuracy, 0\) \/ studentReports\.length/);
});

// Nothing in the app linked to /join, so a learner who signed up on their own
// could never enter a teacher's invite code; both real learners ended up in no
// class at all. The teacher link is likewise pointless for a learner — it only
// leads to a refusal screen.
test("learners without a class are offered the invite-code entry, and only teachers see the portal link", async () => {
  const client = await readFile(new URL("../app/my/MyLearningClient.tsx", import.meta.url), "utf8");
  assert.match(client, /\{!hasClass && !isTeacher && \(/);
  assert.match(client, /href="\/join"/);
  assert.match(client, /\{isTeacher && <Link href="\/teacher">/);

  const page = await readFile(new URL("../app/my/page.tsx", import.meta.url), "utf8");
  assert.match(page, /hasClass=\{Boolean\(user\.classId\)\}/);
  assert.match(page, /isTeacher=\{user\.role === "teacher" \|\| user\.role === "org_admin"\}/);
});
