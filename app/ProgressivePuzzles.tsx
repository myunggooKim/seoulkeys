"use client";

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type MissingPuzzle = {
  word: string;
  missingIndex: number;
  meaningKo: string;
  meaningEn: string;
  options: string[];
};

function validateMissingPuzzle(puzzle: MissingPuzzle) {
  const expected = Array.from(puzzle.word)[puzzle.missingIndex];
  const options = new Set(puzzle.options);
  if (!expected || puzzle.options.length !== 3 || options.size !== 3 || !options.has(expected)) {
    throw new Error(`Invalid missing-letter puzzle: ${puzzle.word}`);
  }
  return puzzle;
}

const missingPuzzleLevels: MissingPuzzle[][] = [
  [
    { word: "한글", missingIndex: 1, options: ["국", "글", "강"], meaningKo: "한국의 문자", meaningEn: "Korean writing system" },
    { word: "친구", missingIndex: 1, options: ["구", "고", "기"], meaningKo: "함께 어울리는 사람", meaningEn: "a friend" },
    { word: "여행", missingIndex: 1, options: ["항", "행", "향"], meaningKo: "다른 곳으로 떠나기", meaningEn: "travel" },
    { word: "음악", missingIndex: 1, options: ["억", "악", "옥"], meaningKo: "노래와 소리", meaningEn: "music" },
    { word: "사랑", missingIndex: 1, options: ["랑", "량", "낭"], meaningKo: "아끼는 마음", meaningEn: "love" },
    { word: "바다", missingIndex: 1, options: ["타", "다", "라"], meaningKo: "넓고 푸른 물", meaningEn: "sea" },
  ],
  [
    { word: "고마워", missingIndex: 1, options: ["모", "마", "머"], meaningKo: "감사를 전하는 말", meaningEn: "a casual thank-you" },
    { word: "반가워", missingIndex: 1, options: ["가", "거", "고"], meaningKo: "만나서 기쁠 때 하는 말", meaningEn: "nice to meet you" },
    { word: "강아지", missingIndex: 1, options: ["어", "아", "오"], meaningKo: "사람과 친한 어린 개", meaningEn: "a puppy" },
    { word: "비행기", missingIndex: 1, options: ["항", "행", "향"], meaningKo: "하늘을 나는 교통수단", meaningEn: "an airplane" },
    { word: "드라마", missingIndex: 1, options: ["리", "라", "루"], meaningKo: "여러 회로 이어지는 영상 이야기", meaningEn: "a television drama" },
    { word: "한국어", missingIndex: 1, options: ["궁", "국", "곡"], meaningKo: "한국에서 쓰는 언어", meaningEn: "the Korean language" },
  ],
  [
    { word: "지하철", missingIndex: 1, options: ["허", "하", "호"], meaningKo: "도시의 땅 아래를 달리는 열차", meaningEn: "a subway" },
    { word: "떡볶이", missingIndex: 1, options: ["복", "볶", "벅"], meaningKo: "매콤한 한국 길거리 음식", meaningEn: "spicy Korean rice cakes" },
    { word: "안녕하세요", missingIndex: 3, options: ["세", "새", "서"], meaningKo: "공손하게 건네는 인사", meaningEn: "a polite hello" },
    { word: "괜찮아요", missingIndex: 1, options: ["찬", "찮", "창"], meaningKo: "문제가 없다고 말할 때", meaningEn: "it is okay" },
    { word: "감사합니다", missingIndex: 2, options: ["합", "압", "함"], meaningKo: "공손하게 감사를 전하는 말", meaningEn: "a formal thank-you" },
    { word: "보고싶어요", missingIndex: 2, options: ["싶", "십", "심"], meaningKo: "그리운 마음을 전하는 말", meaningEn: "I miss you" },
  ],
].map((level) => level.map(validateMissingPuzzle));

export type Direction = "across" | "down";

type WordSeed = {
  answer: string;
  clueKo: string;
  clueEn: string;
};

export type CrosswordEntry = WordSeed & {
  id: string;
  direction: Direction;
  row: number;
  col: number;
};

export type CrosswordPuzzle = {
  id: string;
  size: number;
  titleKo: string;
  titleEn: string;
  entries: CrosswordEntry[];
};

export type BuiltCell = {
  solution: string;
  entryIds: string[];
  directions: Direction[];
};

