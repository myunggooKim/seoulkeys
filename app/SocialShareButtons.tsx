"use client";

import { useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type SocialShareButtonsProps = {
  locale: Locale;
  title?: string;
  url?: string;
  streakDays?: number;
  totalXp?: number;
};

export function SocialShareButtons({
  locale,
  title = "Seoul Keys — Learn Korean typing through play",
  url,
  streakDays,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return url || window.location.href;
    }
    return url || "https://seoulkeys.com";
  };

  const getShareText = () => {
    if (streakDays !== undefined && streakDays > 0) {
      // The day count is a {n} placeholder so the sentence stays a fixed
      // dictionary key — an interpolated literal never matches one, which left
      // every non-Korean locale on the English fallback.
      return tr(
        locale,
        "🔥 {n}-day streak on Seoul Keys! Practice Korean typing with me:",
        `🔥 한글타자 연습 ${streakDays}일 연속 완주! 서울키즈에서 함께 연습해요:`
      ).replace("{n}", String(streakDays));
    }
    return tr(
      locale,
      "Practice Hangul home keys, words, puzzles, and K-POP typing challenges on Seoul Keys!",
      "서울키즈에서 한글 타자, 낱말 퀴즈, K-POP 타이핑을 즐겁게 연습해보세요!"
    );
  };

  const currentUrl = getShareUrl();
  const text = getShareText();

  const shareToTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const shareToKakao = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentUrl,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }
    copyLink();
  };

  const shareToLine = () => {
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const shareToReddit = () => {
    const shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }
    copyLink();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="social-share-cluster" aria-label={tr(locale, "Share on social media", "소셜 미디어로 공유")}>
      <span className="social-share-title">{tr(locale, "Share & Practice together:", "친구와 함께 연습하기:")}</span>
      <div className="social-share-buttons">
        <button
          type="button"
          className="social-btn btn-x"
          onClick={shareToTwitter}
          title="Share on X (Twitter)"
          aria-label="Share on X (Twitter)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X</span>
        </button>

        <button
          type="button"
          className="social-btn btn-facebook"
          onClick={shareToFacebook}
          title="Share on Facebook"
          aria-label="Share on Facebook"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>

        <button
          type="button"
          className="social-btn btn-kakao"
          onClick={shareToKakao}
          title="Share on KakaoTalk"
          aria-label="Share on KakaoTalk"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.68 2.545-.778 2.94-.12.486.178.48.375.35 1.554-1.025 3.593-2.378 4.195-2.787.311.04.627.058.938.058 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
          </svg>
          <span>Kakao</span>
        </button>

        <button
          type="button"
          className="social-btn btn-line"
          onClick={shareToLine}
          title="Share on Line"
          aria-label="Share on Line"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19.34 10.27c0-3.95-4.22-7.15-9.42-7.15S.5 6.32.5 10.27c0 3.54 3.34 6.5 7.85 7.04.3.07.72.2.83.47.09.24.06.62.03.87l-.14.86c-.04.26-.2.99.87.54 1.07-.45 5.79-3.41 7.9-5.84 1.05-1.18 1.5-2.38 1.5-3.94z" />
          </svg>
          <span>LINE</span>
        </button>

        <button
          type="button"
          className="social-btn btn-reddit"
          onClick={shareToReddit}
          title="Share on Reddit"
          aria-label="Share on Reddit"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.188-.491.96 0 1.743.784 1.743 1.743 0 .616-.32 1.152-.806 1.458.016.19.025.383.025.578 0 2.96-3.48 5.361-7.776 5.361s-7.776-2.401-7.776-5.361c0-.195.009-.388.025-.578a1.74 1.74 0 0 1-.806-1.458c0-.959.783-1.743 1.743-1.743.458 0 .88.182 1.187.491 1.194-.856 2.85-1.418 4.674-1.488l.922-4.321a.345.345 0 0 1 .414-.265l3.072.648a1.24 1.24 0 0 1 1.002-.497z" />
          </svg>
          <span>Reddit</span>
        </button>

        <button
          type="button"
          className="social-btn btn-copy"
          onClick={handleNativeShare}
          title={tr(locale, "Copy link", "링크 복사")}
          aria-label={tr(locale, "Copy link", "링크 복사")}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>{copied ? tr(locale, "Copied!", "복사됨!") : tr(locale, "Copy", "복사")}</span>
        </button>
      </div>
    </div>
  );
}
