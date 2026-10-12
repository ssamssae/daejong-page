// T-261012-040: 빌드 결과(dist)의 모든 HTML 이 다크 모드를 갖는지 전수 검사한다.
// T-261012-024 는 Astro 레이아웃(tokens.css)만 다크로 바꾸고, 레이아웃 밖 정적 페이지(public/privacy*.html·
// dead-ends/detail.html, page-dark.css 사용) 15곳을 놓쳤다. 표본 몇 쪽을 브라우저로 보는 검사로는 이런 누락이 안 잡힌다.
// 판정(T-261013-004 부터): 색·다크의 원본은 회사홈 공용 tokens.css 하나 — 모든 HTML 이 그 파일
//   (https://kangdaejong.com/brand/current/tokens.css)을 읽고 <html data-theme="light"> 로 다크를 끄지 않아야 한다.
//   이동 껍데기(meta refresh)는 화면이 없으므로 <meta name="color-scheme" content="light dark"> 로도 통과한다.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
if (!fs.existsSync(dist)) {
  console.error('dark coverage verification failed: run npm run build first');
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
  const tokensLinked = [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag)
    .some((tag) => /rel="stylesheet"/i.test(tag) && /href="https:\/\/kangdaejong\.com\/brand\/current\/tokens\.css"/i.test(tag));
  const dark = tokensLinked && !/<html\b[^>]*\bdata-theme="light"/i.test(html);
  const redirect = /http-equiv="refresh"/i.test(html);
  const colorScheme = /<meta\s+name="color-scheme"\s+content="[^"]*dark[^"]*"/i.test(html);
  if (redirect) redirects += 1;
  if (!dark && !(redirect && colorScheme)) missing.push(path.relative(dist, file));
  pages += 1;
}
if (missing.length) {
  console.error(missing.slice(0, 30).map((m) => `no dark mode: ${m}`).join('\n'));
  console.error(`dark coverage verification failed: ${missing.length} of ${pages} pages`);
  process.exit(1);
}
console.log(`dark coverage verification passed: ${pages} pages (${redirects} redirect pages)`);
