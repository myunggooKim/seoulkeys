/* Korean line breaking for the practice sentence.
 *
 * `word-break: keep-all` already stops the browser breaking inside an 어절, so
 * every break lands on a space. That is necessary but not sufficient: Korean
 * typography also does not start a line with a 의존명사, because the bound noun
 * is meaningless without the word in front of it. The browser has no way to know
 * that, so "회의는 몇 시에 시작해요?" came out as
 *
 *     회의는 몇
 *     시에 시작해요?
 *
 * splitting "몇 시에" — a reading a learner should never be shown by something
 * that teaches Korean.
 *
 * The text itself is never touched. The practice card renders one <span> per
 * character and compares the learner's input against the same string, so
 * inserting a U+00A0 would silently add a character they would have to type.
 * This module only reports which character ranges must stay on one line; the
 * card wraps each range in a `nowrap` element, leaving the character sequence
 * and its per-character state classes exactly as they were.
 */

/** Bound nouns that cannot open a line whatever precedes them. */
const ALWAYS_BOUND = ["수", "것", "때", "줄", "리", "데", "바", "뿐", "만큼", "따름", "터", "채", "척"];

/** Counters — bound only after a number or determiner, since most of them are
 *  ordinary nouns on their own ("장", "대", "곳"). */
const COUNTER_BOUND = [
  "시", "분", "초", "개", "명", "잔", "번", "살", "원", "층", "권", "장", "마리", "대",
  "그루", "병", "갑", "통", "판", "인분", "가지", "군데", "곳", "쪽", "벌", "켤레", "자루",
];

const DETERMINERS = new Set([
  "몇", "한", "두", "세", "서너", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "스무",
  "여러", "모든", "각", "이", "그", "저", "무슨", "어느", "어떤", "웬", "온갖", "첫", "새",
]);

/** Binding two long 어절 together can make a run wider than the card, which
 *  would overflow instead of wrapping — the opposite of the fix. Pairs this
 *  short never do. */
const MAX_GROUP_CHARS = 14;

const isNumeric = (token: string) => /^[0-9]+$/.test(token);

/** What may follow a bound noun inside the same 어절 — its 조사 or a copula
 *  ending. Matching the opening syllable alone is not enough: "바랍니다" opens
 *  with the bound noun 바 and "줄래" with 줄, and binding those to the previous
 *  word was wrong in exactly the way this module exists to prevent. */
const PARTICLE_TAIL =
  /^(?:이|가|은|는|을|를|도|만|의|에|에서|에게|와|과|로|으로|라도|밖에|까지|부터|처럼|보다|같|없|있)?(?:[다요]|입니다|이에요|예요|인가요|이야|였|이었)?$/;

/** A 의존명사 must be preceded by a 관형어, which in Korean ends in ㄹ or ㄴ
 *  ("결제할 수", "필요하신 것", "잃는 것"). Checking that keeps ordinary nouns
 *  from being glued to whatever happens to sit in front of them. */
function endsWithAdnominal(token: string): boolean {
  const last = token.codePointAt(token.length - 1);
  if (last === undefined || last < 0xac00 || last > 0xd7a3) return false;
  const jongseong = (last - 0xac00) % 28;
  // 8 = ㄹ, 4 = ㄴ
  return jongseong === 8 || jongseong === 4;
}

/** True when `next` must not be the first word on a new line after `previous`. */
function mustStayTogether(previous: string, next: string): boolean {
  if (!previous || !next) return false;

  const bound = ALWAYS_BOUND.find((noun) => next.startsWith(noun));
  if (bound && endsWithAdnominal(previous) && PARTICLE_TAIL.test(next.slice(bound.length))) {
    return true;
  }
  // Counters carry their own guard — a number or determiner in front — so the
  // tail is left free ("몇 시인가요?", "한 장만").
  if (COUNTER_BOUND.some((noun) => next.startsWith(noun))) {
    return DETERMINERS.has(previous) || isNumeric(previous);
  }
  return false;
}

export type CharRange = { start: number; end: number };

/**
 * Reports only the spans that must not be broken — the bound pairs, and nothing
 * else. Ranges are sorted, non-overlapping, and stop at the last non-space
 * character of the pair.
 *
 * That last part matters more than it looks. A first version returned ranges
 * tiling the whole sentence, each 어절 carrying its trailing space, and the
 * caller wrapped every one in `nowrap`. Since the spaces then sat *inside*
 * unbreakable runs and no whitespace was left between them, the sentence lost
 * every break opportunity it had and ran straight out of the card. Only the
 * pairs are marked now, so each remaining space is still a place the line can
 * break.
 *
 * Indices count **code points**, not UTF-16 units, because the caller slices
 * `Array.from(sentence)` — the per-character state list — with them. The two
 * agree for Hangul but not for anything outside the BMP, and a silent one-index
 * drift there would colour the wrong characters.
 */
export function koreanBindings(text: string): CharRange[] {
  if (!text) return [];
  const chars = Array.from(text);

  const tokens: { text: string; start: number; end: number }[] = [];
  let index = 0;
  while (index < chars.length) {
    while (index < chars.length && /\s/.test(chars[index])) index++;
    if (index >= chars.length) break;
    const start = index;
    while (index < chars.length && !/\s/.test(chars[index])) index++;
    tokens.push({ text: chars.slice(start, index).join(""), start, end: index });
  }

  const bindings: CharRange[] = [];
  for (let i = 1; i < tokens.length; i++) {
    const previous = tokens[i - 1];
    const token = tokens[i];
    if (!mustStayTogether(previous.text, token.text)) continue;
    if (previous.text.length + token.text.length + 1 > MAX_GROUP_CHARS) continue;

    const open = bindings[bindings.length - 1];
    // Chain onto the previous binding when it ends on the same 어절, so
    // "주실 수 있나요?" cannot produce two ranges that overlap on "수".
    if (open && open.end === previous.end) open.end = token.end;
    else bindings.push({ start: previous.start, end: token.end });
  }
  return bindings;
}
