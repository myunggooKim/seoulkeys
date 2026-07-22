export type LessonEvaluation = {
  accepted: boolean;
  completeness: number;
  accuracy: number;
  label: string;
  message: string;
};

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function evaluateLessonAttempt(
  typed: string,
  target: string,
  keystrokes: number,
  mistakes: number,
): LessonEvaluation {
  const typedLength = Array.from(typed).length;
  const targetLength = Math.max(1, Array.from(target).length);
  const completeness = clampPercentage((typedLength / targetLength) * 100);
  const accuracy = keystrokes === 0
    ? 100
    : clampPercentage(((keystrokes - mistakes) / keystrokes) * 100);

  if (typed !== target) {
    const targetWithoutPeriod = target.endsWith(".") ? target.slice(0, -1) : target;
    const missingPeriod = target.endsWith(".") && typed === targetWithoutPeriod;
    return {
      accepted: false,
      completeness: missingPeriod ? 99 : completeness,
      accuracy,
      label: missingPeriod ? "마침표가 필요해요" : "문장을 다시 확인해요",
      message: missingPeriod
        ? "마침표까지 입력한 뒤 Enter를 눌러 주세요."
        : "띄어쓰기와 글자를 고친 뒤 Enter를 다시 눌러 주세요.",
    };
  }

  const label = accuracy >= 98
    ? "Perfect Beat"
    : accuracy >= 90
      ? "Great Rhythm"
      : accuracy >= 80
        ? "Nice Progress"
        : "Keep Practicing";

  return {
    accepted: true,
    completeness: 100,
    accuracy,
    label,
    message: "검사 완료 · 타자기 소리 후 발음을 읽고 다음 문장으로 이동합니다.",
  };
}
