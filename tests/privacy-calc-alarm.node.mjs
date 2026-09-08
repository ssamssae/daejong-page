import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'public', 'privacy-calc-alarm.html');
const source = fs.readFileSync(sourcePath, 'utf8');

const must = [
  '계산기알람 개인정보 처리방침',
  '출시 초안',
  'com.daejongkang.ireonayo',
  'motjayo.alarms.v1',
  'minusbetastudio@gmail.com',
  'google_mobile_ads',
  'in_app_purchase',
  '샘플',
  '자체 서버',
  '삭제 수명은 이번 검토에서 검증하지 않았',
];
const forbidden = [
  '개인정보를 수집하지 않습니다',
  '법령을 준수',
  '즉시 제거됩니다',
  '운영 광고',
  'force-stop 뒤에도',
  '항상 울림',
];

const missing = must.filter((item) => !source.includes(item));
const leaked = forbidden.filter((item) => source.includes(item));
if (missing.length || leaked.length) {
  console.error(JSON.stringify({ missing, leaked }, null, 2));
  process.exit(1);
}
if (!source.includes('privacy-calc-alarm.html')) {
  console.error('canonical url missing');
  process.exit(1);
}
console.log('privacy-calc-alarm node checks: PASS');
