/* Assembling jamo into syllables — the half of Hangul input the browser
 * normally does for you.
 *
 * A learner without a Korean IME installed cannot type Hangul at all: the keys
 * produce Latin letters and nothing on the practice card will ever match. The
 * on-screen keyboard exists for exactly that person, and it has to behave like a
 * real IME, because "press ㅎ, ㅏ, ㄴ and watch 한 appear" is the lesson. Pushing
 * bare jamo into the field instead would teach the wrong thing and fail the
 * jamo-level scoring for a different reason.
 *
 * The rules here are the standard two-set (두벌식) ones:
 *   - a consonant after a complete syllable becomes its final, if it can be one
 *   - a vowel after a syllable with a final steals that final as its own initial
 *     (각 + ㅏ → 가가), splitting a compound final if necessary
 *   - vowels and finals combine where a combined form exists (ㅗ+ㅏ→ㅘ, ㄱ+ㅅ→ㄳ)
 */

const INITIALS = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const MEDIALS = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const FINALS = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

/** Vowel pairs that fuse into one letter. */
const MEDIAL_PAIRS: Record<string, string> = {
  "ㅗㅏ": "ㅘ", "ㅗㅐ": "ㅙ", "ㅗㅣ": "ㅚ",
  "ㅜㅓ": "ㅝ", "ㅜㅔ": "ㅞ", "ㅜㅣ": "ㅟ",
  "ㅡㅣ": "ㅢ",
};

/** Final consonants that fuse into one letter. */
const FINAL_PAIRS: Record<string, string> = {
  "ㄱㅅ": "ㄳ", "ㄴㅈ": "ㄵ", "ㄴㅎ": "ㄶ",
  "ㄹㄱ": "ㄺ", "ㄹㅁ": "ㄻ", "ㄹㅂ": "ㄼ", "ㄹㅅ": "ㄽ",
  "ㄹㅌ": "ㄾ", "ㄹㅍ": "ㄿ", "ㄹㅎ": "ㅀ", "ㅂㅅ": "ㅄ",
};

/** Reverse of MEDIAL_PAIRS, so backspace can peel a fused vowel apart: 과 → 고,
 *  not 과 → ㄱ. */
const MEDIAL_SPLIT: Record<string, [string, string]> = Object.fromEntries(
  Object.entries(MEDIAL_PAIRS).map(([pair, joined]) => [joined, [pair[0], pair[1]] as [string, string]]),
);

/** Reverse of FINAL_PAIRS: which two letters a compound final came from. */
const FINAL_SPLIT: Record<string, [string, string]> = Object.fromEntries(
  Object.entries(FINAL_PAIRS).map(([pair, joined]) => [joined, [pair[0], pair[1]] as [string, string]]),
);

const isMedial = (jamo: string) => MEDIALS.includes(jamo);
const isInitial = (jamo: string) => INITIALS.includes(jamo);

function syllable(initial: string, medial: string, final = ""): string {
  const i = INITIALS.indexOf(initial);
  const m = MEDIALS.indexOf(medial);
  const f = FINALS.indexOf(final);
  if (i < 0 || m < 0 || f < 0) return initial + medial + final;
  return String.fromCharCode(0xac00 + (i * 21 + m) * 28 + f);
}

type Parts = { initial: string; medial: string; final: string };

/** Splits a composed syllable back into its three slots, or null if `char` is
 *  not one — a bare jamo or a Latin letter is not open for further assembly. */
function partsOf(char: string | undefined): Parts | null {
  if (!char) return null;
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  const index = code - 0xac00;
  return {
    initial: INITIALS[Math.floor(index / 588)],
    medial: MEDIALS[Math.floor((index % 588) / 28)],
    final: FINALS[index % 28],
  };
}

/**
 * Returns `text` with `jamo` typed onto the end of it, assembling as a Korean
 * IME would.
 */
export function appendJamo(text: string, jamo: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const parts = partsOf(last);

  if (isMedial(jamo)) {
    if (parts) {
      // A vowel cannot follow a final, so the final leaves and becomes the
      // initial of the syllable this vowel starts.
      if (parts.final) {
        const split = FINAL_SPLIT[parts.final];
        const moved = split ? split[1] : parts.final;
        const kept = split ? split[0] : "";
        return head + syllable(parts.initial, parts.medial, kept) + syllable(moved, jamo);
      }
      const fused = MEDIAL_PAIRS[parts.medial + jamo];
      if (fused) return head + syllable(parts.initial, fused);
      return text + jamo;
    }
    // A lone initial waiting for its vowel.
    if (isInitial(last)) return head + syllable(last, jamo);
    return text + jamo;
  }

  if (isInitial(jamo) || FINALS.includes(jamo)) {
    if (parts) {
      if (!parts.final && FINALS.includes(jamo)) return head + syllable(parts.initial, parts.medial, jamo);
      if (parts.final) {
        const fused = FINAL_PAIRS[parts.final + jamo];
        if (fused) return head + syllable(parts.initial, parts.medial, fused);
      }
    }
    return text + jamo;
  }

  return text + jamo;
}

/**
 * Removes one jamo from the end, taking a syllable apart slot by slot rather
 * than deleting the whole character — which is what a Korean IME does and what
 * a learner correcting a final expects.
 */
export function deleteJamo(text: string): string {
  if (!text) return text;
  const head = text.slice(0, -1);
  const parts = partsOf(text.slice(-1));
  if (!parts) return head;

  if (parts.final) {
    const split = FINAL_SPLIT[parts.final];
    return head + syllable(parts.initial, parts.medial, split ? split[0] : "");
  }
  const medialSplit = MEDIAL_SPLIT[parts.medial];
  if (medialSplit) return head + syllable(parts.initial, medialSplit[0]);
  return head + parts.initial;
}
