import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

test("ships the staged Korean typing curriculum before sentence practice", async () => {
  const curriculum = await readFile(new URL("../app/practice-curriculum.ts", import.meta.url), "utf8");
  assert.match(curriculum, /practiceStageOrder.*\["home", "syllable", "batchim", "double", "word", "sentence"\]/);
  assert.match(curriculum, /text: "ㅁㄴㅁㄴ ㅁㄴㅁㄴ"/);
  assert.match(curriculum, /text: "ㅓㅏㅓㅏ ㅓㅏㅓㅏ"/);
  assert.match(curriculum, /text: "만 난 안 란"/);
  assert.match(curriculum, /text: "까 따 빠 싸 짜"/);
  assert.match(curriculum, /\.\.\.sentencePracticeItems\.map/);
  assert.ok(curriculum.indexOf('id: "home-left-1"') < curriculum.indexOf("...sentencePracticeItems.map"));
});

test("connects animated anatomical hands, pausable practice, Enter evaluation, sound, and recorded speech", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /\/images\/typing-hands-v2\.png/);
  assert.match(page, /hand-rest-image/);
  assert.match(page, /hand-press-layer/);
  assert.match(page, /pressedFinger/);
  assert.match(page, /pressedCode/);
  assert.match(page, /finger-callout/);
  assert.match(page, /왼손 새끼손가락/);
  assert.match(page, /practice-workspace/);
  assert.match(page, /activePracticeKey\?\.code === key\.code/);
  assert.match(page, /lessonFinished \|\| lessonPaused/);
  assert.match(page, /aria-pressed=\{lessonPaused\}/);
  assert.match(page, /setLessonPaused\(\(paused\) => !paused\)/);
  assert.match(page, /연습 타이머 일시정지/);
  assert.match(page, /event\.key !== "Enter"/);
  assert.match(page, /evaluateLessonAttempt/);
  assert.match(page, /currentPracticeItem\.minAccuracy/);
  assert.match(page, /confirmAndAdvance\(advanceLesson, targetSentence, currentPracticeItem\.speak\)/);
  assert.match(page, /audio-control-cluster/);
  assert.match(page, /playTypewriterReturnSound/);
  assert.match(page, /staticSpeechAudioByText/);
  assert.match(css, /\.hand-overlay img/);
  assert.match(css, /\.hand-press-layer\.left-pinky/);
  assert.match(css, /\.hand-press-layer\.right-index/);
  assert.match(css, /\.practice-workspace/);
  assert.match(css, /@keyframes real-finger-demonstrate/);
  assert.match(css, /@keyframes real-finger-press/);
  assert.match(css, /\.practice-card\.is-paused \.hand-press-layer/);
  assert.doesNotMatch(page, /fingertip-marker|finger-trace/);
  assert.doesNotMatch(css, /\.fingertip-marker|\.finger-trace/);
  assert.doesNotMatch(css, /\.typing-hand/);
  assert.match(css, /\.audio-control-cluster/);
});

test("ships Enter-confirmed falling words, advancing missing letters, and a real checked crossword", async () => {
  const [page, falling, puzzles, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/FallingWordsGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ProgressivePuzzles.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /selectActivity/);
  assert.match(page, /getElementById\("game-stage"\)\?\.scrollIntoView/);
  assert.match(page, /<FallingWordsGame/);
  assert.match(page, /<MissingLetterGame/);
  assert.match(page, /<CrosswordGame/);
  assert.match(falling, /setInterval/);
  assert.match(falling, /word\.y < 83/);
  assert.match(falling, /value - missed \* 50/);
  assert.match(falling, /current \+ gained/);
  assert.match(falling, /function submitWord/);
  assert.match(falling, /event\.key !== "Enter"/);
  assert.match(falling, /setInputEpoch/);
  assert.match(falling, /오타가 있어요\. 단어는 사라지지 않았습니다/);
  assert.doesNotMatch(falling, /onChange=\{\(event\) => captureWord/);
  assert.match(puzzles, /setIndex\(\(current\) => \(current \+ 1\)/);
  assert.match(puzzles, /850/);
  assert.match(puzzles, /function buildCrossword/);
  assert.match(puzzles, /answer: "한글"/);
  assert.match(puzzles, /answer: "외국인"/);
  assert.match(puzzles, /function checkPuzzle/);
  assert.match(puzzles, /setWrongCells\(mistakes\)/);
  assert.match(puzzles, /event\.key === "ArrowLeft"/);
  assert.match(puzzles, /event\.key === "Enter"/);
  assert.match(puzzles, /current \+ 500/);
  assert.match(puzzles, /function nextPuzzle/);
  assert.doesNotMatch(puzzles, /900/);
  assert.match(css, /\.word-rain-board/);
  assert.match(css, /\.sea-water\.splash/);
  assert.match(css, /\.capture-burst/);
  assert.match(css, /\.word-rain-console input\.input-error/);
  assert.match(css, /\.crossword-cell\.active-word/);
  assert.match(css, /\.crossword-cell\.wrong/);
  assert.match(css, /@keyframes crossword-correct/);
});

test("keeps the selected interface language on the personal page", async () => {
  const profile = await readFile(new URL("../app/my/MyLearningClient.tsx", import.meta.url), "utf8");
  assert.match(profile, /hangeul-pop-locale/);
  assert.match(profile, /학습 계속하기/);
  assert.match(profile, /오늘의 리듬 이어가기/);
  assert.match(profile, /학습 단계/);
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
