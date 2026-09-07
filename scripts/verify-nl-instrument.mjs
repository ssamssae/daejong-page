import fs from 'node:fs';
import path from 'node:path';
import { validateNlCollectorOrigin } from '../src/lib/nl-collector.mjs';

const collector = validateNlCollectorOrigin(process.env.PUBLIC_NL_EVENTS_ORIGIN, {
  requireWorkersDev: true,
});
if (!collector.ok) {
  console.error(`nl instrument verification failed: collector origin ${collector.reason}`);
  process.exit(1);
}

const dist = path.resolve('dist');
if (!fs.existsSync(dist)) {
  console.error('nl instrument verification failed: run npm run build first');
  process.exit(1);
}

const ep7 = path.join(dist, 'newsletter', 'ep7', 'index.html');
const hop = path.join(dist, 'nl-go', 'hanjul-ios', 'index.html');
const products = path.join(dist, 'products', 'index.html');
const rejected = path.join(dist, 'nl-go', 'not-a-product', 'index.html');

for (const file of [ep7, hop, products]) {
  if (!fs.existsSync(file)) {
    console.error(`nl instrument verification failed: missing ${file}`);
    process.exit(1);
  }
}

if (fs.existsSync(rejected)) {
  console.error('nl instrument verification failed: unknown hop was published (open redirect risk)');
  process.exit(1);
}

const ep7Html = fs.readFileSync(ep7, 'utf8');
if (!ep7Html.includes('https://apps.apple.com/kr/app/id6764308678')) {
  console.error('nl instrument verification failed: ep7 lost the original App Store URL');
  process.exit(1);
}
if (!ep7Html.includes('/nl-go/')) {
  console.error('nl instrument verification failed: newsletter hop script missing');
  process.exit(1);
}

const hopHtml = fs.readFileSync(hop, 'utf8');
if (!hopHtml.includes('https://apps.apple.com/kr/app/id6764308678')) {
  console.error('nl instrument verification failed: hanjul hop dest is not the App Store URL');
  process.exit(1);
}
if (!hopHtml.includes('data-nl-visit="na"')) {
  console.error('nl instrument verification failed: external hop should mark visit=NA');
  process.exit(1);
}

const productsHtml = fs.readFileSync(products, 'utf8');
if (!productsHtml.includes('https://apps.apple.com/kr/app/id6764308678')) {
  console.error('nl instrument verification failed: products page store URL changed');
  process.exit(1);
}
if (productsHtml.includes('/nl-go/hanjul-ios/')) {
  console.error('nl instrument verification failed: products page CTAs were wrapped');
  process.exit(1);
}

const ownedHop = path.join(dist, 'nl-go', 'products', 'index.html');
if (!fs.existsSync(ownedHop)) {
  console.error('nl instrument verification failed: missing owned /products hop');
  process.exit(1);
}
const ownedHtml = fs.readFileSync(ownedHop, 'utf8');
if (ownedHtml.includes('data-nl-visit="na"')) {
  console.error('nl instrument verification failed: owned products hop should be visitable');
  process.exit(1);
}
if (!hopHtml.includes(collector.origin) || !ownedHtml.includes(collector.origin)) {
  console.error('nl instrument verification failed: configured collector origin was not embedded');
  process.exit(1);
}

function walkHtml(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkHtml(full, acc);
    else if (name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const guessed = 'daejong-nl-events.ssamssae.workers.dev';
for (const file of walkHtml(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes(guessed)) {
    console.error(`nl instrument verification failed: guessed collector host in ${file}`);
    process.exit(1);
  }
}

console.log('nl instrument verification passed');
