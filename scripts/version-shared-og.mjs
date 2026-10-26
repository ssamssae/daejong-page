// version-shared-og.mjs — 정적 페이지(public/*.html)의 공용 카드 주소에도 회사홈과 같은 그림 지문(?v=)을 붙인다 (T-261027-001).
// 왜: 원본 HTML 에 지문을 적으면 그림이 바뀔 때마다 고칠 복사본이 생긴다(T-261012-041 이 없앤 37줄).
//     그래서 원본에는 지문 없는 주소 하나만 두고, 빌드 결과(dist)에서만 brand-tokens.mjs 의 주소로 바꾼다.
//     Astro 페이지는 이미 그 주소를 쓴다. 이 단계 뒤 verify-og-images 가 모든 HTML 을 다시 센다.
// 사용: node scripts/version-shared-og.mjs (npm postbuild 첫 단계)
import fs from 'node:fs';
import path from 'node:path';
import { SHARED_OG_IMAGE, SHARED_OG_IMAGE_BASE } from '../src/lib/brand-tokens.mjs';

const dist = path.resolve('dist');
const fixed = `content="${SHARED_OG_IMAGE_BASE}"`;
const versioned = `content="${SHARED_OG_IMAGE}"`;
let files = 0;
let replaced = 0;
function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['og', '_astro', 'pagefind'].includes(entry.name)) yield* htmlFiles(full);
    } else if (entry.name.endsWith('.html')) yield full;
  }
}
for (const file of htmlFiles(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  const count = html.split(fixed).length - 1;
  if (!count) continue;
  fs.writeFileSync(file, html.split(fixed).join(versioned));
  files += 1;
  replaced += count;
}
console.log(`shared og version: ${replaced} tags in ${files} static pages → ${SHARED_OG_IMAGE}`);
