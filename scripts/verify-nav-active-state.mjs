import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/Nav.astro", import.meta.url), "utf8");

const checks = [
  {
    label: "secondary nav links receive aria-current from isActive",
    ok: /secondary\.map\(\s*\(?l\)?\s*=>\s*<a href=\{l\.href\} aria-current=\{isActive\(l\.href\) \? 'page' : undefined\}>/.test(source),
  },
  {
    label: "secondary nav active link gets the bold weight",
    ok: /\.nav-sub a\[aria-current="page"\]\s*\{[^}]*font-weight:\s*700;[^}]*\}/.test(source),
  },
  {
    label: "secondary nav links are not all bold by default",
    ok: !/\.nav-sub a\s*\{\s*font-weight:\s*700;\s*\}/.test(source),
  },
];

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error("Nav active state verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure.label}`);
  }
  process.exit(1);
}

console.log("Nav active state verification passed");
