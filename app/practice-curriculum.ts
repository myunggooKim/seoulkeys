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

export const sentencePracticeItems = [
  "저는 음악을 좋아해요.",
  "오늘은 기분이 좋아요.",
  "저는 매일 한국어를 연습해요.",
  "천천히 말씀해 주세요.",
  "친구와 함께 여행하고 싶어요.",
];

export const practiceCurriculum: PracticeItem[] = [
  {
    id: "home-left-1", kind: "home", stageKo: "기본자리", stageEn: "Home row",
    instructionKo: "왼손 기본자리 ㅁ·ㄴ을 같은 손가락으로 천천히 반복하세요.",
    instructionEn: "Repeat the left-hand home keys ㅁ and ㄴ without looking down.",
    text: "ㅁㄴㅁㄴ ㅁㄴㅁㄴ", minAccuracy: 90, speak: false,
  },
  {
    id: "home-left-2", kind: "home", stageKo: "기본자리", stageEn: "Home row",
    instructionKo: "왼손 가운데·검지 자리인 ㅇ·ㄹ을 반복하세요.",
    instructionEn: "Repeat the left-hand ㅇ and ㄹ keys with the shown fingertips.",
    text: "ㅇㄹㅇㄹ ㅇㄹㅇㄹ", minAccuracy: 90, speak: false,
  },
  {
    id: "home-right-1", kind: "home", stageKo: "기본자리", stageEn: "Home row",
    instructionKo: "오른손 기본자리 모음 ㅓ·ㅏ를 번갈아 입력하세요.",
    instructionEn: "Alternate the right-hand home vowels ㅓ and ㅏ.",
    text: "ㅓㅏㅓㅏ ㅓㅏㅓㅏ", minAccuracy: 90, speak: false,
  },
  {
    id: "home-right-2", kind: "home", stageKo: "기본자리", stageEn: "Home row",
    instructionKo: "오른손 약지와 새끼손가락으로 ㅣ와 ; 자리를 익히세요.",
    instructionEn: "Learn the ㅣ and semicolon positions with your right hand.",
    text: "ㅣ;ㅣ; ㅣ;ㅣ;", minAccuracy: 90, speak: false,
  },
  {
    id: "home-all", kind: "home", stageKo: "기본자리", stageEn: "Home row",
    instructionKo: "기본자리 여덟 키를 왼손에서 오른손 순서로 연결하세요.",
    instructionEn: "Connect all eight home-row positions from left to right.",
    text: "ㅁㄴㅇㄹ ㅓㅏㅣ;", minAccuracy: 92, speak: false,
  },
  {
    id: "syllable-a", kind: "syllable", stageKo: "자음+모음", stageEn: "Syllables",
    instructionKo: "기본자리 자음과 ㅏ를 합쳐 한 음절씩 입력하세요.",
    instructionEn: "Combine home-row consonants with ㅏ, one syllable at a time.",
    text: "마 나 아 라", minAccuracy: 90, speak: true,
  },
  {
    id: "syllable-eo", kind: "syllable", stageKo: "자음+모음", stageEn: "Syllables",
    instructionKo: "이번에는 ㅓ 모음을 붙여 음절을 만드세요.",
    instructionEn: "Add the vowel ㅓ to build another syllable pattern.",
    text: "머 너 어 러", minAccuracy: 90, speak: true,
  },
  {
    id: "syllable-i", kind: "syllable", stageKo: "자음+모음", stageEn: "Syllables",
    instructionKo: "ㅣ 모음으로 기본 음절을 완성하세요.",
    instructionEn: "Complete the home-row syllables with the vowel ㅣ.",
    text: "미 니 이 리", minAccuracy: 90, speak: true,
  },
  {
    id: "batchim-n", kind: "batchim", stageKo: "받침", stageEn: "Final consonants",
    instructionKo: "마지막 자음을 한 번 더 눌러 ㄴ 받침을 익히세요.",
    instructionEn: "Add ㄴ as the final consonant and keep the rhythm even.",
    text: "만 난 안 란", minAccuracy: 88, speak: true,
  },
  {
    id: "batchim-l", kind: "batchim", stageKo: "받침", stageEn: "Final consonants",
    instructionKo: "ㄹ 받침이 붙은 음절을 같은 속도로 입력하세요.",
    instructionEn: "Practice syllables ending in ㄹ at a steady pace.",
    text: "말 날 알 랄", minAccuracy: 88, speak: true,
  },
  {
    id: "double-basic", kind: "double", stageKo: "쌍자음·확장", stageEn: "Double consonants",
    instructionKo: "Shift와 함께 쌍자음을 입력하세요. 속도보다 정확도가 먼저입니다.",
    instructionEn: "Use Shift for double consonants. Accuracy comes before speed.",
    text: "까 따 빠 싸 짜", minAccuracy: 85, speak: true,
  },
  {
    id: "double-words", kind: "double", stageKo: "쌍자음·확장", stageEn: "Double consonants",
    instructionKo: "쌍자음이 들어간 짧은 낱말로 손가락 이동을 연결하세요.",
    instructionEn: "Connect the movement with short words containing double consonants.",
    text: "아빠 토끼 쓰다", minAccuracy: 85, speak: true,
  },
  {
    id: "word-1", kind: "word", stageKo: "낱말", stageEn: "Words",
    instructionKo: "이제 익힌 음절을 실제 낱말로 연결하세요.",
    instructionEn: "Turn the syllables you learned into real Korean words.",
    text: "나라 머리 안녕", minAccuracy: 90, speak: true,
  },
  {
    id: "word-2", kind: "word", stageKo: "낱말", stageEn: "Words",
    instructionKo: "띄어쓰기까지 정확하게 입력해 낱말 리듬을 익히세요.",
    instructionEn: "Keep the spaces exact while building a word rhythm.",
    text: "친구 음악 여행", minAccuracy: 90, speak: true,
  },
  ...sentencePracticeItems.map((text, index): PracticeItem => ({
    id: `sentence-${index + 1}`,
    kind: "sentence",
    stageKo: "짧은 문장",
    stageEn: "Short sentences",
    instructionKo: "마침표까지 입력한 뒤 Enter를 눌러 검사하세요.",
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
  sentence: { ko: "문장", en: "Sentences" },
};
