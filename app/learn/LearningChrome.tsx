"use client";

import Link from "next/link";
import {
  type Locale,
  saveManualLocalePreference,
  supportedLocaleCodes,
} from "../locale-detection";
import { useActiveLocale } from "../use-active-locale";
import {
  learningTr,
  loadLearningTranslations,
  useLearningTranslations,
} from "./learning-i18n";
import styles from "./learn.module.css";

type LearningHeaderProps = {
  libraryCurrent?: boolean;
};

const localeLabels = {
  en: "English",
  ko: "한국어",
  es: "Español",
  "pt-BR": "Português (Brasil)",
  ja: "日本語",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pl: "Polski",
  nl: "Nederlands",
  ru: "Русский",
  tr: "Türkçe",
  ar: "العربية",
  fa: "فارسی",
  ur: "اردو",
  fil: "Filipino",
  th: "ไทย",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  vi: "Tiếng Việt",
  my: "မြန်မာ",
  km: "ខ្មែរ",
  lo: "ລາວ",
  hi: "हिन्दी",
  bn: "বাংলা",
  ta: "தமிழ்",
  ne: "नेपाली",
  si: "සිංහල",
  kk: "Қазақша",
  uz: "O‘zbekcha",
  mn: "Монгол",
} satisfies Record<Locale, string>;

export function LearningLocaleSelect({ locale }: { locale: Locale }) {
  return (
    <label className={styles.languagePicker}>
      <span className={styles.visuallyHidden}>
        {learningTr(locale, "Interface language", "화면 언어")}
      </span>
      <select
        aria-label={learningTr(locale, "Interface language", "화면 언어")}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          const routeMatch = window.location.pathname.match(/^\/learn\/([^/]+)\/?$/);
          const guideSlug = routeMatch?.[1];
          void loadLearningTranslations(nextLocale, guideSlug)
            .catch(() => undefined)
            .finally(() => {
              saveManualLocalePreference(window.localStorage, nextLocale);
            });
        }}
        value={locale}
      >
        {supportedLocaleCodes.map((code) => (
          <option key={code} value={code}>{localeLabels[code]}</option>
        ))}
      </select>
    </label>
  );
}

export function LearningHeader({ libraryCurrent = false }: LearningHeaderProps) {
  const locale = useActiveLocale({ loadRuntimePack: false });
  useLearningTranslations(locale);

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {learningTr(locale, "Skip to lesson", "학습 본문으로 바로가기")}
      </a>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link
            className={styles.brand}
            href="/"
            aria-label={learningTr(locale, "Seoul Keys home", "Seoul Keys 홈")}
          >
            <span className={styles.brandMark} aria-hidden="true">ㅅ</span>
            <span>{learningTr(locale, "Seoul Keys")}</span>
          </Link>
          <nav
            className={styles.headerNav}
            aria-label={learningTr(locale, "Learning library", "학습 가이드")}
          >
            <Link aria-current={libraryCurrent ? "page" : undefined} href="/learn">
              {learningTr(locale, "Learn", "학습")}
            </Link>
            <Link href="/learn/hangul">
              {learningTr(locale, "How Hangul works", "한글의 원리")}
            </Link>
            <LearningLocaleSelect locale={locale} />
            <Link className={styles.navCta} href="/#practice">
              {learningTr(locale, "Start practising", "타자 연습 시작")}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function LearningFooter() {
  const locale = useActiveLocale({ loadRuntimePack: false });
  useLearningTranslations(locale);

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerInner}>
        <div>
          <Link
            className={styles.brand}
            href="/"
            aria-label={learningTr(locale, "Seoul Keys home", "Seoul Keys 홈")}
          >
            <span className={styles.brandMark} aria-hidden="true">ㅅ</span>
            <span>{learningTr(locale, "Seoul Keys")}</span>
          </Link>
          <p>{learningTr(
            locale,
            "Learn the Korean keyboard through clear explanations and deliberate practice.",
            "명확한 설명과 의도적인 연습으로 한글 키보드를 배워 보세요.",
          )}</p>
        </div>
        <nav aria-label={learningTr(locale, "Footer", "하단 메뉴")}>
          <Link href="/learn">
            {learningTr(locale, "Learning library", "학습 가이드")}
          </Link>
          <Link href="/learn/hangul">
            {learningTr(locale, "Hangul design guide", "한글 설계 가이드")}
          </Link>
          <Link href="/legal">
            {learningTr(locale, "Privacy & terms", "개인정보 및 이용약관")}
          </Link>
          <Link href="/#practice">
            {learningTr(locale, "Typing practice", "타자 연습")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
