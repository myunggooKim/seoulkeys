"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ContactModal } from "../ContactModal";
import { readManualLocalePreference, resolveVisitorLocale, type Locale } from "../locale-detection";
import { practiceCurriculum, practiceStageLabels, practiceStageOrder, type PracticeKind } from "../practice-curriculum";
import { applyTheme, readResolvedTheme } from "../theme";
import { signOutEverywhere } from "../sign-out";
import { MemberBreakdownModal, type MemberStats } from "./MemberBreakdownModal";
import { displayNameForGreeting, hangulNameOffer } from "../hangul-name";
import { KoreanNameCard } from "../KoreanNameCard";
import { tr } from "../ui-i18n";
import { useLocaleTranslations } from "../use-locale-translations";

type MyLearningClientProps = {
  identity: { email: string };
  signOutPath: string;
  /** The content studio is owner-only, so the link is hidden from everyone else. */
  isAdmin: boolean;
  /** Already a member of a class — the join prompt is only for learners who are not. */
  hasClass: boolean;
  isTeacher: boolean;
  user: {
    displayName: string;
    /** Used only to keep the Hangul-name card away from Korean members. */
    country?: string | null;
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
  { days: 3, rewardBeats: 50 },
  { days: 7, rewardBeats: 150 },
  { days: 14, rewardBeats: 300 },
  { days: 30, rewardBeats: 1_000 },
];

const masteryGoals: Record<PracticeKind, { accuracy: number; cpm: number }> = {
  home: { accuracy: 95, cpm: 45 },
  syllable: { accuracy: 94, cpm: 50 },
  batchim: { accuracy: 93, cpm: 50 },
  double: { accuracy: 92, cpm: 48 },
  word: { accuracy: 94, cpm: 60 },
  sentence: { accuracy: 94, cpm: 75 },
};

function formatUnit(value: number, locale: Locale, unit: "day" | "hour" | "minute" | "second") {
  return new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" }).format(value);
}

function formatDuration(totalSeconds: number, locale: Locale) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (locale === "ko") return hours ? `${hours}시간 ${minutes}분` : `${minutes}분 ${seconds}초`;
  if (locale === "en") return hours ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  if (hours) return `${formatUnit(hours, locale, "hour")} ${formatUnit(minutes, locale, "minute")}`;
  return `${formatUnit(minutes, locale, "minute")} ${formatUnit(seconds, locale, "second")}`;
}

function subscribeToLocale() {
  return () => undefined;
}

