import assert from "node:assert/strict";
import test from "node:test";

import { appendJamo, deleteJamo } from "../app/hangul-compose.ts";

/** Types a whole sequence, the way the on-screen keyboard does. */
function type(sequence) {
  return sequence.reduce((text, jamo) => appendJamo(text, jamo), "");
}

test("assembles an initial and a vowel into one syllable", () => {
  assert.equal(type(["ㅎ", "ㅏ"]), "하");
  assert.equal(type(["ㄱ", "ㅏ"]), "가");
});

test("a consonant after a complete syllable becomes its final", () => {
  assert.equal(type(["ㅎ", "ㅏ", "ㄴ"]), "한");
  assert.equal(type(["ㄱ", "ㅏ", "ㅇ"]), "강");
});

test("a vowel after a final steals it as the next initial", () => {
  // 각 + ㅏ is 가가, not 각아 — the ㄱ moves.
  assert.equal(type(["ㄱ", "ㅏ", "ㄱ", "ㅏ"]), "가가");
  assert.equal(type(["ㅁ", "ㅓ", "ㄴ", "ㅏ"]), "머나");
});

test("vowels fuse where a combined letter exists", () => {
  assert.equal(type(["ㄱ", "ㅗ", "ㅏ"]), "과");
  assert.equal(type(["ㅁ", "ㅜ", "ㅓ"]), "뭐");
  assert.equal(type(["ㅎ", "ㅡ", "ㅣ"]), "희");
});

test("finals fuse where a combined letter exists", () => {
  assert.equal(type(["ㅇ", "ㅏ", "ㄴ", "ㅈ"]), "앉");
  assert.equal(type(["ㄷ", "ㅏ", "ㄹ", "ㄱ"]), "닭");
});

test("a compound final splits when a vowel follows it", () => {
  // 앉 + ㅏ keeps ㄴ and moves ㅈ.
  assert.equal(type(["ㅇ", "ㅏ", "ㄴ", "ㅈ", "ㅏ"]), "안자");
});

test("two consonants in a row commit the first", () => {
  assert.equal(type(["ㄱ", "ㄴ"]), "ㄱㄴ");
});

test("the practice sentence assembles from its jamo", () => {
  assert.equal(type(["ㅎ", "ㅏ", "ㄴ", "ㄱ", "ㅡ", "ㄹ"]), "한글");
});

test("backspace peels one jamo at a time, not a whole syllable", () => {
  assert.equal(deleteJamo("한"), "하");
  assert.equal(deleteJamo("하"), "ㅎ");
  assert.equal(deleteJamo("ㅎ"), "");
  assert.equal(deleteJamo("닭"), "달");
  assert.equal(deleteJamo("과"), "고");
});

test("backspace leaves non-Hangul characters alone", () => {
  assert.equal(deleteJamo("ab"), "a");
  assert.equal(deleteJamo("한a"), "한");
});
