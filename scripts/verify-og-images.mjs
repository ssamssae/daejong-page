// T-261010-061: every article page must point og:image/twitter:image at its own
// 1200x630 PNG under /og/, and non-article pages must keep the shared image.
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://work.kangdaejong.com';
const SHARED = 'https://kangdaejong.com/brand/current/social.png?v=59a349c1f82627cd';
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
    const html = fs.readFileSync(path.join(dist, collection, id, 'index.html'), 'utf8');
    const expected = `${SITE}/og/${collection}/${id}.png`;
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

if (errors.length) {
  console.error(errors.slice(0, 20).join('\n'));
  console.error(`og image verification failed: ${errors.length} problems`);
  process.exit(1);
}
console.log('og image verification passed');
