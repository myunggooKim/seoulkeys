import Link from "next/link";
import { getAdminUser } from "../admin-auth";
import { listOwnerActivity } from "../../db/owner-activity";
import { practiceCurriculum } from "../practice-curriculum";
import { MemberTable } from "../admin/MemberTable";
import { NamePreview } from "../admin/NamePreview";
import { toHangulName } from "../hangul-name";
import { daysAgo, isTeacherRow, toMemberRows } from "../admin/member-rows";

/**
 * What /my is for the owner.
 *
 * Everyone else opens this page to watch their own streak, which is the point of
 * it. The owner already types Korean and has no progress worth tracking, so the
 * same layout spent the whole screen on numbers they have no use for and pushed
 * the tools that matter into a single crowded strip. This replaces the progress
 * cards outright: the running state of the site first, then the tools, full
 * width. Practice still records in the background — it simply is not shown here.
 *
 * The member list is the page. Everything else is a compact summary or an
 * operating tool, because a number tells you something is happening and only
 * the list tells you who it is happening to.
 */

const nf = new Intl.NumberFormat("ko-KR");

const regionNames = (() => {
  try { return new Intl.DisplayNames(["ko"], { type: "region" }); } catch { return null; }
})();

function CountryChip({ code, count }: { code: string; count: number }) {
  if (!/^[A-Za-z]{2}$/.test(code)) return null;
  const upper = code.toUpperCase();
  const name = regionNames?.of(upper);
  return (
    <span className="owner-flag">
      <img src={`/flags/${code.toLowerCase()}.svg`} alt="" width={22} height={16} loading="lazy" decoding="async" />
      {name && name !== upper ? name : upper}
      <b>{nf.format(count)}</b>
    </span>
  );
}

export async function OwnerConsole({ email }: { email: string }) {
  const rows = await listOwnerActivity();
  const admin = await getAdminUser();
  const ownerEmail = admin?.email ?? email;
  const members = toMemberRows(rows);

  /* Every number on this page counts other people, never the owner. Their own
     account is the one that signed up first, signs in most, and practises while
     testing — counting it made the site look busier than it is and put the owner
     top of any "who has practised most" sort. It is shown on its own card
     instead. */
  const watched = rows.filter((r) => r.email !== ownerEmail);

  const teachers = watched.filter(isTeacherRow);
  const learners = watched.length - teachers.length;
  const active7 = watched.filter((r) => (daysAgo(r.lastLoginAt ?? r.createdAt) ?? 999) <= 7).length;
  const totalMinutes = Math.round(watched.reduce((sum, r) => sum + (r.typingSeconds ?? 0), 0) / 60);
  /* Ordered by how many people are there, not alphabetically: the question this
     answers is where the users are, and the largest group is the answer. */
  const countryCounts = new Map<string, number>();
  for (const row of watched) {
    if (row.country) countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
  }
  const countries = [...countryCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  /* Seeded with names that are actually on the site, so the owner checks the
     transliteration against real members rather than a made-up example. */
  const sampleNames = watched
    .map((r) => r.displayName)
    .filter((name) => toHangulName(name))
    .slice(0, 6);

  return (
    <main className="owner-console">
      <nav className="owner-console-nav">
        <Link className="brand" href="/" aria-label="Seoul Keys home">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <span className="owner-console-who">{ownerEmail}</span>
      </nav>

      <header className="owner-console-head">
        <p className="section-label">OWNER CONSOLE</p>
        <h1>관리자 콘솔</h1>
        <p>가입자 현황과 운영 도구입니다. 개인 학습 진도는 표시하지 않습니다.</p>
      </header>

      <section className="owner-console-stats">
        <div><b>{nf.format(watched.length)}</b><span>가입자</span></div>
        <div><b>{nf.format(teachers.length)}</b><span>선생님</span></div>
        <div><b>{nf.format(learners)}</b><span>학습자</span></div>
        <div><b>{nf.format(active7)}</b><span>최근 7일 접속</span></div>
        <div><b>{nf.format(totalMinutes)}분</b><span>총 연습</span></div>
        <div><b>{nf.format(practiceCurriculum.length)}</b><span>커리큘럼 과제</span></div>
      </section>

      <MemberTable rows={members} ownerEmail={ownerEmail} />

      {countries.length > 0 && (
        <section className="owner-console-countries">
          <h2>가입자 국적</h2>
          <p>{countries.map(([code, count]) => <CountryChip key={code} code={code} count={count} />)}</p>
        </section>
      )}

      <NamePreview sampleNames={sampleNames} />

      <section className="owner-console-tools">
        <h2>운영 도구</h2>
        <div className="owner-console-grid">
          <Link className="owner-tool" href="/admin">
            <span aria-hidden="true">🗂️</span>
            <b>콘텐츠 스튜디오</b>
            <small>가사·대사·회화 지문 관리</small>
          </Link>
          <Link className="owner-tool" href="/teacher">
            <span aria-hidden="true">🎓</span>
            <b>교사 대시보드</b>
            <small>클래스와 과제 관리</small>
          </Link>
          <a
            className="owner-tool"
            href="https://dash.cloudflare.com/0c68d691e9cf8b5074d334b9c8a57438/web-analytics/overview/visits?siteTag~in=163ace21bf8a44cdaad07736996ffc86&excludeBots=Yes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">🌐</span>
            <b>방문 통계</b>
            <small>Cloudflare Web Analytics</small>
          </a>
          <a
            className="owner-tool"
            href="https://clarity.microsoft.com/projects/view/xsae5by824/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">🔥</span>
            <b>행동 분석</b>
            <small>Microsoft Clarity</small>
          </a>
          <Link className="owner-tool" href="/">
            <span aria-hidden="true">⌨️</span>
            <b>학습 화면</b>
            <small>타자 연습 직접 해보기</small>
          </Link>
        </div>
      </section>

      <p className="owner-activity-note">
        정확도는 채점된 시도의 평균입니다. 그 이전에 기록된 계정은 실제 값이 아닌 100%로 남아 있을 수 있으며, 다음 연습부터 실제 값으로 갱신됩니다.
      </p>
    </main>
  );
}
