export type PracticeKind = "home" | "syllable" | "batchim" | "double" | "word" | "sentence";

export type PracticeItem = {
  id: string;
  kind: PracticeKind;
  stageKo: string;
  stageEn: string;
  instructionKo: string;
  instructionEn: string;
  text: string;
  minAccuracy: number;
  speak: boolean;
};

type WordGroup = {
  idPrefix: string;
  kind: Exclude<PracticeKind, "sentence">;
  stageKo: string;
  stageEn: string;
  instructionKo: string;
  instructionEn: string;
  words: readonly string[];
  minAccuracy: number;
};

function wordGroupItems(group: WordGroup): PracticeItem[] {
  return group.words.map((text, index) => ({
    id: `${group.idPrefix}-${String(index + 1).padStart(2, "0")}`,
    kind: group.kind,
    stageKo: group.stageKo,
    stageEn: group.stageEn,
    instructionKo: group.instructionKo,
    instructionEn: group.instructionEn,
    text,
    minAccuracy: group.minAccuracy,
    speak: true,
  }));
}

/**
 * Every pre-sentence exercise is one real Korean word.
 *
 * The groups are deliberately cumulative: learners spend a full run on the
 * home row, add the upper row, add the lower row, and only then meet final and
 * double consonants. This keeps the hand map predictable while each word is
 * submitted explicitly with Enter.
 */
export const progressiveWordGroups: readonly WordGroup[] = [
  {
    idPrefix: "home-core",
    kind: "home",
    stageKo: "기본자리",
    stageEn: "Home row",
    instructionKo: "기본자리 ㅁ·ㄴ·ㅇ·ㄹ·ㅎ / ㅗ·ㅓ·ㅏ·ㅣ 조합 단어입니다. 한 단어를 입력하고 Enter로 확인하세요.",
    instructionEn: "Practice one word built only from the first home-row keys, then press Enter to check it.",
    words: ["하마", "나라", "머리", "오리", "허리", "미리", "이마", "아마", "어머니", "나이", "오이", "모이"],
    minAccuracy: 95,
  },
  {
    idPrefix: "syllable-upper",
    kind: "syllable",
    stageKo: "자음+모음",
    stageEn: "Syllables",
    instructionKo: "기본자리에 윗줄 ㅂ·ㅈ·ㄷ·ㄱ·ㅅ / ㅛ·ㅕ·ㅑ·ㅐ·ㅔ를 더한 단어입니다. 한 단어씩 Enter로 확인하세요.",
    instructionEn: "Add the upper-row consonants and vowels. Type one word and press Enter before the next.",
    words: ["바다", "사자", "가게", "제비", "자매", "개미", "아기", "소리", "여자", "고래", "다리", "노래"],
    minAccuracy: 94,
  },
  {
    idPrefix: "syllable-lower",
    kind: "syllable",
    stageKo: "자음+모음",
    stageEn: "Syllables",
    instructionKo: "아랫줄 ㅋ·ㅌ·ㅊ·ㅍ / ㅠ·ㅜ·ㅡ까지 더한 단어입니다. 한 단어씩 Enter로 확인하세요.",
    instructionEn: "Now add the lower row. Complete one word and confirm it with Enter.",
    words: ["나무", "우유", "구두", "치마", "포도", "타조", "커피", "기차", "쿠키", "주머니", "고추", "파도"],
    minAccuracy: 94,
  },
  {
    idPrefix: "batchim-sonorant",
    kind: "batchim",
    stageKo: "받침",
    stageEn: "Final consonants",
    instructionKo: "ㄴ·ㄹ·ㅁ·ㅇ 받침이 들어간 짧은 단어입니다. 받침까지 입력한 뒤 Enter로 확인하세요.",
    instructionEn: "Practice one short word with a ㄴ, ㄹ, ㅁ, or ㅇ final, then press Enter.",
    words: ["산", "달", "밤", "공", "문", "눈", "몸", "강", "방", "길", "봄", "별"],
    minAccuracy: 93,
  },
  {
    idPrefix: "batchim-obstruent",
    kind: "batchim",
    stageKo: "받침",
    stageEn: "Final consonants",
    instructionKo: "ㄱ·ㅂ·ㅅ·ㅈ·ㅊ·ㅌ·ㅍ·ㅎ 받침 단어입니다. 한 단어씩 정확하게 입력하고 Enter를 누르세요.",
    instructionEn: "Practice one word with a firm final consonant and confirm it with Enter.",
    words: ["책", "밥", "옷", "맛", "빛", "국", "숲", "낮", "낯", "밭", "앞", "히읗"],
    minAccuracy: 93,
  },
  {
    idPrefix: "double-core",
    kind: "double",
    stageKo: "쌍자음·확장",
    stageEn: "Double consonants",
    instructionKo: "쌍자음이 들어간 단어 하나를 완성한 뒤 Enter로 확인하세요. 오답은 남아 있으니 바로 고칠 수 있습니다.",
    instructionEn: "Complete one double-consonant word, then press Enter. An incorrect word stays so you can fix it.",
    words: ["까치", "토끼", "아빠", "쓰다", "찌개", "뿌리", "짜장", "쑥", "딸기", "꼬마", "빨리", "깨끗"],
    minAccuracy: 92,
  },
  {
    idPrefix: "word-core",
    kind: "word",
    stageKo: "낱말",
    stageEn: "Words",
    instructionKo: "실생활 핵심 낱말을 하나씩 입력하고 Enter로 확인하세요.",
    instructionEn: "Type one useful everyday Korean word and press Enter to check it.",
    words: ["한국", "서울", "여행", "친구", "음악", "사진", "행복", "자연", "도서관", "컴퓨터", "스마트폰", "비행기", "지하철", "학교", "이야기"],
    minAccuracy: 94,
  },
] as const;

