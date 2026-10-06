import type { ThemeWord } from "./content-themes";
import type { Locale } from "./locale-detection";
import { DEFENSE_FIGHTER_WORDS, type DefenseMeaningPack } from "./defense-meaning-pack";

export const GODOT_DEFENSE_URL = "/games/seoul-defense/index.html?v=16-integration17-responsive4";
export const GODOT_READY_MESSAGE = "seoulkeys-defense-ready";
export const GODOT_CONFIG_MESSAGE = "seoulkeys-defense-config";

export type DefenseConfig = {
  locale: Locale;
  soundEnabled: boolean;
  musicEnabled: boolean;
  suspended: boolean;
  dialogSuspended: boolean;
  backgroundSuspended: boolean;
  words: { word: string; meaning: string; difficulty: number }[];
  meanings: Record<string, string>;
  fighterMeanings: Record<string, string>;
};

const fallbackWords: ThemeWord[] = [
  { word: "한글", meaningEn: "Hangul", meaningKo: "우리의 글자" },
  { word: "서울", meaningEn: "Seoul", meaningKo: "대한민국의 수도" },
  { word: "사랑", meaningEn: "love", meaningKo: "아끼는 마음" },
  { word: "친구", meaningEn: "friend", meaningKo: "가까이 지내는 사람" },
  { word: "하늘", meaningEn: "sky", meaningKo: "머리 위로 펼쳐진 공간" },
  { word: "바다", meaningEn: "sea", meaningKo: "넓고 깊은 물" },
  { word: "음악", meaningEn: "music", meaningKo: "소리로 만든 예술" },
  { word: "여행", meaningEn: "travel", meaningKo: "다른 곳으로 떠남" },
  { word: "기차", meaningEn: "train", meaningKo: "철길을 달리는 차" },
  { word: "오늘", meaningEn: "today", meaningKo: "지금 보내는 날" },
  { word: "별빛", meaningEn: "starlight", meaningKo: "별에서 오는 빛" },
  { word: "행복", meaningEn: "happiness", meaningKo: "기쁘고 즐거운 마음" },
];

export function createDefenseConfig(locale: Locale, soundEnabled: boolean, suspended: boolean, themeWords?: ThemeWord[], musicEnabled = true, meaningPack?: DefenseMeaningPack, dialogSuspended = false, backgroundSuspended = false): DefenseConfig {
  if (!meaningPack || meaningPack.locale !== locale) throw new Error("Current-language defense definitions are required");
  const source = themeWords?.length ? themeWords : fallbackWords;
  const seen = new Set<string>();
  const words = source.slice(0, 300).flatMap((entry) => {
    const word = entry.word.normalize("NFC").trim().slice(0, 32);
    if (!word || seen.has(word)) return [];
    seen.add(word);
    return [{
      word,
      meaning: requireMeaning(meaningPack, word),
      difficulty: Math.min(3, Math.max(1, Math.round(entry.difficulty ?? 1))),
    }];
  });
  const fighterMeanings = Object.fromEntries(DEFENSE_FIGHTER_WORDS.map((word) => [word, requireMeaning(meaningPack, word)]));
  return { locale, soundEnabled, musicEnabled, suspended, dialogSuspended, backgroundSuspended, words, meanings: meaningPack.meanings, fighterMeanings };
}

function requireMeaning(pack: DefenseMeaningPack, word: string): string {
  const meaning = pack.meanings[word];
  if (!meaning) throw new Error(`Missing ${pack.locale} defense definition for ${word}`);
  return meaning;
}

/** A same-origin tab or sibling frame must never impersonate this game. */
export function isDefenseReadyMessage(
  event: Pick<MessageEvent, "source" | "origin" | "data">,
  gameWindow: Window | null,
  origin: string,
): boolean {
  return gameWindow !== null
    && event.source === gameWindow
    && event.origin === origin
    && event.data !== null
    && typeof event.data === "object"
    && event.data.type === GODOT_READY_MESSAGE;
}

export function postDefenseConfig(gameWindow: Window | null, origin: string, config: DefenseConfig): void {
  // A missing window during navigation/unmount is expected, never a broadcast.
  gameWindow?.postMessage({ type: GODOT_CONFIG_MESSAGE, payload: config }, origin);
}
