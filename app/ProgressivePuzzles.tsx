"use client";

import { useEffect, useRef, useState } from "react";

const missingPuzzles = [
  { before: "한", after: "", answer: "글", options: ["국", "글", "강"], meaningKo: "한국의 문자", meaningEn: "Korean writing system" },
  { before: "친", after: "", answer: "구", options: ["구", "고", "기"], meaningKo: "함께 어울리는 사람", meaningEn: "a friend" },
  { before: "여", after: "", answer: "행", options: ["항", "행", "향"], meaningKo: "다른 곳으로 떠나기", meaningEn: "travel" },
  { before: "음", after: "", answer: "악", options: ["억", "악", "옥"], meaningKo: "노래와 소리", meaningEn: "music" },
  { before: "사", after: "", answer: "랑", options: ["랑", "량", "낭"], meaningKo: "아끼는 마음", meaningEn: "love" },
  { before: "바", after: "", answer: "다", options: ["타", "다", "라"], meaningKo: "넓고 푸른 물", meaningEn: "sea" },
];

const crosswordPuzzles = [
  { answer: "글", clueKo: "가로: 한국의 문자 체계", clueEn: "Across: Korean writing system", preview: "한＿", grid: ["", "한", "", "말", "음", "국", "", "씀", "", "?", "", "", "노", "래", "", "집"] },
  { answer: "국", clueKo: "세로: 우리가 배우는 나라 이름", clueEn: "Down: the country we are studying", preview: "한＿", grid: ["한", "", "말", "", "?", "어", "씀", "", "", "노", "", "래", "집", "", "", ""] },
  { answer: "래", clueKo: "가로: 멜로디에 맞춰 부르는 것", clueEn: "Across: something sung to a melody", preview: "노＿", grid: ["", "말", "", "한", "음", "", "국", "", "노", "?", "", "", "", "집", "", "글"] },
  { answer: "집", clueKo: "세로: 맛있는 음식을 파는 곳", clueEn: "Down: a place known for good food", preview: "맛＿", grid: ["맛", "", "한", "", "?", "말", "국", "", "", "씀", "", "노", "글", "", "래", ""] },
];

export function MissingLetterGame({ koreanUi, soundEnabled, onSuccessSound }: {
  koreanUi: boolean; soundEnabled: boolean; onSuccessSound: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  const puzzle = missingPuzzles[index % missingPuzzles.length];

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  function choose(value: string) {
    if (locked) return;
    setAnswer(value);
    if (value !== puzzle.answer) return;
    setLocked(true);
    setScore((current) => current + 100);
    if (soundEnabled) onSuccessSound();
    timerRef.current = window.setTimeout(() => {
      setIndex((current) => (current + 1) % missingPuzzles.length);
      setAnswer("");
      setLocked(false);
    }, 850);
  }

  return (
    <div className="missing-demo progressive-puzzle">
      <div className="puzzle-head"><p className="demo-label">MISSING LETTER · {index + 1}/{missingPuzzles.length}</p><b>{score} PTS</b></div>
      <h3>{koreanUi ? puzzle.meaningKo : puzzle.meaningEn}</h3>
      <div className="missing-word" lang="ko">{puzzle.before}<span>{answer || "?"}</span>{puzzle.after}</div>
      <div className="answer-options" aria-label={koreanUi ? "빠진 글자 선택" : "Choose the missing syllable"}>
        {puzzle.options.map((option) => (
          <button type="button" disabled={locked} className={`${answer === option ? "chosen" : ""} ${locked && option === puzzle.answer ? "correct" : ""}`} onClick={() => choose(option)} key={option}>{option}</button>
        ))}
      </div>
      <p className={`form-message ${locked ? "success" : ""}`} aria-live="polite">
        {!answer ? (koreanUi ? "알맞은 한 글자를 고르세요." : "Choose the missing syllable.") : locked ? (koreanUi ? "정답! 다음 낱말로 이동합니다…" : "Correct! Loading the next word…") : (koreanUi ? "다시 생각해 보세요." : "Not quite. Try another one.")}
      </p>
      <div className="puzzle-progress"><span style={{ width: `${((index + (locked ? 1 : 0)) / missingPuzzles.length) * 100}%` }} /></div>
    </div>
  );
}

export function CrosswordGame({ koreanUi, soundEnabled, onSuccessSound }: {
  koreanUi: boolean; soundEnabled: boolean; onSuccessSound: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  const puzzle = crosswordPuzzles[index % crosswordPuzzles.length];

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  function typeAnswer(value: string) {
    if (locked) return;
    const next = Array.from(value).slice(-1)[0] ?? "";
    setAnswer(next);
    if (next !== puzzle.answer) return;
    setLocked(true);
    setScore((current) => current + 150);
    if (soundEnabled) onSuccessSound();
    timerRef.current = window.setTimeout(() => {
      setIndex((current) => (current + 1) % crosswordPuzzles.length);
      setAnswer("");
      setLocked(false);
    }, 900);
  }

  return (
    <div className="crossword-game-wrap">
      <div className="crossword-grid" role="grid" aria-label={koreanUi ? "한국어 미니 가로세로 퀴즈" : "Mini Korean crossword"}>
        {puzzle.grid.map((cell, cellIndex) => cell === "?" ? (
          <input key={`${index}-${cellIndex}`} lang="ko" maxLength={2} value={answer} disabled={locked} onChange={(event) => typeAnswer(event.target.value)} aria-label={koreanUi ? "정답 한 글자" : "One-syllable crossword answer"} autoFocus />
        ) : <span className={cell ? "" : "blank"} lang="ko" key={`${index}-${cellIndex}`}>{cell}</span>)}
      </div>
      <div className="demo-copy crossword-copy">
        <div className="puzzle-head"><p className="demo-label">DAILY CROSSWORD · {index + 1}/{crosswordPuzzles.length}</p><b>{score} PTS</b></div>
        <h3>{koreanUi ? puzzle.clueKo : puzzle.clueEn}</h3>
        <p>{koreanUi ? `한 글자를 입력해 ${puzzle.preview}을(를) 완성하세요.` : `Type one syllable to finish ${puzzle.preview}.`}</p>
        <p className={`form-message ${locked ? "success" : ""}`} aria-live="polite">
          {!answer ? (koreanUi ? "빈 칸에 정답을 입력하세요." : "Fill the highlighted square.") : locked ? (koreanUi ? "정답! 다음 문제로 이동합니다…" : "Solved! Loading the next clue…") : (koreanUi ? "교차하는 낱말을 다시 확인하세요." : "Check the crossing word and try again.")}
        </p>
        <div className="puzzle-progress"><span style={{ width: `${((index + (locked ? 1 : 0)) / crosswordPuzzles.length) * 100}%` }} /></div>
      </div>
    </div>
  );
}
