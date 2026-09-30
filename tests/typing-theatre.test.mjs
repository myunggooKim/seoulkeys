import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { supportedLocaleCodes } from "../app/locale-detection.ts";
import { typingViewCopy } from "../app/typing-view-copy.ts";

test("basic is the default and changing views never remounts or replaces the shared input", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /useState<"basic" \| "theatre">\("basic"\)/);
  assert.equal((page.match(/id="hero-typing-input"/g) ?? []).length, 1);
  assert.match(page, /<TypingTheatre state=\{\{ started: lessonStarted, paused: lessonPaused, code: activePracticeKey\?\.code/);
  assert.match(page, /const restoreBasicView = useCallback\(\(\) => \{ setTheatreUnavailable\(true\); setPracticeView\("basic"\); \}, \[\]\)/);
  assert.doesNotMatch(page, /<HangulInput[^>]*key=\{practiceView\}/s);
  assert.doesNotMatch(page, /Ⅱ|↻ 다시 연습/);
  assert.match(page, /tr\(locale, "Pause", "일시정지"\)/);
  assert.match(page, /tr\(locale, "Resume", "계속하기"\)/);
});

test("every supported language has explicit view and clear-input labels", () => {
  for (const locale of supportedLocaleCodes) {
    const copy = typingViewCopy(locale);
    for (const label of Object.values(copy)) assert.ok(label.trim().length > 0, locale);
    assert.notEqual(copy.basic, copy.theatre);
  }
  assert.equal(typingViewCopy("ko").clear, "다시 입력");
  assert.equal(typingViewCopy("es").theatre, "Teatro");
});

test("Enter results and coaching cannot create a scrollbar inside the theatre screen", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.equal((page.match(/const lessonEvaluationPanel = lessonEvaluation &&/g) ?? []).length, 1);
  assert.match(page, /const externalPracticeFeedback = theatreActive \|\| practiceFocusMode/);
  assert.match(page, /\{!externalPracticeFeedback && lessonEvaluationPanel\}/);
  assert.match(page, /<div className="practice-feedback-dock">\s*\{typingFeedbackPanel\}\s*\{practiceCoachPanel\}\s*\{!theatreActive && lessonEvaluationPanel\}/);
  assert.match(page, /\{!externalPracticeFeedback && typingFeedbackPanel\}/);
  assert.doesNotMatch(page, /<div className="practice-guidance-column">\s*\{/);
  assert.match(css, /\.practice-workspace\.is-theatre \.lesson-evaluation \{[^}]*max-height: none; overflow: visible;/s);
  assert.match(css, /\.practice-workspace\.is-theatre \.lesson-evaluation dl \{[^}]*minmax\(0, 1fr\)/s);
});

test("theatre completion appears below today's practice, never over the keyboard", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const meter = page.slice(page.indexOf('<div className="daily-meter" id="progress">'), page.indexOf('<section className="activity-section"'));
  assert.match(meter, /className="meter-copy"[\s\S]*className="practice-meter-feedback">\s*\{lessonEvaluationPanel\}/);
  assert.match(page, /externalPracticeFeedback && \(!theatreActive \|\| !lessonEvaluation\)/);
  assert.equal((page.match(/className="practice-meter-feedback"/g) ?? []).length, 1);
  assert.match(css, /\.practice-workspace\.is-theatre \.practice-meter-feedback \{ flex: 0 0 100%; min-width: 0; width: 100%; \}/);
  assert.match(css, /\.practice-workspace\.is-theatre \.practice-meter-feedback:empty \{ display: none; \}/);
});

test("completion feedback cannot resize the right keyboard and focus hides the homepage", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /practiceFocusMode && <div className="practice-isolation-backdrop" aria-hidden="true"/);
  assert.match(css, /\.practice-isolation-backdrop \{ position: fixed; inset: 0; z-index: 39; background: var\(--ivory\); \}/);
  assert.match(css, /\.practice-feedback-dock \{ position: absolute; inset-inline: 0; bottom: 0;/);
  assert.doesNotMatch(css, /\.practice-workspace:has\(\.lesson-evaluation\) \.(keyboard-tools|next-key-card|key-guide|finger-callout|keyboard-map)/);
});

