/** Read-only post-deploy integrity checks against this build's public assets. */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

const origin = new URL(process.argv.find(value => value.startsWith("--base="))?.slice(7) ?? "https://seoulkeys.com");
if (origin.protocol !== "https:" || origin.username || origin.password) throw new Error("Use an HTTPS origin without credentials");
const packsRoot = new URL("../public/i18n/learn/", import.meta.url);
const bundles = (await readdir(packsRoot, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name);
const paths: string[] = [];
for (const bundle of bundles) {
  for (const file of await readdir(new URL(`${bundle}/`, packsRoot))) if (file.endsWith(".json")) paths.push(`/i18n/learn/${bundle}/${file}`);
}
const issues: string[] = [];
let cursor = 0;
let matched = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < paths.length) {
    const pathname = paths[cursor++];
    try {
      const [local, response] = await Promise.all([
        readFile(new URL(`../public${pathname}`, import.meta.url)),
        fetch(new URL(pathname, origin), { signal: AbortSignal.timeout(20000) }),
      ]);
      if (response.status !== 200) { issues.push(`${pathname}: HTTP ${response.status}`); continue; }
      const remote = Buffer.from(await response.arrayBuffer());
      const hash = (value: Buffer) => createHash("sha256").update(value).digest("hex");
      if (hash(local) !== hash(remote)) issues.push(`${pathname}: deployed bytes differ from verified build`);
      else matched++;
    } catch (error) { issues.push(`${pathname}: ${error instanceof Error ? error.message : String(error)}`); }
  }
}));
const audioPaths = ["/audio/typing/key-a.wav", "/audio/typing/key-b.wav", "/audio/typing/key-wide.wav", "/audio/ko/concept-04-male.mp3"];
const audio = await Promise.all(audioPaths.map(async pathname => {
  const response = await fetch(new URL(pathname, origin), { signal: AbortSignal.timeout(20000) });
  const bytes = (await response.arrayBuffer()).byteLength;
  if (response.status !== 200 || bytes < 1000) issues.push(`${pathname}: unavailable audio asset`);
  return { pathname, status: response.status, bytes };
}));
const www = await fetch("https://www.seoulkeys.com/learn", { redirect: "manual", signal: AbortSignal.timeout(20000) });
const redirect = { status: www.status, location: www.headers.get("location") };
if (redirect.status !== 308 || redirect.location !== "https://seoulkeys.com/learn") issues.push("www domain: canonical redirect failed");
console.log(JSON.stringify({ checked: new Date().toISOString(), origin: origin.origin, bundles: bundles.length, checkedPacks: paths.length, matchedPacks: matched, audio, redirect, issues }, null, 2));
if (issues.length) process.exitCode = 1;
