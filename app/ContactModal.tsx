"use client";

import { useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
};

export function ContactModal({ isOpen, onClose, locale }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const emailAddress = "travels444@gmail.com";

  if (!isOpen) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent("Seoul Keys Inquiry")}`;
  const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent("Seoul Keys Inquiry")}`;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content contact-modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "480px", background: "var(--paper)", color: "var(--ink)", border: "2px solid var(--line)" }}>
        <header className="modal-header">
          <div>
            <span className="modal-badge">✉️ {tr(locale, "SUPPORT", "문의 지원")}</span>
            <h2 style={{ color: "var(--ink)" }}>{tr(locale, "Contact Administrator", "관리자 문의하기")}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close" style={{ color: "var(--ink)" }}>
            ✕
          </button>
        </header>

        <p className="modal-intro" style={{ color: "var(--ink)", opacity: 0.9 }}>
          {tr(
            locale,
            "Have questions, feedback, or business inquiries? Send an email to our administrator.",
            "궁금한 점이나 서비스 제안, B2B 문의사항이 있으시면 아래 관리자 이메일로 보내주세요."
          )}
        </p>

        <div className="email-display-box" style={{ background: "var(--ivory)", padding: "16px", borderRadius: "12px", textAlign: "center", margin: "16px 0", border: "2px solid var(--line)" }}>
          <small style={{ display: "block", color: "var(--ink)", opacity: 0.7, marginBottom: "6px" }}>{tr(locale, "Administrator Email Address", "관리자 이메일 주소")}</small>
          <code style={{ fontSize: "18px", color: "#58a6ff", fontWeight: "bold", userSelect: "all" }}>{emailAddress}</code>
        </div>

        <div className="contact-options" style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 0" }}>
          <button type="button" className="button button-primary" onClick={copyEmail} style={{ width: "100%", justifyContent: "center" }}>
            📋 {copied ? tr(locale, "Copied! Paste in your email app", "복사되었습니다! 메일 앱에 붙여넣으세요") : tr(locale, "Copy Email Address", "이메일 주소 복사하기")}
          </button>

          <a href={webGmailUrl} target="_blank" rel="noopener noreferrer" className="button button-secondary" style={{ width: "100%", justifyContent: "center", textAlign: "center", display: "inline-flex" }}>
            🌐 {tr(locale, "Open Web Gmail", "웹 Gmail에서 바로 작성하기")}
          </a>

          <a href={mailtoUrl} className="button button-secondary" style={{ width: "100%", justifyContent: "center", textAlign: "center", display: "inline-flex" }}>
            ✉️ {tr(locale, "Open Default Mail App", "기본 메일 앱으로 보내기")}
          </a>
        </div>

        <footer className="modal-footer" style={{ borderTop: "1px solid var(--line)" }}>
          <button type="button" className="button button-secondary" onClick={onClose} style={{ marginLeft: "auto" }}>
            {tr(locale, "Close", "닫기")}
          </button>
        </footer>
      </div>
    </div>
  );
}
