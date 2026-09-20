export const dynamic = "force-dynamic";

// The previous version declared ten hreflang alternates for the homepage
// (?lang=ko, ?lang=ja, …). Locale is resolved in the browser, so every one of
// those URLs served byte-identical English HTML — Search Console filed the whole
// set as "duplicate, no user-selected canonical". Real hreflang belongs here only
// once the server actually renders a different document per locale.
const pages = [
  { loc: "https://seoulkeys.com/", changefreq: "daily", priority: "1.0" },
  { loc: "https://seoulkeys.com/learn", changefreq: "weekly", priority: "0.9" },
  { loc: "https://seoulkeys.com/learn/hangul", changefreq: "monthly", priority: "0.9" },
  { loc: "https://seoulkeys.com/learn/korean-keyboard-layout", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/add-korean-keyboard", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/hangul-syllable-blocks", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/type-batchim", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/type-double-consonants-and-vowels", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/korean-touch-typing", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/korean-typing-mistakes", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/learn/korean-typing-practice-plan", changefreq: "monthly", priority: "0.8" },
  { loc: "https://seoulkeys.com/about", changefreq: "monthly", priority: "0.5" },
  { loc: "https://seoulkeys.com/contact", changefreq: "monthly", priority: "0.5" },
  { loc: "https://seoulkeys.com/legal", changefreq: "monthly", priority: "0.3" },
];

const lastmod = "2026-09-03";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
