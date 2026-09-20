import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import postcss from "postcss";

const clientDirectory = fileURLToPath(new URL("../dist/client/", import.meta.url));

async function collectCssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectCssFiles(path);
    return entry.isFile() && entry.name.endsWith(".css") ? [path] : [];
  }));
  return files.flat();
}

test("built responsive CSS remains readable by Safari before media-query range support", async () => {
  // Inspect the production output: the minifier can change valid source media
  // queries into syntax an older browser silently ignores.
  const cssFiles = await collectCssFiles(clientDirectory);
  assert.ok(cssFiles.length > 0, "Build the client before running the CSS compatibility test");

  const unsupportedConditions = [];
  const mainConditions = [];
  let mainStylesheets = 0;

  for (const path of cssFiles) {
    const isMainStylesheet = /^index-[^.]+\.css$/.test(basename(path));
    if (isMainStylesheet) mainStylesheets += 1;
    const root = postcss.parse(await readFile(path, "utf8"), { from: path });
    root.walkAtRules("media", (rule) => {
      const condition = rule.params.replace(/\/\*[\s\S]*?\*\//g, " ");
      const usesSizeRange = /\b(?:width|height)\s*[<>=]|[<>=]\s*(?:width|height)\b/i.test(condition);
      if (usesSizeRange) {
        unsupportedConditions.push(`${relative(clientDirectory, path)}: ${rule.params}`);
      }
      if (isMainStylesheet) mainConditions.push(condition);
    });
  }

  assert.deepEqual(unsupportedConditions, [], "Viewport ranges must compile to legacy min/max media queries");
  assert.ok(mainStylesheets > 0, "The build must contain the main index stylesheet");
  assert.ok(mainConditions.some((condition) => /\(\s*min-width\s*:\s*901px\s*\)/i.test(condition)),
    "The main desktop breakpoint must survive production CSS compilation");
  assert.ok(mainConditions.some((condition) => /\(\s*max-width\s*:\s*900px\s*\)/i.test(condition)),
    "The main mobile breakpoint must survive production CSS compilation");
});
