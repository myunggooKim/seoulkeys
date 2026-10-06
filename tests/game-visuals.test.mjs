import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import postcss from "postcss";

const css = postcss.parse(await readFile(new URL("../app/game-visuals.css", import.meta.url), "utf8"));

test("game presentation cannot override unrelated page layouts or hide game controls", () => {
  css.walkRules((rule) => {
    if (rule.parent.type === "atrule" && rule.parent.name === "keyframes") return;
    for (const selector of rule.selectors) {
      assert.match(selector, /\.(?:word-rain-game|crossword-game-wrap)\b/, selector);
    }
    rule.walkDecls((declaration) => {
      assert.notEqual(declaration.prop, "display", "Keep the existing game control layout");
      if (declaration.prop === "pointer-events") assert.match(rule.selector, /defense-atmosphere/);
    });
  });
});

test("game visuals offer motion reduction and preserve a flat mobile board", () => {
  const media = [];
  css.walkAtRules("media", (rule) => media.push(rule));
  const reduced = media.find((rule) => rule.params === "(prefers-reduced-motion: reduce)");
  assert.ok(reduced);
  assert.ok(reduced.nodes.some((rule) => rule.nodes?.some((d) => d.prop === "animation" && d.value === "none" && d.important)));
  const mobile = media.find((rule) => rule.params === "(max-width: 760px)");
  assert.ok(mobile.nodes.some((rule) => rule.selector?.includes(".crossword-grid") && rule.nodes.some((d) => d.prop === "transform" && d.value === "none")));
});
