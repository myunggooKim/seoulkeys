import type { Metadata } from "next";
import "./globals.css";

const title = "Seoul Keys — Learn Korean typing through play";
const description = "Learn Hangul and Korean typing through clear guides, short daily practice, original dialogue, words, and games.";

// Canonical URLs are pinned to the production origin rather than derived from the
// request host. metadataBase follows x-forwarded-host, so a hit on the workers.dev
// deployment URL would otherwise declare *itself* canonical and compete with
// seoulkeys.com for the same content.
export const SITE_ORIGIN = "https://seoulkeys.com";

export async function generateMetadata(): Promise<Metadata> {
  // Canonical metadata must not vary by Host. Keeping this static also lets
  // public editorial routes be cached instead of making every page dynamic.
  const metadataBase = new URL(SITE_ORIGIN);

  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || "";
  const yandexVerification = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || process.env.YANDEX_VERIFICATION || "";
  const naverVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || process.env.NAVER_SITE_VERIFICATION || "";
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION || "";

  return {
    metadataBase,
    title,
    description,
    // Language is resolved entirely in the browser (localStorage → browser locale →
    // geo), so ?lang=ko and ?lang=ja serve byte-identical English HTML. Without a
    // canonical, Search Console filed all ten sitemap-declared variants as
    // "duplicate, no user-selected canonical". Child routes override this.
    alternates: { canonical: `${SITE_ORIGIN}/` },
    applicationName: "Seoul Keys",
    authors: [{ name: "Seoul Keys", url: "/about" }],
    creator: "Seoul Keys",
    publisher: "Seoul Keys",
    keywords: [
      "Korean typing", "Learn Hangul", "Korean keyboard", "한글 타자 연습",
      "한글 교육", "Korean typing guide", "Korean language learning", "Hangul practice"
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
        // Chrome will not offer to install without a raster icon of at least
        // 192px, whatever the SVG says, and iOS ignores SVG for the home screen.
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
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
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#organization`,
        "name": "Seoul Keys",
        "url": SITE_ORIGIN,
        "description": "An independent Korean typing and Hangul education project.",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "url": `${SITE_ORIGIN}/contact`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        "name": "Seoul Keys",
        "url": SITE_ORIGIN,
        "description": description,
        "publisher": { "@id": `${SITE_ORIGIN}/#organization` },
        "inLanguage": "en",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* App screens resolve locale, account state and progress before their
            first frame. Public guides are already complete server-rendered
            documents, so they must paint immediately instead of waiting for the
            application's hydration guard. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var root = document.documentElement;
                var path = window.location.pathname;
                var appRoots = ["/", "/my", "/teacher", "/join", "/legal"];
                var needsAppBoot = appRoots.some(function(route) {
                  return path === route || (route !== "/" && path.indexOf(route + "/") === 0);
                });
                if (!needsAppBoot) {
                  root.setAttribute("data-app-ready", "server");
                  return;
                }
                root.setAttribute("data-app-booting", "true");
                window.setTimeout(function(){
                  if (!root.hasAttribute("data-app-booting")) return;
                  root.removeAttribute("data-app-booting");
                  root.setAttribute("data-app-ready", "fallback");
                }, 4000);
              })();
            `,
          }}
        />
        {/* Resolve the theme before first paint. A returning visitor keeps their
            explicit choice; a first-time visitor always starts in light mode. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var saved = localStorage.getItem("seoulkeys-theme");
                  var theme = (saved === "dark" || saved === "light")
                    ? saved
                    : "light";
                  document.documentElement.setAttribute("data-theme", theme);
                }catch(e){
                  document.documentElement.setAttribute("data-theme","light");
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
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
        />
        {/* One serif face, used for exactly one thing: a member's own name written
            in Hangul. Nanum Myeongjo is the closest web-available face to the
            brush-written 궁서 look, and a name deserves to be set like calligraphy
            rather than in the interface font. It shares the request above with
            Noto Sans KR; the browser downloads each font only when CSS uses it. */}
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
