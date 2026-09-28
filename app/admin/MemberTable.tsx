"use client";

import { useMemo, useState } from "react";
import type { MemberRow } from "./member-rows";
import styles from "./MemberTable.module.css";

/**
 * The member directory, sortable by every field that means something.
 *
 * The owner reads this to answer a different question each time — who signed up
 * this week, who is actually practising, which teacher never opened a class — and
 * a fixed order answers only one of them. Teachers and learners are kept apart by
 * default so the owner can scan each role's activity together.
 */

type SortKey =
  | "displayName" | "countryName" | "role" | "stage" | "completed"
  | "typing" | "accuracy" | "streak" | "visits" | "class"
  | "createdAt" | "lastLoginAt";

type Direction = "asc" | "desc";

const nf = new Intl.NumberFormat("ko-KR");

function minutes(seconds: number) {
  if (!seconds) return "0분";
  if (seconds < 60) return `${seconds}초`;
  return `${nf.format(Math.floor(seconds / 60))}분`;
}

function day(value: string | null) {
  return value ? value.slice(0, 10) : "—";
}

function CountryCell({ code, name }: { code: string; name: string }) {
  if (!name) return <span className="owner-flag-none">—</span>;
  return (
    <span className={`owner-flag ${styles.country}`}>
      <img src={`/flags/${code.toLowerCase()}.svg`} alt="" width={22} height={16} loading="lazy" decoding="async" />
      {name}
    </span>
  );
}

/** What each column sorts on. Null means "no value", and those always sink to the
 *  bottom whichever way the column is pointing — an account that has never
 *  practised is not the best or the worst, it is simply not in the ranking. */
const value: Record<SortKey, (row: MemberRow) => string | number | null> = {
  displayName: (r) => r.displayName.toLocaleLowerCase("ko"),
  countryName: (r) => r.countryName || null,
  role: (r) => (r.isTeacher ? 1 : 0),
  stage: (r) => r.stageIndex,
  completed: (r) => r.completed,
  typing: (r) => r.typingSeconds,
  accuracy: (r) => r.accuracy,
  streak: (r) => r.streakDays,
  visits: (r) => r.totalVisits,
  class: (r) => (r.isTeacher ? r.ownedClassNames : r.className) || null,
  createdAt: (r) => r.createdAt || null,
  lastLoginAt: (r) => r.lastLoginAt,
};

/** Columns where a first click should show the biggest or newest first, because
 *  that is the question being asked — "who practised most", not "who least". */
const descendingFirst = new Set<SortKey>([
  "stage", "completed", "typing", "accuracy", "streak", "visits", "createdAt", "lastLoginAt", "role",
]);

const COLUMNS: Array<{ key: SortKey; label: string; hint?: string }> = [
  { key: "displayName", label: "계정" },
  { key: "countryName", label: "국적" },
  { key: "role", label: "구분" },
  { key: "stage", label: "진행 단계" },
  { key: "completed", label: "완료" },
  { key: "typing", label: "학습량", hint: "연습한 시간" },
  { key: "accuracy", label: "정확도" },
  { key: "streak", label: "연속" },
  { key: "visits", label: "방문" },
  { key: "class", label: "클래스" },
  { key: "createdAt", label: "가입일" },
  { key: "lastLoginAt", label: "최근 접속" },
];

function sortRows(rows: MemberRow[], key: SortKey, direction: Direction) {
  const read = value[key];
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = read(a);
    const right = read(b);
    if (left === null && right === null) return 0;
    if (left === null) return 1;   // missing values sink, either direction
    if (right === null) return -1;
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
    return String(left).localeCompare(String(right), "ko") * factor;
  });
}

function ClassSummary({ row }: { row: MemberRow }) {
  if (row.isTeacher) {
    if (row.ownedClasses === 0) {
      return <span className="owner-activity-flag">반 미개설</span>;
    }

    return (
      <>
        <b>보유 {nf.format(row.ownedClasses)}개</b>
        {row.ownedClassNames && <small>{row.ownedClassNames}</small>}
      </>
    );
  }

  return row.className
    ? <b>{row.className}</b>
    : <span className="owner-activity-flag">미소속</span>;
}

