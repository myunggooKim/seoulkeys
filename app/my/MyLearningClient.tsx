"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ContactModal } from "../ContactModal";
import { readManualLocalePreference, resolveVisitorLocale } from "../locale-detection";
import { practiceCurriculum, practiceStageLabels, practiceStageOrder, type PracticeKind } from "../practice-curriculum";
import { applyTheme, readResolvedTheme } from "../theme";
import { signOutEverywhere } from "../sign-out";
import { MemberBreakdownModal, type MemberStats } from "./MemberBreakdownModal";
import { displayNameForGreeting } from "../hangul-name";

type MyLearningClientProps = {
  identity: { email: string };
  signOutPath: string;
  /** The content studio is owner-only, so the link is hidden from everyone else. */
  isAdmin: boolean;
  user: {
    displayName: string;
    streakDays: number;
    totalXp: number;
    coins: number;
    totalVisits: number;
  };
  progress: {
    completedSentences: number;
    totalSentences: number;
    typingSeconds: number;
    accuracy: number;
    lessonFinished: boolean;
  } | null;
  rewards: Array<{ rewardCode: string; title: string; description: string }>;
};

const milestones = [
  { days: 3, rewardKo: "50 비트", rewardEn: "50 beats" },
  { days: 7, rewardKo: "150 비트", rewardEn: "150 beats" },
  { days: 14, rewardKo: "300 비트", rewardEn: "300 beats" },
  { days: 30, rewardKo: "1,000 비트", rewardEn: "1,000 beats" },
];

const masteryGoals: Record<PracticeKind, { accuracy: number; cpm: number }> = {
  home: { accuracy: 95, cpm: 45 },
  syllable: { accuracy: 94, cpm: 50 },
  batchim: { accuracy: 93, cpm: 50 },
  double: { accuracy: 92, cpm: 48 },
  word: { accuracy: 94, cpm: 60 },
  sentence: { accuracy: 94, cpm: 75 },
};

function formatDuration(totalSeconds: number, koreanUi: boolean) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return koreanUi ? `${hours}시간 ${minutes}분` : `${hours}h ${minutes}m`;
  return koreanUi ? `${minutes}분 ${seconds}초` : `${minutes}m ${seconds}s`;
}

function subscribeToLocale() {
  return () => undefined;
}

