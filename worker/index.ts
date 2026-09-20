/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Keep one public origin without changing request semantics. 308 is used
    // deliberately: unlike 301/302, clients must preserve the method and body
    // when retrying POST/PUT requests on the canonical URL.
    const isProductionHost = url.hostname === "seoulkeys.com" || url.hostname === "www.seoulkeys.com";
    if (isProductionHost && (url.protocol !== "https:" || url.hostname !== "seoulkeys.com")) {
      url.protocol = "https:";
      url.hostname = "seoulkeys.com";
      url.port = "";
      return new Response(null, {
        status: 308,
        headers: {
          location: url.toString(),
          "cache-control": request.method === "GET" || request.method === "HEAD"
            ? "public, max-age=3600"
            : "private, no-store",
        },
      });
    }

    // The app router is the single source of truth for the dynamic sitemap.
    if (url.pathname === "/sitemap.xml") {
      return handler.fetch(request, env, ctx);
    }

    // robots.txt is a real public asset. Routing it through vinext's static-file
    // adapter currently returns a 200 response with an empty body, so serve the
    // asset binding directly and keep the crawler policy intact.
    if (url.pathname === "/robots.txt") {
      return env.ASSETS.fetch(request);
    }

    // 1. Static asset bypass for verification files (naver, Bing, etc.)
    if (
      url.pathname.startsWith("/naver") ||
      url.pathname.endsWith(".html") ||
      url.pathname.endsWith(".xml") ||
      url.pathname.endsWith(".txt")
    ) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status !== 404) {
          return assetRes;
        }
      } catch {
        // Fallback to app router handler
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
