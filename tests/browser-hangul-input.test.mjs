import assert from "node:assert/strict";
import test from "node:test";
import { backspaceBrowserJamo, browserJamoForKey, editHangulText, insertBrowserJamo, isImeKey } from "../app/browser-hangul-input.ts";
import { comparableJamo } from "../app/hangul-keyboard.ts";
import { supportedLocaleCodes } from "../app/locale-detection.ts";
import { hangulInputCopy } from "../app/hangul-input-i18n.ts";

function typeKeys(keys) {
  let value = "";
  for (const key of keys) {
    const jamo = browserJamoForKey({ key, code: `Key${key.toUpperCase()}`, shiftKey: key !== key.toLowerCase() });
    assert.ok(jamo);
    value = insertBrowserJamo(value, value.length, value.length, jamo).value;
  }
  return value;
}

test("a first-time Latin keyboard types the recorded user's first lesson without setup", () => {
  assert.equal(typeKeys("gkak"), "하마");
  assert.equal(typeKeys("gksrmf"), "한글");
  assert.equal(typeKeys("dkssudgktpdy"), "안녕하세요");
  assert.deepEqual(comparableJamo(typeKeys("gkak")), comparableJamo("하마"));
});

test("supports shift, compound vowels, compound finals and final-to-initial migration", () => {
  assert.equal(typeKeys("Rkcl"), "까치");
  assert.equal(typeKeys("dhk"), "와");
  assert.equal(typeKeys("rhk"), "과");
  assert.equal(typeKeys("dkswk"), "안자");
  assert.equal(typeKeys("ekfr"), "닭");
  assert.equal(typeKeys("dksw"), "앉");
  assert.equal(typeKeys("QOP"), "뺴ㅖ");
});

test("physical positions stay aligned on AZERTY, QWERTZ and non-Latin layouts", () => {
  assert.equal(browserJamoForKey({ key: "a", code: "KeyQ" }), "ㅂ");
  assert.equal(browserJamoForKey({ key: "z", code: "KeyW" }), "ㅈ");
  assert.equal(browserJamoForKey({ key: "y", code: "KeyZ" }), "ㅋ");
  assert.equal(browserJamoForKey({ key: "п", code: "KeyG" }), "ㅎ");
});

test("never intercepts native IME, Hangul text, dead keys or keyboard shortcuts", () => {
  for (const overrides of [
    { isComposing: true }, { keyCode: 229 }, { key: "ㅎ" }, { key: "하" },
    { key: "ᄒ" }, { key: "Process" }, { key: "Dead" }, { ctrlKey: true },
    { metaKey: true }, { altKey: true }, { code: "Unidentified" },
  ]) assert.equal(browserJamoForKey({ key: "g", code: "KeyG", ...overrides }), null);
  assert.equal(isImeKey({ key: "Enter", code: "Enter", keyCode: 229 }), true);
  assert.equal(isImeKey({ key: "Enter", code: "Enter", isComposing: true }), true);
  assert.equal(isImeKey({ key: "Enter", code: "Enter" }), false);
});

test("backspace removes one jamo at a time rather than the whole syllable", () => {
  let value = "닭";
  for (const expected of ["달", "다", "ㄷ", ""]) {
    value = backspaceBrowserJamo(value, value.length, value.length).value;
    assert.equal(value, expected);
  }
  assert.deepEqual(backspaceBrowserJamo("하마", 0, 0), { value: "하마", caret: 0 });
});

test("cursor editing and selected replacement preserve unselected text", () => {
  assert.deepEqual(insertBrowserJamo("ㅎ마", 1, 1, "ㅏ"), { value: "하마", caret: 1 });
  assert.deepEqual(insertBrowserJamo("가나", 1, 2, "ㅎ"), { value: "가ㅎ", caret: 2 });
  assert.deepEqual(backspaceBrowserJamo("하마", 1, 2), { value: "하", caret: 1 });
  assert.deepEqual(backspaceBrowserJamo("하마", 1, 1), { value: "ㅎ마", caret: 1 });
  assert.deepEqual(editHangulText("하마", 1, 1, (prefix) => `${prefix} `), { value: "하 마", caret: 2 });
});

test("first-input help is available synchronously in every supported UI language", () => {
  for (const locale of supportedLocaleCodes) {
    const copy = hangulInputCopy(locale);
    for (const value of Object.values(copy)) assert.ok(typeof value === "string" && value.length > 0, locale);
  }
  assert.match(hangulInputCopy("es").hint, /No necesitas configurar/);
});
