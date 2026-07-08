import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/Nav.astro", import.meta.url), "utf8");

const cssBlock = (selector, from = 0) => {
  const start = source.indexOf(`${selector} {`, from);
  if (start === -1) return "";
  const end = source.indexOf("\n    }", start);
  return end === -1 ? source.slice(start) : source.slice(start, end + 7);
};

const nav = cssBlock("nav");
const desktopLinks = cssBlock(".nav-links");
const desktopSub = cssBlock(".nav-sub");
const mobileStart = source.indexOf("@media (max-width: 760px)");
const mobileLinks = cssBlock(".nav-links", mobileStart);

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
  {
    label: "nav badge keeps shared mb-header 30px sizing",
    ok:
      /<img src="\/minusbeta-badge\.svg" alt="" width="30" height="30" \/>/.test(source) &&
      /\.brand img \{ height: 30px; width: 30px; display: block; \}/.test(source),
  },
  {
    label: "primary and secondary nav typography matches shared mb-header",
    ok:
      /font-size: 13px;/.test(desktopLinks) &&
      /font-size: 13px;/.test(desktopSub),
  },
  {
    label: "nav blocks host typography inheritance like shared mb-header",
    ok:
      /line-height: 1\.65;/.test(nav) &&
      /letter-spacing: normal;/.test(nav) &&
      /font-style: normal;/.test(nav),
  },
  {
    label: "mobile primary nav preserves shared mb-header horizontal row behavior",
    ok:
      /grid-column: 1 \/ -1;/.test(mobileLinks) &&
      /grid-row: 2;/.test(mobileLinks) &&
      /justify-content: flex-start;/.test(mobileLinks) &&
      /gap: 16px;/.test(mobileLinks) &&
      !/flex-wrap: wrap;/.test(mobileLinks),
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
