import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// T-261013-009: 스택 페이지의 노드 구성·기준일은 src/data/fleet-topology.ts 한 곳에서 읽는다.
const page = readFileSync('src/pages/stack.html.astro', 'utf8');
const model = readFileSync('src/components/OperatingModel.astro', 'utf8');
const topology = readFileSync('src/components/FleetTopology.astro', 'utf8');
const data = readFileSync('src/data/fleet-topology.ts', 'utf8');
const source = page + model + topology + data;
assert(page.includes('<FleetTopology />') && page.includes('<OperatingModel />'));
assert(readFileSync('src/pages/system.astro', 'utf8').includes('<OperatingModel />'));
assert(source.includes('<SystemGuide'));
for (const name of ['아테나', '볼칸', '제우스', '아폴론', 'Grok', 'Codex', 'Claude', 'Cursor', 'Local', 'Tailscale', 'GitHub']) {
  assert(source.includes(name), `missing: ${name}`);
}
// 날짜·노드 수는 데이터 한 곳에만 적는다.
assert(/asOf: '\d{4}-\d{2}-\d{2}'/.test(data) && /policyDate: '\d{4}-\d{2}-\d{2}'/.test(data));
assert(page.includes('date={fleet.asOf}') && model.includes('fleet.asOf') && topology.includes('fleet.asOf'));
assert(!/\d{4}-\d{2}-\d{2}/.test(page + model + topology), 'date literal outside src/data/fleet-topology.ts');
// 퇴역·낡은 서술이 현재 칸에 돌아오지 않게 한다.
for (const stale of ['헤르메스', '세 물리 노드', '3 nodes', 'Cursor 우선', 'Codex 총괄', '신규 배차 중지', '24/7', 'Grok 캐리어', '아테나가 판단']) {
  assert(!source.includes(stale), `stale: ${stale}`);
}
// 공개 페이지: 기기 주소·사설망 이름·접속 별칭·봇 아이디·계정을 넣지 않는다.
const sensitive = [/ts\.net/i, /\btail[0-9a-f]{6}\b/i, /desktop-[0-9a-z]{6,}/i, /macbookpro/i, /_bot\b/i,
  /[\w.+-]+@[\w-]+\.[\w.]+/, /\b(athena|vulcan|zeus|apollo|raiden|themis|hermes)\b/i, /\b100\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/];
for (const pattern of sensitive) assert(!pattern.test(source), `sensitive: ${pattern}`);

// 빌드 결과가 있으면 실제 페이지에서 노드 수·그림 수·낡은 문구를 확인한다.
const built = 'dist/stack.html/index.html';
if (existsSync(built)) {
  const html = readFileSync(built, 'utf8');
  // 공용 머리말·꼬리말은 다른 검사 몫이다 — 이 페이지 본문(article)만 본다.
  const body = html.slice(html.indexOf('<article class="guide-page"'), html.lastIndexOf('</article>'));
  assert(body.length > 0, 'built article not found');
  const nodeCount = (data.match(/\{ name: '/g) || []).length;
  const words = ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  assert(body.includes(`${words[nodeCount]} 물리 노드`) && body.includes(`${nodeCount} nodes.`), 'built node count');
  assert.equal((body.match(/<svg class="topo-svg"/g) || []).length, 4, 'built topology figures');
  const stalePhrases = ['헤르메스'];
  if (nodeCount !== 3) stalePhrases.push('세 물리 노드', '3 nodes');
  for (const stale of stalePhrases) assert(!body.includes(stale), `built stale: ${stale}`);
  for (const pattern of sensitive) assert(!pattern.test(body), `built sensitive: ${pattern}`);
}
console.log('Stack page fleet topology, current roles and five bridges verification passed');
