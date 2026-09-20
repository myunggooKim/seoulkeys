import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
);

function runWrangler(args: string[]) {
  const result = spawnSync(wrangler, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Wrangler exited with status ${result.status ?? "unknown"}.`);
  }

  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

const uploadOutput = runWrangler([
  "versions",
  "upload",
  "--config",
  "dist/server/wrangler.deploy.json",
]);

const versionId = uploadOutput.match(/(?:Worker\s+)?Version ID:\s*([0-9a-f-]{36})/i)?.[1];
if (!versionId) {
  throw new Error("Wrangler uploaded the build but did not return a Worker Version ID.");
}

runWrangler([
  "versions",
  "deploy",
  `${versionId}@100%`,
  "--name",
  "hangeul-pop",
]);

process.stdout.write(`Activated Seoul Keys Worker version ${versionId} at 100% traffic.\n`);
