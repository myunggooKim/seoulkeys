"use client";

import "./game-visuals.css";
import "./crossword-3d.css";
import "./crossword-white.css";
import { makeGardenBoard, gardenSeasons, readGardenProgress, type GardenProgress } from "./crossword-garden";
import { CROSSWORD_CATALOG_VERSION, createGardenDeck, drawGardenBoard, gardenCatalogBoard, gardenThemeKey, type GardenDeck } from "./crossword-catalog";
import { gardenCheckpointKey, readGardenCheckpoint, type GardenCheckpoint } from "./crossword-checkpoint";
import { CrosswordDiorama } from "./CrosswordDiorama";
import { crosswordChapter, crosswordStars, crosswordWordReward } from "./crossword-session";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  buildCrossword,
  cellKey,
  entryCells,
  type CrosswordEntry,
  type CrosswordPuzzle,
  type Direction,
} from "./ProgressivePuzzles";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";
import { clueMeaning } from "../locale-meanings";
import { HangulInput } from "./HangulTypingField";
import { isImeKey } from "./browser-hangul-input";
import { shouldPlayTypingKeySound } from "./typing-key-audio";

type CrosswordStatus = "playing" | "incomplete" | "wrong" | "correct" | "solved";

type CrosswordGameProps = {
  koreanUi: boolean;
  locale: Locale;
  clueLocale?: Locale;
  soundEnabled: boolean;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
  // Selected learning concept — boards use that concept's curated pool.
  themeId?: string;
  suspended?: boolean;
};

