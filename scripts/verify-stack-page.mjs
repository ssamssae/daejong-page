import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source = readFileSync('src/pages/stack.html.astro', 'utf8');
assert(source.includes('<SystemGuide'));
for (const name of ['헤르메스', '아테나', '볼칸', 'Grok', 'Codex', 'Claude', 'Cursor']) assert(source.includes(name));
assert(source.includes('Codex 총괄') && source.includes('Cursor 승인 작업'));
assert(source.includes('신규 배차 중지') && source.includes('역할 설정'));
assert(!source.includes('24/7') && !source.includes('Grok 캐리어') && !source.includes('아테나가 판단'));
console.log('Stack current roles and four bridges verification passed');
