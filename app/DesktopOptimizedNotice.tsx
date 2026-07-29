"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

const dismissKey = "seoulkeys-desktop-notice-dismissed";

/**
 * Seoul Keys teaches touch typing, which needs a real keyboard. Rather than
 * letting phone visitors discover that by failing at the first lesson, tell them
 * up front — and tell them the way out, which is pairing a physical keyboard.
 */
export function DesktopOptimizedNotice({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        if (window.localStorage.getItem(dismissKey) === "1") return;
      } catch {
        // Storage denied: still show the notice, it just won't be remembered.
      }

      // Coarse pointer plus a narrow viewport is the signal that matters. A tablet
      // with a keyboard case reports a fine pointer and is left alone.
      const smallScreen = window.matchMedia("(max-width: 900px)").matches;
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      if (smallScreen || coarsePointer) setVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!visible) return null;

  const dismiss = (remember: boolean) => {
    if (remember) {
      try {
        window.localStorage.setItem(dismissKey, "1");
      } catch {
        // no-op
      }
    }
    setVisible(false);
  };

  return (
    <div className="desktop-notice-overlay" role="dialog" aria-modal="true">
      <div className="desktop-notice">
        <span className="desktop-notice-icon" aria-hidden="true">⌨️</span>
        <h2>{tr(locale, "Built for a desktop browser", "데스크탑 브라우저에 최적화되어 있습니다")}</h2>
        <p>
          {tr(
            locale,
            "Seoul Keys trains Hangul touch typing, so it works best on a computer with a full keyboard.",
            "Seoul Keys는 한글 타자 연습 서비스라 전체 키보드가 있는 컴퓨터에서 가장 잘 작동합니다.",
          )}
        </p>
        <p className="desktop-notice-tip">
          {tr(
            locale,
            "Want to use it on this device? Connect a physical keyboard and everything works normally.",
            "이 기기에서 사용하고 싶다면 물리 키보드를 연결하세요. 그러면 그대로 이용할 수 있습니다.",
          )}
        </p>
        <div className="desktop-notice-actions">
          <button type="button" className="button button-primary" onClick={() => dismiss(false)}>
            {tr(locale, "Continue anyway", "그래도 계속하기")}
          </button>
          <button type="button" className="desktop-notice-never" onClick={() => dismiss(true)}>
            {tr(locale, "Don't show this again", "다시 보지 않기")}
          </button>
        </div>
      </div>
    </div>
  );
}
