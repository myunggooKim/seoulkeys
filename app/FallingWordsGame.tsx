"use client";

import { HangulInput } from "./HangulTypingField";
import { isImeKey } from "./browser-hangul-input";

import { type CSSProperties, FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ThemeWord } from "./content-themes";
import { createContentDeck, drawFromContentDeck } from "./content-deck";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type FallingWord = {
  id: number;
  korean: string;
  meaning: string;
  x: number;
  y: number;
  speed: number;
  lane: number;
};

type RetroAudioEngine = {
  context: AudioContext;
  music: GainNode;
  effects: GainNode;
  timer: number;
  step: number;
};

type CaptureBurst = {
  id: number;
  x: number;
  y: number;
  text: string;
  combo: number;
  word: string;
};

const wordBank = [
  { korean: "사랑", meaning: "love", difficulty: 1 }, { korean: "음악", meaning: "music", difficulty: 1 },
  { korean: "친구", meaning: "friend", difficulty: 1 }, { korean: "한국", meaning: "Korea", difficulty: 1 },
  { korean: "여행", meaning: "travel", difficulty: 1 }, { korean: "바다", meaning: "sea", difficulty: 1 },
  { korean: "하늘", meaning: "sky", difficulty: 1 }, { korean: "노래", meaning: "song", difficulty: 1 },
  { korean: "마음", meaning: "heart", difficulty: 1 }, { korean: "오늘", meaning: "today", difficulty: 1 },
  { korean: "안녕", meaning: "hello", difficulty: 1 }, { korean: "별빛", meaning: "starlight", difficulty: 1 },
  { korean: "한글", meaning: "Hangul", difficulty: 1 }, { korean: "기차", meaning: "train", difficulty: 1 },
  { korean: "공항", meaning: "airport", difficulty: 1 }, { korean: "사진", meaning: "photo", difficulty: 1 },
  { korean: "음식", meaning: "food", difficulty: 1 }, { korean: "영화", meaning: "movie", difficulty: 1 },
  { korean: "커피", meaning: "coffee", difficulty: 1 }, { korean: "학교", meaning: "school", difficulty: 1 },
  { korean: "가족", meaning: "family", difficulty: 1 }, { korean: "봄날", meaning: "spring day", difficulty: 1 },
  { korean: "겨울", meaning: "winter", difficulty: 1 }, { korean: "여름", meaning: "summer", difficulty: 1 },
  { korean: "가을", meaning: "autumn", difficulty: 1 }, { korean: "행복", meaning: "happiness", difficulty: 1 },
  { korean: "약속", meaning: "promise", difficulty: 1 }, { korean: "시간", meaning: "time", difficulty: 1 },
  { korean: "거리", meaning: "street", difficulty: 1 }, { korean: "도시", meaning: "city", difficulty: 1 },
  { korean: "미소", meaning: "smile", difficulty: 1 }, { korean: "소원", meaning: "wish", difficulty: 1 },
  { korean: "드라마", meaning: "drama", difficulty: 2 }, { korean: "설렘", meaning: "flutter", difficulty: 2 },
  { korean: "꿈꾸다", meaning: "to dream", difficulty: 2 }, { korean: "반가워", meaning: "nice to meet you", difficulty: 2 },
  { korean: "고마워", meaning: "thank you", difficulty: 2 }, { korean: "서울역", meaning: "Seoul Station", difficulty: 2 },
  { korean: "지하철", meaning: "subway", difficulty: 2 }, { korean: "비행기", meaning: "airplane", difficulty: 2 },
  { korean: "떡볶이", meaning: "tteokbokki", difficulty: 2 }, { korean: "김치찌개", meaning: "kimchi stew", difficulty: 2 },
  { korean: "불고기", meaning: "bulgogi", difficulty: 2 }, { korean: "박물관", meaning: "museum", difficulty: 2 },
  { korean: "편의점", meaning: "convenience store", difficulty: 2 }, { korean: "화장실", meaning: "restroom", difficulty: 2 },
  { korean: "여권", meaning: "passport", difficulty: 2 }, { korean: "숙소", meaning: "lodging", difficulty: 2 },
  { korean: "표지판", meaning: "signboard", difficulty: 2 }, { korean: "한강공원", meaning: "Han River park", difficulty: 2 },
  { korean: "괜찮아요", meaning: "it is okay", difficulty: 3 }, { korean: "안녕하세요", meaning: "hello", difficulty: 3 },
  { korean: "감사합니다", meaning: "thank you", difficulty: 3 }, { korean: "보고싶어요", meaning: "I miss you", difficulty: 3 },
  { korean: "도와주세요", meaning: "please help me", difficulty: 3 }, { korean: "얼마예요", meaning: "how much is it", difficulty: 3 },
  { korean: "맛있어요", meaning: "it is delicious", difficulty: 3 }, { korean: "처음뵙겠습니다", meaning: "pleased to meet you", difficulty: 3 },
];

