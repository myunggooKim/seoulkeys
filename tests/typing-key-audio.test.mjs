import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
