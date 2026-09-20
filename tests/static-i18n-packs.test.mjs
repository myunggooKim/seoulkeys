import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { translationQualityIssue } from "../app/translation-quality.ts";

const root = process.cwd();
const packRoot = path.join(root, "public", "i18n");
const locales = [
  "ko", "es", "pt-BR", "ja", "zh-Hans", "zh-Hant", "fr", "de", "it", "pl", "nl", "ru", "tr",
  "ar", "fa", "ur", "fil", "th", "id", "ms", "vi", "my", "km", "lo", "hi", "bn", "ta", "ne",
  "si", "kk", "uz", "mn",
];

test("every supported non-English locale has a complete static pack", () => {
  const packs = locales.map((locale) => {
    const filePath = path.join(packRoot, `${locale}.json`);
    assert.ok(fs.existsSync(filePath), `missing locale pack: ${locale}`);
    return [locale, JSON.parse(fs.readFileSync(filePath, "utf8"))];
  });

  const expectedKeys = Object.keys(packs[0][1]).sort();
  assert.ok(expectedKeys.length >= 1_900, `expected a full pack, received ${expectedKeys.length} keys`);
  for (const [locale, pack] of packs) {
    assert.deepEqual(Object.keys(pack).sort(), expectedKeys, `${locale} key set differs`);
    assert.ok(Object.values(pack).every((value) => typeof value === "string" && value.trim()), `${locale} contains an empty value`);
    assert.ok(
      Object.values(pack).every((value) => !/(?:ZXQ|QXZ|8675309)/i.test(value)),
      `${locale} contains an unrestored placeholder`,
    );
    for (const protectedLabel of ["Seoul Keys", "Microsoft Clarity", "Cloudflare Web Analytics", "TTS", "XP", "Enter"]) {
      if (protectedLabel in pack) {
        assert.equal(pack[protectedLabel], protectedLabel, `${locale} corrupted ${protectedLabel}`);
      }
    }
  }
});

test("content, teacher, game, and legal coverage is present in every pack", () => {
  const criticalKeys = [
    "Where is the restroom?",
    "a train station",
    "Teacher dashboard",
    "Correct!",
    "Legal & Safety Center",
    "Privacy by minimization",
    "Build fluent rhythm with timeless Korean sayings and practical maxims.",
  ];
  for (const locale of locales) {
    const pack = JSON.parse(fs.readFileSync(path.join(packRoot, `${locale}.json`), "utf8"));
    for (const key of criticalKeys) {
      assert.equal(typeof pack[key], "string", `${locale} is missing ${key}`);
      assert.ok(pack[key].trim(), `${locale} has an empty translation for ${key}`);
    }
    for (const key of ["Where is the restroom?", "Teacher dashboard", "Correct!", "Privacy by minimization"]) {
      assert.notEqual(pack[key], key, `${locale} left a critical phrase in English: ${key}`);
    }
  }
});

test("runtime quality gate rejects known decoder failures without rejecting normal translations", () => {
  const source = "The preview uses browser local storage for essential preferences and daily lesson continuity. It does not load Google AdSense, behavioral advertising, or social pixels.";
  assert.equal(
    translationQualityIssue(source, "Бұзылған нәтиже 875309097531"),
    "unexpected number run",
  );
  assert.equal(
    translationQualityIssue(source, "ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក ការរក្សាទុក"),
    "repeated token loop",
  );
  assert.equal(
    translationQualityIssue("Practice Korean typing for 10 minutes.", "Practica mecanografía coreana durante 10 minutos."),
    null,
  );

  for (const locale of locales) {
    const pack = JSON.parse(fs.readFileSync(path.join(packRoot, `${locale}.json`), "utf8"));
    const usable = Object.entries(pack).filter(([english, value]) => !translationQualityIssue(english, value));
    assert.ok(usable.length >= 1_800, `${locale} quality gate discarded too much of the locale pack`);
  }
});

test("the client translator no longer imports the monolithic dictionaries", () => {
  const source = fs.readFileSync(path.join(root, "app", "ui-i18n.ts"), "utf8");
  assert.match(source, /getRuntimeTranslation/);
  assert.doesNotMatch(source, /ui-i18n-(?:legacy|multi|multi2|targeted|fill|rest|setup)/);
});

test("all browser JavaScript chunks remain below the 500 KiB split threshold", () => {
  const assetRoot = path.join(root, "dist", "client", "assets");
  const chunks = fs.readdirSync(assetRoot)
    .filter((name) => name.endsWith(".js"))
    .map((name) => [name, fs.statSync(path.join(assetRoot, name)).size]);
  assert.ok(chunks.length > 0, "client build chunks were not found");
  for (const [name, size] of chunks) {
    assert.ok(size < 500 * 1024, `${name} is ${(size / 1024).toFixed(1)} KiB`);
  }
});
