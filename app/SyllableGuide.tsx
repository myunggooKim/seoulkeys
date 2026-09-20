"use client";

import type { Locale } from "./locale-detection";
import { comparableJamo, decomposeHangulCharacter } from "./hangul-keyboard";
import { tr } from "./ui-i18n";
import styles from "./FirstMinuteWarmup.module.css";

/** A read-only guide: it never changes IME input, scoring, or lesson progress. */
export function SyllableGuide({ target, typed, locale }: { target: string; typed: string; locale: Locale }) {
  const actual = comparableJamo(typed);
  let offset = 0;
  const blocks = Array.from(target).flatMap((character) => {
    if (/\s/.test(character)) return [];
    const parts = decomposeHangulCharacter(character);
    const start = offset;
    offset += parts?.length ?? 1;
    return parts ? [{ character, parts, start }] : [];
  });
  if (!blocks.length) return null;
  const active = blocks.find((block) => actual.length < block.start + block.parts.length) ?? blocks[blocks.length - 1];
  return <details className={styles.panel}>
    <summary>{tr(locale, "How this syllable is built", "이 글자는 어떻게 만들어질까요?")}</summary>
    <p>{tr(locale, "Consonant + vowel, then an optional final consonant, form one syllable block.", "자음과 모음이 한 글자로 모이고, 받침이 있으면 아래에 붙어요.")}</p>
    <div className={styles.formula} lang="ko">
      {active.parts.map((part, index) => <span key={index}>
        {index > 0 && " + "}
        <span style={{ fontWeight: actual[active.start + index] === part ? 900 : 400,
          textDecoration: actual[active.start + index] === part ? "underline" : undefined }}>{part}</span>
      </span>)} → <strong>{active.character}</strong>
    </div>
  </details>;
}
