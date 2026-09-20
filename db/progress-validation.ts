export type ProgressUpdate = {
  currentLesson: number;
  completedSentences: number;
  totalSentences: number;
  typingSeconds: number;
  accuracy: number;
  typedChars: number;
  lessonFinished: boolean;
};

export type StoredProgress = {
  currentLesson: number;
  completedSentences: number;
  totalSentences: number;
  typingSeconds: number;
  accuracy: number;
  typedChars: number;
  lessonFinished: boolean;
  awardedXp: number;
};

const MAX_CURRICULUM_STEPS = 200;
const MAX_TYPING_SECONDS_PER_SYNC = 6 * 60 * 60;
/* The character total is shown publicly on the home page, which makes it worth
   forging. It only ever moves forward, and by no more than a fast typist could
   manage between two saves. */
const MAX_TYPED_CHARS_PER_SYNC = 5_000;

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Treat progress sent by the browser as a claim, not as an authority.
 *
 * A legitimate client saves after each completed step, so the server accepts
 * at most one new completion per request and derives the finish flag itself.
 * This prevents a single forged request from minting an arbitrary amount of XP.
 */
export function validateProgressUpdate(current: StoredProgress, update: ProgressUpdate) {
  const totalSentences = clampInteger(update.totalSentences, 1, MAX_CURRICULUM_STEPS);
  const storedCompleted = current.totalSentences === totalSentences
    ? clampInteger(current.completedSentences, 0, totalSentences)
    : Math.min(current.completedSentences, totalSentences);
  const requestedCompleted = clampInteger(update.completedSentences, 0, totalSentences);
  const completedSentences = Math.max(
    storedCompleted,
    Math.min(requestedCompleted, storedCompleted + 1),
  );
  const lessonFinished = current.lessonFinished
    || (Boolean(update.lessonFinished) && completedSentences === totalSentences);
  const targetXp = completedSentences * 100 + (lessonFinished ? 500 : 0);

  return {
    currentLesson: clampInteger(update.currentLesson, 0, totalSentences - 1),
    completedSentences,
    totalSentences,
    typingSeconds: Math.max(
      current.typingSeconds,
      Math.min(
        Math.max(0, Math.round(update.typingSeconds)),
        current.typingSeconds + MAX_TYPING_SECONDS_PER_SYNC,
      ),
    ),
    accuracy: clampInteger(update.accuracy, 0, 100),
    typedChars: Math.max(
      current.typedChars,
      Math.min(
        Math.max(0, Math.round(update.typedChars)),
        current.typedChars + MAX_TYPED_CHARS_PER_SYNC,
      ),
    ),
    lessonFinished,
    targetXp,
    xpDelta: Math.max(0, targetXp - current.awardedXp),
  };
}