function AccountSummary({ row }: { row: MemberRow }) {
  return (
    <div className={styles.account}>
      <strong>{row.displayName}</strong>
      <span className={styles.email}>{row.email}</span>
      <div className={styles.accountMeta}>
        <span>{row.isTeacher ? "선생님" : "학습자"}</span>
        <CountryCell code={row.country} name={row.countryName} />
      </div>
    </div>
  );
}

function ProgressSummary({ row }: { row: MemberRow }) {
  return (
    <div className={styles.stack}>
      <strong>{row.stageLabel}</strong>
      <span>완료 {nf.format(row.completed)}{row.totalSentences ? ` / ${nf.format(row.totalSentences)}` : ""}</span>
    </div>
  );
}

function PracticeSummary({ row }: { row: MemberRow }) {
  return (
    <div className={styles.stack}>
      <strong>{minutes(row.typingSeconds)}</strong>
      <span>정확도 {row.accuracy === null ? "—" : `${row.accuracy}%`}</span>
    </div>
  );
}

function VisitSummary({ row }: { row: MemberRow }) {
  return (
    <div className={styles.stack}>
      <strong>방문 {nf.format(row.totalVisits)}회</strong>
      <span>로그인 {nf.format(row.loginCount)}회</span>
      <span>연속 {row.streakDays}일 · 최고 {row.longestStreak}일</span>
    </div>
  );
}

function RecentSummary({ row }: { row: MemberRow }) {
  return (
    <div className={styles.stack}>
      <strong>{day(row.lastLoginAt)}</strong>
      {row.idleDays !== null && <span>{row.idleDays === 0 ? "오늘" : `${row.idleDays}일 전`}</span>}
    </div>
  );
}

function MemberRows({ rows, title }: { rows: MemberRow[]; title: string }) {
  return (
    <>
      <table className={`${styles.table} ${styles.desktopTable}`}>
        <caption className={styles.visuallyHidden}>{title} 회원 상세내역</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.accountColumn}>계정 · 국적</th>
            <th scope="col" className={styles.progressColumn}>학습 진행</th>
            <th scope="col" className={styles.practiceColumn}>학습량 · 정확도</th>
            <th scope="col" className={styles.visitsColumn}>방문 · 연속 학습</th>
            <th scope="col" className={styles.classColumn}>클래스</th>
            <th scope="col" className={styles.datesColumn}>최근 접속 · 가입일</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className={row.idleDays !== null && row.idleDays > 7 ? styles.idle : undefined} key={row.email}>
              <th scope="row"><AccountSummary row={row} /></th>
              <td><ProgressSummary row={row} /></td>
              <td><PracticeSummary row={row} /></td>
              <td><VisitSummary row={row} /></td>
              <td><div className={styles.stack}><ClassSummary row={row} /></div></td>
              <td>
                <RecentSummary row={row} />
                <span className={styles.joined}>가입 {day(row.createdAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* A separate three-column table keeps native table relationships intact
          on narrow screens; display:none removes the other layout from AT. */}
      <table className={`${styles.table} ${styles.mobileTable}`}>
        <caption className={styles.visuallyHidden}>{title} 회원 상세내역</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.accountColumn}>계정</th>
            <th scope="col" className={styles.progressColumn}>학습 진행</th>
            <th scope="col" className={styles.datesColumn}>최근 접속</th>
          </tr>
        </thead>
        {rows.map((row) => (
          <tbody className={row.idleDays !== null && row.idleDays > 7 ? styles.idle : undefined} key={row.email}>
            <tr className={styles.mobileMainRow}>
              <th scope="row"><AccountSummary row={row} /></th>
              <td><ProgressSummary row={row} /></td>
              <td><RecentSummary row={row} /></td>
            </tr>
            <tr className={styles.detailsRow}>
              <td colSpan={3}>
                <details className={styles.details}>
                  <summary>추가 정보<span className={styles.visuallyHidden}>: {row.displayName}</span></summary>
                  <dl>
                    <div><dt>학습량 · 정확도</dt><dd><PracticeSummary row={row} /></dd></div>
                    <div><dt>방문 · 연속 학습</dt><dd><VisitSummary row={row} /></dd></div>
                    <div><dt>클래스</dt><dd className={styles.stack}><ClassSummary row={row} /></dd></div>
                    <div><dt>가입일</dt><dd>{day(row.createdAt)}</dd></div>
                  </dl>
                </details>
              </td>
            </tr>
          </tbody>
        ))}
      </table>
    </>
  );
}

