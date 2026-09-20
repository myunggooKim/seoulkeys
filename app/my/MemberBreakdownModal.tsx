"use client";

import { useEffect } from "react";
import type { Locale } from "../locale-detection";
import { tr } from "../ui-i18n";

export type MemberStats = {
  total: number;
  teachers: number;
  learners: number;
  countries: Array<{ country: string; teachers: number; learners: number; total: number }>;
};

/** "??" is the placeholder the API uses for members with no captured country. */
function countryName(code: string, locale: Locale): string {
  if (code === "??") return tr(locale, "Unknown", "미확인");
  try {
    const display = new Intl.DisplayNames([locale], { type: "region" });
    return display.of(code) ?? code;
  } catch {
    return code;
  }
}

function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function MemberBreakdownModal({ open, onClose, locale, stats }: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
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
      aria-label={tr(locale, "Member breakdown", "가입자 구성")}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="members-modal">
        <button type="button" className="signup-close" onClick={onClose} aria-label={tr(locale, "Close", "닫기")}>×</button>
        <p className="section-label">{tr(locale, "MEMBERS", "가입자")}</p>
        <h2>{tr(locale, "Who has signed up", "가입자 구성")}</h2>

        {!stats ? (
          <p className="members-empty">{tr(locale, "Loading…", "불러오는 중…")}</p>
        ) : (
          <>
            <div className="members-summary">
              <article>
                <small>{tr(locale, "Total members", "전체 가입자")}</small>
                <b>{stats.total.toLocaleString()}</b>
              </article>
              <article className="members-teacher">
                <small>{tr(locale, "Teachers (opened a class)", "선생님 (반 개설)")}</small>
                <b>{stats.teachers.toLocaleString()}</b>
              </article>
              <article>
                <small>{tr(locale, "Individual learners", "일반 학습자")}</small>
                <b>{stats.learners.toLocaleString()}</b>
              </article>
            </div>

            <h3 className="members-subhead">{tr(locale, "By country", "국가별")}</h3>
            {stats.countries.length === 0 ? (
              <p className="members-empty">{tr(locale, "No members yet.", "아직 가입자가 없습니다.")}</p>
            ) : (
              <ol className="members-country-list">
                {stats.countries.map((row) => (
                  <li key={row.country}>
                    <span className="members-flag" aria-hidden="true">{flag(row.country)}</span>
                    <span className="members-country-name">{countryName(row.country, locale)}</span>
                    <span className="members-bar" aria-hidden="true">
                      <i style={{ width: `${max ? Math.round((row.total / max) * 100) : 0}%` }} />
                    </span>
                    <span className="members-count">
                      <b>{row.total.toLocaleString()}</b>
                      {row.teachers > 0 && (
                        <em title={tr(locale, "teachers", "선생님")}>🎓 {row.teachers}</em>
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
