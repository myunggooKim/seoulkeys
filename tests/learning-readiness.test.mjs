import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { guides } from "../app/learn/guides.ts";
import { browserJamoForKey, insertBrowserJamo } from "../app/browser-hangul-input.ts";
import { loadReviewedLearningTranslations } from "../scripts/load-reviewed-learning-translations.ts";

test("Hangul source distinguishes initial/final ㅇ and removes unsupported learning guarantees", async () => {
  const page = await readFile(new URL("../app/learn/hangul/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /halves what you have to memorise|each added stroke pushes more breath|only script whose creator|glottal · \/ŋ\//u);
  assert.match(page, /ㅇ is silent at the start of a syllable and represents \/ŋ\/ at the end/u);
  assert.match(page, /Added strokes do not always mean more breath/u);
  assert.match(page, /The Hunminjeongeum Haerye preserves/u);
  assert.match(page, /base: "ㅇ", b1: "∅ \/ ŋ"/u);
});

test("글 remains the same physical typing example but is correctly labelled closed", () => {
  const example = guides[0].sections.flatMap(section => section.examples ?? []).find(value => value.keys === "rmf");
  assert.deepEqual(example, { label: "One closed block", keys: "rmf", result: "글", note: "ㄱ + ㅡ + ㄹ" });
});

test("all literal Latin key sequences in the eight guides produce their stated Hangul results", () => {
  let checked = 0;
  for (const guide of guides) {
    const examples = [...guide.sections.flatMap(section => section.examples ?? []), ...guide.drill.items];
    for (const example of examples) {
      if (!/^[A-Za-z ]+$/u.test(example.keys) || !/[가-힣]/u.test(example.result)) continue;
      let value = "";
      for (const key of example.keys) {
        if (key === " ") { value += " "; continue; }
        const jamo = browserJamoForKey({ key, code: `Key${key.toUpperCase()}`, shiftKey: key !== key.toLowerCase() });
        assert.ok(jamo, `${guide.slug}: unsupported key ${key}`);
        value = insertBrowserJamo(value, value.length, value.length, jamo).value;
      }
      assert.equal(value, example.result, `${guide.slug}: ${example.keys} is not ${example.result}`);
      checked++;
    }
  }
  assert.ok(checked >= 30, `insufficient key examples checked: ${checked}`);
});

test("public learning packs never present unreviewed detailed translations as reviewed prose", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const reviews = loadReviewedLearningTranslations(root);
  const packsRoot = new URL("../public/i18n/learn/", import.meta.url);
  const bundles = (await readdir(packsRoot, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name);
  const locales = (await readdir(new URL("common/", packsRoot))).filter(name => name.endsWith(".json") && name !== "ko.json").map(name => name.slice(0, -5));
  const common = JSON.parse(await readFile(new URL("common/ko.json", packsRoot), "utf8"));
  const navigation = new Set(Object.keys(common).filter(key => key.length < 72));
  const recovered = new Set(["th", "id", "ms", "vi", "my", "km", "lo", "bn", "ta", "ne", "si"]);
  for (const locale of locales) {
    const approved = reviews[locale] ?? {};
    for (const bundle of bundles) {
      const pack = JSON.parse(await readFile(new URL(`../public/i18n/learn/${bundle}/${locale}.json`, import.meta.url), "utf8"));
      for (const [english, value] of Object.entries(pack)) {
        if (value !== english && (!navigation.has(english) || recovered.has(locale))) assert.equal(value, approved[english], `${locale}/${bundle}: unreviewed educational text`);
      }
    }
  }
});

test("offline Korean fallback is a source module, synchronized with the public pack", async () => {
  const [runtime, source, pack] = await Promise.all([
    readFile(new URL("../app/learn/learning-i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/common-ko.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/i18n/learn/common/ko.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  assert.match(runtime, /from "\.\/common-ko\.json"/u);
  assert.doesNotMatch(runtime, /from "\.\.\/\.\.\/public\//u);
  assert.deepEqual(source, pack);
});

test("eleven added locales retain actionable native learning controls", async () => {
  const matrix = JSON.parse(await readFile(new URL("../scripts/reviewed-learning-controls.json", import.meta.url), "utf8"));
  for (const [locale, values] of Object.entries(matrix.locales)) {
    const pack = JSON.parse(await readFile(new URL(`../public/i18n/learn/common/${locale}.json`, import.meta.url), "utf8"));
    assert.equal(values.length, matrix.keys.length);
    matrix.keys.forEach((key, index) => assert.equal(pack[key], values[index], `${locale}: missing ${key}`));
  }
});

test("long mobile Hangul navigation wraps without touching main practice styles", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/learn/hangul/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/learn.module.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /hangul-guide \$\{styles\.hangulPage\}/u);
  assert.match(css, /\.hangulPage :global\(\.hg-practice\)\s*\{[^}]*white-space: normal;[^}]*overflow-wrap: anywhere;/u);
  assert.match(css, /\.hangulPage :global\(\.hg-footer\)\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/u);
});
