"use client";

import { useRef, useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

/**
 * A member's own name, written in Hangul.
 *
 * This is the first Korean most visitors will care about: not a practice line
 * somebody else wrote, but their own name. It is set in a serif brush face
 * rather than the interface font so it reads as calligraphy — something worth
 * keeping — and it can be saved as an image, because the thing people do with
 * their name in a new script is show it to someone.
 */

/** Drawn at this size and scaled down, so the saved file is sharp on any screen. */
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function drawCard(
  canvas: HTMLCanvasElement,
  hangul: string,
  original: string,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  // Paper, not white: a flat white rectangle reads as a screenshot.
  ctx.fillStyle = "#fdfaf3";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // A seal-red rule down the left, the way a hanji sheet is bordered.
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(64, 64, 6, CARD_HEIGHT - 128);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#8a8378";
  ctx.font = "500 30px 'Noto Sans KR', sans-serif";
  ctx.fillText(original, CARD_WIDTH / 2, 190);

  // The name itself. The size steps down for longer names so a full name never
  // runs off the edge of the card.
  const length = [...hangul].length;
  const size = length <= 4 ? 190 : length <= 7 ? 140 : length <= 11 ? 100 : 74;
  ctx.fillStyle = "#1b1a17";
  ctx.font = `700 ${size}px 'Nanum Myeongjo', 'Gungsuh', 'Batang', serif`;
  ctx.fillText(hangul, CARD_WIDTH / 2, CARD_HEIGHT / 2 + 20);

  ctx.fillStyle = "#8a8378";
  ctx.font = "500 26px 'Noto Sans KR', sans-serif";
  ctx.fillText("seoulkeys.com", CARD_WIDTH / 2, CARD_HEIGHT - 96);
}

export function KoreanNameCard({
  locale,
  hangul,
  original,
  compact = false,
}: {
  locale: Locale;
  hangul: string;
  original: string;
  /** The inline version that sits beside the member's name on their own page. */
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    drawCard(canvas, hangul, original);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${hangul}-seoulkeys.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoked on the next tick: revoking immediately can cancel the download
      // in browsers that fetch the blob asynchronously.
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    }, "image/png");
  };

  return (
    <div className={`name-card${compact ? " is-compact" : ""}`}>
      <p className="name-card-label">
        {tr(locale, "Your name in Hangul", "한글로 쓴 내 이름")}
      </p>
      <p className="name-card-hangul" lang="ko">{hangul}</p>
      <p className="name-card-original">{original}</p>
      {/* Said plainly, and without alarm. The reading of a name follows the
          language it comes from, and we do not know that language — so this is
          offered as how Korean would most likely say it, not as a fact about
          the person's name. */}
      <p className="name-card-caveat">
        {tr(
          locale,
          "Names are read differently from one language to the next, so this may not match how yours sounds.",
          "이름을 읽는 방식은 언어마다 달라서, 이 표기가 실제 발음과 다를 수 있습니다.",
        )}
      </p>
      <button type="button" className="name-card-save" onClick={save}>
        {saved
          ? tr(locale, "Saved", "저장했습니다")
          : tr(locale, "Save as image", "이미지로 저장")}
      </button>
    </div>
  );
}
