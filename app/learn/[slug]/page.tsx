import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticleClient, { type RelatedGuideCard } from "../GuideArticleClient";
import { getGuide, guides, type LearningGuide } from "../guides";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return {
      title: "Guide not found | Seoul Keys",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://seoulkeys.com/learn/${guide.slug}`;

  return {
    title: `${guide.title} | Seoul Keys`,
    description: guide.description,
    alternates: { canonical },
    keywords: guide.keywords,
    authors: [{ name: "Seoul Keys", url: "/about" }],
    robots: { index: true, follow: true },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: canonical,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
      authors: ["Seoul Keys"],
      images: [{ url: "/og.png", width: 1731, height: 909, alt: "Seoul Keys Korean typing practice" }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: ["/og.png"],
    },
  };
}

function isLearningGuide(guide: LearningGuide | undefined): guide is LearningGuide {
  return Boolean(guide);
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) notFound();

  const canonical = `https://seoulkeys.com/learn/${guide.slug}`;
  const relatedGuides: RelatedGuideCard[] = guide.related
    .map(getGuide)
    .filter(isLearningGuide)
    .map((related) => ({
      slug: related.slug,
      cardTitle: related.cardTitle,
      readMinutes: related.readMinutes,
      accent: related.accent,
    }));
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        mainEntityOfPage: canonical,
        headline: guide.title,
        description: guide.description,
        datePublished: guide.published,
        dateModified: guide.updated,
        inLanguage: "en",
        author: {
          "@type": "Organization",
          name: "Seoul Keys",
          url: "https://seoulkeys.com/about",
        },
        publisher: {
          "@type": "Organization",
          name: "Seoul Keys",
          url: "https://seoulkeys.com",
          logo: {
            "@type": "ImageObject",
            url: "https://seoulkeys.com/icon-512.png",
          },
        },
        isPartOf: {
          "@type": "CollectionPage",
          name: "Seoul Keys Learning Library",
          url: "https://seoulkeys.com/learn",
        },
        about: guide.keywords,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://seoulkeys.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Learn",
            item: "https://seoulkeys.com/learn",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.cardTitle,
            item: canonical,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <GuideArticleClient guide={guide} relatedGuides={relatedGuides} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
