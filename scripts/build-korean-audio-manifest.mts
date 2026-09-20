/* Emits scripts/korean-audio-lines.json — the single list of (slug, Korean text)
 * pairs that both the synthesizer and the app read.
 *
 * The Python generator used to carry its own hand-copied copy of this list. It
 * drifted: two lines had been reworded in the app but not re-synthesized, so the
 * recording said something different from the sentence on screen
 * ("친구와 함께 여행하고 싶어요." vs "친구와 함께 한국을 여행하고 싶어요.").
 * The list also stopped at 14 entries while the app mapped 52, so every sentence
 * past the fifth pointed at an MP3 that had never been rendered — a 404, then a
 * fallback to the device voice. Generating the list from the app's own arrays
 * makes both failures impossible.
 *
 * Run: npx tsx scripts/build-korean-audio-manifest.mts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { practiceCurriculum, sentencePracticeItems } from "../app/practice-curriculum";
import { learningThemes } from "../app/content-themes";
import {
  expandedThemeSentences,
  expandedTravelPhrases,
  proverbEntries,
} from "../app/expanded-content";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
const themeSource = fs.readFileSync(path.join(root, "app/content-themes.ts"), "utf8");

/** The array literal that follows `marker`, matched by bracket depth so that
 *  nested arrays and any `]` inside a string cannot end it early. */
function arrayAfter(marker: string): string {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error(`build-korean-audio-manifest: "${marker}" not found in app/page.tsx`);
  const start = source.indexOf("[", at);
  let depth = 0;
  let end = start;
  for (; end < source.length; end++) {
    if (source[end] === "[") depth++;
    else if (source[end] === "]" && --depth === 0) break;
  }
  return source.slice(start, end + 1);
}

const koreanOf = (chunk: string) => [...chunk.matchAll(/korean:\s*"([^"]+)"/g)].map((m) => m[1]);

const inKorea = koreanOf(arrayAfter("inKorea:"));
const welcome = koreanOf(arrayAfter("welcome:"));
const scenes = koreanOf(arrayAfter("const screenPracticeLines"));

/* The sentences the learner actually types. The first version of this file
 * covered only the three hardcoded arrays above, which is what the old audio map
 * had always been built from — but the practice card is driven by the selected
 * learning concept, and those sentences live in content-themes.ts. 47 of its 50
 * had no recording, so choosing any concept meant the device voice from the
 * first sentence on. Anything a learner can be asked to speak belongs here. */
const conceptLines = koreanOf(themeSource);
const conceptWords = learningThemes.flatMap((theme) => theme.words.map((entry) => entry.word));
const expandedConceptLines = Object.values(expandedThemeSentences)
  .flatMap((sentences) => sentences.map((entry) => entry.korean));
const expandedTravelLines = Object.values(expandedTravelPhrases)
  .flatMap((phrases) => phrases.map((entry) => entry.korean));
const proverbs = proverbEntries.map((entry) => entry.korean);
const spokenDrills = practiceCurriculum.filter((item) => item.speak).map((item) => item.text);

const pad = (n: number) => String(n + 1).padStart(2, "0");
const lines: [string, string][] = [];
const seenText = new Set<string>();
const seenSlug = new Set<string>();

/** Adds each text once. A sentence can appear in several sources — the travel
 *  phrases overlap the travel concept — and one recording serves all of them. */
function add(prefix: string, texts: string[]) {
  let n = 0;
  for (const text of texts) {
    const trimmed = text.trim();
    if (!trimmed || seenText.has(trimmed)) continue;
    seenText.add(trimmed);
    const slug = `${prefix}-${pad(n++)}`;
    if (seenSlug.has(slug)) throw new Error(`build-korean-audio-manifest: duplicate slug ${slug}`);
    seenSlug.add(slug);
    lines.push([slug, trimmed]);
  }
}

add("lesson", sentencePracticeItems);
add("travel-korea", inKorea);
add("travel-welcome", welcome);
// All eight, not the first three. The tail was left out as "long passages not
// worth the bytes", but they are the whole of the K-drama mode, so the effect
// was that the mode dropped to the device voice after its third line. Eight
// lines cost about 350 KB.
add("scene", scenes);
add("concept", conceptLines);
add("drill", spokenDrills);
add("word", conceptWords);
add("concept-extra", expandedConceptLines);
add("travel-extra", expandedTravelLines);
add("proverb", proverbs);

const out = path.join(root, "scripts/korean-audio-lines.json");
fs.writeFileSync(out, `${JSON.stringify(lines, null, 2)}\n`);

const perPrefix = new Map<string, number>();
for (const [slug] of lines) {
  const prefix = slug.replace(/-\d+$/, "");
  perPrefix.set(prefix, (perPrefix.get(prefix) ?? 0) + 1);
}
console.log(
  `wrote ${path.relative(root, out)} — ${lines.length} lines (` +
    [...perPrefix].map(([p, n]) => `${n} ${p}`).join(", ") +
    ")",
);
