import { learningThemes } from "./content-themes";
import type { Locale } from "./locale-detection";
import { coreGlossary } from "./word-glossary-core";
import { translatedCoreMeaning } from "./word-glossary-translations";
import { getRuntimeTranslation } from "./runtime-i18n";

export type WordGloss = { word: string; meaning: string; start: number; end: number };
type Definition = { word: string; meaningEn: string; meaningKo: string };

const dictionary = new Map<string, Definition>();
for (const theme of learningThemes) {
  for (const entry of theme.words) if (!dictionary.has(entry.word)) dictionary.set(entry.word, entry);
}
for (const entry of coreGlossary) dictionary.set(entry.word, entry);
// UI locale packs already contain these reviewed, short terms.
for (const entry of [
  { word: "한국어", meaningEn: "Korean", meaningKo: "한국에서 쓰는 언어" },
  { word: "연습", meaningEn: "Practice", meaningKo: "익숙해지도록 반복하여 해 보는 일" },
  { word: "공부", meaningEn: "Learning", meaningKo: "지식이나 기술을 배우고 익히는 일" },
  { word: "음식", meaningEn: "food", meaningKo: "먹거나 마시는 것" },
]) dictionary.set(entry.word, entry);

// Match dictionary words only, not arbitrary prefixes or guesses at morphology.
// Attached particles are excluded from the hover range; e.g. 음악[을].
const particles = new Set([
  "은", "는", "이", "가", "을", "를", "의", "에", "에서", "에게", "께", "한테",
  "에게서", "한테서", "와", "과", "하고", "랑", "이랑", "로", "으로", "도", "만",
  "부터", "까지", "보다", "처럼", "마다", "조차", "마저", "밖에", "이나", "나",
  "에는", "에서는", "에게는", "으로는", "로는", "에도", "에서도", "까지는", "부터는",
  "이고", "입니다", "이에요", "예요", "이야", "이다",
]);
const ignored = new Set(["은", "는", "이", "가", "을", "를", "의", "에", "도", "와", "과", "한", "것", "수", "좀", "요"]);
// Explicit, common noun + 하다 forms only. Do not strip arbitrary verb endings
// from unknown words: that would invent misleading dictionary matches.
const actionNouns = new Set(["여행", "연습", "공부", "노력", "확인", "결제", "예약", "주문", "출발", "도착", "방문", "사용", "소개", "안내", "준비", "시작", "통역", "번역", "이동", "신청", "운동", "요리", "회의", "질문", "대화", "설명", "연락"]);
const actionEndings = new Set(["하다", "해", "해요", "하고", "하는", "한다", "하여", "해서", "하며", "합니다", "하세요", "했어요", "했다", "하겠습니다", "할", "하기", "하러", "해도", "하시나요", "하시겠어요"]);
const koreanLanguageMeaning: Record<Exclude<Locale, "en" | "ko">, string> = {
  es: "idioma coreano", "pt-BR": "língua coreana", fr: "langue coréenne", de: "koreanische Sprache",
  it: "lingua coreana", pl: "język koreański", nl: "Koreaanse taal", ru: "корейский язык", tr: "Korece",
  ja: "韓国語", "zh-Hans": "韩语", "zh-Hant": "韓語", vi: "tiếng Hàn", id: "bahasa Korea", ms: "bahasa Korea",
  fil: "wikang Koreano", th: "ภาษาเกาหลี", ar: "اللغة الكورية", fa: "زبان کره‌ای", ur: "کوریائی زبان",
  hi: "कोरियाई भाषा", bn: "কোরীয় ভাষা", ta: "கொரிய மொழி", ne: "कोरियाली भाषा", si: "කොරියානු භාෂාව",
  kk: "корей тілі", uz: "koreys tili", mn: "солонгос хэл", my: "ကိုရီးယားဘာသာ", km: "ភាសាកូរ៉េ", lo: "ພາສາເກົາຫຼີ",
};

function localizedMeaning(entry: Definition, locale: Locale): string | undefined {
  if (locale === "ko") return entry.meaningKo;
  if (locale === "en") return entry.meaningEn;
  if (entry.word === "한국어") return koreanLanguageMeaning[locale];
  return translatedCoreMeaning(entry.word, locale) ?? getRuntimeTranslation(locale, entry.meaningEn);
}

export function wordGlossAt(text: string, characterIndex: number, locale: Locale): WordGloss | null {
  if (!Number.isInteger(characterIndex) || characterIndex < 0) return null;
  // Regex offsets are UTF-16; UI indices use Unicode characters. Korean emoji
  // and punctuation before a word must not shift the word's hover target.
  for (const match of text.matchAll(/[가-힣]+/gu)) {
    const start = Array.from(text.slice(0, match.index)).length;
    const token = match[0];
    if (characterIndex < start || characterIndex >= start + token.length) continue;
    if (ignored.has(token)) return null;
    let entry = dictionary.get(token);
    let length = token.length;
    if (!entry) {
      for (let end = token.length - 1; end > 0; end--) {
        const candidate = dictionary.get(token.slice(0, end));
        const ending = token.slice(end);
        const isAction = candidate && actionNouns.has(candidate.word) && actionEndings.has(ending);
        if (candidate && (particles.has(ending) || isAction)) {
          entry = candidate;
          length = isAction ? token.length : end;
          break;
        }
      }
    }
    if (!entry || characterIndex >= start + length) return null;
    const meaning = localizedMeaning(entry, locale);
    return meaning ? { word: entry.word, meaning, start, end: start + length } : null;
  }
  return null;
}
