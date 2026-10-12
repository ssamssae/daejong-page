// T-261010-061: every article page must point og:image/twitter:image at its own
// 1200x630 PNG under /og/, and non-article pages must keep the shared image.
import fs from 'node:fs';
import path from 'node:path';
import { OG_IMAGE_VERSION } from '../src/lib/og-image.mjs';

const SITE = 'https://work.kangdaejong.com';
const SHARED = 'https://kangdaejong.com/brand/current/social.png?v=dd2ebedbd4f1cbea';
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
// 예외 = 카드가 없는 이동(meta refresh)·검색 제외(noindex) 페이지. twitter:image 는 있으면 og:image 와 같아야 한다.
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
let exemptPages = 0;
for (const file of htmlFiles(dist)) {
  if (articleFiles.has(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const og = metaAny(html, 'og:image');
  // 카드가 아예 없는 이동·검색 제외 페이지만 예외다. 카드가 있으면 검색 제외 페이지라도 공용 카드여야 한다(옛 주소 차단).
  if (og.length === 0 && (/http-equiv="refresh"/i.test(html) || /name="robots"\s+content="[^"]*noindex/i.test(html))) {
    exemptPages += 1;
    continue;
  }
  const rel = path.relative(dist, file);
  if (og.length !== 1 || og[0] !== SHARED) errors.push(`${rel}: og:image=${og.join(',') || '(없음)'}`);
  const tw = metaAny(html, 'twitter:image');
  if (tw.length > 1 || (tw.length === 1 && tw[0] !== SHARED)) errors.push(`${rel}: twitter:image=${tw.join(',')}`);
  sharedPages += 1;
}
console.log(`other pages: ${sharedPages} use the shared card, ${exemptPages} exempt (redirect/noindex)`);

if (errors.length) {
  console.error(errors.slice(0, 20).join('\n'));
  console.error(`og image verification failed: ${errors.length} problems`);
  process.exit(1);
}
console.log('og image verification passed');
