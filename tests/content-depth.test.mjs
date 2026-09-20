import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createContentDeck, drawFromContentDeck } from "../app/content-deck.ts";
import { learningThemes } from "../app/content-themes.ts";
import {
  expandedThemeSentences,
  expandedTravelPhrases,
  proverbEntries,
} from "../app/expanded-content.ts";
import { proverbMeaningTranslations } from "../app/proverb-meaning-translations.ts";
import {
  proverbCardDescriptions,
  proverbUiEnglish,
  proverbUiTranslations,
} from "../app/proverb-ui-translations.ts";
import { buildGeneratedLevel, makeThemedCrosswordBoard } from "../app/ProgressivePuzzles.tsx";
import { practiceCurriculum } from "../app/practice-curriculum.ts";

test("ships a deep, validated learning-content library", async () => {
  const words = learningThemes.flatMap((theme) => theme.words);
  const uniqueWords = new Set(words.map((entry) => entry.word));
  const expandedSentences = Object.values(expandedThemeSentences).flat();
  const travelPhrases = Object.values(expandedTravelPhrases).flat();

  assert.ok(uniqueWords.size >= 420, `expected at least 420 unique words, got ${uniqueWords.size}`);
  assert.ok(expandedSentences.length >= 120);
  assert.ok(travelPhrases.length >= 120);
  assert.ok(proverbEntries.length >= 80);

  for (const entry of words) {
    assert.match(entry.word, /[가-힣]/, `word must contain Hangul: ${entry.word}`);
    assert.ok(entry.meaningKo?.trim(), `missing Korean clue: ${entry.word}`);
    assert.ok(entry.meaningEn?.trim(), `missing English clue: ${entry.word}`);
  }

  const manifest = JSON.parse(
    await readFile(new URL("../scripts/korean-audio-lines.json", import.meta.url), "utf8"),
  );
  const recorded = new Set(manifest.map(([, text]) => text));
  for (const text of [
    ...words.map((entry) => entry.word),
    ...expandedSentences.map((entry) => entry.korean),
    ...travelPhrases.map((entry) => entry.korean),
    ...proverbEntries.map((entry) => entry.korean),
  ]) {
    assert.ok(recorded.has(text), `static TTS manifest is missing: ${text}`);
  }
});

test("every proverb explanation and control is localized in every supported language", () => {
  const locales = [
    "en", "ko", "es", "pt-BR", "ja", "zh-Hans", "zh-Hant",
    "fr", "de", "it", "pl", "nl", "ru", "tr", "ar", "fa", "ur",
    "fil", "th", "id", "ms", "vi", "my", "km", "lo", "hi", "bn",
    "ta", "ne", "si", "kk", "uz", "mn",
  ];
  const uiKeys = Object.keys(proverbUiEnglish);

  assert.deepEqual(
    Object.keys(proverbMeaningTranslations).sort(),
    locales.filter((locale) => locale !== "en" && locale !== "ko").sort(),
  );
  assert.deepEqual(Object.keys(proverbUiTranslations).sort(), [...locales].sort());
  assert.deepEqual(Object.keys(proverbCardDescriptions).sort(), [...locales].sort());
  for (const locale of locales) {
    if (locale !== "en" && locale !== "ko") {
      assert.equal(proverbMeaningTranslations[locale].length, proverbEntries.length);
      proverbMeaningTranslations[locale].forEach((meaning, index) => {
        assert.ok(meaning?.trim(), `missing ${locale} meaning for proverb ${index + 1}`);
      });
    }
    for (const key of uiKeys) {
      assert.ok(proverbUiTranslations[locale][key]?.trim(), `missing ${locale} UI: ${key}`);
    }
  }
});

test("confirmed UI fallbacks are translated without changing lesson data", async () => {
  const locales = [
    "es", "pt-BR", "ja", "zh-Hans", "zh-Hant", "fr", "de", "it", "pl",
    "nl", "ru", "tr", "ar", "fa", "ur", "fil", "th", "id", "ms", "vi",
    "my", "km", "lo", "hi", "bn", "ta", "ne", "si", "kk", "uz", "mn",
  ];
  const keys = [
    "Sound", "Volume", "Preview", "Off", "Low", "High",
    "Continue with Google", "Could not load Google Sign-In.",
    "How will you use Seoul Keys?", "I'm learning",
    "Save your own progress and rewards.", "I'm a teacher",
    "Create classes and track your students.", "Signing in…",
    "This Google account is already linked to another member.",
    "Sign-in failed. Please try again.",
    "task", "Teacher Portal", "days", "Now", "target", "Day",
    "Teacher's Custom Typing Assignments", "Completed", "Start Practice",
    "Member breakdown", "Who has signed up", "Loading…", "Total members",
    "Teachers (opened a class)", "Individual learners", "By country",
    "No members yet.", "teachers",
    "Welcome back!", "Hangul Explorer", "Rhythm Typist", "Korean Key Star",
    "Next reward", "beats", "Long-streak badge",
    "My learning",
    "Sign in with Google to save your progress, streak, and rewards to your account.",
    "Back to practice",
    "Not yet — this line keeps going. Stay on the keys.",
    "One line, two sentences — keep going without Enter.",
    ...new Set(practiceCurriculum.map((item) => item.instructionEn)),
  ];

  for (const locale of locales) {
    const pack = JSON.parse(
      await readFile(new URL(`../public/i18n/${locale}.json`, import.meta.url), "utf8"),
    );
    for (const key of keys) {
      assert.ok(pack[key]?.trim(), `missing ${locale}: ${key}`);
      assert.notEqual(pack[key], key, `English fallback ${locale}: ${key}`);
    }
  }
});

test("shuffle deck offers every item before repeating", () => {
  const source = Array.from({ length: 40 }, (_, id) => ({ id: String(id) }));
  const deck = createContentDeck();
  const firstCycle = Array.from(
    { length: source.length },
    () => drawFromContentDeck(deck, source, (entry) => entry.id, new Set(), () => 0.37).id,
  );
  assert.equal(new Set(firstCycle).size, source.length);
  const next = drawFromContentDeck(deck, source, (entry) => entry.id, new Set(), () => 0.37).id;
  assert.notEqual(next, firstCycle.at(-1));
});

test("missing-letter and crossword rounds rotate through varied material", () => {
  const theme = learningThemes[0];
  const deck = createContentDeck();
  const threeLevels = [0, 1, 2].flatMap((level) => buildGeneratedLevel(level, theme.words, deck));
  assert.equal(new Set(threeLevels.map((puzzle) => puzzle.word)).size, threeLevels.length);

  const signatures = new Set();
  for (let board = 0; board < 10; board += 1) {
    const puzzle = makeThemedCrosswordBoard(board, "travel");
    assert.ok(puzzle.entries.length >= 6, `crossword board ${board} is too sparse`);
    signatures.add(puzzle.entries.map((entry) => entry.answer).sort().join("|"));
  }
  assert.ok(signatures.size >= 6, `expected varied crossword boards, got ${signatures.size}`);
});
