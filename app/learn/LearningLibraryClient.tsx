"use client";

import Link from "next/link";
import type { Locale } from "../locale-detection";
import { useActiveLocale } from "../use-active-locale";
import type { GuideAccent } from "./guides";
import { LearningFooter, LearningHeader } from "./LearningChrome";
import { learningTr, useLearningTranslations } from "./learning-i18n";
import styles from "./learn.module.css";

export type LearningGuideCard = {
  slug: string;
  cardTitle: string;
  description: string;
  eyebrow: string;
  readMinutes: number;
  accent: GuideAccent;
};

function GuideCards({ cards, locale }: { cards: LearningGuideCard[]; locale: Locale }) {
  return (
    <div className={styles.guideGrid}>
      {cards.map((guide) => (
        <Link
          className={styles.guideCard}
          data-accent={guide.accent}
          href={`/learn/${guide.slug}`}
          key={guide.slug}
        >
          <span className={styles.cardTag}>{learningTr(locale, guide.eyebrow)}</span>
          <h3>{learningTr(locale, guide.cardTitle)}</h3>
          <p>{learningTr(locale, guide.description)}</p>
          <span className={styles.cardMeta}>
            {locale === "ko"
              ? `${guide.readMinutes}분 분량`
              : `${guide.readMinutes} ${learningTr(locale, "min read", "분 분량")}`} · {learningTr(locale, "Includes a guided drill", "안내형 연습 포함")}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function LearningLibraryClient({ cards }: { cards: LearningGuideCard[] }) {
  const locale = useActiveLocale({ loadRuntimePack: false });
  useLearningTranslations(locale);

  return (
    <div className={styles.page}>
      <LearningHeader libraryCurrent />

      <main id="main-content">
        <section className={styles.hubHero}>
          <div className={`${styles.contentWidth} ${styles.hubHeroGrid}`}>
            <div>
              <p className={styles.eyebrow}>
                {learningTr(locale, "Seoul Keys · Learning library", "Seoul Keys · 학습 가이드")}
              </p>
              <h1>
                {learningTr(locale, "Understand Hangul.", "한글을 이해하고,")}
                <span>{learningTr(locale, "Then make it move.", "손끝으로 움직여 보세요.")}</span>
              </h1>
              <p className={styles.heroLead}>
                {learningTr(
                  locale,
                  "The Korean keyboard becomes much easier when every movement has a reason. Learn how letters form, where they live on the 2-set layout, and how to practise them without relying on romanization.",
                  "손가락의 움직임마다 이유를 알면 한글 키보드가 훨씬 쉬워집니다. 글자가 만들어지는 원리, 두벌식 자판의 위치, 로마자 표기에 기대지 않는 연습법을 배워 보세요.",
                )}
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} href="#guides">
                  {learningTr(locale, "Browse the guides", "가이드 둘러보기")}
                </Link>
                <Link className={styles.secondaryButton} href="/#practice">
                  {learningTr(locale, "Open typing practice", "타자 연습 열기")}
                </Link>
              </div>
            </div>

            <div
              className={styles.heroDiagram}
              aria-label={learningTr(
                locale,
                "A Hangul syllable block made from ㅎ, ㅏ, and ㄴ",
                "ㅎ, ㅏ, ㄴ으로 만든 한글 음절 블록",
              )}
            >
              <div className={styles.blockDemo} aria-hidden="true">
                <b>ㅎ</b>
                <b>ㅏ</b>
                <b>ㄴ</b>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.librarySection} id="guides">
          <div className={styles.contentWidth}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionEyebrow}>{learningTr(locale, "Nine focused guides", "핵심 가이드 9편")}</p>
              <h2>{learningTr(locale, "Start with the question in front of you.", "지금 궁금한 것부터 시작하세요.")}</h2>
              <p>{learningTr(
                locale,
                "Each guide stands on its own, then links explanation to a small practice task. Begin with the alphabet’s design, set up your device, or go directly to the movement that is slowing you down.",
                "각 가이드는 독립적으로 읽을 수 있고, 설명 뒤에는 짧은 연습이 이어집니다. 한글의 설계 원리부터 시작하거나, 기기 설정을 마치거나, 막히는 손동작으로 바로 이동하세요.",
              )}</p>
            </div>

            <Link className={styles.featuredCard} href="/learn/hangul">
              <div>
                <span className={styles.cardTag}>{learningTr(locale, "Illustrated foundation", "그림으로 배우는 기초")}</span>
                <h3>{learningTr(
                  locale,
                  "How Hangul Works — the design behind the letters",
                  "한글은 어떻게 작동할까 — 글자에 담긴 설계 원리",
                )}</h3>
                <p>{learningTr(
                  locale,
                  "See how the five basic consonants draw the speech organs and how vowel strokes grow from sky, earth, and human.",
                  "다섯 기본 자음이 발음 기관을 본뜬 방식과 모음 획이 하늘·땅·사람에서 확장되는 원리를 살펴보세요.",
                )}</p>
              </div>
              <span className={styles.cardArrow} aria-hidden="true">→</span>
            </Link>

            <GuideCards cards={cards} locale={locale} />
          </div>
        </section>

        <section className={styles.methodSection}>
          <div className={`${styles.contentWidth} ${styles.methodGrid}`}>
            <div className={styles.methodCopy}>
              <p className={styles.sectionEyebrow}>{learningTr(locale, "How these lessons are made", "가이드를 만드는 원칙")}</p>
              <h2>{learningTr(locale, "Explanation you can verify at the keyboard.", "키보드에서 직접 확인할 수 있는 설명.")}</h2>
              <p>{learningTr(
                locale,
                "Every lesson separates Korean spelling, physical key positions, and input-method behavior. That makes the examples testable and keeps a pronunciation shortcut from becoming a typing rule.",
                "모든 가이드는 한글 맞춤법, 물리적인 키 위치, 입력기 동작을 구분합니다. 그래서 예시를 직접 검증할 수 있고 발음상의 편법이 타자 규칙으로 굳는 일을 막습니다.",
              )}</p>
            </div>
            <div className={styles.principles}>
              {[
                {
                  title: learningTr(locale, "One search intent per guide", "가이드마다 하나의 검색 목적"),
                  body: learningTr(locale, "Setup, layout, composition, technique, and troubleshooting remain distinct.", "설정, 자판 배열, 조합, 타자법, 문제 해결을 명확히 구분합니다."),
                },
                {
                  title: learningTr(locale, "Real keystrokes beside every result", "실제 입력 키와 결과를 함께"),
                  body: learningTr(locale, "Examples show both the 2-set key path and the composed Hangul output.", "예시는 두벌식 키 입력 경로와 조합된 한글 결과를 함께 보여 줍니다."),
                },
                {
                  title: learningTr(locale, "Primary technical references", "신뢰할 수 있는 기술 자료"),
                  body: learningTr(locale, "Platform steps link to Apple, Google, and Microsoft; composition links to Unicode.", "기기 설정은 Apple, Google, Microsoft 문서로, 글자 조합은 Unicode 자료로 연결합니다."),
                },
                {
                  title: learningTr(locale, "A practice checkpoint, not filler", "채우기용이 아닌 확인 연습"),
                  body: learningTr(locale, "Each lesson finishes with a bounded task and a clear signal for moving on.", "각 수업은 범위가 분명한 과제와 다음 단계로 넘어갈 기준으로 끝납니다."),
                },
              ].map(({ title, body }, index) => (
                <article className={styles.principle} key={title}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaWrap}>
          <div className={`${styles.contentWidth} ${styles.ctaPanel}`}>
            <p className={styles.sectionEyebrow}>{learningTr(locale, "From explanation to muscle memory", "설명에서 근육 기억으로")}</p>
            <h2>{learningTr(locale, "Read one idea. Practise it immediately.", "한 가지를 읽고, 바로 연습하세요.")}</h2>
            <p>{learningTr(
              locale,
              "Seoul Keys turns the 2-set keyboard into short lessons, words, sentences, and games with immediate feedback.",
              "Seoul Keys는 두벌식 키보드를 즉각적인 피드백이 있는 짧은 수업, 단어, 문장, 게임으로 바꿉니다.",
            )}</p>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryButton} href="/#practice">
                {learningTr(locale, "Start a practice round", "연습 시작하기")}
              </Link>
              <Link className={styles.secondaryButton} href="/learn/korean-typing-practice-plan">
                {learningTr(locale, "Follow the four-week plan", "4주 계획 따라가기")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LearningFooter />
    </div>
  );
}
