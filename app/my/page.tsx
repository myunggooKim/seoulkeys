import type { Metadata } from "next";
import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { getLearningProfile } from "../../db/learning";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My learning — Hangeul Pop",
  description: "Personal Korean typing progress, streak rewards, and achievements.",
};

const milestones = [
  { days: 3, reward: "50 비트" },
  { days: 7, reward: "150 비트" },
  { days: 14, reward: "300 비트" },
  { days: 30, reward: "1,000 비트" },
];

export default async function MyLearningPage() {
  const identity = await requireChatGPTUser("/my");
  const profile = await getLearningProfile(identity.email, identity.displayName, true);
  const { user, progress, rewards } = profile;
  const level = Math.floor(user.totalXp / 500) + 1;
  const levelXp = user.totalXp % 500;
  const levelPercent = Math.round((levelXp / 500) * 100);
  const lessonPercent = progress?.lessonFinished
    ? 100
    : Math.round(((progress?.completedSentences ?? 0) / (progress?.totalSentences ?? 5)) * 100);
  const nextMilestone = milestones.find((milestone) => milestone.days > user.streakDays)
    ?? { days: 60, reward: "특별 시즌 배지" };

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <Link className="brand" href="/" aria-label="Hangeul Pop home">
          <span className="brand-mark" aria-hidden="true">ㅎ</span>
          <span>Hangeul Pop</span>
        </Link>
        <nav>
          <Link href="/#practice">Continue lesson</Link>
          <Link href="/admin">Content studio</Link>
          <Link href="/legal">Privacy & terms</Link>
          <a href={chatGPTSignOutPath("/")}>Sign out</a>
        </nav>
      </header>

      <section className="profile-welcome">
        <div>
          <p className="section-label">MY LEARNING SPACE</p>
          <h1>{user.displayName}님, 다시 만나 반가워요!</h1>
          <p>오늘 한 문장만 완성해도 연속 방문 리듬이 이어집니다.</p>
        </div>
        <div className="profile-avatar" aria-hidden="true">{user.displayName.slice(0, 1).toUpperCase()}</div>
      </section>

      <section className="profile-stat-grid" aria-label="Learning summary">
        <article className="profile-stat streak-stat">
          <span>🔥</span>
          <div><small>Current streak</small><b>{user.streakDays} days</b></div>
        </article>
        <article className="profile-stat">
          <span>⚡</span>
          <div><small>Total XP</small><b>{user.totalXp.toLocaleString()}</b></div>
        </article>
        <article className="profile-stat">
          <span>♫</span>
          <div><small>Beat balance</small><b>{user.coins.toLocaleString()}</b></div>
        </article>
        <article className="profile-stat">
          <span>↻</span>
          <div><small>Total visits</small><b>{user.totalVisits}</b></div>
        </article>
      </section>

      <section className="profile-main-grid">
        <article className="profile-card progress-card">
          <div className="profile-card-heading">
            <div><p className="section-label">TODAY’S LESSON</p><h2>Continue your rhythm</h2></div>
            <b>{lessonPercent}%</b>
          </div>
          <div className="profile-progress-track" role="progressbar" aria-label="Today’s lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={lessonPercent}>
            <span style={{ width: `${lessonPercent}%` }} />
          </div>
          <div className="lesson-summary-row">
            <span><b>{progress?.completedSentences ?? 0}</b> / {progress?.totalSentences ?? 5} sentences</span>
            <span><b>{Math.floor((progress?.typingSeconds ?? 0) / 60)}</b> practice minutes</span>
            <span><b>{progress?.accuracy ?? 100}%</b> accuracy</span>
          </div>
          <Link className="button button-primary" href="/#practice">Continue today’s lesson →</Link>
        </article>

        <article className="profile-card level-card">
          <p className="section-label">LEVEL {level}</p>
          <h2>{level < 3 ? "Hangul Explorer" : level < 6 ? "Rhythm Typist" : "Korean Key Star"}</h2>
          <div className="level-orbit"><span>{level}</span></div>
          <div className="profile-progress-track"><span style={{ width: `${levelPercent}%` }} /></div>
          <small>{levelXp} / 500 XP to Level {level + 1}</small>
        </article>
      </section>

      <section className="reward-grid">
        <article className="profile-card visit-card">
          <div className="profile-card-heading">
            <div><p className="section-label">VISIT BENEFITS</p><h2>Come back, earn more</h2></div>
            <span className="benefit-pill">Next · {nextMilestone.days} days</span>
          </div>
          <div className="week-rhythm" aria-label={`${user.streakDays} day visit streak`}>
            {Array.from({ length: 7 }, (_, index) => (
              <span className={index < Math.min(7, user.streakDays) ? "active" : ""} key={index}>
                <i>{index < Math.min(7, user.streakDays) ? "✓" : index + 1}</i>
                <small>Day {index + 1}</small>
              </span>
            ))}
          </div>
          <p>Visit for <b>{Math.max(0, nextMilestone.days - user.streakDays)} more days</b> to unlock {nextMilestone.reward}.</p>
        </article>

        <article className="profile-card badges-card">
          <p className="section-label">MY REWARDS</p>
          <h2>Badges & benefits</h2>
          {rewards.length ? (
            <div className="badge-list">
              {rewards.map((reward) => (
                <div key={reward.rewardCode}>
                  <span aria-hidden="true">★</span>
                  <p><b>{reward.title}</b><small>{reward.description}</small></p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-reward">
              <span aria-hidden="true">☆</span>
              <p><b>Your first badge is close.</b><small>Visit 3 days in a row to earn “첫 리듬”.</small></p>
            </div>
          )}
        </article>
      </section>

      <section className="account-note">
        <div><b>Signed-in learning account</b><span>{identity.email}</span></div>
        <p>This private preview uses the authenticated Sites identity. Google-only OAuth requires separate Google credentials before public launch.</p>
      </section>
    </main>
  );
}
