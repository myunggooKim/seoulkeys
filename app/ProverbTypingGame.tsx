"use client";

import { HangulTextarea } from "./HangulTypingField";
import { WordMeaningText } from "./WordMeaningText";

import { useCallback, useEffect, useRef, useState } from "react";
import { cloneContentDeck, createContentDeck, takeContentBatch, type ContentDeck } from "./content-deck";
import type { ProverbEntry } from "./expanded-content";
import type { Locale } from "./locale-detection";
import {
  localizedProverbKind,
  localizedProverbMeaning,
  proverbTr,
} from "./proverb-i18n";

type Props = {
  entries: ProverbEntry[];
  locale: Locale;
  soundEnabled: boolean;
  onKeySound: (code: string) => void;
  onSuccessSound: () => void;
  onPreview: (text: string) => void;
  onConfirm: (advance: () => void, text: string) => void;
};

const ROUND_SIZE = 10;

export function ProverbTypingGame({
  entries,
  locale,
  soundEnabled,
  onKeySound,
  onSuccessSound,
  onPreview,
  onConfirm,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [roundContent, setRoundContent] = useState<{
    deck: ContentDeck<ProverbEntry>;
    entries: ProverbEntry[];
  }>(() => {
    const deck = createContentDeck<ProverbEntry>();
    return { deck, entries: takeContentBatch(deck, entries, ROUND_SIZE, (entry) => entry.korean) };
  });
  const roundEntries = roundContent.entries;
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");
  const current = roundEntries[index];
  const exact = input.trim() === current.korean;

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, index, round]);

  function advance() {
    if (index + 1 < roundEntries.length) {
      setIndex((value) => value + 1);
    } else {
      setRoundContent((current) => {
        const deck = cloneContentDeck(current.deck);
        return { deck, entries: takeContentBatch(deck, entries, ROUND_SIZE, (entry) => entry.korean) };
      });
      setIndex(0);
      setRound((value) => value + 1);
    }
    setInput("");
    setLocked(false);
    setMessage("");
    focusInput();
  }

  function submit() {
    if (locked) return;
    if (!exact) {
      setMessage(proverbTr(locale, "checkSpacing"));
      focusInput();
      return;
    }
    setLocked(true);
    setMessage(proverbTr(locale, "success"));
    if (soundEnabled) onSuccessSound();
    onConfirm(advance, current.korean);
  }

  return (
    <div className="travel-demo" onKeyDownCapture={(event) => {
      if (event.altKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        onPreview(current.korean);
        focusInput();
      }
    }}>
      <div className="travel-scene">
        <span className="travel-situation">
          {localizedProverbKind(current, locale)} · {proverbTr(locale, "round")} {round}
        </span>
        <WordMeaningText as="blockquote" text={current.korean} locale={locale} lang="ko" />
        <p>{localizedProverbMeaning(current, locale)}</p>
        <div
          className="phrase-dots"
          aria-label={proverbTr(locale, "position", { current: index + 1, total: ROUND_SIZE })}
        >
          {roundEntries.map((entry, itemIndex) => (
            <button
              type="button"
              className={itemIndex === index ? "active" : ""}
              aria-label={proverbTr(locale, "line", { current: itemIndex + 1 })}
              onClick={() => {
                if (locked) return;
                setIndex(itemIndex);
                setInput("");
                setMessage("");
              }}
              key={entry.korean}
            />
          ))}
        </div>
      </div>
      <div className="travel-form">
        <p className="demo-label">
          {proverbTr(locale, "label")} · {index + 1}/{ROUND_SIZE}
        </p>
        <h3>{proverbTr(locale, "heading")}</h3>
        <p>{proverbTr(locale, "instructions")}</p>
        <label htmlFor="proverb-line-input">{proverbTr(locale, "inputLabel")}</label>
        <HangulTextarea
          ref={inputRef}
          locale={locale}
          onScreenSubmit={submit}
          id="proverb-line-input"
          lang="ko"
          value={input}
          disabled={locked}
          onValueChange={(value) => setInput(value.replace(/\r?\n/g, ""))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
              return;
            }
            if (soundEnabled && !event.ctrlKey && !event.metaKey && !event.altKey) onKeySound(event.code);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <p className={`form-message ${exact ? "success" : ""}`} aria-live="polite">
          {message || (exact
            ? proverbTr(locale, "complete")
            : proverbTr(locale, "exact"))}
        </p>
        <button className="button button-primary" type="button" disabled={!exact || locked} onClick={submit}>
          {proverbTr(locale, "check")} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
