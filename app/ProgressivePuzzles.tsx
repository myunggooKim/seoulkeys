"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const missingPuzzles = [
  { before: "한", after: "", answer: "글", options: ["국", "글", "강"], meaningKo: "한국의 문자", meaningEn: "Korean writing system" },
  { before: "친", after: "", answer: "구", options: ["구", "고", "기"], meaningKo: "함께 어울리는 사람", meaningEn: "a friend" },
  { before: "여", after: "", answer: "행", options: ["항", "행", "향"], meaningKo: "다른 곳으로 떠나기", meaningEn: "travel" },
  { before: "음", after: "", answer: "악", options: ["억", "악", "옥"], meaningKo: "노래와 소리", meaningEn: "music" },
  { before: "사", after: "", answer: "랑", options: ["랑", "량", "낭"], meaningKo: "아끼는 마음", meaningEn: "love" },
  { before: "바", after: "", answer: "다", options: ["타", "다", "라"], meaningKo: "넓고 푸른 물", meaningEn: "sea" },
];

type Direction = "across" | "down";

type CrosswordEntry = {
  id: string;
  direction: Direction;
  row: number;
  col: number;
  answer: string;
  clueKo: string;
  clueEn: string;
};

type CrosswordPuzzle = {
  id: string;
  size: number;
  titleKo: string;
  titleEn: string;
  entries: CrosswordEntry[];
};

const crosswordPuzzles: CrosswordPuzzle[] = [
  {
    id: "first-korean",
    size: 4,
    titleKo: "처음 만나는 한국어",
    titleEn: "First Korean words",
    entries: [
      { id: "a-hangeul", direction: "across", row: 0, col: 2, answer: "한글", clueKo: "한국어를 적는 문자", clueEn: "The writing system used for Korean" },
      { id: "d-korea", direction: "down", row: 0, col: 2, answer: "한국", clueKo: "서울이 수도인 나라", clueEn: "The country whose capital is Seoul" },
      { id: "d-writing", direction: "down", row: 0, col: 3, answer: "글씨", clueKo: "손이나 키보드로 적은 문자 모양", clueEn: "Written letters or handwriting" },
      { id: "a-foreign", direction: "across", row: 1, col: 1, answer: "외국", clueKo: "자기 나라가 아닌 다른 나라", clueEn: "A country other than your own" },
      { id: "d-foreigner", direction: "down", row: 1, col: 1, answer: "외국인", clueKo: "다른 나라에서 온 사람", clueEn: "A person from another country" },
    ],
  },
  {
    id: "travel-day",
    size: 4,
    titleKo: "한국 여행의 하루",
    titleEn: "A day of Korean travel",
    entries: [
      { id: "a-passport", direction: "across", row: 0, col: 2, answer: "여권", clueKo: "다른 나라에 갈 때 필요한 신분증", clueEn: "Identification needed for international travel" },
      { id: "d-travel", direction: "down", row: 0, col: 2, answer: "여행", clueKo: "다른 곳으로 떠나는 일", clueEn: "Going somewhere away from home" },
      { id: "d-right", direction: "down", row: 0, col: 3, answer: "권리", clueKo: "사람이 마땅히 누릴 수 있는 것", clueEn: "Something a person is entitled to" },
      { id: "a-bank", direction: "across", row: 1, col: 1, answer: "은행", clueKo: "돈을 맡기거나 바꾸는 곳", clueEn: "A place to keep or exchange money" },
      { id: "d-galaxy", direction: "down", row: 1, col: 1, answer: "은하", clueKo: "수많은 별이 모인 커다란 무리", clueEn: "A vast group of stars" },
    ],
  },
  {
    id: "food-table",
    size: 4,
    titleKo: "맛있는 한국 식탁",
    titleEn: "A Korean table",
    entries: [
      { id: "a-korean-food", direction: "across", row: 0, col: 2, answer: "한식", clueKo: "한국의 전통 음식", clueEn: "Traditional Korean food" },
      { id: "d-korea", direction: "down", row: 0, col: 2, answer: "한국", clueKo: "한식을 즐겨 먹는 나라", clueEn: "The home country of Korean food" },
      { id: "d-meal", direction: "down", row: 0, col: 3, answer: "식사", clueKo: "끼니로 음식을 먹는 일", clueEn: "The act of eating a meal" },
      { id: "a-usa", direction: "across", row: 1, col: 1, answer: "미국", clueKo: "워싱턴 D.C.가 수도인 나라", clueEn: "The country whose capital is Washington, D.C." },
      { id: "d-seaweed", direction: "down", row: 1, col: 1, answer: "미역", clueKo: "생일국에 넣는 바다 채소", clueEn: "Seaweed commonly used in Korean birthday soup" },
    ],
  },
];

