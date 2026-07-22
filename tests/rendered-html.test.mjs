import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Hangeul Pop learning experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Hangeul Pop — Learn Korean typing through play<\/title>/i);
  assert.match(html, /저는 음악을 좋아해요\./);
  assert.match(html, /Korean 2-set keyboard map/);
  assert.match(html, /Next Korean key/);
  assert.match(html, /QWERTY/);
  assert.match(html, /AZERTY/);
  assert.match(html, /QWERTZ/);
  assert.match(html, /aria-label="ㅈ: Press W"/);
  assert.match(html, /Português \(Brasil\)/);
  assert.match(html, /العربية/);
  assert.match(html, /ไทย/);
});

test("keeps local-key mappings and responsive keyboard guidance in source", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /azerty: \{ KeyQ: "A", KeyW: "Z"/);
  assert.match(page, /qwertz: \{ KeyY: "Z", KeyZ: "Y" \}/);
  assert.match(page, /hangeul-pop-keyboard-layout/);
  assert.match(page, /activePracticeKey\?\.code === key\.code/);
  assert.match(page, /const keyboardHelpCopy/);
  assert.match(css, /\.keyboard-map/);
  assert.match(css, /\.keyboard-row kbd\.active/);
  assert.match(css, /\.keyboard-tools/);
});
