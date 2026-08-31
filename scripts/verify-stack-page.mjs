import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/pages/stack.html.astro", import.meta.url), "utf8");

const checks = [
  {
    label: "uses the renewed stack page shell",
    ok: /class="stack-page"/.test(source) && /class="stack-hero"/.test(source),
  },
  {
    label: "has the system map visual",
    ok: /class="system-map"/.test(source) && /aria-label="3노드 작업장 시스템 맵"/.test(source),
  },
  {
    label: "surfaces the operating layers",
    ok: /const layers = \[/.test(source) && /Control plane/.test(source) && /Execution layer/.test(source),
  },
  {
    label: "keeps the three AI nodes plus mobile entry",
    ok:
      /const nodes = \[/.test(source) &&
      /name: '아테나'/.test(source) &&
      /name: '헤르메스'/.test(source) &&
      /name: '볼칸'/.test(source) &&
      /name: 'iPhone'/.test(source) &&
      !/name: '라이덴'/.test(source) &&
      !/name: '테미스'/.test(source),
  },
  {
    label: "does not present resigned nodes as employed",
    ok: !/map-node raiden/.test(source) && !/map-node desktop/.test(source) && /퇴사/.test(source),
  },
  {
    label: "drops the old lab-page skin",
    ok: !/lab-page/.test(source) && !/lab-hero/.test(source) && !/node-grid/.test(source),
  },
];

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error("Stack page verification failed:");
  for (const failure of failures) console.error(`- ${failure.label}`);
  process.exit(1);
}

console.log("Stack page verification passed");
