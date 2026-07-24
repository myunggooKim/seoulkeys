"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

type FallingWord = {
  id: number;
  korean: string;
  meaning: string;
  x: number;
  y: number;
  speed: number;
  lane: number;
};

const wordBank = [
  { korean: "사랑", meaning: "love" }, { korean: "음악", meaning: "music" },
  { korean: "친구", meaning: "friend" }, { korean: "한국", meaning: "Korea" },
  { korean: "여행", meaning: "travel" }, { korean: "바다", meaning: "sea" },
  { korean: "하늘", meaning: "sky" }, { korean: "노래", meaning: "song" },
  { korean: "마음", meaning: "heart" }, { korean: "오늘", meaning: "today" },
  { korean: "안녕", meaning: "hello" }, { korean: "별빛", meaning: "starlight" },
  { korean: "드라마", meaning: "drama" }, { korean: "한글", meaning: "Hangul" },
  { korean: "설렘", meaning: "flutter" }, { korean: "꿈꾸다", meaning: "to dream" },
  { korean: "반가워", meaning: "nice to meet you" }, { korean: "고마워", meaning: "thank you" },
];

const lanePositions = [11, 27, 43, 59, 75, 88];
const MAX_LIVES = 5;
const CAUGHT_PER_LEVEL = 7;

