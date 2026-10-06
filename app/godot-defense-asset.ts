const WASM_PATH = "/games/seoul-defense/index.wasm";
const GZIP_PATH = `${WASM_PATH}.gz`;

type AssetBinding = { fetch(input: Request): Promise<Response> };

/** Explicit gzip;q=0 takes precedence over a wildcard. Malformed weights are rejected. */
export function acceptsGzip(value: string | null): boolean {
  const weights = new Map<string, number>();
  for (const part of (value ?? "").split(",")) {
    const [token, ...parameters] = part.trim().toLowerCase().split(";");
    const coding = token.trim();
    if (coding !== "gzip" && coding !== "*") continue;
    let weight = 1;
    for (const parameter of parameters) {
      const [key, rawValue = ""] = parameter.trim().split("=");
      if (key.trim() !== "q") continue;
      const q = rawValue.trim();
      weight = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(q) ? Number(q) : 0;
    }
    weights.set(coding, Math.min(weights.get(coding) ?? 1, weight));
  }
  return (weights.get("gzip") ?? weights.get("*") ?? 0) > 0;
}

function failure(request: Request, status: number, message: string): Response {
  return new Response(request.method === "HEAD" ? null : message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "vary": "Accept-Encoding", "x-content-type-options": "nosniff" },
  });
}

/** Serve one public engine binary through the existing local ASSETS binding only. */
export async function serveDefenseWasm(request: Request, assets: AssetBinding): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== WASM_PATH) return failure(request, 404, "Not found");
  if (request.method !== "GET" && request.method !== "HEAD") {
    const response = failure(request, 405, "Method not allowed");
    response.headers.set("allow", "GET, HEAD");
    return response;
  }
  const originalEncoding = (request as Request & { cf?: { clientAcceptEncoding?: string | null } }).cf?.clientAcceptEncoding;
  const acceptedEncoding = originalEncoding !== undefined ? originalEncoding : request.headers.get("accept-encoding");
  if (!acceptsGzip(acceptedEncoding)) return failure(request, 406, "The game engine requires a browser that accepts gzip encoding.");
  url.pathname = GZIP_PATH;
  url.search = "";
  try {
    const asset = await assets.fetch(new Request(url, {
      method: request.method,
      credentials: "omit",
      // Deliberately do not copy authorization, cookies, ranges, or other user headers.
      headers: { "accept-encoding": "identity" },
    }));
    if (asset.status !== 200) return failure(request, 503, "The game engine asset is unavailable. Please try again later.");
    // Vite's ASSETS adapter labels .gz files and workerd decodes their streams.
    // Production raw .gz assets have no Content-Encoding and remain gzip bytes.
    const bindingDecoded = asset.headers.get("content-encoding")?.toLowerCase() === "gzip";
    const headers = new Headers({
      "content-type": "application/wasm",
      "content-encoding": "gzip",
      "cache-control": "public, max-age=0, must-revalidate",
      "vary": "Accept-Encoding",
      "x-content-type-options": "nosniff",
    });
    // This is the size of the stored gzip bytes, not the decompressed module.
    const length = asset.headers.get("content-length");
    if (length && !bindingDecoded) headers.set("content-length", length);
    const etag = asset.headers.get("etag");
    if (etag) headers.set("etag", etag);
    // Do not label an already-decoded binding stream as precompressed bytes.
    const init: ResponseInit & { encodeBody: "manual" | "automatic" } = { status: 200, headers, encodeBody: bindingDecoded ? "automatic" : "manual" };
    return new Response(request.method === "HEAD" ? null : asset.body, init);
  } catch {
    return failure(request, 503, "The game engine asset is unavailable. Please try again later.");
  }
}
