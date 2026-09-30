import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const context = { self: { addEventListener() {} } };
runInNewContext(source, context);
const request = { mode: "cors", destination: "style", headers: new Headers() };
const cacheable = (path, overrides = {}) => context.isCacheableAsset({ ...request, ...overrides }, new URL(path, "https://seoulkeys.com"));

test("only immutable build CSS and JS use cache-first; unversioned files stay current", () => {
  assert.equal(cacheable("/assets/index-abcd1234.css"), true);
  assert.equal(cacheable("/assets/game-abcd1234.js"), true);
  assert.equal(cacheable("/app/globals.css"), false);
  assert.equal(cacheable("/sw.js"), false);
  assert.equal(cacheable("/images/typing-hands-v2-lossless.webp"), true);
  assert.equal(cacheable("/audio/hello.mp3"), true);
});

test("development files, user pages, API and RSC never use cache-first", () => {
  assert.equal(cacheable("http://localhost:3000/app/globals.css"), false);
  assert.equal(cacheable("http://127.0.0.1:3000/app/page.tsx"), false);
  assert.equal(cacheable("http://[::1]:3000/assets/index.js"), false);
  assert.equal(cacheable("/my", { mode: "navigate", destination: "document" }), false);
  assert.equal(cacheable("/api/progress"), false);
  assert.equal(cacheable("/assets/payload.js?_rsc=1"), false);
  assert.equal(cacheable("/assets/payload.js", { headers: new Headers({ RSC: "1" }) }), false);
});
