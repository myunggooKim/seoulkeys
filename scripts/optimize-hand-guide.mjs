import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const sourceUrl = new URL("../public/images/typing-hands-v2.png", import.meta.url);
const outputUrl = new URL("../public/images/typing-hands-v2-lossless.webp", import.meta.url);
const source = await readFile(sourceUrl);
const optimized = await sharp(source).webp({ lossless: true, effort: 6 }).toBuffer();
const originalMetadata = await sharp(source).metadata();
const optimizedMetadata = await sharp(optimized).metadata();
assert.equal(optimizedMetadata.width, originalMetadata.width);
assert.equal(optimizedMetadata.height, originalMetadata.height);
assert.ok(optimized.length < source.length, "The derivative must actually be smaller.");

// WebP may discard RGB values under completely transparent pixels. Those cannot
// be seen, including in the alpha mask. Every visible RGB value and every alpha
// value must remain identical; never substitute a lossy or resized derivative.
const originalPixels = await sharp(source).ensureAlpha().raw().toBuffer();
const optimizedPixels = await sharp(optimized).ensureAlpha().raw().toBuffer();
assert.equal(optimizedPixels.length, originalPixels.length);
for (let offset = 0; offset < originalPixels.length; offset += 4) {
  assert.equal(optimizedPixels[offset + 3], originalPixels[offset + 3]);
  if (originalPixels[offset + 3] === 0) continue;
  for (let channel = 0; channel < 3; channel++) {
    assert.equal(optimizedPixels[offset + channel], originalPixels[offset + channel]);
  }
}
await writeFile(outputUrl, optimized);
console.log(JSON.stringify({ originalBytes: source.length, optimizedBytes: optimized.length,
  width: originalMetadata.width, height: originalMetadata.height, visiblePixelsAndAlphaIdentical: true }));
