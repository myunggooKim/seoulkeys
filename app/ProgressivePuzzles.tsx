"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cloneContentDeck, createContentDeck, drawFromContentDeck, type ContentDeck } from "./content-deck";
import { getTheme, type ThemeId, type ThemeWord } from "./content-themes";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type MissingPuzzle = {
  word: string;
  missingIndex: number;
  meaningKo: string;
  meaningEn: string;
  options: string[];
};

function numberChoiceIndex(event: { key: string; code: string }) {
  const physicalKey = /^(?:Digit|Numpad)([1-3])$/.exec(event.code)?.[1];
  const number = physicalKey ?? (/^[1-3]$/.test(event.key) ? event.key : "");
  return number ? Number(number) - 1 : null;
}

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
  [
    { word: "편의점", missingIndex: 1, options: ["에", "의", "이"], meaningKo: "간단한 물건을 언제든 살 수 있는 가게", meaningEn: "a convenience store" },
    { word: "한국여행", missingIndex: 2, options: ["요", "유", "여"], meaningKo: "한국의 여러 지역을 둘러보는 일", meaningEn: "travel in Korea" },
    { word: "사진촬영", missingIndex: 2, options: ["철", "찰", "촬"], meaningKo: "카메라로 모습을 기록하는 일", meaningEn: "taking a photograph" },
    { word: "길을잃었어요", missingIndex: 2, options: ["일", "잃", "읽"], meaningKo: "어디로 가야 할지 모를 때 하는 말", meaningEn: "I am lost" },
    { word: "예약했어요", missingIndex: 1, options: ["역", "약", "억"], meaningKo: "미리 자리나 시간을 정했을 때 하는 말", meaningEn: "I made a reservation" },
    { word: "얼마예요", missingIndex: 2, options: ["애", "에", "예"], meaningKo: "가격을 물을 때 하는 말", meaningEn: "How much is it?" },
  ],
  [
    { word: "처음뵙겠습니다", missingIndex: 2, options: ["봅", "뵙", "법"], meaningKo: "처음 만난 사람에게 정중히 하는 인사", meaningEn: "Pleased to meet you" },
    { word: "한국어공부", missingIndex: 3, options: ["궁", "공", "곰"], meaningKo: "한국의 언어를 배우는 일", meaningEn: "studying Korean" },
    { word: "대중교통카드", missingIndex: 2, options: ["규", "교", "겨"], meaningKo: "버스와 지하철에서 사용하는 카드", meaningEn: "a public transit card" },
    { word: "추천해주세요", missingIndex: 2, options: ["헤", "해", "혀"], meaningKo: "좋은 것을 골라 달라고 부탁하는 말", meaningEn: "Please recommend something" },
    { word: "사진찍어주세요", missingIndex: 2, options: ["직", "찍", "짚"], meaningKo: "사진 촬영을 부탁할 때 하는 말", meaningEn: "Please take a photo" },
    { word: "다시말씀해주세요", missingIndex: 2, options: ["멀", "말", "몰"], meaningKo: "한 번 더 말해 달라고 부탁하는 표현", meaningEn: "Please say that again" },
  ],
].map((level, levelIndex) => level.map((puzzle, puzzleIndex) => {
  const expected = Array.from(puzzle.word)[puzzle.missingIndex];
  const desiredAnswerPosition = (levelIndex * level.length + puzzleIndex) % 3;
  const options = puzzle.options.filter((option) => option !== expected);
  options.splice(desiredAnswerPosition, 0, expected);
  return validateMissingPuzzle({ ...puzzle, options });
}));

// ---------------------------------------------------------------------------
// Endless missing-letter generation
// ---------------------------------------------------------------------------
// The curated levels above are the warm-up. Past them the game generates fresh
// puzzles forever from a large word bank, with plausible "confusable" distractors
// built by swapping the vowel (or final consonant) of the correct syllable —
// so it never falls back into repeating the same final level.

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

