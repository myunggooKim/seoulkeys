/** Session rules are untimed: support is available without taking away progress. */
export function crosswordStars(hints: number, revealedAnswers: number, mistakes: number): number {
  return 1 + Number(revealedAnswers === 0) + Number(hints === 0 && revealedAnswers === 0 && mistakes === 0);
}

export function crosswordWordReward(streak: number, assisted: boolean): number {
  return assisted ? 100 : 160 + Math.min(Math.max(streak, 1), 5) * 20;
}

export function crosswordChapter(boardIndex: number) {
  return { chapter: Math.floor(boardIndex / 3) + 1, stop: boardIndex % 3 };
}
