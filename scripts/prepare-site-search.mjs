import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const dist = "dist";
const bin = join("node_modules", ".bin", "pagefind");
if (!existsSync(bin)) {
  console.error("site search: pagefind is not installed");
  process.exit(1);
}

const result = spawnSync(
  bin,
  ["--site", dist, "--glob", "{insights,newsletter,worklog}/**/*.html"],
  { stdio: "inherit" },
);
if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);

const entry = join(dist, "pagefind", "pagefind.js");
if (!existsSync(entry)) {
  console.error("site search: dist/pagefind/pagefind.js was not written");
  process.exit(1);
}
