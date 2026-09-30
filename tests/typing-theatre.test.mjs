import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { supportedLocaleCodes } from "../app/locale-detection.ts";
import { typingViewCopy } from "../app/typing-view-copy.ts";

test("basic is the default and changing views never remounts or replaces the shared input", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /useState<"basic" \| "theatre">\("basic"\)/);
  assert.equal((page.match(/id="hero-typing-input"/g) ?? []).length, 1);
  assert.match(page, /<TypingTheatre state=\{\{ started: lessonStarted, paused: lessonPaused, code: activePracticeKey\?\.code/);
  assert.match(page, /const restoreBasicView = useCallback\(\(\) => \{ setTheatreUnavailable\(true\); setPracticeView\("basic"\); \}, \[\]\)/);
  assert.doesNotMatch(page, /<HangulInput[^>]*key=\{practiceView\}/s);
  assert.doesNotMatch(page, /Ⅱ|↻ 다시 연습/);
  assert.match(page, /tr\(locale, "Pause", "일시정지"\)/);
  assert.match(page, /tr\(locale, "Resume", "계속하기"\)/);
});

test("every supported language has explicit view and clear-input labels", () => {
  for (const locale of supportedLocaleCodes) {
    const copy = typingViewCopy(locale);
    for (const label of Object.values(copy)) assert.ok(label.trim().length > 0, locale);
    assert.notEqual(copy.basic, copy.theatre);
  }
  assert.equal(typingViewCopy("ko").clear, "다시 입력");
  assert.equal(typingViewCopy("es").theatre, "Teatro");
});

test("optional 3D is lazy, self-hosted, disposable and cannot mutate typing or stored progress", async () => {
  const [component, scene, rig, license] = await Promise.all([
    readFile(new URL("../app/TypingTheatre.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/cinema-scene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/cinema-hand-rig.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/images/typing-theatre/LICENSE.txt", import.meta.url), "utf8"),
  ]);
  assert.match(component, /import\("\.\/cinema-scene"\)/);
  assert.match(component, /if \(disposed\) \{ instance\.dispose\(\); return; \}/);
  assert.match(component, /\.catch\(fail\)/);
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /IntersectionObserver/);
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /renderer\.dispose\(\)/);
  assert.match(rig, /\/images\/typing-theatre\/\$\{side\}\.glb/);
  assert.match(license, /MIT License/);
  assert.doesNotMatch(component + scene + rig, /localStorage|keydown|keyup|\/api\/|https:\/\//);
});