function audioContextConstructor() {
  return window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

export function CrosswordGame({ locale, clueLocale = locale, soundEnabled, onSuccessSound, onKeySound, themeId, suspended = false }: CrosswordGameProps) {
  // Build a board for the selected concept, falling back to the built-in pools.
  const buildBoard = useCallback((index: number): CrosswordPuzzle => (
    makeGardenBoard(index, themeId)
  ), [themeId]);

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  // Only the current board is retained; the learned-word collection spans boards.
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(() => buildBoard(0));
  const [activeEntryId, setActiveEntryId] = useState(() => puzzle.entries[0].id);
  const [entryDrafts, setEntryDrafts] = useState<Record<string, string>>({});
  const [solvedEntries, setSolvedEntries] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<CrosswordStatus>("playing");
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [assistedEntries, setAssistedEntries] = useState<Set<string>>(new Set());
  const [revealedEntries, setRevealedEntries] = useState<Set<string>>(new Set());
  const [collection, setCollection] = useState<Array<Pick<CrosswordEntry, "answer" | "clueEn" | "clueKo">>>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [caret, setCaret] = useState<{entryId: string; index: number} | null>(null);
  const deckRef = useRef<GardenDeck>(createGardenDeck());
  const [saveState, setSaveState] = useState<"ready" | "saved" | "unavailable">("ready");
  const [speechNote, setSpeechNote] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [flatView, setFlatView] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const [viewAngle, setViewAngle] = useState(32);
  const [viewElevation, setViewElevation] = useState(44);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const gameRootRef = useRef<HTMLDivElement>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const suspendedRef = useRef(suspended);
  useLayoutEffect(() => { suspendedRef.current = suspended; }, [suspended]);

  const board = useMemo(() => buildCrossword(puzzle), [puzzle]);
  const activeEntry = puzzle.entries.find((entry) => entry.id === activeEntryId) ?? puzzle.entries[0];
  const activeCells = useMemo(() => entryCells(activeEntry), [activeEntry]);
  const activeCellKeys = useMemo(() => new Set(activeCells.map(({ row, col }) => cellKey(row, col))), [activeCells]);
  const activeDraft = entryDrafts[activeEntry.id] ?? "";

  const displayedAnswers = useMemo(() => {
    const answers = new Map<string, string>();
    for (const entry of puzzle.entries) {
      const draft = entryDrafts[entry.id] ?? "";
      entryCells(entry).forEach(({ row, col }, index) => {
        const character = Array.from(draft)[index];
        if (character) answers.set(cellKey(row, col), character);
      });
    }
    entryCells(activeEntry).forEach(({ row, col }, index) => {
      const character = Array.from(activeDraft)[index];
      if (character) answers.set(cellKey(row, col), character);
    });
    for (const entry of puzzle.entries) {
      if (!solvedEntries.has(entry.id)) continue;
      entryCells(entry).forEach(({ row, col, solution }) => answers.set(cellKey(row, col), solution));
    }

    return answers;
  }, [puzzle, entryDrafts, activeEntry, activeDraft, solvedEntries]);

  const completedWords = solvedEntries.size;
  const boardStars = crosswordStars(hints, revealedEntries.size, mistakes);
  const journey = crosswordChapter(puzzleIndex);
  const season = gardenSeasons[(journey.chapter - 1) % gardenSeasons.length];
  const progressKey = `seoulkeys-atelier-v3-${themeId || "core"}`;
  // The same Korean answers share progress across clue languages; themes have independent decks.
  const checkpointKey = gardenCheckpointKey(themeId);
  const progressLoaded = loadedKey === checkpointKey;
  const activeSolved = solvedEntries.has(activeEntry.id);
  const focusedIndex = Math.min(activeCells.length - 1, caret?.entryId === activeEntry.id ? caret.index : Array.from(activeDraft).length);
  const focusedCellKey = !activeSolved && activeCells[focusedIndex] ? cellKey(activeCells[focusedIndex].row, activeCells[focusedIndex].col) : null;
  const sceneCells = useMemo(() => [...board.cells].map(([key, cell]) => {
    const [row, col] = key.split("-").map(Number);
    return { key, row, col, value: displayedAnswers.get(key) ?? "", number: board.numberByStart.get(key),
      active: activeCellKeys.has(key), focused: key === focusedCellKey, solved: cell.entryIds.some(id => solvedEntries.has(id)), wrong: wrongCells.has(key) };
  }), [board, displayedAnswers, activeCellKeys, focusedCellKey, solvedEntries, wrongCells]);
  const onDioramaFailure = useCallback(() => setRenderFailed(true), []);

  const focusAnswer = useCallback(() => {
    window.requestAnimationFrame(() => { if (!suspendedRef.current && !document.hidden) answerInputRef.current?.focus({ preventScroll: true }); });
  }, []);

  const playCircuitCue = useCallback((kind: "confirm" | "error") => {
    if (!soundEnabled || suspendedRef.current) return;
    // Never start audio while the page is hidden/closing.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    const AudioContextConstructor = audioContextConstructor();
    if (!AudioContextConstructor) return;
    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume().catch(() => {});
    const now = context.currentTime + 0.01;
    const frequencies = kind === "confirm" ? [440, 660, 880] : [180, 138];
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const panner = typeof context.createStereoPanner === "function" ? context.createStereoPanner() : null;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.055);
      gain.gain.setValueAtTime(0.001, now + index * 0.055);
      gain.gain.linearRampToValueAtTime(0.045, now + index * 0.055 + 0.008);
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
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); panner?.disconnect(); };
    });
  }, [soundEnabled]);

  useEffect(() => {
    if ((!soundEnabled || suspended) && audioContextRef.current) { void audioContextRef.current.close(); audioContextRef.current = null; }
    if (suspended && advanceTimerRef.current) { window.clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
  }, [soundEnabled, suspended]);

  useEffect(() => {
    focusAnswer();
  }, [focusAnswer, puzzleIndex]);

  // Resume the actual round, including its drafts. A reload never starts the old
  // compact loop again or consumes another card. Theme changes cannot save the
  // previous theme's state into the next theme's storage key.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let saved: GardenProgress | null = null, checkpoint: GardenCheckpoint | null = null;
      try {
        checkpoint = readGardenCheckpoint(localStorage.getItem(checkpointKey), themeId);
        saved = readGardenProgress(localStorage.getItem(progressKey));
        setSaveState(checkpoint || saved ? "saved" : "ready");
      } catch { setSaveState("unavailable"); }
      const index = checkpoint?.index ?? saved?.index ?? 0;
      const seed = new Uint32Array(1);
      try { window.crypto.getRandomValues(seed); } catch { seed[0] = Date.now() >>> 0; }
      const initialDeck = createGardenDeck(seed[0]);
      if (saved?.words.length) initialDeck.recent = [saved.words.slice(-7).map(word => word.answer)];
      const draw = checkpoint ? {puzzle: gardenCatalogBoard(checkpoint.puzzleId)!, deck: checkpoint.deck} : drawGardenBoard(initialDeck, index, themeId);
      deckRef.current = draw.deck;
      const fresh = draw.puzzle;
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      setPuzzle(fresh); setPuzzleIndex(index); setActiveEntryId(checkpoint?.activeEntryId ?? fresh.entries[0].id);
      setEntryDrafts(checkpoint?.drafts ?? {}); setSolvedEntries(new Set(checkpoint?.solved ?? [])); setWrongCells(new Set());
      setStatus(checkpoint?.solved.length === fresh.entries.length ? "solved" : "playing");
      setSeconds(checkpoint?.seconds ?? 0); setHints(checkpoint?.hints ?? 0); setMistakes(checkpoint?.mistakes ?? 0);
      setAssistedEntries(new Set(checkpoint?.assisted ?? [])); setRevealedEntries(new Set(checkpoint?.revealed ?? []));
      setScore(checkpoint?.score ?? saved?.score ?? 0); setTotalStars(checkpoint?.stars ?? saved?.stars ?? 0); setBestStreak(checkpoint?.best ?? saved?.best ?? 0);
      setCollection(checkpoint?.words ?? saved?.words ?? []); setStreak(checkpoint?.streak ?? 0); setSpeechNote(""); setCaret(null); setLoadedKey(checkpointKey);
      window.setTimeout(focusAnswer, 0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [progressKey, checkpointKey, themeId, focusAnswer]);

  useEffect(() => {
    if (!progressLoaded) return;
    const checkpoint: GardenCheckpoint = {
      version: 1, catalogVersion: CROSSWORD_CATALOG_VERSION, theme: gardenThemeKey(themeId), puzzleId: puzzle.id,
      index: puzzleIndex, deck: deckRef.current, score, stars: totalStars, best: bestStreak, words: collection,
      activeEntryId, drafts: entryDrafts, solved: [...solvedEntries], assisted: [...assistedEntries], revealed: [...revealedEntries],
      seconds, hints, mistakes, streak,
    };
    let result: "saved" | "unavailable" = "saved";
    try { localStorage.setItem(checkpointKey, JSON.stringify(checkpoint)); }
    catch { result = "unavailable"; }
    const savedNotice = window.setTimeout(() => setSaveState(result), 0);
    return () => window.clearTimeout(savedNotice);
  }, [progressLoaded, checkpointKey, themeId, puzzle, puzzleIndex, score, totalStars, bestStreak, collection, activeEntryId, entryDrafts, solvedEntries, assistedEntries, revealedEntries, seconds, hints, mistakes, streak]);

  useEffect(() => {
    if (suspended || status === "solved" || solvedEntries.has(activeEntryId)) return;
    focusAnswer();
  }, [activeEntryId, focusAnswer, solvedEntries, status, suspended]);

  useEffect(() => {
    if (status === "solved" || suspended) return;
    const timer = window.setInterval(() => { if (!document.hidden) setSeconds((current) => current + 1); }, 1000);
    return () => window.clearInterval(timer);
  }, [status, suspended]);

  useEffect(() => {
    if (status !== "solved" || suspended) return;
    window.requestAnimationFrame(() => { if (!suspendedRef.current) gameRootRef.current?.focus({ preventScroll: true }); });
  }, [status, suspended]);

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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
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
    if (suspendedRef.current || !progressLoaded) return;
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setActiveEntryId(entry.id);
    setCaret(null);
    setSpeechNote("");
    setWrongCells(new Set());
    setStatus(solvedEntries.size === puzzle.entries.length ? "solved" : solvedEntries.has(entry.id) ? "correct" : "playing");
    if (!solvedEntries.has(entry.id)) focusAnswer();
  }

  function nextEntry(step: number, solved = solvedEntries) {
    if (suspendedRef.current || !progressLoaded) return;
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
    if (suspendedRef.current || !progressLoaded) return;
    setCaret(null);
    const next = normalizeDraft(value);
    setEntryDrafts((current) => ({ ...current, [activeEntry.id]: next }));
    setWrongCells(new Set());
    setStatus("playing");
  }

  function checkActiveWord() {
    if (suspendedRef.current || !progressLoaded) return;
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
      setMistakes(value => value + 1);
      setStreak(0);
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
    const assisted = assistedEntries.has(activeEntry.id);
    const nextStreak = assisted ? 0 : streak + 1;
    setStreak(nextStreak);
    setBestStreak(current => Math.max(current, nextStreak));
    const nextScore = score + crosswordWordReward(nextStreak, assisted) + (boardSolved ? boardStars * 100 : 0);
    const nextCollection = collection.some(word => word.answer === activeEntry.answer) ? collection : [...collection, activeEntry];
    setScore(nextScore); setCollection(nextCollection);
    if (boardSolved) {
      setTotalStars(current => current + boardStars);
      const save: GardenProgress = { version: 2, index: puzzleIndex + 1, score: nextScore, stars: totalStars + boardStars,
        best: Math.max(bestStreak, nextStreak), words: nextCollection.slice(-500).map(({ answer, clueEn, clueKo }) => ({ answer, clueEn, clueKo })) };
      try { localStorage.setItem(progressKey, JSON.stringify(save)); setSaveState("saved"); }
      catch { setSaveState("unavailable"); }
    }
    setStatus(boardSolved ? "solved" : "correct");
    playCircuitCue("confirm");
    if (soundEnabled) onSuccessSound();
    if (boardSolved) return;
    advanceTimerRef.current = window.setTimeout(() => nextEntry(1, nextSolved), 850);
  }

  function revealSyllable() {
    if (suspendedRef.current || !progressLoaded) return;
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
    setAssistedEntries(entries => new Set(entries).add(activeEntry.id));
    setStreak(0);
    focusAnswer();
  }

  function revealAnswer() {
    if (suspendedRef.current || !progressLoaded) return;
    if (status === "solved" || activeSolved || revealedEntries.has(activeEntry.id)) return;
    setRevealedEntries(entries => new Set(entries).add(activeEntry.id));
    setAssistedEntries(entries => new Set(entries).add(activeEntry.id));
    setStreak(0);
    focusAnswer();
  }

  function listenToWord() {
    if (suspendedRef.current || !progressLoaded) return;
    if (!soundEnabled) { setSpeechNote(tr(locale, "Turn on sound to hear the word.", "소리를 켜면 발음을 들을 수 있어요.")); return; }
    if (!("speechSynthesis" in window)) { setSpeechNote(tr(locale, "Pronunciation is unavailable in this browser.", "이 브라우저에서는 발음을 재생할 수 없어요.")); return; }
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => voice.lang.toLowerCase().startsWith("ko"));
    if (!koreanVoice) { setSpeechNote(tr(locale, "A Korean voice is not installed on this device. You can still study the written answer.", "이 기기에 한국어 음성이 없어요. 정답 익히기로 낱말을 확인해 보세요.")); return; }
    if (!activeSolved && !assistedEntries.has(activeEntry.id)) {
      setAssistedEntries(entries => new Set(entries).add(activeEntry.id)); setHints(value => value + 1); setStreak(0);
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeEntry.answer);
    utterance.lang = "ko-KR"; utterance.voice = koreanVoice; utterance.rate = .78;
    utterance.onerror = () => setSpeechNote(tr(locale, "Audio could not play. Try studying the answer.", "소리를 재생하지 못했어요. 정답 익히기를 이용해 주세요."));
    window.speechSynthesis.speak(utterance);
    setSpeechNote(tr(locale, "Listen, then type what you hear. Listening counts as a hint.", "잘 듣고 입력해 보세요. 발음 듣기는 힌트로 기록돼요."));
  }

  useEffect(() => {
    if ((suspended || !soundEnabled) && "speechSynthesis" in window) window.speechSynthesis.cancel();
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [suspended, soundEnabled]);

  function nextPuzzle() {
    if (suspendedRef.current || !progressLoaded) return;
    const nextIndex = puzzleIndex + 1;
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    const drawn = drawGardenBoard(deckRef.current, nextIndex, themeId);
    deckRef.current = drawn.deck;
    const next = drawn.puzzle;
    setCaret(null);
    // A long expedition retains learned words, not every old board/DOM model.
    setPuzzle(next);
    setPuzzleIndex(nextIndex);
    setActiveEntryId(next.entries[0].id);
    setEntryDrafts({});
    setSolvedEntries(new Set());
    setWrongCells(new Set());
    setStatus("playing");
    setSeconds(0);
    setHints(0);
    setMistakes(0);
    setAssistedEntries(new Set());
    setRevealedEntries(new Set());
    window.setTimeout(focusAnswer, 0);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    checkActiveWord();
  }

  function handleInputKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (suspendedRef.current || isImeKey(event.nativeEvent)) return;
    if (event.key === "Tab") return; // Preserve native focus navigation; Alt+arrows change clues.
    if (event.key === "Enter") {
      event.preventDefault();
      checkActiveWord();
    } else if (event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      event.preventDefault();
      nextEntry(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.altKey && event.key.toLowerCase() === "h") {
      event.preventDefault();
      revealSyllable();
    }
  }

  const statusMessage = status === "solved"
    ? tr(locale, "Puzzle clear! Press Enter to launch the next board.", "퍼즐 완성! Enter를 누르면 다음 판이 바로 시작됩니다.")
    : status === "correct"
      ? tr(locale, "Word discovered. Keep exploring the clues.", "낱말을 발견했어요. 다음 낱말도 찾아보세요.")
      : status === "wrong"
        ? tr(locale, "Not quite. Your word stays—correct it and press Enter again.", "오답입니다. 입력한 단어는 남아 있어요. 고쳐서 다시 Enter!")
        : status === "incomplete"
          ? `${tr(locale, "Type all", "총")} ${Array.from(activeEntry.answer).length} ${tr(locale, "syllables, then press Enter.", "글자를 모두 입력한 뒤 Enter를 누르세요.")}`
          : tr(locale, "Type the whole answer to fill the grid automatically. Press Enter to check.", "정답 단어 전체를 입력하면 칸이 자동으로 채워집니다. Enter로 판정하세요.");

  return (
    <div
      className={`crossword-game-wrap crossword-expedition crossword-atelier ${status}`}
      data-visual-revision="studio-candidate-11-variety-active"
      data-progress-ready={progressLoaded}
      aria-busy={!progressLoaded}
      data-season={(journey.chapter - 1) % gardenSeasons.length}
      data-entry-id={activeEntry.id}
      data-board-index={puzzleIndex}
      ref={gameRootRef}
      tabIndex={-1}
      onKeyDownCapture={(event) => {
        if (suspendedRef.current || isImeKey(event.nativeEvent)) return;
        if (status !== "solved" || event.key !== "Enter") return;
        // Native buttons retain their own Enter action, including review controls.
        if (event.target instanceof HTMLElement && event.target.closest("button, summary")) return;
        event.preventDefault();
        nextPuzzle();
      }}
    >
      <header className="crossword-expedition-header">
        <div><p>{tr(locale, "HANGUL / ATELIER 04", "한글 / 아틀리에 04")} <span>04</span></p>
          <h3>{tr(locale, "Korean Crossword", "가로세로 퀴즈")}</h3></div>
        <div className="crossword-session-score"><strong>{score.toLocaleString()}</strong><span>{tr(locale, "COLLECTED POINTS", "모은 점수")}</span></div>
      </header>

      <div className="crossword-board-column">
        <div className="crossword-board-heading">
          <div><span>{tr(locale, "BOARD", "퍼즐")} {String(puzzleIndex + 1).padStart(2, "0")}</span><small>{tr(locale, "No time limit. Just discovery.", "서두르지 않아도 괜찮아요.")}</small></div>
          <div className="crossword-view-controls" aria-label={tr(locale, "Board view", "퍼즐 보기")}>
            <button type="button" className={!flatView && !renderFailed ? "active" : ""} aria-pressed={!flatView && !renderFailed} disabled={renderFailed} onClick={() => setFlatView(false)}>3D</button>
            <button type="button" className={flatView || renderFailed ? "active" : ""} aria-pressed={flatView || renderFailed} onClick={() => setFlatView(true)}>{tr(locale, "Flat", "평면")}</button>
            <button type="button" className="crossword-zoom" aria-pressed={zoomed} onClick={() => setZoomed(value => !value)}>{zoomed ? tr(locale, "Fit", "전체") : tr(locale, "Enlarge", "확대")}</button>
            <button type="button" className="crossword-turn-view" disabled={flatView || renderFailed} aria-label={tr(locale, "Rotate left", "왼쪽으로 회전")} onClick={() => setViewAngle(angle => angle - 20)}>↶</button>
            <button type="button" className="crossword-turn-view" disabled={flatView || renderFailed} aria-label={tr(locale, "Rotate right", "오른쪽으로 회전")} onClick={() => setViewAngle(angle => angle + 20)}>↷</button>
            <button type="button" disabled={flatView || renderFailed} onClick={() => {setViewAngle(32);setViewElevation(44);}}>{tr(locale, "Reset view", "각도 초기화")}</button>
          </div>
        </div>
        <p className="crossword-orbit-help">{flatView || renderFailed ? tr(locale, "Choose a tile to select its word", "타일을 누르면 해당 단어가 선택돼요") : <>{tr(locale, "Drag to turn and tilt", "드래그로 회전·기울기 조절")}<span className="crossword-orbit-keyboard-help">{tr(locale, " · Arrow keys when the board is focused", " · 보드 선택 후 방향키로도 조절")}</span></>}</p>
        <div className={`crossword-stage-scroll ${zoomed ? "is-zoomed" : ""}`} tabIndex={zoomed ? 0 : undefined} aria-label={zoomed ? tr(locale, "Enlarged board. Scroll to explore.", "확대한 보드. 스크롤해서 살펴보세요.") : undefined}>
        <CrosswordDiorama chapter={journey.chapter} completed={status === "solved"} key={`${puzzle.id}-${flatView || renderFailed ? "flat" : "3d"}`} size={puzzle.size} cells={sceneCells} flat={flatView || renderFailed} angle={viewAngle} elevation={viewElevation} onOrbit={orbit => {setViewAngle(orbit.angle);setViewElevation(orbit.elevation);}}
          label={`${tr(locale, puzzle.titleEn, puzzle.titleKo)} ${tr(locale, "Korean Crossword", "가로세로 퀴즈")}`}
          cellLabel={tr(locale, "Crossword cell", "가로세로 칸")} solvedLabel={tr(locale, "Solved", "완료")}
          onFailure={onDioramaFailure}
          onSelect={key => {
            const cell = board.cells.get(key);
            if (!cell) return;
            // Repeated taps at a crossing switch direction instead of trapping it.
            const alternatives = cell.entryIds.filter(id => id !== activeEntry.id && !solvedEntries.has(id));
            const id = alternatives[0] ?? cell.entryIds.find(id => !solvedEntries.has(id)) ?? cell.entryIds[0];
            const entry = puzzle.entries.find(item => item.id === id);
            if (entry) {
              selectEntry(entry);
              const position = entryCells(entry).findIndex(cell => cellKey(cell.row, cell.col) === key);
              if (position >= 0 && !suspendedRef.current && progressLoaded && !solvedEntries.has(entry.id)) {
                const inputPosition = Math.min(position, (entryDrafts[entry.id] ?? "").length);
                setCaret({entryId:entry.id,index:inputPosition});
                window.requestAnimationFrame(() => answerInputRef.current?.setSelectionRange(inputPosition, inputPosition));
              }
            }
          }} />
        </div>
        <p className="crossword-garden-note">{tr(locale, season.noteEn, season.noteKo)}</p>
        {renderFailed && <p className="crossword-render-note">{tr(locale, "Flat view is ready. All clues and controls work here.", "평면 보기로 준비했어요. 모든 낱말과 기능을 사용할 수 있어요.")}</p>}
        <div className="crossword-board-caption"><span><i />{tr(locale, "SELECTED", "선택한 낱말")}</span><span><i />{tr(locale, "DISCOVERED", "완성한 낱말")}</span><b>{completedWords} / {puzzle.entries.length}</b></div>
        <div className="crossword-journey">
          <div><small>{tr(locale, "CHAPTER", "챕터")} {journey.chapter}</small><span>{tr(locale, "Three boards. A new chapter.", "세 판을 완성하면 다음 챕터로.")}</span></div>
          <ol aria-label={tr(locale, "Expedition progress", "탐험 진행도")}>
            {[0, 1, 2].map(stop => <li className={stop < journey.stop || (stop === journey.stop && status === "solved") ? "done" : stop === journey.stop ? "current" : ""} aria-current={stop === journey.stop ? "step" : undefined} key={stop}>{stop < journey.stop || (stop === journey.stop && status === "solved") ? "✓" : String(Math.floor(puzzleIndex / 3) * 3 + stop + 1).padStart(2, "0")}</li>)}
          </ol>
        </div>
        <div className="crossword-session-stats">
          <div><b>{streak}<span>×</span></b><small>{tr(locale, "Clean streak", "연속 정답")}</small></div>
          <div><b>{totalStars}<span>✦</span></b><small>{tr(locale, "Stars collected", "모은 별")}</small></div>
          <div><b>{collection.length}</b><small>{tr(locale, "Words discovered", "발견한 낱말")}</small></div>
        </div>
        <details className="crossword-star-guide"><summary>{tr(locale, "How to earn three stars", "별 세 개를 얻는 방법")} <span>✦ ✦ ✦</span></summary>
          <p>{tr(locale, "One for completing the board. One for using no full answers. One for using no hints and making no mistakes. There is no time limit, and help never removes your points.", "퍼즐을 완성하면 별 하나. 정답 보기를 쓰지 않으면 하나 더. 힌트와 오답 없이 풀면 마지막 별까지! 시간제한은 없고, 도움을 받아도 점수는 줄지 않아요.")}</p>
        </details>
      </div>

      <div className="demo-copy crossword-copy">
        <div className="puzzle-head"><p className="demo-label">{tr(locale, "MAKE A CONNECTION", "낱말을 이어 보세요")}</p><span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></div>
        <h3>{tr(locale, puzzle.titleEn, puzzle.titleKo)}</h3>
        <div className="puzzle-progress" role="progressbar" aria-label={tr(locale, "Puzzle progress", "퍼즐 완성도")} aria-valuemin={0} aria-valuemax={puzzle.entries.length} aria-valuenow={completedWords}><span style={{ width: `${(completedWords / puzzle.entries.length) * 100}%` }} /></div>

        {status === "solved" ? <section className="crossword-finish" aria-live="polite" aria-labelledby="crossword-finish-title">
          <div className="crossword-earned-stars" aria-label={`${boardStars} ${tr(locale, "stars", "별")}`}>{[1, 2, 3].map(star => <span className={star <= boardStars ? "earned" : ""} key={star}>✦</span>)}</div>
          <h4 id="crossword-finish-title">{journey.stop === 2 ? tr(locale, "A new chapter begins", "새로운 챕터가 열렸어요") : tr(locale, "Connection complete", "낱말 연결 완료")}</h4>
          <p>{puzzle.entries.length} {tr(locale, "words connected", "낱말을 연결했어요")} · {tr(locale, "Best streak", "최고 연속 정답")} {bestStreak}</p>
          <button type="button" className="button button-primary crossword-continue" onClick={nextPuzzle}>{journey.stop === 2 ? tr(locale, "Open the next chapter", "다음 챕터로") : tr(locale, "Explore the next board", "다음 퍼즐 탐험")} <span>→</span></button>
          <p className="crossword-finish-note">{tr(locale, "Completed boards are saved on this browser.", "완성한 퍼즐은 이 브라우저에 저장돼요.")}</p>
        </section> : <>
          <div className="active-clue-banner" data-entry-id={activeEntry.id}>
            <span>{board.numberByEntry.get(activeEntry.id)} {activeEntry.direction === "across" ? "→" : "↓"}</span>
            <div><small>{activeSolved ? tr(locale, "DISCOVERED", "완성한 낱말") : tr(locale, "YOUR NEXT DISCOVERY", "다음으로 발견할 낱말")}</small><b lang={clueLocale} dir="auto">{clueMeaning(clueLocale, activeEntry)}</b></div>
            <em>{Array.from(activeEntry.answer).length}{tr(locale, " syllables", "글자")}</em>
          </div>
          <div className="crossword-syllable-preview" aria-hidden="true">
            {Array.from(activeEntry.answer).map((_, index) => <span className={`${Array.from(activeDraft)[index] ? "filled" : ""} ${activeSolved ? "solved" : ""}`} key={index}>{Array.from(activeDraft)[index] || <i />}</span>)}
          </div>
          <form className={`crossword-word-entry ${status}`} onSubmit={submit}>
            <label htmlFor="crossword-word-input">{tr(locale, "Type the whole answer", "정답 단어 전체 입력")}</label>
            <div>
              <HangulInput id="crossword-word-input" locale={locale} onScreenSubmit={checkActiveWord} ref={answerInputRef} lang="ko" value={activeDraft}
                disabled={suspended || activeSolved || !progressLoaded} maxLength={Array.from(activeEntry.answer).length} onValueChange={updateActiveDraft}
                onKeyDownCapture={(event) => { if (soundEnabled && shouldPlayTypingKeySound(event)) { if (!suspendedRef.current) onKeySound(event.code); } }}
                onKeyDown={handleInputKeys}
                onSelect={event => setCaret({entryId: activeEntry.id, index: event.currentTarget.selectionStart ?? activeDraft.length})}
                onKeyUp={event => setCaret({entryId: activeEntry.id, index: event.currentTarget.selectionStart ?? activeDraft.length})}
                autoComplete="off" spellCheck={false}
                placeholder={tr(locale, "{n} Korean syllables", `${Array.from(activeEntry.answer).length}글자 단어`).replace("{n}", String(Array.from(activeEntry.answer).length))}
                aria-describedby="crossword-entry-progress crossword-status" />
              <span id="crossword-entry-progress">{Array.from(activeDraft).length}/{Array.from(activeEntry.answer).length}</span>
              <button className="button button-primary" type="submit" disabled={suspended || !progressLoaded}>{activeSolved ? tr(locale, "Next clue", "다음 낱말") : tr(locale, "Check", "확인")} <span>↵</span></button>
            </div>
          </form>
          <p id="crossword-status" className={`crossword-status ${status}`} aria-live="polite">{statusMessage}</p>
          <div className="crossword-actions">
            <button className="crossword-listen" type="button" onClick={listenToWord}>{tr(locale, "Listen", "발음 듣기")} ♪</button>
            <button className="crossword-clear" type="button" disabled={activeSolved} onClick={revealSyllable}>{tr(locale, "Reveal a syllable", "한 글자 힌트")} <kbd>Alt+H</kbd></button>
            <button className="crossword-study" type="button" disabled={activeSolved || revealedEntries.has(activeEntry.id)} onClick={revealAnswer}>{tr(locale, "Study the answer", "정답 익히기")}</button>
            <button className="crossword-next-clue" type="button" onClick={() => nextEntry(1)} aria-label={tr(locale, "Next clue", "다음 낱말")}>→</button>
          </div>
          {speechNote && <p className="crossword-speech-note" role="status">{speechNote}</p>}
          {revealedEntries.has(activeEntry.id) && !activeSolved && <div className="crossword-answer-study"><strong lang="ko">{activeEntry.answer}</strong><span>{tr(locale, "Read it, then type it to make it yours.", "눈으로 익힌 뒤 직접 입력해 보세요.")}</span></div>}
        </>}

        <details className="crossword-clues-drawer"><summary>{tr(locale, "All clues", "전체 단서")} <span>{completedWords}/{puzzle.entries.length}</span></summary>
        <div className="crossword-clues">
          {(["across", "down"] as Direction[]).map(direction => <section key={direction}>
            <h4>{direction === "across" ? "→" : "↓"} {direction === "across" ? tr(locale, "Across word", "가로 낱말") : tr(locale, "Down word", "세로 낱말")}</h4>
            {puzzle.entries.filter(entry => entry.direction === direction).map(entry => {
              const solved = solvedEntries.has(entry.id);
              return <button type="button" className={`${activeEntry.id === entry.id ? "active" : ""} ${solved ? "solved" : ""}`} aria-pressed={activeEntry.id === entry.id} onClick={() => selectEntry(entry)} data-entry-id={entry.id} key={entry.id}>
                <b>{solved ? "✓" : board.numberByEntry.get(entry.id)}</b><span lang={clueLocale} dir="auto">{solved && <strong lang="ko" dir="ltr">{entry.answer}</strong>}{clueMeaning(clueLocale, entry)}</span><small>{Array.from(entry.answer).length}</small>
              </button>;
            })}
          </section>)}
        </div>
        </details>
        <div className="game-key-help crossword-key-help"><span><kbd>Enter</kbd>{tr(locale, "check word", "단어 확인")}</span><span><kbd>Alt+→</kbd>{tr(locale, "next clue", "다음 낱말")}</span><span><kbd>Alt+H</kbd>{tr(locale, "hint", "한 글자 힌트")}</span></div>
      </div>
      <p className="crossword-save-note">{saveState === "unavailable" ? tr(locale, "Saving is unavailable. You can keep playing this session.", "저장을 사용할 수 없지만 계속 플레이할 수 있어요.") : tr(locale, "This round and your answers stay on this browser · Every puzzle appears once per deck", "현재 퍼즐과 입력은 이 브라우저에 저장돼요 · 모든 문제를 푼 뒤에 같은 문제가 다시 나와요")}</p>
      {collection.length > 0 && <details className="crossword-collection">
        <summary><span>{tr(locale, "Your word collection", "나의 낱말 컬렉션")} <b>{collection.length}</b></span><span>{tr(locale, "Open to revisit", "펼쳐서 복습하기")} ↗</span></summary>
        <div>{collection.map(entry => <article key={entry.answer}><strong lang="ko">{entry.answer}</strong><span lang={clueLocale} dir="auto">{clueMeaning(clueLocale, entry)}</span></article>)}</div>
      </details>}
    </div>
  );
}