function syllableParts(character: string): { initial: number; medial: number; final: number } | null {
  const code = character.codePointAt(0);
  if (code === undefined || code < HANGUL_BASE || code > HANGUL_LAST) return null;
  const offset = code - HANGUL_BASE;
  return { initial: Math.floor(offset / 588), medial: Math.floor((offset % 588) / 28), final: offset % 28 };
}

function composeSyllable(initial: number, medial: number, final: number): string {
  return String.fromCodePoint(HANGUL_BASE + initial * 588 + medial * 28 + final);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

// Two confusable wrong syllables for the given correct one.
function generateDistractors(expected: string): string[] | null {
  const parts = syllableParts(expected);
  if (!parts) return null;
  const candidates = new Set<string>();
  // Same consonant + final, different vowel — the most natural confusion.
  const vowelOrder = [0, 4, 8, 13, 18, 20, 1, 5, 2, 6, 9, 14];
  for (const medial of vowelOrder) {
    if (medial === parts.medial) continue;
    const candidate = composeSyllable(parts.initial, medial, parts.final);
    if (candidate !== expected) candidates.add(candidate);
    if (candidates.size >= 6) break;
  }
  // One final-consonant swap for extra variety.
  const finalOrder = parts.final === 0 ? [4, 21, 8, 16, 1] : [0, 4, 21];
  for (const final of finalOrder) {
    if (final === parts.final) continue;
    const candidate = composeSyllable(parts.initial, parts.medial, final);
    if (candidate !== expected) candidates.add(candidate);
  }
  const pool = shuffle([...candidates]);
  return pool.length >= 2 ? pool.slice(0, 2) : null;
}

type WordEntry = { word: string; meaningKo: string; meaningEn: string };

// General-purpose bank that keeps the endless rounds varied. Themed banks can be
// appended to this list as the concept tracks grow.
const generativeWordBank: WordEntry[] = [
  { word: "하늘", meaningKo: "머리 위로 펼쳐진 공간", meaningEn: "the sky" },
  { word: "바람", meaningKo: "흐르는 공기", meaningEn: "the wind" },
  { word: "구름", meaningKo: "하늘에 뜬 물방울 덩어리", meaningEn: "a cloud" },
  { word: "노을", meaningKo: "해질 때 붉게 물든 하늘", meaningEn: "a sunset glow" },
  { word: "바다", meaningKo: "넓고 푸른 물", meaningEn: "the sea" },
  { word: "강물", meaningKo: "흐르는 큰 물줄기", meaningEn: "river water" },
  { word: "나무", meaningKo: "가지와 잎이 있는 식물", meaningEn: "a tree" },
  { word: "꽃잎", meaningKo: "꽃을 이루는 한 장", meaningEn: "a petal" },
  { word: "가족", meaningKo: "함께 사는 식구", meaningEn: "family" },
  { word: "친구", meaningKo: "가깝게 지내는 사람", meaningEn: "a friend" },
  { word: "선물", meaningKo: "마음을 담아 주는 것", meaningEn: "a gift" },
  { word: "행복", meaningKo: "기쁘고 만족스러운 마음", meaningEn: "happiness" },
  { word: "사랑", meaningKo: "아끼고 좋아하는 마음", meaningEn: "love" },
  { word: "추억", meaningKo: "지난 일의 기억", meaningEn: "a memory" },
  { word: "노래", meaningKo: "가락에 맞춰 부르는 것", meaningEn: "a song" },
  { word: "춤사위", meaningKo: "춤의 몸짓", meaningEn: "a dance move" },
  { word: "커피", meaningKo: "볶은 원두로 내린 음료", meaningEn: "coffee" },
  { word: "김밥", meaningKo: "밥과 재료를 김으로 만 음식", meaningEn: "gimbap" },
  { word: "라면", meaningKo: "끓여 먹는 즉석 국수", meaningEn: "ramen" },
  { word: "시장", meaningKo: "물건을 사고파는 곳", meaningEn: "a market" },
  { word: "거리", meaningKo: "사람이 다니는 길", meaningEn: "a street" },
  { word: "공원", meaningKo: "쉬고 노는 넓은 터", meaningEn: "a park" },
  { word: "학교", meaningKo: "배우는 곳", meaningEn: "a school" },
  { word: "병원", meaningKo: "아픈 사람을 치료하는 곳", meaningEn: "a hospital" },
  { word: "은행", meaningKo: "돈을 맡기고 찾는 곳", meaningEn: "a bank" },
  { word: "우산", meaningKo: "비를 막는 도구", meaningEn: "an umbrella" },
  { word: "지갑", meaningKo: "돈을 넣는 작은 주머니", meaningEn: "a wallet" },
  { word: "안개", meaningKo: "낮게 낀 뿌연 공기", meaningEn: "fog" },
  { word: "무지개", meaningKo: "비 온 뒤 뜨는 일곱 빛", meaningEn: "a rainbow" },
  { word: "햇살", meaningKo: "내리쬐는 햇빛", meaningEn: "sunlight" },
  { word: "계절", meaningKo: "봄여름가을겨울의 때", meaningEn: "a season" },
  { word: "여행", meaningKo: "다른 곳을 다녀오는 일", meaningEn: "travel" },
  { word: "지도", meaningKo: "길을 그려 놓은 그림", meaningEn: "a map" },
  { word: "사진", meaningKo: "모습을 담은 그림", meaningEn: "a photo" },
  { word: "편지", meaningKo: "글로 전하는 소식", meaningEn: "a letter" },
  { word: "약속", meaningKo: "지키기로 한 다짐", meaningEn: "a promise" },
  { word: "용기", meaningKo: "두려움을 이기는 마음", meaningEn: "courage" },
  { word: "희망", meaningKo: "바라고 기대하는 마음", meaningEn: "hope" },
  { word: "미소", meaningKo: "가볍게 짓는 웃음", meaningEn: "a smile" },
  { word: "눈물", meaningKo: "눈에서 흐르는 물", meaningEn: "tears" },
  { word: "마음", meaningKo: "생각과 느낌이 있는 곳", meaningEn: "the heart" },
  { word: "목소리", meaningKo: "입에서 나는 소리", meaningEn: "a voice" },
  { word: "이야기", meaningKo: "주고받는 말이나 사연", meaningEn: "a story" },
  { word: "저녁노을", meaningKo: "저녁의 붉은 하늘", meaningEn: "an evening glow" },
  { word: "밤하늘", meaningKo: "밤의 하늘", meaningEn: "the night sky" },
  { word: "별자리", meaningKo: "별을 이은 모양", meaningEn: "a constellation" },
  { word: "골목길", meaningKo: "좁은 동네 길", meaningEn: "an alley" },
  { word: "기차역", meaningKo: "기차를 타고 내리는 곳", meaningEn: "a train station" },
  { word: "버스정류장", meaningKo: "버스를 기다리는 곳", meaningEn: "a bus stop" },
  { word: "도서관", meaningKo: "책을 읽고 빌리는 곳", meaningEn: "a library" },
  { word: "박물관", meaningKo: "유물을 전시하는 곳", meaningEn: "a museum" },
  { word: "미술관", meaningKo: "그림을 전시하는 곳", meaningEn: "an art gallery" },
  { word: "산책로", meaningKo: "걷기 좋은 길", meaningEn: "a walking path" },
];

function buildGeneratedPuzzle(entry: WordEntry): MissingPuzzle | null {
  const characters = Array.from(entry.word);
  const validIndices = characters
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => syllableParts(character))
    .map(({ index }) => index);
  if (!validIndices.length) return null;
  // Prefer blanking a non-first syllable so the word still has an anchor.
  const preferred = validIndices.length > 1 ? validIndices.filter((index) => index !== 0) : validIndices;
  for (const missingIndex of shuffle(preferred.length ? preferred : validIndices)) {
    const expected = characters[missingIndex];
    const distractors = generateDistractors(expected);
    if (distractors && distractors.length === 2) {
      return {
        word: entry.word,
        missingIndex,
        meaningKo: entry.meaningKo,
        meaningEn: entry.meaningEn,
        options: shuffle([expected, ...distractors]),
      };
    }
  }
  return null;
}

