"use client";

import { useEffect } from "react";

export type MemberStats = {
  total: number;
  teachers: number;
  learners: number;
  countries: Array<{ country: string; teachers: number; learners: number; total: number }>;
};

/** "??" is the placeholder the API uses for members with no captured country. */
function countryName(code: string, koreanUi: boolean): string {
  if (code === "??") return koreanUi ? "미확인" : "Unknown";
  try {
    const display = new Intl.DisplayNames([koreanUi ? "ko" : "en"], { type: "region" });
    return display.of(code) ?? code;
  } catch {
    return code;
  }
}

function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function MemberBreakdownModal({ open, onClose, koreanUi, stats }: {
  open: boolean;
  onClose: () => void;
  koreanUi: boolean;
  stats: MemberStats | null;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const max = stats?.countries.reduce((peak, row) => Math.max(peak, row.total), 0) ?? 0;

  return (
    <div
      className="members-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={koreanUi ? "가입자 구성" : "Member breakdown"}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="members-modal">
        <button type="button" className="signup-close" onClick={onClose} aria-label={koreanUi ? "닫기" : "Close"}>×</button>
        <p className="section-label">MEMBERS</p>
        <h2>{koreanUi ? "가입자 구성" : "Who has signed up"}</h2>

        {!stats ? (
          <p className="members-empty">{koreanUi ? "불러오는 중…" : "Loading…"}</p>
        ) : (
          <>
            <div className="members-summary">
              <article>
                <small>{koreanUi ? "전체 가입자" : "Total members"}</small>
                <b>{stats.total.toLocaleString()}</b>
              </article>
              <article className="members-teacher">
                <small>{koreanUi ? "선생님 (반 개설)" : "Teachers (opened a class)"}</small>
                <b>{stats.teachers.toLocaleString()}</b>
              </article>
              <article>
                <small>{koreanUi ? "일반 학습자" : "Individual learners"}</small>
                <b>{stats.learners.toLocaleString()}</b>
              </article>
            </div>

            <h3 className="members-subhead">{koreanUi ? "국가별" : "By country"}</h3>
            {stats.countries.length === 0 ? (
              <p className="members-empty">{koreanUi ? "아직 가입자가 없습니다." : "No members yet."}</p>
            ) : (
              <ol className="members-country-list">
                {stats.countries.map((row) => (
                  <li key={row.country}>
                    <span className="members-flag" aria-hidden="true">{flag(row.country)}</span>
                    <span className="members-country-name">{countryName(row.country, koreanUi)}</span>
                    <span className="members-bar" aria-hidden="true">
                      <i style={{ width: `${max ? Math.round((row.total / max) * 100) : 0}%` }} />
                    </span>
                    <span className="members-count">
                      <b>{row.total.toLocaleString()}</b>
                      {row.teachers > 0 && (
                        <em title={koreanUi ? "선생님" : "teachers"}>🎓 {row.teachers}</em>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
}
