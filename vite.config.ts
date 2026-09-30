import vinext from "vinext";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    // Addons and the lazily imported WebGLRenderer must share one Three core.
    // Otherwise the theatre loads a second core and incompatible mesh classes.
    resolve: { alias: [{ find: /^three$/, replacement: fileURLToPath(new URL("./node_modules/three/src/Three.Core.js", import.meta.url)) }] },
    // Preserve min-width/max-width media queries for older Mac/iOS Safari.
    // The default CSS minifier otherwise emits range queries (Safari 16.4+).
    build: {
      cssTarget: ["chrome111", "edge111", "firefox114", "safari15.4", "ios15.4"],
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      }),
    ],
  };
});
