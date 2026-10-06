import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("root head installs the supplied asynchronous AdSense code exactly once", async () => {
  const layout = await read("app/layout.tsx");
  const head = layout.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head);
  const tags = head.match(/<script\s+async\s+src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-4355487582107293"\s+crossOrigin="anonymous"\s*\/>/g);
  assert.equal(tags?.length, 1);
  assert.equal((layout.match(/adsbygoogle\.js/g) || []).length, 1);
});

test("verification pauses ad requests without adding ad slots or changing learning handlers", async () => {
  const layout = await read("app/layout.tsx");
  const pause = layout.match(/__html: "([^"\n]*pauseAdRequests[^"\n]*)"/)?.[1];
  assert.ok(pause);
  assert.ok(layout.indexOf(pause) < layout.indexOf("adsbygoogle.js"));
  for (const existing of [undefined, [], { existingSetting: true }]) {
    const window = { adsbygoogle: existing };
    vm.runInNewContext(pause, { window });
    assert.equal(window.adsbygoogle.pauseAdRequests, 1);
    if (existing) assert.equal(window.adsbygoogle, existing);
  }
  const home = await read("app/page.tsx");
  assert.doesNotMatch(layout + home, /adsbygoogle[^;\n]*\.push\(|pauseAdRequests\s*=\s*0|enable_page_level_ads|<ins\b/);
  // Exact practice/game/audio/progress preservation is also checked by the
  // existing community-baseline regression test, with only the header excluded.
  assert.doesNotMatch(home, /adsbygoogle|googlesyndication/);
});

test("privacy discloses the installed Google script and paused advertising in English and Korean", async () => {
  const legal = await read("app/legal/page.tsx");
  assert.match(legal, /Google AdSense code is installed/);
  assert.match(legal, /Ad requests remain paused/);
  assert.match(legal, /can read existing\s+Google cookies/);
  assert.match(legal, /not a consent management platform/);
  assert.match(legal, /https:\/\/policies\.google\.com\/technologies\/partner-sites/);
  assert.doesNotMatch(legal, /not load Google AdSense/);
  const { adsenseNoticeKo: ko } = await import("../app/legal/adsense-notice.ts");
  const bridge = await read("app/legal/LegalTranslationBridge.tsx");
  assert.match(bridge, /locale === "ko" \? adsenseNoticeKo\[key\]/);
  const section = legal.match(/<section id="cookies"[\s\S]*?<p>\s*It does use two/)?.[0];
  assert.ok(section);
  for (const match of section.matchAll(/<p>\s*([^<]*?)\s*<\/p>/g)) {
    const key = match[1].replace(/\s+/g, " ").trim();
    assert.ok(ko[key], `missing Korean privacy translation: ${key}`);
  }
  assert.equal(ko["Policy version 1.3"], "정책 버전 1.3");
});
