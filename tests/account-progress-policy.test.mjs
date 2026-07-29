import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  classifySignIn,
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
