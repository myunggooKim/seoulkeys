"use client";

import { useState } from "react";
import { appendJamo, deleteJamo } from "./hangul-compose";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

/* A Hangul keyboard for the learner who does not have one.
 *
 * Watching session recordings, people without a Korean IME reach for the mouse
 * and try to click the jamo drawn on the practice card — which does nothing.
 * That is not a request for installation instructions; it is a request for a
 * keyboard, right now. Installing means system settings and often a restart, and
 * most people leave rather than do that mid-lesson.
 *
 * The layout is the two-set (두벌식) one, in its real physical arrangement, so
 * the muscle memory built here transfers the day they do install it: consonants
 * on the left, vowels on the right, shift for the doubled consonants.
 */

const ROWS: string[][] = [
  ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
  ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
  ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"],
];

/** What each key produces with shift held. Only five keys have a doubled form. */
const SHIFTED: Record<string, string> = {
  "ㅂ": "ㅃ", "ㅈ": "ㅉ", "ㄷ": "ㄸ", "ㄱ": "ㄲ", "ㅅ": "ㅆ",
  "ㅐ": "ㅒ", "ㅔ": "ㅖ",
};

const VOWELS = new Set(["ㅛ","ㅕ","ㅑ","ㅐ","ㅔ","ㅗ","ㅓ","ㅏ","ㅣ","ㅠ","ㅜ","ㅡ","ㅒ","ㅖ"]);

export function OnScreenKeyboard({
  locale,
  onInput,
  onSubmit,
  onSetUpRealKeyboard,
  disabled = false,
}: {
  locale: Locale;
  /* Sends a transform rather than a finished string. Somebody hunting for jamo
     with a mouse clicks faster than React re-renders, and a key that closed over
     the value it was rendered with would then assemble onto stale text — two
     quick clicks on ㅎ then ㅏ produced ㅏ, losing the ㅎ. Applying the transform to
     whatever the field holds at that moment cannot drop a keypress. */
  onInput: (transform: (previous: string) => string) => void;
  onSubmit?: () => void;
  /** Opens the setup walkthrough. The board always offers a way off itself. */
  onSetUpRealKeyboard?: () => void;
  disabled?: boolean;
}) {
  const [shift, setShift] = useState(false);

  const press = (base: string) => {
    const jamo = shift ? SHIFTED[base] ?? base : base;
    onInput((previous) => appendJamo(previous, jamo));
    // Shift is a one-shot, as it is on a phone keyboard — holding it down is not
    // possible with a mouse.
    if (shift) setShift(false);
  };

  return (
    <div className="osk" role="group" aria-label={tr(locale, "On-screen Korean keyboard", "화면 한글 키보드")}>
      <div className="osk-rows">
        {ROWS.map((row, index) => (
          <div className="osk-row" key={index}>
            {index === 2 && (
              <button
                type="button"
                disabled={disabled}
                className={`osk-key osk-mod${shift ? " is-on" : ""}`}
                onClick={() => setShift((on) => !on)}
                aria-pressed={shift}
              >
                ⇧
              </button>
            )}
            {row.map((base) => {
              const label = shift ? SHIFTED[base] ?? base : base;
              return (
                <button
                  type="button"
                  disabled={disabled}
                  key={base}
                  className={`osk-key${VOWELS.has(base) ? " is-vowel" : ""}`}
                  onClick={() => press(base)}
                >
                  {label}
                </button>
              );
            })}
            {index === 2 && (
              <button
                type="button"
                disabled={disabled}
                className="osk-key osk-mod"
                onClick={() => onInput(deleteJamo)}
                aria-label={tr(locale, "Backspace", "지우기")}
              >
                ⌫
              </button>
            )}
          </div>
        ))}

        <div className="osk-row">
          <button
            type="button"
            disabled={disabled}
            className="osk-key osk-space"
            onClick={() => onInput((previous) => `${previous} `)}
          >
            {tr(locale, "space", "띄어쓰기")}
          </button>
          {onSubmit && (
            <button type="button" disabled={disabled} className="osk-key osk-enter" onClick={onSubmit}>
              ↵ Enter
            </button>
          )}
        </div>
      </div>

      {onSetUpRealKeyboard && (
        <p className="osk-exit">
          {tr(
            locale,
            "Clicking is a stopgap — typing on your own keyboard is many times faster.",
            "클릭은 임시방편입니다 — 손가락으로 치는 편이 여러 배 빠릅니다.",
          )}
          <button type="button" onClick={onSetUpRealKeyboard}>
            {tr(locale, "Turn mine on", "내 키보드 켜기")}
          </button>
        </p>
      )}
    </div>
  );
}
