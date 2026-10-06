import type { Locale } from "./locale-detection";

export const DEFENSE_MEANING_VERSION = "17";
export const DEFENSE_FIGHTER_WORDS = ["흐리멍덩하다", "뒤죽박죽", "어리둥절하다", "알쏭달쏭하다", "우왕좌왕하다", "쭈뼛쭈뼛하다"] as const;
export type DefenseMeaningPack = { locale: Locale; meanings: Record<string, string> };
const cache = new Map<Locale, DefenseMeaningPack>();

export function validateDefenseMeaningPack(candidate: unknown, locale: Locale): DefenseMeaningPack {
  if (!candidate || typeof candidate !== "object") throw new Error("Invalid defense meaning pack");
  const pack = candidate as Partial<DefenseMeaningPack>;
  if (pack.locale !== locale || !pack.meanings || typeof pack.meanings !== "object" || Array.isArray(pack.meanings)) {
    throw new Error("Defense meaning pack locale mismatch");
  }
  const meanings: Record<string, string> = Object.create(null);
  for (const [word, meaning] of Object.entries(pack.meanings)) {
    if (!/^[가-힣\s]+$/u.test(word) || typeof meaning !== "string" || !meaning.trim() || [...meaning].length > 240) {
      throw new Error(`Invalid defense definition: ${word}`);
    }
    meanings[word] = meaning.trim();
  }
  for (const word of DEFENSE_FIGHTER_WORDS) {
    if (!meanings[word]) throw new Error(`Missing fighter definition: ${word}`);
  }
  return { locale, meanings };
}

/** Dedicated versioned packs prevent unloaded UI dictionaries becoming English game definitions. */
export async function loadDefenseMeaningPack(locale: Locale, signal?: AbortSignal): Promise<DefenseMeaningPack> {
  const saved = cache.get(locale);
  if (saved) return saved;
  const response = await fetch(`/i18n/defense/${encodeURIComponent(locale)}.json?v=${DEFENSE_MEANING_VERSION}`, {
    credentials: "same-origin", cache: "no-cache", signal,
  });
  if (!response.ok) throw new Error(`Defense definitions unavailable (${response.status})`);
  const pack = validateDefenseMeaningPack(await response.json(), locale);
  cache.set(locale, pack);
  return pack;
}
