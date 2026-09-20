/** Values that teach a literal key path or show immutable Hangul output must
 * stay unchanged even when the surrounding table is translated. */
export function isGuideTypingLiteral(value: string): boolean {
  const text = value.trim();
  if (!/[A-Za-z]/.test(text)) return true;
  if (text === "gks") return true;
  if (/^[A-Z]$/.test(text)) return true;
  if (/^[A-Z](?:\s+[A-Z])+(?:\s+·\s+[A-Z](?:\s+[A-Z])*)?$/.test(text)) return true;
  if (/^[a-z](?:\s*\+\s*[a-z])+$/.test(text)) return true;
  if (/^(?:[A-Z]\s*\+\s*)+[A-Z]$/.test(text)) return true;
  if (/^[A-Z]\s*\/\s*Shift\+[A-Z]$/.test(text)) return true;
  return false;
}
