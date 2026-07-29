import type { Metadata } from "next";
import Link from "next/link";
import { getAppUser, googleClientId } from "../google-auth";
import { getAdminUser } from "../admin-auth";
import { GoogleSignIn } from "../GoogleSignIn";
import { getLearningProfile } from "../../db/learning";
import MyLearningClient from "./MyLearningClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My learning · Seoul Keys",
  description: "Personal Korean typing progress, streak rewards, and achievements.",
};

export default async function MyLearningPage() {
  // Signed out → show the Google sign-in card instead of redirecting.
  const identity = await getAppUser();
  if (!identity) {
    return (
      <main className="signed-out-shell">
        <section className="signed-out-card">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <h1>내 학습 페이지 · My learning</h1>
          <p>구글 계정으로 로그인하면 학습 진도·연속 방문·리워드가 계정에 저장됩니다.</p>
          <p className="signed-out-sub">Sign in with Google to save your progress, streak, and rewards to your account.</p>
          <GoogleSignIn
            clientId={googleClientId()}
            koreanUi
            labelKo="구글 계정으로 계속하기"
            labelEn="Continue with Google"
            redirectTo="/my"
          />
          <Link className="button button-primary" href="/">← 연습으로 돌아가기 · Back to practice</Link>
        </section>
      </main>
    );
  }
  const { user, progress, rewards } = await getLearningProfile(identity.email, identity.displayName, true);
  const isAdmin = Boolean(await getAdminUser());

  return (
    <MyLearningClient
      identity={{ email: identity.email }}
      signOutPath="/api/auth/signout"
      isAdmin={isAdmin}
      user={{
        displayName: user.displayName,
        streakDays: user.streakDays,
        totalXp: user.totalXp,
        coins: user.coins,
        totalVisits: user.totalVisits,
      }}
      progress={progress ? {
        completedSentences: progress.completedSentences,
        totalSentences: progress.totalSentences,
        typingSeconds: progress.typingSeconds,
        accuracy: progress.accuracy,
        lessonFinished: progress.lessonFinished,
      } : null}
      rewards={rewards.map((reward) => ({
        rewardCode: reward.rewardCode,
        title: reward.title,
        description: reward.description,
      }))}
    />
  );
}
