/**
 * Recover missing route packs from local cache without inference or network use.
 * Broken/unavailable translations remain explicit English fallbacks in the audit;
 * complete keys are NOT evidence of complete semantic review.
 * Run export-learning-i18n-source.mts first. Dry-run unless --write is specified.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translationQualityIssue } from "../app/translation-quality";
import { isGuideTypingLiteral } from "../app/learn/guide-typing-literals";
import { loadReviewedLearningTranslations } from "./load-reviewed-learning-translations";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "scratchpad/learning-i18n-source.json"), "utf8")) as {
  locales: string[];
  bundles: Record<string, { keys: string[]; existing: Record<string, Record<string, string>> }>;
};
const reviewed = loadReviewedLearningTranslations(root);
const recoveredLocales = new Set(["th", "id", "ms", "vi", "my", "km", "lo", "bn", "ta", "ne", "si"]);
const locales = process.argv.includes("--sanitize-existing")
  ? source.locales
  : [...recoveredLocales, "ko"];
const write = process.argv.includes("--write");
const reviewedOnly = process.argv.includes("--reviewed-only");
const identities = new Set(["Seoul Keys", "macOS", "Shift", "min"]);
const literalPattern = /[가-힣ㄱ-ㅎㅏ-ㅣ]+|(?:Shift|Control|Windows)\+[A-Za-z]+|\b[A-Z](?:[–—-][A-Z])+\b|\b(?:[A-Za-z]\s*\+\s*)+[A-Za-z]\b/gu;
// Preserve established short navigation labels. Recovered locales have no
// established pack, so their new controls must also be editorially reviewed.
const navigationKeys = new Set(source.bundles.common.keys.filter(key => key.length < 72));
const unionKeys = [...new Set(Object.values(source.bundles).flatMap(({ keys }) => keys))];
const report = {
  phase: "translation pack validation; deployment is a separate command",
  write,
  reviewedOnly,
  uniqueSourceStrings: unionKeys.length,
  locales: [] as {
    locale: string; routePacks: number; editorialCorrections: number; machineDrafts: number;
    englishFallbacks: { source: string; reason: string; bundles: string[] }[];
  }[],
};
for (const locale of locales) {
  if (!source.locales.includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
  const cachePath = path.join(root, "scratchpad/i18n-cache/learn", `${locale}.json`);
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) as Record<string, string> : {};
  const existing = Object.assign({}, ...Object.values(source.bundles).map(bundle => bundle.existing[locale]));
  const shipped: Record<string, string> = {};
  for (const bundle of Object.keys(source.bundles)) {
    const target = path.join(root, "public/i18n/learn", bundle, `${locale}.json`);
    if (fs.existsSync(target)) Object.assign(shipped, JSON.parse(fs.readFileSync(target, "utf8")));
  }
  const corrections = { ...existing, ...reviewed[locale] };
  const translations: Record<string, string> = {};
  const audit = { locale, routePacks: 0, editorialCorrections: 0, machineDrafts: 0, englishFallbacks: [] as { source: string; reason: string; bundles: string[] }[] };
  for (const key of unionKeys) {
    // Keep every existing valid edit; cache recovery never replaces good prose.
    const shippedValue = shipped[key];
    let candidate = corrections[key] ?? (shippedValue && shippedValue !== key ? shippedValue : cache[key] ?? shippedValue);
    let reason = typeof candidate !== "string" ? "missing translation" : translationQualityIssue(key, candidate);
    if (!reason && /(?:ZXQ|QXZ|8675309)|[\uE000-\uF8FF]/iu.test(candidate)) reason = "unrestored translation marker";
    const missingLiterals = [...new Set(key.match(literalPattern) ?? [])].filter(value => !candidate?.includes(value));
    if (!reason && missingLiterals.length) reason = `missing typing literals: ${missingLiterals.join(", ")}`;
    if (!reason && candidate === key && !isGuideTypingLiteral(key) && !identities.has(key)) reason = "untranslated source";
    if (!reason && reviewedOnly && !(key in corrections) && (!navigationKeys.has(key) || recoveredLocales.has(locale)) && !isGuideTypingLiteral(key) && !identities.has(key)) reason = "translation not semantically reviewed";
    if (reason) {
      // Never mark a source fallback as reviewed or as a successful translation.
      candidate = key;
      audit.englishFallbacks.push({ source: key, reason, bundles: Object.entries(source.bundles).filter(([, bundle]) => bundle.keys.includes(key)).map(([name]) => name) });
    } else if (key in corrections && !identities.has(key)) audit.editorialCorrections++;
    else if (!identities.has(key) && !isGuideTypingLiteral(key)) audit.machineDrafts++;
    translations[key] = candidate;
  }
  for (const [bundle, { keys }] of Object.entries(source.bundles)) {
    const target = path.join(root, "public/i18n/learn", bundle, `${locale}.json`);
    const pack = Object.fromEntries(keys.map(key => [key, translations[key]]));
    if (write) {
      const current = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")) as Record<string, string> : undefined;
      if (!current || Object.keys(current).length !== keys.length || keys.some(key => current[key] !== pack[key])) {
        fs.writeFileSync(target, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
      }
    }
    audit.routePacks++;
  }
  if (write && locale === "ko") {
    // Application modules must not import assets from Vite's public directory.
    // Keep the reviewed, offline Korean fallback generated from the same keys.
    const commonKeys = source.bundles.common.keys;
    fs.writeFileSync(path.join(root, "app/learn/common-ko.json"), `${JSON.stringify(Object.fromEntries(commonKeys.map(key => [key, translations[key]])), null, 2)}\n`, "utf8");
  }
  report.locales.push(audit);
}
if (write) fs.writeFileSync(path.join(root, "scratchpad/learning-translation-quality-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ...report, locales: report.locales.map(({ englishFallbacks, ...locale }) => ({ ...locale, englishFallbacks: englishFallbacks.length })) }, null, 2));
