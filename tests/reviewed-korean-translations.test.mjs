import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { guides } from "../app/learn/guides.ts";
import { koreanGuideTranslations } from "../app/learn/guides-ko.ts";
import { learningTr, loadLearningTranslations } from "../app/learn/learning-i18n.ts";
import { loadRuntimeTranslations, getRuntimeTranslation } from "../app/runtime-i18n.ts";
import { supportedLocaleCodes } from "../app/locale-detection.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { translationQualityIssue } from "../app/translation-quality.ts";
import { loadReviewedLearningTranslations } from "../scripts/load-reviewed-learning-translations.ts";

test("reviewed Korean library and every guide work before loading and after a failed request", async () => {
  const common = JSON.parse(await readFile(new URL("../public/i18n/learn/common/ko.json", import.meta.url), "utf8"));
  const verify = () => {
    for (const [english, korean] of Object.entries({ ...common, ...koreanGuideTranslations })) {
      assert.equal(learningTr("ko", english), korean);
      assert.equal(learningTr("en", english), english);
    }
    for (const guide of guides) {
      assert.notEqual(learningTr("ko", guide.title), guide.title);
      assert.notEqual(learningTr("ko", guide.quickAnswer), guide.quickAnswer);
    }
    assert.equal(learningTr("ko", "Unknown source", "검토된 문구"), "검토된 문구");
    assert.equal(learningTr("ko", "Unknown source"), "Unknown source");
    for (const locale of supportedLocaleCodes.filter((value) => value !== "ko")) {
      assert.equal(learningTr(locale, guides[0].quickAnswer), guides[0].quickAnswer);
    }
  };
  verify();
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.fetch = async () => { throw new Error("offline"); };
  try {
    await assert.rejects(loadLearningTranslations("ko", "korean-keyboard-layout"), /offline/);
    verify();
    await assert.rejects(loadLearningTranslations("km", "korean-keyboard-layout"), /offline/);
    assert.equal(learningTr("km", guides[0].quickAnswer), guides[0].quickAnswer);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test("non-Korean bundles still use valid translations and reject broken output", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  const source = guides[0].quickAnswer;
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => String(url).includes("/common/")
      ? { "Browse the guides": "Explora las guías" }
      : { [source]: "broken 123456789", "Top left": "Arriba a la izquierda" },
  });
  try {
    await loadLearningTranslations("es", "korean-keyboard-layout");
    assert.equal(learningTr("es", "Browse the guides", "가이드 둘러보기"), "Explora las guías");
    assert.equal(learningTr("es", "Top left"), "Arriba a la izquierda");
    assert.equal(learningTr("es", source), source);
    assert.equal(learningTr("en", "Browse the guides"), "Browse the guides");
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test("Korean legal corrections pass the runtime gate and retain privacy and retention commitments", async () => {
  const pack = JSON.parse(await readFile(new URL("../public/i18n/ko.json", import.meta.url), "utf8"));
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.fetch = async () => ({ ok: true, json: async () => pack });
  try {
    await loadRuntimeTranslations("ko");
    assert.equal(getRuntimeTranslation("ko", "PLAIN-LANGUAGE SUMMARY"), "쉬운 말로 정리한 요약");
    assert.equal(getRuntimeTranslation("ko", "Authenticated email address and display name"), "인증된 이메일 주소와 표시 이름");
    const retention = getRuntimeTranslation("ko", "Provide progress sync, the personal dashboard, and repeat-visit benefits. Retained with the learning account.");
    assert.match(retention, /개인 대시보드/);
    assert.match(retention, /학습 계정과 함께 보관됩니다/);
    const source = "Seoul Keys uses the authenticated account email and display name to provide a personal learning page. It does not sell personal information, build advertising profiles, or ask learners for phone numbers, precise locations, contacts, photos, or payment details.";
    assert.equal(getRuntimeTranslation("ko", source), "Seoul Keys는 개인 학습 페이지를 제공하기 위해 인증된 계정의 이메일 주소와 표시 이름을 사용합니다. 개인정보를 판매하거나 광고 프로필을 만들지 않으며, 학습자에게 전화번호, 정확한 위치, 연락처, 사진 또는 결제 정보를 요청하지 않습니다.");
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test("reviewed foreign learning corrections survive source export and ship in every matching bundle", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  await promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/export-learning-i18n-source.mts"], { cwd: root });
  const [reviewed, source] = await Promise.all([
    Promise.resolve(loadReviewedLearningTranslations(root)),
    readFile(new URL("../scratchpad/learning-i18n-source.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  for (const [locale, entries] of Object.entries(reviewed)) {
    const shipped = new Set();
    for (const [bundle, data] of Object.entries(source.bundles)) {
      const matching = data.keys.filter((key) => key in entries);
      if (!matching.length) continue;
      const pack = JSON.parse(await readFile(new URL(`../public/i18n/learn/${bundle}/${locale}.json`, import.meta.url), "utf8"));
      assert.deepEqual(Object.keys(pack).sort(), [...data.keys].sort(), `${locale}/${bundle}: changed source key set`);
      for (const english of matching) {
        assert.equal(data.existing[locale][english], entries[english], `${locale}: correction would be regenerated`);
        assert.equal(pack[english], entries[english], `${locale}/${bundle}: inconsistent reviewed value`);
        assert.equal(translationQualityIssue(english, pack[english]), null);
        for (const literal of english.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]+/gu) ?? []) {
          assert.ok(pack[english].includes(literal), `${locale}: changed Hangul literal ${literal}`);
        }
        shipped.add(english);
      }
    }
    assert.equal(shipped.size, Object.keys(entries).length, `${locale}: orphaned review entries`);
  }
});

test("stroke, vowel and syllable explanations retain their educational meanings in Japanese and Spanish", async () => {
  const reviewed = JSON.parse(await readFile(new URL("../scripts/reviewed-learning-translations.json", import.meta.url), "utf8"));
  const source = "See how the five basic consonants draw the speech organs and how vowel strokes grow from sky, earth, and human.";
  for (const term of ["基本子音5字", "発音器官", "母音", "天・地・人"]) assert.ok(reviewed.ja[source].includes(term));
  for (const term of ["consonantes básicas", "órganos del habla", "trazos de las vocales", "cielo", "tierra", "ser humano"]) assert.ok(reviewed.es[source].includes(term));
  assert.equal(reviewed.ja["+1 STROKE"], "+1画");
  assert.equal(reviewed.es["+2 STROKES"], "+2 trazos");
  for (const locale of ["ja", "es"]) {
    for (const [english, value] of Object.entries(reviewed[locale])) {
      if (/vowel|stroke|syllable/i.test(english)) {
        assert.doesNotMatch(value, /脳卒中|腸|ストライキ|ストレッチ|insectos|vasculares|\bsilla\b|\bvotos\b|estragos/iu, `${locale}: known semantic mistranslation`);
      }
    }
  }
  // These past errors passed the mechanical gate. This regression is semantic,
  // separate from decoder-quality checks; no claim of full language QA follows.
  assert.equal(translationQualityIssue(source, "Los insectos vasculares crecen desde el cielo, la tierra y los humanos."), null);
});

test("Hangul history and grammar labels do not regress to unrelated Japanese or Spanish meanings", async () => {
  const ja = JSON.parse(await readFile(new URL("../public/i18n/learn/hangul/ja.json", import.meta.url), "utf8"));
  const es = JSON.parse(await readFile(new URL("../public/i18n/learn/hangul/es.json", import.meta.url), "utf8"));
  assert.equal(ja["HANGUL GUIDE · 4 LESSONS"], "ハングルガイド · 4つのレッスン");
  assert.equal(ja["2 · Particles"], "2 · 助詞");
  assert.equal(ja["PREDICATE"], "述語");
  assert.equal(ja["tongue tip"], "舌先");
  assert.equal(es["GRAMMAR"], "GRAMÁTICA");
  assert.equal(es["PREDICATE"], "PREDICADO");
  assert.equal(es["right"], "derecha");
  assert.equal(es["WHO MADE HANGUL?"], "¿QUIÉN CREÓ HANGUL?");
  const letters = "The Annals record that King Sejong completed twenty-eight new letters and named them Hunminjeongeum — Proper Sounds for the Instruction of the People.";
  assert.match(ja[letters], /28字/);
  assert.doesNotMatch(ja[letters], /238/);
  assert.match(es[letters], /veintiocho letras/);
  const composition = "The standard layout splits along exactly this seam — consonants on the left hand, vowels on the right. Type ㅎ, ㅏ, ㄴ in order and the three letters assemble themselves into the single square 한. Blocking is the keyboard's job, not yours.";
  assert.match(ja[composition], /入力方式/);
  assert.match(es[composition], /método de entrada/);
});

test("formerly missing locales load all ten route packs and retain reviewed terminology and typing literals", async () => {
  const locales = ["th", "id", "ms", "vi", "my", "km", "lo", "bn", "ta", "ne", "si"];
  const bundles = ["common", "hangul", ...guides.map(guide => guide.slug)];
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const reviewed = JSON.parse(await readFile(new URL("../scripts/reviewed-learning-translations.json", import.meta.url), "utf8"));
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.fetch = async (url) => {
    assert.match(String(url), /^\/i18n\/learn\/[a-z-]+\/[A-Za-z-]+\.json$/u);
    return { ok: true, json: async () => JSON.parse(await readFile(new URL(`../public${url}`, import.meta.url), "utf8")) };
  };
  try {
    for (const locale of locales) {
      for (const bundle of bundles) {
        await loadLearningTranslations(locale, bundle);
        const pack = JSON.parse(await readFile(new URL(`../public/i18n/learn/${bundle}/${locale}.json`, import.meta.url), "utf8"));
        for (const [english, value] of Object.entries(pack)) {
          assert.equal(learningTr(locale, english), value, `${locale}/${bundle}: runtime ignored a valid pack`);
          assert.equal(translationQualityIssue(english, value), null);
          for (const literal of english.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]+/gu) ?? []) assert.ok(value.includes(literal));
          if (reviewed[locale][english]) assert.equal(value, reviewed[locale][english]);
        }
      }
      assert.notEqual(learningTr(locale, "HANGUL GUIDE · 4 LESSONS"), "HANGUL GUIDE · 4 LESSONS");
      for (const literal of ["gks", "G + K + S", "Shift+Q", "한", "ㄱ + ㅏ"]) assert.equal(learningTr(locale, literal), literal);
    }
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test("all eight guide overviews in Japanese, Spanish and the eleven added locales preserve actionable keyboard instructions", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const reviewed = loadReviewedLearningTranslations(root);
  const locales = ["ja", "es", "th", "id", "ms", "vi", "my", "km", "lo", "bn", "ta", "ne", "si"];
  for (const locale of locales) {
    for (const guide of guides) {
      const pack = JSON.parse(await readFile(new URL(`../public/i18n/learn/${guide.slug}/${locale}.json`, import.meta.url), "utf8"));
      for (const english of [guide.title, guide.quickAnswer]) {
        const value = reviewed[locale][english];
        assert.ok(value && value !== english, `${locale}/${guide.slug}: untranslated overview`);
        assert.equal(pack[english], value, `${locale}/${guide.slug}: overview not shipped locally`);
        assert.equal(translationQualityIssue(english, value), null);
        if (locale !== "ja") assert.doesNotMatch(value, /[\u4E00-\u9FFF]/u, `${locale}: accidental Chinese text`);
        const literals = english.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]+|(?:Shift|Control|Windows)\+[A-Za-z]+|\b[A-Z](?:[–—-][A-Z])+\b/gu) ?? [];
        for (const literal of literals) assert.ok(value.includes(literal), `${locale}/${guide.slug}: lost ${literal}`);
      }
    }
    assert.ok(reviewed[locale][guides.find(guide => guide.slug === "korean-typing-mistakes").quickAnswer].includes("gks"));
  }
});

test("reviewed keyboard table keeps each direction separate and survives pack export", async () => {
  const table = JSON.parse(await readFile(new URL("../scripts/reviewed-keyboard-table.json", import.meta.url), "utf8"));
  for (const [locale, values] of Object.entries(table.locales)) {
    assert.equal(values.length, table.keys.length);
    const entries = Object.fromEntries(table.keys.map((key, index) => [key, values[index]]));
    const pack = JSON.parse(await readFile(new URL(`../public/i18n/learn/korean-keyboard-layout/${locale}.json`, import.meta.url), "utf8"));
    for (const [key, value] of Object.entries(entries)) {
      if (key in pack) assert.equal(pack[key], value, `${locale}: incorrect table label ${key}`);
    }
    for (const row of ["Top", "Home", "Bottom"]) {
      assert.notEqual(entries[`${row} left`], entries[`${row} right`], `${locale}: left and right merged`);
    }
    assert.notEqual(entries["Aspirated consonants"], entries["Tense consonants and shifted vowels"]);
  }
});

test("mobile learning-only navigation and action buttons wrap instead of widening the page", async () => {
  const css = await readFile(new URL("../app/learn/learn.module.css", import.meta.url), "utf8");
  const mobile = css.split("@media (max-width: 700px)")[1].split("@media (max-width: 430px)")[0];
  assert.match(mobile, /\.headerNav \.navCta\s*\{[^}]*min-width: 0;[^}]*white-space: normal;[^}]*overflow-wrap: anywhere;/su);
  assert.match(mobile, /\.primaryButton,\s*\.secondaryButton\s*\{[^}]*max-width: 100%;[^}]*white-space: normal;/su);
  assert.match(mobile, /\.languagePicker\s*\{[^}]*flex-shrink: 0;/su);
});
