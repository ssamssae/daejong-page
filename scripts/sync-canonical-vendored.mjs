#!/usr/bin/env node
// 수동 sync (T-260720-030) — 크로스레포 정본(kangdaejong.com/mb-components.js <mb-footer>)의
// 회사정보를 추출해 src/data/_vendored/mb-header-canonical.json 스냅샷을 갱신한다.
//
// ⚠️ 수동 전용. CI 는 이 스크립트를 실행하지 않는다(본진 결정 (b): CI 라이브 fetch 금지).
// 소스 = 로컬 kangdaejong-com 체크아웃(기본 ../kangdaejong-com/public/mb-components.js).
//   CANONICAL_SRC 환경변수로 경로 override 가능.
// 갱신 후 src/data/site.ts 의 company 도 같은 값으로 맞춰야 드리프트 가드가 GREEN 이 된다.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath =
  process.env.CANONICAL_SRC || join(root, '..', 'kangdaejong-com', 'public', 'mb-components.js');

let mb;
try {
  mb = readFileSync(srcPath, 'utf8');
} catch {
  console.error(`❌ 정본 소스 미발견: ${srcPath}`);
  console.error('  kangdaejong-com 을 형제 디렉터리로 체크아웃하거나 CANONICAL_SRC 로 경로를 지정하세요.');
  process.exit(1);
}

const pick = (re, name) => {
  const m = mb.match(re);
  if (!m) {
    console.error(`❌ 정본에서 ${name} 추출 실패 — mb-components.js <mb-footer> 구조가 바뀌었을 수 있습니다.`);
    process.exit(1);
  }
  return m[1].trim();
};

const company = {
  name: pick(/<strong>([^<]+)<\/strong>/, 'name'),
  representative: pick(/·\s*대표\s*([^<]+)</, 'representative'),
  bizNumber: pick(/사업자등록번호\s*([^<]+)</, 'bizNumber'),
  mailOrderNumber: pick(/통신판매업신고번호\s*([^<]+)</, 'mailOrderNumber'),
  address: pick(/<span>(서울[^<]+)<\/span>/, 'address'),
  category: pick(/<span>(정보통신업[^<]+)<\/span>/, 'category'),
  email: pick(/mailto:([^"]+)"/, 'email'),
};

const outPath = join(root, 'src/data/_vendored/mb-header-canonical.json');
const existing = JSON.parse(readFileSync(outPath, 'utf8'));
existing.company = company;
writeFileSync(outPath, JSON.stringify(existing, null, 2) + '\n');

console.log('✅ vendored 스냅샷 갱신:', outPath);
console.log(JSON.stringify(company, null, 2));
console.log('\n다음: src/data/site.ts 의 company 를 위 값과 동일하게 맞추세요(드리프트 가드 GREEN).');
