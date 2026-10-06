"use client";

import "./game-visuals.css";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCrossword,
  cellKey,
  entryCells,
  makeCrosswordBoard,
  makeThemedCrosswordBoard,
  type CrosswordEntry,
  type CrosswordPuzzle,
  type Direction,
} from "./ProgressivePuzzles";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";
import { HangulInput } from "./HangulTypingField";
import { isImeKey } from "./browser-hangul-input";
import { shouldPlayTypingKeySound } from "./typing-key-audio";

type CrosswordStatus = "playing" | "incomplete" | "wrong" | "correct" | "solved";

type CrosswordGameProps = {
  koreanUi: boolean;
  locale: Locale;
  soundEnabled: boolean;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
  // Selected learning concept — boards use that concept's curated pool.
  themeId?: string;
};

function audioContextConstructor() {
  return window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

export function CrosswordGame({ locale, soundEnabled, onSuccessSound, onKeySound, themeId }: CrosswordGameProps) {
  // Build a board for the selected concept, falling back to the built-in pools.
  const buildBoard = useCallback((index: number): CrosswordPuzzle => (
    themeId ? makeThemedCrosswordBoard(index, themeId) : makeCrosswordBoard(index)
  ), [themeId]);

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  // Boards are generated on demand and kept, so play never runs out of puzzles.
  const [boards, setBoards] = useState<CrosswordPuzzle[]>(() => [buildBoard(0)]);
  const [activeEntryId, setActiveEntryId] = useState(() => boards[0].entries[0].id);
  const [entryDrafts, setEntryDrafts] = useState<Record<string, string>>({});
  const [solvedEntries, setSolvedEntries] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<CrosswordStatus>("playing");
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const gameRootRef = useRef<HTMLDivElement>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const puzzle = boards[puzzleIndex] ?? boards[0];
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
    // Never start audio while the page is hidden/closing — this prevents the
    // periodic pulse from resurrecting a closed AudioContext in the background.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
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

  // Rebuild from a fresh themed board when the learner switches concept.
  const themeMountRef = useRef(false);
  useEffect(() => {
    if (!themeMountRef.current) { themeMountRef.current = true; return; }
    const fresh = buildBoard(0);
    setBoards([fresh]);
    setPuzzleIndex(0);
    setActiveEntryId(fresh.entries[0].id);
    setEntryDrafts({});
    setSolvedEntries(new Set());
    setWrongCells(new Set());
    setStatus("playing");
    setSeconds(0);
    setHints(0);
    window.setTimeout(focusAnswer, 0);
  }, [themeId, buildBoard, focusAnswer]);

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

  useEffect(() => {
    if (status !== "solved") return;
    window.requestAnimationFrame(() => gameRootRef.current?.focus({ preventScroll: true }));
  }, [status]);

  useEffect(() => () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  // Hard audio teardown on page hide/close. React unmount cleanup is NOT
  // guaranteed to run when the tab/window is closed (browsers keep a
  // background process alive), so an open AudioContext + timers could keep
  // producing sound. pagehide/visibilitychange are the reliable signals.
  useEffect(() => {
    const teardown = () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") teardown();
    };
    window.addEventListener("pagehide", teardown);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", teardown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
    const nextIndex = puzzleIndex + 1;
    const next = boards[nextIndex] ?? buildBoard(nextIndex);
    setBoards((previous) => (nextIndex >= previous.length ? [...previous, next] : previous));
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
    ? tr(locale, "Puzzle clear! Press Enter to launch the next board.", "퍼즐 완성! Enter를 누르면 다음 판이 바로 시작됩니다.")
    : status === "correct"
      ? tr(locale, "Correct. Moving to the next clue.", "정답입니다. 다음 낱말로 이동합니다.")
      : status === "wrong"
        ? tr(locale, "Not quite. Your word stays—correct it and press Enter again.", "오답입니다. 입력한 단어는 남아 있어요. 고쳐서 다시 Enter!")
        : status === "incomplete"
          ? `${tr(locale, "Type all", "총")} ${Array.from(activeEntry.answer).length} ${tr(locale, "syllables, then press Enter.", "글자를 모두 입력한 뒤 Enter를 누르세요.")}`
          : tr(locale, "Type the whole answer to fill the grid automatically. Press Enter to check.", "정답 단어 전체를 입력하면 칸이 자동으로 채워집니다. Enter로 판정하세요.");

  return (
    <div
      className={`crossword-game-wrap ${status}`}
      ref={gameRootRef}
      tabIndex={-1}
      onKeyDownCapture={(event) => {
        if (isImeKey(event.nativeEvent)) return;
        if (status !== "solved" || event.key !== "Enter" || event.nativeEvent.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        nextPuzzle();
      }}
    >
      <div className="crossword-board-column">
        <div className="crossword-board-heading">
          <span>{`${tr(locale, "BOARD", "퍼즐")} ${puzzleIndex + 1}`}</span>
          <div><small>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</small><b>{completedWords}/{puzzle.entries.length}</b></div>
        </div>
        <div
          className="crossword-grid"
          role="grid"
          aria-label={`${tr(locale, puzzle.titleEn, puzzle.titleKo)} ${tr(locale, "Korean Crossword", "가로세로 퀴즈")}`}
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
                aria-label={`${tr(locale, "Crossword cell", "가로세로 칸")} ${row + 1}, ${col + 1}${value ? `: ${value}` : ""}`}
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
          {status === "solved" && <div className="crossword-complete-stamp" aria-hidden="true"><span>{tr(locale, "PUZZLE", "퍼즐")}</span><b>{tr(locale, "CLEAR!", "완료!")}</b></div>}
        </div>
        <div className="crossword-direction-legend">
          <span><i className="across-arrow" aria-hidden="true">→</i>{tr(locale, "Across", "가로")}</span>
          <span><i className="down-arrow" aria-hidden="true">↓</i>{tr(locale, "Down", "세로")}</span>
          <span>{tr(locale, "Solved", "완료")} <b>{completedWords}/{puzzle.entries.length}</b></span>
        </div>
      </div>

      <div className="demo-copy crossword-copy">
        <div className="puzzle-head"><p className="demo-label">{tr(locale, "CROSSWORD CIRCUIT · WHOLE-WORD MODE", "가로세로 퀴즈 · 낱말 입력 방식")}</p><b>{score} {tr(locale, "PTS", "점")}</b></div>
        <h3>{tr(locale, puzzle.titleEn, puzzle.titleKo)}</h3>
        <p className={`crossword-status ${status}`} aria-live="polite">{statusMessage}</p>

        <div className="active-clue-banner">
          <span>{board.numberByEntry.get(activeEntry.id)} {activeEntry.direction === "across" ? "→" : "↓"}</span>
          <div><small>{tr(locale, "ACTIVE CLUE", "현재 낱말")}</small><b>{tr(locale, activeEntry.clueEn, activeEntry.clueKo)}</b></div>
          <em>{Array.from(activeEntry.answer).length}{tr(locale, " letters", "글자")}</em>
        </div>

        <form className={`crossword-word-entry ${status}`} onSubmit={submit}>
          <label htmlFor="crossword-word-input">{tr(locale, "Type the whole answer", "정답 단어 전체 입력")}</label>
          <div>
            <HangulInput
              id="crossword-word-input"
              locale={locale}
              onScreenSubmit={checkActiveWord}
              ref={answerInputRef}
              lang="ko"
              value={activeDraft}
              disabled={status === "solved" || solvedEntries.has(activeEntry.id)}
              maxLength={Array.from(activeEntry.answer).length}
              onValueChange={updateActiveDraft}
              onKeyDownCapture={(event) => {
                if (soundEnabled && shouldPlayTypingKeySound(event)) onKeySound(event.code);
              }}
              onKeyDown={handleInputKeys}
              onBlur={(event) => {
                // Release focus when the user moves to another control; only
                // re-grab when focus was lost to nowhere (clicking empty space).
                if (event.relatedTarget) return;
                if (status !== "solved") window.setTimeout(focusAnswer, 0);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={tr(locale, "{n}-letter word", `${Array.from(activeEntry.answer).length}글자 단어`).replace("{n}", String(Array.from(activeEntry.answer).length))}
              aria-describedby="crossword-entry-progress"
            />
            <span id="crossword-entry-progress">{Array.from(activeDraft).length}/{Array.from(activeEntry.answer).length}</span>
            <button className="button button-primary" type="submit">{status === "solved" ? tr(locale, "Next", "다음 판") : tr(locale, "Check", "판정")} <kbd>Enter</kbd></button>
          </div>
          <div className="crossword-live-cells" aria-hidden="true">
            {Array.from(activeEntry.answer).map((_, index) => <i className={Array.from(activeDraft)[index] ? "filled" : ""} key={index} />)}
          </div>
        </form>

        <div className="crossword-clues">
          {(["across", "down"] as Direction[]).map((direction) => (
            <section key={direction}>
              <h4>{direction === "across" ? "→" : "↓"} {direction === "across" ? tr(locale, "Across word", "가로 낱말") : tr(locale, "Down word", "세로 낱말")}</h4>
              {puzzle.entries.filter((entry) => entry.direction === direction).map((entry) => {
                const solved = solvedEntries.has(entry.id);
                return (
                  <button type="button" className={`${activeEntry.id === entry.id ? "active" : ""} ${solved ? "solved" : ""}`} onClick={() => selectEntry(entry)} key={entry.id}>
                    <b>{solved ? "✓" : board.numberByEntry.get(entry.id)}</b>
                    <span>{tr(locale, entry.clueEn, entry.clueKo)}</span>
                    <small>{Array.from(entry.answer).length}</small>
                  </button>
                );
              })}
            </section>
          ))}
        </div>

        <div className="crossword-actions">
          <button className="crossword-clear" type="button" onClick={revealSyllable}>{tr(locale, "Reveal a syllable", "한 글자 힌트")} <kbd>Alt+H</kbd></button>
        </div>
        <div className="game-key-help crossword-key-help">
          <span><kbd>Enter</kbd>{tr(locale, "check word", "단어 판정")}</span>
          <span><kbd>Tab</kbd>{tr(locale, "next clue", "다음 낱말")}</span>
          <span><kbd>Alt+H</kbd>{tr(locale, "hint", "한 글자 힌트")}</span>
        </div>
        <div className="puzzle-progress" aria-label={tr(locale, "Puzzle progress", "퍼즐 완성도")}><span style={{ width: `${(correctCells / totalCells) * 100}%` }} /></div>
      </div>
    </div>
  );
}