test("optional 3D is lazy, self-hosted, disposable and cannot mutate typing or stored progress", async () => {
  const [component, scene, rig, license] = await Promise.all([
    readFile(new URL("../app/TypingTheatre.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/cinema-scene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/cinema-hand-rig.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/images/typing-theatre/LICENSE.txt", import.meta.url), "utf8"),
  ]);
  assert.match(component, /import\("\.\/cinema-scene"\)/);
  assert.match(component, /if \(disposed\) \{ instance\.dispose\(\); return; \}/);
  assert.match(component, /\.catch\(fail\)/);
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /IntersectionObserver/);
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /renderer\.dispose\(\)/);
  assert.match(rig, /loadCinemaHandData\(side\)\.then\(data => loader\.parseAsync\(data, ""\)\)/);
  assert.match(license, /MIT License/);
  assert.doesNotMatch(component + scene + rig, /localStorage|keydown|keyup|\/api\/|https:\/\//);
});

test("both home view buttons expand without resetting typing, and warm-up never starts a renderer", async () => {
  const [page, component, rig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TypingTheatre.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/cinema-hand-rig.ts", import.meta.url), "utf8"),
  ]);
  const picker = page.slice(page.indexOf('<div className="practice-view-picker"'), page.indexOf('{theatreUnavailable &&'));
  assert.match(picker, /setPracticeView\("basic"\); beginPracticeFocusTransition\(\)/);
  assert.match(picker, /setPracticeView\("theatre"\); beginPracticeFocusTransition\(\)/);
  assert.doesNotMatch(picker, /setTyped|setLessonIndex|startTodayLesson/);
  assert.match(page, /if \(nextValue.length > 0\) beginPracticeFocusTransition\(\)/);
  assert.match(picker, /onPointerEnter=\{preloadTypingTheatre\} onFocus=\{preloadTypingTheatre\}/);
  assert.match(page, /connection\?\.saveData/);
  const warm = component.slice(component.indexOf('export function preloadTypingTheatre'), component.indexOf('/** Decoration only.'));
  assert.match(warm, /loadCinemaHandData\("left"\)/);
  assert.match(warm, /loadCinemaHandData\("right"\)/);
  assert.doesNotMatch(warm, /createCinemaScene\(|new WebGLRenderer|requestAnimationFrame/);
  assert.match(rig, /const assets = await Promise\.all\(sides\.map/);
});

test("both practice views fit the visual viewport and never reset the lesson when exiting focus", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /className="practice-focus-exit"[^>]*onClick=\{returnPracticeHome\}/);
  assert.match(page, /window\.visualViewport\?\.height \?\? window\.innerHeight/);
  assert.match(page, /notice\.getBoundingClientRect\(\)\.height \+ 16/);
  assert.match(css, /\.hero\.practice-focus-mode \.practice-stage \{[^}]*position: fixed/s);
  assert.match(css, /height: calc\(var\(--practice-viewport-height, 100dvh\) - 28px - var\(--practice-notice-height, 0px\)\)/);
  assert.match(css, /\.practice-focus-mode \.is-theatre \.practice-screen-stage \{[^}]*height: 100%; min-height: 0/s);
});

test("the current key is high contrast in theatre and the existing exit is named home", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.equal((page.match(/tr\(locale, "Go home", "홈으로"\)/g) ?? []).length, 2);
  assert.doesNotMatch(page, /tr\(locale, "Show intro", "소개 보기"\)/);
  assert.match(page, /className="practice-focus-exit"[^>]*onClick=\{returnPracticeHome\}/);
  assert.match(css, /\.practice-card\.has-theatre \.finger-callout kbd \{[^}]*background: #ffe16b; color: #152032;/s);
  assert.match(css, /\.practice-card\.has-theatre \.finger-callout kbd\.single-key \{ font-size: 22px; \}/);
  const luminance = hex => {
    const channels = hex.match(/.{2}/g).map(n => parseInt(n, 16) / 255)
      .map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  assert.ok((luminance("ffe16b") + .05) / (luminance("152032") + .05) > 12);
});

test("home exits theatre to basic and preserves the current lesson and input", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const home = page.slice(page.indexOf('  function returnPracticeHome()'), page.indexOf('  function startTodayLesson()'));
  assert.match(home, /setPracticeFocusMode\(false\)/);
  assert.match(home, /setPracticeView\("basic"\)/);
  assert.match(home, /window\.clearTimeout\(practiceFocusTimerRef\.current\)/);
  assert.match(home, /getElementById\("top"\)\?\.scrollIntoView/);
  assert.doesNotMatch(home, /setTyped|setLessonIndex|setLessonStarted|setLessonPaused|setElapsedSeconds|setLessonEvaluation/);
  assert.match(page, /onClick=\{practiceFocusMode \|\| practicePreparing \? returnPracticeHome : startTodayLesson\}/);
});