const crosswordThemes: Array<{ id: string; titleKo: string; titleEn: string; words: WordSeed[] }> = [
  {
    id: "travel-network",
    titleKo: "한국 여행 연결망",
    titleEn: "Korean travel network",
    words: [
      { answer: "한국여행준비", clueKo: "한국으로 떠나기 전에 하는 과정", clueEn: "Getting ready for a trip to Korea" },
      { answer: "한국어", clueKo: "한국에서 쓰는 언어", clueEn: "The language spoken in Korea" },
      { answer: "여행자", clueKo: "다른 곳을 여행하는 사람", clueEn: "A person who travels" },
      { answer: "준비물", clueKo: "떠나기 전에 챙겨야 하는 것", clueEn: "Things to pack before leaving" },
      { answer: "어학당", clueKo: "외국어를 배우는 교육 기관", clueEn: "A language institute" },
      { answer: "자전거", clueKo: "두 바퀴를 발로 굴리는 탈것", clueEn: "A bicycle" },
      { answer: "물건", clueKo: "형태가 있고 쓰임이 있는 것", clueEn: "An item or object" },
      { answer: "당일치기", clueKo: "하루 안에 다녀오는 짧은 여행", clueEn: "A same-day trip" },
      { answer: "기차역", clueKo: "기차를 타고 내리는 곳", clueEn: "A train station" },
      { answer: "역무원", clueKo: "기차역에서 승객을 돕는 직원", clueEn: "A station employee" },
      { answer: "원화", clueKo: "한국에서 사용하는 돈", clueEn: "Korean currency" },
      { answer: "건물", clueKo: "사람이 지내거나 일하도록 지은 구조물", clueEn: "A building" },
      { answer: "화장실", clueKo: "손을 씻고 용변을 보는 곳", clueEn: "A restroom" },
      { answer: "실내화", clueKo: "건물 안에서 신는 신발", clueEn: "Indoor shoes" },
    ],
  },
  {
    id: "food-network",
    titleKo: "맛있는 한국 식탁",
    titleEn: "A Korean food table",
    words: [
      { answer: "음식점", clueKo: "음식을 주문해 먹는 곳", clueEn: "A restaurant" },
      { answer: "점심밥", clueKo: "낮에 먹는 끼니", clueEn: "Lunch" },
      { answer: "밥그릇", clueKo: "밥을 담는 그릇", clueEn: "A rice bowl" },
      { answer: "국그릇", clueKo: "국을 담는 그릇", clueEn: "A soup bowl" },
      { answer: "국수집", clueKo: "국수 요리를 파는 식당", clueEn: "A noodle restaurant" },
      { answer: "맛집", clueKo: "음식이 맛있기로 유명한 곳", clueEn: "A popular restaurant" },
      { answer: "집밥", clueKo: "집에서 만든 따뜻한 음식", clueEn: "Home-cooked food" },
      { answer: "아침밥", clueKo: "하루를 시작하며 먹는 끼니", clueEn: "Breakfast" },
      { answer: "비빔밥", clueKo: "밥과 나물을 섞어 먹는 한식", clueEn: "Rice mixed with vegetables" },
      { answer: "밥상", clueKo: "음식을 차려 놓는 상", clueEn: "A dining table" },
      { answer: "상추", clueKo: "고기를 싸 먹는 잎채소", clueEn: "Lettuce used for wraps" },
      { answer: "추어탕", clueKo: "미꾸라지를 넣어 끓인 국", clueEn: "Loach soup" },
      { answer: "탕수육", clueKo: "새콤달콤한 소스를 곁들인 요리", clueEn: "Sweet-and-sour pork" },
      { answer: "육개장", clueKo: "소고기와 고사리를 넣은 매운 국", clueEn: "Spicy beef soup" },
    ],
  },
  {
    id: "culture-network",
    titleKo: "K-콘텐츠 스튜디오",
    titleEn: "K-content studio",
    words: [
      { answer: "영화관", clueKo: "큰 화면으로 영화를 보는 곳", clueEn: "A movie theater" },
      { answer: "영화인", clueKo: "영화 분야에서 일하는 사람", clueEn: "A film professional" },
      { answer: "연예인", clueKo: "대중 앞에서 공연하고 활동하는 사람", clueEn: "An entertainer" },
      { answer: "인기곡", clueKo: "많은 사람이 즐겨 듣는 노래", clueEn: "A popular song" },
      { answer: "작곡가", clueKo: "새로운 음악을 만드는 사람", clueEn: "A composer" },
      { answer: "가수", clueKo: "노래를 부르는 직업", clueEn: "A singer" },
      { answer: "수상작", clueKo: "상을 받은 작품", clueEn: "An award-winning work" },
      { answer: "작품", clueKo: "예술가가 완성한 창작물", clueEn: "A creative work" },
      { answer: "품평회", clueKo: "작품을 보고 의견을 나누는 자리", clueEn: "A review showcase" },
      { answer: "음악회", clueKo: "음악을 관객 앞에서 들려주는 공연", clueEn: "A concert" },
      { answer: "음악가", clueKo: "음악을 만들거나 연주하는 사람", clueEn: "A musician" },
      { answer: "가요", clueKo: "대중이 즐겨 부르는 노래", clueEn: "Popular music" },
      { answer: "요즘", clueKo: "바로 얼마 전부터 지금까지", clueEn: "These days" },
    ],
  },
];