export function MemberTable({
  rows,
  ownerEmail,
}: {
  rows: MemberRow[];
  ownerEmail: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("lastLoginAt");
  const [direction, setDirection] = useState<Direction>("desc");
  const [grouped, setGrouped] = useState(true);

  const me = rows.find((r) => r.email === ownerEmail) ?? null;
  const others = useMemo(() => rows.filter((r) => r.email !== ownerEmail), [rows, ownerEmail]);

  const teachers = useMemo(
    () => sortRows(others.filter((r) => r.isTeacher), sortKey, direction),
    [others, sortKey, direction],
  );
  const learners = useMemo(
    () => sortRows(others.filter((r) => !r.isTeacher), sortKey, direction),
    [others, sortKey, direction],
  );
  const everyone = useMemo(() => sortRows(others, sortKey, direction), [others, sortKey, direction]);

  const chooseSort = (key: SortKey) => {
    setSortKey(key);
    setDirection(descendingFirst.has(key) ? "desc" : "asc");
    if (key === "role" && grouped) setGrouped(false);
  };

  const section = (title: string, list: MemberRow[], empty: string) => (
    <section className="member-directory-group">
      <h3>{title} <span>{nf.format(list.length)}명</span></h3>
      {list.length === 0 ? (
        <p className="owner-activity-empty">{empty}</p>
      ) : (
        <MemberRows rows={list} title={title} />
      )}
    </section>
  );

  return (
    <div className="member-directory">
      {me && (
        <section className="owner-me">
          <p className="section-label">내 계정</p>
          <div className="owner-me-body">
            <b>{me.displayName}</b>
            <span>{me.email}</span>
            <dl>
              <div><dt>가입</dt><dd>{day(me.createdAt)}</dd></div>
              <div><dt>최근 접속</dt><dd>{day(me.lastLoginAt)}</dd></div>
              <div><dt>방문</dt><dd>{nf.format(me.totalVisits)}회</dd></div>
            </dl>
          </div>
          <p className="owner-me-note">아래 목록에서는 제외했습니다.</p>
        </section>
      )}

      <details className={styles.memberDisclosure}>
        <summary className={styles.disclosureSummary}>
          <span className={styles.disclosureTitle} role="heading" aria-level={2}>가입자 상세내역 <span>{nf.format(others.length)}명</span></span>
          <span className={styles.disclosureAction}>
            <span className={styles.whenClosed}>목록 보기 ↓</span>
            <span className={styles.whenOpen}>목록 접기 ↑</span>
          </span>
        </summary>

        <div className={styles.disclosureBody}>
          <div className="member-directory-bar">
            {/* The dimming had no explanation anywhere on screen, and the first
                reading of a faded row is that the account is gone. It is not — there
                is no way to leave — so the legend says what it actually means. */}
            <p className="member-directory-legend">
              <span className="is-idle-swatch" aria-hidden="true" />
              흐린 행 = 7일 넘게 접속 없음 (탈퇴 아님)
            </p>
            <button
              type="button"
              className="owner-group-toggle"
              onClick={() => setGrouped((on) => !on)}
              aria-pressed={grouped}
            >
              {grouped ? "한 목록으로 보기" : "선생님 · 학습자 나눠 보기"}
            </button>
          </div>

          <div className="owner-sort-controls" role="group" aria-label="가입자 정렬">
            <label>
              <span>정렬 기준</span>
              <select
                value={sortKey}
                onChange={(event) => chooseSort(event.target.value as SortKey)}
              >
                {COLUMNS.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.hint ?? column.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setDirection((current) => current === "asc" ? "desc" : "asc")}
              aria-label={`정렬 방향: ${direction === "asc" ? "오름차순" : "내림차순"}`}
            >
              {direction === "asc" ? "오름차순 ↑" : "내림차순 ↓"}
            </button>
          </div>

          <div className={styles.listScroll} role="region" aria-label="가입자 목록" tabIndex={0}>
            {grouped ? (
              <>
                {section("🎓 선생님", teachers, "선생님 계정이 아직 없습니다.")}
                {section("🙋 학습자", learners, "학습자 계정이 아직 없습니다.")}
              </>
            ) : (
              section("전체", everyone, "아직 가입자가 없습니다.")
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
