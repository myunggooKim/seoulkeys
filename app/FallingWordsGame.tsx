"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

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

export function FallingWordsGame({ koreanUi, soundEnabled, onSuccessSound, onKeySound }: {
  koreanUi: boolean;
  soundEnabled: boolean;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
}) {
  const nextId = useRef(4);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const missesRef = useRef(0);
  const burstTimerRef = useRef<number | null>(null);
  const shockTimerRef = useRef<number | null>(null);
  const waveTimerRef = useRef<number | null>(null);
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
  const recentWordsRef = useRef(["사랑", "음악", "여행"]);
  const [words, setWords] = useState<FallingWord[]>([
    { id: 1, korean: "사랑", meaning: "love", x: lanePositions[1], y: 5, speed: 0.23, lane: 1 },
    { id: 2, korean: "음악", meaning: "music", x: lanePositions[3], y: -8, speed: 0.25, lane: 3 },
    { id: 3, korean: "여행", meaning: "travel", x: lanePositions[5], y: 0, speed: 0.21, lane: 5 },
  ]);
  const [input, setInput] = useState("");
  const [inputEpoch, setInputEpoch] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [caught, setCaught] = useState(0);
  const [combo, setCombo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [briefing, setBriefing] = useState(true);
  const [waveClear, setWaveClear] = useState<number | null>(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [shock, setShock] = useState(false);
  const [message, setMessage] = useState(koreanUi ? "Enter를 눌러 한글시티 방어 임무를 시작하세요." : "Press Enter to begin the Hangul City defense mission.");
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
      noiseHit(context, output, now, 0.16, 0.12);
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
    const unlocked = wordBank.filter((item) => item.difficulty <= unlockedDifficulty);
    const fresh = unlocked.filter((item) => !recentWordsRef.current.includes(item.korean));
    const pool = fresh.length ? fresh : unlocked;
    const item = pool[Math.floor(Math.random() * pool.length)];
    recentWordsRef.current = [...recentWordsRef.current, item.korean].slice(-Math.min(18, Math.max(10, unlocked.length - 4)));
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
    recentWordsRef.current = [];
    setWords([spawnWord(0, 1), spawnWord(2, 1), spawnWord(4, 1)]);
    setInput("");
    setInputEpoch((current) => current + 1);
    setInputError(false);
    setScore(0);
    setMisses(0);
    setCaught(0);
    setCombo(0);
    setPaused(false);
    setGameOver(false);
    setBriefing(false);
    setWaveClear(null);
    setShock(false);
    setMessage(koreanUi ? "방어막 충전 시작! 단어를 완성하고 Enter로 격파하세요." : "Shield charging! Complete a word and press Enter to blast it.");
    playGameEffect("start");
    window.setTimeout(focusInput, 0);
  }, [focusInput, koreanUi, playGameEffect, spawnWord]);

  useEffect(() => {
    if (briefing) window.requestAnimationFrame(() => rootRef.current?.focus({ preventScroll: true }));
    else focusInput();
  }, [briefing, focusInput]);

  useEffect(() => {
    audioStateRef.current = {
      paused,
      gameOver,
      briefing,
      waveClear: Boolean(waveClear),
      danger,
      damage: misses,
      threatCount: words.length,
    };
    const engine = audioEngineRef.current;
    if (!engine) return;
    const audible = !paused && !gameOver && !briefing;
    engine.music.gain.setTargetAtTime(audible ? 0.72 : 0.015, engine.context.currentTime, 0.045);
  }, [briefing, danger, gameOver, misses, paused, waveClear, words.length]);

  useEffect(() => {
    if (!soundEnabled) stopRetroAudio();
  }, [soundEnabled, stopRetroAudio]);

  useEffect(() => {
    if (paused || gameOver || briefing) return;
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
              setMessage(koreanUi ? "도시 방어막이 무너졌습니다. Enter로 즉시 재출격하세요." : "The city shield collapsed. Press Enter to redeploy instantly.");
              window.setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 0);
            } else {
              setMessage(koreanUi ? `방어막 피격! 에너지 코어 ${MAX_LIVES - nextMisses}개 · 도시를 지켜주세요.` : `Shield hit! ${MAX_LIVES - nextMisses} energy cores remain. Defend the city.`);
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
  }, [briefing, desiredWords, gameOver, koreanUi, level, paused, playGameEffect, spawnWord]);

  useEffect(() => () => {
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    if (shockTimerRef.current) window.clearTimeout(shockTimerRef.current);
    if (waveTimerRef.current) window.clearTimeout(waveTimerRef.current);
    stopRetroAudio();
  }, [stopRetroAudio]);

  function startMission() {
    setBriefing(false);
    setMessage(koreanUi
      ? "임무 시작! 오염된 단어를 정확히 입력하고 Enter로 격파하세요."
      : "Mission live! Type each corrupted word exactly and press Enter to blast it.");
    playGameEffect("start");
    window.setTimeout(focusInput, 0);
  }

  function submitWord() {
    if (composingRef.current || paused || briefing) return;
    if (gameOver) {
      resetGame();
      return;
    }
    const normalized = input.trim();
    if (!normalized) return;
    const matched = words
      .filter((word) => word.korean === normalized)
      .sort((a, b) => b.y - a.y)[0];
    if (!matched) {
      setInputError(true);
      setCombo(0);
      playGameEffect("error");
      setMessage(koreanUi
        ? "조준 실패! 단어는 그대로입니다. Backspace로 수정한 뒤 Enter!"
        : "Target lock failed. The word stays. Correct it with Backspace, then Enter.");
      focusInput();
      return;
    }

    const urgencyBonus = Math.max(0, Math.round(matched.y));
    const gained = 100 + level * 20 + Math.min(200, combo * 15) + urgencyBonus;
    const nextCaught = caught + 1;
    const nextCombo = combo + 1;
    const clearedWave = nextCaught % CAUGHT_PER_LEVEL === 0;
    setWords((current) => [...current.filter((word) => word.id !== matched.id), spawnWord(current.length, level)]);
    setScore((current) => current + gained);
    setCaught(nextCaught);
    setCombo(nextCombo);
    setInput("");
    setInputError(false);
    setInputEpoch((current) => current + 1);
    setMessage(koreanUi ? `오염 단어 격파! +${gained} 에너지 · 다음 표적을 조준하세요.` : `Corrupted word destroyed! +${gained} energy · Lock the next target.`);
    setCaptureBurst({ id: matched.id, x: matched.x, y: Math.max(8, matched.y), text: `+${gained}`, combo: nextCombo });
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => setCaptureBurst(null), 880);
    playGameEffect("blast", nextCombo, (matched.x / 50) - 1);
    if (clearedWave) {
      setWaveClear(level);
      setMessage(koreanUi ? `웨이브 ${level} 방어 성공! 한글시티 전력이 상승합니다.` : `Wave ${level} secured! Hangul City power is rising.`);
      window.setTimeout(() => playGameEffect("wave"), 170);
      if (soundEnabled && localAudioEnabledRef.current) onSuccessSound();
      if (waveTimerRef.current) window.clearTimeout(waveTimerRef.current);
      waveTimerRef.current = window.setTimeout(() => {
        setWaveClear(null);
        setMessage(koreanUi ? `웨이브 ${Math.min(8, level + 1)} 진입 · 낙하 속도가 빨라집니다.` : `Entering wave ${Math.min(8, level + 1)} · Descent speed increased.`);
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
    } else if ((paused || gameOver) && event.key === "Enter") {
      event.preventDefault();
      if (gameOver) resetGame();
      else {
        setPaused(false);
        window.setTimeout(focusInput, 0);
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
      <div className="word-rain-board" aria-label={koreanUi ? "네온 한글시티를 방어하는 낙하 단어 게임" : "Falling word defense game for Neon Hangul City"}>
        <div className="retro-scanlines" aria-hidden="true" />
        <div className="pixel-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="aurora aurora-one" /><div className="aurora aurora-two" />
        <div className="sky-cloud cloud-one" /><div className="sky-cloud cloud-two" />
        <div className="word-rain-level"><small>WAVE</small><b>{level.toString().padStart(2, "0")}</b><em>RANK {rank}</em></div>
        <div className="mission-hud">
          <small>{koreanUi ? "도시 방어 임무" : "CITY DEFENSE"}</small>
          <b>{koreanUi ? "오염 단어 해독" : "DECODE CORRUPTED WORDS"}</b>
          <span>{caught % CAUGHT_PER_LEVEL} / {CAUGHT_PER_LEVEL}</span>
        </div>
        <div className="word-rain-lives" aria-label={`${shield}% shield`}>
          <small>SHIELD</small>
          <b>{shield}%</b>
          <span className="shield-meter"><i style={{ width: `${shield}%` }} /></span>
        </div>
        <div className={`threat-alert ${criticalThreats ? "active" : ""}`} role="status" aria-live="polite">
          <i aria-hidden="true" />
          <span>{criticalThreats ? koreanUi ? `충돌 경보 ${criticalThreats}` : `IMPACT ALERT ${criticalThreats}` : koreanUi ? "영공 안정" : "AIRSPACE CLEAR"}</span>
        </div>
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
            <b>{word.korean}</b><small>{word.meaning}</small>
          </span>
        ))}
        {captureBurst && (
          <span className="capture-burst" key={captureBurst.id} style={{ left: `${captureBurst.x}%`, top: `${captureBurst.y}%` }} aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
            <strong>BREAK!</strong>
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
        <div className={`sea-water ${splash ? "splash" : ""}`}><i /><i /><i /><b>{koreanUi ? "한글시티 방어선" : "HANGUL CITY BARRIER"}</b></div>
        {briefing && (
          <div className="mission-curtain mission-briefing" role="status">
            <div className="mission-emblem" aria-hidden="true"><span>ㅎ</span></div>
            <small>MISSION 01 · NEON HARBOR</small>
            <h3>{koreanUi ? "네온 한글시티를 지켜라" : "DEFEND NEON HANGUL CITY"}</h3>
            <p>{koreanUi
              ? "오염된 단어가 도시의 에너지 코어를 향해 낙하합니다. 정확한 한글을 입력하고 Enter를 눌러 충돌 전에 격파하세요."
              : "Corrupted words are falling toward the city core. Type the exact Hangul and press Enter to destroy each threat before impact."}</p>
            <div className="mission-rules"><span><b>01</b>{koreanUi ? "단어 조준" : "LOCK WORD"}</span><span><b>02</b>{koreanUi ? "한글 입력" : "TYPE HANGUL"}</span><span><b>03</b>ENTER · BLAST</span></div>
            <span className="mission-start"><kbd>Enter</kbd>{koreanUi ? "임무 시작 · 레트로 BGM ON" : "START MISSION · RETRO BGM ON"}</span>
          </div>
        )}
        {waveClear && (
          <div className="wave-clear-curtain" role="status">
            <small>DEFENSE COMPLETE</small>
            <b>WAVE {waveClear.toString().padStart(2, "0")} CLEAR</b>
            <span>{koreanUi ? "도시 전력 +1 · 다음 파도 분석 중" : "CITY POWER +1 · SCANNING NEXT WAVE"}</span>
          </div>
        )}
        {(paused || gameOver) && (
          <div className="game-curtain" role="status">
            <small>{gameOver ? "CITY DESTROYED · MISSION FAILED" : "MISSION PAUSED"}</small>
            <b>{gameOver ? score.toLocaleString() : koreanUi ? "시간 정지" : "TIME FREEZE"}</b>
            {gameOver && <p>{koreanUi ? "내구도 0% · 단어 5개가 충돌해 도시가 붕괴했습니다." : "Integrity 0% · Five impacts collapsed the city."}</p>}
            <span><kbd>Enter</kbd>{gameOver ? koreanUi ? "도시 복구 후 재출격" : "rebuild & redeploy" : koreanUi ? "임무 계속" : "resume mission"}</span>
          </div>
        )}
      </div>

      <form className="word-rain-console" onSubmit={submit}>
        <div className="mission-console-head">
          <span><i /> HANGEUL GUARD</span>
          <button
            type="button"
            className={soundEnabled && localAudioEnabled ? "game-audio-toggle is-on" : "game-audio-toggle"}
            onClick={toggleGameAudio}
            aria-pressed={soundEnabled && localAudioEnabled}
          >
            <b>♪</b> {soundEnabled && localAudioEnabled ? "BGM + FX ON" : "AUDIO OFF"} <kbd>Alt+M</kbd>
          </button>
        </div>
        <div className="game-scorebar">
          <span>{koreanUi ? "도시 전력" : "CITY POWER"}<b>{score.toLocaleString()}</b></span>
          <span>{koreanUi ? "연속 격파" : "CHAIN"}<b>×{combo}</b></span>
          <span>{koreanUi ? "파일럿 등급" : "RANK"}<b>{rank}</b></span>
        </div>
        <div className="wave-progress"><span style={{ width: `${levelProgress}%` }} /><small>{koreanUi ? `웨이브 방어 ${caught % CAUGHT_PER_LEVEL}/${CAUGHT_PER_LEVEL}` : `WAVE DEFENSE ${caught % CAUGHT_PER_LEVEL}/${CAUGHT_PER_LEVEL}`}</small></div>
        <div>
          <p className="demo-label">LIVE MISSION · WAVE {level.toString().padStart(2, "0")}</p>
          <h3>{koreanUi ? "정확한 한글로 도시를 충전하세요." : "Power the city with accurate Hangul."}</h3>
          <p>{koreanUi ? "단어가 방어선에 닿기 전에 정확히 입력하고 Enter로 격파하세요. 오타는 표적을 없애지 않습니다." : "Type the exact word and press Enter before it reaches the barrier. A typo never removes the target."}</p>
        </div>
        <label htmlFor="word-rain-input">{koreanUi ? "표적 한글 입력" : "Target console"}</label>
        <div className="inline-form">
          <input
            className={inputError ? "input-error" : ""}
            id="word-rain-input"
            key={inputEpoch}
            lang="ko"
            ref={inputRef}
            value={input}
            disabled={briefing || paused || gameOver}
            onChange={(event) => {
              setInput(event.target.value);
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
            onBlur={() => {
              if (!briefing && !paused && !gameOver) window.setTimeout(focusInput, 0);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="word-rain-message"
          />
          <button className="button button-primary" type="submit">{koreanUi ? "격파" : "Blast"} <kbd>Enter</kbd></button>
        </div>
        <p className={`form-message ${inputError ? "error" : ""}`} id="word-rain-message" aria-live="polite">{message}</p>
        <div className="game-key-help">
          <span><kbd>Enter</kbd>{koreanUi ? "표적 격파" : "blast target"}</span>
          <span><kbd>Esc</kbd>{koreanUi ? "시간 정지/계속" : "pause/resume"}</span>
          <span><kbd>Alt+M</kbd>{koreanUi ? "음악·효과음" : "music & effects"}</span>
        </div>
      </form>
    </div>
  );
}