export function cellKey(row: number, col: number) {
  return `${row}-${col}`;
}

export function entryCells(entry: CrosswordEntry) {
  return Array.from(entry.answer).map((solution, index) => ({
    row: entry.row + (entry.direction === "down" ? index : 0),
    col: entry.col + (entry.direction === "across" ? index : 0),
    solution,
  }));
}

function createCrossword(theme: typeof crosswordThemes[number], size = 15): CrosswordPuzzle {
  const cells = new Map<string, BuiltCell>();
  const entries: CrosswordEntry[] = [];

  function canPlace(answer: string, row: number, col: number, direction: Direction) {
    const letters = Array.from(answer);
    const endRow = row + (direction === "down" ? letters.length - 1 : 0);
    const endCol = col + (direction === "across" ? letters.length - 1 : 0);
    if (row < 0 || col < 0 || endRow >= size || endCol >= size) return false;
    const before = direction === "across" ? cellKey(row, col - 1) : cellKey(row - 1, col);
    const after = direction === "across" ? cellKey(row, endCol + 1) : cellKey(endRow + 1, col);
    if (cells.has(before) || cells.has(after)) return false;

    let crossings = 0;
    for (let index = 0; index < letters.length; index += 1) {
      const nextRow = row + (direction === "down" ? index : 0);
      const nextCol = col + (direction === "across" ? index : 0);
      const existing = cells.get(cellKey(nextRow, nextCol));
      if (existing) {
        if (existing.solution !== letters[index] || existing.directions.includes(direction)) return false;
        crossings += 1;
      } else {
        const neighbors = direction === "across"
          ? [cellKey(nextRow - 1, nextCol), cellKey(nextRow + 1, nextCol)]
          : [cellKey(nextRow, nextCol - 1), cellKey(nextRow, nextCol + 1)];
        if (neighbors.some((key) => cells.has(key))) return false;
      }
    }
    return crossings;
  }

  function place(seed: WordSeed, row: number, col: number, direction: Direction) {
    const id = `${theme.id}-${entries.length + 1}`;
    const entry: CrosswordEntry = { ...seed, id, row, col, direction };
    entries.push(entry);
    for (const position of entryCells(entry)) {
      const key = cellKey(position.row, position.col);
      const current = cells.get(key);
      cells.set(key, {
        solution: position.solution,
        entryIds: current ? [...current.entryIds, id] : [id],
        directions: current ? [...current.directions, direction] : [direction],
      });
    }
  }

  const first = theme.words[0];
  const firstCol = Math.floor((size - Array.from(first.answer).length) / 2);
  place(first, Math.floor(size / 2), firstCol, "across");

  for (const seed of theme.words.slice(1)) {
    const letters = Array.from(seed.answer);
    let best: { row: number; col: number; direction: Direction; score: number } | null = null;
    for (let index = 0; index < letters.length; index += 1) {
      for (const [key, cell] of cells) {
        if (cell.solution !== letters[index]) continue;
        const [cellRow, cellCol] = key.split("-").map(Number);
        for (const direction of ["across", "down"] as Direction[]) {
          if (cell.directions.includes(direction)) continue;
          const row = cellRow - (direction === "down" ? index : 0);
          const col = cellCol - (direction === "across" ? index : 0);
          const crossings = canPlace(seed.answer, row, col, direction);
          if (crossings === false || crossings < 1) continue;
          const centerDistance = Math.abs(row - size / 2) + Math.abs(col - size / 2);
          const score = crossings * 100 - centerDistance;
          if (!best || score > best.score) best = { row, col, direction, score };
        }
      }
    }
    if (best) place(seed, best.row, best.col, best.direction);
  }

  const positions = entries.flatMap(entryCells);
  const minRow = Math.min(...positions.map((position) => position.row));
  const maxRow = Math.max(...positions.map((position) => position.row));
  const minCol = Math.min(...positions.map((position) => position.col));
  const maxCol = Math.max(...positions.map((position) => position.col));
  const normalizedEntries = entries.map((entry) => ({
    ...entry,
    row: entry.row - minRow,
    col: entry.col - minCol,
  }));
  const normalizedSize = Math.max(maxRow - minRow + 1, maxCol - minCol + 1);
  return { id: theme.id, size: normalizedSize, titleKo: theme.titleKo, titleEn: theme.titleEn, entries: normalizedEntries };
}

