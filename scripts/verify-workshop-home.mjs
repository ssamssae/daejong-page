import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const index = read("src/pages/index.astro");
const layout = read("src/layouts/Layout.astro");
const tokens = read("src/styles/tokens.css");
const nav = read("src/components/Nav.astro");
const footer = read("src/components/Footer.astro");
const hasLocalHeaderMirror = existsSync(new URL("../public/mb-components.js", import.meta.url));

const checks = [
  {
    label: "home carries the dasolin-tone workshop marker",
    ok: /data-tone="dasolin-workshop"/.test(index),
  },
  {
    label: "home first viewport names Kang Daejong work hub",
    ok: /<h1[^>]*>강대종의 작업장<\/h1>/.test(index),
  },
  {
    label: "home keeps concrete products, tools, logs, newsletter, and insights",
    ok:
      /제품·오픈소스 도구/.test(index) &&
      /작업일지·뉴스레터·인사이트/.test(index),
  },
  {
    label: "home exposes numbered step sections",
    ok: /STEP 01/.test(index) && /STEP 02/.test(index) && /STEP 03/.test(index),
  },
  {
    label: "layout uses local sticky nav/footer instead of remote shared header",
    ok:
      /import Nav from '\.\.\/components\/Nav\.astro';/.test(layout) &&
      /import Footer from '\.\.\/components\/Footer\.astro';/.test(layout) &&
      !/mb-components\.js/.test(layout),
  },
  {
    label: "work site has no local shared-header mirror",
    ok: !hasLocalHeaderMirror,
  },
  {
    label: "design tokens are monochrome with CTA-only color",
    ok:
      /--bg:\s*#ffffff;/.test(tokens) &&
      /--accent-cta:\s*#2563eb;/.test(tokens) &&
      !/--bg:\s*#0a0a0a;/.test(tokens),
  },
  {
    label: "nav preserves key work-site routes",
    ok:
      /href: '\/products\/'/.test(nav) &&
      /href: '\/worklog'/.test(nav) &&
      /href: '\/newsletter'/.test(nav) &&
      /href: '\/system'/.test(nav),
  },
  {
    label: "nav uses one unified header row for work, company, founder, and lab links",
    ok:
      !/class="nav-sub"/.test(nav) &&
      /const links = \[/.test(nav) &&
      /href: '\/', label: '작업장'/.test(nav) &&
      /href: 'https:\/\/kangdaejong\.com', label: '회사소개'/.test(nav) &&
      /href: 'https:\/\/founder\.kangdaejong\.com', label: '대표소개'/.test(nav) &&
      /href: '\/lab', label: 'lab'/.test(nav),
  },
  {
    label: "footer keeps public business contact information",
    ok:
      /minusbetastudio@gmail\.com/.test(footer) &&
      /사업자등록번호/.test(footer),
  },
];

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error("Workshop home verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure.label}`);
  }
  process.exit(1);
}

console.log("Workshop home verification passed");
