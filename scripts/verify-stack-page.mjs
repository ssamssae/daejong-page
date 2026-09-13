import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync('src/pages/stack.html.astro', 'utf8');
assert(source.includes('<SystemGuide'));
for (const name of ['헤르메스', '아테나', '볼칸', 'Grok', 'Codex', 'Claude', 'Cursor', 'Local']) {
  assert(source.includes(name));
}
assert(source.includes('리드/워커') && source.includes('Cursor 우선'));
assert(source.includes('2026-09-14') && source.includes('역할 설정'));
assert(source.includes('date={"2026-09-13"}'));
assert(!source.includes('Codex 총괄'));
assert(!source.includes('신규 배차 중지'));
assert(!source.includes('24/7') && !source.includes('Grok 캐리어') && !source.includes('아테나가 판단'));
console.log('Stack current roles and five bridges verification passed');
