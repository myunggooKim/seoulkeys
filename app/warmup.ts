import { comparableJamo } from "./hangul-keyboard";

// Independent of the numbered curriculum: never changes saved lesson indices.
export const WARMUP_STEPS = ["ㄱㅓㄱㅓ", "가"] as const;
export function warmupProgress(target: string, typed: string) {
  const expected = comparableJamo(target);
  const actual = comparableJamo(typed);
  let matched = 0;
  while (matched < actual.length && actual[matched] === expected[matched]) matched++;
  return { expected, matched, complete: expected.length > 0 && matched === expected.length && actual.length === expected.length };
}
