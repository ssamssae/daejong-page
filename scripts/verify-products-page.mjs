import fs from 'node:fs';
import path from 'node:path';

const outputPath = path.resolve('dist/products/index.html');
if (!fs.existsSync(outputPath)) {
  console.error('products verification failed: run npm run build first');
  process.exit(1);
}

const html = fs.readFileSync(outputPath, 'utf8');
const assetDir = path.resolve('dist/_astro');
const productsCss = fs.readdirSync(assetDir)
  .filter((name) => name.startsWith('products.') && name.endsWith('.css'))
  .map((name) => fs.readFileSync(path.join(assetDir, name), 'utf8'))
  .join('\n');
const required = [
  '심플 가계부',
  '행운번호 생성기',
  '부족한 오행까지 무료',
  '이름 후보·한자 뜻풀이·점수표·PDF는 결제 후',
  '한장궁합 가족 리포트',
  'Local Telegram Bridge',
  'local-telegram-bridge/releases/tag/v0.2.0',
  'grok-telegram-bridge/releases/tag/v0.5.3',
  'codex-telegram-bridge/releases/tag/v0.9.9',
  'claude-telegram-bridge/releases/tag/v0.14.2',
  'cursor-telegram-bridge/releases/tag/v0.4.2',
];

const missing = required.filter((text) => !html.includes(text));
if (missing.length) {
  console.error(`products verification failed: missing ${missing.join(', ')}`);
  process.exit(1);
}

if (html.includes('hanjang_gunghap_report_19900')) {
  console.error('products verification failed: internal product id is visible');
  process.exit(1);
}

if (!productsCss.includes('color:var(--invert-fg)')) {
  console.error('products verification failed: featured body does not use invert-fg');
  process.exit(1);
}

if (!productsCss.includes('@media(max-width:900px)') ||
    !productsCss.includes('grid-template-columns:1fr')) {
  console.error('products verification failed: responsive single-column layout is missing');
  process.exit(1);
}

console.log('Products page verification passed');
