import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const collections = ['automation-cases', 'decision-lessons', 'incident-lessons', 'lab-experiments', 'skill-examples'];
let count = 0;
for (const collection of collections) {
  const ids = new Set();
  for (const item of read(`src/data/${collection}.json`)) {
    assert(item.id && !ids.has(item.id), `${collection}: duplicate or empty id`);
    ids.add(item.id);
    assert(item.title && item.status && /^\d{4}-\d{2}-\d{2}$/.test(item.date));
    assert(item.rows.length >= 3 && item.rows.every(row => row.label && row.text));
    if (item.href) {
      const url = new URL(item.href, 'https://work.kangdaejong.com');
      assert.equal(url.protocol, 'https:');
      if (url.origin === 'https://work.kangdaejong.com') {
        const target = `dist${url.pathname}`;
        assert(existsSync(target) || existsSync(`${target}/index.html`), `Missing target: ${item.href}`);
        const slug = url.searchParams.get('slug');
        if (slug) {
          const category = url.pathname.split('/')[1];
          assert(read(`public/${category}/index.json`).entries.some(entry => entry.slug === slug), `Unknown source: ${item.href}`);
        }
      }
    }
    count++;
  }
}
const apology = readFileSync('dist/sorry/index.html', 'utf8');
assert(!apology.includes('추천답변') && !apology.includes('auto_detected'), 'Raw conversation surfaced');
console.log(`PASS: ${count} editorial cases, unique anchors, valid source references, curated apology output`);
