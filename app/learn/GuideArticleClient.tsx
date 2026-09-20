"use client";

import Link from "next/link";
import type { Locale } from "../locale-detection";
import { useActiveLocale } from "../use-active-locale";
import type {
  GuideExample,
  GuideTable,
  LearningGuide,
} from "./guides";
import { isGuideTypingLiteral } from "./guide-typing-literals";
import { LearningFooter, LearningHeader } from "./LearningChrome";
import { learningTr, useLearningTranslations } from "./learning-i18n";
import styles from "./learn.module.css";

export type RelatedGuideCard = Pick<
  LearningGuide,
  "slug" | "cardTitle" | "readMinutes" | "accent"
>;

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function GuideTableView({ locale, table }: { locale: Locale; table: GuideTable }) {
  const translateCell = (value: string) => isGuideTypingLiteral(value)
    ? value
    : learningTr(locale, value);

  return (
    <div className={styles.tableWrap}>
      <table>
        <caption>{learningTr(locale, table.caption)}</caption>
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th scope="col" key={header}>{learningTr(locale, header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}${rowIndex}`}>
              {row.map((cell, cellIndex) => {
                const literal = isGuideTypingLiteral(cell);
                return (
                  <td
                    dir={literal ? "ltr" : undefined}
                    key={`${cell}${cellIndex}`}
                    lang={literal && /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(cell) ? "ko" : undefined}
                  >
                    {translateCell(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Examples({ examples, locale }: { examples: GuideExample[]; locale: Locale }) {
  return (
    <div className={styles.examples}>
      {examples.map((example, index) => (
        <div className={styles.example} key={`${example.label}${index}`}>
          <div className={styles.exampleHead}>
            <span>{learningTr(locale, example.label)}</span>
            <code dir="ltr">{example.keys}</code>
          </div>
          <div className={styles.exampleResult} dir="ltr">
            <span aria-hidden="true">→</span>
            <strong lang="ko">{example.result}</strong>
          </div>
          <p
            dir={isGuideTypingLiteral(example.note) ? "ltr" : undefined}
            lang={/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(example.note) ? "ko" : undefined}
          >
            {isGuideTypingLiteral(example.note) ? example.note : learningTr(locale, example.note)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function GuideArticleClient({
  guide,
  relatedGuides,
}: {
  guide: LearningGuide;
  relatedGuides: RelatedGuideCard[];
}) {
  const locale = useActiveLocale({ loadRuntimePack: false });
  useLearningTranslations(locale, guide.slug);

  return (
    <div className={styles.page}>
      <LearningHeader />

      <main id="main-content" className={styles.contentWidth}>
        <nav className={styles.breadcrumb} aria-label={learningTr(locale, "Breadcrumb", "이동 경로")}>
          <Link href="/">{learningTr(locale, "Home", "홈")}</Link>
          <span aria-hidden="true">/</span>
          <Link href="/learn">{learningTr(locale, "Learn", "학습")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{learningTr(locale, guide.cardTitle)}</span>
        </nav>

        <header className={styles.guideHero} data-accent={guide.accent}>
          <p className={styles.guideEyebrow}>{learningTr(locale, guide.eyebrow)}</p>
          <h1>{learningTr(locale, guide.title)}</h1>
          <p className={styles.guideStandfirst}>{learningTr(locale, guide.description)}</p>
          <div className={styles.articleMeta}>
            <span>{learningTr(locale, "By Seoul Keys", "Seoul Keys 작성")}</span>
            <span>{locale === "ko"
              ? `${guide.readMinutes}분 분량`
              : `${guide.readMinutes} ${learningTr(locale, "min read", "분 분량")}`}</span>
            <span>
              {learningTr(locale, "Updated", "업데이트")} {" "}
              <time dateTime={guide.updated}>{formatDate(locale, guide.updated)}</time>
            </span>
          </div>
        </header>

        <div className={styles.articleLayout}>
          <aside className={styles.toc}>
            <p>{learningTr(locale, "On this page", "이 페이지의 내용")}</p>
            <ol>
              <li><a href="#learning-goals">{learningTr(locale, "Learning goals", "학습 목표")}</a></li>
              <li><a href="#quick-answer">{learningTr(locale, "Quick answer", "짧은 답")}</a></li>
              {guide.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{learningTr(locale, section.title)}</a>
                </li>
              ))}
              <li><a href="#guided-drill">{learningTr(locale, "Guided drill", "안내형 연습")}</a></li>
              <li><a href="#common-mistakes">{learningTr(locale, "Common mistakes", "자주 하는 실수")}</a></li>
              <li><a href="#frequently-asked-questions">{learningTr(locale, "FAQ", "자주 묻는 질문")}</a></li>
            </ol>
          </aside>

          <article className={styles.article}>
            <section className={styles.learningGoals} id="learning-goals">
              <h2>{learningTr(locale, "What you will learn", "배우게 될 내용")}</h2>
              <ul>
                {guide.learningGoals.map((goal) => (
                  <li key={goal}>{learningTr(locale, goal)}</li>
                ))}
              </ul>
            </section>

            <div className={styles.intro}>
              {guide.intro.map((paragraph) => (
                <p key={paragraph}>{learningTr(locale, paragraph)}</p>
              ))}
            </div>

            <section className={styles.quickAnswer} id="quick-answer">
              <h2>{learningTr(locale, "The short answer", "짧게 답하면")}</h2>
              <p>{learningTr(locale, guide.quickAnswer)}</p>
            </section>

            {guide.sections.map((section) => (
              <section className={styles.section} id={section.id} key={section.id}>
                <h2>{learningTr(locale, section.title)}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{learningTr(locale, paragraph)}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{learningTr(locale, bullet)}</li>
                    ))}
                  </ul>
                ) : null}
                {section.steps ? (
                  <ol>
                    {section.steps.map((step) => (
                      <li key={step}>{learningTr(locale, step)}</li>
                    ))}
                  </ol>
                ) : null}
                {section.table ? <GuideTableView locale={locale} table={section.table} /> : null}
                {section.examples ? <Examples examples={section.examples} locale={locale} /> : null}
                {section.note ? (
                  <aside className={styles.callout}>
                    <h3>{learningTr(locale, section.note.title)}</h3>
                    <p>{learningTr(locale, section.note.body)}</p>
                  </aside>
                ) : null}
              </section>
            ))}

            <section className={styles.drill} id="guided-drill">
              <h2>{learningTr(locale, guide.drill.title)}</h2>
              <p>{learningTr(locale, guide.drill.instructions)}</p>
              <div className={styles.drillList}>
                {guide.drill.items.map((item, index) => (
                  <div className={styles.drillItem} key={`${item.label}${index}`}>
                    <b>{learningTr(locale, item.label)}</b>
                    <code dir="ltr">{item.keys}</code>
                    <strong dir="ltr" lang="ko">{item.result}</strong>
                    <span
                      dir={isGuideTypingLiteral(item.note) ? "ltr" : undefined}
                      lang={/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(item.note) ? "ko" : undefined}
                    >
                      {isGuideTypingLiteral(item.note) ? item.note : learningTr(locale, item.note)}
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.checkpoint}>
                <strong>{learningTr(locale, "Checkpoint:", "확인 기준:")}</strong>{" "}
                {learningTr(locale, guide.drill.checkpoint)}
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} href="/#practice">
                  {learningTr(locale, "Practise with live feedback", "실시간 피드백으로 연습하기")}
                </Link>
              </div>
            </section>

            <section className={styles.mistakesBlock} id="common-mistakes">
              <h2>{learningTr(locale, "Common mistakes and precise fixes", "자주 하는 실수와 정확한 해결법")}</h2>
              <div className={styles.mistakeGrid}>
                {guide.mistakes.map((item) => (
                  <article className={styles.mistakeCard} key={item.mistake}>
                    <h3>{learningTr(locale, item.mistake)}</h3>
                    <p>
                      <span className={styles.fixLabel}>{learningTr(locale, "Fix", "해결")}</span>
                      {learningTr(locale, item.fix)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.faqBlock} id="frequently-asked-questions">
              <h2>{learningTr(locale, "Frequently asked questions", "자주 묻는 질문")}</h2>
              {guide.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{learningTr(locale, faq.question)}</summary>
                  <p>{learningTr(locale, faq.answer)}</p>
                </details>
              ))}
            </section>

            <aside className={styles.editorial}>
              <h2>{learningTr(locale, "About this guide", "이 가이드에 관하여")}</h2>
              <p>
                {learningTr(
                  locale,
                  "Written and maintained by Seoul Keys. The lesson separates standard Hangul spelling, physical key positions, and input-method behavior so each example can be checked directly. Platform-specific settings link to documentation from the platform owner. Last editorial review:",
                  "Seoul Keys가 작성하고 관리합니다. 각 예시를 직접 확인할 수 있도록 표준 한글 맞춤법, 물리적 키 위치, 입력기 동작을 구분합니다. 플랫폼별 설정은 해당 플랫폼 운영사의 문서로 연결됩니다. 최종 편집 검토:",
                )}{" "}
                {formatDate(locale, guide.updated)}.
              </p>
            </aside>

            <section className={styles.references}>
              <h2>{learningTr(locale, "Sources and further reading", "출처 및 더 읽을거리")}</h2>
              <p>{learningTr(
                locale,
                "These links support the technical model or current setup paths used above. Seoul Keys’ explanations and exercises are written for this guide.",
                "아래 링크는 위에서 사용한 기술 모델과 현재 설정 경로의 근거입니다. Seoul Keys의 설명과 연습은 이 가이드를 위해 직접 작성했습니다.",
              )}</p>
              <ul>
                {guide.references.map((reference) => (
                  <li key={reference.url}>
                    <a href={reference.url} rel="noreferrer" target="_blank">
                      {learningTr(locale, reference.title)}
                    </a>{" "}
                    — {learningTr(locale, reference.publisher)}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.relatedBlock}>
              <h2>{learningTr(locale, "Continue learning", "계속 학습하기")}</h2>
              <p>{learningTr(
                locale,
                "Choose the next concept that matches your current typing problem.",
                "현재 타자 문제에 맞는 다음 개념을 선택하세요.",
              )}</p>
              <div className={styles.relatedGrid}>
                {relatedGuides.map((related) => (
                  <Link
                    className={styles.relatedCard}
                    data-accent={related.accent}
                    href={`/learn/${related.slug}`}
                    key={related.slug}
                  >
                    <span>{learningTr(locale, related.cardTitle)}</span>
                    <small>{locale === "ko"
                      ? `${related.readMinutes}분 →`
                      : `${related.readMinutes} ${learningTr(locale, "min", "분")} →`}</small>
                  </Link>
                ))}
              </div>
              <Link className={styles.backToLibrary} href="/learn">
                ← {learningTr(locale, "Back to the learning library", "학습 가이드로 돌아가기")}
              </Link>
            </section>
          </article>
        </div>
      </main>

      <section className={styles.ctaWrap}>
        <div className={`${styles.contentWidth} ${styles.ctaPanel}`}>
          <p className={styles.sectionEyebrow}>{learningTr(locale, "Ready for a real round?", "실전 연습을 시작할까요?")}</p>
          <h2>{learningTr(locale, "Turn this lesson into muscle memory.", "이 수업을 근육 기억으로 바꿔 보세요.")}</h2>
          <p>{learningTr(
            locale,
            "Use the guided Korean typing track for immediate key hints, accuracy feedback, and short sessions.",
            "안내형 한글 타자 과정을 통해 즉각적인 키 힌트, 정확도 피드백, 짧은 연습을 이용하세요.",
          )}</p>
          <div className={styles.ctaActions}>
            <Link className={styles.primaryButton} href="/#practice">
              {learningTr(locale, "Start Korean typing practice", "한글 타자 연습 시작")}
            </Link>
            <Link className={styles.secondaryButton} href="/learn">
              {learningTr(locale, "Browse every guide", "모든 가이드 보기")}
            </Link>
          </div>
        </div>
      </section>

      <LearningFooter />
    </div>
  );
}
