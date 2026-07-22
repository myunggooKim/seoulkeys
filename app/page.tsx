"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Locale = "en" | "ko" | "es" | "ja" | "fr" | "ar";
type ActivityId = "home" | "tetris" | "missing" | "crossword" | "kpop";

const copy: Record<Locale, {
  navLearn: string;
  navGames: string;
  navProgress: string;
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  description: string;
  start: string;
  explore: string;
  upNext: string;
  practiceTitle: string;
  practiceHint: string;
  nextBeat: string;
  nextBeatHint: string;
  pathTitle: string;
  pathBody: string;
}> = {
  en: {
    navLearn: "Learn",
    navGames: "Games",
    navProgress: "My progress",
    eyebrow: "10 min a day · beginner friendly",
    headlineTop: "Type Korean.",
    headlineBottom: "Play your way.",
    description: "Build real Hangul muscle memory through quick lessons, bright beats, and games that turn every keystroke into progress.",
    start: "Start today’s lesson",
    explore: "Explore games",
    upNext: "Up next · Home-row practice",
    practiceTitle: "Find the rhythm, one key at a time.",
    practiceHint: "Type the Korean sentence below",
    nextBeat: "Pick your next beat.",
    nextBeatHint: "Short rounds. Instant feedback. Real Korean.",
    pathTitle: "From your first key to your favorite song.",
    pathBody: "A clear path takes you from Hangul basics to words, games, long-form typing, and licensed K-POP challenges.",
  },
  ko: {
    navLearn: "배우기",
    navGames: "게임",
    navProgress: "내 진도",
    eyebrow: "하루 10분 · 초보자 환영",
    headlineTop: "한글을 치고,",
    headlineBottom: "게임처럼 배워요.",
    description: "짧은 레슨과 재미있는 게임으로 자판 위치부터 실제 한국어 문장까지 자연스럽게 익혀보세요.",
    start: "오늘의 레슨 시작",
    explore: "게임 둘러보기",
    upNext: "다음 학습 · 기본자리",
    practiceTitle: "한 키씩 리듬을 찾아보세요.",
    practiceHint: "아래 한국어 문장을 입력하세요",
    nextBeat: "다음 활동을 골라보세요.",
    nextBeatHint: "짧은 라운드, 즉시 피드백, 진짜 한국어.",
    pathTitle: "첫 키부터 좋아하는 노래까지.",
    pathBody: "한글 원리부터 단어, 게임, 장문 타자와 정식 라이선스 K-POP 챌린지까지 이어집니다.",
  },
  es: {
    navLearn: "Aprender",
    navGames: "Juegos",
    navProgress: "Mi progreso",
    eyebrow: "10 min al día · para principiantes",
    headlineTop: "Escribe coreano.",
    headlineBottom: "Aprende jugando.",
    description: "Crea memoria muscular con lecciones rápidas y juegos que convierten cada tecla en progreso.",
    start: "Empezar la lección",
    explore: "Explorar juegos",
    upNext: "Siguiente · Fila inicial",
    practiceTitle: "Encuentra el ritmo, tecla a tecla.",
    practiceHint: "Escribe la frase en coreano",
    nextBeat: "Elige tu próximo reto.",
    nextBeatHint: "Rondas cortas. Respuesta inmediata. Coreano real.",
    pathTitle: "De tu primera tecla a tu canción favorita.",
    pathBody: "Avanza desde Hangul básico hasta palabras, juegos, textos largos y retos K-POP con licencia.",
  },
  ja: {
    navLearn: "学ぶ",
    navGames: "ゲーム",
    navProgress: "進捗",
    eyebrow: "1日10分 · 初心者向け",
    headlineTop: "韓国語を打って、",
    headlineBottom: "ゲームで学ぼう。",
    description: "短いレッスンと楽しいゲームで、ハングル入力を自然に身につけましょう。",
    start: "今日のレッスン",
    explore: "ゲームを見る",
    upNext: "次へ · ホームポジション",
    practiceTitle: "一つずつ、キーのリズムを見つけよう。",
    practiceHint: "下の韓国語を入力してください",
    nextBeat: "次のチャレンジを選ぼう。",
    nextBeatHint: "短いラウンド、すぐにフィードバック、本物の韓国語。",
    pathTitle: "最初のキーから好きな歌まで。",
    pathBody: "ハングルの基礎から単語、ゲーム、長文、公式K-POPチャレンジへ進みます。",
  },
  fr: {
    navLearn: "Apprendre",
    navGames: "Jeux",
    navProgress: "Mes progrès",
    eyebrow: "10 min par jour · débutants bienvenus",
    headlineTop: "Tapez en coréen.",
    headlineBottom: "Apprenez en jouant.",
    description: "Progressez grâce à des leçons rapides et des jeux qui transforment chaque frappe en réussite.",
    start: "Commencer la leçon",
    explore: "Voir les jeux",
    upNext: "À suivre · Position de base",
    practiceTitle: "Trouvez le rythme, une touche à la fois.",
    practiceHint: "Tapez la phrase coréenne",
    nextBeat: "Choisissez votre prochain défi.",
    nextBeatHint: "Parties courtes. Retour immédiat. Vrai coréen.",
    pathTitle: "De la première touche à votre chanson préférée.",
    pathBody: "Passez des bases du Hangul aux mots, jeux, textes longs et défis K-POP sous licence.",
  },
  ar: {
    navLearn: "تعلّم",
    navGames: "ألعاب",
    navProgress: "تقدّمي",
    eyebrow: "10 دقائق يومياً · مناسب للمبتدئين",
    headlineTop: "اكتب بالكورية.",
    headlineBottom: "وتعلّم باللعب.",
    description: "ابنِ ذاكرة حركية حقيقية من خلال دروس سريعة وألعاب تجعل كل ضغطة مفتاح تقدماً.",
    start: "ابدأ درس اليوم",
    explore: "استكشف الألعاب",
    upNext: "التالي · الصف الأساسي",
    practiceTitle: "اعثر على الإيقاع، مفتاحاً بعد مفتاح.",
    practiceHint: "اكتب الجملة الكورية أدناه",
    nextBeat: "اختر التحدي التالي.",
    nextBeatHint: "جولات قصيرة، ملاحظات فورية، وكورية حقيقية.",
    pathTitle: "من أول مفتاح إلى أغنيتك المفضلة.",
    pathBody: "مسار واضح من أساسيات الهانغول إلى الكلمات والألعاب والكتابة الطويلة وتحديات K-POP المرخّصة.",
  },
};

