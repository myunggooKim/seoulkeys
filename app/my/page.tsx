import type { Metadata } from "next";
import { getAppUser, googleClientId } from "../google-auth";
import { getAdminUser } from "../admin-auth";
import { getLearningProfile } from "../../db/learning";
import MyLearningClient from "./MyLearningClient";
import { OwnerConsole } from "./OwnerConsole";
import { SignedOutLearningCard } from "./SignedOutLearningCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My learning · Seoul Keys",
  description: "Personal Korean typing progress, streak rewards, and achievements.",
  alternates: { canonical: "https://seoulkeys.com/my" },
  robots: { index: false, follow: true },
};

export default async function MyLearningPage() {
  // Signed out → show the Google sign-in card instead of redirecting.
  const identity = await getAppUser();
  if (!identity) {
    return <SignedOutLearningCard clientId={googleClientId()} />;
  }
  const { user, progress, rewards } = await getLearningProfile(identity.email, identity.displayName, true);
  const isAdmin = Boolean(await getAdminUser());

  /* The owner has no progress worth watching — they already type Korean — so this
     page is their console instead. Everyone else keeps the learning view, which
     is what /my is for. */
  if (isAdmin) return <OwnerConsole email={identity.email} />;

  return (
    <MyLearningClient
      identity={{ email: identity.email }}
      signOutPath="/api/auth/signout"
      isAdmin={isAdmin}
      /* A learner who signed up on their own has no way to reach /join — nothing
         in the app links to it, so the invite link the teacher sends is the only
         door. Both of the real learners are unattached to any class because of
         it. The profile page now offers the code entry directly. */
      hasClass={Boolean(user.classId)}
      isTeacher={user.role === "teacher" || user.role === "org_admin"}
      user={{
        displayName: user.displayName,
        country: user.country,
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
