/** Read-only public HTTP checks; no credentials, form submissions or DB writes. */
import { guides } from "../app/learn/guides";

const requestedBase = process.argv.find(value => value.startsWith("--base="))?.slice(7) ?? "https://seoulkeys.com";
const base = new URL(requestedBase);
if (base.username || base.password || (!/^https:$/u.test(base.protocol) && !["localhost", "127.0.0.1"].includes(base.hostname))) throw new Error("Use an HTTPS origin or local test server");
const routes = ["/", "/about", "/contact", "/legal", "/learn", "/learn/hangul", ...guides.map(guide => `/learn/${guide.slug}`)];
const findings: { route: string; status: number; canonical: string | null; title: string | null; htmlBytes: number }[] = [];
const issues: string[] = [];
for (const route of routes) {
  const response = await fetch(new URL(route, base), { redirect: "follow", signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/iu)?.[1] ?? null;
  const title = html.match(/<title>([\s\S]*?)<\/title>/iu)?.[1] ?? null;
  findings.push({ route, status: response.status, canonical, title, htmlBytes: html.length });
  if (response.status !== 200) issues.push(`${route}: HTTP ${response.status}`);
  if (!title || !canonical) issues.push(`${route}: missing title/canonical`);
  if (canonical !== `https://seoulkeys.com${route === "/" ? "/" : route}`) issues.push(`${route}: wrong canonical ${canonical}`);
  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/iu.test(html)) issues.push(`${route}: public page is noindex`);
  if (route.startsWith("/learn/") && html.length < 8000) issues.push(`${route}: unexpectedly sparse response`);
  if (route === "/learn/hangul" && /halves what you have to memorise|each added stroke pushes more breath|only script whose creator|glottal · \/ŋ\//u.test(html)) issues.push(`${route}: stale incorrect lesson`);
}
const robots = await fetch(new URL("/robots.txt", base));
const robotsText = await robots.text();
if (robots.status !== 200 || !robotsText.includes("Sitemap: https://seoulkeys.com/sitemap.xml") || /^Disallow:\s*\/$/mu.test(robotsText)) issues.push("robots.txt: missing or blocks public pages");
const sitemap = await fetch(new URL("/sitemap.xml", base));
const sitemapText = await sitemap.text();
for (const route of routes.slice(1)) if (!sitemapText.includes(`https://seoulkeys.com${route}`)) issues.push(`sitemap: missing ${route}`);
if (sitemap.status !== 200) issues.push(`sitemap: HTTP ${sitemap.status}`);
const missing = await fetch(new URL("/readiness-check-nonexistent-page-20261004", base));
if (missing.status !== 404) issues.push(`nonexistent page: expected 404, got ${missing.status}`);
console.log(JSON.stringify({ base: base.origin, checked: new Date().toISOString(), publicPages: findings, robotsStatus: robots.status, sitemapStatus: sitemap.status, nonexistentStatus: missing.status, issues }, null, 2));
if (issues.length) process.exitCode = 1;