function getKoreanLocaleSnapshot() {
  const locale = readManualLocalePreference(window.localStorage)
    ?? resolveVisitorLocale({
      languages: navigator.languages?.length ? navigator.languages : [navigator.language],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  return locale === "ko";
}

export default function MyLearningClient({ identity, signOutPath, isAdmin, user, progress, rewards }: MyLearningClientProps) {
  const koreanUi = useSyncExternalStore(subscribeToLocale, getKoreanLocaleSnapshot, () => true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setThemeMode(readResolvedTheme()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    applyTheme(nextTheme);
  };

  const [studentAssignments, setStudentAssignments] = useState<Array<{ id: string; title: string; category: string; content: string; isCompleted: boolean }>>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const memberTotal = memberStats?.total ?? null;

  useEffect(() => {
    if (!isAdmin) return;
    void fetch("/api/admin/members", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: MemberStats | null) => { if (data) setMemberStats(data); })
      .catch(() => undefined);
  }, [isAdmin]);

  useEffect(() => {
    const locale = readManualLocalePreference(window.localStorage)
      ?? resolveVisitorLocale({
        languages: navigator.languages?.length ? navigator.languages : [navigator.language],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" || locale === "fa" || locale === "ur" ? "rtl" : "ltr";

    void fetch("/api/student/assignment").then((res) => {
      if (res.ok) {
        void res.json().then((data) => {
          setStudentAssignments(data.assignments || []);
        });
      }
    });
  }, [koreanUi]);

  const greeting = displayNameForGreeting(user.displayName);
  const level = Math.floor(user.totalXp / 500) + 1;
  const levelXp = user.totalXp % 500;
  const levelPercent = Math.round((levelXp / 500) * 100);
  const totalSteps = progress?.totalSentences || 19;
  const lessonPercent = progress?.lessonFinished
    ? 100
    : Math.round(((progress?.completedSentences ?? 0) / totalSteps) * 100);
  const nextMilestone = milestones.find((milestone) => milestone.days > user.streakDays)
    ?? { days: 60, rewardKo: "특별 장기 방문 배지", rewardEn: "a long-streak badge" };
  const remainingDays = Math.max(0, nextMilestone.days - user.streakDays);
  const levelTitle = koreanUi
    ? level < 3 ? "한글 탐험가" : level < 6 ? "리듬 타자수" : "한국어 키 스타"
    : level < 3 ? "Hangul Explorer" : level < 6 ? "Rhythm Typist" : "Korean Key Star";
  const completedSteps = Math.min(totalSteps, progress?.completedSentences ?? 0);
  const stageRows = practiceStageOrder.map((kind) => {
    const indices = practiceCurriculum
      .map((item, index) => item.kind === kind ? index : -1)
      .filter((index) => index >= 0);
    const first = indices[0];
    const completedInStage = Math.max(0, Math.min(indices.length, completedSteps - first));
    const percent = Math.round(completedInStage / indices.length * 100);
    const state = percent === 100 ? "done" : completedInStage > 0 || (completedSteps === first) ? "current" : "locked";
    return { kind, count: indices.length, completed: completedInStage, percent, state };
  });
  const activeStage = stageRows.find((stage) => stage.state === "current") ?? stageRows.at(-1)!;
  const accuracyBand = (progress?.accuracy ?? 100) >= 95
    ? koreanUi ? "매우 안정적" : "Highly stable"
    : (progress?.accuracy ?? 100) >= 90
      ? koreanUi ? "좋음" : "On track"
      : koreanUi ? "정확도 집중 필요" : "Accuracy focus";
  const nextAction = activeStage.state === "done"
    ? koreanUi ? "문장 유창성 무한 연습" : "Endless sentence fluency"
    : koreanUi
      ? `${practiceStageLabels[activeStage.kind].ko} ${activeStage.completed + 1}번째 과제`
      : `${practiceStageLabels[activeStage.kind].en} task ${activeStage.completed + 1}`;

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <Link className="brand" href="/" aria-label="Seoul Keys home">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <nav>
          <Link href="/#practice">{koreanUi ? "학습 계속하기" : "Continue lesson"}</Link>
          <Link href="/teacher">🎓 {koreanUi ? "교사 대시보드" : "Teacher Portal"}</Link>
          <button type="button" className="theme-toggle-btn" onClick={toggleThemeMode}>
            {themeMode === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <Link href="/legal">{koreanUi ? "개인정보·약관" : "Privacy & terms"}</Link>
          <button type="button" className="footer-link-btn" onClick={() => setContactModalOpen(true)}>✉️ {koreanUi ? "관리자 문의" : "Contact Admin"}</button>
          <button
            type="button"
            className="signout-link"
            onClick={() => { void signOutEverywhere(signOutPath); }}
          >
            {koreanUi ? "로그아웃" : "Sign out"}
          </button>
        </nav>
      </header>

      {/* Owner-only tools, kept out of the main nav and given their own row so
          they read as a separate toolset rather than more menu items. Content
          studio belongs here too — it is the same class of thing. */}
      {isAdmin && (
        <div className="owner-tools">
          <span className="owner-tools-label">{koreanUi ? "관리자 도구" : "Owner tools"}</span>

          <button
            type="button"
            className="owner-members"
            onClick={() => setMembersOpen(true)}
            title={koreanUi ? "가입자 구성 보기" : "View member breakdown"}
          >
            <span aria-hidden="true">👥</span>
            <b>{memberTotal === null ? "—" : memberTotal.toLocaleString()}</b>
            {koreanUi ? "가입자" : "members"}
          </button>

          <div className="analytics-segment" role="group" aria-label={koreanUi ? "관리자 도구 모음" : "Owner tool group"}>
            <Link className="analytics-seg analytics-studio" href="/admin" title={koreanUi ? "콘텐츠 관리" : "Content studio"}>
              <span aria-hidden="true">🗂️</span>{koreanUi ? "콘텐츠 관리" : "Content"}
            </Link>
            <a
              className="analytics-seg analytics-cloudflare"
              href="https://dash.cloudflare.com/0c68d691e9cf8b5074d334b9c8a57438/web-analytics/overview/visits?siteTag~in=163ace21bf8a44cdaad07736996ffc86&excludeBots=Yes"
              target="_blank"
              rel="noopener noreferrer"
              title="Cloudflare Web Analytics"
            >
              <span aria-hidden="true">📊</span>{koreanUi ? "방문 통계" : "Traffic"}
            </a>
            <a
              className="analytics-seg analytics-clarity"
              href="https://clarity.microsoft.com/projects/view/xsae5by824/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              title="Microsoft Clarity"
            >
              <span aria-hidden="true">🔥</span>{koreanUi ? "행동 분석" : "Clarity"}
            </a>
          </div>
        </div>
      )}

      {isAdmin && (
        <MemberBreakdownModal
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          koreanUi={koreanUi}
          stats={memberStats}
        />
      )}

      <section className="profile-welcome">
        <div>
          <p className="section-label">MY LEARNING SPACE</p>
          {/* Members are here to learn Hangul, so greet them with their whole
              name written in it — not just their surname. */}
          <h1>{koreanUi ? `${greeting.display}님, 다시 만나 반가워요!` : `Welcome back, ${greeting.display}!`}</h1>
          {greeting.romanized && <p className="greeting-original">{greeting.original}</p>}
          <p>{koreanUi ? "오늘 한 단계만 완성해도 방문 리듬과 실력이 함께 쌓여요." : "Complete one step today to keep your learning rhythm growing."}</p>
        </div>
        <div className="profile-avatar" aria-hidden="true">{greeting.display.slice(0, 1)}</div>
      </section>

      <section className="profile-stat-grid" aria-label={koreanUi ? "학습 요약" : "Learning summary"}>
        <article className="profile-stat streak-stat"><span>🔥</span><div><small>{koreanUi ? "연속 방문" : "Current streak"}</small><b>{user.streakDays}{koreanUi ? "일" : " days"}</b></div></article>
        <article className="profile-stat"><span>⚡</span><div><small>{koreanUi ? "누적 XP" : "Total XP"}</small><b>{user.totalXp.toLocaleString()}</b></div></article>
        <article className="profile-stat"><span>🎵</span><div><small>{koreanUi ? "보유 비트" : "Beat balance"}</small><b>{user.coins.toLocaleString()}</b></div></article>
        <article className="profile-stat"><span>👋</span><div><small>{koreanUi ? "총 방문" : "Total visits"}</small><b>{user.totalVisits}</b></div></article>
      </section>

      <section className="profile-main-grid">
        <article className="profile-card progress-card">
          <div className="profile-card-heading">
            <div><p className="section-label">TODAY&apos;S LESSON</p><h2>{koreanUi ? "오늘의 리듬 이어가기" : "Continue your rhythm"}</h2></div>
            <b>{lessonPercent}%</b>
          </div>
          <div className="profile-progress-track" role="progressbar" aria-label={koreanUi ? "오늘의 학습 진도" : "Today's lesson progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={lessonPercent}>
            <span style={{ width: `${lessonPercent}%` }} />
          </div>
          <div className="lesson-summary-row">
            <span><b>{progress?.completedSentences ?? 0}</b> / {totalSteps} {koreanUi ? "학습 단계" : "learning steps"}</span>
            <span><b>{Math.floor((progress?.typingSeconds ?? 0) / 60)}</b> {koreanUi ? "연습 분" : "practice minutes"}</span>
            <span><b>{progress?.accuracy ?? 100}%</b> {koreanUi ? "정확도" : "accuracy"}</span>
          </div>
          <Link className="button button-primary" href="/#practice">{koreanUi ? "오늘 학습 계속하기" : "Continue today's lesson"} <span aria-hidden="true">→</span></Link>
        </article>

        <article className="profile-card level-card">
          <p className="section-label">LEVEL {level}</p>
          <h2>{levelTitle}</h2>
          <div className="level-orbit"><span>{level}</span></div>
          <div className="profile-progress-track"><span style={{ width: `${levelPercent}%` }} /></div>
          <small>{koreanUi ? `다음 레벨까지 ${levelXp} / 500 XP` : `${levelXp} / 500 XP to Level ${level + 1}`}</small>
        </article>
      </section>

      <section className="profile-detail-grid">
        <article className="profile-card mastery-map-card">
          <div className="profile-card-heading">
            <div><p className="section-label">MASTERY MAP</p><h2>{koreanUi ? "단계별 숙련 지도" : "Stage mastery map"}</h2></div>
            <span className="benefit-pill">{koreanUi ? `현재 · ${practiceStageLabels[activeStage.kind].ko}` : `Now · ${practiceStageLabels[activeStage.kind].en}`}</span>
          </div>
          <div className="mastery-map-list">
            {stageRows.map((stage, index) => (
              <div className={stage.state} key={stage.kind}>
                <span className="mastery-map-number">{stage.state === "done" ? "✓" : index + 1}</span>
                <div>
                  <b>{koreanUi ? practiceStageLabels[stage.kind].ko : practiceStageLabels[stage.kind].en}</b>
                  <small>{stage.completed}/{stage.count} {koreanUi ? "과제" : "tasks"} · {koreanUi ? `목표 ${masteryGoals[stage.kind].accuracy}% / ${masteryGoals[stage.kind].cpm}타` : `target ${masteryGoals[stage.kind].accuracy}% / ${masteryGoals[stage.kind].cpm} CPM`}</small>
                  <i><span style={{ width: `${stage.percent}%` }} /></i>
                </div>
                <em>{stage.percent}%</em>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-card insight-card">
          <p className="section-label">NEXT BEST ACTION</p>
          <h2>{koreanUi ? "지금 가장 좋은 연습" : "Your best next step"}</h2>
          <div className="accuracy-dial" style={{ "--accuracy": `${progress?.accuracy ?? 100}` } as CSSProperties}>
            <span><b>{progress?.accuracy ?? 100}%</b><small>{koreanUi ? "최근 정확도" : "recent accuracy"}</small></span>
          </div>
          <div className="insight-status">
            <span><small>{koreanUi ? "상태" : "STATUS"}</small><b>{accuracyBand}</b></span>
            <span><small>{koreanUi ? "다음 과제" : "NEXT"}</small><b>{nextAction}</b></span>
            <span><small>{koreanUi ? "누적 연습" : "PRACTICE"}</small><b>{formatDuration(progress?.typingSeconds ?? 0, koreanUi)}</b></span>
          </div>
          <Link className="button button-primary" href="/#practice">{koreanUi ? "키보드로 바로 이어가기" : "Resume at the keyboard"} <span aria-hidden="true">→</span></Link>
        </article>
      </section>

      <section className="reward-grid">
        <article className="profile-card visit-card">
          <div className="profile-card-heading">
            <div><p className="section-label">VISIT BENEFITS</p><h2>{koreanUi ? "방문할수록 커지는 혜택" : "Come back, earn more"}</h2></div>
            <span className="benefit-pill">{koreanUi ? `다음 · ${nextMilestone.days}일` : `Next · ${nextMilestone.days} days`}</span>
          </div>
          <div className="week-rhythm" aria-label={koreanUi ? `${user.streakDays}일 연속 방문` : `${user.streakDays} day visit streak`}>
            {Array.from({ length: 7 }, (_, index) => (
              <span className={index < Math.min(7, user.streakDays) ? "active" : ""} key={index}>
                <i>{index < Math.min(7, user.streakDays) ? "✓" : index + 1}</i>
                <small>{koreanUi ? `${index + 1}일` : `Day ${index + 1}`}</small>
              </span>
            ))}
          </div>
          <p>{koreanUi ? <><b>{remainingDays}일</b> 더 방문하면 {nextMilestone.rewardKo} 보상을 받아요.</> : <>Visit for <b>{remainingDays} more days</b> to unlock {nextMilestone.rewardEn}.</>}</p>
        </article>

        {studentAssignments.length > 0 && (
          <article className="profile-card assignment-card" style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(88,166,255,0.12), rgba(163,113,247,0.12))", border: "2px solid rgba(88,166,255,0.4)" }}>
            <p className="section-label">CLASS ASSIGNMENTS</p>
            <h2>🎓 {koreanUi ? "선생님이 출제한 맞춤 타자 지문" : "Teacher's Custom Typing Assignments"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", marginTop: "16px" }}>
              {studentAssignments.map((asgn) => (
                <div key={asgn.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "11px", background: "#58a6ff", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>{asgn.category}</span>
                    <h3 style={{ margin: "8px 0 4px", fontSize: "16px", color: "var(--ink)" }}>{asgn.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--ink)", opacity: 0.85, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{asgn.content}</p>
                  </div>
                  <div style={{ marginTop: "14px" }}>
                    {asgn.isCompleted ? (
                      <span style={{ color: "#2da44e", fontWeight: "bold", fontSize: "13px" }}>✅ {koreanUi ? "완료됨" : "Completed"}</span>
                    ) : (
                      <Link href={`/#practice`} className="button button-primary" style={{ display: "inline-block", padding: "6px 12px", fontSize: "12px", textAlign: "center" }}>
                        🚀 {koreanUi ? "타자 연습 시작" : "Start Practice"}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        <article className="profile-card badges-card">
          <p className="section-label">MY REWARDS</p>
          <h2>{koreanUi ? "배지와 혜택" : "Badges & benefits"}</h2>
          {rewards.length ? (
            <div className="badge-list">{rewards.map((reward) => <div key={reward.rewardCode}><span aria-hidden="true">🏅</span><p><b>{reward.title}</b><small>{reward.description}</small></p></div>)}</div>
          ) : (
            <div className="empty-reward"><span aria-hidden="true">🌱</span><p><b>{koreanUi ? "첫 배지가 가까워요." : "Your first badge is close."}</b><small>{koreanUi ? "3일 연속 방문하면 첫 리듬 배지를 받아요." : "Visit 3 days in a row to earn the First Rhythm badge."}</small></p></div>
          )}
        </article>
      </section>

      <section className="account-note">
        <div><b>{koreanUi ? "로그인된 학습 계정" : "Signed-in learning account"}</b><span>{identity.email}</span></div>
        <p>{koreanUi ? "이 계정에 학습 진도, 방문 기록, 리워드가 안전하게 저장됩니다." : "Your lesson progress, visits, and rewards are saved to this account."}</p>
      </section>

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        locale={koreanUi ? "ko" : "en"}
      />
    </main>
  );
}
