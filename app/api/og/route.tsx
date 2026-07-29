import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Seoul Keys";
  const streak = searchParams.get("streak") || "1";
  const xp = searchParams.get("xp") || "0";

  const safeTitle = title.replace(/[<>&'"]/g, "");
  const safeStreak = streak.replace(/[<>&'"]/g, "");
  const safeXp = xp.replace(/[<>&'"]/g, "");

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#31104b" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1000" cy="150" r="250" fill="#38bdf8" opacity="0.1" />
  <circle cx="200" cy="500" r="200" fill="#c084fc" opacity="0.15" />
  <text x="80" y="120" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="url(#accent)">SEOUL KEYS · HANGEUL POP</text>
  <text x="80" y="240" font-family="system-ui, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${safeTitle}</text>
  <text x="80" y="320" font-family="system-ui, sans-serif" font-size="28" fill="#94a3b8">Learn Korean typing through interactive games &amp; K-POP rhythm</text>
  <g transform="translate(80, 420)">
    <rect width="240" height="120" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="30" y="50" font-family="system-ui, sans-serif" font-size="20" fill="#94a3b8">STREAK</text>
    <text x="30" y="95" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#38bdf8">${safeStreak} Days 🔥</text>
  </g>
  <g transform="translate(360, 420)">
    <rect width="240" height="120" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="30" y="50" font-family="system-ui, sans-serif" font-size="20" fill="#94a3b8">TOTAL XP</text>
    <text x="30" y="95" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#c084fc">${safeXp} XP ✨</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
