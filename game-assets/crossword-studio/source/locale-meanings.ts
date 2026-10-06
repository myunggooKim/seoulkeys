import type { Locale } from './app/locale-detection';
import { isCrosswordLocale } from './crossword-studio-contract';
import manifest from './locale-manifest.json';

type ClueEntry = { answer: string; clueEn: string; clueKo: string };
type Pack = { locale: string; meanings: Record<string, string> };
const packs = new Map<Locale, Pack>();
const pending = new Map<Locale, Promise<void>>();
export function hasClueMeanings(locale: Locale) { return packs.has(locale); }
export async function loadClueMeanings(locale: Locale): Promise<void> {
  if (packs.has(locale)) return;
  const current = pending.get(locale); if (current) return current;
  const work = (async () => {
    if (!isCrosswordLocale(locale)) throw new Error('Unsupported crossword locale');
    const filename = (manifest.files as Record<string, string>)[locale];
    if (!filename) throw new Error(`Missing locale asset: ${locale}`);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(new URL(`./locales/${filename}`, window.location.href), { credentials: 'same-origin', cache: 'force-cache', signal: controller.signal });
      if (!response.ok) throw new Error(`Locale response: ${response.status}`);
      const candidate: unknown = await response.json();
      if (!candidate || typeof candidate !== 'object') throw new Error('Invalid locale pack');
      const pack = candidate as Pack;
      if (pack.locale !== locale || !pack.meanings || typeof pack.meanings !== 'object' || Array.isArray(pack.meanings)) throw new Error('Locale mismatch');
      for (const answer of manifest.requiredWords) {
        if (typeof pack.meanings[answer] !== 'string' || !pack.meanings[answer].trim() || /\[MISSING\]|TODO|TRANSLATION_PENDING/.test(pack.meanings[answer])) throw new Error(`Missing contextual clue: ${locale}/${answer}`);
      }
      packs.set(locale, pack);
    } finally { window.clearTimeout(timeout); }
  })();
  pending.set(locale, work);
  try { await work; } finally { pending.delete(locale); }
}
/** Never search shared English keys: those can conflate different Korean senses. */
export function clueMeaning(locale: Locale, entry: ClueEntry): string {
  const meaning = packs.get(locale)?.meanings[entry.answer];
  if (meaning) return meaning;
  // Older local collections may contain a removed word. Do not silently switch
  // language or reveal the answer as its own clue. Current boards are validated.
  return locale === 'ko' ? '이 낱말의 번역을 사용할 수 없어요.' : `⚠ [${locale}]`;
}
