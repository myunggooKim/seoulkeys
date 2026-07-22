"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type FallingWord = {
  id: number;
  korean: string;
  meaning: string;
  x: number;
  y: number;
  speed: number;
};

const wordBank = [
  { korean: "사랑", meaning: "love" }, { korean: "음악", meaning: "music" },
  { korean: "친구", meaning: "friend" }, { korean: "한국", meaning: "Korea" },
  { korean: "여행", meaning: "travel" }, { korean: "바다", meaning: "sea" },
  { korean: "하늘", meaning: "sky" }, { korean: "노래", meaning: "song" },
  { korean: "마음", meaning: "heart" }, { korean: "오늘", meaning: "today" },
  { korean: "안녕", meaning: "hello" }, { korean: "별빛", meaning: "starlight" },
];

const initialWords: FallingWord[] = [
  { id: 1, korean: "사랑", meaning: "love", x: 20, y: -6, speed: 0.42 },
  { id: 2, korean: "음악", meaning: "music", x: 49, y: -20, speed: 0.48 },
  { id: 3, korean: "여행", meaning: "travel", x: 77, y: -12, speed: 0.38 },
];

export function FallingWordsGame({ koreanUi, soundEnabled, onSuccessSound }: {
  koreanUi: boolean;
  soundEnabled: boolean;
  onSuccessSound: () => void;
}) {
  const nextId = useRef(4);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const burstTimerRef = useRef<number | null>(null);
  const [words, setWords] = useState<FallingWord[]>(initialWords);
  const [input, setInput] = useState("");
  const [inputEpoch, setInputEpoch] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [score, setScore] = useState(500);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState(koreanUi ? "물에 빠지기 전에 단어를 입력하세요." : "Type a word before it reaches the water.");
  const [splash, setSplash] = useState(false);
  const [captureBurst, setCaptureBurst] = useState<{ id: number; x: number; y: number; text: string } | null>(null);

  const spawnWord = useCallback((slot = 0): FallingWord => {
    const item = wordBank[Math.floor(Math.random() * wordBank.length)];
    return {
      id: nextId.current++, korean: item.korean, meaning: item.meaning,
      x: 10 + ((Math.random() * 67 + slot * 19) % 74),
      y: -8 - Math.random() * 22,
      speed: 0.34 + Math.random() * 0.24,
    };
  }, []);

  const resetGame = useCallback(() => {
    setWords([spawnWord(0), spawnWord(1), spawnWord(2)]);
    setInput("");
    setInputEpoch((current) => current + 1);
    setInputError(false);
    setScore(500);
    setMisses(0);
    setCombo(0);
    setMessage(koreanUi ? "게임 시작! 보이는 단어를 그대로 입력하세요." : "Game on! Type any visible word exactly.");
  }, [koreanUi, spawnWord]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWords((current) => {
        let missed = 0;
        const next = current
          .map((word) => ({ ...word, y: word.y + word.speed }))
          .filter((word) => {
            if (word.y < 83) return true;
            missed += 1;
            return false;
          });
        if (missed) {
          window.setTimeout(() => {
            setScore((value) => Math.max(0, value - missed * 50));
            setMisses((value) => value + missed);
            setCombo(0);
            setSplash(true);
            setMessage(koreanUi ? `풍덩! ${missed * 50}점이 줄었어요.` : `Splash! Lost ${missed * 50} points.`);
            window.setTimeout(() => setSplash(false), 480);
          }, 0);
        }
        while (next.length < 3) next.push(spawnWord(next.length));
        return next;
      });
    }, 80);
    return () => window.clearInterval(timer);
  }, [koreanUi, spawnWord]);

  useEffect(() => () => {
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
  }, []);

  function submitWord() {
    if (composingRef.current) return;
    const normalized = input.trim();
    if (!normalized) return;
    const matched = words.find((word) => word.korean === normalized);
    if (!matched) {
      setInputError(true);
      setCombo(0);
      setMessage(koreanUi
        ? "오타가 있어요. 단어는 사라지지 않았습니다. 고친 뒤 Enter를 누르세요."
        : "Not a match. The word stays—correct it and press Enter again.");
      return;
    }
    const gained = 100 + combo * 10;
    setWords((current) => [...current.filter((word) => word.id !== matched.id), spawnWord(current.length)]);
    setScore((current) => current + gained);
    setCombo((current) => current + 1);
    setInput("");
    setInputError(false);
    // Remounting the input clears the final Hangul composition buffer as well as React state.
    setInputEpoch((current) => current + 1);
    setMessage(koreanUi ? `잡았다! +${gained}점 · 다음 단어를 입력하세요.` : `Caught it! +${gained} · Type the next word.`);
    setCaptureBurst({ id: matched.id, x: matched.x, y: Math.max(8, matched.y), text: `+${gained}` });
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => setCaptureBurst(null), 720);
    if (soundEnabled) onSuccessSound();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitWord();
  }

  return (
    <div className="word-rain-game">
      <div className="word-rain-board" aria-label={koreanUi ? "하늘에서 떨어지는 한국어 단어" : "Falling Korean words game"}>
        <div className="sky-cloud cloud-one" /><div className="sky-cloud cloud-two" />
        {words.map((word) => (
          <span className={`rain-word ${input.trim() && word.korean.startsWith(input.trim()) ? "targeted" : ""}`} lang="ko" key={word.id} style={{ left: `${word.x}%`, top: `${word.y}%` }}>
            {word.korean}<small>{word.meaning}</small>
          </span>
        ))}
        {captureBurst && <span className="capture-burst" key={captureBurst.id} style={{ left: `${captureBurst.x}%`, top: `${captureBurst.y}%` }} aria-hidden="true">★<b>{captureBurst.text}</b></span>}
        <div className={`sea-water ${splash ? "splash" : ""}`}><i /><i /><i /><b>{koreanUi ? "바다" : "SEA"}</b></div>
      </div>
      <form className="word-rain-console" onSubmit={submit}>
        <div className="game-scorebar">
          <span>{koreanUi ? "점수" : "SCORE"}<b>{score}</b></span>
          <span>{koreanUi ? "연속" : "COMBO"}<b>×{combo}</b></span>
          <span>{koreanUi ? "놓침" : "MISSED"}<b>{misses}</b></span>
        </div>
        <div>
          <p className="demo-label">WORD RAIN · LIVE</p>
          <h3>{koreanUi ? "단어가 바다에 빠지기 전에 잡으세요." : "Catch each word before it splashes."}</h3>
          <p>{koreanUi ? "보이는 단어를 완성한 뒤 Enter를 누르세요. 오타가 있어도 단어는 사라지지 않습니다." : "Finish a visible word, then press Enter. A typo never removes the falling word."}</p>
        </div>
        <label htmlFor="word-rain-input">{koreanUi ? "떨어지는 단어 입력" : "Type a falling word"}</label>
        <div className="inline-form">
          <input
            className={inputError ? "input-error" : ""}
            id="word-rain-input"
            key={inputEpoch}
            lang="ko"
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (inputError) setInputError(false);
            }}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing || composingRef.current) return;
              event.preventDefault();
              submitWord();
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="button button-primary" type="submit">{koreanUi ? "Enter로 잡기" : "Catch · Enter"}</button>
        </div>
        <p className="form-message" aria-live="polite">{message}</p>
        <button className="game-reset" type="button" onClick={resetGame}>↻ {koreanUi ? "처음부터" : "Restart"}</button>
      </form>
    </div>
  );
}