export function FallingWordsGame({ koreanUi, soundEnabled, onSuccessSound, onKeySound }: {
  koreanUi: boolean;
  soundEnabled: boolean;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
}) {
  const nextId = useRef(4);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const missesRef = useRef(0);
  const burstTimerRef = useRef<number | null>(null);
  const [words, setWords] = useState<FallingWord[]>([
    { id: 1, korean: "사랑", meaning: "love", x: lanePositions[1], y: 5, speed: 0.23, lane: 1 },
    { id: 2, korean: "음악", meaning: "music", x: lanePositions[3], y: -8, speed: 0.25, lane: 3 },
    { id: 3, korean: "여행", meaning: "travel", x: lanePositions[5], y: 0, speed: 0.21, lane: 5 },
  ]);
  const [input, setInput] = useState("");
  const [inputEpoch, setInputEpoch] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [caught, setCaught] = useState(0);
  const [combo, setCombo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState(koreanUi ? "손은 키보드에 두세요. 단어 + Enter만 사용합니다." : "Keep your hands on the keyboard. Type a word + Enter.");
  const [splash, setSplash] = useState(false);
  const [captureBurst, setCaptureBurst] = useState<{ id: number; x: number; y: number; text: string } | null>(null);

  const level = Math.min(8, Math.floor(caught / CAUGHT_PER_LEVEL) + 1);
  const levelProgress = (caught % CAUGHT_PER_LEVEL) / CAUGHT_PER_LEVEL * 100;
  const desiredWords = Math.min(6, 2 + Math.ceil(level / 2));

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, []);

  const spawnWord = useCallback((slot = 0, atLevel = 1): FallingWord => {
    const item = wordBank[Math.floor(Math.random() * wordBank.length)];
    const lane = (slot + Math.floor(Math.random() * lanePositions.length)) % lanePositions.length;
    return {
      id: nextId.current++,
      korean: item.korean,
      meaning: item.meaning,
      x: lanePositions[lane] + (Math.random() * 4 - 2),
      y: -4 - Math.random() * 20 - slot * 4,
      speed: 0.19 + atLevel * 0.025 + Math.random() * 0.09,
      lane,
    };
  }, []);

  const resetGame = useCallback(() => {
    nextId.current = 1;
    missesRef.current = 0;
    setWords([spawnWord(0, 1), spawnWord(2, 1), spawnWord(4, 1)]);
    setInput("");
    setInputEpoch((current) => current + 1);
    setInputError(false);
    setScore(0);
    setMisses(0);
    setCaught(0);
    setCombo(0);
    setPaused(false);
    setGameOver(false);
    setMessage(koreanUi ? "1단계 시작! 단어를 완성하고 Enter를 누르세요." : "Level 1! Finish a word and press Enter.");
    window.setTimeout(focusInput, 0);
  }, [focusInput, koreanUi, spawnWord]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (paused || gameOver) return;
    const timer = window.setInterval(() => {
      setWords((current) => {
        let missedNow = 0;
        const next = current
          .map((word) => ({ ...word, y: word.y + word.speed }))
          .filter((word) => {
            if (word.y < 84) return true;
            missedNow += 1;
            return false;
          });

        if (missedNow) {
          const nextMisses = Math.min(MAX_LIVES, missesRef.current + missedNow);
          missesRef.current = nextMisses;
          window.setTimeout(() => {
            setScore((value) => Math.max(0, value - missedNow * 75));
            setMisses(nextMisses);
            setCombo(0);
            setSplash(true);
            window.setTimeout(() => setSplash(false), 520);
            if (nextMisses >= MAX_LIVES) {
              setGameOver(true);
              setMessage(koreanUi ? "파도가 높아졌어요. Enter를 누르면 즉시 다시 시작합니다." : "The tide won. Press Enter to restart instantly.");
              window.setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 0);
            } else {
              setMessage(koreanUi ? `풍덩! 생명 ${MAX_LIVES - nextMisses}개 · 손을 멈추지 마세요.` : `Splash! ${MAX_LIVES - nextMisses} lives left. Keep typing.`);
            }
          }, 0);
        }

        while (next.length < desiredWords && missesRef.current < MAX_LIVES) {
          next.push(spawnWord(next.length, level));
        }
        return next;
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [desiredWords, gameOver, koreanUi, level, paused, spawnWord]);

  useEffect(() => () => {
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
  }, []);

  function submitWord() {
    if (composingRef.current || paused) return;
    if (gameOver) {
      resetGame();
      return;
    }
    const normalized = input.trim();
    if (!normalized) return;
    const matched = words
      .filter((word) => word.korean === normalized)
      .sort((a, b) => b.y - a.y)[0];
    if (!matched) {
      setInputError(true);
      setCombo(0);
      setMessage(koreanUi
        ? "아직 일치하지 않아요. 단어는 그대로입니다. Backspace로 고치고 Enter!"
        : "No match yet. The word stays. Correct it with Backspace, then Enter.");
      focusInput();
      return;
    }

    const urgencyBonus = Math.max(0, Math.round(matched.y));
    const gained = 100 + level * 20 + Math.min(200, combo * 15) + urgencyBonus;
    setWords((current) => [...current.filter((word) => word.id !== matched.id), spawnWord(current.length, level)]);
    setScore((current) => current + gained);
    setCaught((current) => current + 1);
    setCombo((current) => current + 1);
    setInput("");
    setInputError(false);
    setInputEpoch((current) => current + 1);
    setMessage(koreanUi ? `정확히 잡았어요! +${gained} · 다음 단어를 바로 입력하세요.` : `Perfect catch! +${gained} · Type the next word now.`);
    setCaptureBurst({ id: matched.id, x: matched.x, y: Math.max(8, matched.y), text: `+${gained}` });
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => setCaptureBurst(null), 720);
    if (soundEnabled) onSuccessSound();
    window.setTimeout(focusInput, 0);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitWord();
  }

  function handleGameKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setPaused((current) => {
        const next = !current;
        window.setTimeout(() => next ? rootRef.current?.focus({ preventScroll: true }) : focusInput(), 0);
        return next;
      });
    } else if ((paused || gameOver) && event.key === "Enter") {
      event.preventDefault();
      if (gameOver) resetGame();
      else {
        setPaused(false);
        window.setTimeout(focusInput, 0);
      }
    }
  }

  return (
    <div ref={rootRef} tabIndex={-1} className={`word-rain-game ${paused ? "is-paused" : ""} ${gameOver ? "is-game-over" : ""}`} onKeyDownCapture={handleGameKeys}>
      <div className="word-rain-board" aria-label={koreanUi ? "하늘에서 떨어지는 한국어 단어" : "Falling Korean words game"}>
        <div className="aurora aurora-one" /><div className="aurora aurora-two" />
        <div className="sky-cloud cloud-one" /><div className="sky-cloud cloud-two" />
        <div className="word-rain-level"><small>WAVE</small><b>{level}</b></div>
        <div className="word-rain-lives" aria-label={`${MAX_LIVES - misses} lives`}>
          {Array.from({ length: MAX_LIVES }, (_, index) => <span className={index < MAX_LIVES - misses ? "alive" : ""} key={index}>♥</span>)}
        </div>
        {words.map((word) => (
          <span
            className={`rain-word ${input.trim() && word.korean.startsWith(input.trim()) ? "targeted" : ""} lane-${word.lane}`}
            lang="ko"
            key={word.id}
            style={{ left: `${word.x}%`, top: `${word.y}%` }}
          >
            <i aria-hidden="true" />
            {word.korean}<small>{word.meaning}</small>
          </span>
        ))}
        {captureBurst && <span className="capture-burst" key={captureBurst.id} style={{ left: `${captureBurst.x}%`, top: `${captureBurst.y}%` }} aria-hidden="true">★<b>{captureBurst.text}</b></span>}
        <div className={`sea-water ${splash ? "splash" : ""}`}><i /><i /><i /><b>{koreanUi ? "바다" : "SEA"}</b></div>
        {(paused || gameOver) && (
          <div className="game-curtain" role="status">
            <small>{gameOver ? "FINAL SCORE" : "PAUSED"}</small>
            <b>{gameOver ? score.toLocaleString() : koreanUi ? "잠시 멈춤" : "GAME PAUSED"}</b>
            <span><kbd>Enter</kbd>{gameOver ? koreanUi ? "다시 시작" : "restart" : koreanUi ? "계속하기" : "resume"}</span>
          </div>
        )}
      </div>

      <form className="word-rain-console" onSubmit={submit}>
        <div className="game-scorebar">
          <span>{koreanUi ? "점수" : "SCORE"}<b>{score.toLocaleString()}</b></span>
          <span>{koreanUi ? "연속" : "COMBO"}<b>×{combo}</b></span>
          <span>{koreanUi ? "잡은 단어" : "CAUGHT"}<b>{caught}</b></span>
        </div>
        <div className="wave-progress"><span style={{ width: `${levelProgress}%` }} /><small>{koreanUi ? `다음 파도까지 ${CAUGHT_PER_LEVEL - caught % CAUGHT_PER_LEVEL}개` : `${CAUGHT_PER_LEVEL - caught % CAUGHT_PER_LEVEL} to next wave`}</small></div>
        <div>
          <p className="demo-label">WORD RAIN · WAVE {level}</p>
          <h3>{koreanUi ? "단어를 입력하고 Enter로 붙잡으세요." : "Type a word and catch it with Enter."}</h3>
          <p>{koreanUi ? "오타가 있어도 단어는 사라지지 않습니다. Esc로 멈추고 Enter로 이어갑니다." : "A typo never removes a word. Escape pauses; Enter resumes."}</p>
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
            disabled={paused || gameOver}
            onChange={(event) => {
              setInput(event.target.value);
              if (inputError) setInputError(false);
            }}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            onKeyDown={(event) => {
              if (soundEnabled && !event.repeat && (event.key.length === 1 || event.key === "Backspace")) onKeySound(event.code);
              if (event.key !== "Enter" || event.nativeEvent.isComposing || composingRef.current) return;
              event.preventDefault();
              submitWord();
            }}
            onBlur={() => {
              if (!paused && !gameOver) window.setTimeout(focusInput, 0);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="word-rain-message"
          />
          <button className="button button-primary" type="submit">{koreanUi ? "잡기" : "Catch"} <kbd>Enter</kbd></button>
        </div>
        <p className={`form-message ${inputError ? "error" : ""}`} id="word-rain-message" aria-live="polite">{message}</p>
        <div className="game-key-help"><span><kbd>Enter</kbd>{koreanUi ? "단어 적용" : "submit"}</span><span><kbd>Esc</kbd>{koreanUi ? "멈춤/계속" : "pause/resume"}</span></div>
      </form>
    </div>
  );
}
