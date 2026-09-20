import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { warmupProgress, WARMUP_STEPS } from "../app/warmup.ts";

test("warmup accepts composed IME text and individual key sequences", () => {
  assert.equal(warmupProgress(WARMUP_STEPS[0], "거거").complete, true);
  assert.equal(warmupProgress("가", "ㄱㅏ").complete, true);
  assert.equal(warmupProgress("리라", "ㄹㅣㄹㅏ").complete, true);
});
test("warmup never passes missing, incorrect or surplus input", () => {
  for (const typed of ["", "ㄱ", "나", "가가", "가x"]) {
    assert.equal(warmupProgress("가", typed).complete, false);
  }
  assert.equal(warmupProgress("", "").complete, false);
  assert.equal(warmupProgress("가", "ㄱ").matched, 1);
});
test("warmup is isolated from saved progress and network calls", () => {
  const source = readFileSync(new URL("../app/FirstMinuteWarmup.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /fetch\(|localStorage|\/api\//);
  assert.match(source, /stopPropagation/);
});
test("teacher portal uses supported sign-in and displays request failures", () => {
  const source = readFileSync(new URL("../app/teacher/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /href="\/api\/auth\/google"/);
  assert.match(source, /<GoogleSignIn/);
  assert.match(source, /if \(!classRes.ok \|\| !asgnRes.ok\) setDashboardError\(true\)/);
  assert.match(source, /role="alert"/);
});
