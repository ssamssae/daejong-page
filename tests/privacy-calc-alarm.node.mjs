import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'public', 'privacy-calc-alarm.html');
const source = fs.readFileSync(sourcePath, 'utf8');

const must = [
  '계산기알람 개인정보 처리방침',
  '시행일: 2026년 9월 8일',
  'minusbetastudio@gmail.com',
  'ML Kit',
  'HTTPS',
  '카메라',
  '알림',
  'Google 백업',
  '원본은 이 앱이 지우지 않습니다',
];
const leakedDevMeta = [
  'T-260908',
  '1425c8e',
  '612e83e',
  'SharedPreferences',
  'motjayo.alarms',
  'AAB',
  'PIN',
  '자리표시',
  '출시 초안',
  '총괄',
  'google_mobile_ads',
  'in_app_purchase',
  'AdsService',
  'BillingService',
  '문서 상태',
  '작업 ID',
  '커밋',
];
const leakedFalseClaims = [
  '개인정보를 수집하지 않습니다',
  '법령을 준수',
  '즉시 제거됩니다',
  '항상 울림',
  'force-stop 뒤에도',
];

const missing = must.filter((item) => !source.includes(item));
const leaked = [...leakedDevMeta, ...leakedFalseClaims].filter((item) => source.includes(item));

const hrefs = [...source.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const allowedHref = (href) =>
  href.startsWith('mailto:') ||
  href.startsWith('https://') ||
  href.startsWith('/') ||
  href.startsWith('#');
const badHrefs = hrefs.filter((href) => !allowedHref(href));
if (!hrefs.includes('mailto:minusbetastudio@gmail.com')) {
  badHrefs.push('missing mailto contact');
}
if (!hrefs.includes('https://developers.google.com/ml-kit/android-data-disclosure')) {
  badHrefs.push('missing ML Kit disclosure link');
}
if (!source.includes('https://work.kangdaejong.com/privacy-calc-alarm.html')) {
  badHrefs.push('missing canonical privacy URL');
}

const dist = path.join(root, 'dist', 'privacy-calc-alarm.html');
let distMissing = false;
if (fs.existsSync(dist)) {
  const built = fs.readFileSync(dist, 'utf8');
  if (!built.includes('계산기알람 개인정보 처리방침') || built.includes('출시 초안') || built.includes('T-260908')) {
    distMissing = true;
  }
}

if (missing.length || leaked.length || badHrefs.length || distMissing) {
  console.error(JSON.stringify({ missing, leaked, badHrefs, distPublicLanguageOk: !distMissing }, null, 2));
  process.exit(1);
}
console.log('privacy-calc-alarm public language checks: PASS');
