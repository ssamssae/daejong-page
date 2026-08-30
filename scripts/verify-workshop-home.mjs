import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const index = read("src/pages/index.astro");
const layout = read("src/layouts/Layout.astro");
const tokens = read("src/styles/tokens.css");
const footer = read("src/components/Footer.astro");
const site = read("src/data/site.ts");
const products = read("src/data/products.ts");
const hasLocalHeaderMirror = existsSync(new URL("../public/mb-components.js", import.meta.url));

const checks = [
  {
    label: "home carries the workshop-index tone marker",
    ok: /data-tone="workshop-index"/.test(index),
  },
  {
    label: "home first viewport names Kang Daejong work hub",
    ok: /<h1 id="home-title">강대종의 작업장<\/h1>/.test(index),
  },
  {
    label: "home keeps concrete products, tools, logs, newsletter, and insights",
    ok:
      /제품·오픈소스 도구/.test(index) &&
      /작업일지·뉴스레터·인사이트/.test(index),
  },
  {
    label: "home exposes numbered workshop routes",
    ok:
      /label: '01'/.test(index) &&
      /label: '07'/.test(index) &&
      /href: '\/products\/'/.test(index) &&
      /href: '\/worklog\/'/.test(index),
  },
  {
    label: "open tools include the public Grok Telegram Bridge",
    ok:
      /name: 'Grok Telegram Bridge'/.test(products) &&
      /github\.com\/ssamssae\/grok-telegram-bridge/.test(products),
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
    label: "design tokens match company navy+copper (kangdaejong.com)",
    ok:
      /--bg:\s*#10161f;/.test(tokens) &&
      /--accent:\s*#d4a574;/.test(tokens) &&
      /--cta-fg:\s*#10161f;/.test(tokens) &&
      /--radius-card:\s*12px;/.test(tokens) &&
      /--serif:/.test(tokens),
  },
  {
    label: "layout loads Noto Serif KR and pins navy theme-color",
    ok:
      /Noto\+Serif\+KR/.test(layout) &&
      /theme-color" content="#10161f"/.test(layout) &&
      /color-scheme: dark/.test(layout),
  },
  {
    label: "nav preserves key work-site routes",
    ok:
      /href: '\/products\/'/.test(site) &&
      /href: '\/worklog'/.test(site) &&
      /href: '\/newsletter'/.test(site) &&
      /href: '\/system'/.test(site),
  },
  {
    label: "footer keeps public business contact information",
    ok:
      /minusbetastudio@gmail\.com/.test(site) &&
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
