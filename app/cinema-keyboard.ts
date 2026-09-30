import { decomposeHangulCharacter } from "./hangul-keyboard";
import type { GuideFinger } from "./HandGuide";

export const keyboardRows = [
  { latin: "QWERTYUIOP", hangul: "ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ", z: -.55, offset: -.16 },
  { latin: "ASDFGHJKL;", hangul: "ㅁㄴㅇㄹㅎㅗㅓㅏㅣ;", z: .04, offset: 0 },
  { latin: "ZXCVBNM,.", hangul: "ㅋㅌㅊㅍㅠㅜㅡ,.", z: .63, offset: .19 },
];
export const fingerForCode: Record<string, GuideFinger> = {
  KeyQ: "left-pinky", KeyA: "left-pinky", KeyZ: "left-pinky",
  KeyW: "left-ring", KeyS: "left-ring", KeyX: "left-ring",
  KeyE: "left-middle", KeyD: "left-middle", KeyC: "left-middle",
  KeyR: "left-index", KeyT: "left-index", KeyF: "left-index", KeyG: "left-index", KeyV: "left-index", KeyB: "left-index",
  KeyY: "right-index", KeyU: "right-index", KeyH: "right-index", KeyJ: "right-index", KeyN: "right-index", KeyM: "right-index",
  KeyI: "right-middle", KeyK: "right-middle", KeyO: "right-ring", KeyL: "right-ring",
  KeyP: "right-pinky", Semicolon: "right-pinky", Comma: "right-middle", Period: "right-ring", Space: "right-thumb",
};
export function codeForCharacter(character: string) {
  return character === ";" ? "Semicolon" : character === "," ? "Comma" : character === "." ? "Period" : `Key${character}`;
}
const codeForJamo: Record<string, string> = { " ": "Space", ".": "Period", ",": "Comma" };
for (const row of keyboardRows) Array.from(row.hangul).forEach((jamo, index) => { codeForJamo[jamo] = codeForCharacter(row.latin[index]); });
export function nextKeyForText(target: string, value: string) {
  // Guidance includes the space bar; the production scoring helper deliberately
  // ignores spaces, so it is not the right sequence for this physical-key cue.
  const sequence = (text: string) => Array.from(text).flatMap(character => decomposeHangulCharacter(character) ?? [character]);
  const expected = sequence(target), typed = sequence(value);
  return codeForJamo[expected[Math.min(typed.length, expected.length)]] ?? null;
}