// A fresh 6-puzzle level drawn from the (shuffled) bank, difficulty rising with
// the level number by preferring longer words.
export function buildGeneratedLevel(
  levelNumber: number,
  bank: WordEntry[],
  deck: ContentDeck<WordEntry> = createContentDeck<WordEntry>(),
): MissingPuzzle[] {
  const minLength = Math.min(4, 2 + Math.floor(levelNumber / 3));
  const longEnough = bank.filter((entry) => Array.from(entry.word).length >= minLength);
  const source = longEnough.length >= 6 ? longEnough : bank;
  const puzzles: MissingPuzzle[] = [];
  const attempted = new Set<string>();
  while (attempted.size < new Set(source.map((entry) => entry.word)).size && puzzles.length < 6) {
    const entry = drawFromContentDeck(deck, source, (item) => item.word, attempted);
    attempted.add(entry.word);
    const puzzle = buildGeneratedPuzzle(entry);
    if (puzzle) puzzles.push(puzzle);
  }
  return puzzles.length ? puzzles : missingPuzzleLevels[missingPuzzleLevels.length - 1];
}

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
  {
    id: "business-network",
    titleKo: "한국 오피스",
    titleEn: "A Korean office",
    words: [
      { answer: "회사", clueKo: "일하는 조직", clueEn: "A company" },
      { answer: "사무실", clueKo: "사무를 보는 방", clueEn: "An office room" },
      { answer: "회의실", clueKo: "모여서 의논하는 방", clueEn: "A meeting room" },
      { answer: "의견", clueKo: "어떤 일에 대한 생각", clueEn: "An opinion" },
      { answer: "견적서", clueKo: "값을 미리 계산해 적은 문서", clueEn: "A price quote" },
      { answer: "계약서", clueKo: "약속을 적은 문서", clueEn: "A contract" },
      { answer: "약속", clueKo: "만나기로 정한 것", clueEn: "An appointment" },
      { answer: "담당자", clueKo: "그 일을 맡은 사람", clueEn: "The person in charge" },
      { answer: "당일", clueKo: "바로 그날", clueEn: "That same day" },
      { answer: "일정", clueKo: "해야 할 일의 시간표", clueEn: "A schedule" },
      { answer: "정보", clueKo: "알고 있으면 도움이 되는 내용", clueEn: "Information" },
      { answer: "보고서", clueKo: "결과를 정리한 글", clueEn: "A report" },
      { answer: "서류", clueKo: "일에 쓰는 문서", clueEn: "Documents" },
      { answer: "부서", clueKo: "회사를 나눈 조직 단위", clueEn: "A department" },
      { answer: "장부", clueKo: "돈의 드나듦을 적는 공책", clueEn: "An account book" },
      { answer: "사장님", clueKo: "회사를 이끄는 사람", clueEn: "The company boss" },
    ],
  },
];

