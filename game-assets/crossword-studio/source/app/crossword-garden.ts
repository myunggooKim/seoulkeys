import { cellKey, entryCells, makeCrosswordBoard, makeThemedCrosswordBoard, type CrosswordEntry, type CrosswordPuzzle } from './ProgressivePuzzles';

export const gardenSeasons = [
  { en: 'The shape of a word', ko: '낱말이 모이는 순간', noteEn: 'Connect a word. Open a new world.', noteKo: '낱말을 연결하고 새로운 세계를 열어요.', icon: '01' },
  { en: 'A new connection', ko: '새로운 연결', noteEn: 'Your next discovery is one word away.', noteKo: '다음 발견까지, 낱말 하나.', icon: '02' },
  { en: 'A little more fluent', ko: '조금 더 자연스럽게', noteEn: 'Familiar words. New connections.', noteKo: '익숙한 낱말로 새로운 연결을 만들어요.', icon: '03' },
  { en: 'Words that stay with you', ko: '기억에 남는 낱말', noteEn: 'Make a little room for a new word.', noteKo: '새로운 낱말이 머물 자리를 만들어 보세요.', icon: '04' },
] as const;

function bounds(entries: CrosswordEntry[]) {
  const cells = entries.flatMap(entryCells);
  const minRow = Math.min(...cells.map(c => c.row)), minCol = Math.min(...cells.map(c => c.col));
  const rows = Math.max(...cells.map(c => c.row)) - minRow + 1;
  const cols = Math.max(...cells.map(c => c.col)) - minCol + 1;
  return { minRow, minCol, rows, cols, size: Math.max(rows, cols) };
}

/** Keep a connected, compact part of an existing valid board. No shared generator edits. */
export function compactGardenBoard(puzzle: CrosswordPuzzle, count = 6): CrosswordPuzzle {
  const keys = new Map(puzzle.entries.map(e => [e.id, new Set(entryCells(e).map(c => cellKey(c.row, c.col)))]));
  let best: CrosswordEntry[] = [];
  let bestScore = Infinity;
  for (const seed of puzzle.entries) {
    const selected = [seed];
    while (selected.length < Math.min(count, puzzle.entries.length)) {
      const occupied = new Set(selected.flatMap(e => [...keys.get(e.id)!]));
      const candidates = puzzle.entries.filter(e => !selected.includes(e) && [...keys.get(e.id)!].some(k => occupied.has(k)));
      candidates.sort((a, b) => {
        const x = bounds([...selected, a]), y = bounds([...selected, b]);
        return (x.size * 100 + x.rows * x.cols) - (y.size * 100 + y.rows * y.cols);
      });
      if (!candidates[0]) break;
      selected.push(candidates[0]);
    }
    const b = bounds(selected);
    const score = (count - selected.length) * 10000 + b.size * 100 + b.rows * b.cols;
    if (score < bestScore) { best = selected; bestScore = score; }
  }
  const b = bounds(best);
  return { ...puzzle, size: b.size, entries: best.map(e => ({ ...e, row: e.row - b.minRow, col: e.col - b.minCol })) };
}

export function makeGardenBoard(index: number, themeId?: string): CrosswordPuzzle {
  const original = themeId ? makeThemedCrosswordBoard(index, themeId) : makeCrosswordBoard(index);
  // Six words are a short, achievable session; later gardens gently add one.
  return compactGardenBoard(original, index < 3 ? 6 : 7);
}

export type GardenProgress = {
  version: 2; index: number; score: number; stars: number; best: number;
  words: Array<Pick<CrosswordEntry, 'answer' | 'clueEn' | 'clueKo'>>;
};
export function readGardenProgress(raw: string | null): GardenProgress | null {
  try {
    if (!raw || raw.length > 250000) return null;
    const value = JSON.parse(raw);
    if (!value || value.version !== 2 || !Array.isArray(value.words)) return null;
    for (const key of ['index', 'score', 'stars', 'best']) if (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > 10000000) return null;
    if (value.index > 10000 || value.words.length > 500) return null;
    if (value.words.some((w: Record<string, unknown>) => !w || typeof w.answer !== 'string' || !/^[가-힣]{1,20}$/.test(w.answer) || typeof w.clueEn !== 'string' || w.clueEn.length > 300 || typeof w.clueKo !== 'string' || w.clueKo.length > 300)) return null;
    return { version: 2, index: value.index, score: value.score, stars: value.stars, best: value.best, words: value.words.map((w: GardenProgress["words"][number]) => ({ answer: w.answer, clueEn: w.clueEn, clueKo: w.clueKo })) };
  } catch { return null; }
}
