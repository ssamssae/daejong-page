import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { tagAppStoreHref } from '../src/lib/app-store-link.mjs';
import rehypeAppStoreCampaign from '../src/lib/rehype-appstore-campaign.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OURS = 'https://apps.apple.com/kr/app/id6764308678';
const TAGGED = `${OURS}?pt=128771490&ct=workshop&mt=8`;

test('tags a bare our-app App Store URL', () => {
  assert.equal(tagAppStoreHref(OURS), TAGGED);
});

test('leaves a URL that already has pt unchanged', () => {
  const href = `${OURS}?pt=1&ct=other`;
  assert.equal(tagAppStoreHref(href), href);
});

test('leaves another developer app unchanged', () => {
  const href = 'https://apps.apple.com/kr/app/id123456';
  assert.equal(tagAppStoreHref(href), href);
});

test('leaves Play URLs, relative paths, and empty values unchanged', () => {
  const play = 'https://play.google.com/store/apps/details?id=com.daejongkang.hanjul';
  assert.equal(tagAppStoreHref(play), play);
  assert.equal(tagAppStoreHref('/products/'), '/products/');
  assert.equal(tagAppStoreHref(''), '');
});

test('appends the campaign with & when another query is already present', () => {
  assert.equal(
    tagAppStoreHref(`${OURS}?foo=1`),
    `${OURS}?foo=1&pt=128771490&ct=workshop&mt=8`,
  );
});

test('plugin tags only our app anchor', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'element', tagName: 'a', properties: { href: OURS }, children: [] },
      { type: 'element', tagName: 'a', properties: { href: 'https://apps.apple.com/kr/app/id123456' }, children: [] },
    ],
  };
  rehypeAppStoreCampaign()(tree);
  assert.equal(tree.children[0].properties.href, TAGGED);
  assert.equal(tree.children[1].properties.href, 'https://apps.apple.com/kr/app/id123456');
});

function runVerify(html) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'appstore-campaign-'));
  fs.writeFileSync(path.join(dir, 'page.html'), html);
  const result = spawnSync(process.execPath, ['scripts/verify-appstore-campaign.mjs', '--dist', dir], {
    cwd: root,
    encoding: 'utf8',
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test('verify exits 0 when the campaign markers are present', () => {
  const html = `<a href="${TAGGED.replaceAll('&', '&amp;')}">store</a>`;
  const result = runVerify(html);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('verify accepts the numeric ampersand Astro writes into markdown hrefs', () => {
  const html = `<a href="${TAGGED.replaceAll('&', '&#x26;')}">store</a>`;
  const result = runVerify(html);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('verify exits 1 when our app link has no campaign', () => {
  const result = runVerify(`<a href="${OURS}">store</a>`);
  assert.equal(result.status, 1);
});

test('verify exits 1 when there is no our-app link', () => {
  const result = runVerify('<a href="https://example.com/">x</a>');
  assert.equal(result.status, 1);
});
