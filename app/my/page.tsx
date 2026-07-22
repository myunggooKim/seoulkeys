import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { getLearningProfile } from "../../db/learning";
import MyLearningClient from "./MyLearningClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My learning · Hangeul Pop",
  description: "Personal Korean typing progress, streak rewards, and achievements.",
};

export default async function MyLearningPage() {
  const identity = await requireChatGPTUser("/my");
  const { user, progress, rewards } = await getLearningProfile(identity.email, identity.displayName, true);

  return (
    <MyLearningClient
      identity={{ email: identity.email }}
      signOutPath={chatGPTSignOutPath("/")}
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
