"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActiveLocale } from "../../use-active-locale";
import { LearningLocaleSelect } from "../LearningChrome";
import LearningTranslationNote from "../LearningTranslationNote";
import styles from "../learn.module.css";
import { learningTr as tr, useLearningTranslations } from "../learning-i18n";

/* Four lessons on why the letters look the way they do and how Korean works.
 *
 * The articulation diagrams are the reason this page exists: the claim that ㄱ is
 * the shape of the tongue root blocking the throat means nothing as a sentence
 * and everything as a picture. They are inline SVG, drawn from the theme tokens,
 * so they follow the site's light and dark palettes without a second copy.
 *
 * All prose runs through tr(), so the server renders English — which is what a
 * crawler and an assistant read — and the browser swaps to the visitor's
 * language, the same arrangement the rest of the site uses. */

type Organ = {
  jamo: string;
  nameEn: string;
  nameKo: string;
  ipa: string;
  labelEn: string;
  labelKo: string;
  bodyEn: string;
  bodyKo: string;
  art: React.ReactNode;
};

const strokeMute = "var(--hg-mute)";
const strokeLine = "var(--hg-line)";
const strokeHot = "var(--hg-vermilion)";

const lessonTabs = [
  { id: "consonants", number: "1", titleEn: "Consonants", titleKo: "자음" },
  { id: "vowels-and-blocks", number: "2", titleEn: "Vowels & blocks", titleKo: "모음과 모아쓰기" },
  { id: "birth-of-hangul", number: "3", titleEn: "Birth of Hangul", titleKo: "한글의 탄생" },
  { id: "korean-grammar", number: "4", titleEn: "Korean grammar", titleKo: "한국어 문법" },
] as const;

type LessonId = (typeof lessonTabs)[number]["id"];

