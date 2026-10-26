// T-261010-061: every article page must point og:image/twitter:image at its own
// 1200x630 PNG under /og/, and non-article pages must keep the shared image.
import fs from 'node:fs';
import path from 'node:path';
import { OG_IMAGE_VERSION, SHARED_OG_IMAGE } from '../src/lib/og-image.mjs';

const SITE = 'https://work.kangdaejong.com';
// T-261027-001: 공용 카드 주소 = 회사홈 manifest 지문이 붙은 주소 하나(brand-tokens.mjs). 원본에 지문을 복사하지 않는다
// (T-261012-041 의 「한 곳 관리」 그대로) — 정적 페이지는 version-shared-og.mjs 가 빌드 결과에서만 붙인다.
// 고정 주소(지문 없음)나 다른 지문이 남으면 아래 전수 검사가 그 페이지를 실패로 잡는다.
const SHARED = SHARED_OG_IMAGE;
const COLLECTIONS = ['worklog', 'newsletter', 'insights'];
const dist = path.resolve('dist');
const errors = [];

const metas = (html, key) =>
  [...html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"/g)]
    .filter(([, k]) => k === key)
    .map(([, , v]) => v);

function pngSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.subarray(1, 4).toString('latin1') !== 'PNG') return null;
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

if (!fs.existsSync(dist)) {
  console.error('og image verification failed: run npm run build first');
  process.exit(1);
}

const articleFiles = new Set();
for (const collection of COLLECTIONS) {
  const sources = fs.readdirSync(path.resolve('src/content', collection)).filter((f) => f.endsWith('.md'));
  const articles = fs
    .readdirSync(path.join(dist, collection), { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(dist, collection, d.name, 'index.html')))
    .map((d) => d.name);
  const ogDir = path.join(dist, 'og', collection);
  const pngs = fs.existsSync(ogDir) ? fs.readdirSync(ogDir).filter((f) => f.endsWith('.png')) : [];
  if (articles.length !== sources.length || pngs.length !== sources.length) {
    errors.push(`${collection}: ${sources.length} sources, ${articles.length} pages, ${pngs.length} PNGs`);
  }
  for (const id of articles) {
    articleFiles.add(path.join(dist, collection, id, 'index.html'));
    const html = fs.readFileSync(path.join(dist, collection, id, 'index.html'), 'utf8');
    const expected = `${SITE}/og/${collection}/${id}.png?v=${OG_IMAGE_VERSION}`; // T-261012-032
    for (const key of ['og:image', 'twitter:image']) {
      const values = metas(html, key);
      if (values.length !== 1 || values[0] !== expected) errors.push(`${collection}/${id}: ${key}=${values.join(',')}`);
    }
    const file = path.join(ogDir, `${id}.png`);
    const size = fs.existsSync(file) && pngSize(file);
    if (!size || size[0] !== 1200 || size[1] !== 630) errors.push(`${collection}/${id}: PNG ${size ? size.join('x') : 'missing'}`);
  }
  console.log(`${collection}: ${sources.length} sources, ${articles.length} pages, ${pngs.length} PNGs`);
}

const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
for (const key of ['og:image', 'twitter:image']) {
  if (metas(home, key).join(',') !== SHARED) errors.push(`home: ${key}=${metas(home, key).join(',')}`);
}

// T-261012-032: 글 페이지 밖의 모든 HTML(public/ 의 정적 개인정보 페이지 포함)도 공용 카드(SHARED)를 써야 한다.
// 종전 검사는 글 페이지와 첫 화면만 봐서, 정적 페이지 13곳이 옛 카드 주소(?v=20261003)를 쓰는 것을 놓쳤다.
// T-261012-040: 예외 없음 — 이동 껍데기(meta refresh)·검색 제외(noindex) 페이지도 공용 카드와 twitter:image 를 갖는다.
//   종전 예외(카드 없는 이동·noindex 페이지)가 카드 없는 페이지 8곳을 「원래 없음」으로 통과시켰다.
const metaAny = (html, key) =>
  [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => new RegExp(`(?:property|name)="${key}"`).test(tag))
    .map((tag) => (tag.match(/content="([^"]*)"/) || [])[1])
    .filter(Boolean);
function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['og', '_astro', 'pagefind'].includes(entry.name)) yield* htmlFiles(full);
    } else if (entry.name.endsWith('.html')) yield full;
  }
}
let sharedPages = 0;
let redirectPages = 0;
for (const file of htmlFiles(dist)) {
  if (articleFiles.has(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const og = metaAny(html, 'og:image');
  const rel = path.relative(dist, file);
  if (og.length !== 1 || og[0] !== SHARED) errors.push(`${rel}: og:image=${og.join(',') || '(없음)'}`);
  const tw = metaAny(html, 'twitter:image');
  if (tw.length !== 1 || tw[0] !== SHARED) errors.push(`${rel}: twitter:image=${tw.join(',') || '(없음)'}`);
  if (/http-equiv="refresh"/i.test(html)) redirectPages += 1;
  sharedPages += 1;
}
console.log(`other pages: ${sharedPages} use the shared card (incl. ${redirectPages} redirect pages)`);

if (errors.length) {
  console.error(errors.slice(0, 20).join('\n'));
  console.error(`og image verification failed: ${errors.length} problems`);
  process.exit(1);
}
console.log('og image verification passed');
