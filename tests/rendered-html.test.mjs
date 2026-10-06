import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

test("starts new visitors in light mode and preserves an explicit saved theme", async () => {
  const [layout, theme] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/theme.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /localStorage\.getItem\("seoulkeys-theme"\)/);
  assert.match(layout, /\? saved\s*: "light"/);
  assert.match(layout, /setAttribute\("data-theme","light"\)/);
  assert.doesNotMatch(layout, /prefers-color-scheme/);
  assert.match(theme, /localStorage\.setItem\(themeStorageKey, theme\)/);
  assert.match(theme, /return "light"/);
  assert.doesNotMatch(theme, /prefers-color-scheme/);
});

test("reveals the home page only after its localized first frame is stable", async () => {
  const [layout, page, css, localeHook, runtimeI18n] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/use-locale-translations.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/runtime-i18n.ts", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /setAttribute\("data-app-booting", "true"\)/);
  assert.match(layout, /removeAttribute\("data-app-booting"\)/);
  assert.match(layout, /var appRoots = \["\/", "\/my", "\/teacher", "\/join", "\/legal"\]/);
  assert.match(css, /html\[data-app-booting\] body\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(page, /const \[localeResolved, setLocaleResolved\] = useState\(false\)/);
  assert.match(page, /const translationsReady = useLocaleTranslations\(locale\)/);
  assert.match(page, /document\.fonts\?\.ready/);
  assert.match(page, /root\.setAttribute\("data-app-ready", "true"\)/);
  assert.match(page, /if \(active\) setSignedIn\(false\)/);
  assert.match(localeHook, /if \(active\) setLoadedLocale\(locale\)/);
  assert.match(runtimeI18n, /signal: controller\.signal/);
});

test("reveals the legal page as soon as its translated document is stable", async () => {
  const bridge = await readFile(new URL("../app/legal/LegalTranslationBridge.tsx", import.meta.url), "utf8");
  assert.match(bridge, /removeAttribute\("data-app-booting"\)/);
  assert.match(bridge, /setAttribute\("data-app-ready", "legal"\)/);
});

test("ships the staged Korean typing curriculum before sentence practice", async () => {
  const curriculum = await readFile(new URL("../app/practice-curriculum.ts", import.meta.url), "utf8");
  const { practiceCurriculum, progressiveWordGroups } = await import("../app/practice-curriculum.ts");
  const { comparableJamo } = await import("../app/hangul-keyboard.ts");
  assert.match(curriculum, /practiceStageOrder.*\["home", "syllable", "batchim", "double", "word", "sentence"\]/);
  // Beginner progression is made of one real word per Enter-confirmed task:
  // home row first, then upper/lower rows, finals, doubles, and full words.
  assert.match(curriculum, /words: \["하마", "나라", "머리", "오리"/);
  assert.match(curriculum, /words: \["바다", "사자", "가게", "제비"/);
  assert.match(curriculum, /words: \["나무", "우유", "구두", "치마"/);
  assert.match(curriculum, /words: \["산", "달", "밤", "공"/);
  assert.match(curriculum, /words: \["까치", "토끼", "아빠", "쓰다"/);
  assert.match(curriculum, /speak: true/);
  assert.doesNotMatch(curriculum, /text: "[^"]+ [^"]+".*kind: "(home|syllable|batchim|double|word)"/);
  assert.match(curriculum, /\.\.\.sentencePracticeItems\.map/);
  assert.ok(curriculum.indexOf('idPrefix: "home-core"') < curriculum.indexOf("...sentencePracticeItems.map"));

  const wordItems = practiceCurriculum.filter((item) => item.kind !== "sentence");
  assert.ok(wordItems.length >= 75, "beginner stages should provide sustained one-word practice");
  for (const item of wordItems) {
    assert.equal(item.text.trim().split(/\s+/).length, 1, `${item.id} must contain exactly one word`);
    assert.equal(item.speak, true, `${item.id} needs prerecorded pronunciation`);
  }
  assert.deepEqual(progressiveWordGroups.map((group) => group.idPrefix), [
    "home-core",
    "syllable-upper",
    "syllable-lower",
    "batchim-sonorant",
    "batchim-obstruent",
    "double-core",
    "word-core",
  ]);

  const cumulativeKeySets = [
    new Set(Array.from("ㅁㄴㅇㄹㅎㅗㅓㅏㅣ")),
    new Set(Array.from("ㅁㄴㅇㄹㅎㅗㅓㅏㅣㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ")),
    new Set(Array.from("ㅁㄴㅇㄹㅎㅗㅓㅏㅣㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅋㅌㅊㅍㅠㅜㅡ")),
  ];
  for (let groupIndex = 0; groupIndex < cumulativeKeySets.length; groupIndex += 1) {
    const allowed = cumulativeKeySets[groupIndex];
    for (const word of progressiveWordGroups[groupIndex].words) {
      const unsupported = comparableJamo(word).filter((jamo) => !allowed.has(jamo));
      assert.deepEqual(unsupported, [], `${word} introduces a key before its progressive group`);
    }
  }
});

test("connects animated anatomical hands, pausable practice, Enter evaluation, sound, and recorded speech", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /<HandGuide finger=\{displayedFinger\}/);
  assert.doesNotMatch(page, /hand-rest-image|hand-press-layer/);
  assert.match(page, /pressedFinger/);
  assert.match(page, /pressedCode/);
  assert.match(page, /finger-callout/);
  assert.match(page, /왼손 새끼손가락/);
  assert.match(page, /practice-workspace/);
  assert.match(page, /activePracticeKey\?\.code === key\.code/);
  assert.match(page, /lessonFinished \|\| lessonPaused/);
  assert.match(page, /aria-pressed=\{lessonPaused\}/);
  assert.match(page, /changeLessonPause\(!lessonPaused\)/);
  assert.match(page, /window\.scrollTo\(\{ \.\.\.stableScroll, behavior: "auto" \}\)/);
  assert.match(page, /연습 타이머 일시정지/);
  assert.match(page, /event\.key !== "Enter"/);
  assert.match(page, /evaluateLessonAttempt/);
  assert.doesNotMatch(page, /window\.setTimeout\(submitPracticeAttempt, 180\)/);
  assert.doesNotMatch(page, /window\.setTimeout\(resetCurrentPractice, 1050\)/);
  assert.match(page, /단어 입력 완료 · Enter ↵를 눌러 정확도를 검사하세요/);
  assert.match(page, /previewCurrentPronunciation/);
  assert.match(page, /aria-keyshortcuts="Alt\+P"/);
  assert.match(page, /active-row/);
  assert.match(page, /basicHomeRowCodes = new Set\(\[[^\]]*"KeyG"/);
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
  assert.match(page, /returnPracticeHome/);
  assert.match(page, /소개 영역 다시 펼치기/);
  assert.match(page, /totalPracticeSecondsRef\.current \+ elapsedSeconds/);
  assert.match(page, /Restore the learning position, never the previous page's running timer state/);
  assert.doesNotMatch(page, /setElapsedSeconds\(serverProgress\.typingSeconds\)/);
  assert.doesNotMatch(page, /setLessonStarted\(serverProgress\.completedSentences/);
  // The four audio controls now live behind one header button instead of
  // sitting open in the topbar, where they took 403px of a 1352px row.
  assert.match(page, /sound-menu-trigger/);
  assert.match(page, /sound-menu-panel/);
  assert.doesNotMatch(page, /audio-control-cluster/);
  assert.match(page, /playTypewriterReturnSound/);
  assert.match(page, /staticSpeechAudioByText/);
  assert.match(page, /type PracticeTrack = "guided" \| "words" \| "sentences"/);
  assert.match(page, /function choosePracticeStage/);
  assert.match(page, /choosePracticeStage\("word", "words"\)/);
  assert.match(page, /choosePracticeStage\("sentence", "sentences"\)/);
  assert.match(page, /practice-track-picker/);
  assert.match(page, /선택 가능한 한글 타자 학습 단계/);
  assert.match(page, /한국어 발음 목소리 선택/);
  assert.match(page, /화면 언어 선택/);
  assert.match(css, /\.hand-guide-art/);
  assert.match(css, /\.hand-guide-canvas canvas/);
  assert.match(css, /\.practice-workspace/);
  assert.match(page, /pressing=\{Boolean\(pressedFinger\)\}/);
  assert.match(page, /paused=\{lessonPaused\}/);
  assert.match(page, /reach=\{handReach\}/);
  assert.match(page, /keyboard-row space\$\{activePracticeKey\?\.code === "Space"/);
  assert.match(page, /className=\{`key-space\$\{activePracticeKey\?\.code === "Space"/);
  assert.match(page, /Space: \$\{keyboardText\.press\} \$\{keyboardLegend\(keyboardLayout, "Space"\)\}/);
  assert.match(css, /\.keyboard-map \.keyboard-row\.space kbd\.key-space\s*\{[^}]*width: min\(65%, 240px\)/s);
  assert.match(css, /\.word-pronunciation-button/);
  assert.match(css, /\.keyboard-map \{[\s\S]*?isolation: isolate;/);
  assert.match(css, /\.practice-card \.keyboard-row kbd\.active \{\s*z-index: 31 !important;/);
  assert.match(css, /\.practice-card \.keyboard-row\.active-row \{\s*z-index: 30 !important;/);
  assert.match(css, /\.practice-pause-banner \{\s*position: absolute;/);
  assert.match(css, /@keyframes pause-badge-in/);
  assert.doesNotMatch(page, /fingertip-marker|finger-trace/);
  assert.doesNotMatch(css, /\.fingertip-marker|\.finger-trace/);
  assert.doesNotMatch(css, /\.typing-hand/);
  assert.match(css, /\.sound-menu-panel/);
  // The headline must NOT be clipped. `overflow: hidden` + a fixed max-height
  // here is what cut off the practice pane, so this asserts the fix, not the bug.
  assert.match(css, /\.hero-copy h1 \{\s*overflow: visible;\s*max-height: none;/);
  assert.match(css, /\.hero\.practice-preparing \.practice-stage/);
  assert.match(css, /\.practice-focus-mode \.hero-copy \{\s*position: static;\s*display: flex;/);
  assert.doesNotMatch(css, /\.practice-focus-mode \.hero-copy \{\s*display: none;/);
});

test("places the unchanged daily meter in the hand-guide column only when two columns fit", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const start = page.indexOf('className={`practice-workspace');
  const end = page.indexOf('</article>', start);
  const workspace = page.slice(start, end);
  assert.match(workspace, /!lessonFinished && !masteryPrompt \? "with-guidance-progress"/);
  assert.match(workspace, /className="daily-meter" id="progress"/);
  assert.equal((page.match(/id="progress"/g) ?? []).length, 1);
  assert.match(workspace, /aria-valuenow=\{dailyProgress\}/);
  assert.match(workspace, /width: `\$\{dailyProgress\}%`/);
  assert.match(workspace, /onClick=\{\(\) => changeLessonPause\(!lessonPaused\)\}/);
  assert.match(css, /\.practice-workspace > \.daily-meter\s*\{[^}]*grid-column: 1 \/ -1;/s);
  assert.match(css, /@media \(min-width: 821px\)\s*\{\s*@container practicecard \(min-width: 471px\)/);
  assert.match(css, /\.with-guidance-progress > \.daily-meter\s*\{[^}]*grid-column: 2;[^}]*grid-row: 2;/s);
});

test("ships Enter-confirmed falling words, advancing missing letters, and a real checked crossword", async () => {
  const [page, falling, puzzles, crossword, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/FallingWordsGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ProgressivePuzzles.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CrosswordGame.tsx", import.meta.url), "utf8"),
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
  assert.doesNotMatch(falling, /if \(paused \|\| gameOver \|\| briefing \|\| waveClear\) return/);
  assert.doesNotMatch(falling, /disabled=\{briefing \|\| paused \|\| gameOver \|\| Boolean\(waveClear\)\}/);
  assert.match(falling, /Alt\+M/);
  assert.match(falling, /drawFromContentDeck/);
  assert.match(falling, /activeWordKeysRef/);
  assert.match(falling, /damage-\$\{misses\}/);
  assert.match(falling, /Mission Failed — City Destroyed/);
  assert.match(falling, /createStereoPanner/);
  assert.match(falling, /state\.danger > 0\.68/);
  assert.match(falling, /threatPressure/);
  assert.match(falling, /state\.threatCount/);
  assert.match(falling, /RETRO_STEP_MS - threatPressure \* 52/);
  assert.match(falling, /city-skyline-back/);
  assert.match(falling, /city-smoke/);
  assert.match(falling, /city-rubble/);
  assert.match(falling, /missile-plume/);
  assert.doesNotMatch(falling, /onChange=\{\(event\) => captureWord/);
  assert.match(puzzles, /desiredAnswerPosition = \(levelIndex \* level\.length \+ puzzleIndex\) % 3/);
  assert.match(puzzles, /options\.splice\(desiredAnswerPosition, 0, expected\)/);
  assert.match(puzzles, /buildGeneratedLevel/);
  assert.match(puzzles, /buildGeneratedPuzzle/);
  assert.match(puzzles, /1450/);
  assert.match(puzzles, /missing-letter-input/);
  assert.match(puzzles, /missing-level-up/);
  assert.match(puzzles, /number-finger-guide/);
  assert.match(puzzles, /\^\(\?:Digit\|Numpad\)\(\[1-3\]\)\$/);
  assert.match(puzzles, /const choiceIndex = numberChoiceIndex\(event\)/);
  assert.match(puzzles, /왼손을 숫자열에 준비하세요/);
  assert.match(puzzles, /새끼/);
  assert.match(puzzles, /약지/);
  assert.match(puzzles, /가운데/);
  assert.match(puzzles, /function buildCrossword/);
  assert.match(puzzles, /answer: "한국어"/);
  assert.match(puzzles, /answer: "여행자"/);
  assert.match(puzzles, /function createCrossword/);
  assert.match(puzzles, /function validateMissingPuzzle/);
  assert.match(puzzles, /word: "떡볶이", missingIndex: 1/);
  assert.match(puzzles, /word: "괜찮아요", missingIndex: 1/);
  assert.match(puzzles, /word: "감사합니다", missingIndex: 2/);
  const activityPreview = await readFile(new URL("../app/ActivityPreview.tsx", import.meta.url), "utf8");
  assert.match(activityPreview, />강<\/text>/);
  assert.match(activityPreview, />지<\/text>/);
  assert.doesNotMatch(activityPreview, />사<\/text>[\s\S]*>과<\/text>/);
  assert.match(activityPreview, /crosswordPreviewCells/);
  assert.match(activityPreview, /\["한", "국", "어", "공", "부"\]/);
  assert.match(activityPreview, />3→<\/text>/);
  assert.match(activityPreview, />한국어공부<\/text>/);
  assert.match(puzzles, /\.map\(\(level, levelIndex\) => level\.map\(\(puzzle, puzzleIndex\)/);
  assert.match(crossword, /id="crossword-word-input"/);
  assert.match(crossword, /function checkActiveWord/);
  assert.match(crossword, /updateActiveDraft/);
  assert.match(crossword, /typed !== expected/);
  assert.match(crossword, /setEntryDrafts/);
  assert.match(crossword, /event\.key === "Enter"/);
  assert.match(crossword, /event\.key === "Tab"/);
  assert.match(crossword, /nextEntry\(1, nextSolved\)/);
  assert.match(crossword, /gameRootRef/);
  assert.match(crossword, /if \(status !== "solved" \|\| event\.key !== "Enter"/);
  assert.match(crossword, /gameRootRef\.current\?\.focus/);
  assert.doesNotMatch(crossword, /<input[\s\S]*?aria-label=\{`\$\{koreanUi \? "가로세로 칸"/);
  assert.match(css, /\.word-rain-board/);
  assert.match(css, /\.sea-water\.splash/);
  assert.match(css, /\.capture-burst/);
  assert.match(css, /\.mission-briefing/);
  assert.match(css, /\.neon-city/);
  assert.match(css, /\.neon-city\.damage-5/);
  assert.match(css, /\.city-damage-layer/);
  assert.match(css, /\.city-smoke/);
  assert.match(css, /\.city-rubble/);
  assert.match(css, /\.missile-plume/);
  assert.match(css, /@keyframes city-smoke-rise/);
  assert.match(css, /\.threat-alert\.active/);
  assert.match(css, /@keyframes city-impact/);
  assert.match(css, /@keyframes blast-ring/);
  assert.match(falling, /blast-core/);
  assert.match(falling, /blast-smoke/);
  assert.match(falling, /missile-shards/);
  assert.match(falling, /synthTone\(context, output, 72/);
  assert.match(css, /@keyframes aerial-detonation/);
  assert.match(css, /@keyframes aerial-smoke/);
  assert.match(css, /@keyframes missile-shard-fly/);
  assert.match(css, /\.capture-burst \.blast-core \{\s*animation: none !important;\s*opacity: \.94/);
  assert.match(css, /\.word-rain-console input\.input-error/);
  assert.match(css, /\.crossword-cell\.active-word/);
  assert.match(css, /\.crossword-cell\.wrong/);
  assert.match(css, /\.crossword-word-entry/);
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

// A count assertion used to stand here, and it passed while ten lessons and
// eleven travel phrases had no recording at all: the app derived MP3 URLs from
// array indexes, the synthesizer kept its own shorter copy of the sentences, and
// nothing compared the two. A missing file is not visibly broken — the player
// reads the 404 as "no recording" and drops to the device voice, which is why
// pronunciation quietly turned low-quality partway through a session. So the
// manifest both sides read is what gets checked.
test("ships both female and male prerecorded Korean audio for every mapped line", async () => {
  const audioDirectory = new URL("../public/audio/ko/", import.meta.url);
  const manifest = JSON.parse(
    await readFile(new URL("../scripts/korean-audio-lines.json", import.meta.url), "utf8"),
  );
  assert.ok(manifest.length >= 900, "manifest should cover the expanded vocabulary and sentence library");

  const expected = new Set();
  for (const [slug] of manifest) {
    for (const gender of ["female", "male"]) {
      const name = `${slug}-${gender}.mp3`;
      expected.add(name);
      assert.ok(
        (await stat(new URL(name, audioDirectory))).size > 1_000,
        `${name} must contain audio`,
      );
    }
  }

  const files = (await readdir(audioDirectory)).filter((name) => name.endsWith(".mp3"));
  assert.equal(files.length, expected.size);
  for (const name of files) {
    assert.ok(expected.has(name), `${name} is not referenced by the manifest`);
  }
});

// The manifest is generated from the app's own sentences; if it drifts, a
// recording says something different from the text on screen. That happened to
// two lines before this check existed.
test("prerecorded audio manifest matches the sentences the app practises", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../scripts/korean-audio-lines.json", import.meta.url), "utf8"),
  );
  const { practiceCurriculum } = await import("../app/practice-curriculum.ts");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /import koreanAudioLines from "\.\.\/scripts\/korean-audio-lines\.json"/);
  assert.match(page, /koreanAudioLines\.map\(\(\[slug, text\]\) =>/);
  const slugs = new Set(manifest.map(([slug]) => slug));
  assert.equal(slugs.size, manifest.length, "slugs must be unique");
  for (const [slug, text] of manifest) {
    assert.match(slug, /^(lesson|travel-korea|travel-welcome|scene|concept|drill|word|concept-extra|travel-extra|proverb)-\d{2,3}$/);
    assert.ok(text.trim().length > 0, `${slug} must have text`);
  }

  // The bug this guards against: the manifest was generated from the three
  // hardcoded arrays the old audio map happened to use, while the practice card
  // is driven by the selected learning concept. 47 of the 50 concept sentences
  // had no recording, so picking any concept meant the device voice from the
  // first sentence on — and the count-based test above still passed.
  const themes = await readFile(new URL("../app/content-themes.ts", import.meta.url), "utf8");
  const conceptSentences = [...new Set([...themes.matchAll(/korean:\s*"([^"]+)"/g)].map((m) => m[1]))];
  const recorded = new Set(manifest.map(([, text]) => text));
  const unvoiced = conceptSentences.filter((text) => !recorded.has(text));
  assert.deepEqual(unvoiced, [], "every learning-concept sentence needs a recording");
  const unvoicedPractice = practiceCurriculum
    .filter((item) => item.speak && !recorded.has(item.text))
    .map((item) => item.text);
  assert.deepEqual(unvoicedPractice, [], "every spoken practice word and sentence needs a recording");
});

test("keeps the selected interface language on class join and teacher pages", async () => {
  const [joinPage, teacherPage, localeHook] = await Promise.all([
    readFile(new URL("../app/join/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/teacher/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/use-active-locale.ts", import.meta.url), "utf8"),
  ]);

  assert.match(joinPage, /useActiveLocale\(\)/);
  assert.match(joinPage, /<GoogleSignIn locale=\{locale\}/);
  assert.match(teacherPage, /useActiveLocale\(\)/);
  assert.match(localeHook, /readManualLocalePreference/);
  assert.match(localeHook, /resolveVisitorLocale/);
});

test("keeps header controls out of the progress navigation at laptop widths", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /grid-template-columns: auto minmax\(0, 1fr\) auto/);
  // The 1360px caption-hiding hack is gone: the captions moved into the panel,
  // where there is room for the longest of the 33 languages.
  assert.match(css, /\.sound-menu-panel[\s\S]*?min-width: 280px/);
  const headerCss = await readFile(new URL("../app/home-header.module.css", import.meta.url), "utf8");
  // Scoped header rules override the historical hide-on-laptop rules above.
  assert.match(headerCss, /:global\(\.nav-links\) \{[^}]*display: flex !important;/s);
  assert.match(headerCss, /@media \(max-width: 1280px\)[\s\S]*?grid-column: 1 \/ -1/);
});
