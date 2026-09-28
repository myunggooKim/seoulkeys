import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the member list optional while preserving its sorting controls", async () => {
  const source = await readFile(new URL("../app/admin/MemberTable.tsx", import.meta.url), "utf8");

  assert.match(source, /<details className=\{styles\.memberDisclosure\}>/);
  assert.match(source, /<summary className=\{styles\.disclosureSummary\}>/);
  assert.doesNotMatch(source, /<details className=\{styles\.memberDisclosure\} open>/);
  assert.match(source, /className="owner-sort-controls"/);
  assert.match(source, /className=\{styles\.listScroll\} role="region" aria-label="가입자 목록" tabIndex=\{0\}/);
  assert.match(source, /{grouped \? \(/);
});

test("bounds the member scroll area and pins both desktop and mobile column headers", async () => {
  const styles = await readFile(new URL("../app/admin/MemberTable.module.css", import.meta.url), "utf8");

  assert.match(styles, /\.listScroll\s*\{[^}]*max-height:\s*min\(62vh, 640px\);[^}]*overflow-y:\s*auto;/s);
  assert.match(styles, /\.table thead th\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/s);
  assert.match(styles, /\.mobileTable\s*\{\s*display:\s*none;/);
  assert.match(styles, /@media \(max-width: 640px\)\s*\{[\s\S]*\.mobileTable\s*\{\s*display:\s*table;/);
});
