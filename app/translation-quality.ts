/**
 * Detect only unmistakably broken machine output.
 *
 * This deliberately avoids language-specific grammar checks: a false positive
 * would throw away a useful translation. The rules below are limited to decoder
 * loops, runaway output, injected numbers, and an English source copied with an
 * unrelated tail. Callers can safely fall back to the reviewed English string.
 */
export function translationQualityIssue(source: string, candidate: string): string | null {
  const value = candidate.trim();
  if (!value) return "empty translation";
  if (value.length > Math.max(240, source.length * 4)) return "runaway length";
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) return "control character";

  // Long injected identifiers are a common decoder failure. Short numbers are
  // allowed because a natural translation may turn "one" into a local digit.
  if (!/\p{Nd}{6,}/u.test(source) && /\p{Nd}{6,}/u.test(value)) return "unexpected number run";

  const tokens = value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  if (tokens.length >= 10) {
    const counts = new Map<string, number>();
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
    const mostRepeated = Math.max(...counts.values());
    if (mostRepeated >= 8 && mostRepeated / tokens.length >= 0.4) return "repeated token loop";

    for (const width of [2, 3]) {
      const phrases = new Map<string, number>();
      for (let index = 0; index <= tokens.length - width; index += 1) {
        const phrase = tokens.slice(index, index + width).join(" ");
        phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
      }
      if ([...phrases.values()].some((count) => count >= 8 && (count * width) / tokens.length >= 0.5)) {
        return "repeated phrase loop";
      }
    }
  }

  const normalizedSource = source.trim().toLocaleLowerCase();
  const normalizedValue = value.toLocaleLowerCase();
  if (
    source.length >= 40 &&
    normalizedValue !== normalizedSource &&
    normalizedValue.includes(normalizedSource) &&
    value.length > source.length * 1.2
  ) {
    return "source copied with unrelated tail";
  }

  return null;
}
