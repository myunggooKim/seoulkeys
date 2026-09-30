import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

test("the smaller hand guide preserves all visible pixels, alpha and dimensions", async () => {
  const original = await readFile(new URL("../public/images/typing-hands-v2.png", import.meta.url));
  const optimized = await readFile(new URL("../public/images/typing-hands-v2-lossless.webp", import.meta.url));
  assert.ok(optimized.length < original.length * 0.65);
  const [before, after] = await Promise.all([
    sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(optimized).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  assert.deepEqual(after.info, before.info);
  for (let offset = 0; offset < before.data.length; offset += 4) {
    assert.equal(after.data[offset + 3], before.data[offset + 3]);
    if (before.data[offset + 3] === 0) continue;
    assert.ok(before.data.subarray(offset, offset + 3).equals(after.data.subarray(offset, offset + 3)));
  }
});

test("3D rendering is lazy, keeps the original fallback and never duplicates masked photographs", async () => {
  const [layout, page, guide, css, scene] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/HandGuide.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/hand-guide-scene.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(layout + page, /typing-hands-v2/);
  assert.match(page, /<HandGuide finger=\{displayedFinger\}/);
  assert.match(guide, /import\("\.\/hand-guide-scene"\)/);
  assert.match(guide, /IntersectionObserver/);
  assert.match(guide, /hand-guide-fallback/);
  assert.doesNotMatch(guide, /clip-path|<svg/);
  assert.match(css, /\.hand-guide-art\.is-ready \.hand-guide-fallback/);
  assert.match(css, /\.keyboard-map\.has-3d-guide \.hand-overlay \{ position: relative; inset: auto; height: 160px; margin-block-start: 8px;/);
  assert.match(scene, /1000 \/ 30/);
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /renderer\.dispose\(\)/);
  assert.match(scene, /geometry\.dispose\(\)/);
  assert.match(scene, /document\.removeEventListener\("visibilitychange"/);
  assert.doesNotMatch(scene, /fetch\(|keydown|keyup|localStorage/);
});
