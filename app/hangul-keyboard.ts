const initialJamo = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const medialJamo = [
  ["ㅏ"], ["ㅐ"], ["ㅑ"], ["ㅒ"], ["ㅓ"], ["ㅔ"], ["ㅕ"], ["ㅖ"], ["ㅗ"],
  ["ㅗ", "ㅏ"], ["ㅗ", "ㅐ"], ["ㅗ", "ㅣ"], ["ㅛ"], ["ㅜ"], ["ㅜ", "ㅓ"],
  ["ㅜ", "ㅔ"], ["ㅜ", "ㅣ"], ["ㅠ"], ["ㅡ"], ["ㅡ", "ㅣ"], ["ㅣ"],
];
const finalJamo = [
  [], ["ㄱ"], ["ㄱ", "ㄱ"], ["ㄱ", "ㅅ"], ["ㄴ"], ["ㄴ", "ㅈ"], ["ㄴ", "ㅎ"], ["ㄷ"], ["ㄹ"],
  ["ㄹ", "ㄱ"], ["ㄹ", "ㅁ"], ["ㄹ", "ㅂ"], ["ㄹ", "ㅅ"], ["ㄹ", "ㅌ"], ["ㄹ", "ㅍ"],
  ["ㄹ", "ㅎ"], ["ㅁ"], ["ㅂ"], ["ㅂ", "ㅅ"], ["ㅅ"], ["ㅅ", "ㅅ"], ["ㅇ"], ["ㅈ"],
  ["ㅊ"], ["ㅋ"], ["ㅌ"], ["ㅍ"], ["ㅎ"],
];

export function decomposeHangulCharacter(character: string): string[] | null {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined || codePoint < 0xac00 || codePoint > 0xd7a3) return null;

  const syllableIndex = codePoint - 0xac00;
  const initialIndex = Math.floor(syllableIndex / 588);
  const medialIndex = Math.floor((syllableIndex % 588) / 28);
  const finalIndex = syllableIndex % 28;
  const initial = initialJamo[initialIndex];

  return [
    ...(initial ? [initial] : []),
    ...(medialJamo[medialIndex] ?? []),
    ...(finalJamo[finalIndex] ?? []),
  ];
}


/**
 * Flattens text to the jamo the learner actually pressed.
 *
 * Korean IMEs compose while you type, so a perfectly typed drill "ㅁㅓㄴㅏ"
 * arrives as "머나" and matches nothing character-for-character. Whitespace is
 * dropped as well: in a jamo drill, whether the space bar was pressed must not
 * decide pass or fail.
 */
export function comparableJamo(text: string): string[] {
  const jamo: string[] = [];
  for (const character of text) {
    if (/\s/.test(character)) continue;
    const decomposed = decomposeHangulCharacter(character);
    if (decomposed) jamo.push(...decomposed);
    else jamo.push(character);
  }
  return jamo;
}

/** True when the typed text and the target are the same jamo sequence. */
export function sameJamoSequence(a: string, b: string): boolean {
  const left = comparableJamo(a);
  const right = comparableJamo(b);
  return left.length === right.length && left.every((j, i) => j === right[i]);
}
