/* Replace collapsed machine translations with the English original.
 *
 * The local model occasionally falls into a decoder loop — "Hangul bilan bilan
 * bilan…" for four hundred characters, or a run of digits where a sentence
 * should be. A pack entry like that is worse than no translation: it breaks the
 * layout it sits in and reads as gibberish to the one audience that cannot spot
 * the error. English is the honest fallback, and the entry stays eligible for a
 * real translation later.
 *
 * Run: npx tsx scripts/repair-degenerate-i18n.mts [--write]
 */
import fs from "node:fs";
import path from "node:path";
import { translationQualityIssue } from "../app/translation-quality";

const LOCALES = ["ko","es","pt-BR","ja","zh-Hans","zh-Hant","fr","de","it","pl","nl","ru","tr",
  "ar","fa","ur","fil","th","id","ms","vi","my","km","lo","hi","bn","ta","ne","si","kk","uz","mn"];

/** Why a value cannot be a real translation of `english`. */
export function collapseReason(english: string, value: string): string | null {
  return translationQualityIssue(english, value);
}

const write = process.argv.includes("--write");
const root = path.join(process.cwd(), "public", "i18n");
let repaired = 0;
const reasonCounts = new Map<string, number>();
const reasonSamples = new Map<string, string[]>();

for (const locale of LOCALES) {
  const file = path.join(root, `${locale}.json`);
  if (!fs.existsSync(file)) continue;
  const pack = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
  let touched = 0;
  for (const [english, value] of Object.entries(pack)) {
    const reason = collapseReason(english, value);
    if (reason) {
      pack[english] = english;
      touched += 1;
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
      const samples = reasonSamples.get(reason) ?? [];
      if (samples.length < 3) {
        samples.push(`${locale}: ${english} => ${value}`);
        reasonSamples.set(reason, samples);
      }
    }
  }
  if (touched && write) {
    fs.writeFileSync(file, `${JSON.stringify(pack, null, 0)}\n`, "utf8");
  }
  if (touched) {
    repaired += touched;
    console.log(`${locale}: ${touched}`);
  }
}

for (const [reason, count] of [...reasonCounts].sort((left, right) => right[1] - left[1])) {
  console.log(`${reason}: ${count}`);
  if (process.argv.includes("--verbose")) {
    for (const sample of reasonSamples.get(reason) ?? []) console.log(`  ${sample}`);
  }
}
console.log(`${write ? "repaired" : "would repair"} ${repaired} entries`);
