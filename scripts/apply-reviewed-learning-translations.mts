/** Apply explicit editorial corrections only; never regenerate unrelated prose. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translationQualityIssue } from "../app/translation-quality";
import { loadReviewedLearningTranslations } from "./load-reviewed-learning-translations";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "scratchpad/learning-i18n-source.json"), "utf8")) as {
  bundles: Record<string, { keys: string[] }>;
};
const reviewed = loadReviewedLearningTranslations(root);
const write = process.argv.includes("--write");
const updates: { bundle: string; locale: string; corrections: number }[] = [];

for (const [locale, entries] of Object.entries(reviewed)) {
  for (const [bundle, { keys }] of Object.entries(source.bundles)) {
    const target = path.join(root, "public/i18n/learn", bundle, `${locale}.json`);
    // Missing locale packs belong to the separate, validated generation step.
    if (!fs.existsSync(target)) continue;
    const pack = JSON.parse(fs.readFileSync(target, "utf8")) as Record<string, string>;
    let corrections = 0;
    for (const english of keys) {
      const value = entries[english];
      if (!value || pack[english] === value) continue;
      if (!(english in pack)) throw new Error(`${locale}/${bundle}: source key absent: ${english}`);
      const issue = translationQualityIssue(english, value);
      if (issue) throw new Error(`${locale}/${bundle}: invalid correction: ${issue}`);
      for (const literal of english.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]+/gu) ?? []) {
        if (!value.includes(literal)) throw new Error(`${locale}/${bundle}: lost Hangul example: ${literal}`);
      }
      pack[english] = value;
      corrections++;
    }
    if (corrections) {
      updates.push({ bundle, locale, corrections });
      if (write) fs.writeFileSync(target, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
    }
  }
}
console.log(JSON.stringify({ write, updates }, null, 2));
