import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { waitForInitialFonts } from "../app/initial-paint.ts";
import { firstMinuteToolsReleased } from "../app/release-features.ts";
import { GameLoadBoundary } from "../app/GameLoadBoundary.tsx";

test("a stalled font cannot keep a prepared screen hidden past its 150ms budget", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let revealed = false;
  const waiting = waitForInitialFonts(new Promise(() => {})).then(() => { revealed = true; });
  t.mock.timers.tick(149);
  await Promise.resolve();
  assert.equal(revealed, false);
  t.mock.timers.tick(1);
  await waiting;
  assert.equal(revealed, true);
});

test("warm fonts and font failures both release the screen without waiting for the budget", async () => {
  await waitForInitialFonts(Promise.resolve());
  await waitForInitialFonts(Promise.reject(new Error("font CDN offline")));
});

test("home keeps localization, account and progress guards and lazily loads optional games", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /if \(!localeResolved \|\| !translationsReady \|\| !progressLoaded \|\| !themeResolved \|\| signedIn === null\) return/);
  assert.match(page, /waitForInitialFonts\(fontReady\)\.then\(reveal\)/);
  assert.doesNotMatch(page, /void fontReady\.then\(reveal\)/);
  for (const game of ["CrosswordGame", "FallingWordsGame", "ProgressivePuzzles"]) {
    assert.match(page, new RegExp(`lazy\\(\\(\\) => import\\("\\./${game}"\\)`));
    assert.doesNotMatch(page, new RegExp(`import \\{[^}]+\\} from "\\./${game}"`));
  }
  assert.match(page, /<Suspense fallback=/);
  assert.match(page, /<GameLoadBoundary key=\{activeActivity\}/);
});

test("an optional-game load error keeps the surrounding screen available", () => {
  const boundary = new GameLoadBoundary({ children: "game", fallback: "retry" });
  assert.equal(boundary.render(), "game");
  boundary.state = GameLoadBoundary.getDerivedStateFromError();
  assert.equal(boundary.render(), "retry");
});

test("a performance release does not accidentally expose unreleased onboarding UI", async () => {
  assert.equal(firstMinuteToolsReleased, false);
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /firstMinuteToolsReleased && currentPracticeItem.kind === "home" && <FirstMinuteWarmup/);
  assert.match(page, /firstMinuteToolsReleased && \(currentPracticeItem.kind[\s\S]*?<SyllableGuide/);
});
