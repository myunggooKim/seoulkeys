import assert from "node:assert/strict";
import test from "node:test";

import { evaluateLessonAttempt } from "../app/lesson-evaluation.ts";

test("requires the final period and Enter evaluation", () => {
  const result = evaluateLessonAttempt("저는 음악을 좋아해요", "저는 음악을 좋아해요.", 11, 0);
  assert.equal(result.accepted, false);
  assert.equal(result.completeness, 99);
  assert.match(result.message, /마침표까지 입력한 뒤 Enter/);
});

test("returns a scored result only for an exact sentence", () => {
  const result = evaluateLessonAttempt("저는 음악을 좋아해요.", "저는 음악을 좋아해요.", 14, 1);
  assert.equal(result.accepted, true);
  assert.equal(result.completeness, 100);
  assert.equal(result.accuracy, 93);
  assert.equal(result.label, "Great Rhythm");
});