function lessonIdFromHash(hash: string): LessonId | null {
  try {
    const candidate = decodeURIComponent(hash.replace(/^#/, ""));
    return lessonTabs.some((lesson) => lesson.id === candidate)
      ? candidate as LessonId
      : null;
  } catch {
    return null;
  }
}

function scrollToLessonIndex() {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  window.requestAnimationFrame(() => {
    document.getElementById("hangul-lessons")?.scrollIntoView({ behavior, block: "start" });
  });
}

const organs: Organ[] = [
  {
    jamo: "ㄱ",
    nameEn: "Molar sound",
    nameKo: "어금닛소리",
    ipa: "velar · /k/",
    labelEn: "tongue root",
    labelKo: "혀뿌리",
    bodyEn: "The back of the tongue rises to close off the throat. The bend in ㄱ is that cross-section.",
    bodyKo: "혀뿌리가 올라가 목구멍을 막는 모양. ㄱ의 꺾인 선이 그 단면입니다.",
    art: (
      <>
        <path d="M18 112 Q18 30 96 22 Q168 16 182 60" fill="none" stroke={strokeLine} strokeWidth="2" />
        <path d="M30 74 Q92 62 150 66" fill="none" stroke={strokeMute} strokeWidth="2" strokeLinecap="round" />
        <path d="M34 100 Q86 92 128 88 Q152 84 158 68" fill="none" stroke={strokeMute} strokeWidth="2.5" strokeLinecap="round" />
        <path className="hg-pulse" d="M128 88 Q152 84 158 68" fill="none" stroke={strokeHot} strokeWidth="5" strokeLinecap="round" />
      </>
    ),
  },
  {
    jamo: "ㄴ",
    nameEn: "Tongue sound",
    nameKo: "혓소리",
    ipa: "alveolar · /n/",
    labelEn: "tongue tip",
    labelKo: "혀끝",
    bodyEn: "The tip of the tongue touches the ridge behind the upper teeth. ㄴ is that tongue, seen from the side.",
    bodyKo: "혀끝이 윗잇몸에 붙는 모양. ㄴ은 그 혀의 옆모습입니다.",
    art: (
      <>
        <path d="M18 112 Q18 30 96 22 Q168 16 182 60" fill="none" stroke={strokeLine} strokeWidth="2" />
        <path d="M30 74 Q92 62 150 66" fill="none" stroke={strokeMute} strokeWidth="2" strokeLinecap="round" />
        <path d="M36 100 L36 78 L104 78" fill="none" stroke={strokeMute} strokeWidth="2.5" strokeLinejoin="round" />
        <path className="hg-pulse" d="M36 100 L36 78 L72 78" fill="none" stroke={strokeHot} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    jamo: "ㅁ",
    nameEn: "Lip sound",
    nameKo: "입술소리",
    ipa: "bilabial · /m/",
    labelEn: "closed lips",
    labelKo: "다문 입술",
    bodyEn: "A closed mouth seen head-on. ㅁ is the square the lips themselves make.",
    bodyKo: "정면에서 본 다문 입. ㅁ은 입술이 만드는 네모 그 자체입니다.",
    art: (
      <>
        <ellipse cx="100" cy="65" rx="66" ry="44" fill="none" stroke={strokeLine} strokeWidth="2" />
        <rect className="hg-pulse" x="62" y="44" width="76" height="42" rx="3" fill="none" stroke={strokeHot} strokeWidth="5" />
        <path d="M62 65 L138 65" stroke={strokeMute} strokeWidth="2" />
      </>
    ),
  },
  {
    jamo: "ㅅ",
    nameEn: "Tooth sound",
    nameKo: "잇소리",
    ipa: "sibilant · /s/",
    labelEn: "front teeth",
    labelKo: "앞니",
    bodyEn: "The pointed shape of the front teeth. ㅅ draws the air hissing between them.",
    bodyKo: "뾰족한 앞니의 모양. ㅅ은 이 사이로 바람이 새는 소리를 그렸습니다.",
    art: (
      <>
        <path d="M28 96 L172 96" stroke={strokeLine} strokeWidth="2" />
        <path className="hg-pulse" d="M100 30 L66 92 M100 30 L134 92" fill="none" stroke={strokeHot} strokeWidth="5" strokeLinecap="round" />
        <path d="M78 96 L86 74 L94 96 M106 96 L114 74 L122 96" fill="none" stroke={strokeMute} strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
  },
  {
    jamo: "ㅇ",
    nameEn: "Throat sound",
    nameKo: "목구멍소리",
    ipa: "initial ∅ · final /ŋ/",
    labelEn: "throat",
    labelKo: "목구멍",
    bodyEn: "The original letter depicts the open throat. In modern Korean, ㅇ is silent at the start of a syllable and represents /ŋ/ at the end, as in 강.",
    bodyKo: "원래 글자 모양은 열린 목구멍을 나타냅니다. 현대 한국어에서 ㅇ은 음절 첫머리에서는 소리가 없고, 강처럼 받침으로 쓰이면 /ŋ/ 소리를 냅니다.",
    art: (
      <>
        <path d="M18 112 Q18 30 96 22 Q168 16 182 60" fill="none" stroke={strokeLine} strokeWidth="2" />
        <circle className="hg-pulse" cx="146" cy="76" r="26" fill="none" stroke={strokeHot} strokeWidth="5" />
        <path d="M34 96 Q86 88 120 84" fill="none" stroke={strokeMute} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
];

const ladder: Array<{ base: string; b1: string; one: string; i1: string; two?: string; i2?: string; en: string; ko: string }> = [
  { base: "ㄱ", b1: "k", one: "ㅋ", i1: "kʰ", en: "The throat closes, then bursts open with breath", ko: "목이 막혔다가 터지며 숨이 함께 나감" },
  { base: "ㄴ", b1: "n", one: "ㄷ", i1: "t", two: "ㅌ", i2: "tʰ", en: "A touching tongue becomes a blocking one, then a bursting one", ko: "혀끝이 닿기만 하던 것이 막고, 터짐" },
  { base: "ㅁ", b1: "m", one: "ㅂ", i1: "p", two: "ㅍ", i2: "pʰ", en: "The lips part and the breath bursts through", ko: "입술이 붙었다 떨어지며 숨이 터짐" },
  { base: "ㅅ", b1: "s", one: "ㅈ", i1: "tɕ", two: "ㅊ", i2: "tɕʰ", en: "A hissing sound becomes one that sticks, then releases", ko: "새는 소리가 붙었다 터지는 소리로" },
  { base: "ㅇ", b1: "∅ / ŋ", one: "ㅎ", i1: "h", en: "Breath rubs its way out through the open throat", ko: "열린 목구멍에서 숨이 마찰하며 나감" },
];

const historyMilestones = [
  {
    year: "1443",
    titleEn: "The letters are completed",
    titleKo: "새 문자를 완성하다",
    bodyEn: "The Annals record that King Sejong completed twenty-eight new letters and named them Hunminjeongeum — Proper Sounds for the Instruction of the People.",
    bodyKo: "『세종실록』은 세종대왕이 새 문자 스물여덟 자를 완성하고, 백성을 가르치는 바른 소리라는 뜻의 ‘훈민정음’이라 이름 붙였다고 기록합니다.",
  },
  {
    year: "1444",
    titleEn: "Opposition reaches the throne",
    titleKo: "반대 상소를 마주하다",
    bodyEn: "Choe Malli and other officials argued against the new writing system. Sejong answered their objections and continued the work instead of abandoning it.",
    bodyKo: "최만리를 비롯한 일부 신하들이 새 문자에 반대하는 상소를 올렸습니다. 세종은 그 주장에 직접 답하며 창제 사업을 멈추지 않았습니다.",
  },
  {
    year: "1446",
    titleEn: "Hunminjeongeum is published",
    titleKo: "훈민정음을 세상에 펴내다",
    bodyEn: "The letters were promulgated with the Haerye, a book recording their purpose, design principles, sounds and examples of use.",
    bodyKo: "문자를 만든 목적과 제자 원리, 소리, 사용 예를 풀이한 『훈민정음 해례본』과 함께 새 글자를 세상에 반포했습니다.",
  },
  {
    year: "1997",
    titleEn: "A Memory of the World",
    titleKo: "세계기록유산이 되다",
    bodyEn: "UNESCO added the Hunminjeongeum Manuscript to the Memory of the World Register for its singular documentary value.",
    bodyKo: "유네스코는 『훈민정음 해례본』의 독보적인 기록 가치를 인정해 세계기록유산으로 등재했습니다.",
  },
] as const;

const grammarCards = [
  {
    labelEn: "1 · Word order",
    labelKo: "1 · 어순",
    titleEn: "The verb waits at the end",
    titleKo: "서술어는 문장 끝에",
    bodyEn: "A common Korean sentence follows subject–object–verb order. The action or state closes the sentence.",
    bodyKo: "한국어의 기본 문장은 대체로 주어–목적어–서술어 순서입니다. 동작이나 상태를 나타내는 말이 문장을 마무리합니다.",
    example: "저는 김치를 먹어요.",
    glossEn: "I · kimchi · eat",
    glossKo: "저는 · 김치를 · 먹어요",
  },
  {
    labelEn: "2 · Particles",
    labelKo: "2 · 조사",
    titleEn: "Small endings show each role",
    titleKo: "짧은 조사가 역할을 표시한다",
    bodyEn: "은/는 marks a topic, 이/가 a subject, 을/를 an object, and 에/에서 a place or setting. That is why Korean word order can sometimes move.",
    bodyKo: "‘은/는’은 화제를, ‘이/가’는 주어를, ‘을/를’은 목적어를, ‘에/에서’는 장소나 배경을 나타냅니다. 조사 덕분에 어순이 조금 바뀌어도 뜻을 알아볼 수 있습니다.",
    example: "서울에서 한글을 배워요.",
    glossEn: "in Seoul · Hangul · learn",
    glossKo: "서울에서 · 한글을 · 배워요",
  },
  {
    labelEn: "3 · Conjugation",
    labelKo: "3 · 활용",
    titleEn: "The ending carries time and tone",
    titleKo: "어미가 시간과 말투를 담는다",
    bodyEn: "Korean predicates do not change for I, you or they. Their endings change for tense, politeness and the kind of sentence instead.",
    bodyKo: "한국어 서술어는 ‘나·너·그들’에 따라 바뀌지 않습니다. 대신 어미가 시제와 높임, 문장의 종류를 나타냅니다.",
    example: "먹어요 · 먹었어요 · 먹을 거예요",
    glossEn: "eat · ate · will eat",
    glossKo: "현재 · 과거 · 미래",
  },
  {
    labelEn: "4 · Context",
    labelKo: "4 · 맥락",
    titleEn: "Known information can disappear",
    titleKo: "알고 있는 말은 생략할 수 있다",
    bodyEn: "A subject or object is often omitted once the context makes it clear. A complete Korean sentence can therefore be much shorter than its English translation.",
    bodyKo: "문맥에서 이미 분명한 주어나 목적어는 자주 생략합니다. 그래서 완전한 한국어 문장도 영어 번역보다 훨씬 짧아질 수 있습니다.",
    example: "먹었어요? — 네, 먹었어요.",
    glossEn: "Did [you] eat? — Yes, [I] ate.",
    glossKo: "[당신은] 먹었어요? — 네, [저는] 먹었어요.",
  },
] as const;

function VowelDot({ line, dots }: { line: "h" | "v"; dots: Array<[number, number]> }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {line === "h" ? (
        <line x1="18" y1={dots[0][1] > 50 ? 40 : 66} x2="82" y2={dots[0][1] > 50 ? 40 : 66} stroke="var(--hg-jade)" strokeWidth="6" strokeLinecap="round" />
      ) : (
        <line x1={dots[0][0] > 50 ? 34 : 66} y1="16" x2={dots[0][0] > 50 ? 34 : 66} y2="84" stroke="var(--hg-jade)" strokeWidth="6" strokeLinecap="round" />
      )}
      {dots.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill="var(--hg-vermilion)" />)}
    </svg>
  );
}

export default function HangulGuidePage() {
  const locale = useActiveLocale({ loadRuntimePack: false });
  useLearningTranslations(locale, "hangul");
  const [activeLesson, setActiveLesson] = useState<LessonId>("consonants");
  const activeLessonIndex = lessonTabs.findIndex((lesson) => lesson.id === activeLesson);
  const previousLesson = lessonTabs[activeLessonIndex - 1];
  const nextLesson = lessonTabs[activeLessonIndex + 1];

  const selectLesson = (lessonId: LessonId, updateHistory = true) => {
    setActiveLesson(lessonId);
    if (updateHistory && window.location.hash !== `#${lessonId}`) {
      window.history.pushState(null, "", `#${lessonId}`);
    }
    scrollToLessonIndex();
  };

  useEffect(() => {
    const syncFromLocation = () => {
      const lessonId = lessonIdFromHash(window.location.hash);
      setActiveLesson(lessonId ?? "consonants");
      if (lessonId) scrollToLessonIndex();
    };

    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  return (
    <main className={`hangul-guide ${styles.hangulPage}`}>
      <div className="hg-wrap">

        <nav className="hg-nav">
          <Link className="brand" href="/" aria-label="Seoul Keys home">
            <span className="brand-mark" aria-hidden="true">ㅅ</span>
            <span>Seoul Keys</span>
          </Link>
          <LearningLocaleSelect locale={locale} />
          <Link className="hg-practice" href="/#practice">
            {tr(locale, "Start practising", "타자 연습 시작")} →
          </Link>
        </nav>

        <header className="hg-plate">
          <div>
            <p className="hg-eyebrow">{tr(locale, "HANGUL GUIDE · 4 LESSONS", "한글 학습 · 4강")}</p>
            <h1>{tr(locale, "How Hangul Works", "한글 설계도")}</h1>
            <p className="hg-standfirst">
              {tr(
                locale,
                "Hangul was designed in the fifteenth century. The five basic consonants reflect speech organs, and the original vowel signs represent sky, earth and human. Understanding these patterns helps you learn the letters and practise typing.",
                "한글은 15세기에 설계된 문자입니다. 다섯 기본 자음은 발음 기관을 본뜨고, 처음의 모음 기호는 하늘·땅·사람을 나타냅니다. 이 원리를 이해하면 글자를 익히고 타자를 연습하는 데 도움이 됩니다.",
              )}
            </p>
          </div>

          <div className="hg-strokes">
            <div className="hg-stroke"><b>·</b><span>{tr(locale, "sky", "하늘")}</span><small>ARAEA</small></div>
            <div className="hg-stroke"><b>ㅡ</b><span>{tr(locale, "earth", "땅")}</span><small>EU</small></div>
            <div className="hg-stroke"><b>ㅣ</b><span>{tr(locale, "human", "사람")}</span><small>I</small></div>
          </div>
        </header>

        <LearningTranslationNote locale={locale} />
        <nav
          className="hg-section-tabs"
          id="hangul-lessons"
          role="tablist"
          aria-label={tr(locale, "Guide sections", "학습 차례")}
        >
          {lessonTabs.map((lesson, index) => (
            <button
              className={activeLesson === lesson.id ? "is-active" : undefined}
              id={`hg-tab-${lesson.id}`}
              key={lesson.id}
              type="button"
              role="tab"
              aria-controls={lesson.id}
              aria-selected={activeLesson === lesson.id}
              tabIndex={activeLesson === lesson.id ? 0 : -1}
              onClick={() => selectLesson(lesson.id)}
              onKeyDown={(event) => {
                let nextIndex = index;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % lessonTabs.length;
                else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + lessonTabs.length) % lessonTabs.length;
                else if (event.key === "Home") nextIndex = 0;
                else if (event.key === "End") nextIndex = lessonTabs.length - 1;
                else return;
                event.preventDefault();
                const nextLesson = lessonTabs[nextIndex];
                selectLesson(nextLesson.id);
                document.getElementById(`hg-tab-${nextLesson.id}`)?.focus();
              }}
            >
              <b>{locale === "ko" ? `${lesson.number}강` : lesson.number}</b>
              <span>{tr(locale, lesson.titleEn, lesson.titleKo)}</span>
            </button>
          ))}
        </nav>

        {/* ── Lesson 1 ───────────────────────────────────────────────── */}
        <section
          className="hg-lesson"
          id="consonants"
          role="tabpanel"
          aria-labelledby="hg-tab-consonants"
          hidden={activeLesson !== "consonants"}
        >
          <div className="hg-lesson-head">
            <p className="hg-lesson-no"><i>1</i> {tr(locale, "CONSONANTS", "강 · 자음")}</p>
            <h2>{tr(locale, "Drawings of a mouth making a sound", "소리 내는 모습을 그대로 본떴다")}</h2>
            <p className="hg-lede">
              {tr(
                locale,
                "There are only five basic consonants. Each one is a picture of what the mouth actually does to make that sound.",
                "자음의 기본은 다섯 자뿐입니다. 그리고 그 다섯 자는 모두, 그 소리를 낼 때 입 안이 실제로 만드는 모양을 그린 그림입니다.",
              )}
            </p>
          </div>

          <div className="hg-organs">
            {organs.map((organ) => (
              <article className="hg-organ" key={organ.jamo}>
                <div className="hg-organ-top">
                  <span className="hg-organ-glyph">{organ.jamo}</span>
                  <span className="hg-organ-name">
                    <b>{tr(locale, organ.nameEn, organ.nameKo)}</b>
                    <small>{organ.ipa}</small>
                  </span>
                </div>
                <svg viewBox="0 0 200 130" role="img" aria-label={tr(locale, organ.nameEn, organ.nameKo)}>
                  {organ.art}
                  <text className="hg-svg-label" x="16" y="122" fontSize="11" fill={strokeHot}>
                    {tr(locale, organ.labelEn, organ.labelKo)}
                  </text>
                </svg>
                <p>{tr(locale, organ.bodyEn, organ.bodyKo)}</p>
              </article>
            ))}
          </div>

          <h3>{tr(locale, "Related shapes, different sounds", "닮은 모양, 서로 다른 소리")}</h3>
          <p>
            {tr(
              locale,
              "Many consonants build on the five basic shapes. For example, ㄱ and ㅋ are related, and ㅋ is aspirated. Added strokes do not always mean more breath: ㅁ and ㅂ differ in how the sound is produced, while doubled letters such as ㄲ mark tense consonants.",
              "여러 자음은 다섯 기본 글자의 모양을 바탕으로 만들어졌습니다. 예를 들어 ㄱ과 ㅋ은 모양이 이어지며, ㅋ은 거센소리입니다. 획을 더했다고 항상 숨이 세지는 것은 아닙니다. ㅁ과 ㅂ은 소리를 내는 방식이 다르고, ㄲ처럼 겹쳐 쓴 글자는 된소리를 나타냅니다.",
            )}
          </p>

          <div className="hg-ladder-scroll">
            <table className="hg-ladder">
              <thead>
                <tr>
                  <th scope="col">{tr(locale, "BASE", "기본")}</th>
                  <th scope="col">{tr(locale, "+1 STROKE", "+1획")}</th>
                  <th scope="col">{tr(locale, "+2 STROKES", "+2획")}</th>
                  <th scope="col">{tr(locale, "WHAT CHANGES", "소리의 변화")}</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((row) => (
                  <tr key={row.base}>
                    <td className="hg-j base">{row.base}<small>{row.b1}</small></td>
                    <td className="hg-j add">{row.one}<small>{row.i1}</small></td>
                    <td className="hg-j add2">{row.two ?? ""}<small>{row.i2 ?? ""}</small></td>
                    <td>{tr(locale, row.en, row.ko)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            {tr(
              locale,
              "ㄹ sits outside this rule: it was drawn separately, for the tongue flicking as it rolls. The doubled consonants ㄲ ㄸ ㅃ ㅆ ㅉ stack the same letter twice, meaning the throat tightens further.",
              "ㄹ은 이 규칙 밖에 있는 글자로, 혀가 굴러 튀는 모양을 따로 그렸습니다. 쌍자음 ㄲ ㄸ ㅃ ㅆ ㅉ은 같은 글자를 둘로 겹쳐 목을 더 조인다는 뜻입니다.",
            )}
          </p>

          <div className="hg-note">
            <b>{tr(locale, "On the keyboard", "자판에서는")}</b>
            <p>
              {tr(
                locale,
                "A doubled consonant is not a new key — it is the basic consonant with Shift. Hold Shift on ㄱ and you get ㄲ. The principle of adding to strengthen survives in the layout itself.",
                "쌍자음은 새 키가 아니라 기본 자음에 Shift를 더해 칩니다. ㄱ 자리에서 Shift를 누르면 ㄲ이 나옵니다 — 획을 더해 소리를 세게 만든 원리가 자판에도 그대로 남아 있습니다.",
              )}
            </p>
          </div>
        </section>

        {/* ── Lesson 2 ───────────────────────────────────────────────── */}
        <section
          className="hg-lesson"
          id="vowels-and-blocks"
          role="tabpanel"
          aria-labelledby="hg-tab-vowels-and-blocks"
          hidden={activeLesson !== "vowels-and-blocks"}
        >
          <div className="hg-lesson-head">
            <p className="hg-lesson-no"><i>2</i> {tr(locale, "VOWELS & BLOCKS", "강 · 모음과 모아쓰기")}</p>
            <h2>{tr(locale, "Twenty-one vowels from three strokes", "세 획으로 스물한 자를 만든다")}</h2>
            <p className="hg-lede">
              {tr(
                locale,
                "The vowels copy nothing. Three strokes — sky, earth, human — are fixed in advance, and every vowel comes from where the dot is placed.",
                "모음에는 상형이 없습니다. 대신 하늘·땅·사람 세 획을 정해 두고, 그것을 붙이는 위치만 바꿔 모든 모음을 만들어 냅니다.",
              )}
            </p>
          </div>

          <h3>{tr(locale, "First branch — where the dot goes", "첫 갈래 — 점을 어디에 붙이는가")}</h3>
          <p>
            {tr(
              locale,
              "A dot above the earth stroke gives ㅗ, below it ㅜ. To the right of the human stroke gives ㅏ, to the left ㅓ. Four positions, four letters.",
              "땅(ㅡ) 위에 점을 얹으면 ㅗ, 아래에 놓으면 ㅜ. 사람(ㅣ) 오른쪽에 붙이면 ㅏ, 왼쪽에 붙이면 ㅓ. 네 방향이 곧 네 글자입니다.",
            )}
          </p>

          <div className="hg-vowels">
            <div className="hg-vowel"><VowelDot line="h" dots={[[50, 38]]} /><b>ㅗ</b><small>o · {tr(locale, "above", "위")}</small></div>
            <div className="hg-vowel"><VowelDot line="h" dots={[[50, 68]]} /><b>ㅜ</b><small>u · {tr(locale, "below", "아래")}</small></div>
            <div className="hg-vowel"><VowelDot line="v" dots={[[70, 50]]} /><b>ㅏ</b><small>a · {tr(locale, "right", "오른쪽")}</small></div>
            <div className="hg-vowel"><VowelDot line="v" dots={[[30, 50]]} /><b>ㅓ</b><small>eo · {tr(locale, "left", "왼쪽")}</small></div>
          </div>

          <h3>{tr(locale, "Second branch — one dot more", "둘째 갈래 — 점을 하나 더")}</h3>
          <p>
            {tr(
              locale,
              "A second dot in the same position adds a y sound in front: ㅗ→ㅛ, ㅜ→ㅠ, ㅏ→ㅑ, ㅓ→ㅕ. The number of dots is the layer of the sound.",
              "같은 자리에 점을 하나 더 찍으면 y 소리가 앞에 붙습니다. ㅗ→ㅛ, ㅜ→ㅠ, ㅏ→ㅑ, ㅓ→ㅕ. 점의 개수가 곧 소리의 층입니다.",
            )}
          </p>

          <div className="hg-vowels">
            <div className="hg-vowel"><VowelDot line="h" dots={[[36, 38], [64, 38]]} /><b>ㅛ</b><small>yo</small></div>
            <div className="hg-vowel"><VowelDot line="h" dots={[[36, 68], [64, 68]]} /><b>ㅠ</b><small>yu</small></div>
            <div className="hg-vowel"><VowelDot line="v" dots={[[64, 34], [64, 66]]} /><b>ㅑ</b><small>ya</small></div>
            <div className="hg-vowel"><VowelDot line="v" dots={[[36, 34], [36, 66]]} /><b>ㅕ</b><small>yeo</small></div>
          </div>

          <h3>{tr(locale, "Blocks — a letter fills one square", "모아쓰기 — 글자는 네모 한 칸에 들어간다")}</h3>
          <p>
            {tr(
              locale,
              "Hangul does not lay its letters out in a row — it stacks them into one square. The vowel decides how. An upright vowel (ㅏ ㅣ ㅓ) sits beside the consonant; a lying-down vowel (ㅗ ㅡ ㅜ) sits beneath it.",
              "한글은 자모를 옆으로 늘어놓지 않고 한 칸에 쌓습니다. 그리고 쌓는 방식은 중성이 결정합니다. 세로로 선 모음(ㅏ ㅣ ㅓ)이면 옆으로, 가로로 누운 모음(ㅗ ㅡ ㅜ)이면 아래로 붙습니다.",
            )}
          </p>

          <div className="hg-blocks">
            <div className="hg-block">
              <svg viewBox="0 0 220 150" role="img" aria-label="하">
                <rect x="12" y="12" width="196" height="126" rx="3" fill="none" stroke={strokeLine} strokeWidth="2" strokeDasharray="5 5" />
                <rect x="26" y="26" width="86" height="98" rx="3" fill="var(--hg-indigo-soft)" stroke="var(--hg-indigo)" strokeWidth="2" />
                <rect x="122" y="26" width="74" height="98" rx="3" fill="none" stroke="var(--hg-jade)" strokeWidth="2" />
                <text className="hg-svg-jamo" x="58" y="92" fontSize="52" fill="var(--hg-indigo)">ㅎ</text>
                <text className="hg-svg-jamo" x="146" y="92" fontSize="52" fill="var(--hg-jade)">ㅏ</text>
              </svg>
              <b>{tr(locale, "하 — side by side", "하 — 옆으로 모임")}</b>
              <p>{tr(locale, "An upright vowel stands to the right of the first consonant.", "중성이 세로로 서 있으면 초성 오른쪽에 나란히 놓입니다.")}</p>
            </div>

            <div className="hg-block">
              <svg viewBox="0 0 220 150" role="img" aria-label="호">
                <rect x="12" y="12" width="196" height="126" rx="3" fill="none" stroke={strokeLine} strokeWidth="2" strokeDasharray="5 5" />
                <rect x="26" y="24" width="168" height="56" rx="3" fill="var(--hg-indigo-soft)" stroke="var(--hg-indigo)" strokeWidth="2" />
                <rect x="26" y="88" width="168" height="38" rx="3" fill="none" stroke="var(--hg-jade)" strokeWidth="2" />
                <text className="hg-svg-jamo" x="88" y="70" fontSize="44" fill="var(--hg-indigo)">ㅎ</text>
                <text className="hg-svg-jamo" x="88" y="122" fontSize="34" fill="var(--hg-jade)">ㅗ</text>
              </svg>
              <b>{tr(locale, "호 — stacked below", "호 — 아래로 모임")}</b>
              <p>{tr(locale, "A lying-down vowel lies under the first consonant.", "중성이 가로로 누우면 초성 아래에 깔립니다.")}</p>
            </div>

            <div className="hg-block">
              <svg viewBox="0 0 220 150" role="img" aria-label="한">
                <rect x="12" y="12" width="196" height="126" rx="3" fill="none" stroke={strokeLine} strokeWidth="2" strokeDasharray="5 5" />
                <rect x="26" y="22" width="86" height="66" rx="3" fill="var(--hg-indigo-soft)" stroke="var(--hg-indigo)" strokeWidth="2" />
                <rect x="122" y="22" width="72" height="66" rx="3" fill="none" stroke="var(--hg-jade)" strokeWidth="2" />
                <rect x="26" y="96" width="168" height="32" rx="3" fill="none" stroke={strokeHot} strokeWidth="2" />
                <text className="hg-svg-jamo" x="56" y="72" fontSize="40" fill="var(--hg-indigo)">ㅎ</text>
                <text className="hg-svg-jamo" x="146" y="72" fontSize="40" fill="var(--hg-jade)">ㅏ</text>
                <text className="hg-svg-jamo" x="98" y="124" fontSize="28" fill={strokeHot}>ㄴ</text>
              </svg>
              <b>{tr(locale, "한 — with a final consonant", "한 — 받침이 붙으면")}</b>
              <p>{tr(locale, "The final sound always lies along the floor of the square, and the three parts divide it between them.", "끝소리는 늘 칸의 바닥에 깔립니다. 초성·중성·종성이 한 칸을 셋으로 나눠 씁니다.")}</p>
            </div>
          </div>

          <div className="hg-note">
            <b>{tr(locale, "On the keyboard", "자판에서는")}</b>
            <p>
              {tr(
                locale,
                "The standard layout splits along exactly this seam — consonants on the left hand, vowels on the right. Type ㅎ, ㅏ, ㄴ in order and the three letters assemble themselves into the single square 한. Blocking is the keyboard's job, not yours.",
                "두벌식 자판은 이 구조를 그대로 나눠 놓았습니다 — 왼손은 자음, 오른손은 모음. ㅎ ㅏ ㄴ을 차례로 치면 세 글자가 저절로 '한' 한 칸으로 모입니다. 모아쓰기는 손이 하는 일이 아니라 자판이 대신 해 줍니다.",
              )}
            </p>
          </div>
        </section>

        {/* ── Lesson 3 ───────────────────────────────────────────────── */}
        <section
          className="hg-lesson"
          id="birth-of-hangul"
          role="tabpanel"
          aria-labelledby="hg-tab-birth-of-hangul"
          hidden={activeLesson !== "birth-of-hangul"}
        >
          <div className="hg-lesson-head">
            <p className="hg-lesson-no"><i>3</i> {tr(locale, "HISTORY", "강 · 역사")}</p>
            <h2>{tr(locale, "A script made for people — with its birth recorded", "백성을 위해 만들고, 탄생을 기록한 문자")}</h2>
            <p className="hg-lede">
              {tr(
                locale,
                "Korean speech did not fit Classical Chinese writing, and learning Chinese characters demanded time that most ordinary people did not have. King Sejong created a writing system that people could learn and use for their own words.",
                "우리말은 한문과 구조가 달랐고, 한자를 익히려면 많은 시간과 교육이 필요했습니다. 세종대왕은 평범한 백성도 자기 말을 글로 쉽게 옮길 수 있도록 새로운 문자 체계를 만들었습니다.",
              )}
            </p>
          </div>

          <div className="hg-history-grid">
            <article className="hg-history-callout">
              <p className="hg-history-kicker">{tr(locale, "WHO MADE HANGUL?", "누가 한글을 만들었을까?")}</p>
              <h3>{tr(locale, "The creator named in the record is King Sejong", "기록이 밝힌 창제자는 세종대왕입니다")}</h3>
              <p>
                {tr(
                  locale,
                  "The Annals and Jeong Inji’s postface say that Sejong created the twenty-eight letters. Eight Hall of Worthies scholars wrote the Haerye explanations and helped prepare the publication. The surviving record therefore distinguishes the king’s creation from the scholars’ work of explanation and promulgation.",
                  "『세종실록』과 정인지의 서문은 세종이 스물여덟 자를 창제했다고 분명히 적습니다. 집현전 학자 여덟 명은 해례를 집필하고 반포를 도왔습니다. 남아 있는 기록은 세종의 문자 창제와 학자들의 해설·간행 역할을 구분해 전합니다.",
                )}
              </p>
            </article>

            <article className="hg-history-callout">
              <p className="hg-history-kicker">{tr(locale, "WHY IS IT EXCEPTIONAL?", "무엇이 특별할까?")}</p>
              <h3>{tr(locale, "Its maker, date, purpose and principles survive together", "만든 사람·시기·목적·원리가 함께 남았습니다")}</h3>
              <p>
                {tr(
                  locale,
                  "The Hunminjeongeum Haerye preserves the creator, purpose and design principles of Hangul in a contemporary document. Its preface explains the aim of helping ordinary people express themselves in writing.",
                  "『훈민정음 해례본』에는 만든 사람과 창제 목적, 제자 원리가 당대의 기록으로 남아 있습니다. 서문은 평범한 백성이 자기 뜻을 글로 쉽게 표현하게 하려는 목적을 밝힙니다.",
                )}
              </p>
            </article>
          </div>

          <div className="hg-timeline" aria-label={tr(locale, "Hangul history timeline", "한글 역사 연표")}>
            {historyMilestones.map((item) => (
              <article className="hg-timeline-item" key={item.year}>
                <time>{item.year}</time>
                <div>
                  <h3>{tr(locale, item.titleEn, item.titleKo)}</h3>
                  <p>{tr(locale, item.bodyEn, item.bodyKo)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="hg-hangeul-day">
            <span aria-hidden="true">10.9</span>
            <div>
              <p className="hg-history-kicker">{tr(locale, "HANGEUL DAY · A NATIONAL HOLIDAY", "한글날 · 대한민국 국경일")}</p>
              <h3>{tr(locale, "A country that celebrates the birth of its script", "문자의 탄생을 함께 기념하는 나라")}</h3>
              <p>
                {tr(
                  locale,
                  "South Korea marks 9 October as Hangeul Day, a national holiday honoring the promulgation of Hunminjeongeum and the value of Hangul. The first modern celebration was held in 1926 under the name Gagyanal; the discovery of the Haerye manuscript later provided the basis for today’s date.",
                  "대한민국은 훈민정음 반포와 한글의 가치를 기려 매년 10월 9일을 국경일인 한글날로 기념합니다. 현대의 첫 기념식은 1926년 ‘가갸날’이라는 이름으로 열렸고, 뒤에 발견된 해례본의 기록을 바탕으로 오늘의 날짜가 정해졌습니다.",
                )}
              </p>
            </div>
          </div>

          <div className="hg-sources">
            <b>{tr(locale, "Primary references", "근거 자료")}</b>
            <a href="https://sillok.history.go.kr/id/kda_12602020_001" rel="noreferrer" target="_blank">
              {tr(locale, "Annals of King Sejong · The 1444 opposition memorial", "조선왕조실록 · 1444년 훈민정음 반대 상소")}
            </a>
            <a href="https://www.heritage.go.kr/heri/html/HtmlPage.do?pageNo=1_2_2_0&pg=%2Funesco%2FMemHeritage%2FMemHeritage_01.jsp" rel="noreferrer" target="_blank">
              {tr(locale, "Korea Heritage Service · Hunminjeongeum Haerye", "국가유산청 · 훈민정음 해례본")}
            </a>
            <a href="https://www.unesco.org/en/memory-world/hunminjeongeum-manuscript" rel="noreferrer" target="_blank">
              {tr(locale, "UNESCO · Hunminjeongeum Manuscript", "유네스코 · 훈민정음 해례본")}
            </a>
            <a href="https://www.korean.go.kr/nkview/news/10/102.htm" rel="noreferrer" target="_blank">
              {tr(locale, "National Institute of Korean Language · Hangeul Day", "국립국어원 · 한글날의 유래와 변천")}
            </a>
          </div>
        </section>

        {/* ── Lesson 4 ───────────────────────────────────────────────── */}
        <section
          className="hg-lesson"
          id="korean-grammar"
          role="tabpanel"
          aria-labelledby="hg-tab-korean-grammar"
          hidden={activeLesson !== "korean-grammar"}
        >
          <div className="hg-lesson-head">
            <p className="hg-lesson-no"><i>4</i> {tr(locale, "GRAMMAR", "강 · 문법")}</p>
            <h2>{tr(locale, "Hangul is the script; Korean has the grammar", "한글은 문자이고, 문법은 한국어의 규칙입니다")}</h2>
            <p className="hg-lede">
              {tr(
                locale,
                "Hangul tells you how Korean sounds are written. Korean grammar tells you how those written words work together. Start with four patterns and you can already see the skeleton of an everyday sentence.",
                "한글은 한국어의 소리를 어떻게 적는지 알려 주고, 한국어 문법은 그렇게 적은 말들이 어떻게 어울리는지 알려 줍니다. 네 가지 원리만 익혀도 일상 문장의 뼈대가 보이기 시작합니다.",
              )}
            </p>
          </div>

          <div className="hg-grammar-formula" aria-label={tr(locale, "Korean sentence order", "한국어 문장 순서")}>
            <span><small>{tr(locale, "SUBJECT", "주어")}</small>저는</span>
            <i aria-hidden="true">+</i>
            <span><small>{tr(locale, "OBJECT", "목적어")}</small>한글을</span>
            <i aria-hidden="true">+</i>
            <span><small>{tr(locale, "PREDICATE", "서술어")}</small>배워요</span>
          </div>

          <div className="hg-grammar-grid">
            {grammarCards.map((card) => (
              <article className="hg-grammar-card" key={card.labelEn}>
                <p className="hg-grammar-label">{tr(locale, card.labelEn, card.labelKo)}</p>
                <h3>{tr(locale, card.titleEn, card.titleKo)}</h3>
                <p>{tr(locale, card.bodyEn, card.bodyKo)}</p>
                <div className="hg-example" lang="ko">
                  <b>{card.example}</b>
                  <small>{tr(locale, card.glossEn, card.glossKo)}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="hg-note">
            <b>{tr(locale, "The safest first speaking style", "처음 익히기 좋은 말투")}</b>
            <p>
              {tr(
                locale,
                "Use the polite -요 style first: 안녕하세요, 감사해요, 먹어요. It works in most everyday situations without sounding either too stiff or too casual. Formal -습니다 and casual speech can come after this foundation.",
                "처음에는 정중한 ‘-요’체부터 익혀 보세요. ‘안녕하세요, 감사해요, 먹어요’처럼 쓰면 지나치게 딱딱하거나 가볍지 않아 대부분의 일상 상황에서 안전합니다. 격식체 ‘-습니다’와 반말은 이 기초 뒤에 배워도 충분합니다.",
              )}
            </p>
          </div>
        </section>

        <nav className="hg-lesson-pager" aria-label={tr(locale, "Guide sections", "학습 차례")}>
          {previousLesson ? (
            <button
              type="button"
              aria-label={tr(locale, previousLesson.titleEn, previousLesson.titleKo)}
              onClick={() => selectLesson(previousLesson.id)}
            >
              <i aria-hidden="true">←</i>
              <span>
                <b>{locale === "ko" ? `${previousLesson.number}강` : previousLesson.number}</b>
                {tr(locale, previousLesson.titleEn, previousLesson.titleKo)}
              </span>
            </button>
          ) : <span aria-hidden="true" />}
          {nextLesson ? (
            <button
              className="is-next"
              type="button"
              aria-label={tr(locale, nextLesson.titleEn, nextLesson.titleKo)}
              onClick={() => selectLesson(nextLesson.id)}
            >
              <span>
                <b>{locale === "ko" ? `${nextLesson.number}강` : nextLesson.number}</b>
                {tr(locale, nextLesson.titleEn, nextLesson.titleKo)}
              </span>
              <i aria-hidden="true">→</i>
            </button>
          ) : <span aria-hidden="true" />}
        </nav>

        <footer className="hg-footer">
          <p>
            {tr(
              locale,
              "The letter-design lessons follow the principles set out in the Hunminjeongeum Haerye (1446). The history section distinguishes documented fact from later retelling, and the grammar section is a practical starting point rather than a complete grammar reference.",
              "문자 설계 강의는 『훈민정음 해례본』(1446)이 밝힌 제자 원리를 따릅니다. 역사 부분은 기록으로 확인되는 사실과 후대의 이야기를 구분했고, 문법 부분은 완전한 문법서가 아니라 첫 문장을 만들기 위한 입문입니다.",
            )}
          </p>
          <Link className="hg-practice" href="/#practice">
            {tr(locale, "Now try typing it", "이제 직접 쳐 보기")} →
          </Link>
        </footer>

      </div>
    </main>
  );
}
