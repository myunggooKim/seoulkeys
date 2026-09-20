import type { Metadata } from "next";
import Link from "next/link";
import { getAppUser } from "../../google-auth";
import { getAdminUser } from "../../admin-auth";
import { listOwnerActivity } from "../../../db/owner-activity";
import { MemberTable } from "../MemberTable";
import { countryName, daysAgo, isTeacherRow, toMemberRows } from "../member-rows";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Member activity — Seoul Keys",
  description: "Owner-only view of what each account is actually doing.",
  robots: { index: false, follow: false },
};

const nf = new Intl.NumberFormat("ko-KR");

/* An <img>, not a flag emoji. Windows ships no colour flag font, so 🇻🇳 renders
   there as the letters "VN" — which is exactly the abbreviation this column
   exists to replace. The SVGs are served from our own /flags, so no third party
   learns which countries the owner is looking at. */
function CountryCell({ code, count }: { code: string; count?: number }) {
  const name = countryName(code);
  if (!name) return <span className="owner-flag-none">—</span>;
  return (
    <span className="owner-flag">
      <img src={`/flags/${code.toLowerCase()}.svg`} alt="" width={22} height={16} loading="lazy" decoding="async" />
      {name}
      {count !== undefined && <b>{nf.format(count)}</b>}
    </span>
  );
}

export default async function OwnerActivityPage() {
  const identity = await getAppUser();
  const admin = identity ? await getAdminUser() : null;

  if (!admin) {
    return (
      <main className="admin-shell admin-denied">
        <Link className="brand" href="/" aria-label="Seoul Keys home">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <section className="admin-denied-card">
          <p className="section-label">OWNER ONLY</p>
          <h1>관리자 권한이 필요합니다.</h1>
          <Link className="button button-primary" href="/">학습 화면으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  const rows = await listOwnerActivity();
  // Same rule as the console: these numbers describe other people. The owner's
  // own account is shown separately by the table below.
  const watched = rows.filter((r) => r.email !== admin.email);
  const teachers = watched.filter(isTeacherRow);
  const totalMinutes = Math.round(watched.reduce((sum, r) => sum + (r.typingSeconds ?? 0), 0) / 60);
  // Largest group first — same ordering as the console, so the two agree.
  const countryCounts = new Map<string, number>();
  for (const row of watched) {
    if (row.country) countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
  }
  const countries = [...countryCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const active7 = watched.filter((r) => (daysAgo(r.lastLoginAt ?? r.createdAt) ?? 999) <= 7).length;

  return (
    <main className="admin-shell owner-activity">
      <nav className="owner-activity-nav">
        <Link className="brand" href="/" aria-label="Seoul Keys home">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <Link href="/my">← 관리자 콘솔</Link>
      </nav>

      <section className="admin-hero">
        <div>
          <p className="section-label">OWNER ONLY · MEMBER ACTIVITY</p>
          <h1>가입자 활동 상세</h1>
        </div>
      </section>

      <section className="owner-activity-summary">
        <div><b>{nf.format(watched.length)}</b><span>총 가입자</span></div>
        <div><b>{nf.format(teachers.length)}</b><span>선생님</span></div>
        <div><b>{nf.format(watched.length - teachers.length)}</b><span>학습자</span></div>
        <div><b>{nf.format(active7)}</b><span>최근 7일 접속</span></div>
        <div><b>{nf.format(totalMinutes)}분</b><span>총 연습 시간</span></div>
        <div><b>{countries.length || "—"}</b><span>나라</span></div>
      </section>

      {countries.length > 0 && (
        <p className="owner-activity-countries">
          {countries.map(([code, count]) => (
            <CountryCell key={code} code={code} count={count} />
          ))}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="owner-activity-empty">아직 가입자가 없습니다.</p>
      ) : (
        <MemberTable rows={toMemberRows(rows)} ownerEmail={admin.email} />
      )}

      <p className="owner-activity-note">
        정확도는 채점된 시도의 평균입니다. 그 이전에 기록된 계정은 실제 값이 아닌 100%로 남아 있을 수 있으며, 다음 연습부터 실제 값으로 갱신됩니다.
      </p>
    </main>
  );
}