export const sentencePracticeItems = [
  "저는 음악을 좋아해요.",
  "오늘은 기분이 참 좋아요.",
  "저는 매일 한국어를 연습해요.",
  "친절하게 말씀해 주셔서 감사합니다.",
  "친구와 함께 한국을 여행하고 싶어요.",
  "맛있는 음식을 먹으러 가요.",
  "새로운 꿈을 향해 나아갑니다.",
  "아름다운 자연 속에서 쉬어가요.",
  "서로 돕고 살아가는 따뜻한 세상이에요.",
  "오늘도 최선을 다해 노력해요.",
  "웃음이 가득한 하루를 보내세요.",
  "희망찬 미래를 위해 차근차근 배워요.",
  "배움의 기쁨은 평생의 보물입니다.",
  "차 한 잔의 여유를 즐깁니다.",
  "오늘의 경험이 내일의 자산이 됩니다.",
];

export const practiceCurriculum: PracticeItem[] = [
  ...progressiveWordGroups.flatMap(wordGroupItems),
  ...sentencePracticeItems.map((text, index): PracticeItem => ({
    id: `sentence-${index + 1}`,
    kind: "sentence",
    stageKo: "짧은 문장",
    stageEn: "Short sentences",
    instructionKo: "마침표까지 정확하게 타이핑하고 Enter 키로 검사하세요.",
    instructionEn: "Type through the period, then press Enter for the check.",
    text,
    minAccuracy: 90,
    speak: true,
  })),
];

export const practiceStageOrder: PracticeKind[] = ["home", "syllable", "batchim", "double", "word", "sentence"];

export const practiceStageLabels: Record<PracticeKind, { ko: string; en: string }> = {
  home: { ko: "기본자리", en: "Home row" },
  syllable: { ko: "자음+모음", en: "Syllables" },
  batchim: { ko: "받침", en: "Finals" },
  double: { ko: "쌍자음", en: "Double" },
  word: { ko: "낱말", en: "Words" },
  sentence: { ko: "짧은 문장", en: "Sentences" },
};
