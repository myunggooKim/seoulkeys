import fs from "node:fs";
import path from "node:path";
import { guides } from "../app/learn/guides";

/** Editorial strings keyed to existing source; never modify drills or input data. */
export function loadReviewedLearningTranslations(root: string): Record<string, Record<string, string>> {
  const result = JSON.parse(fs.readFileSync(path.join(root, "scripts/reviewed-learning-translations.json"), "utf8")) as Record<string, Record<string, string>>;
  const overviews = JSON.parse(fs.readFileSync(path.join(root, "scripts/reviewed-guide-overviews.json"), "utf8")) as Record<string, Record<string, { title: string; quickAnswer: string }>>;
  const table = JSON.parse(fs.readFileSync(path.join(root, "scripts/reviewed-keyboard-table.json"), "utf8")) as { keys: string[]; locales: Record<string, string[]> };
  for (const [locale, values] of Object.entries(table.locales)) {
    if (values.length !== table.keys.length || values.some(value => !value.trim())) throw new Error(`Invalid reviewed table: ${locale}`);
    result[locale] ??= {};
    table.keys.forEach((key, index) => { result[locale][key] = values[index]; });
  }
  for (const [locale, entries] of Object.entries(overviews)) {
    result[locale] ??= {};
    for (const [slug, entry] of Object.entries(entries)) {
      const guide = guides.find(value => value.slug === slug);
      if (!guide || !entry.title?.trim() || !entry.quickAnswer?.trim()) throw new Error(`Invalid reviewed overview: ${locale}/${slug}`);
      result[locale][guide.title] = entry.title;
      result[locale][guide.quickAnswer] = entry.quickAnswer;
    }
  }
  const updates = JSON.parse(fs.readFileSync(path.join(root, "scripts/reviewed-learning-source-updates.json"), "utf8")) as { retired: string[]; locales: Record<string, Record<string, string>> };
  for (const entries of Object.values(result)) for (const key of updates.retired) delete entries[key];
  for (const [locale, entries] of Object.entries(updates.locales)) result[locale] = { ...result[locale], ...entries };
  const controls = JSON.parse(fs.readFileSync(path.join(root, "scripts/reviewed-learning-controls.json"), "utf8")) as { keys: string[]; locales: Record<string, string[]> };
  for (const [locale, values] of Object.entries(controls.locales)) {
    if (values.length !== controls.keys.length || values.some(value => !value.trim())) throw new Error(`Invalid reviewed controls: ${locale}`);
    result[locale] ??= {};
    controls.keys.forEach((key, index) => { result[locale][key] = values[index]; });
  }
  return result;
}
