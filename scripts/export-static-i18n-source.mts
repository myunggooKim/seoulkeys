import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { appDict } from "../app/ui-i18n-app";
import { curriculumDict } from "../app/curriculum-i18n";
import { fillDict } from "../app/ui-i18n-fill";
import { multi } from "../app/ui-i18n-multi";
import { multi2 } from "../app/ui-i18n-multi2";
import { restDict } from "../app/ui-i18n-rest";
import { setupDict } from "../app/ui-i18n-setup";
import { targetedDict } from "../app/ui-i18n-targeted";
import { dict, jaDict, tr } from "../app/ui-i18n-legacy";
import { learningThemes } from "../app/content-themes";
import {
  expandedThemeSentences,
  expandedThemeWords,
  expandedTravelPhrases,
  proverbEntries,
} from "../app/expanded-content";
import { proverbMeaningTranslations } from "../app/proverb-meaning-translations";
import {
  proverbCardDescriptions,
  proverbUiEnglish,
  proverbUiTranslations,
} from "../app/proverb-ui-translations";
import type { Locale } from "../app/locale-detection";

const root = process.cwd();
const appRoot = path.join(root, "app");
const outputPath = path.join(root, "scratchpad", "i18n-source.json");

const locales = [
  "ko", "es", "pt-BR", "ja", "zh-Hans", "zh-Hant", "fr", "de", "it", "pl", "nl", "ru", "tr",
  "ar", "fa", "ur", "fil", "th", "id", "ms", "vi", "my", "km", "lo", "hi", "bn", "ta",
  "ne", "si", "kk", "uz", "mn",
] as const satisfies readonly Locale[];

const keys = new Set<string>();
const existing = Object.fromEntries(locales.map((locale) => [locale, {}])) as Record<
  (typeof locales)[number],
  Record<string, string>
>;

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isEnglishCandidate(value: string): boolean {
  return value.length > 0
    && /[A-Za-z]/.test(value)
    && !/^https?:\/\//.test(value)
    && !/^[A-Za-z]:\\/.test(value);
}

function addKey(value: string | undefined) {
  if (!value) return;
  const normalized = normalize(value);
  if (isEnglishCandidate(normalized)) keys.add(normalized);
}

function addReviewed(locale: (typeof locales)[number], english: string | undefined, translated: string | undefined) {
  if (!english || !translated) return;
  const normalizedEnglish = normalize(english);
  const normalizedTranslation = normalize(translated);
  addKey(normalizedEnglish);
  if (normalizedTranslation && normalizedTranslation !== normalizedEnglish) {
    existing[locale][normalizedEnglish] = normalizedTranslation;
  }
}

const dictionaries = [
  targetedDict,
  dict,
  multi,
  multi2,
  appDict,
  curriculumDict,
  setupDict,
  fillDict,
  restDict,
];

for (const dictionary of dictionaries) {
  for (const key of Object.keys(dictionary)) addKey(key);
}
for (const key of Object.keys(jaDict)) addKey(key);

function collectContent(value: unknown, parentKey = "") {
  if (Array.isArray(value)) {
    value.forEach((item) => collectContent(item, parentKey));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string" && (
      key.endsWith("En")
      || (parentKey === "expandedTravelPhrases" && (key === "meaning" || key === "situation"))
    )) {
      addKey(child);
    } else {
      collectContent(child, parentKey || key);
    }
  }
}

collectContent(learningThemes, "learningThemes");
collectContent(expandedThemeWords, "expandedThemeWords");
collectContent(expandedThemeSentences, "expandedThemeSentences");
collectContent(expandedTravelPhrases, "expandedTravelPhrases");

