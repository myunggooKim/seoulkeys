import { desc, eq } from "drizzle-orm";
import { getDb } from ".";
import {
  validateProgressUpdate,
  type ProgressUpdate,
  type StoredProgress,
} from "./progress-validation";
import { dailyVisits, learningProgress, rewards, users } from "./schema";

export { validateProgressUpdate };
export type { ProgressUpdate, StoredProgress };

const streakBenefits: Record<number, { coins: number; code: string; title: string; description: string }> = {
  3: { coins: 50, code: "streak-3", title: "첫 리듬", description: "3일 연속 방문 · 50 비트" },
  7: { coins: 150, code: "streak-7", title: "한 주 완주", description: "7일 연속 방문 · 150 비트" },
  14: { coins: 300, code: "streak-14", title: "꾸준한 학습자", description: "14일 연속 방문 · 300 비트" },
  30: { coins: 1000, code: "streak-30", title: "한글 스타", description: "30일 연속 방문 · 1,000 비트" },
};

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc() {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

export async function getLearningProfile(email: string, displayName: string, recordDailyVisit = true) {
  const db = getDb();
  const today = todayUtc();

  await db.insert(users).values({
    email,
    displayName,
    lastVisitDate: today,
  }).onConflictDoNothing();

  await db.insert(learningProgress).values({ userEmail: email }).onConflictDoNothing();

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new Error("Unable to create the learning profile.");

  if (recordDailyVisit && user.lastVisitDate !== today) {
    const insertedVisit = await db.insert(dailyVisits)
      .values({ userEmail: email, visitDate: today })
      .onConflictDoNothing()
      .returning({ visitDate: dailyVisits.visitDate });

    if (insertedVisit.length) {
      const nextStreak = user.lastVisitDate === yesterdayUtc() ? user.streakDays + 1 : 1;
      const benefit = streakBenefits[nextStreak];
      await db.update(users).set({
        displayName,
        lastVisitDate: today,
        streakDays: nextStreak,
        longestStreak: Math.max(user.longestStreak, nextStreak),
        totalVisits: user.totalVisits + 1,
        coins: user.coins + (benefit?.coins ?? 0),
      }).where(eq(users.email, email));

      if (benefit) {
        await db.insert(rewards).values({
          userEmail: email,
          rewardCode: benefit.code,
          title: benefit.title,
          description: benefit.description,
        }).onConflictDoNothing();
      }

      [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    }
  } else if (user.displayName !== displayName) {
    await db.update(users).set({ displayName }).where(eq(users.email, email));
    user = { ...user, displayName };
  }

  const [progress] = await db.select().from(learningProgress).where(eq(learningProgress.userEmail, email)).limit(1);
  const earnedRewards = await db.select().from(rewards)
    .where(eq(rewards.userEmail, email))
    .orderBy(desc(rewards.earnedAt));

  return { user, progress, rewards: earnedRewards };
}

export async function saveLearningProgress(email: string, displayName: string, update: ProgressUpdate) {
  const profile = await getLearningProfile(email, displayName, false);
  const db = getDb();
  const currentProgress = profile.progress;
  if (!currentProgress) throw new Error("Learning progress is unavailable.");

  const validated = validateProgressUpdate(currentProgress, update);

  await db.update(learningProgress).set({
    currentLesson: validated.currentLesson,
    completedSentences: validated.completedSentences,
    totalSentences: validated.totalSentences,
    typingSeconds: validated.typingSeconds,
    accuracy: validated.accuracy,
    typedChars: validated.typedChars,
    lessonFinished: validated.lessonFinished,
    awardedXp: currentProgress.awardedXp + validated.xpDelta,
    updatedAt: new Date().toISOString(),
  }).where(eq(learningProgress.userEmail, email));

  if (validated.xpDelta > 0) {
    await db.update(users).set({ totalXp: profile.user.totalXp + validated.xpDelta }).where(eq(users.email, email));
  }

  return getLearningProfile(email, displayName, false);
}
