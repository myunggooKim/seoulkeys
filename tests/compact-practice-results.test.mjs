import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("compact practice scores wrap without fixed minimum card widths or changing practice geometry", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const rules = css.slice(css.indexOf("/* Compact practice results only:"), css.indexOf(".inline-sound-control {"));
  assert.match(rules, /\.practice-card \.practice-workspace \.lesson-evaluation\.compact \{[^}]*grid-template-columns: minmax\(0, 1fr\);[^}]*max-width: 100%;[^}]*padding: 8px 10px;/s);
  assert.match(rules, /\.compact dl \{[^}]*display: flex;[^}]*flex-wrap: wrap;/s);
  assert.match(rules, /\.compact dl div \{[^}]*min-width: 0;[^}]*padding: 0;[^}]*border: 0;/s);
  assert.doesNotMatch(rules, /keyboard-map|practice-screen-stage|key-guide|daily-meter|\.practice-feedback-dock\s*\{/);
});

test("success explanation stays accessible, while correction text and retry remain unchanged", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /lesson-evaluation \$\{lessonEvaluation\.accepted \? "accepted" : "rejected"\} compact/);
  assert.match(page, /aria-live="assertive"/);
  assert.match(page, /!lessonEvaluation\.accepted && sentenceComplete && <button className="retry-practice"[^>]*onClick=\{resetCurrentPractice\}/);
  assert.match(css, /\.compact\.accepted p \{[^}]*clip-path: inset\(50%\);/s);
  assert.doesNotMatch(css, /\.compact(?:\.rejected)? p \{[^}]*(?:display: none|clip-path|overflow: hidden)/s);
});
