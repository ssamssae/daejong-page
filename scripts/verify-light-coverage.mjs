// T-261024-058: 빌드 결과(dist)의 모든 HTML 이 라이트로 고정돼 있는지 전수 검사한다.
// 2026-10-24 대종님 결정 「다크를 풀고 전부 라이트」 — 공개 사이트 4면(회사홈·작업장·대표소개·단백질)은 기기 설정과 무관하게 흰 바탕이다.
// 이력: T-261012-040 의 verify-dark-coverage(모든 HTML 이 다크를 갖는지)를 반대 방향으로 바꿨다. 그때 배운 것은 그대로다 —
//   Astro 레이아웃만 보면 레이아웃 밖 정적 페이지(public/privacy*.html·dead-ends/detail.html) 15곳을 놓친다. 그래서 dist 를 전수로 본다.
// 판정: 모든 HTML 이 공용 톤 파일(https://kangdaejong.com/brand/current/tokens.css)을 읽고 <html data-theme="light"> 를 선언해야 통과한다.
//   이동 껍데기(meta refresh)는 화면이 없으므로 <meta name="color-scheme" content="light"> 로도 통과한다.
//   어느 쪽이든 data-theme="auto|dark"·content="light dark" 가 남아 있으면 실패다.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
if (!fs.existsSync(dist)) {
  console.error('light coverage verification failed: run npm run build first');
  process.exit(1);
}
function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['og', '_astro', 'pagefind'].includes(entry.name)) yield* htmlFiles(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) yield full;
  }
}
const missing = [];
let pages = 0;
let redirects = 0;
for (const file of htmlFiles(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  const tokensLinked = [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag)
    .some((tag) => /rel="stylesheet"/i.test(tag) && /href="https:\/\/kangdaejong\.com\/brand\/current\/tokens\.css"/i.test(tag));
  const lightHtml = /<html\b[^>]*\bdata-theme="light"/i.test(html);
  const redirect = /http-equiv="refresh"/i.test(html);
  const lightMeta = /<meta\s+name="color-scheme"\s+content="light"\s*\/?>/i.test(html);
  const darkLeft = /<html\b[^>]*\bdata-theme="(auto|dark)"/i.test(html) || /<meta\s+name="color-scheme"\s+content="[^"]*\bdark\b[^"]*"/i.test(html);
  if (redirect) redirects += 1;
  pages += 1;
  if (darkLeft) missing.push(`dark left: ${rel}`);
  else if (redirect ? !lightMeta : !(tokensLinked && lightHtml)) missing.push(`not light: ${rel}`);
}
if (missing.length) {
  console.error(missing.slice(0, 30).join('\n'));
  console.error(`light coverage verification failed: ${missing.length} of ${pages} pages`);
  process.exit(1);
}
console.log(`light coverage verification passed: ${pages} pages (${redirects} redirect pages)`);
