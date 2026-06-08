// scripts/migrate-content.mjs
// 기존 마크다운(worklog-source / newsletter / insights) → Astro 콘텐츠 컬렉션 변환.
// 멱등(idempotent): 실행 시 src/content/<col> 을 비우고 재생성.
// 소스 원본은 건드리지 않음(읽기만).
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';

const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const h1of = (body) => body.match(/^#\s+(.+)$/m)?.[1]?.trim();
const stripH1 = (body) => body.replace(/^#\s+.+$\n?/m, '').trimStart();

async function reset(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

// ---- worklog: 파일명 YYYY-MM-DD_vX.Y.Z.md, frontmatter 없음, 첫 H1 = 제목 ----
async function worklog() {
  const src = 'worklog-source', dst = 'src/content/worklog';
  await reset(dst);
  let n = 0, skip = 0;
  for (const f of (await readdir(src)).filter((f) => f.endsWith('.md'))) {
    const m = f.match(/^(\d{4})-(\d{2})-(\d{2})_v([\d.]+)\.md$/);
    if (!m) { console.warn('  worklog skip (no date/ver):', f); skip++; continue; }
    const [, y, mo, d, ver] = m;
    const body = await readFile(`${src}/${f}`, 'utf8');
    const title = h1of(body) ?? `${y}.${mo}.${d} 작업일지 v${ver}`;
    const fm = `---\ntitle: ${q(title)}\ndate: ${q(`${y}-${mo}-${d}`)}\nversion: ${q(ver)}\n---\n\n`;
    // 같은 날 복수 버전 충돌 방지 → slug 에 버전 포함
    await writeFile(`${dst}/${y}-${mo}-${d}_v${ver}.md`, fm + stripH1(body));
    n++;
  }
  console.log(`worklog: ${n} written, ${skip} skipped`);
  return n;
}

// ---- newsletter: 발행본 epN-YYYY-MM-DD.md 만. 드래프트/캐시/아웃라인/substack/wsl 제외 ----
async function newsletter() {
  const src = 'newsletter', dst = 'src/content/newsletter';
  await reset(dst);
  const files = (await readdir(src)).filter((f) => /^ep\d+-\d{4}-\d{2}-\d{2}\.md$/.test(f));
  // ep 번호별 dedup, 최신 날짜 채택
  const byEp = new Map();
  for (const f of files) {
    const ep = +f.match(/^ep(\d+)-/)[1];
    const date = f.match(/-(\d{4}-\d{2}-\d{2})\.md$/)[1];
    const cur = byEp.get(ep);
    if (!cur || date > cur.date) {
      if (cur) console.warn(`  newsletter dup ep${ep}: drop ${cur.f}, keep ${f}`);
      byEp.set(ep, { f, date, ep });
    } else {
      console.warn(`  newsletter dup ep${ep}: drop ${f}, keep ${cur.f}`);
    }
  }
  let n = 0;
  const eps = [...byEp.values()].sort((a, b) => a.ep - b.ep);
  for (const { f, date, ep } of eps) {
    const body = await readFile(`${src}/${f}`, 'utf8');
    const title = h1of(body) ?? `바이브코딩 뉴스레터 Ep.${ep}`;
    const fm = `---\ntitle: ${q(title)}\ndate: ${q(date)}\nversion: ${q('ep' + ep)}\n---\n\n`;
    await writeFile(`${dst}/ep${ep}.md`, fm + stripH1(body));
    n++;
  }
  // 발행본 누락 ep 보고 (gap)
  const present = new Set(eps.map((e) => e.ep));
  const maxEp = Math.max(...present);
  const gaps = [];
  for (let i = 1; i <= maxEp; i++) if (!present.has(i)) gaps.push(i);
  if (gaps.length) console.warn(`  newsletter gaps (발행본 형식 파일 없음): ep ${gaps.join(', ')}`);
  console.log(`newsletter: ${n} written (ep ${Math.min(...present)}~${maxEp}, gaps: ${gaps.join(',') || 'none'})`);
  return n;
}

// ---- insights: 이미 YAML frontmatter 보유(source_*) → title/date 리맵, 출처필드 보존(따옴표화) ----
const fmGet = (raw, k) =>
  raw?.match(new RegExp('^' + k + ':\\s*(.+)$', 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');

async function insights() {
  const src = 'insights', dst = 'src/content/insights';
  await reset(dst);
  let n = 0;
  for (const f of (await readdir(src)).filter((f) => f.endsWith('.md'))) {
    const text = await readFile(`${src}/${f}`, 'utf8');
    const fmm = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    const raw = fmm ? fmm[1] : null;
    const body = fmm ? fmm[2] : text;
    const title = fmGet(raw, 'source_title') || h1of(body) || f.replace(/\.md$/, '');
    const fileDate = f.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
    const date = fmGet(raw, 'source_published') || fmGet(raw, 'consumed_at') || fileDate || '2026-01-01';
    const url = fmGet(raw, 'source_url');
    const author = fmGet(raw, 'source_author');
    // 깨끗한(따옴표화) frontmatter 재생성 — 원본 frontmatter 의 비표준 YAML(콜론·따옴표) 회피
    let fm = `---\ntitle: ${q(title)}\ndate: ${q(date)}\n`;
    if (url) fm += `source_url: ${q(url)}\n`;
    if (author) fm += `source_author: ${q(author)}\n`;
    fm += `---\n\n`;
    await writeFile(`${dst}/${f}`, fm + body.trimStart());
    n++;
  }
  console.log(`insights: ${n} written`);
  return n;
}

const w = await worklog();
const nl = await newsletter();
const ins = await insights();
console.log(`\nTOTAL: worklog ${w} + newsletter ${nl} + insights ${ins} = ${w + nl + ins}`);
