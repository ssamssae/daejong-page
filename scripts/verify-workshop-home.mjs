import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const index = read("src/pages/index.astro");
const layout = read("src/layouts/Layout.astro");
const components = read("public/mb-components.js");

const checks = [
  {
    label: "home H1 is 작업장",
    ok: /<h1>작업장<\/h1>/.test(index),
  },
  {
    label: "home tagline describes the hub and removes inline company-home arrow",
    ok:
      /마이너스베타스튜디오의 제품·기록·자동화 허브/.test(index) &&
      !/회사 홈 ↗/.test(index),
  },
  {
    label: "home intro names products, tools, worklog, newsletter, and insights",
    ok:
      /모바일 앱과 웹 서비스, 오픈소스 도구/.test(index) &&
      /작업일지·뉴스레터·인사이트/.test(index),
  },
  {
    label: "layout makes root active as workshop and keeps worklog separate",
    ok:
      /if \(p === '\/'\) return 'workshop';/.test(layout) &&
      /if \(p\.startsWith\('\/worklog'\)\) return 'worklog';/.test(layout),
  },
  {
    label: "common header exposes 작업장 at root and 작업일지 at /worklog",
    ok:
      /key:\s*'workshop',\s*label:\s*'작업장',\s*href:\s*'https:\/\/work\.kangdaejong\.com\/'/.test(components) &&
      /key:\s*'worklog',\s*label:\s*'작업일지',\s*href:\s*'https:\/\/work\.kangdaejong\.com\/worklog'/.test(components),
  },
  {
    label: "footer root link is 작업장, not 작업일지",
    ok:
      /<a href="https:\/\/work\.kangdaejong\.com\/">작업장<\/a>/.test(components) &&
      !/<a href="https:\/\/work\.kangdaejong\.com\/">작업일지<\/a>/.test(components),
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