export const crosswordPuzzles = crosswordThemes.map((theme) => createCrossword(theme));

export function buildCrossword(puzzle: CrosswordPuzzle) {
  const cells = new Map<string, BuiltCell>();
  for (const entry of puzzle.entries) {
    for (const position of entryCells(entry)) {
      const key = cellKey(position.row, position.col);
      const current = cells.get(key);
      cells.set(key, {
        solution: position.solution,
        entryIds: current ? [...current.entryIds, entry.id] : [entry.id],
        directions: current ? [...current.directions, entry.direction] : [entry.direction],
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

export function MissingLetterGame({ koreanUi, soundEnabled, onSuccessSound, onKeySound }: {
  koreanUi: boolean; soundEnabled: boolean; onSuccessSound: () => void; onKeySound: (code: string) => void;
}) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [message, setMessage] = useState(koreanUi ? "빠진 한 글자를 입력하고 Enter를 누르세요." : "Type the missing syllable and press Enter.");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const puzzleStartedAt = useRef<number | null>(null);
  const level = missingPuzzleLevels[levelIndex];
  const puzzle = level[puzzleIndex % level.length];
  const characters = Array.from(puzzle.word);
  const expected = characters[puzzle.missingIndex];
  const accuracy = attempts ? Math.round(correct / attempts * 100) : 100;

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (locked) return;
    puzzleStartedAt.current = performance.now();
    focusInput();
  }, [focusInput, levelIndex, locked, puzzleIndex]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  function choose(value: string) {
    if (locked) return;
    setAnswer(value);
    focusInput();
  }

  function checkAnswer() {
    if (locked || !answer.trim()) return;
    const normalized = Array.from(answer.trim()).slice(-1)[0] ?? "";
    setAttempts((current) => current + 1);
    if (normalized !== expected) {
      setStreak(0);
      setMessage(koreanUi ? "글자는 그대로 있어요. Backspace로 고치고 다시 Enter!" : "Your answer stays. Correct it with Backspace and press Enter again.");
      focusInput();
      return;
    }

    const seconds = Math.max(1, (performance.now() - (puzzleStartedAt.current ?? performance.now())) / 1000);
    const speedBonus = Math.max(0, Math.round(120 - seconds * 8));
    const gained = 100 + levelIndex * 50 + streak * 10 + speedBonus;
    const isLevelEnd = puzzleIndex === level.length - 1;
    setLocked(true);
    setCorrect((current) => current + 1);
    setStreak((current) => current + 1);
    setScore((current) => current + gained);
    setMessage(koreanUi ? `정답! +${gained}점 · 손을 그대로 두세요.` : `Correct! +${gained} · Keep your hands in place.`);
    if (soundEnabled) onSuccessSound();
    if (isLevelEnd) setLevelUp(true);

    timerRef.current = window.setTimeout(() => {
      const nextLevel = isLevelEnd ? (levelIndex + 1) % missingPuzzleLevels.length : levelIndex;
      setLevelIndex(nextLevel);
      setPuzzleIndex(isLevelEnd ? 0 : puzzleIndex + 1);
      setAnswer("");
      setLocked(false);
      setLevelUp(false);
      setMessage(isLevelEnd
        ? koreanUi ? `${nextLevel + 1}단계 시작! 더 긴 낱말에 도전합니다.` : `Level ${nextLevel + 1}! Longer words are ready.`
        : koreanUi ? "다음 낱말이 준비됐어요. 바로 입력하세요." : "The next word is ready. Type now.");
      window.setTimeout(focusInput, 0);
    }, isLevelEnd ? 1450 : 650);
  }

  return (
    <div className={`missing-demo progressive-puzzle level-${levelIndex + 1}`} onKeyDownCapture={(event) => {
      if (/^[1-3]$/.test(event.key) && !locked) {
        event.preventDefault();
        choose(puzzle.options[Number(event.key) - 1]);
      }
    }}>
      <div className="puzzle-head">
        <p className="demo-label">MISSING BEAT · LEVEL {levelIndex + 1}</p>
        <div><span>{koreanUi ? "정확도" : "ACC"} <b>{accuracy}%</b></span><span>{koreanUi ? "연속" : "STREAK"} <b>×{streak}</b></span><span><b>{score}</b> PTS</span></div>
      </div>
      <div className="missing-level-track">
        {missingPuzzleLevels.map((_, index) => <span className={index < levelIndex ? "done" : index === levelIndex ? "current" : ""} key={index}>{index < levelIndex ? "✓" : index + 1}</span>)}
        <i style={{ width: `${((puzzleIndex + (locked ? 1 : 0)) / level.length) * 100}%` }} />
      </div>
      <div className="missing-prompt">
        <small>{koreanUi ? `문제 ${puzzleIndex + 1}/${level.length}` : `WORD ${puzzleIndex + 1}/${level.length}`}</small>
        <h3>{koreanUi ? puzzle.meaningKo : puzzle.meaningEn}</h3>
      </div>
      <div className="missing-word" lang="ko">
        {characters.map((character, index) => index === puzzle.missingIndex
          ? <span className={locked ? "correct" : ""} key={index}>{answer || "?"}</span>
          : <b key={index}>{character}</b>)}
      </div>
      <label className="missing-input-label" htmlFor="missing-letter-input">{koreanUi ? "빠진 글자" : "Missing syllable"}</label>
      <input
        id="missing-letter-input"
        className={answer && answer !== expected ? "pending" : ""}
        lang="ko"
        ref={inputRef}
        value={answer}
        disabled={locked}
        maxLength={2}
        onChange={(event) => setAnswer(Array.from(event.target.value).slice(-1)[0] ?? "")}
        onKeyDown={(event) => {
          if (soundEnabled && !event.repeat && (event.key.length === 1 || event.key === "Backspace")) onKeySound(event.code);
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            checkAnswer();
          }
        }}
        onBlur={() => { if (!locked) window.setTimeout(focusInput, 0); }}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="answer-options" aria-label={koreanUi ? "빠진 글자 후보" : "Missing syllable choices"}>
        {puzzle.options.map((option, index) => (
          <button type="button" disabled={locked} className={answer === option ? "chosen" : ""} onClick={() => choose(option)} key={option}><kbd>{index + 1}</kbd>{option}</button>
        ))}
      </div>
      <p className={`form-message ${locked ? "success" : ""}`} aria-live="polite">{message}</p>
      <div className="game-key-help"><span><kbd>1–3</kbd>{koreanUi ? "후보 선택" : "choose"}</span><span><kbd>Enter</kbd>{koreanUi ? "정답 확인" : "check"}</span><span><kbd>⌫</kbd>{koreanUi ? "고치기" : "correct"}</span></div>
      {levelUp && <div className="missing-level-up" role="status"><span>LEVEL</span><b>{levelIndex + 1} CLEAR!</b><small>{koreanUi ? "다음 단계가 열립니다" : "Next level unlocked"}</small></div>}
    </div>
  );
}

export function CrosswordGame({ koreanUi, soundEnabled, onSuccessSound, onKeySound }: {
  koreanUi: boolean; soundEnabled: boolean; onSuccessSound: () => void; onKeySound: (code: string) => void;
}) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeEntryId, setActiveEntryId] = useState(crosswordPuzzles[0].entries[0].id);
  const [selectedCell, setSelectedCell] = useState<string | null>(() => {
    const first = entryCells(crosswordPuzzles[0].entries[0])[0];
    return cellKey(first.row, first.col);
  });
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"playing" | "incomplete" | "wrong" | "solved">("playing");
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const puzzle = crosswordPuzzles[puzzleIndex % crosswordPuzzles.length];
  const board = useMemo(() => buildCrossword(puzzle), [puzzle]);
  const activeEntry = puzzle.entries.find((entry) => entry.id === activeEntryId) ?? puzzle.entries[0];
  const activeCellKeys = new Set(entryCells(activeEntry).map(({ row, col }) => cellKey(row, col)));
  const totalCells = board.cells.size;
  const correctCells = [...board.cells].filter(([key, cell]) => answers[key] === cell.solution).length;

  function focusCell(key: string) {
    window.requestAnimationFrame(() => inputRefs.current[key]?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    const first = entryCells(puzzle.entries[0])[0];
    const key = cellKey(first.row, first.col);
    window.setTimeout(() => focusCell(key), 0);
  // Puzzle changes reset focus through nextPuzzle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "solved") return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

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

  function selectEntry(entry: CrosswordEntry) {
    setActiveEntryId(entry.id);
    const firstEmpty = entryCells(entry).find(({ row, col }) => !answers[cellKey(row, col)]) ?? entryCells(entry)[0];
    const key = cellKey(firstEmpty.row, firstEmpty.col);
    setSelectedCell(key);
    focusCell(key);
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

  function nextEntry(step: number) {
    const index = puzzle.entries.findIndex((entry) => entry.id === activeEntry.id);
    const next = puzzle.entries[(index + step + puzzle.entries.length) % puzzle.entries.length];
    selectEntry(next);
  }

  function toggleDirection() {
    if (!selectedCell) return;
    const cell = board.cells.get(selectedCell);
    if (!cell || cell.entryIds.length < 2) return;
    const currentIndex = cell.entryIds.indexOf(activeEntry.id);
    const nextId = cell.entryIds[(currentIndex + 1) % cell.entryIds.length];
    const next = puzzle.entries.find((entry) => entry.id === nextId);
    if (next) setActiveEntryId(next.id);
  }

  function revealCell() {
    if (!selectedCell || status === "solved") return;
    const cell = board.cells.get(selectedCell);
    if (!cell) return;
    setAnswers((current) => ({ ...current, [selectedCell]: cell.solution }));
    setWrongCells((current) => {
      const next = new Set(current);
      next.delete(selectedCell);
      return next;
    });
    setHints((current) => current + 1);
    setScore((current) => Math.max(0, current - 75));
    moveInEntry(selectedCell, 1);
  }

  function checkPuzzle() {
    if (status === "solved") {
      nextPuzzle();
      return;
    }
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
    setScore((current) => current + Math.max(300, 1200 - seconds * 2 - hints * 75));
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
    setSeconds(0);
    setHints(0);
    window.setTimeout(() => focusCell(firstKey), 0);
  }

  function handleCellKeys(event: KeyboardEvent<HTMLInputElement>, key: string) {
    if (soundEnabled && !event.repeat && (event.key.length === 1 || event.key === "Backspace")) onKeySound(event.code);
    if (event.key === "Enter") {
      event.preventDefault();
      checkPuzzle();
    } else if (event.key === "Tab") {
      event.preventDefault();
      nextEntry(event.shiftKey ? -1 : 1);
    } else if (event.key === " ") {
      event.preventDefault();
      toggleDirection();
    } else if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      revealCell();
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
  }

  const statusMessage = status === "solved"
    ? koreanUi ? "완성! Enter를 누르면 다음 퍼즐이 바로 시작됩니다." : "Solved! Press Enter to launch the next board."
    : status === "wrong"
      ? koreanUi ? "빨간 칸만 고치면 됩니다. 답은 지워지지 않았어요." : "Correct only the red cells. Your other answers stay."
      : status === "incomplete"
        ? koreanUi ? "빈칸으로 이동했습니다. 계속 입력하세요." : "Focus moved to the first empty cell. Keep typing."
        : koreanUi ? "한 음절씩 입력 · Enter로 검사 · Tab으로 다음 낱말" : "Type syllables · Enter checks · Tab moves to the next clue";

  return (
    <div className={`crossword-game-wrap ${status}`}>
      <div className="crossword-board-column">
        <div className="crossword-board-heading">
          <span>{koreanUi ? `퍼즐 ${puzzleIndex + 1}/${crosswordPuzzles.length}` : `BOARD ${puzzleIndex + 1}/${crosswordPuzzles.length}`}</span>
          <div><small>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</small><b>{correctCells}/{totalCells}</b></div>
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
            return (
              <label
                className={`crossword-cell ${activeCellKeys.has(key) ? "active-word" : ""} ${selectedCell === key ? "selected" : ""} ${wrongCells.has(key) ? "wrong" : ""} ${status === "solved" ? "correct" : ""}`}
                role="gridcell"
                key={key}
              >
                {number && <small>{number}</small>}
                <input
                  ref={(node) => { inputRefs.current[key] = node; }}
                  lang="ko"
                  value={answers[key] ?? ""}
                  disabled={status === "solved"}
                  aria-label={`${koreanUi ? "가로세로 칸" : "Crossword cell"} ${row + 1}, ${col + 1}`}
                  onFocus={() => activateCell(key)}
                  onClick={() => activateCell(key, selectedCell === key)}
                  onChange={(event) => updateCell(key, event.target.value, !event.nativeEvent.isComposing)}
                  onCompositionEnd={(event) => updateCell(key, event.currentTarget.value, true)}
                  onKeyDown={(event) => handleCellKeys(event, key)}
                />
              </label>
            );
          })}
          {status === "solved" && <div className="crossword-complete-stamp" aria-hidden="true"><span>PUZZLE</span><b>CLEAR!</b></div>}
        </div>
        <div className="crossword-direction-legend">
          <span><i className="across-arrow" aria-hidden="true">→</i>{koreanUi ? "가로" : "Across"}</span>
          <span><i className="down-arrow" aria-hidden="true">↓</i>{koreanUi ? "세로" : "Down"}</span>
          <span>{koreanUi ? "힌트" : "Hints"} <b>{hints}</b></span>
        </div>
      </div>

      <div className="demo-copy crossword-copy">
        <div className="puzzle-head"><p className="demo-label">CROSSWORD CIRCUIT · {puzzle.entries.length} WORDS</p><b>{score} PTS</b></div>
        <h3>{koreanUi ? puzzle.titleKo : puzzle.titleEn}</h3>
        <p className={`crossword-status ${status}`} aria-live="polite">{statusMessage}</p>

        <div className="active-clue-banner">
          <span>{board.numberByEntry.get(activeEntry.id)} {activeEntry.direction === "across" ? "→" : "↓"}</span>
          <div><small>{koreanUi ? "현재 낱말" : "ACTIVE CLUE"}</small><b>{koreanUi ? activeEntry.clueKo : activeEntry.clueEn}</b></div>
          <em>{Array.from(activeEntry.answer).length}{koreanUi ? "칸" : " cells"}</em>
        </div>

        <div className="crossword-clues">
          {(["across", "down"] as Direction[]).map((direction) => (
            <section key={direction}>
              <h4>{direction === "across" ? "→" : "↓"} {koreanUi ? direction === "across" ? "가로 낱말" : "세로 낱말" : direction === "across" ? "Across" : "Down"}</h4>
              {puzzle.entries.filter((entry) => entry.direction === direction).map((entry) => {
                const solved = entryCells(entry).every(({ row, col, solution }) => answers[cellKey(row, col)] === solution);
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
          <button className="button button-primary" type="button" onClick={checkPuzzle}>{status === "solved" ? koreanUi ? "다음 퍼즐" : "Next board" : koreanUi ? "정답 확인" : "Check board"} <kbd>Enter</kbd></button>
          <button className="crossword-clear" type="button" onClick={revealCell}>{koreanUi ? "현재 칸 힌트" : "Reveal cell"} <kbd>H</kbd></button>
        </div>
        <div className="game-key-help crossword-key-help">
          <span><kbd>Tab</kbd>{koreanUi ? "다음 낱말" : "next clue"}</span>
          <span><kbd>Space</kbd>{koreanUi ? "가로↔세로" : "toggle direction"}</span>
          <span><kbd>↑↓←→</kbd>{koreanUi ? "칸 이동" : "move"}</span>
        </div>
        <div className="puzzle-progress" aria-label={koreanUi ? "퍼즐 완성도" : "Puzzle progress"}><span style={{ width: `${(correctCells / totalCells) * 100}%` }} /></div>
      </div>
    </div>
  );
}
