// verify-glossary-counts.mjs — ai-glossary hero 통계가 실제 데이터 블록과 일치하는지 검사한다 (T-260815-001).
//
// 뿌리: hero 숫자는 regen-ai-glossary.py 가 발행 시점에 term_count=len(terms) 로 파생시킨다.
// 파생 자체는 맞는데, 그 파생이 **브랜치별로** 일어난다. 2026-08-15 새벽 병렬 발행 2건이
// 같은 base(698)에서 갈라져 각자 hero 를 705 로 올렸고, 항목 블록은 양쪽이 합쳐져 712 가
// 됐는데 hero 줄은 두 브랜치 값이 문자열까지 동일해 git 이 충돌 없이 자동 병합했다 —
// 숫자만 7 뒤처진 채 라이브로 나갔다(표기 705 vs 실제 712).
//
// 즉 결함은 "카운트가 파생되지 않는다" 가 아니라 "파생 시점이 병합 전이라 병합 결과를
// 반영하지 못한다" 이다. 파생을 빌드 시점으로 옮기는 길도 있으나, 이 페이지는 데이터
// 블록이 그대로 박힌 정적 .astro 라 그 재구조화는 이번 결함 대비 과하다(발행 파이프라인
// 전체가 영향면). 그래서 **병합 이후 시점에 불일치를 잡는 검사**를 둔다 — 병합 결과물을
// 보는 검사는 브랜치 파생이 무엇을 하든 드리프트를 잡는다.

import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/pages/ai-glossary.html.astro", import.meta.url), "utf8");

const BEGIN_MARK = "<!-- BEGIN_GLOSSARY_DATA -->";
const END_MARK = "<!-- END_GLOSSARY_DATA -->";

const begin = source.indexOf(BEGIN_MARK);
const end = source.indexOf(END_MARK);
if (begin === -1 || end === -1 || end < begin) {
  console.error("Glossary counts verification failed:");
  console.error("- BEGIN_GLOSSARY_DATA / END_GLOSSARY_DATA 마커를 찾지 못했다 (계기 고장)");
  process.exit(1);
}
const dataBlock = source.slice(begin, end);

const countOf = (text, pattern) => (text.match(pattern) ?? []).length;

const heroValue = (name) => {
  const m = source.match(new RegExp(`<!--AUTO-HERO-${name}-START-->(\\d+)<!--AUTO-HERO-${name}-END-->`));
  return m ? Number(m[1]) : null;
};

const actualTerms = countOf(dataBlock, /class="term"/g);
const actualCategories = countOf(dataBlock, /<h2>/g);
const heroTerms = heroValue("TERMS");
const heroCategories = heroValue("CATEGORIES");

// 계기 생존 확인 — 데이터 블록이 비어 보이면 0==0 으로 조용히 통과할 수 있다.
if (actualTerms === 0) {
  console.error("Glossary counts verification failed:");
  console.error("- 데이터 블록에서 항목을 하나도 못 셌다 (계기 고장 — 마커·구조 변경 의심)");
  process.exit(1);
}

const checks = [
  {
    label: `hero terms(${heroTerms}) === 데이터 블록 항목 수(${actualTerms})`,
    ok: heroTerms !== null && heroTerms === actualTerms,
  },
  {
    label: `hero categories(${heroCategories}) === 데이터 블록 카테고리 수(${actualCategories})`,
    ok: heroCategories !== null && heroCategories === actualCategories,
  },
];

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error("Glossary counts verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure.label}`);
  }
  console.error("  → 병렬 발행 병합 드리프트 의심. scripts/regen-ai-glossary.py 재실행 또는 hero 숫자 교정 (T-260815-001).");
  process.exit(1);
}

console.log(`Glossary counts verification passed (terms=${actualTerms}, categories=${actualCategories})`);
