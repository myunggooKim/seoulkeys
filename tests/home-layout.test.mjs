import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the single unchanged community board sits below the header categories, not above practice", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const header = page.slice(page.indexOf('<header className="topbar"'), page.indexOf("</header>"));
  assert.equal((page.match(/<CommunityPulse locale=\{locale\}/g) ?? []).length, 1);
  assert.match(header, /className="header-navigation">[\s\S]*<nav className="nav-links"[\s\S]*<\/nav>\s*<CommunityPulse locale=\{locale\}/);
  assert.doesNotMatch(page, /className="notice-row"|className="desktop-notice-bar"|Desktop Environment Optimized/);
  assert.match(page, /header\.getBoundingClientRect\(\)\.bottom \+ window\.scrollY/);
  assert.doesNotMatch(page, /observer\.observe\(notice\);\s*observer\.observe\(document\.body\)/);
});

test("compact home spacing is desktop-only and cannot shrink expanded practice or hide overflowing content", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const home = css.slice(css.indexOf("/* Only the desktop home preview"), css.indexOf("@media (min-width: 1101px)", css.indexOf("/* Only the desktop home preview")));
  assert.match(home, /@media\(min-width:901px\)/);
  assert.match(home, /\.hero:not\(\.practice-focus-mode\).*padding-block:6px 12px!important/);
  assert.match(home, /height:clamp\(70px,calc\(100svh - 660px\),140px\)/);
  assert.doesNotMatch(home, /overflow:\s*(hidden|clip)|zoom:|scale\(/);
  assert.match(css, /\.header-navigation \.live-board \{[^}]*max-width: 100%;[^}]*flex-wrap: wrap;/s);
});

test("desktop categories retain their original header centre while the wider board hangs below", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media \(min-width: 901px\) \{\s*\.topbar > \.header-navigation \{ padding-block: 0; \}/);
  assert.match(css, /\.header-navigation > \.live-board \{[^}]*position: absolute;[^}]*inset-block-start: calc\(50% \+ 18px\);[^}]*width: max\(100%, 400px\);[^}]*padding-block: 3px;/s);
  assert.match(css, /\.header-navigation \.live-board-cell \{ flex: 0 0 auto;/);
  assert.match(css, /\.header-navigation \.live-board-digits \{ flex: 0 0 auto;/);
  assert.match(css, /\.header-navigation \.live-board \{[^}]*width: 400px;[^}]*max-width: 100%;/s);
});

test("sign-in and sign-out occupy the same slot and reuse the existing account actions", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const auth = page.slice(page.indexOf('className="signout-link header-auth-button"'), page.indexOf('</button>', page.indexOf('className="signout-link header-auth-button"')));
  assert.match(auth, /disabled=\{signedIn === null\}/);
  assert.match(auth, /if \(signedIn === true\) void signOutEverywhere\(\);/);
  assert.match(auth, /else if \(signedIn === false\) setSignupOpen\(true\);/);
  assert.match(auth, /aria-hidden=\{signedIn === true\}.*"Sign in", "로그인"/);
  assert.match(auth, /aria-hidden=\{signedIn !== true\}.*"Sign out", "로그아웃"/);
  assert.match(css, /\.header-auth-button > span \{ grid-area: 1 \/ 1; \}/);
  assert.match(css, /\.header-auth-button > span\[aria-hidden="true"\] \{ visibility: hidden; \}/);
});
