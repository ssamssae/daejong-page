import fs from 'node:fs';

const expectedEntries = [
  {
    file: '2026-07-07-durable-scheduler-for-delayed-actions.md',
    slug: 'durable-scheduler-for-delayed-actions',
    title: '"30분 뒤에 꺼줘"는 세션이 아니라 OS에 맡긴다 — 지연 실행용 durable 스케줄러',
    phrases: ['launchd', '일회성 OS 타이머', '세션은 대화의 수명이고, 예약은 그보다 오래 살아야 한다'],
  },
  {
    file: '2026-07-07-detached-head-silent-push-failure.md',
    slug: 'detached-head-silent-push-failure',
    title: 'detached HEAD에서 자동으로 커밋하면 push가 조용히 실패한다 — 커밋 전 브랜치 앵커를 단언한다',
    phrases: ['git symbolic-ref -q HEAD', 'salvage 태그', '커밋이 성공했다는 건 데이터가 안전하다는 뜻이 아니다'],
  },
  {
    file: '2026-07-07-idempotent-dispatch-claim-gate.md',
    slug: 'idempotent-dispatch-claim-gate',
    title: '같은 일을 두 곳에 시키면 두 번 한다 — 착수 전 claim 게이트로 중복 실행을 막는다',
    phrases: ['claim(클레임/lease) 게이트', '공유 지점', '중복은 착수 지점에서 막아야 한다'],
  },
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const index = JSON.parse(read('public/knowhow/index.json'));
const entries = Array.isArray(index.entries) ? index.entries : [];
const page = read('src/pages/knowhow.html.astro');

for (const expected of expectedEntries) {
  const path = `public/knowhow/${expected.file}`;
  if (!fs.existsSync(path)) {
    fail(`missing knowhow file: ${path}`);
    continue;
  }

  const body = read(path);
  if (!body.startsWith(`# ${expected.title}`)) {
    fail(`wrong h1 for ${expected.file}`);
  }
  for (const phrase of expected.phrases) {
    if (!body.includes(phrase)) {
      fail(`${expected.file} is missing phrase: ${phrase}`);
    }
  }

  const matches = entries.filter((entry) => entry.file === expected.file);
  if (matches.length !== 1) {
    fail(`index.json must contain exactly one entry for ${expected.file}`);
    continue;
  }

  const entry = matches[0];
  if (entry.date !== '2026-07-07') fail(`${expected.file} has wrong date`);
  if (entry.slug !== expected.slug) fail(`${expected.file} has wrong slug`);
  if (entry.title !== expected.title) fail(`${expected.file} has wrong title`);
  if (!entry.category) fail(`${expected.file} is missing category`);
  if (!Array.isArray(entry.tags) || entry.tags.length < 4) fail(`${expected.file} needs at least 4 tags`);
  if (!entry.summary || entry.summary.length < 80) fail(`${expected.file} needs a reusable summary`);
}

const firstExisting = entries.find((entry) => entry.file === expectedEntries[0].file);
if (entries.indexOf(firstExisting) > 2) {
  fail('new knowhow entries should be at the top of index.json');
}

if (!page.includes('2026-07-07')) {
  fail('knowhow recent-change date was not updated');
}
if (!page.includes('노하우 3편 추가')) {
  fail('knowhow recent-change count was not updated');
}
for (const keyword of ['durable 스케줄러', 'detached HEAD push 실패', '이중디스패치 claim 게이트']) {
  if (!page.includes(keyword)) {
    fail(`knowhow recent-change is missing keyword: ${keyword}`);
  }
}

if (failures.length) {
  console.error('Knowhow refresh verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Knowhow refresh verification passed');
