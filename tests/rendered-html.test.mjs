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
  assert.match(page, /confirmAndAdvance\(\s*\(\) => advanceLesson\(evaluation\.accuracy, attemptCpm\)/);
  assert.match(page, /masteryPrompt/);
  assert.match(page, /focusPracticeInput/);
  assert.match(page, /playTypingKeySound/);
  assert.match(page, /practice-focus-mode/);
  assert.match(page, /practicePreparing/);
  assert.match(page, /practiceFocusMode/);
  assert.match(page, /beginPracticeFocusTransition/);
  assert.match(page, /}, 620\)/);
  assert.match(page, /showHeroIntroduction/);
  assert.match(page, /소개 영역 다시 펼치기/);
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
  assert.match(css, /\.hero-copy h1 \{\s*overflow: hidden;\s*max-height: 310px;/);
  assert.match(css, /\.hero\.practice-preparing \.practice-stage/);
  assert.match(css, /\.practice-focus-mode \.hero-copy \{\s*position: static;\s*display: flex;/);
  assert.doesNotMatch(css, /\.practice-focus-mode \.hero-copy \{\s*display: none;/);
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
  assert.match(falling, /word\.y < 84/);
  assert.match(falling, /value - missedNow \* 75/);
  assert.match(falling, /current \+ gained/);
  assert.match(falling, /function submitWord/);
  assert.match(falling, /event\.key !== "Enter"/);
  assert.match(falling, /setInputEpoch/);
  assert.match(falling, /단어는 그대로입니다/);
  assert.match(falling, /CAUGHT_PER_LEVEL/);
  assert.match(falling, /setPaused/);
  assert.match(falling, /RETRO_STEP_MS/);
  assert.match(falling, /function synthTone/);
  assert.match(falling, /function noiseHit/);
  assert.match(falling, /네온 한글시티를 지켜라/);
  assert.match(falling, /playGameEffect\("blast"/);
  assert.match(falling, /playGameEffect\("damage"/);
  assert.match(falling, /WAVE \{waveClear\.toString/);
  assert.match(falling, /Alt\+M/);
  assert.doesNotMatch(falling, /onChange=\{\(event\) => captureWord/);
  assert.match(puzzles, /setPuzzleIndex\(isLevelEnd \? 0 : puzzleIndex \+ 1\)/);
  assert.match(puzzles, /1450/);
  assert.match(puzzles, /missing-letter-input/);
  assert.match(puzzles, /missing-level-up/);
  assert.match(puzzles, /function buildCrossword/);
  assert.match(puzzles, /answer: "한국어"/);
  assert.match(puzzles, /answer: "여행자"/);
  assert.match(puzzles, /function createCrossword/);
  assert.match(puzzles, /function checkPuzzle/);
  assert.match(puzzles, /setWrongCells\(mistakes\)/);
  assert.match(puzzles, /event\.key === "ArrowLeft"/);
  assert.match(puzzles, /event\.key === "Enter"/);
  assert.match(puzzles, /1200 - seconds \* 2 - hints \* 75/);
  assert.match(puzzles, /function nextPuzzle/);
  assert.match(puzzles, /event\.key === "Tab"/);
  assert.match(puzzles, /event\.key === " "/);
  assert.match(css, /\.word-rain-board/);
  assert.match(css, /\.sea-water\.splash/);
  assert.match(css, /\.capture-burst/);
  assert.match(css, /\.mission-briefing/);
  assert.match(css, /\.neon-city/);
  assert.match(css, /@keyframes city-impact/);
  assert.match(css, /@keyframes blast-ring/);
  assert.match(css, /\.word-rain-console input\.input-error/);
  assert.match(css, /\.crossword-cell\.active-word/);
  assert.match(css, /\.crossword-cell\.wrong/);
  assert.match(css, /@keyframes crossword-correct/);
});

test("keeps the selected interface language on the personal page", async () => {
  const profile = await readFile(new URL("../app/my/MyLearningClient.tsx", import.meta.url), "utf8");
  assert.match(profile, /readManualLocalePreference/);
  assert.match(profile, /resolveVisitorLocale/);
  assert.match(profile, /학습 계속하기/);
  assert.match(profile, /오늘의 리듬 이어가기/);
  assert.match(profile, /학습 단계/);
});

test("detects visitor locale before saving an explicit language preference", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /readManualLocalePreference/);
  assert.match(page, /resolveVisitorLocale\(\{ languages, timeZone \}\)/);
  assert.match(page, /fetch\("\/api\/locale"/);
  assert.match(page, /saveManualLocalePreference\(window\.localStorage, nextLocale\)/);
  assert.doesNotMatch(page, /localStorage\.setItem\("hangeul-pop-locale", locale\)/);
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

test("keeps header controls out of the progress navigation at laptop widths", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /grid-template-columns: auto minmax\(0, 1fr\) auto/);
  assert.match(css, /@media \(max-width: 1360px\)[\s\S]*?\.audio-control-cluster \.speech-toggle-copy[\s\S]*?display: none/);
  assert.match(css, /@media \(max-width: 1120px\)[\s\S]*?\.nav-links a:not\(\[href="\/my"\]\)[\s\S]*?display: none/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.nav-links[\s\S]*?display: none/);
});
