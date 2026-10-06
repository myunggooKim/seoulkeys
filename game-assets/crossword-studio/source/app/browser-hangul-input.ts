import { appendJamo, deleteJamo } from "./hangul-compose";

// Physical positions, not the printed Latin letters: AZERTY and QWERTZ use
// the same positions as the lesson's two-set keyboard guide.
const JAMO_BY_CODE: Record<string, string> = {
  KeyQ: "ㅂ", KeyW: "ㅈ", KeyE: "ㄷ", KeyR: "ㄱ", KeyT: "ㅅ",
  KeyY: "ㅛ", KeyU: "ㅕ", KeyI: "ㅑ", KeyO: "ㅐ", KeyP: "ㅔ",
  KeyA: "ㅁ", KeyS: "ㄴ", KeyD: "ㅇ", KeyF: "ㄹ", KeyG: "ㅎ",
  KeyH: "ㅗ", KeyJ: "ㅓ", KeyK: "ㅏ", KeyL: "ㅣ",
  KeyZ: "ㅋ", KeyX: "ㅌ", KeyC: "ㅊ", KeyV: "ㅍ", KeyB: "ㅠ",
  KeyN: "ㅜ", KeyM: "ㅡ",
};
const SHIFTED: Record<string, string> = {
  "ㅂ": "ㅃ", "ㅈ": "ㅉ", "ㄷ": "ㄸ", "ㄱ": "ㄲ", "ㅅ": "ㅆ", "ㅐ": "ㅒ", "ㅔ": "ㅖ",
};

export type KeyboardInput = {
  key: string;
  code: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  isComposing?: boolean;
  keyCode?: number;
};

export function isImeKey(event: KeyboardInput): boolean {
  // Safari can end composition before the final keydown. 229 still identifies
  // that event; swallowing it would duplicate syllables or submit too early.
  return Boolean(event.isComposing || event.keyCode === 229);
}

export function browserJamoForKey(event: KeyboardInput): string | null {
  if (isImeKey(event) || event.ctrlKey || event.metaKey || event.altKey) return null;
  if (Array.from(event.key).length !== 1 || /[가-힣ㄱ-ㅎㅏ-ㅣᄀ-ᇿ]/u.test(event.key)) return null;
  const base = JAMO_BY_CODE[event.code];
  return base ? event.shiftKey ? SHIFTED[base] ?? base : base : null;
}

export type TextEdit = { value: string; caret: number };

/** Edit only the selected range; never destroy text on the other side of it. */
export function editHangulText(
  value: string,
  start: number,
  end: number,
  transform: (prefix: string) => string,
): TextEdit {
  const from = Math.max(0, Math.min(start, value.length));
  const to = Math.max(from, Math.min(end, value.length));
  const prefix = value.slice(0, from);
  // Replacing a selection starts a fresh syllable, rather than merging into an
  // unselected preceding syllable. Backspace on a selection only removes it.
  const edited = from === to ? transform(prefix) : prefix + transform("");
  return { value: edited + value.slice(to), caret: edited.length };
}

export function insertBrowserJamo(value: string, start: number, end: number, jamo: string): TextEdit {
  return editHangulText(value, start, end, (prefix) => appendJamo(prefix, jamo));
}

export function backspaceBrowserJamo(value: string, start: number, end: number): TextEdit {
  return editHangulText(value, start, end, deleteJamo);
}