function cellKey(row: number, col: number) {
  return `${row}-${col}`;
}

function entryCells(entry: CrosswordEntry) {
  return Array.from(entry.answer).map((solution, index) => ({
    row: entry.row + (entry.direction === "down" ? index : 0),
    col: entry.col + (entry.direction === "across" ? index : 0),
    solution,
  }));
}

function buildCrossword(puzzle: CrosswordPuzzle) {
  const cells = new Map<string, { solution: string; entryIds: string[] }>();
  for (const entry of puzzle.entries) {
    for (const position of entryCells(entry)) {
      const key = cellKey(position.row, position.col);
      const current = cells.get(key);
      if (current && current.solution !== position.solution) {
        throw new Error(`Invalid crossword intersection at ${key}`);
      }
      cells.set(key, {
        solution: position.solution,
        entryIds: current ? [...current.entryIds, entry.id] : [entry.id],
      });
    }
  }

  const startKeys = [...new Set(puzzle.entries.map((entry) => cellKey(entry.row, entry.col)))].sort((a, b) => {
    const [aRow, aCol] = a.split("-").map(Number);
    const [bRow, bCol] = b.split("-").map(Number);
    return aRow - bRow || aCol - bCol;
  });
  const numberByStart = new Map(startKeys.map((key, index) => [key, index + 1]));
  const numberByEntry = new Map(puzzle.entries.map((entry) => [entry.id, numberByStart.get(cellKey(entry.row, entry.col)) ?? 0]));

  return { cells, numberByStart, numberByEntry };
}

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
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeEntryId, setActiveEntryId] = useState(crosswordPuzzles[0].entries[0].id);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"playing" | "incomplete" | "wrong" | "solved">("playing");
  const [score, setScore] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const puzzle = crosswordPuzzles[puzzleIndex % crosswordPuzzles.length];
  const board = useMemo(() => buildCrossword(puzzle), [puzzle]);
  const activeEntry = puzzle.entries.find((entry) => entry.id === activeEntryId) ?? puzzle.entries[0];
  const activeCellKeys = new Set(entryCells(activeEntry).map(({ row, col }) => cellKey(row, col)));
  const totalCells = board.cells.size;
  const correctCells = [...board.cells].filter(([key, cell]) => answers[key] === cell.solution).length;

  function focusCell(key: string) {
    window.setTimeout(() => inputRefs.current[key]?.focus(), 0);
  }

  function activateCell(key: string, cycleDirection = false) {
    const cell = board.cells.get(key);
    if (!cell) return;
    setSelectedCell(key);
    if (!cell.entryIds.includes(activeEntryId)) {
      setActiveEntryId(cell.entryIds[0]);
    } else if (cycleDirection && cell.entryIds.length > 1) {
      const currentIndex = cell.entryIds.indexOf(activeEntryId);
      setActiveEntryId(cell.entryIds[(currentIndex + 1) % cell.entryIds.length]);
    }
  }

  function moveInEntry(fromKey: string, step: number) {
    const keys = entryCells(activeEntry).map(({ row, col }) => cellKey(row, col));
    const currentIndex = keys.indexOf(fromKey);
    const nextKey = keys[Math.max(0, Math.min(keys.length - 1, currentIndex + step))];
    if (nextKey) {
      setSelectedCell(nextKey);
      focusCell(nextKey);
    }
  }

  function moveGeometrically(fromKey: string, rowDelta: number, colDelta: number) {
    const [row, col] = fromKey.split("-").map(Number);
    let nextRow = row + rowDelta;
    let nextCol = col + colDelta;
    while (nextRow >= 0 && nextRow < puzzle.size && nextCol >= 0 && nextCol < puzzle.size) {
      const nextKey = cellKey(nextRow, nextCol);
      if (board.cells.has(nextKey)) {
        setSelectedCell(nextKey);
        activateCell(nextKey);
        focusCell(nextKey);
        return;
      }
      nextRow += rowDelta;
      nextCol += colDelta;
    }
  }

  function updateCell(key: string, rawValue: string, shouldAdvance: boolean) {
    if (status === "solved") return;
    const value = Array.from(rawValue).slice(-1)[0] ?? "";
    setAnswers((current) => ({ ...current, [key]: value }));
    setWrongCells((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    setStatus("playing");
    if (value && shouldAdvance) moveInEntry(key, 1);
  }

  function checkPuzzle() {
    if (status === "solved") return;
    const emptyKey = [...board.cells.keys()].find((key) => !answers[key]);
    if (emptyKey) {
      setStatus("incomplete");
      setSelectedCell(emptyKey);
      focusCell(emptyKey);
      return;
    }
    const mistakes = new Set([...board.cells].filter(([key, cell]) => answers[key] !== cell.solution).map(([key]) => key));
    setWrongCells(mistakes);
    if (mistakes.size) {
      setStatus("wrong");
      const firstMistake = [...mistakes][0];
      setSelectedCell(firstMistake);
      focusCell(firstMistake);
      return;
    }
    setStatus("solved");
    setScore((current) => current + 500);
    if (soundEnabled) onSuccessSound();
  }

  function nextPuzzle() {
    const nextIndex = (puzzleIndex + 1) % crosswordPuzzles.length;
    const next = crosswordPuzzles[nextIndex];
    const first = entryCells(next.entries[0])[0];
    const firstKey = cellKey(first.row, first.col);
    setPuzzleIndex(nextIndex);
    setAnswers({});
    setActiveEntryId(next.entries[0].id);
    setSelectedCell(firstKey);
    setWrongCells(new Set());
    setStatus("playing");
    focusCell(firstKey);
  }

  function clearPuzzle() {
    setAnswers({});
    setWrongCells(new Set());
    setStatus("playing");
    const first = entryCells(puzzle.entries[0])[0];
    const key = cellKey(first.row, first.col);
    setSelectedCell(key);
    setActiveEntryId(puzzle.entries[0].id);
    focusCell(key);
  }

  const statusMessage = status === "solved"
    ? koreanUi ? "모든 낱말이 맞았습니다! 다음 판을 시작해 보세요." : "Every word is correct! Start the next board."
    : status === "wrong"
      ? koreanUi ? "빨간 칸은 그대로 남아 있습니다. 단서를 다시 보고 고쳐 보세요." : "Red cells stay in place. Recheck the clues and correct them."
      : status === "incomplete"
        ? koreanUi ? "아직 빈칸이 있습니다. 선택된 칸부터 이어서 입력하세요." : "Some cells are still empty. Continue from the selected cell."
        : koreanUi ? "단서를 선택하고 한 칸에 한 음절씩 입력하세요." : "Choose a clue and type one Korean syllable per cell.";

  return (
    <div className={`crossword-game-wrap ${status}`}>
      <div className="crossword-board-column">
        <div className="crossword-board-heading">
          <span>{koreanUi ? `퍼즐 ${puzzleIndex + 1}/${crosswordPuzzles.length}` : `BOARD ${puzzleIndex + 1}/${crosswordPuzzles.length}`}</span>
          <b>{correctCells}/{totalCells}</b>
        </div>
        <div
          className="crossword-grid"
          role="grid"
          aria-label={koreanUi ? `${puzzle.titleKo} 가로세로 퀴즈` : `${puzzle.titleEn} crossword`}
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}
        >
          {Array.from({ length: puzzle.size * puzzle.size }, (_, index) => {
            const row = Math.floor(index / puzzle.size);
            const col = index % puzzle.size;
            const key = cellKey(row, col);
            const cell = board.cells.get(key);
            if (!cell) return <span className="crossword-block" aria-hidden="true" key={key} />;
            const number = board.numberByStart.get(key);
            const isActive = activeCellKeys.has(key);
            return (
              <label
                className={`crossword-cell ${isActive ? "active-word" : ""} ${selectedCell === key ? "selected" : ""} ${wrongCells.has(key) ? "wrong" : ""} ${status === "solved" ? "correct" : ""}`}
                role="gridcell"
                key={key}
              >
                {number && <small>{number}</small>}
                <input
                  ref={(node) => { inputRefs.current[key] = node; }}
                  lang="ko"
                  inputMode="text"
                  value={answers[key] ?? ""}
                  disabled={status === "solved"}
                  aria-label={`${koreanUi ? "가로세로 칸" : "Crossword cell"} ${row + 1}, ${col + 1}`}
                  onFocus={() => activateCell(key)}
                  onClick={() => activateCell(key, selectedCell === key)}
                  onChange={(event) => updateCell(key, event.target.value, !event.nativeEvent.isComposing)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      checkPuzzle();
                    } else if (event.key === "Backspace" && !answers[key]) {
                      event.preventDefault();
                      moveInEntry(key, -1);
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveGeometrically(key, 0, -1);
                    } else if (event.key === "ArrowRight") {
                      event.preventDefault();
                      moveGeometrically(key, 0, 1);
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveGeometrically(key, -1, 0);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveGeometrically(key, 1, 0);
                    }
                  }}
                />
              </label>
            );
          })}
        </div>
        <div className="crossword-direction-legend">
          <span><i className="across-arrow" aria-hidden="true">→</i>{koreanUi ? "가로" : "Across"}</span>
          <span><i className="down-arrow" aria-hidden="true">↓</i>{koreanUi ? "세로" : "Down"}</span>
        </div>
      </div>

      <div className="demo-copy crossword-copy">
        <div className="puzzle-head"><p className="demo-label">REAL CROSSWORD · {puzzleIndex + 1}/{crosswordPuzzles.length}</p><b>{score} PTS</b></div>
        <h3>{koreanUi ? puzzle.titleKo : puzzle.titleEn}</h3>
        <p className={`crossword-status ${status}`} aria-live="polite">{statusMessage}</p>

        <div className="crossword-clues">
          {(["across", "down"] as Direction[]).map((direction) => (
            <section key={direction}>
              <h4>{direction === "across" ? "→" : "↓"} {koreanUi ? direction === "across" ? "가로 열쇠" : "세로 열쇠" : direction === "across" ? "Across" : "Down"}</h4>
              {puzzle.entries.filter((entry) => entry.direction === direction).map((entry) => (
                <button
                  type="button"
                  className={activeEntry.id === entry.id ? "active" : ""}
                  onClick={() => {
                    setActiveEntryId(entry.id);
                    const firstEmpty = entryCells(entry).find(({ row, col }) => !answers[cellKey(row, col)]) ?? entryCells(entry)[0];
                    const key = cellKey(firstEmpty.row, firstEmpty.col);
                    setSelectedCell(key);
                    focusCell(key);
                  }}
                  key={entry.id}
                >
                  <b>{board.numberByEntry.get(entry.id)}</b>
                  <span>{koreanUi ? entry.clueKo : entry.clueEn}</span>
                  <small>{Array.from(entry.answer).length}{koreanUi ? "칸" : " cells"}</small>
                </button>
              ))}
            </section>
          ))}
        </div>

        <div className="crossword-actions">
          {status === "solved" ? (
            <button className="button button-primary" type="button" onClick={nextPuzzle}>{koreanUi ? "다음 퍼즐 →" : "Next board →"}</button>
          ) : (
            <button className="button button-primary" type="button" onClick={checkPuzzle}>{koreanUi ? "정답 확인 ↵" : "Check board ↵"}</button>
          )}
          <button className="crossword-clear" type="button" onClick={clearPuzzle}>{koreanUi ? "전체 지우기" : "Clear"}</button>
        </div>
        <div className="puzzle-progress" aria-label={koreanUi ? "퍼즐 완성도" : "Puzzle progress"}><span style={{ width: `${(correctCells / totalCells) * 100}%` }} /></div>
      </div>
    </div>
  );
}
