"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCrossword,
  cellKey,
  crosswordPuzzles,
  entryCells,
  type CrosswordEntry,
  type Direction,
} from "./ProgressivePuzzles";

type CrosswordStatus = "playing" | "incomplete" | "wrong" | "correct" | "solved";

type CrosswordGameProps = {
  koreanUi: boolean;
  soundEnabled: boolean;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
};

function audioContextConstructor() {
  return window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

export function CrosswordGame({ koreanUi, soundEnabled, onSuccessSound, onKeySound }: CrosswordGameProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState(crosswordPuzzles[0].entries[0].id);
  const [entryDrafts, setEntryDrafts] = useState<Record<string, string>>({});
  const [solvedEntries, setSolvedEntries] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<CrosswordStatus>("playing");
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const puzzle = crosswordPuzzles[puzzleIndex % crosswordPuzzles.length];
  const board = useMemo(() => buildCrossword(puzzle), [puzzle]);
  const activeEntry = puzzle.entries.find((entry) => entry.id === activeEntryId) ?? puzzle.entries[0];
  const activeCells = entryCells(activeEntry);
  const activeCellKeys = new Set(activeCells.map(({ row, col }) => cellKey(row, col)));
  const activeDraft = entryDrafts[activeEntry.id] ?? "";

  const displayedAnswers = new Map<string, string>();
  for (const entry of puzzle.entries) {
    const draft = entryDrafts[entry.id] ?? "";
    entryCells(entry).forEach(({ row, col }, index) => {
      const character = Array.from(draft)[index];
      if (character) displayedAnswers.set(cellKey(row, col), character);
    });
  }
  entryCells(activeEntry).forEach(({ row, col }, index) => {
    const character = Array.from(activeDraft)[index];
    if (character) displayedAnswers.set(cellKey(row, col), character);
  });
  for (const entry of puzzle.entries) {
    if (!solvedEntries.has(entry.id)) continue;
    entryCells(entry).forEach(({ row, col, solution }) => displayedAnswers.set(cellKey(row, col), solution));
  }

  const correctCells = [...board.cells].filter(([key, cell]) => displayedAnswers.get(key) === cell.solution).length;
  const totalCells = board.cells.size;
  const completedWords = solvedEntries.size;

  const focusAnswer = useCallback(() => {
    window.requestAnimationFrame(() => answerInputRef.current?.focus({ preventScroll: true }));
  }, []);

  const playCircuitCue = useCallback((kind: "confirm" | "error" | "pulse") => {
    if (!soundEnabled) return;
    const AudioContextConstructor = audioContextConstructor();
    if (!AudioContextConstructor) return;
    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime + 0.01;
    const frequencies = kind === "confirm" ? [440, 660, 880] : kind === "error" ? [180, 138] : [330];
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const panner = typeof context.createStereoPanner === "function" ? context.createStereoPanner() : null;
      oscillator.type = kind === "pulse" ? "triangle" : "square";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.055);
      gain.gain.setValueAtTime(0.001, now + index * 0.055);
      gain.gain.linearRampToValueAtTime(kind === "pulse" ? 0.018 : 0.045, now + index * 0.055 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.055 + 0.12);
      oscillator.connect(gain);
      if (panner) {
        panner.pan.value = index % 2 ? 0.34 : -0.34;
        gain.connect(panner).connect(context.destination);
      } else {
        gain.connect(context.destination);
      }
      oscillator.start(now + index * 0.055);
      oscillator.stop(now + index * 0.055 + 0.14);
    });
  }, [soundEnabled]);

  useEffect(() => {
    focusAnswer();
  }, [focusAnswer, puzzleIndex]);

  useEffect(() => {
    if (status === "solved" || solvedEntries.has(activeEntryId)) return;
    focusAnswer();
  }, [activeEntryId, focusAnswer, solvedEntries, status]);

  useEffect(() => {
    if (status === "solved") return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (seconds > 0 && seconds % 6 === 0 && status === "playing") playCircuitCue("pulse");
  }, [playCircuitCue, seconds, status]);

  useEffect(() => () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  function normalizeDraft(value: string) {
    return Array.from(value.replace(/\s/g, "")).slice(0, Array.from(activeEntry.answer).length).join("");
  }

  function selectEntry(entry: CrosswordEntry) {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setActiveEntryId(entry.id);
    setWrongCells(new Set());
    setStatus(solvedEntries.has(entry.id) ? "correct" : "playing");
    focusAnswer();
  }

  function nextEntry(step: number, solved = solvedEntries) {
    const currentIndex = puzzle.entries.findIndex((entry) => entry.id === activeEntry.id);
    for (let offset = 1; offset <= puzzle.entries.length; offset += 1) {
      const index = (currentIndex + step * offset + puzzle.entries.length * 2) % puzzle.entries.length;
      const next = puzzle.entries[index];
      if (!solved.has(next.id)) {
        selectEntry(next);
        return;
      }
    }
  }

  function updateActiveDraft(value: string) {
    const next = normalizeDraft(value);
    setEntryDrafts((current) => ({ ...current, [activeEntry.id]: next }));
    setWrongCells(new Set());
    setStatus("playing");
  }

  function checkActiveWord() {
    if (status === "solved") {
      nextPuzzle();
      return;
    }
    if (solvedEntries.has(activeEntry.id)) {
      nextEntry(1);
      return;
    }

    const typed = activeDraft.trim();
    const expected = activeEntry.answer;
    if (Array.from(typed).length !== Array.from(expected).length) {
      setStatus("incomplete");
      playCircuitCue("error");
      focusAnswer();
      return;
    }

    if (typed !== expected) {
      const mistakes = new Set<string>();
      activeCells.forEach(({ row, col, solution }, index) => {
        if (Array.from(typed)[index] !== solution) mistakes.add(cellKey(row, col));
      });
      setWrongCells(mistakes);
      setStatus("wrong");
      playCircuitCue("error");
      focusAnswer();
      return;
    }

    const nextSolved = new Set(solvedEntries);
    nextSolved.add(activeEntry.id);
    const boardSolved = nextSolved.size === puzzle.entries.length;
    setSolvedEntries(nextSolved);
    setWrongCells(new Set());
    setScore((current) => current + Math.max(120, 360 - seconds - hints * 25));
    setStatus(boardSolved ? "solved" : "correct");
    playCircuitCue("confirm");
    if (soundEnabled) onSuccessSound();
    if (boardSolved) return;
    advanceTimerRef.current = window.setTimeout(() => nextEntry(1, nextSolved), 520);
  }

  function revealSyllable() {
    if (status === "solved" || solvedEntries.has(activeEntry.id)) return;
    const expected = Array.from(activeEntry.answer);
    const current = Array.from(activeDraft);
    const mismatchIndex = expected.findIndex((character, index) => current[index] !== character);
    if (mismatchIndex < 0) return;
    const next = expected.map((character, index) => index <= mismatchIndex ? character : current[index] ?? "").join("");
    setEntryDrafts((drafts) => ({ ...drafts, [activeEntry.id]: next }));
    setWrongCells(new Set());
    setStatus("playing");
    setHints((value) => value + 1);
    setScore((value) => Math.max(0, value - 50));
    focusAnswer();
  }

  function nextPuzzle() {
    const nextIndex = (puzzleIndex + 1) % crosswordPuzzles.length;
    const next = crosswordPuzzles[nextIndex];
    setPuzzleIndex(nextIndex);
    setActiveEntryId(next.entries[0].id);
    setEntryDrafts({});
    setSolvedEntries(new Set());
    setWrongCells(new Set());
    setStatus("playing");
    setSeconds(0);
    setHints(0);
    window.setTimeout(focusAnswer, 0);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    checkActiveWord();
  }

  function handleInputKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (soundEnabled && !event.repeat && (event.key.length === 1 || event.key === "Backspace")) onKeySound(event.code);
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      checkActiveWord();
    } else if (event.key === "Tab") {
      event.preventDefault();
      nextEntry(event.shiftKey ? -1 : 1);
    } else if (event.altKey && event.key.toLowerCase() === "h") {
      event.preventDefault();
      revealSyllable();
    }
  }

  const statusMessage = status === "solved"
    ? koreanUi ? "퍼즐 완성! Enter를 누르면 다음 판이 바로 시작됩니다." : "Puzzle clear! Press Enter to launch the next board."
    : status === "correct"
      ? koreanUi ? "정답입니다. 다음 낱말로 이동합니다." : "Correct. Moving to the next clue."
      : status === "wrong"
        ? koreanUi ? "오답입니다. 입력한 단어는 남아 있어요. 고쳐서 다시 Enter!" : "Not quite. Your word stays—correct it and press Enter again."
        : status === "incomplete"
          ? koreanUi ? `총 ${Array.from(activeEntry.answer).length}글자를 모두 입력한 뒤 Enter를 누르세요.` : `Type all ${Array.from(activeEntry.answer).length} syllables, then press Enter.`
          : koreanUi ? "정답 단어 전체를 입력하면 칸이 자동으로 채워집니다. Enter로 판정하세요." : "Type the whole answer to fill the grid automatically. Press Enter to check.";

  return (
    <div className={`crossword-game-wrap ${status}`}>
      <div className="crossword-board-column">
        <div className="crossword-board-heading">
          <span>{koreanUi ? `퍼즐 ${puzzleIndex + 1}/${crosswordPuzzles.length}` : `BOARD ${puzzleIndex + 1}/${crosswordPuzzles.length}`}</span>
          <div><small>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</small><b>{completedWords}/{puzzle.entries.length}</b></div>
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
            const value = displayedAnswers.get(key) ?? "";
            const cellSolved = cell.entryIds.some((entryId) => solvedEntries.has(entryId));
            return (
              <button
                type="button"
                tabIndex={-1}
                className={`crossword-cell ${activeCellKeys.has(key) ? "active-word" : ""} ${wrongCells.has(key) ? "wrong" : ""} ${cellSolved ? "correct" : ""} ${value ? "filled" : ""}`}
                role="gridcell"
                aria-label={`${koreanUi ? "가로세로 칸" : "Crossword cell"} ${row + 1}, ${col + 1}${value ? `: ${value}` : ""}`}
                onClick={() => {
                  const entryId = cell.entryIds.find((id) => !solvedEntries.has(id)) ?? cell.entryIds[0];
                  const entry = puzzle.entries.find((item) => item.id === entryId);
                  if (entry) selectEntry(entry);
                }}
                key={key}
              >
                {number && <small>{number}</small>}
                <strong lang="ko">{value}</strong>
              </button>
            );
          })}
          {status === "solved" && <div className="crossword-complete-stamp" aria-hidden="true"><span>PUZZLE</span><b>CLEAR!</b></div>}
        </div>
        <div className="crossword-direction-legend">
          <span><i className="across-arrow" aria-hidden="true">→</i>{koreanUi ? "가로" : "Across"}</span>
          <span><i className="down-arrow" aria-hidden="true">↓</i>{koreanUi ? "세로" : "Down"}</span>
          <span>{koreanUi ? "완료" : "Solved"} <b>{completedWords}/{puzzle.entries.length}</b></span>
        </div>
      </div>

      <div className="demo-copy crossword-copy">
        <div className="puzzle-head"><p className="demo-label">CROSSWORD CIRCUIT · WHOLE-WORD MODE</p><b>{score} PTS</b></div>
        <h3>{koreanUi ? puzzle.titleKo : puzzle.titleEn}</h3>
        <p className={`crossword-status ${status}`} aria-live="polite">{statusMessage}</p>

        <div className="active-clue-banner">
          <span>{board.numberByEntry.get(activeEntry.id)} {activeEntry.direction === "across" ? "→" : "↓"}</span>
          <div><small>{koreanUi ? "현재 낱말" : "ACTIVE CLUE"}</small><b>{koreanUi ? activeEntry.clueKo : activeEntry.clueEn}</b></div>
          <em>{Array.from(activeEntry.answer).length}{koreanUi ? "글자" : " letters"}</em>
        </div>

        <form className={`crossword-word-entry ${status}`} onSubmit={submit}>
          <label htmlFor="crossword-word-input">{koreanUi ? "정답 단어 전체 입력" : "Type the whole answer"}</label>
          <div>
            <input
              id="crossword-word-input"
              ref={answerInputRef}
              lang="ko"
              value={activeDraft}
              disabled={status === "solved" || solvedEntries.has(activeEntry.id)}
              maxLength={Array.from(activeEntry.answer).length}
              onChange={(event) => updateActiveDraft(event.target.value)}
              onKeyDown={handleInputKeys}
              onBlur={() => {
                if (status !== "solved") window.setTimeout(focusAnswer, 0);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={koreanUi ? `${Array.from(activeEntry.answer).length}글자 단어` : `${Array.from(activeEntry.answer).length}-letter word`}
              aria-describedby="crossword-entry-progress"
            />
            <span id="crossword-entry-progress">{Array.from(activeDraft).length}/{Array.from(activeEntry.answer).length}</span>
            <button className="button button-primary" type="submit">{status === "solved" ? koreanUi ? "다음 판" : "Next" : koreanUi ? "판정" : "Check"} <kbd>Enter</kbd></button>
          </div>
          <div className="crossword-live-cells" aria-hidden="true">
            {Array.from(activeEntry.answer).map((_, index) => <i className={Array.from(activeDraft)[index] ? "filled" : ""} key={index} />)}
          </div>
        </form>

        <div className="crossword-clues">
          {(["across", "down"] as Direction[]).map((direction) => (
            <section key={direction}>
              <h4>{direction === "across" ? "→" : "↓"} {koreanUi ? direction === "across" ? "가로 낱말" : "세로 낱말" : direction === "across" ? "Across" : "Down"}</h4>
              {puzzle.entries.filter((entry) => entry.direction === direction).map((entry) => {
                const solved = solvedEntries.has(entry.id);
                return (
                  <button type="button" className={`${activeEntry.id === entry.id ? "active" : ""} ${solved ? "solved" : ""}`} onClick={() => selectEntry(entry)} key={entry.id}>
                    <b>{solved ? "✓" : board.numberByEntry.get(entry.id)}</b>
                    <span>{koreanUi ? entry.clueKo : entry.clueEn}</span>
                    <small>{Array.from(entry.answer).length}</small>
                  </button>
                );
              })}
            </section>
          ))}
        </div>

        <div className="crossword-actions">
          <button className="crossword-clear" type="button" onClick={revealSyllable}>{koreanUi ? "한 글자 힌트" : "Reveal a syllable"} <kbd>Alt+H</kbd></button>
        </div>
        <div className="game-key-help crossword-key-help">
          <span><kbd>Enter</kbd>{koreanUi ? "단어 판정" : "check word"}</span>
          <span><kbd>Tab</kbd>{koreanUi ? "다음 낱말" : "next clue"}</span>
          <span><kbd>Alt+H</kbd>{koreanUi ? "한 글자 힌트" : "hint"}</span>
        </div>
        <div className="puzzle-progress" aria-label={koreanUi ? "퍼즐 완성도" : "Puzzle progress"}><span style={{ width: `${(correctCells / totalCells) * 100}%` }} /></div>
      </div>
    </div>
  );
}
