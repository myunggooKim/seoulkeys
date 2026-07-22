import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

test("build source contains the complete Hangeul Pop learning experience", async () => {
  const [layout, page] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Hangeul Pop — Learn Korean typing through play/i);
  assert.match(page, /저는 음악을 좋아해요\./);
  assert.match(page, /Korean 2-set keyboard map/);
  assert.match(page, /Next Korean key/);
  assert.match(page, /QWERTY/);
  assert.match(page, /AZERTY/);
  assert.match(page, /QWERTZ/);
  assert.match(page, /Português \(Brasil\)/);
  assert.match(page, /العربية/);
  assert.match(page, /ไทย/);
  assert.match(page, /K-Drama & Movie Lines/);
  assert.match(page, /K-드라마·영화 명대사/);
  assert.match(page, /Travel & Say Hello/);
  assert.match(page, /여행 회화·한국인에게 말 걸기/);
  assert.match(page, /Auto Korean pronunciation/);
  assert.match(page, /speech-toggle-track/);
  assert.match(page, /Female voice/);
  assert.match(page, /Transparent five-finger hand position guide/i);
});

test("keeps local-key mappings, recorded speech, and responsive finger guidance in source", async () => {
  const [page, css, admin, schema] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminConsole.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /azerty: \{ KeyQ: "A", KeyW: "Z"/);
  assert.match(page, /qwertz: \{ KeyY: "Z", KeyZ: "Y" \}/);
  assert.match(page, /hangeul-pop-keyboard-layout/);
  assert.match(page, /activePracticeKey\?\.code === key\.code/);
  assert.match(page, /const keyboardHelpCopy/);
  assert.match(page, /const screenPracticeLines/);
  assert.match(page, /const travelPhrases/);
  assert.match(page, /ORIGINAL PRACTICE DIALOGUE · LICENSE-SAFE PREVIEW/);
  assert.match(page, /Welcome Koreans/);
  assert.match(page, /const playKorean/);
  assert.match(page, /utterance\.lang = "ko-KR"/);
  assert.match(page, /hangeul-pop-auto-speak/);
  assert.match(page, /hangeul-pop-voice-gender/);
  assert.match(page, /staticSpeechAudioByText/);
  assert.match(page, /audioFemaleUrl/);
  assert.match(page, /audioMaleUrl/);
  assert.doesNotMatch(page, /!autoSpeak \|\| !sentenceComplete/);
  assert.match(page, /evaluateLessonAttempt/);
  assert.match(page, /confirmAndAdvance\(advanceLesson, targetSentence\)/);
  assert.match(page, /타자기 줄바꿈 소리/);
  assert.match(page, /저는 매일 한국어를 연습해요\./);
  assert.match(page, /친구와 함께 여행하고 싶어요\./);
  assert.match(css, /\.keyboard-map/);
  assert.match(css, /\.keyboard-row kbd\.active/);
  assert.match(css, /\.hand-overlay/);
  assert.match(css, /\.typing-hand/);
  assert.match(css, /\.hand-finger\.active i/);
  assert.match(css, /@keyframes fingertip-pulse/);
  assert.doesNotMatch(css, /\.finger-guide/);
  assert.match(css, /\.keyboard-tools/);
  assert.match(css, /\.screen-demo/);
  assert.match(css, /\.travel-demo/);
  assert.match(css, /\.speech-toggle input:checked/);
  assert.match(admin, /권리 상태/);
  assert.match(admin, /여성 음성 파일 URL/);
  assert.match(admin, /남성 음성 파일 URL/);
  assert.match(schema, /contentItems/);
  assert.match(schema, /audioFemaleUrl/);
});

test("ships both female and male prerecorded Korean audio", async () => {
  const audioDirectory = new URL("../public/audio/ko/", import.meta.url);
  const files = (await readdir(audioDirectory)).filter((name) => name.endsWith(".mp3"));
  assert.equal(files.length, 28);
  for (const stem of ["lesson-01", "lesson-05", "travel-korea-01", "travel-welcome-03", "scene-03"]) {
    for (const gender of ["female", "male"]) {
      const fileUrl = new URL(`${stem}-${gender}.mp3`, audioDirectory);
      assert.ok((await stat(fileUrl)).size > 1_000, `${stem}-${gender} must contain audio`);
    }
  }
});