const targetSentence = "저는 음악을 좋아해요.";
const guideKeys = ["ㅈ", "ㅓ", "ㄴ", "ㅡ", "ㄴ", "ㅇ", "ㅡ", "ㅁ", "ㅇ", "ㅏ", "ㄱ"];
const tetrisWords = [
  { korean: "사랑", meaning: "love" },
  { korean: "음악", meaning: "music" },
  { korean: "친구", meaning: "friend" },
  { korean: "한국", meaning: "Korea" },
];

const learningLevels = [
  "Hangul principle",
  "Home row",
  "Lower row",
  "Upper row",
  "Syllables",
  "Final consonants",
  "Double consonants",
  "Easy words",
  "Daily words",
  "Phrases",
  "Sentences",
  "Dictation",
  "Long-form",
  "K-POP challenge",
];

const activities: Array<{
  id: ActivityId;
  kicker: string;
  title: string;
  korean: string;
  description: string;
  time: string;
  accent: string;
}> = [
  {
    id: "home",
    kicker: "LEARN · 5 MIN",
    title: "Home-row practice",
    korean: "기본자리 연습",
    description: "Place your fingers and master ㅁ, ㄴ, ㅇ, ㄹ.",
    time: "Continue · 67%",
    accent: "lime",
  },
  {
    id: "tetris",
    kicker: "GAME · 2 MIN",
    title: "Word Tetris",
    korean: "단어 테트리스",
    description: "Type each Korean word before it reaches the floor.",
    time: "Best · 1,240",
    accent: "purple",
  },
  {
    id: "missing",
    kicker: "PUZZLE · 2 MIN",
    title: "Missing Letter",
    korean: "빠진 글자",
    description: "Complete familiar words one syllable at a time.",
    time: "12 words · New",
    accent: "pink",
  },
  {
    id: "crossword",
    kicker: "QUIZ · 4 MIN",
    title: "Korean Crossword",
    korean: "가로세로 퀴즈",
    description: "Connect clues, sounds, and meanings.",
    time: "4 clues · Daily",
    accent: "cyan",
  },
  {
    id: "kpop",
    kicker: "REWARD CHALLENGE",
    title: "Licensed K-POP Lyrics",
    korean: "K-POP 가사 타자",
    description: "Unlock official lyric typing after long-form Level 5.",
    time: "Locked · Level 4/5",
    accent: "stripe",
  },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [typed, setTyped] = useState("");
  const [activeActivity, setActiveActivity] = useState<ActivityId>("home");
  const [tetrisInput, setTetrisInput] = useState("");
  const [tetrisIndex, setTetrisIndex] = useState(0);
  const [tetrisScore, setTetrisScore] = useState(320);
  const [tetrisMessage, setTetrisMessage] = useState("Type the falling word.");
  const [missingAnswer, setMissingAnswer] = useState("");
  const [crosswordAnswer, setCrosswordAnswer] = useState("");

  const t = copy[locale];
  const targetChars = useMemo(() => Array.from(targetSentence), []);
  const typedChars = Array.from(typed);
  const correctChars = typedChars.reduce(
    (total, character, index) => total + (character === targetChars[index] ? 1 : 0),
    0,
  );
  const accuracy = typedChars.length === 0 ? 100 : Math.round((correctChars / typedChars.length) * 100);
  const sentenceProgress = Math.min(100, Math.round((typedChars.length / targetChars.length) * 100));
  const sentenceComplete = typed === targetSentence;
  const dailyProgress = Math.min(100, 65 + Math.round(sentenceProgress * 0.15));

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  function submitTetris(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = tetrisWords[tetrisIndex % tetrisWords.length];
    if (tetrisInput.trim() === current.korean) {
      setTetrisScore((score) => score + 100);
      setTetrisIndex((index) => index + 1);
      setTetrisInput("");
      setTetrisMessage("Perfect! +100");
    } else {
      setTetrisMessage(`Try again — ${current.meaning}`);
    }
  }

  function focusHeroPractice() {
    document.getElementById("hero-typing-input")?.focus();
  }

  return (
    <main className="site-shell" dir={locale === "ar" ? "rtl" : "ltr"}>
      <a className="skip-link" href="#practice">Skip to practice</a>

      <header className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Hangeul Pop home">
          <span className="brand-mark" aria-hidden="true">ㅎ</span>
          <span>Hangeul Pop</span>
        </a>
        <nav className="nav-links" aria-label="Main menu">
          <a href="#learn">{t.navLearn}</a>
          <a href="#games">{t.navGames}</a>
          <a href="#progress">{t.navProgress}</a>
        </nav>
        <label className="language-picker">
          <span className="sr-only">Interface language</span>
          <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="es">Español</option>
            <option value="ja">日本語</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </label>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span aria-hidden="true" /> {t.eyebrow}</p>
          <h1>
            <span>{t.headlineTop}</span>
            <span className="headline-accent">{t.headlineBottom}</span>
          </h1>
          <p className="hero-description">{t.description}</p>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={focusHeroPractice}>
              {t.start} <span aria-hidden="true">→</span>
            </button>
            <a className="button button-secondary" href="#games">{t.explore}</a>
          </div>
          <div className="trust-row" aria-label="Service highlights">
            <span><b>14</b> learning levels</span>
            <span><b>6</b> interface languages</span>
            <span><b>0</b> sign-up steps</span>
          </div>
        </div>

        <div className="practice-stage" id="practice">
          <div className="stage-orbit orbit-one" aria-hidden="true" />
          <div className="stage-orbit orbit-two" aria-hidden="true" />
          <article className="practice-card">
            <div className="practice-card-header">
              <div>
                <p className="card-kicker">{t.upNext}</p>
                <h2>{t.practiceTitle}</h2>
              </div>
              <span className="streak">4 day streak</span>
            </div>

            <div className="typing-panel">
              <div className="typing-meta">
                <span>{t.practiceHint}</span>
                <span>{typedChars.length} / {targetChars.length} letters</span>
              </div>
              <p className="target-sentence" lang="ko" aria-label={targetSentence}>
                {targetChars.map((character, index) => {
                  const state = index < typedChars.length
                    ? typedChars[index] === character ? "correct" : "incorrect"
                    : index === typedChars.length ? "current" : "pending";
                  return <span className={state} key={`${character}-${index}`}>{character}</span>;
                })}
              </p>
              <input
                id="hero-typing-input"
                className="typing-input"
                lang="ko"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                placeholder="여기에 입력하세요"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="typing-feedback"
              />
              <p className={`typing-feedback ${sentenceComplete ? "complete" : ""}`} id="typing-feedback" aria-live="polite">
                {sentenceComplete ? "Great rhythm! Sentence complete." : typedChars.length ? `${accuracy}% accurate · keep going` : "Tip: use your Korean keyboard or the on-screen key guide."}
              </p>
              <div className="key-guide" aria-label="Next Korean keys">
                {guideKeys.map((key, index) => <kbd className={index === Math.min(typedChars.length, guideKeys.length - 1) ? "active" : ""} key={`${key}-${index}`}>{key}</kbd>)}
              </div>
            </div>

            <div className="daily-meter" id="progress">
              <div className="daily-time"><b>6:30</b><span>/10 min</span></div>
              <div className="meter-copy">
                <div><span>Today’s practice</span><b>{dailyProgress}%</b></div>
                <div className="meter-track" role="progressbar" aria-label="Today’s practice" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dailyProgress}>
                  <span style={{ width: `${dailyProgress}%` }} />
                </div>
                <small>{sentenceComplete ? "Daily typing goal reached" : "2 activities in a row · 3 minutes left"}</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="activity-section" id="games" aria-labelledby="activities-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">TODAY’S 10-MINUTE PLAN</p>
            <h2 id="activities-heading">{t.nextBeat}</h2>
          </div>
          <p>{t.nextBeatHint}</p>
        </div>

        <div className="activity-grid">
          {activities.map((activity, index) => (
            <button
              className={`activity-card ${activity.accent} ${activeActivity === activity.id ? "selected" : ""}`}
              type="button"
              key={activity.id}
              onClick={() => setActiveActivity(activity.id)}
              aria-pressed={activeActivity === activity.id}
            >
              <span className="activity-number">0{index + 1}</span>
              <span className="activity-kicker">{activity.kicker}</span>
              <strong>{activity.title}<span lang="ko">{activity.korean}</span></strong>
              <span className="activity-description">{activity.description}</span>
              <span className="activity-time">{activity.time}<b aria-hidden="true">↗</b></span>
            </button>
          ))}
        </div>

        <div className="game-demo" aria-live="polite">
          {activeActivity === "home" && (
            <div className="demo-copy">
              <p className="demo-label">FOUNDATION · LESSON 02</p>
              <h3>Build reliable finger memory.</h3>
              <p>Practice small key groups, then combine them into syllables and everyday words. The lesson adapts to the keys you miss most.</p>
              <button className="button button-primary" type="button" onClick={focusHeroPractice}>Continue basic position</button>
            </div>
          )}

          {activeActivity === "tetris" && (
            <>
              <div className="tetris-board" aria-label="Word Tetris practice area">
                <span className="falling-word" lang="ko">{tetrisWords[tetrisIndex % tetrisWords.length].korean}</span>
                <span className="tetris-block block-a" /><span className="tetris-block block-b" /><span className="tetris-block block-c" />
              </div>
              <form className="demo-form" onSubmit={submitTetris}>
                <p className="demo-label">WORD TETRIS · SCORE {tetrisScore}</p>
                <h3>Type it before it lands.</h3>
                <label htmlFor="tetris-input">Korean word</label>
                <div className="inline-form">
                  <input id="tetris-input" lang="ko" value={tetrisInput} onChange={(event) => setTetrisInput(event.target.value)} autoComplete="off" />
                  <button className="button button-primary" type="submit">Drop</button>
                </div>
                <p className="form-message">{tetrisMessage}</p>
              </form>
            </>
          )}

          {activeActivity === "missing" && (
            <div className="missing-demo">
              <p className="demo-label">MISSING LETTER · WORD 3/12</p>
              <h3>Complete the word for “Hangul”.</h3>
              <div className="missing-word" lang="ko">한 <span>{missingAnswer || "?"}</span></div>
              <div className="answer-options" aria-label="Choose the missing syllable">
                {["국", "글", "강"].map((answer) => (
                  <button type="button" className={missingAnswer === answer ? "chosen" : ""} onClick={() => setMissingAnswer(answer)} key={answer}>{answer}</button>
                ))}
              </div>
              <p className={`form-message ${missingAnswer === "글" ? "success" : ""}`}>
                {!missingAnswer ? "Choose one syllable." : missingAnswer === "글" ? "Correct — 한글!" : "Almost. Try another syllable."}
              </p>
            </div>
          )}

          {activeActivity === "crossword" && (
            <>
              <div className="crossword-grid" role="grid" aria-label="Mini Korean crossword">
                <span className="blank" /><span lang="ko">한</span><span className="blank" /><span lang="ko">말</span>
                <span lang="ko">음</span><span lang="ko">국</span><span className="blank" /><span lang="ko">씀</span>
                <span className="blank" /><input lang="ko" maxLength={1} value={crosswordAnswer} onChange={(event) => setCrosswordAnswer(event.target.value)} aria-label="Crossword answer for Korean writing system" /><span className="blank" /><span className="blank" />
                <span lang="ko">노</span><span lang="ko">래</span><span className="blank" /><span lang="ko">집</span>
              </div>
              <div className="demo-copy">
                <p className="demo-label">DAILY CROSSWORD · CLUE 2</p>
                <h3>Across: Korean writing system</h3>
                <p>Type one syllable to finish 한＿.</p>
                <p className={`form-message ${crosswordAnswer === "글" ? "success" : ""}`}>
                  {!crosswordAnswer ? "One square left." : crosswordAnswer === "글" ? "Solved — 한글!" : "Check the crossing sound."}
                </p>
              </div>
            </>
          )}

          {activeActivity === "kpop" && (
            <div className="kpop-demo">
              <div className="record-disc" aria-hidden="true"><span>ㅎ</span></div>
              <div>
                <p className="demo-label">LICENSED CONTENT · LOCKED REWARD</p>
                <h3>One level until the music starts.</h3>
                <p>Complete three long-form passages with at least 95% typing accuracy and 90% spacing accuracy. Only officially licensed lyrics are shown.</p>
              </div>
              <div className="unlock-meter">
                <div><span>Long-form typing</span><b>Level 4 / 5</b></div>
                <div className="meter-track" role="progressbar" aria-label="K-POP challenge unlock" aria-valuemin={0} aria-valuemax={5} aria-valuenow={4}><span style={{ width: "80%" }} /></div>
                <small>Next: finish 2 paragraphs above 95% accuracy</small>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="learning-path" id="learn" aria-labelledby="path-heading">
        <div className="path-copy">
          <p className="section-label">A COURSE THAT GROWS WITH YOU</p>
          <h2 id="path-heading">{t.pathTitle}</h2>
          <p>{t.pathBody}</p>
          <div className="path-badges">
            <span>No Korean keyboard required</span>
            <span>Works on mobile and desktop</span>
            <span>Free core course</span>
          </div>
        </div>
        <ol className="level-track">
          {learningLevels.map((level, index) => (
            <li className={index < 4 ? "done" : index === 4 ? "current" : index === learningLevels.length - 1 ? "reward" : ""} key={level}>
              <span>{index + 1}</span>
              <p>{level}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="free-note" aria-label="Free learning promise">
        <div>
          <p className="section-label">LEARN FIRST</p>
          <h2>Free practice, without interruptions.</h2>
        </div>
        <p>Core lessons and games stay free. If ads are introduced, they appear only between activities—not beside the typing field or during a game.</p>
      </section>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">ㅎ</span><span>Hangeul Pop</span></a>
        <p>Type Korean. Play your way.</p>
        <div><a href="#learn">Curriculum</a><a href="#games">Games</a><a href="#progress">Progress</a></div>
      </footer>
    </main>
  );
}
