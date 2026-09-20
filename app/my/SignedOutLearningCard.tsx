"use client";

import Link from "next/link";
import { GoogleSignIn } from "../GoogleSignIn";
import { tr } from "../ui-i18n";
import { useActiveLocale } from "../use-active-locale";

export function SignedOutLearningCard({ clientId }: { clientId?: string }) {
  const locale = useActiveLocale();

  return (
    <main className="signed-out-shell">
      <section className="signed-out-card">
        <span className="brand-mark" aria-hidden="true">ㅅ</span>
        <h1>{locale === "ko" ? "내 학습 페이지 · My learning" : tr(locale, "My learning", "내 학습 페이지")}</h1>
        <p>{locale === "ko"
          ? "구글 계정으로 로그인하면 학습 진도·연속 방문·리워드가 계정에 저장됩니다."
          : tr(locale, "Sign in with Google to save your progress, streak, and rewards to your account.")}</p>
        <p className="signed-out-sub">{locale === "ko"
          ? "Sign in with Google to save your progress, streak, and rewards to your account."
          : tr(locale, "No password to create. We never post anything to your Google account.")}</p>
        <GoogleSignIn
          clientId={clientId}
          koreanUi={locale === "ko"}
          locale={locale}
          labelKo="구글 계정으로 계속하기"
          labelEn="Continue with Google"
          redirectTo="/my"
        />
        <Link className="button button-primary" href="/">
          {locale === "ko" ? "← 연습으로 돌아가기 · Back to practice" : `← ${tr(locale, "Back to practice", "연습으로 돌아가기")}`}
        </Link>
      </section>
    </main>
  );
}
