import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gzipSync, gunzipSync } from "node:zlib";
import { acceptsGzip, serveDefenseWasm } from "../app/godot-defense-asset.ts";

const url = "https://seoulkeys.example/games/seoul-defense/index.wasm";
const binary = Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]);
const gzip = gzipSync(binary);

test("WASM encoding negotiation respects gzip, wildcard, missing header and q=0", () => {
  for (const header of ["gzip", "br, gzip, deflate", "gzip;q=0.5", "*", "*;q=0.4", "GZIP; q=1.000"]) assert.equal(acceptsGzip(header), true, header);
  for (const header of [null, "", "br, deflate", "identity", "gzip;q=0", "gzip;q=0.000,*;q=1", "gzip;q=2", "gzip;q=wat", "gzip;q=-1", "*;q=0", "gzip;q=0,gzip;q=1"]) assert.equal(acceptsGzip(header), false, header);
});

test("WASM GET reads a fixed public binding asset with no forwarded user data", async () => {
  const calls = [];
  const request = new Request(url + "?token=never-forward", { headers: { "accept-encoding": "br, gzip", "cookie": "secret=test", "authorization": "Bearer test", "range": "bytes=0-3" } });
  const response = await serveDefenseWasm(request, { async fetch(assetRequest) {
    calls.push(assetRequest);
    return new Response(gzip, { headers: { "content-type": "application/gzip", "content-length": String(gzip.length), "etag": '"test-gzip"', "set-cookie": "never-copy=1" } });
  } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, url + ".gz");
  assert.equal(calls[0].method, "GET");
  assert.equal(calls[0].credentials, "omit");
  assert.deepEqual([...calls[0].headers], [["accept-encoding", "identity"]]);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/wasm");
  assert.equal(response.headers.get("content-encoding"), "gzip");
  assert.equal(response.headers.get("vary"), "Accept-Encoding");
  assert.equal(response.headers.get("content-length"), String(gzip.length));
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(gunzipSync(Buffer.from(await response.arrayBuffer())), binary);
});

test("WASM HEAD preserves encoded headers without a body", async () => {
  const response = await serveDefenseWasm(new Request(url, { method: "HEAD", headers: { "accept-encoding": "gzip" } }), { async fetch(request) {
    assert.equal(request.method, "HEAD");
    return new Response(null, { headers: { "content-length": String(gzip.length) } });
  } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-encoding"), "gzip");
  assert.equal(response.headers.get("content-length"), String(gzip.length));
  assert.equal(await response.text(), "");
});

test("Unsupported encodings, methods and paths cannot access assets", async () => {
  const noFetch = { async fetch() { assert.fail("The binding must not be called"); } };
  assert.equal((await serveDefenseWasm(new Request(url), noFetch)).status, 406);
  assert.equal((await serveDefenseWasm(new Request(url, { headers: { "accept-encoding": "gzip;q=0,*;q=1" } }), noFetch)).status, 406);
  const post = await serveDefenseWasm(new Request(url, { method: "POST" }), noFetch);
  assert.equal(post.status, 405); assert.equal(post.headers.get("allow"), "GET, HEAD");
  assert.equal((await serveDefenseWasm(new Request(url.replace("index.wasm", "private.wasm")), noFetch)).status, 404);
});

test("Missing or failing assets return clean non-encoded errors; HEAD stays bodyless", async () => {
  for (const method of ["GET", "HEAD"]) {
    for (const fail of [async () => new Response("private detail", { status: 404 }), async () => { throw new Error("private detail"); }]) {
      const response = await serveDefenseWasm(new Request(url, { method, headers: { "accept-encoding": "gzip" } }), { fetch: fail });
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("content-encoding"), null);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const text = await response.text(); assert.doesNotMatch(text, /private detail/);
      if (method === "HEAD") assert.equal(text, "");
    }
  }
});

test("Runtime route is exact and marks precompressed bytes as manual encoding", async () => {
  const route = await readFile(new URL("../app/games/seoul-defense/index.wasm/route.ts", import.meta.url), "utf8");
  const helper = await readFile(new URL("../app/godot-defense-asset.ts", import.meta.url), "utf8");
  assert.match(route, /from "cloudflare:workers"/);
  assert.match(route, /export function GET/); assert.match(route, /export function HEAD/);
  assert.match(route, /serveDefenseWasm\(request, env\.ASSETS\)/);
  assert.match(helper, /encodeBody: bindingDecoded \? "automatic" : "manual"/);
  assert.doesNotMatch(route + helper, /fetch\(["'`]https?:|COOP|COEP|crossOriginIsolated/);
});


test("Cloudflare's original client encoding takes precedence over normalized headers", async () => {
  const request = new Request(url, { headers: { "accept-encoding": "br, gzip" } });
  Object.defineProperty(request, "cf", { value: { clientAcceptEncoding: "identity, gzip;q=0,*;q=1" } });
  assert.equal((await serveDefenseWasm(request, { async fetch() { assert.fail("Rejected client encoding must not fetch assets"); } })).status, 406);
});

test("An already-decoded binding stream is not mislabeled with its compressed byte length", async () => {
  const response = await serveDefenseWasm(new Request(url, { headers: { "accept-encoding": "gzip" } }), { async fetch() {
    return new Response(binary, { headers: { "content-encoding": "gzip", "content-length": String(gzip.length) } });
  } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-length"), null);
  // Node ignores Workers encodeBody; the full local runtime verifies its use.
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), binary);
});
