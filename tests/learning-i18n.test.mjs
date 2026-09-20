import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

test("offers every supported locale in the learning header and persists manual selection", async () => {
  const [{ supportedLocaleCodes }, chrome, css, hook] = await Promise.all([
    import("../app/locale-detection.ts"),
    readFile(new URL("../app/learn/LearningChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/learn.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/use-active-locale.ts", import.meta.url), "utf8"),
  ]);

  assert.equal(supportedLocaleCodes.length, 33);
  assert.equal(new Set(supportedLocaleCodes).size, supportedLocaleCodes.length);
  assert.match(chrome, /^"use client";/);
  assert.match(chrome, /<select/);
  assert.match(chrome, /supportedLocaleCodes\.map/);
  assert.match(chrome, /saveManualLocalePreference\(window\.localStorage/);
  assert.match(chrome, /useActiveLocale\(\{ loadRuntimePack: false \}\)/);
  assert.match(chrome, /learningTr\(locale,/);
  assert.match(css, /\.languagePicker select/);
  assert.match(hook, /loadRuntimePack = true/);
});

test("keeps English SEO on the server while localizing hub and current guide in client renderers", async () => {
  const [hubPage, articlePage, hubClient, articleClient, runtime] = await Promise.all([
    readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/LearningLibraryClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/GuideArticleClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/learning-i18n.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(hubPage, /^"use client";/);
  assert.doesNotMatch(articlePage, /^"use client";/);
  assert.match(hubPage, /inLanguage: "en"/);
  assert.match(articlePage, /inLanguage: "en"/);
  assert.match(hubPage, /<LearningLibraryClient cards=\{cards\}/);
  assert.match(articlePage, /<GuideArticleClient guide=\{guide\}/);
  assert.match(hubClient, /useLearningTranslations\(locale\)/);
  assert.match(articleClient, /useLearningTranslations\(locale, guide\.slug\)/);
  assert.match(articleClient, /learningTr\(locale, guide\.quickAnswer\)/);
  assert.match(articleClient, /learningTr\(locale, paragraph\)/);
  assert.match(articleClient, /learningTr\(locale, faq\.answer\)/);
  assert.match(articleClient, /<code dir="ltr">\{example\.keys\}<\/code>/);
  assert.match(articleClient, /<strong lang="ko">\{example\.result\}<\/strong>/);
  assert.match(runtime, /\/i18n\/learn\/common\/\$\{safeLocale\}\.json/);
  assert.match(runtime, /\/i18n\/learn\/\$\{encodeURIComponent\(bundle\)\}/);
});

test("reviewed Korean covers every translatable string in the eight guide data objects", async () => {
  const [{ guides }, { isGuideTypingLiteral }, { koreanGuideTranslations }] = await Promise.all([
    import("../app/learn/guides.ts"),
    import("../app/learn/guide-typing-literals.ts"),
    import("../app/learn/guides-ko.ts"),
  ]);
  const expected = new Set();
  const add = (value) => {
    if (value && /[A-Za-z]/.test(value) && !isGuideTypingLiteral(value)) expected.add(value);
  };
  const addExample = (example) => {
    add(example.label);
    add(example.note);
  };

  for (const guide of guides) {
    [guide.title, guide.cardTitle, guide.description, guide.eyebrow, ...guide.learningGoals, ...guide.intro, guide.quickAnswer]
      .forEach(add);
    for (const section of guide.sections) {
      [section.title, ...section.paragraphs, ...(section.bullets ?? []), ...(section.steps ?? [])].forEach(add);
      if (section.table) {
        add(section.table.caption);
        section.table.headers.forEach(add);
        section.table.rows.flat().forEach(add);
      }
      section.examples?.forEach(addExample);
      if (section.note) [section.note.title, section.note.body].forEach(add);
    }
    [guide.drill.title, guide.drill.instructions, guide.drill.checkpoint].forEach(add);
    guide.drill.items.forEach(addExample);
    guide.mistakes.forEach(({ mistake, fix }) => [mistake, fix].forEach(add));
    guide.faqs.forEach(({ question, answer }) => [question, answer].forEach(add));
    guide.references.forEach(({ title, publisher }) => [title, publisher].forEach(add));
  }

  const missing = [...expected].filter((english) => !koreanGuideTranslations[english]);
  assert.deepEqual(missing, [], `missing reviewed Korean:\n${missing.join("\n")}`);
});

test("exports route-scoped learning bundles without adding guide prose to the home pack", async () => {
  const [learningExporter, applicationExporter, generator] = await Promise.all([
    readFile(new URL("../scripts/export-learning-i18n-source.mts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/export-static-i18n-source.mts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-static-i18n-packs.py", import.meta.url), "utf8"),
  ]);

  assert.match(learningExporter, /learning-i18n-source\.json/);
  assert.match(learningExporter, /bundle\("common"\)/);
  assert.match(learningExporter, /bundle\("hangul"\)/);
  assert.match(learningExporter, /pairedKorean/);
  assert.match(learningExporter, /bundle\(guide\.slug\)/);
  assert.match(learningExporter, /koreanGuideTranslations/);
  assert.doesNotMatch(applicationExporter, /learn\/guides|koreanGuideTranslations/);
  assert.match(applicationExporter, /fullPath === path\.join\(appRoot, "learn"\)/);
  assert.match(generator, /choices=\("application", "learning"\)/);
  assert.match(generator, /union_keys, union_existing, legacy_cache = merge_learning_bundles\(source_bundles\)/);
  assert.match(generator, /generated = generate_locale_set\([\s\S]*?keys=union_keys/);
  assert.match(generator, /cache_seed_by_locale=legacy_cache/);
  assert.doesNotMatch(generator, /cache_root=LEARNING_CACHE_ROOT \/ name/);
  assert.match(generator, /LEARNING_OUTPUT_ROOT \/ name/);
  assert.match(generator, /unique_values = sorted\(dict\.fromkeys\(values\), key=len, reverse=True\)/);
  assert.match(generator, /required_protected_values\(key, learning_content\)/);
  assert.match(generator, /"Hangul is the script; Korean has the grammar": \(/);
});

test("keeps Hangul lessons tabbed, crawlable, sourced, and locale-aware", async () => {
  const [page, css, learningCss] = await Promise.all([
    readFile(new URL("../app/learn/hangul/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/learn.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useActiveLocale\(\{ loadRuntimePack: false \}\)/);
  assert.match(page, /useLearningTranslations\(locale, "hangul"\)/);
  assert.match(page, /id="birth-of-hangul"/);
  assert.match(page, /id="korean-grammar"/);
  assert.match(page, /role="tablist"/);
  assert.match(page, /role="tabpanel"/);
  assert.match(page, /hidden=\{activeLesson !== "consonants"\}/);
  assert.match(page, /window\.history\.pushState/);
  assert.match(page, /window\.addEventListener\("popstate"/);
  assert.match(page, /className="hg-lesson-pager"/);
  assert.match(page, /The creator named in the record is King Sejong/);
  assert.match(page, /Eight Hall of Worthies scholars wrote the Haerye explanations/);
  assert.match(page, /HANGEUL DAY · A NATIONAL HOLIDAY/);
  assert.match(page, /Hangul is the script; Korean has the grammar/);
  assert.match(page, /SUBJECT/);
  assert.match(page, /PREDICATE/);
  assert.match(page, /sillok\.history\.go\.kr/);
  assert.match(page, /heritage\.go\.kr/);
  assert.match(page, /unesco\.org/);
  assert.match(page, /korean\.go\.kr/);
  assert.match(css, /\.hg-section-tabs/);
  assert.match(css, /\.hg-section-tabs button\.is-active/);
  assert.match(css, /\.hg-lesson\[hidden\]/);
  assert.match(css, /\.hg-lesson-pager/);
  assert.match(css, /\.hg-history-grid/);
  assert.match(css, /\.hg-grammar-grid/);
  assert.match(css, /text-wrap: pretty/);
  assert.match(learningCss, /:global\(html\[lang="ko"\]\) \.page/);
  assert.match(learningCss, /word-break: keep-all/);
  assert.match(learningCss, /@media \(max-width: 430px\)/);
});

test("ships a complete route-scoped learning pack for every supported locale", async () => {
  const { supportedLocaleCodes } = await import("../app/locale-detection.ts");
  const { translationQualityIssue } = await import("../app/translation-quality.ts");
  const locales = supportedLocaleCodes.filter((locale) => locale !== "en");
  const bundleNames = [
    "common",
    "hangul",
    "korean-keyboard-layout",
    "add-korean-keyboard",
    "hangul-syllable-blocks",
    "type-batchim",
    "type-double-consonants-and-vowels",
    "korean-touch-typing",
    "korean-typing-mistakes",
    "korean-typing-practice-plan",
  ];

  for (const bundleName of bundleNames) {
    const bundleUrl = new URL(`../public/i18n/learn/${bundleName}/`, import.meta.url);
    const files = (await readdir(bundleUrl)).filter((name) => name.endsWith(".json")).sort();
    assert.deepEqual(
      files,
      locales.map((locale) => `${locale}.json`).sort(),
      `${bundleName} does not contain every locale`,
    );

    const korean = JSON.parse(await readFile(new URL("ko.json", bundleUrl), "utf8"));
    const expectedKeys = Object.keys(korean).sort();
    assert.ok(expectedKeys.length > 0, `${bundleName} has no translated strings`);

    for (const locale of locales) {
      const pack = JSON.parse(await readFile(new URL(`${locale}.json`, bundleUrl), "utf8"));
      assert.deepEqual(Object.keys(pack).sort(), expectedKeys, `${bundleName}/${locale} key set differs`);
      assert.ok(
        Object.values(pack).every((value) => typeof value === "string" && value.trim()),
        `${bundleName}/${locale} contains an empty translation`,
      );
      assert.ok(
        Object.values(pack).every((value) => !/(?:ZXQ|QXZ|8675309)/i.test(value)),
        `${bundleName}/${locale} contains an unrestored placeholder`,
      );
      for (const source of expectedKeys) {
        assert.equal(
          translationQualityIssue(source, pack[source]),
          null,
          `${bundleName}/${locale} contains broken output for ${source}`,
        );
        const koreanExamples = [...new Set(source.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]+/g) ?? [])];
        for (const example of koreanExamples) {
          assert.ok(
            pack[source].includes(example),
            `${bundleName}/${locale} changed Korean example ${example}`,
          );
        }
      }
    }
  }
});
