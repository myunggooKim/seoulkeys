// Seoul Keys service worker.
//
// v1 precached "/" and served every GET cache-first, including HTML navigations
// and the RSC payloads the Next.js router fetches. A per-user page like /my was
// answered from a stale cache, so the router received a document where it
// expected a flight payload and rendered nothing — a white screen that only
// cleared on a manual reload.
//
// v2 rule: cache only build assets and static media. Anything that varies per
// user or per deploy (documents, RSC payloads, API calls) always hits the
// network.
const CACHE_NAME = "seoul-keys-v3";
const STATIC_ASSETS = ["/favicon.svg", "/og.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key.startsWith("seoul-keys-") && key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/** Hashed assets and static media are safe to serve from cache. Nothing else is. */
function isCacheableAsset(request, url) {
  // Development URLs are not content-hashed. Cache-first kept old CSS even
  // after reload, making new controls appear unstyled during verification.
  if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return false;
  if (request.mode === "navigate") return false;
  if (request.destination === "document") return false;
  // The Next.js router asks for RSC payloads at ordinary page URLs.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return false;
  if (url.pathname.startsWith("/api/")) return false;
  // Integrated game engines, audio and meaning packs must revalidate as a unit.
  if (url.pathname.startsWith("/games/") || url.pathname.startsWith("/i18n/defense/") || url.pathname.startsWith("/i18n/crossword/")) return false;
  // Outside the build's hashed /assets/ directory, scripts/styles can change
  // at the same URL. They must not freeze at a previous deployment.
  if (/\.(?:css|js|mjs)$/i.test(url.pathname) && !url.pathname.startsWith("/assets/")) return false;
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/audio/") ||
    url.pathname.startsWith("/images/") ||
    /\.(?:css|js|mjs|woff2?|png|jpe?g|gif|svg|webp|avif|mp3|ogg|wav)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!isCacheableAsset(request, url)) return; // let the network answer it

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
