"use client";

import { useEffect, useState } from "react";
import { GoogleSignIn } from "./GoogleSignIn";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

/**
 * Sign-up entry point for the home page. Google is the only credential, so the
 * whole flow is: pick learner or teacher, press one button, done.
 */
export function SignupModal({ open, onClose, locale }: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
}) {
  const [clientId, setClientId] = useState<string | null>(null);
  const koreanUi = locale === "ko";

  useEffect(() => {
    if (!open || clientId) return;
    void fetch("/api/auth/config")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { clientId?: string } | null) => {
        if (data?.clientId) setClientId(data.clientId);
      })
      .catch(() => undefined);
  }, [open, clientId]);

  // Keyboard-first: Esc closes, matching the rest of the app.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="signup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={tr(locale, "Create your free account", "무료 계정 만들기")}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="signup-modal">
        <button type="button" className="signup-close" onClick={onClose} aria-label={tr(locale, "Close", "닫기")}>×</button>
        <span className="brand-mark" aria-hidden="true">ㅅ</span>
        <h2>{tr(locale, "Start free in 1 minute", "1분 만에 가입하고 시작하기")}</h2>
        <p className="signup-modal-value">
          {tr(
            locale,
            "Save your progress, keep your streak alive, and collect rewards across every device.",
            "진도가 저장되고, 연속 방문 기록이 이어지며, 어느 기기에서든 리워드를 받을 수 있습니다.",
          )}
        </p>

        {clientId ? (
          <GoogleSignIn
            clientId={clientId}
            koreanUi={koreanUi}
            labelKo="구글 계정으로 계속하기"
            labelEn="Continue with Google"
          />
        ) : (
          <p className="google-signin-status">{tr(locale, "Loading sign-in…", "로그인 준비 중…")}</p>
        )}

        <small className="signup-modal-note">
          {tr(
            locale,
            "No password to create. We never post anything to your Google account.",
            "비밀번호를 만들 필요가 없습니다. 구글 계정에 어떤 내용도 게시하지 않습니다.",
          )}
        </small>
      </div>
    </div>
  );
}
