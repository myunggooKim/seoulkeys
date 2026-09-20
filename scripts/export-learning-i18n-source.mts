import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { Locale } from "../app/locale-detection";
import {
  guides,
  type GuideExample,
} from "../app/learn/guides";
import { isGuideTypingLiteral } from "../app/learn/guide-typing-literals";
import { koreanGuideTranslations } from "../app/learn/guides-ko";

const root = process.cwd();
const outputPath = path.join(root, "scratchpad", "learning-i18n-source.json");
const locales = [
  "ko", "es", "pt-BR", "ja", "zh-Hans", "zh-Hant", "fr", "de", "it", "pl", "nl", "ru", "tr",
  "ar", "fa", "ur", "fil", "th", "id", "ms", "vi", "my", "km", "lo", "hi", "bn", "ta",
  "ne", "si", "kk", "uz", "mn",
] as const satisfies readonly Exclude<Locale, "en">[];

type SupportedLocale = (typeof locales)[number];
type Bundle = {
  keys: Set<string>;
  existing: Record<SupportedLocale, Record<string, string>>;
};

const bundles = new Map<string, Bundle>();
const identityTranslations = new Set(["Seoul Keys", "macOS", "Shift"]);

function bundle(name: string): Bundle {
  const current = bundles.get(name);
  if (current) return current;
  const created: Bundle = {
    keys: new Set<string>(),
    existing: Object.fromEntries(locales.map((locale) => [locale, {}])) as Bundle["existing"],
  };
  bundles.set(name, created);
  return created;
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isEnglishCandidate(value: string): boolean {
  return value.length > 0 && /[A-Za-z]/.test(value) && !/^https?:\/\//.test(value);
}

function addKey(target: Bundle, value: string | undefined, reviewedKorean?: string) {
  if (!value) return;
  const english = normalize(value);
  if (!isEnglishCandidate(english)) return;
  target.keys.add(english);
  if (identityTranslations.has(english)) {
    locales.forEach((locale) => {
      target.existing[locale][english] = english;
    });
    return;
  }
  const korean = normalize(reviewedKorean ?? koreanGuideTranslations[english] ?? "");
  if (korean && korean !== english) target.existing.ko[english] = korean;
}

function addExample(target: Bundle, example: GuideExample) {
  addKey(target, example.label);
  if (!isGuideTypingLiteral(example.note)) addKey(target, example.note);
  // `keys` and `result` are intentionally immutable teaching data.
}

const common = bundle("common");
const commonComponentPaths = [
  path.join(root, "app", "learn", "LearningChrome.tsx"),
  path.join(root, "app", "learn", "LearningLibraryClient.tsx"),
  path.join(root, "app", "learn", "GuideArticleClient.tsx"),
];

function literalText(node: ts.Node | undefined): string | undefined {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

for (const filePath of commonComponentPaths) {
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === "learningTr"
    ) {
      addKey(common, literalText(node.arguments[1]), literalText(node.arguments[2]));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

// `/learn/hangul` keeps its reviewed English/Korean copy beside the illustrated
// markup. Extract it into its own route bundle so opening that long guide never
// makes the learning hub (or the main typing app) download its prose.
const hangul = bundle("hangul");
const hangulSource = ts.createSourceFile(
  path.join(root, "app", "learn", "hangul", "page.tsx"),
  fs.readFileSync(path.join(root, "app", "learn", "hangul", "page.tsx"), "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

function pairedKorean(node: ts.PropertyAssignment, propertyName: string): string | undefined {
  if (!ts.isObjectLiteralExpression(node.parent)) return undefined;
  const koreanName = propertyName === "en" ? "ko" : `${propertyName.slice(0, -2)}Ko`;
  const sibling = node.parent.properties.find((property) => {
    if (!ts.isPropertyAssignment(property)) return false;
    if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name)) return false;
    return property.name.text === koreanName;
  });
  return sibling && ts.isPropertyAssignment(sibling) ? literalText(sibling.initializer) : undefined;
}

function visitHangul(node: ts.Node) {
  if (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === "tr"
  ) {
    addKey(hangul, literalText(node.arguments[1]), literalText(node.arguments[2]));
  }
  if (ts.isPropertyAssignment(node)) {
    const propertyName = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
      ? node.name.text
      : "";
    if (propertyName === "en" || propertyName.endsWith("En")) {
      addKey(hangul, literalText(node.initializer), pairedKorean(node, propertyName));
    }
  }
  ts.forEachChild(node, visitHangul);
}
visitHangul(hangulSource);

for (const guide of guides) {
  // The hub and related cards need only this compact subset from every guide.
  addKey(common, guide.cardTitle);
  addKey(common, guide.description);
  addKey(common, guide.eyebrow);

  const article = bundle(guide.slug);
  addKey(article, guide.title);
  guide.learningGoals.forEach((value) => addKey(article, value));
  guide.intro.forEach((value) => addKey(article, value));
  addKey(article, guide.quickAnswer);

  for (const section of guide.sections) {
    addKey(article, section.title);
    section.paragraphs.forEach((value) => addKey(article, value));
    section.bullets?.forEach((value) => addKey(article, value));
    section.steps?.forEach((value) => addKey(article, value));
    if (section.table) {
      addKey(article, section.table.caption);
      section.table.headers.forEach((value) => addKey(article, value));
      section.table.rows.flat().forEach((value) => {
        if (!isGuideTypingLiteral(value)) addKey(article, value);
      });
    }
    section.examples?.forEach((example) => addExample(article, example));
    if (section.note) {
      addKey(article, section.note.title);
      addKey(article, section.note.body);
    }
  }

  addKey(article, guide.drill.title);
  addKey(article, guide.drill.instructions);
  guide.drill.items.forEach((example) => addExample(article, example));
  addKey(article, guide.drill.checkpoint);
  guide.mistakes.forEach((item) => {
    addKey(article, item.mistake);
    addKey(article, item.fix);
  });
  guide.faqs.forEach((faq) => {
    addKey(article, faq.question);
    addKey(article, faq.answer);
  });
  guide.references.forEach((reference) => {
    addKey(article, reference.title);
    addKey(article, reference.publisher);
  });
}

const serializedBundles = Object.fromEntries(
  [...bundles].map(([name, value]) => {
    const keys = [...value.keys].sort((a, b) => a.localeCompare(b, "en"));
    const existing = Object.fromEntries(locales.map((locale) => [
      locale,
      Object.fromEntries(
        Object.entries(value.existing[locale]).sort(([a], [b]) => a.localeCompare(b, "en")),
      ),
    ]));
    return [name, { keys, existing }];
  }),
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ version: 1, locales, bundles: serializedBundles }, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify({
  outputPath,
  bundles: Object.fromEntries(
    Object.entries(serializedBundles).map(([name, value]) => [name, value.keys.length]),
  ),
}, null, 2));
