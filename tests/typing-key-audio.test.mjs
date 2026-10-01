import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { shouldPlayTypingKeySound } from "../app/typing-key-audio";

const keyEvent = (overrides = {}) => ({
  key: "g", code: "KeyG", repeat: false, ctrlKey: false, metaKey: false, altKey: false,
  ...overrides,
});

test("native Korean IME physical strikes and Latin layout strikes produce the same sound decision", () => {
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "Process", code: `Key${letter}`, isComposing: true, keyCode: 229 })), true);
    assert.equal(shouldPlayTypingKeySound(keyEvent({ key: letter.toLowerCase(), code: `Key${letter}` })), true);
  }
  for (const code of ["Space", "Backspace", "Digit1", "Semicolon", "Quote", "IntlBackslash"]) {
    assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "Process", code, isComposing: true })), true);
  }
  assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "ㅎ", code: "" })), true);
  assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "q", code: "KeyA" })), true);
  assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "R", code: "KeyR", shiftKey: true })), true);
});

test("composition commits, control keys, repeated events and shortcuts do not add key sounds", () => {
  for (const code of ["Enter", "NumpadEnter", "ShiftLeft", "ControlLeft", "AltRight", "MetaLeft", "ArrowLeft", "Escape", "Tab", "Lang1", "CapsLock"]) {
    assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "Process", code, isComposing: true, keyCode: 229 })), false, code);
  }
  for (const flag of ["repeat", "ctrlKey", "metaKey", "altKey"]) {
    assert.equal(shouldPlayTypingKeySound(keyEvent({ [flag]: true })), false, flag);
  }
  assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "Enter", code: "Enter" })), false);
  assert.equal(shouldPlayTypingKeySound(keyEvent({ key: "Unidentified", code: "" })), false);
});

test("sound capture bypasses the shared IME guard without altering its input or submit protection", async () => {
  const field = await readFile(new URL("../app/HangulTypingField.tsx", import.meta.url), "utf8");
  assert.match(field, /if \(composing\.current \|\| isImeKey\(event\.nativeEvent\)\) \{[\s\S]*?return;\s*\}\s*props\.onKeyDown\?\.\(event\);/);
  assert.match(field, /<input \{\.\.\.props\}/);
  assert.match(field, /<textarea \{\.\.\.props\}/);
  for (const file of ["page.tsx", "CrosswordGame.tsx", "FallingWordsGame.tsx", "ProgressivePuzzles.tsx", "ProverbTypingGame.tsx"]) {
    const source = await readFile(new URL(`../app/${file}`, import.meta.url), "utf8");
    assert.match(source, /onKeyDownCapture=\{\(event\) => \{\s*if \((?:returnSoundEnabled|soundEnabled) && shouldPlayTypingKeySound\(event\)\)/, file);
    assert.doesNotMatch(source, /event\.key\.length === 1 \|\| event\.key === "Backspace"/, file);
  }
});

test("recorded key sounds are small, mono, short, non-clipping PCM files", async () => {
  let total = 0;
  for (const name of ["key-a", "key-b", "key-wide"]) {
    const wav = await readFile(new URL(`../public/audio/typing/${name}.wav`, import.meta.url));
    total += wav.length;
    assert.equal(wav.toString("ascii", 0, 4), "RIFF");
    assert.equal(wav.toString("ascii", 8, 12), "WAVE");
    let format, data;
    for (let at = 12; at + 8 < wav.length;) {
      const type = wav.toString("ascii", at, at + 4), size = wav.readUInt32LE(at + 4);
      if (type === "fmt ") format = wav.subarray(at + 8, at + 8 + size);
      if (type === "data") data = wav.subarray(at + 8, at + 8 + size);
      at += 8 + size + (size % 2);
    }
    assert.equal(format.readUInt16LE(0), 1);
    assert.equal(format.readUInt16LE(2), 1);
    assert.equal(format.readUInt32LE(4), 44100);
    const duration = data.length / 88200;
    assert.ok(duration >= .14 && duration < .2);
    let peak = 0;
    for (let i = 0; i < data.length; i += 2) peak = Math.max(peak, Math.abs(data.readInt16LE(i) / 32768));
    assert.ok(peak > .02 && peak < .98, `${name}: audible without clipping ${peak}`);
    assert.ok(Math.abs(data.readInt16LE(data.length - 2)) < 300, "faded edge avoids a digital pop");
  }
  assert.ok(total < 50 * 1024, "three local samples are under 50 KiB altogether");
});

test("sample playback preserves master volume and visibility safeguards without oscillators or remote providers", async () => {
  const [audio, page, license] = await Promise.all([
    readFile(new URL("../app/typing-key-audio.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/audio/typing/LICENSE.txt", import.meta.url), "utf8"),
  ]);
  assert.match(page, /playRecordedTypingKey\(context, code, uiSoundVolume\)/);
  assert.match(audio, /context\.state === "closed"/);
  assert.match(audio, /document\.visibilityState === "hidden"/);
  assert.match(audio, /active\.size >= 12/);
  assert.match(audio, /source\.onended[^\n]*source\.disconnect\(\); gain\.disconnect\(\)/);
  assert.doesNotMatch(audio, /createOscillator|\/api\/|https:\/\//);
  assert.match(license, /CC0 1.0/);
});
