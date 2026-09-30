import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { coreGlossary } from "../app/word-glossary-core.ts";
import { coreGlossaryTranslations } from "../app/word-glossary-translations.ts";
import { wordGlossAt } from "../app/word-glossary.ts";
import { fitGlossPosition } from "../app/word-meaning-position.ts";
import { supportedLocaleCodes } from "../app/locale-detection.ts";
import { progressiveWordGroups } from "../app/practice-curriculum.ts";
import { HandGuide } from "../app/HandGuide.tsx";
import { createHandModel, poseHandModel } from "../app/hand-guide-model.ts";
import { WordMeaningText } from "../app/WordMeaningText.tsx";

test("all 87 curriculum words have a definition in every supported language", () => {
  const words = progressiveWordGroups.flatMap((group) => group.words);
  assert.equal(coreGlossary.length, words.length);
  assert.deepEqual(coreGlossary.map((entry) => entry.word), words);
  for (const locale of supportedLocaleCodes) {
    if (locale !== "en" && locale !== "ko") assert.equal(coreGlossaryTranslations[locale].length, words.length, locale);
    for (const word of words) assert.ok(wordGlossAt(word, 0, locale)?.meaning, `${locale}: ${word}`);
  }
  assert.equal(wordGlossAt("하마", 1, "es").meaning, "hipopótamo");
  assert.equal(wordGlossAt("음악", 0, "ja").meaning, "音楽");
  assert.equal(wordGlossAt("이야기", 0, "fr").meaning, "histoire");
});

test("a sentence shows only the hovered dictionary word, never its particle", () => {
  const text = "저는 음악을 좋아해요. 친구와 한국을 여행해요.";
  assert.equal(wordGlossAt(text, 3, "es").meaning, "música");
  assert.equal(wordGlossAt(text, 4, "en").word, "음악");
  assert.equal(wordGlossAt(text, 5, "es"), null); // 을
  assert.equal(wordGlossAt(text, 0, "es"), null); // 저는: no guessed definition
  assert.equal(wordGlossAt("친구와", 0, "en").word, "친구");
  assert.equal(wordGlossAt("친구와", 2, "en"), null);
  assert.equal(wordGlossAt("서울에서는", 1, "en").word, "서울");
  assert.equal(wordGlossAt("서울에서는", 2, "en"), null);
  assert.equal(wordGlossAt("여행해요", 3, "es").meaning, "viaje");
  assert.equal(wordGlossAt("공부하고", 3, "en").word, "공부");
});

test("does not guess unknown words, partial matches, punctuation or isolated jamo", () => {
  for (const text of ["는", "이", "수", "ㄱ", "ㅎㅏ", "서울대학교", "음악회", ".", " ", "존재하지않는단어"]) assert.equal(wordGlossAt(text, 0, "en"), null, text);
  assert.equal(wordGlossAt("하마", -1, "en"), null);
  assert.equal(wordGlossAt("하마", 2, "en"), null);
  assert.equal(wordGlossAt("하마", 0.5, "en"), null);
});

test("Unicode indices remain aligned after emoji, quotes, spaces and newlines", () => {
  const text = "🌏 “한국을”\n음악";
  assert.equal(wordGlossAt(text, 3, "en").word, "한국");
  assert.equal(wordGlossAt(text, 5, "en"), null);
  assert.equal(wordGlossAt(text, 8, "en").word, "음악");
});

test("cursor popup fits narrow screens and flips above the lower edge", () => {
  assert.deepEqual(fitGlossPosition(350, 810, 260, 86, 390, 844), { left: 122, top: 712 });
  assert.deepEqual(fitGlossPosition(20, 20, 260, 86, 390, 844), { left: 34, top: 38 });
});

test("display wrapper preserves the original tag, character classes and binding markup", () => {
  const original = React.createElement("span", { className: "sentence-chunk" },
    React.createElement("span", { className: "correct", "data-gloss-index": 0 }, "한"),
    React.createElement("span", { className: "current", "data-gloss-index": 1 }, "국"));
  const html = renderToStaticMarkup(React.createElement(WordMeaningText, { text: "한국", locale: "es", className: "target-sentence", lang: "ko" }, original));
  assert.equal(html, '<p class="target-sentence" lang="ko"><span class="sentence-chunk"><span class="correct" data-gloss-index="0">한</span><span class="current" data-gloss-index="1">국</span></span></p>');
  const plain = renderToStaticMarkup(React.createElement(WordMeaningText, { as: "blockquote", text: "한국을 여행해요.", locale: "en", lang: "ko" }));
  assert.equal(plain.replace(/<[^>]*>/g, ""), "한국을 여행해요.");
  assert.ok(plain.startsWith('<blockquote lang="ko">'));
});

test("hand guide uses ten independent three-joint fingers without changing keyboard state", () => {
  const model = createHandModel();
  assert.equal(model.fingers.length, 10);
  for (const side of ["left", "right"]) {
    for (const name of ["pinky", "ring", "middle", "index", "thumb"]) {
      const id = `${side}-${name}`;
      const html = renderToStaticMarkup(React.createElement(HandGuide, { finger: id, keyLabel: "G" }));
      assert.ok(html.includes(`data-active-finger="${id}"`));
      assert.ok(html.includes("hand-guide-fallback") && !html.includes("clip-path"));
      poseHandModel(model.fingers, id, 1, 1);
      assert.equal(model.fingers.filter((finger) => finger.halo.visible).length, 1);
      const finger = model.fingers.find((finger) => finger.id === id);
      assert.equal(finger.joints.length, 3);
      assert.ok(finger.joints[1].rotation.x < -.3);
      for (const other of model.fingers.filter((item) => item.id !== id)) assert.equal(other.joints[1].rotation.x, -.11);
    }
  }
  const resting = renderToStaticMarkup(React.createElement(HandGuide, { finger: null }));
  assert.ok(resting.includes('data-active-finger=""'));
  poseHandModel(model.fingers, null, 0, 1);
  assert.equal(model.fingers.filter((finger) => finger.halo.visible).length, 0);
});

test("finger skin weights are finite and normalized, and surfaces face outwards", () => {
  const model = createHandModel();
  model.group.traverse((object) => {
    if (!object.isSkinnedMesh) return;
    const weights = object.geometry.getAttribute("skinWeight");
    for (let i = 0; i < weights.count; i++) {
      const sum = weights.getX(i) + weights.getY(i) + weights.getZ(i) + weights.getW(i);
      assert.ok(Number.isFinite(sum) && Math.abs(sum - 1) < 1e-6);
    }
    assert.ok(object.geometry.getAttribute("normal").getX(16 * 33) > .9);
  });
});
