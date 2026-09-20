import type { Metadata } from "next";
import LearningLibraryClient, { type LearningGuideCard } from "./LearningLibraryClient";
import { guides } from "./guides";

const canonical = "https://seoulkeys.com/learn";

export const metadata: Metadata = {
  title: "Learn Korean Typing and Hangul | Seoul Keys Learning Library",
  description:
    "Clear, original guides to the Korean 2-set keyboard, Hangul syllable blocks, batchim, compound vowels, touch typing, device setup, and daily practice.",
  alternates: { canonical },
  keywords: [
    "learn Korean typing",
    "Korean keyboard guide",
    "learn Hangul",
    "Korean typing lessons",
    "Korean 2-set keyboard",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Learn Korean Typing and Hangul",
    description:
      "A practical library for understanding the Korean keyboard and turning Hangul knowledge into accurate typing.",
    type: "website",
    url: canonical,
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Seoul Keys Korean typing practice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Korean Typing and Hangul",
    description: "Practical, original guides to Hangul structure and Korean keyboard technique.",
    images: ["/og.png"],
  },
};

export default function LearningLibraryPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Seoul Keys Learning Library",
    description:
      "Original guides to Hangul structure, the Korean 2-set keyboard, Korean typing technique, and troubleshooting.",
    url: canonical,
    inLanguage: "en",
    hasPart: [
      {
        "@type": "Article",
        position: 1,
        headline: "How Hangul Works — the design behind the letters",
        url: "https://seoulkeys.com/learn/hangul",
      },
      ...guides.map((guide, index) => ({
        "@type": "Article",
        position: index + 2,
        headline: guide.title,
        description: guide.description,
        url: `https://seoulkeys.com/learn/${guide.slug}`,
      })),
    ],
  };
  const cards: LearningGuideCard[] = guides.map((guide) => ({
    slug: guide.slug,
    cardTitle: guide.cardTitle,
    description: guide.description,
    eyebrow: guide.eyebrow,
    readMinutes: guide.readMinutes,
    accent: guide.accent,
  }));

  return (
    <>
      <LearningLibraryClient cards={cards} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
