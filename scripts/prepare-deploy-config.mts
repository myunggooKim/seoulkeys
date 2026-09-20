import { readFile, writeFile } from "node:fs/promises";

const generatedUrl = new URL("../dist/server/wrangler.json", import.meta.url);
const deployUrl = new URL("../dist/server/wrangler.deploy.json", import.meta.url);
const config = JSON.parse(await readFile(generatedUrl, "utf8")) as Record<string, unknown>;

// The existing custom domains already point at the seoulkeys Worker. The API
// token intentionally has Worker deployment access without zone-route editing,
// so route updates are managed separately. deploy-cloudflare-version.mts uploads
// a version and activates it at 100% traffic without touching those domains.
delete config.routes;
await writeFile(deployUrl, `${JSON.stringify(config)}\n`, "utf8");
