import type { Metadata } from "next";

/* The one part of the site that is prose rather than an exercise.
 *
 * It exists for three audiences at once: a learner who wants to know why the
 * letters look the way they do, a crawler that has never had more than a few
 * hundred words of text to read here, and an assistant answering "how does
 * Hangul work" — all three want the same thing, which is an actual explanation.
 * Indexable, unlike /app and /join. */
export const metadata: Metadata = {
  title: "How Hangul Works — the design behind the letters | Seoul Keys",
  description:
    "Learn how Hangul was designed, why King Sejong created it, how Korea celebrates Hangeul Day, and the core patterns of Korean grammar.",
  alternates: { canonical: "https://seoulkeys.com/learn/hangul" },
  keywords: [
    "Hangul explained", "how Hangul works", "Korean alphabet principles",
    "Hunminjeongeum", "Korean consonants", "Korean vowels", "한글 원리",
    "King Sejong", "Hangeul Day", "Korean grammar", "훈민정음 제자원리",
    "한글 자음 모음", "세종대왕 한글 창제", "한글날", "한국어 문법",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "How Hangul Works — the design behind the letters",
    description:
      "An illustrated four-part guide to Hangul design, its recorded history, Hangeul Day and the foundations of Korean grammar.",
    type: "article",
    url: "https://seoulkeys.com/learn/hangul",
  },
};

export default function HangulGuideLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