for (const theme of Object.values(learningThemes)) {
  addReviewed("ko", theme.labelEn, theme.labelKo);
  addReviewed("ko", theme.blurbEn, theme.blurbKo);
  theme.words.forEach((entry) => addReviewed("ko", entry.meaningEn, entry.meaningKo));
  theme.sentences.forEach((entry) => {
    addReviewed("ko", entry.translationEn, entry.korean);
    addReviewed("ko", entry.situationEn, entry.situationKo);
  });
}
for (const phrases of Object.values(expandedTravelPhrases)) {
  phrases.forEach((entry) => addReviewed("ko", entry.meaning, entry.korean));
}

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    // Learning pages own route-scoped bundles; keeping their long-form prose out
    // of the typing app's global locale pack prevents every visitor downloading it.
    if (entry.isDirectory()) {
      if (fullPath === path.join(appRoot, "learn")) return [];
      return sourceFiles(fullPath);
    }
    return /\.(?:ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function literalText(node: ts.Node | undefined): string | undefined {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

for (const filePath of sourceFiles(appRoot)) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const source = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const isLegalPage = filePath === path.join(appRoot, "legal", "page.tsx");

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === "tr"
    ) {
      const english = literalText(node.arguments[1]);
      addKey(english);
      addReviewed("ko", english, literalText(node.arguments[2]));
    }

    if (ts.isPropertyAssignment(node)) {
      const propertyName = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
        ? node.name.text
        : "";
      if (propertyName.endsWith("En")) addKey(literalText(node.initializer));
      if (filePath.endsWith("FallingWordsGame.tsx") && propertyName === "meaning") {
        addKey(literalText(node.initializer));
      }
      if (
        filePath.endsWith("page.tsx")
        && ["meaning", "situation", "translation", "genre"].includes(propertyName)
      ) {
        addKey(literalText(node.initializer));
      }
    }

    if (isLegalPage && ts.isJsxText(node)) addKey(node.text);
    if (
      isLegalPage
      && ts.isJsxAttribute(node)
      && ts.isIdentifier(node.name)
      && (node.name.text === "aria-label" || node.name.text === "title")
      && node.initializer
      && ts.isStringLiteral(node.initializer)
    ) {
      addKey(node.initializer.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
}

addKey("Effective July 23, 2026");
addKey("Legal & Safety Center — Seoul Keys");
addKey("Privacy, terms, cookies, advertising, copyright, child safety, and operating disclosures for Seoul Keys.");
[
  "Privacy policy · Terms of use · Cookies and advertising · Copyright · Child safety · Accessibility",
  "PRIVACY POLICY",
  "TERMS OF USE",
  "COOKIES & ADS",
  "COPYRIGHT & CONTENT POLICY",
  "CHILD & FAMILY SAFETY",
  "ACCESSIBILITY",
].forEach(addKey);

for (const key of keys) {
  for (const locale of locales) {
    const translated = tr(locale, key);
    if (translated !== key) existing[locale][key] = translated;
  }
}

for (const [uiKey, english] of Object.entries(proverbUiEnglish)) {
  addKey(english);
  for (const locale of locales) {
    const translated = proverbUiTranslations[locale]?.[uiKey as keyof typeof proverbUiEnglish];
    if (translated && translated !== english) existing[locale][english] = translated;
  }
}

const proverbCardEnglish = proverbCardDescriptions.en;
addKey(proverbCardEnglish);
for (const locale of locales) {
  const translated = proverbCardDescriptions[locale];
  if (translated && translated !== proverbCardEnglish) existing[locale][proverbCardEnglish] = translated;
}

for (const entry of proverbEntries) {
  addKey(entry.meaningEn);
  addReviewed("ko", entry.meaningEn, entry.meaningKo);
  addReviewed("ko", entry.kindEn, entry.kindKo);
  for (const locale of locales) {
    const translated = proverbMeaningTranslations[locale]?.[entry.id];
    if (translated && translated !== entry.meaningEn) existing[locale][entry.meaningEn] = translated;
  }
}

const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b, "en"));
for (const locale of locales) {
  existing[locale] = Object.fromEntries(
    Object.entries(existing[locale]).sort(([a], [b]) => a.localeCompare(b, "en")),
  );
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ version: 1, locales, keys: sortedKeys, existing }, null, 2)}\n`,
  "utf8",
);

const missingCounts = Object.fromEntries(
  locales.map((locale) => [locale, sortedKeys.length - Object.keys(existing[locale]).length]),
);
console.log(JSON.stringify({ outputPath, keyCount: sortedKeys.length, missingCounts }, null, 2));