// Each learning concept maps to a curated, syllable-chained crossword pool so the
// crossword matches the studied theme while still producing dense, solvable boards
// (the flat vocabulary banks don't share enough syllables to cross well).
const crosswordThemeByConcept: Record<string, string> = {
  travel: "travel-network",
  business: "business-network",
  friends: "culture-network",
  reading: "food-network",
};

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

  // Place remaining words in repeated passes: a word skipped early (nothing to
  // cross yet) is retried after later words land, so board density no longer
  // depends on word order. This lets us safely rotate the seed for variety
  // without producing sparse 2–3 word boards.
  const remaining = theme.words.slice(1);
  let placedSomething = true;
  while (placedSomething && remaining.length) {
    placedSomething = false;
    for (let position = 0; position < remaining.length;) {
      const seed = remaining[position];
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
      if (best) {
        place(seed, best.row, best.col, best.direction);
        remaining.splice(position, 1);
        placedSomething = true;
      } else {
        position += 1;
      }
    }
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

// Endless, varied boards: rotate the theme's word list per board so each visit
// (even to the same theme) yields a different seed word and layout, and give
// every board a unique id prefix so entry ids never collide across boards.
// Build every rotation of a word pool, then choose among the densest ones. This
// keeps each board well-connected while still cycling through different seed
// words/layouts so the game never repeats the same board.
function bestBoardFromPool(
  words: WordSeed[],
  id: string,
  titleKo: string,
  titleEn: string,
  cycle: number,
): CrosswordPuzzle {
  const usable = words.filter((seed) => Array.from(seed.answer).every((char) => syllableParts(char)));
  const pool = usable.length >= 4 ? usable : words;
  const candidates = Array.from({ length: pool.length }, (_, rotation) => {
    const rotated = [...pool.slice(rotation), ...pool.slice(0, rotation)];
    const board = createCrossword({ id: `${id}-r${rotation}`, titleKo, titleEn, words: rotated });
    return { board, placed: board.entries.length };
  }).sort((a, b) => b.placed - a.placed);
  const best = candidates[0]?.placed ?? 0;
  const dense = candidates.filter((candidate) => candidate.placed >= Math.max(best - 1, Math.ceil(best * 0.8)));
  return dense.length ? dense[cycle % dense.length].board : candidates[0].board;
}

export function makeCrosswordBoard(boardIndex: number): CrosswordPuzzle {
  const theme = crosswordThemes[boardIndex % crosswordThemes.length];
  const cycle = Math.floor(boardIndex / crosswordThemes.length);
  const chosen = bestBoardFromPool(theme.words, theme.id, theme.titleKo, theme.titleEn, cycle);
  return { ...chosen, id: `${theme.id}-b${boardIndex}` };
}

// A crossword board for the selected learning concept, using that concept's
// curated syllable-chained pool so the crossword matches the studied theme.
export function makeThemedCrosswordBoard(boardIndex: number, conceptId: string): CrosswordPuzzle {
  const poolId = crosswordThemeByConcept[conceptId];
  const theme = crosswordThemes.find((candidate) => candidate.id === poolId)
    ?? crosswordThemes[boardIndex % crosswordThemes.length];
  const concept = getTheme((conceptId in crosswordThemeByConcept ? conceptId : "travel") as ThemeId);
  const extraSeeds = concept.words.map((entry) => ({
    answer: entry.word,
    clueKo: entry.meaningKo,
    clueEn: entry.meaningEn,
  }));
  // Keep board construction fast while rotating through the full vocabulary
  // library. The proven connected core stays in every board; a different
  // 24-word window supplies fresh answers and clues on each round.
  const start = extraSeeds.length ? (boardIndex * 23) % extraSeeds.length : 0;
  const rotatingWindow = Array.from(
    { length: Math.min(24, extraSeeds.length) },
    (_, offset) => extraSeeds[(start + offset) % extraSeeds.length],
  );
  const words = [...new Map([...theme.words, ...rotatingWindow].map((seed) => [seed.answer, seed])).values()];
  const chosen = bestBoardFromPool(words, theme.id, theme.titleKo, theme.titleEn, boardIndex);
  return { ...chosen, id: `${theme.id}-c${boardIndex}` };
}

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

export function MissingLetterGame({ koreanUi, locale, soundEnabled, onSuccessSound, onKeySound, words }: {
  koreanUi: boolean; locale: Locale; soundEnabled: boolean; onSuccessSound: () => void; onKeySound: (code: string) => void;
  // Optional themed word bank used to generate endless puzzles.
  words?: ThemeWord[];
}) {
  // Generation bank: themed words when a concept is selected, else the general bank.
  const activeGenBank = useMemo(
    () => words && words.length ? words : generativeWordBank,
    [words],
  );
  const genBankRef = useRef<WordEntry[]>(activeGenBank);
  const [levelIndex, setLevelIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  // Every level is generated from the active (themed) bank, so the whole game
  // reflects the chosen concept from the very first word and never runs out.
  const [generation, setGeneration] = useState<{
    deck: ContentDeck<WordEntry>;
    levels: MissingPuzzle[][];
  }>(() => {
    const deck = createContentDeck<WordEntry>();
    return { deck, levels: [buildGeneratedLevel(0, activeGenBank, deck)] };
  });
  const [message, setMessage] = useState(tr(locale, "Type the missing syllable and press Enter.", "빠진 한 글자를 입력하고 Enter를 누르세요."));
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const puzzleStartedAt = useRef<number | null>(null);
  const didMountRef = useRef(false);
  const allLevels = generation.levels;
  const level = allLevels[levelIndex] ?? allLevels[0];
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

  // When the learner switches concept, restart with a fresh themed first level.
  useEffect(() => {
    genBankRef.current = activeGenBank;
    if (!didMountRef.current) { didMountRef.current = true; return; }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const deck = createContentDeck<WordEntry>();
    setGeneration({ deck, levels: [buildGeneratedLevel(0, activeGenBank, deck)] });
    setLevelIndex(0);
    setPuzzleIndex(0);
    setAnswer("");
    setLocked(false);
    setLevelUp(false);
  }, [activeGenBank]);

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
      setMessage(tr(locale, "Your answer stays. Correct it with Backspace and press Enter again.", "글자는 그대로 있어요. Backspace로 고치고 다시 Enter!"));
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
    setMessage(`${tr(locale, "Correct!", "정답!")} +${gained}${koreanUi ? "점" : ""} · ${tr(locale, "Keep your hands in place.", "손을 그대로 두세요.")}`);
    if (soundEnabled) onSuccessSound();
    if (isLevelEnd) setLevelUp(true);

    timerRef.current = window.setTimeout(() => {
      if (isLevelEnd) {
        const nextLevel = levelIndex + 1;
        // Make sure the next level exists — generate a fresh one on demand so
        // there is always something new after the curated levels.
        setGeneration((previous) => {
          if (nextLevel < previous.levels.length) return previous;
          const deck = cloneContentDeck(previous.deck);
          return {
            deck,
            levels: [...previous.levels, buildGeneratedLevel(nextLevel, genBankRef.current, deck)],
          };
        });
        setLevelIndex(nextLevel);
        setPuzzleIndex(0);
        setMessage(`${tr(locale, "Level", "단계")} ${nextLevel + 1}! ${tr(locale, "Fresh words keep coming.", "새로운 낱말이 계속 이어집니다.")}`);
      } else {
        setPuzzleIndex(puzzleIndex + 1);
        setMessage(tr(locale, "The next word is ready. Type now.", "다음 낱말이 준비됐어요. 바로 입력하세요."));
      }
      setAnswer("");
      setLocked(false);
      setLevelUp(false);
      window.setTimeout(focusInput, 0);
    }, isLevelEnd ? 1450 : 650);
  }

  return (
    <div className={`missing-demo progressive-puzzle level-${(levelIndex % 5) + 1}`} onKeyDownCapture={(event) => {
      const choiceIndex = numberChoiceIndex(event);
      if (choiceIndex !== null && !locked) {
        event.preventDefault();
        choose(puzzle.options[choiceIndex]);
      }
    }}>
      <div className="puzzle-head">
        <p className="demo-label">{koreanUi ? `빠진 글자 · ${levelIndex + 1}단계` : `${tr(locale, "MISSING BEAT")} · ${tr(locale, "LEVEL")} ${levelIndex + 1}`}</p>
        <div><span>{tr(locale, "ACC", "정확도")} <b>{accuracy}%</b></span><span>{tr(locale, "STREAK", "연속")} <b>×{streak}</b></span><span><b>{score}</b> {tr(locale, "PTS", "점")}</span></div>
      </div>
      <div className="missing-level-track">
        {Array.from({ length: 5 }, (_, offset) => {
          const windowStart = Math.max(0, levelIndex - 2);
          const index = windowStart + offset;
          return <span className={index < levelIndex ? "done" : index === levelIndex ? "current" : ""} key={index}>{index < levelIndex ? "✓" : index + 1}</span>;
        })}
        <i style={{ width: `${((puzzleIndex + (locked ? 1 : 0)) / level.length) * 100}%` }} />
      </div>
      <div className="missing-prompt">
        <small>{`${tr(locale, "WORD", "문제")} ${puzzleIndex + 1}/${level.length}`}</small>
        <h3>{tr(locale, puzzle.meaningEn, puzzle.meaningKo)}</h3>
      </div>
      <div className="missing-word" lang="ko">
        {characters.map((character, index) => index === puzzle.missingIndex
          ? <span className={locked ? "correct" : ""} key={index}>{answer || "?"}</span>
          : <b key={index}>{character}</b>)}
      </div>
      <label className="missing-input-label" htmlFor="missing-letter-input">{tr(locale, "Missing syllable", "빠진 글자")}</label>
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
        onBlur={(event) => {
          // Release focus if the user moved to another control; only re-grab
          // when focus was lost to nowhere so clicking away isn't trapped.
          if (event.relatedTarget) return;
          if (!locked) window.setTimeout(focusInput, 0);
        }}
        autoComplete="off"
        spellCheck={false}
      />
      <div className="number-finger-guide" role="note" aria-label={tr(locale, "Finger guide for number keys 1, 2, and 3", "숫자 1, 2, 3 손가락 안내")}>
        <p>{tr(locale, "Keep your left hand ready on the number row", "왼손을 숫자열에 준비하세요")}</p>
        <div>
          <span><i className="finger-tip pinky" /><kbd>1</kbd><b>{tr(locale, "Pinky", "새끼")}</b></span>
          <span><i className="finger-tip ring" /><kbd>2</kbd><b>{tr(locale, "Ring", "약지")}</b></span>
          <span><i className="finger-tip middle" /><kbd>3</kbd><b>{tr(locale, "Middle", "가운데")}</b></span>
        </div>
        <small>{tr(locale, "Choose with 1·2·3 and press Enter—no mouse needed", "마우스 없이 1·2·3으로 고르고 Enter로 확인")}</small>
      </div>
      <div className="answer-options" aria-label={tr(locale, "Missing syllable choices", "빠진 글자 후보")}>
        {puzzle.options.map((option, index) => (
          <button type="button" disabled={locked} className={answer === option ? "chosen" : ""} onClick={() => choose(option)} key={option}><kbd>{index + 1}</kbd>{option}</button>
        ))}
      </div>
      <p className={`form-message ${locked ? "success" : ""}`} aria-live="polite">{message}</p>
      <div className="game-key-help"><span><kbd>1–3</kbd>{tr(locale, "choose", "후보 선택")}</span><span><kbd>Enter</kbd>{tr(locale, "check", "정답 확인")}</span><span><kbd>⌫</kbd>{tr(locale, "correct", "고치기")}</span></div>
      {levelUp && <div className="missing-level-up" role="status"><span>{tr(locale, "LEVEL", "단계")}</span><b>{levelIndex + 1} {tr(locale, "CLEAR!", "단계 완료!")}</b><small>{tr(locale, "Next level unlocked", "다음 단계가 열립니다")}</small></div>}
    </div>
  );
}
