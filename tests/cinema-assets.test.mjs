import assert from "node:assert/strict";
import test from "node:test";
import { loadCinemaHandData } from "../app/cinema-assets.ts";

test("hand bytes load concurrently, deduplicate and retry failed warm-ups", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = url => new Promise(resolve => requests.push({ url, resolve }));
  try {
    const left = loadCinemaHandData("left"), right = loadCinemaHandData("right");
    assert.equal(requests.length, 2, "neither hand waits for the other to download");
    assert.equal(loadCinemaHandData("left"), left);
    assert.equal(loadCinemaHandData("right"), right);
    const leftBytes = new ArrayBuffer(4);
    requests[0].resolve({ ok: true, arrayBuffer: async () => leftBytes });
    requests[1].resolve({ ok: false, status: 503 });
    assert.equal(await left, leftBytes);
    await assert.rejects(right, /503/);
    const retry = loadCinemaHandData("right");
    assert.equal(requests.length, 3);
    const rightBytes = new ArrayBuffer(8);
    requests[2].resolve({ ok: true, arrayBuffer: async () => rightBytes });
    assert.equal(await retry, rightBytes);
    assert.equal(await loadCinemaHandData("left"), leftBytes);
    assert.equal(requests.length, 3, "switching views does not download the same hand again");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
