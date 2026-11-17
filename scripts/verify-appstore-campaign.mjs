import fs from 'node:fs';
import path from 'node:path';
import { CAMPAIGN, OUR_APP_IDS } from '../src/lib/app-store-link.mjs';

const OUR_IDS = new Set(OUR_APP_IDS);

function distDir(argv) {
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--dist' && argv[i + 1]) return argv[i + 1];
  }
  return 'dist';
}

function htmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const root = path.resolve(distDir(process.argv));
const hrefRe = /href="(https:\/\/apps\.apple\.com\/[^"]*)"/g;
let found = 0;
const missing = [];

for (const file of htmlFiles(root)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(hrefRe)) {
    const href = match[1]
      .replaceAll('&amp;', '&')
      .replaceAll('&#38;', '&')
      .replaceAll('&#038;', '&')
      .replace(/&#x0*26;/gi, '&');
    let url;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    const id = url.pathname.match(/\/id(\d+)/)?.[1];
    if (!id || !OUR_IDS.has(id)) continue;
    found += 1;
    const tagged = url.searchParams.get('pt') === CAMPAIGN.pt
      && url.searchParams.get('ct') === CAMPAIGN.ct
      && url.searchParams.get('mt') === CAMPAIGN.mt;
    if (!tagged) missing.push({ file, id });
  }
}

if (missing.length > 0) {
  for (const item of missing) console.error(`${item.file} id${item.id}`);
  process.exit(1);
}
if (found === 0) {
  console.error(`${root} 우리 앱 App Store 링크 0개`);
  process.exit(1);
}
console.log(`verify:appstore-campaign passed (${found} links in ${root})`);
