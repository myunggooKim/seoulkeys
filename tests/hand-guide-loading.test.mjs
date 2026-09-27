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

test("the home preload, illustration and pressed-finger mask share one image", async () => {
  const [layout, page, css] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /if \(path === "\/"\) \{[\s\S]*?hands\.rel = "preload";[\s\S]*?hands\.href = "\/images\/typing-hands-v2-lossless\.webp";/);
  assert.equal((page.match(/src="\/images\/typing-hands-v2-lossless\.webp"/g) ?? []).length, 2);
  assert.match(page, /className="hand-rest-image"[^>]*fetchPriority="high"/);
  assert.equal((css.match(/mask: url\("\/images\/typing-hands-v2-lossless\.webp"\)/g) ?? []).length, 2);
  assert.doesNotMatch(page + css, /typing-hands-v2\.png/);
});
