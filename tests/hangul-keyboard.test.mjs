import assert from "node:assert/strict";
import test from "node:test";
import { decomposeHangulCharacter } from "../app/hangul-keyboard.ts";

test("decomposes representative Hangul syllables into two-set keystrokes", () => {
  assert.deepEqual(decomposeHangulCharacter("가"), ["ㄱ", "ㅏ"]);
  assert.deepEqual(decomposeHangulCharacter("각"), ["ㄱ", "ㅏ", "ㄱ"]);
  assert.deepEqual(decomposeHangulCharacter("깎"), ["ㄲ", "ㅏ", "ㄱ", "ㄱ"]);
  assert.deepEqual(decomposeHangulCharacter("값"), ["ㄱ", "ㅏ", "ㅂ", "ㅅ"]);
  assert.deepEqual(decomposeHangulCharacter("힣"), ["ㅎ", "ㅣ", "ㅎ"]);
  assert.equal(decomposeHangulCharacter("."), null);
});

test("decomposes every modern Hangul syllable without missing a jamo table entry", () => {
  for (let codePoint = 0xac00; codePoint <= 0xd7a3; codePoint += 1) {
    const character = String.fromCodePoint(codePoint);
    const sequence = decomposeHangulCharacter(character);
    assert.ok(sequence && sequence.length >= 2, `missing decomposition for ${character} U+${codePoint.toString(16)}`);
    assert.ok(sequence.every((jamo) => typeof jamo === "string" && jamo.length > 0));
  }
});
