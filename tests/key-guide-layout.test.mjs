import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("upcoming keys retain seven-slot sizing but grow to fit full modifier labels", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.key-guide \{[^}]*display: flex;[^}]*flex-wrap: wrap;/s);
  assert.match(css, /\.key-guide kbd \{[^}]*flex: 0 0 calc\(\(100% - 24px\) \/ 7\);[^}]*min-width: max-content;/s);
  assert.match(css, /\.key-guide kbd small \{[^}]*white-space: nowrap;/s);
  assert.doesNotMatch(css, /\.key-guide \{[^}]*repeat\(7, minmax\(0, 1fr\)\)/s);
});

test("space remains an upcoming key tile rather than a full-width or truncated row", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const rules = css.match(/\.key-guide kbd\.key-space(?: small)? \{[^}]*\}/g)?.join("\n");
  assert.ok(rules);
  assert.match(rules, /width: auto !important;/);
  assert.doesNotMatch(rules, /width: 100%|overflow: hidden|text-overflow: ellipsis/);
});

test("the label fix does not replace the layout-aware shifted-key sequence or mode controls", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /return key\.shift \? `Shift\+\$\{legend\}` : legend;/);
  assert.match(page, /practiceSequence\.slice\(guideStep, guideStep \+ 7\)/);
  assert.match(page, /<small>\{practiceKeyLegend\(keyboardLayout, key\)\}<\/small>/);
});
