// T-261012-040: 빌드 결과(dist)의 모든 HTML 이 다크 모드를 갖는지 전수 검사한다.
// T-261012-024 는 Astro 레이아웃(tokens.css)만 다크로 바꾸고, 레이아웃 밖 정적 페이지(public/privacy*.html·
// dead-ends/detail.html, page-dark.css 사용) 15곳을 놓쳤다. 표본 몇 쪽을 브라우저로 보는 검사로는 이런 누락이 안 잡힌다.
// 판정: 인라인 <style> 또는 연결된 같은 사이트 CSS 안에 prefers-color-scheme: dark 규칙이 있어야 한다.
//   이동 껍데기(meta refresh)는 화면이 없으므로 <meta name="color-scheme" content="light dark"> 로도 통과한다.
//   다른 사이트의 CSS(https://…)는 읽지 않는다 — 그 사이트의 다크는 그 저장소가 검사한다.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
if (!fs.existsSync(dist)) {
  console.error('dark coverage verification failed: run npm run build first');
  process.exit(1);
}
const DARK = /prefers-color-scheme\s*:\s*dark/;
const cssCache = new Map();
function localCss(href) {
  const clean = href.split(/[?#]/)[0];
  if (/^[a-z]+:/i.test(clean) || clean.startsWith('//')) return '';
  const file = path.join(dist, clean.replace(/^\/+/, ''));
  if (!cssCache.has(file)) cssCache.set(file, fs.existsSync(file) && fs.statSync(file).isFile() ? fs.readFileSync(file, 'utf8') : '');
  return cssCache.get(file);
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
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  const links = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /rel="stylesheet"/i.test(tag))
    .map((tag) => (tag.match(/href="([^"]+)"/) || [])[1])
    .filter(Boolean);
  const dark = DARK.test(inline) || links.some((href) => DARK.test(localCss(href)));
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
