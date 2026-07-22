import { desc, eq } from "drizzle-orm";
import { getDb } from ".";
import { learningProgress, rewards, users } from "./schema";

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
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export type ProgressUpdate = {
  currentLesson: number;
  completedSentences: number;
  totalSentences: number;
  typingSeconds: number;
  accuracy: number;
  lessonFinished: boolean;
};

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

  const curriculumChanged = currentProgress.totalSentences !== update.totalSentences;
  const completedSentences = curriculumChanged
    ? Math.min(update.totalSentences, Math.max(0, update.completedSentences))
    : Math.max(
      currentProgress.completedSentences,
      Math.min(update.totalSentences, Math.max(0, update.completedSentences)),
    );
  const targetXp = completedSentences * 100 + (update.lessonFinished ? 500 : 0);
  const xpDelta = Math.max(0, targetXp - currentProgress.awardedXp);

  await db.update(learningProgress).set({
    currentLesson: Math.max(0, update.currentLesson),
    completedSentences,
    totalSentences: Math.max(1, update.totalSentences),
    typingSeconds: Math.max(currentProgress.typingSeconds, update.typingSeconds),
    accuracy: Math.min(100, Math.max(0, update.accuracy)),
    lessonFinished: update.lessonFinished,
    awardedXp: currentProgress.awardedXp + xpDelta,
    updatedAt: new Date().toISOString(),
  }).where(eq(learningProgress.userEmail, email));

  if (xpDelta > 0) {
    await db.update(users).set({ totalXp: profile.user.totalXp + xpDelta }).where(eq(users.email, email));
  }

  return getLearningProfile(email, displayName, false);
}
