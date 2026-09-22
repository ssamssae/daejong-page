import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const page = readFileSync('src/pages/stack.html.astro', 'utf8');
const model = readFileSync('src/components/OperatingModel.astro', 'utf8');
const source = page + model;
assert(page.includes('<OperatingModel />'));
assert(readFileSync('src/pages/system.astro', 'utf8').includes('<OperatingModel />'));
assert(source.includes('<SystemGuide'));
for (const name of ['헤르메스', '아테나', '볼칸', 'Grok', 'Codex', 'Claude', 'Cursor', 'Local']) {
  assert(source.includes(name));
}
assert(source.includes('리드/워커') && source.includes('Cursor 우선'));
assert(source.includes('2026-09-21') && source.includes('역할 설정'));
assert(source.includes('date={"2026-09-23"}'));
assert(!source.includes('Codex 총괄'));
assert(!source.includes('신규 배차 중지'));
assert(!source.includes('24/7') && !source.includes('Grok 캐리어') && !source.includes('아테나가 판단'));
console.log('Stack current roles and five bridges verification passed');