const lanePositions = [11, 27, 43, 59, 75, 88];
const MAX_LIVES = 5;
const CAUGHT_PER_LEVEL = 7;
const RETRO_STEP_MS = 145;

function audioContextConstructor() {
  return window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function synthTone(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "square",
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noiseHit(context: AudioContext, output: AudioNode, start: number, duration: number, volume: number) {
  const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1280, start);
  filter.frequency.exponentialRampToValueAtTime(240, start + duration);
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  source.connect(filter).connect(gain).connect(output);
  source.start(start);
  source.stop(start + duration);
}

export function FallingWordsGame({ locale, soundEnabled, onSuccessSound, onKeySound, suspended = false, themeWords }: {
  koreanUi: boolean;
  locale: Locale;
  soundEnabled: boolean;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
  suspended?: boolean;
  themeWords?: ThemeWord[];
}) {
  const activeBank = useMemo(() => (themeWords && themeWords.length
    ? themeWords.map((entry) => ({ korean: entry.word, meaning: tr(locale, entry.meaningEn, entry.meaningKo), difficulty: entry.difficulty ?? 1 }))
    : wordBank.map((entry) => ({ ...entry, meaning: tr(locale, entry.meaning) }))), [locale, themeWords]);
  const bankRef = useRef(activeBank);
  const wordDeckRef = useRef(createContentDeck<(typeof activeBank)[number]>());
  useEffect(() => {
    bankRef.current = activeBank;
    wordDeckRef.current = createContentDeck();
  }, [activeBank]);
  const nextId = useRef(4);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const missesRef = useRef(0);
  const burstTimerRef = useRef<number | null>(null);
  const shockTimerRef = useRef<number | null>(null);
  const waveTimerRef = useRef<number | null>(null);
  const gameOverTimeRef = useRef<number>(0);
  const audioEngineRef = useRef<RetroAudioEngine | null>(null);
  const audioStateRef = useRef({
    paused: false,
    gameOver: false,
    briefing: true,
    waveClear: false,
    danger: 0,
    damage: 0,
    threatCount: 3,
  });
  const localAudioEnabledRef = useRef(true);
  const activeWordKeysRef = useRef(new Set(["사랑", "음악", "여행"]));
  const [words, setWords] = useState<FallingWord[]>([
    { id: 1, korean: "사랑", meaning: tr(locale, "love", "사랑"), x: lanePositions[1], y: 5, speed: 0.23, lane: 1 },
    { id: 2, korean: "음악", meaning: tr(locale, "music", "음악"), x: lanePositions[3], y: -8, speed: 0.25, lane: 3 },
    { id: 3, korean: "여행", meaning: tr(locale, "travel", "여행"), x: lanePositions[5], y: 0, speed: 0.21, lane: 5 },
  ]);
  const activeMeanings = useMemo(
    () => new Map(activeBank.map((entry) => [entry.korean, entry.meaning])),
    [activeBank],
  );
  const [input, setInput] = useState("");
  const [inputEpoch, setInputEpoch] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [caught, setCaught] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [briefing, setBriefing] = useState(true);
  const [waveClear, setWaveClear] = useState<number | null>(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  useEffect(() => {
    activeWordKeysRef.current = new Set(words.map((word) => word.korean));
  }, [words]);
  const [shock, setShock] = useState(false);
  const [message, setMessage] = useState(tr(locale, "Press Enter to begin the Hangul City defense mission.", "Enter를 눌러 한글시티 방어 임무를 시작하세요."));
  const [splash, setSplash] = useState(false);
  const [captureBurst, setCaptureBurst] = useState<CaptureBurst | null>(null);

  const level = Math.min(8, Math.floor(caught / CAUGHT_PER_LEVEL) + 1);
  const levelProgress = (caught % CAUGHT_PER_LEVEL) / CAUGHT_PER_LEVEL * 100;
  const desiredWords = Math.min(6, 2 + Math.ceil(level / 2));
  const shield = Math.max(0, Math.round((MAX_LIVES - misses) / MAX_LIVES * 100));
  const rank = combo >= 15 ? "S" : combo >= 10 ? "A" : combo >= 5 ? "B" : "C";
  const danger = Math.max(0, ...words.map((word) => word.y)) / 84;
  const criticalThreats = words.filter((word) => word.y > 67).length;

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, []);

  const stopRetroAudio = useCallback(() => {
    const engine = audioEngineRef.current;
    if (!engine) return;
    window.clearTimeout(engine.timer);
    void engine.context.close();
    audioEngineRef.current = null;
  }, []);

  const ensureRetroAudio = useCallback((forceLocal = false) => {
    if (!soundEnabled || (!localAudioEnabledRef.current && !forceLocal)) return null;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return null;
    const existing = audioEngineRef.current;
    if (existing) {
      if (existing.context.state === "suspended") void existing.context.resume();
      return existing;
    }
    const AudioContextConstructor = audioContextConstructor();
    if (!AudioContextConstructor) return null;
    const context = new AudioContextConstructor();
    const music = context.createGain();
    const effects = context.createGain();
    music.gain.value = 0.72;
    effects.gain.value = 0.82;
    music.connect(context.destination);
    effects.connect(context.destination);
    const engine: RetroAudioEngine = { context, music, effects, timer: 0, step: 0 };
    const bassPattern = [110, 110, 146.83, 110, 164.81, 146.83, 98, 123.47];
    const leadPattern = [440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88];
    const playMusicStep = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      const state = audioStateRef.current;
      const threatPressure = Math.max(0, Math.min(1,
        Math.max(0, state.threatCount - 2) / 4 * 0.45
        + state.danger * 0.32
        + state.damage / MAX_LIVES * 0.34,
      ));
      if (!state.paused && !state.gameOver && !state.briefing && context.state === "running") {
        const now = context.currentTime + 0.012;
        const pitch = 1 + threatPressure * 0.28;
        const patternIndex = Math.floor(engine.step / 4) % bassPattern.length;
        if (engine.step % 4 === 0) {
          synthTone(context, music, bassPattern[patternIndex] * pitch, now, 0.26, 0.026, "triangle");
        }
        if (engine.step % 2 === 0) {
          synthTone(context, music, leadPattern[(engine.step / 2) % leadPattern.length] * pitch, now, 0.09, 0.012, "square");
        }
        if (engine.step % 4 === 2) {
          noiseHit(context, music, now, 0.045, 0.009);
        }
        if (state.danger > 0.68 && engine.step % 8 === 6) {
          synthTone(context, music, (state.danger > 0.86 ? 880 : 660) * pitch, now, 0.07, 0.028, "square");
          synthTone(context, music, (state.danger > 0.86 ? 1046.5 : 784) * pitch, now + 0.085, 0.07, 0.022, "square");
        }
        engine.step = (engine.step + 1) % 64;
      }
      const nextStepDelay = Math.round(RETRO_STEP_MS - threatPressure * 52);
      engine.timer = window.setTimeout(playMusicStep, nextStepDelay);
    };
    engine.timer = window.setTimeout(playMusicStep, 0);
    audioEngineRef.current = engine;
    if (context.state === "suspended") void context.resume();
    return engine;
  }, [soundEnabled]);

  const playGameEffect = useCallback((effect: "start" | "blast" | "damage" | "error" | "wave", intensity = 0, pan = 0) => {
    const engine = ensureRetroAudio();
    if (!engine) return;
    const { context, effects } = engine;
    const now = context.currentTime + 0.01;
    const spatialOutput = typeof context.createStereoPanner === "function" ? context.createStereoPanner() : null;
    if (spatialOutput) {
      spatialOutput.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      spatialOutput.connect(effects);
    }
    const output: AudioNode = spatialOutput ?? effects;
    if (effect === "start") {
      [220, 329.63, 440, 659.25].forEach((frequency, index) => {
        synthTone(context, output, frequency, now + index * 0.07, 0.14, 0.05, index % 2 ? "square" : "triangle");
      });
      return;
    }
    if (effect === "blast") {
      noiseHit(context, output, now, 0.18, 0.15);
      noiseHit(context, output, now + 0.035, 0.1, 0.075);
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(720 + Math.min(360, intensity * 22), now);
      oscillator.frequency.exponentialRampToValueAtTime(92, now + 0.2);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      oscillator.connect(gain).connect(output);
      oscillator.start(now);
      oscillator.stop(now + 0.23);
      synthTone(context, output, 880 + intensity * 12, now + 0.05, 0.12, 0.045, "square");
      synthTone(context, output, 72, now + 0.015, 0.24, 0.1, "sine");
      return;
    }
    if (effect === "damage") {
      noiseHit(context, output, now, 0.42, 0.19);
      [98, 73.42, 49].forEach((frequency, index) => synthTone(context, output, frequency, now + index * 0.1, 0.3, 0.09, "sawtooth"));
      return;
    }
    if (effect === "error") {
      synthTone(context, output, 126, now, 0.08, 0.055, "square");
      synthTone(context, output, 112, now + 0.085, 0.08, 0.045, "square");
      return;
    }
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      synthTone(context, output, frequency, now + index * 0.09, 0.2, 0.065, index % 2 ? "square" : "triangle");
    });
  }, [ensureRetroAudio]);

  const toggleGameAudio = useCallback(() => {
    const next = !localAudioEnabledRef.current;
    localAudioEnabledRef.current = next;
    setLocalAudioEnabled(next);
    if (!next) {
      stopRetroAudio();
      return;
    }
    const engine = ensureRetroAudio(true);
    if (engine && engine.context.state === "suspended") void engine.context.resume();
  }, [ensureRetroAudio, stopRetroAudio]);

  const spawnWord = useCallback((slot = 0, atLevel = 1): FallingWord => {
    const unlockedDifficulty = atLevel >= 7 ? 3 : atLevel >= 3 ? 2 : 1;
    const bank = bankRef.current;
    const unlockedRaw = bank.filter((item) => item.difficulty <= unlockedDifficulty);
    const unlocked = unlockedRaw.length ? unlockedRaw : bank;
    const item = drawFromContentDeck(
      wordDeckRef.current,
      unlocked,
      (entry) => entry.korean,
      activeWordKeysRef.current,
    );
    const lane = (slot + Math.floor(Math.random() * lanePositions.length)) % lanePositions.length;
    return {
      id: nextId.current++,
      korean: item.korean,
      meaning: item.meaning,
      x: lanePositions[lane] + (Math.random() * 4 - 2),
      y: -4 - Math.random() * 20 - slot * 4,
      speed: 0.19 + atLevel * 0.025 + Math.random() * 0.09,
      lane,
    };
  }, []);

  const resetGame = useCallback(() => {
    nextId.current = 1;
    missesRef.current = 0;
    wordDeckRef.current = createContentDeck();
    setWords([spawnWord(0, 1), spawnWord(2, 1), spawnWord(4, 1)]);
    setInput("");
    setInputEpoch((current) => current + 1);
    setInputError(false);
    setScore(0);
    setMisses(0);
    setCaught(0);
    setCombo(0);
    setMaxCombo(0);
    setPaused(false);
    setGameOver(false);
    setShowGameOverModal(false);
    setShowRestartConfirm(false);
    setBriefing(false);
    setWaveClear(null);
    setShock(false);
    setMessage(tr(locale, "Shield charging! Complete a word and press Enter to blast it.", "방어막 충전 시작! 단어를 완성하고 Enter로 격파하세요."));
    playGameEffect("start");
    window.setTimeout(focusInput, 0);
  }, [focusInput, locale, playGameEffect, spawnWord]);

  useEffect(() => {
    if (briefing) window.requestAnimationFrame(() => rootRef.current?.focus({ preventScroll: true }));
    else focusInput();
  }, [briefing, focusInput]);

  useEffect(() => {
    audioStateRef.current = {
      paused: paused || suspended,
      gameOver,
      briefing,
      waveClear: Boolean(waveClear),
      danger,
      damage: misses,
      threatCount: words.length,
    };
    const engine = audioEngineRef.current;
    if (!engine) return;
    const audible = !paused && !gameOver && !briefing && !suspended;
    engine.music.gain.setTargetAtTime(audible ? 0.72 : 0.015, engine.context.currentTime, 0.045);
  }, [briefing, danger, gameOver, misses, paused, suspended, waveClear, words.length]);

  useEffect(() => {
    if (!soundEnabled) stopRetroAudio();
  }, [soundEnabled, stopRetroAudio]);

  useEffect(() => {
    if (paused || gameOver || briefing || suspended) return;
    const timer = window.setInterval(() => {
      setWords((current) => {
        let missedNow = 0;
        let missedPanTotal = 0;
        const next = current
          .map((word) => ({ ...word, y: word.y + word.speed }))
          .filter((word) => {
            if (word.y < 84) return true;
            missedNow += 1;
            missedPanTotal += (word.x / 50) - 1;
            return false;
          });

        if (missedNow) {
          const nextMisses = Math.min(MAX_LIVES, missesRef.current + missedNow);
          missesRef.current = nextMisses;
          window.setTimeout(() => {
            setScore((value) => Math.max(0, value - missedNow * 75));
            setMisses(nextMisses);
            setCombo(0);
            setSplash(true);
            setShock(true);
            playGameEffect("damage", missedNow, missedPanTotal / missedNow);
            window.setTimeout(() => setSplash(false), 520);
            if (shockTimerRef.current) window.clearTimeout(shockTimerRef.current);
            shockTimerRef.current = window.setTimeout(() => setShock(false), 650);
            if (nextMisses >= MAX_LIVES) {
              setGameOver(true);
              setShowGameOverModal(true);
              setShowRestartConfirm(false);
              gameOverTimeRef.current = Date.now();
              setMessage(tr(locale, "The city shield collapsed. Inspect your record or restart.", "도시 방어막이 무너졌습니다. 최종 기록을 확인하세요."));
              window.setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 0);
            } else {
              setMessage(`${tr(locale, "Shield hit!", "방어막 피격!")} ${MAX_LIVES - nextMisses} ${tr(locale, "energy cores remain. Defend the city.", "개의 에너지 코어가 남았습니다. 도시를 지켜주세요.")}`);
            }
          }, 0);
        }

        while (next.length < desiredWords && missesRef.current < MAX_LIVES) {
          next.push(spawnWord(next.length, level));
        }
        return next;
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [briefing, desiredWords, gameOver, level, locale, paused, playGameEffect, spawnWord, suspended]);

  useEffect(() => () => {
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    if (shockTimerRef.current) window.clearTimeout(shockTimerRef.current);
    if (waveTimerRef.current) window.clearTimeout(waveTimerRef.current);
    stopRetroAudio();
  }, [stopRetroAudio]);

  useEffect(() => {
    const teardown = () => stopRetroAudio();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stopRetroAudio();
    };
    window.addEventListener("pagehide", teardown);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", teardown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [stopRetroAudio]);

  function startMission() {
    setBriefing(false);
    wordDeckRef.current = createContentDeck();
    setWords([spawnWord(0, 1), spawnWord(2, 1), spawnWord(4, 1)]);
    setMessage(tr(locale, "Mission live! Type each corrupted word exactly and press Enter to blast it.", "임무 시작! 오염된 단어를 정확히 입력하고 Enter로 격파하세요."));
    playGameEffect("start");
    window.setTimeout(focusInput, 0);
  }

  const copyResultReport = async () => {
    const reportText = `🏆 [Seoul Keys] 한글시티 단어 방어 임무 완료 리포트!\n- 최종 점수: ${score.toLocaleString()}점\n- 격파한 단어 수: ${caught}개\n- 최대 연속 격파: ${maxCombo} Combo\n- 최종 등급: RANK ${rank}\n\n지금 나와 함께 한글 타자 게임 도전하자! https://seoulkeys.com`;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 3000);
    } catch {
      // Fallback
    }
  };

  const shareToTwitter = () => {
    const text = `🏆 Seoul Keys 한글시티 방어 완료!\n최종 점수: ${score.toLocaleString()}점, ${caught}개 단어 격파! (RANK ${rank})\n같이 한글 타자 연습하자! https://seoulkeys.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  function submitWord() {
    if (composingRef.current || paused || briefing || gameOver) return;
    const normalized = input.trim();
    if (!normalized) return;
    const matched = words
      .filter((word) => word.korean === normalized)
      .sort((a, b) => b.y - a.y)[0];
    if (!matched) {
      setInputError(true);
      setCombo(0);
      playGameEffect("error");
      setMessage(tr(locale, "Target lock failed. The word stays. Correct it with Backspace, then Enter.", "조준 실패! 단어는 그대로입니다. Backspace로 수정한 뒤 Enter!"));
      focusInput();
      return;
    }

    const urgencyBonus = Math.max(0, Math.round(matched.y));
    const gained = 100 + level * 20 + Math.min(200, combo * 15) + urgencyBonus;
    const nextCaught = caught + 1;
    const nextCombo = combo + 1;
    if (nextCombo > maxCombo) setMaxCombo(nextCombo);

    const clearedWave = nextCaught % CAUGHT_PER_LEVEL === 0;
    setWords((current) => [...current.filter((word) => word.id !== matched.id), spawnWord(current.length, level)]);
    setScore((current) => current + gained);
    setCaught(nextCaught);
    setCombo(nextCombo);
    setInput("");
    setInputError(false);
    setInputEpoch((current) => current + 1);
    setMessage(`${tr(locale, "Corrupted word destroyed!", "오염 단어 격파!")} +${gained} ${tr(locale, "energy · Lock the next target.", "에너지 · 다음 표적을 조준하세요.")}`);
    setCaptureBurst({ id: matched.id, x: matched.x, y: Math.max(8, matched.y), text: `+${gained}`, combo: nextCombo, word: matched.korean });
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => setCaptureBurst(null), 1050);
    playGameEffect("blast", nextCombo, (matched.x / 50) - 1);
    if (clearedWave) {
      setWaveClear(level);
      setMessage(`${tr(locale, "Wave", "웨이브")} ${level} ${tr(locale, "secured! Hangul City power is rising.", "방어 성공! 한글시티 전력이 상승합니다.")}`);
      window.setTimeout(() => playGameEffect("wave"), 170);
      if (soundEnabled && localAudioEnabledRef.current) onSuccessSound();
      if (waveTimerRef.current) window.clearTimeout(waveTimerRef.current);
      waveTimerRef.current = window.setTimeout(() => {
        setWaveClear(null);
        setMessage(`${tr(locale, "Entering wave", "웨이브")} ${Math.min(8, level + 1)} · ${tr(locale, "Descent speed increased.", "진입 · 낙하 속도가 빨라집니다.")}`);
        window.setTimeout(focusInput, 0);
      }, 1450);
    }
    window.setTimeout(focusInput, 0);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitWord();
  }

  function handleGameKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (isImeKey(event.nativeEvent)) return;
    if (event.altKey && event.key.toLowerCase() === "m") {
      event.preventDefault();
      toggleGameAudio();
      return;
    }
    if (briefing && event.key === "Enter") {
      event.preventDefault();
      startMission();
    } else if (event.key === "Escape" && !briefing) {
      event.preventDefault();
      setPaused((current) => {
        const next = !current;
        window.setTimeout(() => next ? rootRef.current?.focus({ preventScroll: true }) : focusInput(), 0);
        return next;
      });
    } else if (paused && event.key === "Enter") {
      event.preventDefault();
      setPaused(false);
      window.setTimeout(focusInput, 0);
    } else if (gameOver && event.key === "Enter") {
      event.preventDefault();
      // Block accidental double-tap for 1.2 seconds after game over
      const elapsedSinceGameOver = Date.now() - gameOverTimeRef.current;
      if (elapsedSinceGameOver < 1200) {
        return;
      }
      if (!showRestartConfirm) {
        setShowRestartConfirm(true);
      } else {
        resetGame();
      }
    }
  }

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={`word-rain-game damage-${misses} ${briefing ? "is-briefing" : ""} ${paused ? "is-paused" : ""} ${gameOver ? "is-game-over" : ""} ${waveClear ? "is-wave-clear" : ""} ${shock ? "has-shock" : ""} ${criticalThreats ? "is-critical" : ""} ${combo >= 5 ? "combo-hot" : ""}`}
      onKeyDownCapture={handleGameKeys}
    >
      {/* The scoreboard sits above the board, not on top of it. All four readouts
          used to be absolutely positioned inside the play area, so a word falling
          down the middle or either edge spent its first second hidden behind them
          — unreadable exactly when there is still time to type it. The arena
          wrapper keeps the pair in the grid's first column; the game itself is a
          two-column grid and a third child would have broken the layout. */}
      <div className="word-rain-arena">
      <div className="word-rain-hud">
        <div className="word-rain-level"><small>{tr(locale, "WAVE", "웨이브")}</small><b>{level.toString().padStart(2, "0")}</b><em>{tr(locale, "RANK", "등급")} {rank}</em></div>
        <div className="mission-hud">
          <small>{tr(locale, "CITY DEFENSE", "도시 방어 임무")}</small>
          <b>{tr(locale, "DECODE CORRUPTED WORDS", "오염 단어 해독")}</b>
          <span>{caught % CAUGHT_PER_LEVEL} / {CAUGHT_PER_LEVEL}</span>
        </div>
        <div className="word-rain-lives" aria-label={`${shield}% shield`}>
          <small>{tr(locale, "SHIELD", "방어막")}</small>
          <b>{shield}%</b>
          <span className="shield-meter"><i style={{ width: `${shield}%` }} /></span>
        </div>
        <div className={`threat-alert ${criticalThreats ? "active" : ""}`} role="status" aria-live="polite">
          <i aria-hidden="true" />
          <span>{criticalThreats ? `${tr(locale, "IMPACT ALERT", "충돌 경보")} ${criticalThreats}` : tr(locale, "AIRSPACE CLEAR", "영공 안정")}</span>
        </div>
      </div>
      <div className="word-rain-board" aria-label={tr(locale, "Falling word defense game for Neon Hangul City", "네온 한글시티를 방어하는 낙하 단어 게임")}>
        <div className="retro-scanlines" aria-hidden="true" />
        <div className="pixel-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="aurora aurora-one" /><div className="aurora aurora-two" />
        <div className="sky-cloud cloud-one" /><div className="sky-cloud cloud-two" />
        {words.map((word) => (
          <span
            className={`rain-word ${input.trim() && word.korean.startsWith(input.trim()) ? "targeted" : ""} ${word.y > 67 ? "critical" : ""} lane-${word.lane}`}
            lang="ko"
            key={word.id}
            style={{ left: `${word.x}%`, top: `${word.y}%` }}
          >
            <i className="word-tether" aria-hidden="true" />
            <span className="missile-plume" aria-hidden="true"><i /><i /><i /></span>
            <span className="missile-fins" aria-hidden="true" />
            <span className="target-brackets" aria-hidden="true" />
            <b>{word.korean}</b><small>{activeMeanings.get(word.korean) ?? word.meaning}</small>
          </span>
        ))}
        {captureBurst && (
          <span className="capture-burst" key={captureBurst.id} style={{ left: `${captureBurst.x}%`, top: `${captureBurst.y}%` }} aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
            <span className="blast-core" />
            <span className="blast-smoke"><i /><i /><i /><i /></span>
            <span className="missile-shards">
              {Array.from(captureBurst.word).map((character, index) => <i style={{ "--shard-index": index } as CSSProperties} key={`${character}-${index}`}>{character}</i>)}
            </span>
            <strong>{tr(locale, "BREAK!", "격파!")}</strong>
            <b>{captureBurst.text}</b>
            {captureBurst.combo >= 3 && <em>{captureBurst.combo} COMBO</em>}
          </span>
        )}
        <div className="defense-grid" aria-hidden="true" />
        <div className={`neon-city damage-${misses}`} aria-hidden="true">
          <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
          <div className="city-skyline-back"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <b className="city-core"><i /></b>
          <div className="city-damage-layer"><i /><i /><i /><i /><i /><i /></div>
          <div className="city-smoke"><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="city-rubble"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className={`sea-water ${splash ? "splash" : ""}`}><i /><i /><i /><b>{tr(locale, "HANGUL CITY BARRIER", "한글시티 방어선")}</b></div>

        {briefing && (
          <div className="mission-curtain mission-briefing" role="status">
            <div className="mission-emblem" aria-hidden="true"><span>ㅎ</span></div>
            <small>{tr(locale, "MISSION 01 · NEON HARBOR", "미션 01 · 네온 하버")}</small>
            <h3>{tr(locale, "DEFEND NEON HANGUL CITY", "네온 한글시티를 지켜라")}</h3>
            <p>{tr(locale, "Corrupted words are falling toward the city core. Type the exact Hangul and press Enter to destroy each threat before impact.", "오염된 단어가 도시의 에너지 코어를 향해 낙하합니다. 정확한 한글을 입력하고 Enter를 눌러 충돌 전에 격파하세요.")}</p>
            <div className="mission-rules"><span><b>01</b>{tr(locale, "LOCK WORD", "단어 조준")}</span><span><b>02</b>{tr(locale, "TYPE HANGUL", "한글 입력")}</span><span><b>03</b>{tr(locale, "ENTER · BLAST", "Enter · 격파")}</span></div>
            <span className="mission-start" onClick={startMission} style={{ cursor: "pointer" }}><kbd>Enter</kbd>{tr(locale, "START MISSION · RETRO BGM ON", "임무 시작 · 레트로 BGM ON")}</span>
          </div>
        )}

        {waveClear && (
          <div className="wave-clear-curtain" role="status">
            <small>{tr(locale, "DEFENSE COMPLETE", "방어 완료")}</small>
            <b>WAVE {waveClear.toString().padStart(2, "0")} CLEAR</b>
            <span>{tr(locale, "CITY POWER +1 · SCANNING NEXT WAVE", "도시 전력 +1 · 다음 파도 분석 중")}</span>
          </div>
        )}

        {paused && (
          <div className="game-curtain" role="status">
            <small>{tr(locale, "MISSION PAUSED", "임무 일시정지")}</small>
            <b>{tr(locale, "TIME FREEZE", "시간 정지")}</b>
            <span><kbd>Enter</kbd>{tr(locale, "resume mission", "임무 계속")}</span>
          </div>
        )}

        {/* GameOver Result & Confirmation Modal */}
        {gameOver && showGameOverModal && (
          <div className="game-curtain game-over-modal-curtain" role="status" style={{ background: "rgba(13, 17, 23, 0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", zIndex: 100 }}>
            <div style={{ maxWidth: "480px", width: "100%", background: "var(--paper)", border: "3px solid #ff4d8d", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(255, 77, 141, 0.3)", color: "var(--ink)" }}>
              <span style={{ fontSize: "40px" }}>💥</span>
              <small style={{ display: "block", color: "#ff4d8d", fontWeight: "bold", letterSpacing: "0.15em", marginTop: "8px" }}>{tr(locale, "CITY SHIELD COLLAPSED", "도시 방어막 붕괴")}</small>
              <h2 style={{ fontSize: "24px", margin: "8px 0", color: "var(--ink)", fontWeight: "900" }}>{tr(locale, "Mission Failed — City Destroyed", "방어 실패 — 임무 완수 리포트")}</h2>

              {/* Detailed Performance Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--ivory)", border: "2px solid var(--line)", borderRadius: "14px", padding: "16px", margin: "16px 0", textAlign: "center" }}>
                <div>
                  <small style={{ color: "var(--ink)", opacity: 0.7, fontSize: "12px" }}>{tr(locale, "Final power score", "최종 전력 점수")}</small>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#58a6ff" }}>{score.toLocaleString()}</div>
                </div>
                <div>
                  <small style={{ color: "var(--ink)", opacity: 0.7, fontSize: "12px" }}>{tr(locale, "Words destroyed", "격파 오염 단어")}</small>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#2da44e" }}>{caught}</div>
                </div>
                <div>
                  <small style={{ color: "var(--ink)", opacity: 0.7, fontSize: "12px" }}>{tr(locale, "Wave reached", "도달한 웨이브")}</small>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--ink)" }}>WAVE {level}</div>
                </div>
                <div>
                  <small style={{ color: "var(--ink)", opacity: 0.7, fontSize: "12px" }}>{tr(locale, "Best chain / rank", "최고 연속 격파 / 등급")}</small>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#a371f7" }}>{maxCombo} Combo (RANK {rank})</div>
                </div>
              </div>

              {/* Share & Brag Actions */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button type="button" className="button button-primary" onClick={copyResultReport} style={{ flex: 1, fontSize: "13px", padding: "10px", justifyContent: "center" }}>
                  📋 {copiedResult ? tr(locale, "Result copied!", "기록 복사 완료!") : tr(locale, "Copy my result", "내 성적 복사하기")}
                </button>
                <button type="button" className="button button-secondary" onClick={shareToTwitter} style={{ fontSize: "13px", padding: "10px 14px" }}>
                  🐤 {tr(locale, "Share on X", "X 자랑하기")}
                </button>
              </div>

              {/* Confirmation Gate before restarting */}
              {showRestartConfirm ? (
                <div style={{ background: "rgba(255, 77, 141, 0.15)", border: "2px solid #ff4d8d", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ margin: "0 0 10px", fontWeight: "bold", fontSize: "14px", color: "var(--ink)" }}>⚠️ {tr(locale, "Start over from the beginning?", "처음부터 다시 도전하시겠습니까?")}</p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button type="button" className="button button-primary" onClick={resetGame} style={{ background: "#ff4d8d", borderColor: "#ff4d8d", color: "#fff", padding: "8px 16px" }}>
                      🚀 {tr(locale, "Yes, restart", "예, 처음부터 시작!")}
                    </button>
                    <button type="button" className="button button-secondary" onClick={() => setShowRestartConfirm(false)} style={{ padding: "8px 16px" }}>
                      {tr(locale, "Keep viewing results", "기록 계속 보기")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    const elapsed = Date.now() - gameOverTimeRef.current;
                    if (elapsed < 1200) {
                      setShowRestartConfirm(true);
                    } else {
                      setShowRestartConfirm(true);
                    }
                  }}
                  style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "15px", fontWeight: "bold" }}
                >
                  🔄 {tr(locale, "Try again", "다시 도전하기")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      <form className="word-rain-console" onSubmit={submit}>
        <div className="mission-console-head">
          <span><i /> {tr(locale, "HANGEUL GUARD", "한글 가드")}</span>
          <button
            type="button"
            className={soundEnabled && localAudioEnabled ? "game-audio-toggle is-on" : "game-audio-toggle"}
            onClick={toggleGameAudio}
            aria-pressed={soundEnabled && localAudioEnabled}
          >
            <b>♪</b> {soundEnabled && localAudioEnabled ? tr(locale, "BGM + FX ON", "배경음·효과음 켜짐") : tr(locale, "AUDIO OFF", "소리 꺼짐")} <kbd>Alt+M</kbd>
          </button>
        </div>
        <div className="game-scorebar">
          <span>{tr(locale, "CITY POWER", "도시 전력")}<b>{score.toLocaleString()}</b></span>
          <span>{tr(locale, "CHAIN", "연속 격파")}<b>×{combo}</b></span>
          <span>{tr(locale, "RANK", "파일럿 등급")}<b>{rank}</b></span>
        </div>
        <div className="wave-progress"><span style={{ width: `${levelProgress}%` }} /><small>{`${tr(locale, "WAVE DEFENSE", "웨이브 방어")} ${caught % CAUGHT_PER_LEVEL}/${CAUGHT_PER_LEVEL}`}</small></div>
        <div>
          <p className="demo-label">{tr(locale, "LIVE MISSION · WAVE", "실시간 임무 · 웨이브")} {level.toString().padStart(2, "0")}</p>
          <h3>{tr(locale, "Power the city with accurate Hangul.", "정확한 한글로 도시를 충전하세요.")}</h3>
          <p>{tr(locale, "Type the exact word and press Enter before it reaches the barrier. A typo never removes the target.", "단어가 방어선에 닿기 전에 정확히 입력하고 Enter로 격파하세요. 오타는 표적을 없애지 않습니다.")}</p>
        </div>
        <label htmlFor="word-rain-input">{tr(locale, "Target console", "표적 한글 입력")}</label>
        <div className="inline-form">
          <HangulInput
            className={inputError ? "input-error" : ""}
            locale={locale}
            onScreenSubmit={submitWord}
            id="word-rain-input"
            key={inputEpoch}
            lang="ko"
            ref={inputRef}
            value={input}
            disabled={briefing || paused || gameOver}
            onValueChange={(value) => {
              setInput(value);
              if (inputError) setInputError(false);
            }}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            onKeyDown={(event) => {
              if (soundEnabled) ensureRetroAudio();
              if (soundEnabled && !event.repeat && (event.key.length === 1 || event.key === "Backspace")) onKeySound(event.code);
              if (event.key !== "Enter" || event.nativeEvent.isComposing || composingRef.current) return;
              event.preventDefault();
              submitWord();
            }}
            onBlur={(event) => {
              if (event.relatedTarget) return;
              if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
              if (!briefing && !paused && !gameOver) window.setTimeout(focusInput, 0);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="word-rain-message"
          />
          <button className="button button-primary" type="submit">{tr(locale, "Blast", "격파")} <kbd>Enter</kbd></button>
        </div>
        <p className={`form-message ${inputError ? "error" : ""}`} id="word-rain-message" aria-live="polite">{message}</p>
        <div className="game-key-help">
          <span><kbd>Enter</kbd>{tr(locale, "blast target", "표적 격파")}</span>
          <span><kbd>Esc</kbd>{tr(locale, "pause/resume", "시간 정지/계속")}</span>
          <span><kbd>Alt+M</kbd>{tr(locale, "music & effects", "음악·효과음")}</span>
        </div>
      </form>
    </div>
  );
}
