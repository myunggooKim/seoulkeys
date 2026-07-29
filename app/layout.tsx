import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Seoul Keys — Learn Korean typing through play";
const description = "Practice Hangul home keys, words, puzzles, long-form typing, and licensed K-POP challenges in short daily sessions.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || "";
  const yandexVerification = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || process.env.YANDEX_VERIFICATION || "";
  const naverVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || process.env.NAVER_SITE_VERIFICATION || "";
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION || "";

  return {
    metadataBase,
    title,
    description,
    applicationName: "Seoul Keys",
    authors: [{ name: "Seoul Keys Team" }],
    keywords: [
      "Korean typing", "Learn Hangul", "Korean keyboard", "한글 타자 연습",
      "한글 교육", "K-POP typing", "Korean language learning", "Hangul practice"
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: googleVerification || undefined,
      yandex: yandexVerification || undefined,
      other: {
        ...(naverVerification ? { "naver-site-verification": naverVerification } : {}),
        ...(bingVerification ? { "msvalidate.01": bingVerification } : {}),
      },
    },
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/favicon.svg" }],
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Seoul Keys",
      locale: "en_US",
      alternateLocale: ["ko_KR", "ja_JP", "zh_CN", "es_ES"],
      images: [{ url: "/og.png", width: 1731, height: 909, alt: "Seoul Keys Korean typing practice" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalApplication",
    "name": "Seoul Keys",
    "operatingSystem": "All",
    "applicationCategory": "EducationalApplication",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "inLanguage": ["en", "ko", "es", "ja", "zh-Hans", "fr", "de"]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resolve the theme before first paint. Without this every page fell
            back to "dark" inside a useEffect, so first-time visitors were forced
            into dark regardless of their system setting and saved-light users
            saw a dark flash on every navigation. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var saved = localStorage.getItem("seoulkeys-theme");
                  var theme = (saved === "dark" || saved === "light")
                    ? saved
                    : (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
                  document.documentElement.setAttribute("data-theme", theme);
                }catch(e){
                  document.documentElement.setAttribute("data-theme","dark");
                }
              })();
            `,
          }}
        />
        {/* Hangul is the entire subject of this app, and every font previously
            named in the stack (Inter, Pretendard, Noto Sans KR, Malgun Gothic)
            was only referenced by name — none were loaded. A visitor outside
            Korea, on stock Windows or macOS, has no installed font containing
            Hangul, so every Korean character rendered as a tofu box. Loading a
            real Korean webfont is what makes the lessons legible abroad. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
        />
        <meta name="theme-color" content="#0d1117" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="naver-site-verification" content={process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || process.env.NAVER_SITE_VERIFICATION || "81f1408a20a5e748ea398f7d89f4088abee34e1c"} />
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || ""} />
        <meta name="yandex-verification" content={process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || process.env.YANDEX_VERIFICATION || ""} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Microsoft Clarity — session insights and heatmaps. Disclosed in /legal
            and in the privacy notice banner. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xsae5by824");
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
