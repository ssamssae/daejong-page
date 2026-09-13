import fs from 'node:fs';

const expectedEntries = [
  {
    file: '2026-09-14-launchd-config-live-env-three-way-check.md',
    date: '2026-09-14',
    slug: 'launchd-config-live-env-three-way-check',
    title: '설정 파일을 고쳤다고 서비스가 바뀐 건 아니다 — plist·실행 환경·시작 시각을 함께 본다',
    phrases: ['디스크에 남은 설정', '실행 중 프로세스가 실제로 받은 설정', '프로세스 세대가 일치'],
  },
  {
    file: '2026-09-14-restart-transport-not-interactive-session.md',
    date: '2026-09-14',
    slug: 'restart-transport-not-interactive-session',
    title: '브릿지를 재시작할 때 작업 세션까지 죽이지 않는다 — 운반 프로세스와 실행 프로세스를 분리한다',
    phrases: ['운반 층', '실행 세션 PID', '브릿지만 갈고 세션은 살려라'],
  },
  {
    file: '2026-09-14-store-console-completed-public-url-404.md',
    date: '2026-09-14',
    slug: 'store-console-completed-public-url-404',
    title: '스토어 콘솔의 completed는 공개 완료가 아니다 — 트랙 상태와 사용자 URL을 따로 검증한다',
    phrases: ['프로덕션 트랙', '공개 상세 페이지', '콘솔 상태와 사용자가 받는 공개 페이지'],
  },
  {
    file: '2026-09-14-store-app-debug-install-data-loss-guard.md',
    date: '2026-09-14',
    slug: 'store-app-debug-install-data-loss-guard',
    title: '실기기 테스트 전에 설치 출처부터 본다 — debug 덮어쓰기가 사용자 데이터를 지울 수 있다',
    phrases: ['installerPackageName', 'uninstall → install', '기기에 이미 있던 사용자 데이터'],
  },
  {
    file: '2026-09-14-operational-verification-observation-hash.md',
    date: '2026-09-14',
    slug: 'operational-verification-observation-hash',
    title: '코드가 안 바뀐 작업도 검증 영수증을 남긴다 — 관측값·기대값·파일 해시의 최소 계약',
    phrases: ['observed.json', 'verification.json', '재검산 가능한 값'],
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
  if (entry.date !== expected.date) fail(`${expected.file} has wrong date`);
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

if (!page.includes('현재 운영 설명과 구분')) fail('archive must distinguish historical records from current operations');
if (!page.includes('index.entries')) fail('archive must retain the indexed collection');

if (failures.length) {
  console.error('Knowhow refresh verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Knowhow refresh verification passed');
