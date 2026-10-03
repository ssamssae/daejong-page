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
  '심플 가계부', '계산기알람', '종료한 제품과 서비스', '2026-10-03',
  '행운번호 생성기', '한장궁합 가족 리포트', 'Callta', '문의노트',
  'Local Telegram Bridge', 'local-telegram-bridge/releases/latest',
];

const missing = required.filter((text) => !html.includes(text));
if (missing.length) {
  console.error(`products verification failed: missing ${missing.join(', ')}`);
  process.exit(1);
}

if (['hanjang_gunghap_report_19900', 'com.ssamssae.hankeup', '부족한 오행까지 무료', '크몽에서 구매'].some(text => html.includes(text))) {
  console.error('products verification failed: internal product id is visible');
  process.exit(1);
}

if (!productsCss.includes('color:var(--fg-mute)')) {
  console.error('products verification failed: catalog secondary text does not use the current foreground token');
  process.exit(1);
}

if (!productsCss.includes('@media(max-width:640px)') ||
    !productsCss.includes('grid-template-columns:1fr')) {
  console.error('products verification failed: responsive single-column layout is missing');
  process.exit(1);
}

console.log('Products page verification passed');
