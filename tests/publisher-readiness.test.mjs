import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const expectedGuideSlugs = [
  "add-korean-keyboard",
  "hangul-syllable-blocks",
  "korean-keyboard-layout",
  "korean-touch-typing",
  "korean-typing-mistakes",
  "korean-typing-practice-plan",
  "type-batchim",
  "type-double-consonants-and-vowels",
];

function collectWords(value) {
  if (typeof value === "string") return value.match(/[A-Za-z0-9가-힣]+/g) ?? [];
  if (Array.isArray(value)) return value.flatMap(collectWords);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectWords);
  return [];
}

test("publishes eight substantial, internally connected Korean typing guides", async () => {
  const { guides, getGuide } = await import("../app/learn/guides.ts");
  const slugs = guides.map((guide) => guide.slug).sort();

  assert.deepEqual(slugs, expectedGuideSlugs);
  assert.equal(new Set(guides.map((guide) => guide.title)).size, guides.length);
  assert.equal(new Set(guides.map((guide) => guide.description)).size, guides.length);

  for (const guide of guides) {
    assert.equal(getGuide(guide.slug), guide);
    assert.ok(collectWords(guide).length >= 1_000, `${guide.slug} must remain a substantial guide`);
    assert.ok(guide.sections.length >= 4, `${guide.slug} needs a complete explanatory structure`);
    assert.ok(guide.faqs.length >= 3, `${guide.slug} needs useful learner questions`);
    assert.ok(guide.references.length >= 1, `${guide.slug} needs an attributable technical source`);
    assert.ok(guide.related.length >= 2, `${guide.slug} needs useful internal next steps`);
    assert.ok(!guide.related.includes(guide.slug), `${guide.slug} cannot recommend itself`);
    for (const related of guide.related) assert.ok(getGuide(related), `${guide.slug} links to unknown guide ${related}`);
  }
});

test("keeps every published QWERTY example equal to its composed Hangul result", async () => {
  const [{ guides }, { appendJamo }] = await Promise.all([
    import("../app/learn/guides.ts"),
    import("../app/hangul-compose.ts"),
  ]);
  const keyMap = {
    q: "ㅂ", Q: "ㅃ", w: "ㅈ", W: "ㅉ", e: "ㄷ", E: "ㄸ", r: "ㄱ", R: "ㄲ", t: "ㅅ", T: "ㅆ",
    y: "ㅛ", u: "ㅕ", i: "ㅑ", o: "ㅐ", O: "ㅒ", p: "ㅔ", P: "ㅖ",
    a: "ㅁ", s: "ㄴ", d: "ㅇ", f: "ㄹ", g: "ㅎ", h: "ㅗ", j: "ㅓ", k: "ㅏ", l: "ㅣ",
    z: "ㅋ", x: "ㅌ", c: "ㅊ", v: "ㅍ", b: "ㅠ", n: "ㅜ", m: "ㅡ",
  };
  const composeSegment = (keys) => [...keys].reduce(
    (result, key) => key === " " ? result + " " : appendJamo(result, keyMap[key] ?? key),
    "",
  );
  const composeKeys = (keys) => keys.split(" → ").map(composeSegment).join(" → ");
  const examples = guides.flatMap((guide) => [
    ...guide.sections.flatMap((section) => section.examples ?? []),
    ...guide.drill.items,
  ]);
  const checkable = examples.filter(
    (example) => /^[A-Za-z →]+$/.test(example.keys) && /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(example.result),
  );

  assert.ok(checkable.length >= 70, "the library should retain a broad set of verified examples");
  for (const example of checkable) {
    assert.equal(composeKeys(example.keys), example.result, `${example.keys} must compose to ${example.result}`);
  }
});

test("keeps one canonical sitemap and excludes private dashboards from discovery", async () => {
  const [sitemap, robots, myPage, teacherLayout] = await Promise.all([
    readFile(new URL("../app/sitemap.xml/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../app/my/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/teacher/layout.tsx", import.meta.url), "utf8"),
  ]);

  for (const slug of expectedGuideSlugs) assert.match(sitemap, new RegExp(`/learn/${slug}`));
  for (const route of ["/learn", "/learn/hangul", "/about", "/contact", "/legal"]) {
    assert.match(sitemap, new RegExp(`seoulkeys\\.com${route === "/learn" ? "/learn(?:\")" : route}`));
  }
  assert.doesNotMatch(sitemap, /seoulkeys\.com\/(?:my|teacher|admin|join)/);
  await assert.rejects(access(new URL("../public/sitemap.xml", import.meta.url)));

  assert.equal((robots.match(/^User-agent:/gm) ?? []).length, 1);
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Sitemap: https:\/\/seoulkeys\.com\/sitemap\.xml$/m);
  assert.doesNotMatch(robots, /Disallow: \/learn/);
  assert.match(myPage, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/s);
  assert.match(teacherLayout, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/s);
});

test("canonicalizes only production hosts and preserves the existing UI contract", async () => {
  const [worker, wrangler, layout, home, learningChrome] = await Promise.all([
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../wrangler.json", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/LearningChrome.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(worker, /url\.hostname === "seoulkeys\.com" \|\| url\.hostname === "www\.seoulkeys\.com"/);
  assert.match(worker, /status:\s*308/);
  assert.match(worker, /location:\s*url\.toString\(\)/);
  assert.match(worker, /url\.pathname === "\/robots\.txt"[\s\S]*return env\.ASSETS\.fetch\(request\)/);
  assert.equal(JSON.parse(wrangler).assets.binding, "ASSETS");
  assert.match(layout, /var appRoots = \["\/", "\/my", "\/teacher", "\/join", "\/legal"\]/);
  assert.match(layout, /appRoots\.some\(function\(route\)/);
  assert.match(learningChrome, /^"use client";/);
  assert.match(learningChrome, /<LearningLocaleSelect locale=\{locale\}/);
  assert.doesNotMatch(learningChrome, /LearningReady/);

  assert.match(home, /href="\/learn"/);
  assert.match(home, /href="\/about"/);
  assert.match(home, /href="\/contact"/);
  assert.match(home, /const visibleActivities = useMemo/);
  assert.match(home, /publishedKpopItems\.length \? activities : activities\.filter/);
  assert.match(home, /Original Scene Dialogue/);
  assert.doesNotMatch(home, /Licensed K-POP Lines/);
});

test("keeps public header styles isolated from admin and guide headings", async () => {
  const [ownerConsole, styles] = await Promise.all([
    readFile(new URL("../app/my/OwnerConsole.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(ownerConsole, /확인이 필요한 것|owner-console-alerts|teachersWithoutClass|learnersWithoutClass/);

  assert.doesNotMatch(styles, /(^|\n)\s*header\s*(?:,|\{)/);
  assert.doesNotMatch(styles, /\.owner-activity-table/);
});
