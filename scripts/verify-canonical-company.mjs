#!/usr/bin/env node
// 드리프트 가드 (T-260720-030) — daejong-page 회사정보 정본(src/data/site.ts 의 company)이
// 크로스레포 canonical(kangdaejong.com/mb-components.js)의 vendored 스냅샷과 일치하는지 검사.
// 불일치 = exit 1 → auto-merge fail-closed (kangdaejong-com #30 / founder #11 가드와 대칭).
// 본진 결정 (b): CI 라이브 fetch 금지 — repo 내 vendored 스냅샷만 대조(네트워크/보안 표면 0).
// 정본 갱신은 `npm run sync:canonical`(수동) → 이후 site.ts 를 맞춰야 GREEN.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendored = JSON.parse(
  readFileSync(join(root, 'src/data/_vendored/mb-header-canonical.json'), 'utf8'),
);
const siteSrc = readFileSync(join(root, 'src/data/site.ts'), 'utf8');

// site.ts 의 `export const company = { ... };` 블록만 추출 후 필드 대조(다른 곳의 동명 키 오탐 방지).
const blockMatch = siteSrc.match(/export const company\s*=\s*\{([\s\S]*?)\};/);
if (!blockMatch) {
  console.error('❌ src/data/site.ts 에서 `export const company = { ... }` 를 찾지 못했습니다.');
  process.exit(1);
}
const block = blockMatch[1];

const fails = [];
for (const [key, expected] of Object.entries(vendored.company)) {
  const m = block.match(new RegExp(`\\b${key}\\s*:\\s*"([^"]*)"`));
  if (!m) {
    fails.push(`company.${key}: site.ts 에 필드 없음`);
  } else if (m[1] !== expected) {
    fails.push(`company.${key}: 드리프트 — site.ts="${m[1]}" vs vendored="${expected}"`);
  }
}

if (fails.length) {
  console.error('❌ canonical company drift (src/data/site.ts vs vendored 스냅샷):');
  for (const f of fails) console.error('  - ' + f);
  console.error('\nsrc/data/site.ts 회사정보가 크로스레포 정본과 어긋났습니다.');
  console.error('정본(kangdaejong.com/mb-components.js)이 바뀐 경우: `npm run sync:canonical` 로 vendored 갱신 후 site.ts 를 맞추세요.');
  process.exit(1);
}
console.log(
  `✅ canonical company verification passed (site.ts === vendored 스냅샷, ${Object.keys(vendored.company).length}개 필드)`,
);