function getLocaleSnapshot(): Locale {
  const locale = readManualLocalePreference(window.localStorage)
    ?? resolveVisitorLocale({
      languages: navigator.languages?.length ? navigator.languages : [navigator.language],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  return locale;
}

export default function MyLearningClient({ identity, signOutPath, isAdmin, hasClass, isTeacher, user, progress, rewards }: MyLearningClientProps) {
  const locale = useSyncExternalStore<Locale>(subscribeToLocale, getLocaleSnapshot, () => "ko");
  useLocaleTranslations(locale);
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
  }, [locale]);

  const greeting = displayNameForGreeting(user.displayName);
  const nameOffer = hangulNameOffer({ fullName: user.displayName, country: user.country, locale });
  const level = Math.floor(user.totalXp / 500) + 1;
  const levelXp = user.totalXp % 500;
  const levelPercent = Math.round((levelXp / 500) * 100);
  const totalSteps = progress?.totalSentences || 19;
  const lessonPercent = progress?.lessonFinished
    ? 100
    : Math.round(((progress?.completedSentences ?? 0) / totalSteps) * 100);
  const nextMilestone = milestones.find((milestone) => milestone.days > user.streakDays)
    ?? { days: 60, rewardBeats: null };
  const remainingDays = Math.max(0, nextMilestone.days - user.streakDays);
  const levelTitle = level < 3
    ? tr(locale, "Hangul Explorer", "한글 탐험가")
    : level < 6
      ? tr(locale, "Rhythm Typist", "리듬 타자수")
      : tr(locale, "Korean Key Star", "한국어 키 스타");
  const milestoneReward = nextMilestone.rewardBeats === null
    ? tr(locale, "Long-streak badge", "특별 장기 방문 배지")
    : `${nextMilestone.rewardBeats.toLocaleString(locale)} ${tr(locale, "beats", "비트")}`;
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
    ? tr(locale, "Highly stable", "매우 안정적")
    : (progress?.accuracy ?? 100) >= 90
      ? tr(locale, "On track", "좋음")
      : tr(locale, "Accuracy focus", "정확도 집중 필요");
  const nextAction = activeStage.state === "done"
    ? tr(locale, "Endless sentence fluency", "문장 유창성 무한 연습")
    : `${tr(locale, practiceStageLabels[activeStage.kind].en, practiceStageLabels[activeStage.kind].ko)} ${activeStage.completed + 1} · ${tr(locale, "task", "과제")}`;

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <Link className="brand" href="/" aria-label="Seoul Keys home">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <nav>
          <Link href="/#practice">{tr(locale, "Continue lesson", "학습 계속하기")}</Link>
          {isTeacher && <Link href="/teacher">🎓 {tr(locale, "Teacher Portal", "교사 대시보드")}</Link>}
          <button type="button" className="theme-toggle-btn" onClick={toggleThemeMode}>
            {themeMode === "dark" ? `☀️ ${tr(locale, "Light", "라이트")}` : `🌙 ${tr(locale, "Dark", "다크")}`}
          </button>
          <Link href="/legal">{tr(locale, "Privacy & terms", "개인정보·약관")}</Link>
          <button type="button" className="footer-link-btn" onClick={() => setContactModalOpen(true)}>✉️ {tr(locale, "Contact Admin", "관리자 문의")}</button>
          <button
            type="button"
            className="signout-link"
            onClick={() => { void signOutEverywhere(signOutPath); }}
          >
            {tr(locale, "Sign out", "로그아웃")}
          </button>
        </nav>
      </header>

      {/* Owner-only tools, kept out of the main nav and given their own row so
          they read as a separate toolset rather than more menu items. Content
          studio belongs here too — it is the same class of thing. */}
      {isAdmin && (
        <div className="owner-tools">
          <span className="owner-tools-label">{tr(locale, "Owner tools", "관리자 도구")}</span>

          <Link className="owner-members" href="/admin/activity" title={tr(locale, "See what each member is doing", "가입자별 활동 상세 보기")}>
            <span aria-hidden="true">📊</span>
            {tr(locale, "activity", "활동 상세")}
          </Link>

          <button
            type="button"
            className="owner-members"
            onClick={() => setMembersOpen(true)}
            title={tr(locale, "View member breakdown", "가입자 구성 보기")}
          >
            <span aria-hidden="true">👥</span>
            <b>{memberTotal === null ? "—" : memberTotal.toLocaleString()}</b>
            {tr(locale, "members", "가입자")}
          </button>

          <div className="analytics-segment" role="group" aria-label={tr(locale, "Owner tool group", "관리자 도구 모음")}>
            <Link className="analytics-seg analytics-studio" href="/admin" title={tr(locale, "Content studio", "콘텐츠 관리")}>
              <span aria-hidden="true">🗂️</span>{tr(locale, "Content", "콘텐츠 관리")}
            </Link>
            <a
              className="analytics-seg analytics-cloudflare"
              href="https://dash.cloudflare.com/0c68d691e9cf8b5074d334b9c8a57438/web-analytics/overview/visits?siteTag~in=163ace21bf8a44cdaad07736996ffc86&excludeBots=Yes"
              target="_blank"
              rel="noopener noreferrer"
              title="Cloudflare Web Analytics"
            >
              <span aria-hidden="true">📊</span>{tr(locale, "Traffic", "방문 통계")}
            </a>
            <a
              className="analytics-seg analytics-clarity"
              href="https://clarity.microsoft.com/projects/view/xsae5by824/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              title="Microsoft Clarity"
            >
              <span aria-hidden="true">🔥</span>{tr(locale, "Clarity", "행동 분석")}
            </a>
          </div>
        </div>
      )}

      {isAdmin && (
        <MemberBreakdownModal
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          locale={locale}
          stats={memberStats}
        />
      )}

      <section className="profile-welcome">
        <div>
          <p className="section-label">{tr(locale, "MY LEARNING SPACE", "내 학습 공간")}</p>
          {/* Members are here to learn Hangul, so greet them with their whole
              name written in it — not just their surname. */}
          <h1>{locale === "ko" ? `${greeting.display}님, 다시 만나 반가워요!` : locale === "en" ? `Welcome back, ${greeting.display}!` : `${tr(locale, "Welcome back!")} ${greeting.display}`}</h1>
          {greeting.romanized && <p className="greeting-original">{greeting.original}</p>}
          <p>{tr(locale, "Complete one step today to keep your learning rhythm growing.", "오늘 한 단계만 완성해도 방문 리듬과 실력이 함께 쌓여요.")}</p>
          {nameOffer && (
            <KoreanNameCard
              locale={locale}
              hangul={nameOffer.hangul}
              original={nameOffer.original}
              compact
            />
          )}
        </div>
        <div className="profile-avatar" aria-hidden="true">{greeting.display.slice(0, 1)}</div>
      </section>

      <section className="profile-stat-grid" aria-label={tr(locale, "Learning summary", "학습 요약")}>
        <article className="profile-stat streak-stat"><span>🔥</span><div><small>{tr(locale, "Current streak", "연속 방문")}</small><b>{formatUnit(user.streakDays, locale, "day")}</b></div></article>
        <article className="profile-stat"><span>⚡</span><div><small>{tr(locale, "Total XP", "누적 XP")}</small><b>{user.totalXp.toLocaleString()}</b></div></article>
        <article className="profile-stat"><span>🎵</span><div><small>{tr(locale, "Beat balance", "보유 비트")}</small><b>{user.coins.toLocaleString()}</b></div></article>
        <article className="profile-stat"><span>👋</span><div><small>{tr(locale, "Total visits", "총 방문")}</small><b>{user.totalVisits}</b></div></article>
      </section>

      <section className="profile-main-grid">
        <article className="profile-card progress-card">
          <div className="profile-card-heading">
            <div><p className="section-label">{tr(locale, "TODAY'S LESSON", "오늘의 학습")}</p><h2>{tr(locale, "Continue your rhythm", "오늘의 리듬 이어가기")}</h2></div>
            <b>{lessonPercent}%</b>
          </div>
          <div className="profile-progress-track" role="progressbar" aria-label={tr(locale, "Today's lesson progress", "오늘의 학습 진도")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={lessonPercent}>
            <span style={{ width: `${lessonPercent}%` }} />
          </div>
          <div className="lesson-summary-row">
            <span><b>{progress?.completedSentences ?? 0}</b> / {totalSteps} {tr(locale, "learning steps", "학습 단계")}</span>
            <span><b>{Math.floor((progress?.typingSeconds ?? 0) / 60)}</b> {tr(locale, "practice minutes", "연습 분")}</span>
            <span><b>{progress?.accuracy ?? 100}%</b> {tr(locale, "accuracy", "정확도")}</span>
          </div>
          <Link className="button button-primary" href="/#practice">{tr(locale, "Continue today's lesson", "오늘 학습 계속하기")} <span aria-hidden="true">→</span></Link>
        </article>

        <article className="profile-card level-card">
          <p className="section-label">LEVEL {level}</p>
          <h2>{levelTitle}</h2>
          <div className="level-orbit"><span>{level}</span></div>
          <div className="profile-progress-track"><span style={{ width: `${levelPercent}%` }} /></div>
          <small>{locale === "ko" ? `다음 레벨까지 ${levelXp} / 500 XP` : locale === "en" ? `${levelXp} / 500 XP to Level ${level + 1}` : `${tr(locale, "NEXT", "다음")} ${tr(locale, "LEVEL", "레벨")} ${level + 1} · ${levelXp} / 500 XP`}</small>
        </article>
      </section>

      <section className="profile-detail-grid">
        <article className="profile-card mastery-map-card">
          <div className="profile-card-heading">
            <div><p className="section-label">{tr(locale, "MASTERY MAP", "숙련 지도")}</p><h2>{tr(locale, "Stage mastery map", "단계별 숙련 지도")}</h2></div>
            <span className="benefit-pill">{tr(locale, "Now", "현재")} · {tr(locale, practiceStageLabels[activeStage.kind].en, practiceStageLabels[activeStage.kind].ko)}</span>
          </div>
          <div className="mastery-map-list">
            {stageRows.map((stage, index) => (
              <div className={stage.state} key={stage.kind}>
                <span className="mastery-map-number">{stage.state === "done" ? "✓" : index + 1}</span>
                <div>
                  <b>{tr(locale, practiceStageLabels[stage.kind].en, practiceStageLabels[stage.kind].ko)}</b>
                  <small>{stage.completed}/{stage.count} {tr(locale, "tasks", "과제")} · {tr(locale, "target", "목표")} {masteryGoals[stage.kind].accuracy}% / {masteryGoals[stage.kind].cpm} CPM</small>
                  <i><span style={{ width: `${stage.percent}%` }} /></i>
                </div>
                <em>{stage.percent}%</em>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-card insight-card">
          <p className="section-label">{tr(locale, "NEXT BEST ACTION", "다음 추천 활동")}</p>
          <h2>{tr(locale, "Your best next step", "지금 가장 좋은 연습")}</h2>
          <div className="accuracy-dial" style={{ "--accuracy": `${progress?.accuracy ?? 100}` } as CSSProperties}>
            <span><b>{progress?.accuracy ?? 100}%</b><small>{tr(locale, "recent accuracy", "최근 정확도")}</small></span>
          </div>
          <div className="insight-status">
            <span><small>{tr(locale, "STATUS", "상태")}</small><b>{accuracyBand}</b></span>
            <span><small>{tr(locale, "NEXT", "다음 과제")}</small><b>{nextAction}</b></span>
            <span><small>{tr(locale, "PRACTICE", "누적 연습")}</small><b>{formatDuration(progress?.typingSeconds ?? 0, locale)}</b></span>
          </div>
          <Link className="button button-primary" href="/#practice">{tr(locale, "Resume at the keyboard", "키보드로 바로 이어가기")} <span aria-hidden="true">→</span></Link>
        </article>
      </section>

      <section className="reward-grid">
        <article className="profile-card visit-card">
          <div className="profile-card-heading">
            <div><p className="section-label">{tr(locale, "VISIT BENEFITS", "방문 혜택")}</p><h2>{tr(locale, "Come back, earn more", "방문할수록 커지는 혜택")}</h2></div>
            <span className="benefit-pill">{tr(locale, "Next", "다음")} · {formatUnit(nextMilestone.days, locale, "day")}</span>
          </div>
          <div className="week-rhythm" aria-label={`${formatUnit(user.streakDays, locale, "day")} · ${tr(locale, "Current streak", "연속 방문")}`}>
            {Array.from({ length: 7 }, (_, index) => (
              <span className={index < Math.min(7, user.streakDays) ? "active" : ""} key={index}>
                <i>{index < Math.min(7, user.streakDays) ? "✓" : index + 1}</i>
                <small>{locale === "ko" ? `${index + 1}일` : locale === "en" ? `Day ${index + 1}` : formatUnit(index + 1, locale, "day")}</small>
              </span>
            ))}
          </div>
          <p>{locale === "ko"
            ? <><b>{remainingDays}일</b> 더 방문하면 {milestoneReward} 보상을 받아요.</>
            : locale === "en"
              ? <>{tr(
                locale,
                "Visit for {{days}} more days to unlock {{reward}}.",
                "{{days}}일 더 방문하면 {{reward}} 보상이 열립니다.",
              ).replace("{{days}}", String(remainingDays)).replace("{{reward}}", milestoneReward)}</>
              : <><b>{formatUnit(remainingDays, locale, "day")}</b> · {tr(locale, "Next reward", "다음 보상")}: {milestoneReward}</>}</p>
        </article>

        {!hasClass && !isTeacher && (
          <article className="profile-card join-class-card" style={{ gridColumn: "1 / -1" }}>
            <p className="section-label">{tr(locale, "CLASS", "클래스")}</p>
            <h2>🎓 {tr(locale, "Are you in a class?", "선생님께 초대 코드를 받으셨나요?")}</h2>
            <p style={{ opacity: 0.85, margin: "6px 0 14px" }}>
              {tr(
                locale,
                "Enter the code from your teacher to join their class. Your progress then shows on their dashboard.",
                "선생님께 받은 코드를 입력하면 학급에 등록되고, 학습 기록이 선생님 화면에 표시됩니다.",
              )}
            </p>
            <Link href="/join" className="button button-primary" style={{ display: "inline-flex", padding: "10px 20px" }}>
              {tr(locale, "Enter invitation code", "초대 코드 입력하기")}
            </Link>
          </article>
        )}

        {studentAssignments.length > 0 && (
          <article className="profile-card assignment-card" style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(88,166,255,0.12), rgba(163,113,247,0.12))", border: "2px solid rgba(88,166,255,0.4)" }}>
            <p className="section-label">{tr(locale, "CLASS ASSIGNMENTS", "클래스 과제")}</p>
            <h2>🎓 {tr(locale, "Teacher's Custom Typing Assignments", "선생님이 출제한 맞춤 타자 지문")}</h2>
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
                      <span style={{ color: "#2da44e", fontWeight: "bold", fontSize: "13px" }}>✅ {tr(locale, "Completed", "완료됨")}</span>
                    ) : (
                      <Link href={`/#practice`} className="button button-primary" style={{ display: "inline-block", padding: "6px 12px", fontSize: "12px", textAlign: "center" }}>
                        🚀 {tr(locale, "Start Practice", "타자 연습 시작")}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        <article className="profile-card badges-card">
          <p className="section-label">{tr(locale, "MY REWARDS", "나의 리워드")}</p>
          <h2>{tr(locale, "Badges & benefits", "배지와 혜택")}</h2>
          {rewards.length ? (
            <div className="badge-list">{rewards.map((reward) => <div key={reward.rewardCode}><span aria-hidden="true">🏅</span><p><b>{reward.title}</b><small>{reward.description}</small></p></div>)}</div>
          ) : (
            <div className="empty-reward"><span aria-hidden="true">🌱</span><p><b>{tr(locale, "Your first badge is close.", "첫 배지가 가까워요.")}</b><small>{tr(locale, "Visit 3 days in a row to earn the First Rhythm badge.", "3일 연속 방문하면 첫 리듬 배지를 받아요.")}</small></p></div>
          )}
        </article>
      </section>

      <section className="account-note">
        <div><b>{tr(locale, "Signed-in learning account", "로그인된 학습 계정")}</b><span>{identity.email}</span></div>
        <p>{tr(locale, "Your lesson progress, visits, and rewards are saved to this account.", "이 계정에 학습 진도, 방문 기록, 리워드가 안전하게 저장됩니다.")}</p>
      </section>

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        locale={locale}
      />
    </main>
  );
}
