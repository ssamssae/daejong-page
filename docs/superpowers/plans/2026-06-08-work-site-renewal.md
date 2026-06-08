# work.kangdaejong.com Astro 허브 리뉴얼 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 정적 HTML 30+페이지로 흩어진 work.kangdaejong.com 을 Astro 기반 브랜드 허브로 마이그레이션 — 공통 Layout·디자인토큰 + 콘텐츠 컬렉션(작업일지/뉴스레터/인사이트) + 5섹션 허브 홈 + Lab.

**Architecture:** Astro SSG, 단일 Layout 상속, `:root` 디자인 토큰(루트 사이트 통일 다크+네온), Content Collections(md), GitHub Pages 자동배포 유지. privacy-*.html 스토어 URL 보존.

**Tech Stack:** Astro 6, Node 25/npm 11, GitHub Actions(Pages), 기존 마크다운(worklog-source 등).

**검증 방식:** 정적 사이트라 단위테스트 대신 (1) `npm run build` 성공 (2) 결과 dist 렌더/링크 grep (3) 라이브 curl·Playwright 스크린샷. 각 task의 "Verify" 단계가 게이트.

**브랜치:** 노드 위임 시 prefix 브랜치(예: `macmini/work-renewal-2026-06-08`) → PR → 본진/맥미니 머지. 큰 마이그레이션이라 phase별 PR 권장.

**원본 형식 메모:** `worklog-source/*.md` 는 YAML frontmatter 없음. 파일명 `YYYY-MM-DD_vX.Y.Z.md` + 첫 줄 `# YYYY.MM.DD 작업일지 vX` 에서 date/version/title 파싱해 frontmatter 주입.

---

## Phase 1 — Astro scaffold + 디자인 토큰 + Layout

### Task 1: Astro 프로젝트 초기화 (기존 정적자산 보존)

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`, `.gitignore`(node_modules 추가)
- Preserve: 기존 `*.html`, `privacy-*.html`, `CNAME`, `.nojekyll`, `worklog/`, `newsletter/` 등은 이 단계에서 건드리지 않음(점진 이전)

- [ ] **Step 1: Astro 최소 scaffold 생성**

`package.json`:
```json
{
  "name": "daejong-page",
  "type": "module",
  "scripts": { "dev": "astro dev", "build": "astro build", "preview": "astro preview" },
  "dependencies": { "astro": "^6.3.3" }
}
```

`astro.config.mjs` — 빌드 출력은 `dist/`, site 지정:
```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://work.kangdaejong.com',
  output: 'static',
});
```

`.gitignore` 에 추가: `node_modules/`, `dist/`, `.astro/`

- [ ] **Step 2: 의존성 설치 + 빌드 확인**

Run: `npm install && npm run build`
Expected: 빌드 성공(아직 페이지 0개여도 에러 없이 완료). 실패 시 astro 버전/노드 호환 확인.

- [ ] **Step 3: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .gitignore
git commit -m "chore: Astro scaffold (정적자산 보존, 점진 마이그레이션 시작)"
```

### Task 2: 디자인 토큰 + Layout 컴포넌트

**Files:**
- Create: `src/styles/tokens.css`, `src/layouts/Layout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`

- [ ] **Step 1: 디자인 토큰 (루트 사이트와 동일)**

`src/styles/tokens.css`:
```css
:root {
  --bg: #0a0c0e; --bg-elev: #14171a; --border: #262b30;
  --fg: #e8eaed; --fg-dim: #9aa0a6;
  --cyan: #00e5ff; --magenta: #ff00aa;
  --mono: 'JetBrains Mono', monospace;
  --sans: 'Pretendard', system-ui, sans-serif;
}
.accent-cyan { color: var(--cyan); }
.accent-magenta { color: var(--magenta); }
```
(정확한 hex는 루트 `~/kangdaejong-com/src/pages/index.astro` `:root` 값과 대조해 일치시킬 것.)

- [ ] **Step 2: Layout.astro (head+nav+footer 상속)**

`src/layouts/Layout.astro`:
```astro
---
import '../styles/tokens.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Pretendard:wght@400;500;700&display=swap" rel="stylesheet" />
    <title>{title}</title>
  </head>
  <body>
    <Nav />
    <main><slot /></main>
    <Footer />
    <style is:global>
      body { background: var(--bg); color: var(--fg); font-family: var(--sans); margin: 0; }
      main { max-width: 960px; margin: 0 auto; padding: 80px 24px; }
      a { color: var(--cyan); text-decoration: none; } a:hover { color: var(--magenta); }
    </style>
  </body>
</html>
```

`src/components/Nav.astro` — 글로벌 nav(홈·apps·worklog·newsletter·insights·system·lab). `src/components/Footer.astro` — 사업자정보(상호·대표·사업자번호 878-21-02478·통신판매 제2026-서울마포-1177호·주소) + Lab 링크. (값은 루트 사이트 company 객체와 일치.)

- [ ] **Step 3: Verify (빌드)**

Run: `npm run build`
Expected: 성공. Layout import 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add src/styles src/layouts src/components
git commit -m "feat(work): 디자인 토큰 + Layout/Nav/Footer (루트 톤 통일)"
```

---

## Phase 2 — 콘텐츠 컬렉션 (작업일지/뉴스레터/인사이트)

### Task 3: 콘텐츠 컬렉션 스키마 정의

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: 컬렉션 스키마**

`src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
const post = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),           // YYYY-MM-DD
    version: z.string().optional(),
    summary: z.string().optional(),
  }),
});
export const collections = { worklog: post, newsletter: post, insights: post };
```

- [ ] **Step 2: Verify** — `npm run build` 성공(컬렉션 빈 상태 허용).
- [ ] **Step 3: Commit** — `git commit -m "feat(work): 콘텐츠 컬렉션 스키마"`

### Task 4: 기존 마크다운 → 컬렉션 변환 스크립트

**Files:**
- Create: `scripts/migrate-content.mjs`
- Source: `worklog-source/*.md`(133), `newsletter/*`(72), 인사이트 소스
- Target: `src/content/worklog/*.md`, `src/content/newsletter/*.md`, `src/content/insights/*.md`

- [ ] **Step 1: 변환 스크립트 작성** — 파일명 `YYYY-MM-DD_vX.md` + 첫 H1 `# YYYY.MM.DD 작업일지 vX` 파싱 → frontmatter(title/date/version) 주입, 본문은 H1 제거 후 보존. (newsletter/insights 도 각 소스 포맷에 맞춰 date/title 추출.)

```js
// scripts/migrate-content.mjs — worklog 예시
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
const src = 'worklog-source', dst = 'src/content/worklog';
await mkdir(dst, { recursive: true });
for (const f of (await readdir(src)).filter(f => f.endsWith('.md'))) {
  const m = f.match(/(\d{4})-(\d{2})-(\d{2})_v([\d.]+)/);
  if (!m) { console.warn('skip', f); continue; }
  const [_, y, mo, d, ver] = m;
  const body = await readFile(`${src}/${f}`, 'utf8');
  const h1 = body.match(/^#\s+(.+)$/m)?.[1] ?? `${y}.${mo}.${d} 작업일지`;
  const stripped = body.replace(/^#\s+.+$\n?/m, '').trimStart();
  const fm = `---\ntitle: "${h1.replace(/"/g,'\\"')}"\ndate: "${y}-${mo}-${d}"\nversion: "${ver}"\n---\n\n`;
  await writeFile(`${dst}/${y}-${mo}-${d}.md`, fm + stripped);
}
console.log('worklog done');
```

- [ ] **Step 2: 실행 + 결과 확인**

Run: `node scripts/migrate-content.mjs`
Expected: `src/content/worklog/` 에 133개 .md 생성, 각 파일 상단 frontmatter 정상. `ls src/content/worklog | wc -l` == 133.

- [ ] **Step 3: newsletter/insights 변환 추가** — 같은 스크립트에 두 소스 블록 추가(각 포맷에 맞춰 date/title 추출). 실행 후 개수 확인(newsletter 72).

- [ ] **Step 4: Verify** — `npm run build` 성공(컬렉션 로드, 스키마 검증 통과). 스키마 에러 나는 항목은 frontmatter 수정.

- [ ] **Step 5: Commit** — `git add scripts src/content && git commit -m "feat(work): 작업일지133·뉴스레터72·인사이트 콘텐츠 컬렉션 이전"`

---

## Phase 3 — 페이지 (허브 홈 + 섹션 + 개별)

### Task 5: 섹션 목록/개별 페이지 (worklog·newsletter·insights)

**Files:**
- Create: `src/pages/worklog/index.astro`, `src/pages/worklog/[...slug].astro` (newsletter·insights 동일 3쌍)
- Create: `src/components/PostList.astro`, `src/components/PostCard.astro`

- [ ] **Step 1: 목록 페이지** — `getCollection('worklog')` → 날짜 역순 정렬 → PostList 렌더.

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection } from 'astro:content';
const posts = (await getCollection('worklog')).sort((a,b)=>b.data.date.localeCompare(a.data.date));
---
<Layout title="작업일지 — 마이너스베타스튜디오" description="매일의 빌드로그">
  <h1 class="accent-magenta">작업일지</h1>
  <ul>{posts.map(p => <li><a href={`/worklog/${p.slug}/`}>{p.data.date} · {p.data.title}</a></li>)}</ul>
</Layout>
```

- [ ] **Step 2: 개별 페이지** — `[...slug].astro` 로 `getStaticPaths` + `<Content />` 렌더(Layout 상속).
- [ ] **Step 3: newsletter·insights 동일 패턴 복제**(각 컬렉션명만 교체).
- [ ] **Step 4: Verify** — `npm run build` 후 `dist/worklog/` 에 133 + index 생성 확인. 샘플 페이지 렌더 확인.
- [ ] **Step 5: Commit** — `git commit -m "feat(work): worklog·newsletter·insights 목록/개별 페이지"`

### Task 6: 허브 홈 + apps/system/lab 페이지

**Files:**
- Create: `src/pages/index.astro`(허브), `src/pages/apps.astro`, `src/pages/system.astro`, `src/pages/lab.astro`
- Create: `src/components/SectionCard.astro`

- [ ] **Step 1: 허브 홈** — 히어로(mβ 로고 `/minusbeta-badge.svg` 재사용+마이너스베타/강대종+소개) + 5섹션 SectionCard 그리드 + 최근 작업일지 5·뉴스레터 3 미리보기(getCollection slice) + 푸터(Footer 컴포넌트).
- [ ] **Step 2: apps.astro** — 제품/앱 카드(메모요·한줄일기·단어요·더치페이·약먹자 등 스토어 링크 + 첫이름 SaaS 링크 cheotireum.kangdaejong.com). 루트 사이트 앱 카드 패턴 재사용.
- [ ] **Step 3: system.astro** — 자동화·기술(기존 automations/stack/skills/smart-home 콘텐츠 통합 또는 링크).
- [ ] **Step 4: lab.astro** — 잡학·실험(ai-glossary, habits, webtoons, stock, timeline, dead-ends, vrl-benchmark, vibecoding, sise) 링크 모음 1페이지.
- [ ] **Step 5: Verify** — `npm run build`; dist/index.html 에 5섹션·최근글 노출 grep. Playwright 스크린샷으로 톤 확인.
- [ ] **Step 6: Commit** — `git commit -m "feat(work): 허브 홈 + apps/system/lab"`

---

## Phase 4 — URL 보존·배포·자동화 재배선

### Task 7: privacy-* URL 보존 + 리다이렉트

**Files:**
- Move: `privacy-*.html` 10개 → `public/`(Astro 정적 패스스루, 동일 경로 출력) 또는 `src/pages/privacy-*.astro` 동일 slug
- Modify: `astro.config.mjs`(필요 시 redirects)

- [ ] **Step 1: privacy-*.html → `public/` 이동** — Astro 는 `public/` 파일을 루트로 그대로 출력. `public/privacy-memoyo.html` → `/privacy-memoyo.html` 유지.
- [ ] **Step 2: Verify (필수)** — `npm run build` 후 `ls dist/privacy-*.html` 10개 전부 존재 확인. 각 URL 경로가 빌드 전과 동일한지 대조(스토어 링크 깨짐 방지 — 이 검증 실패 시 배포 금지).
- [ ] **Step 3: 기타 보존할 기존 URL** — 외부 링크/인덱스된 페이지는 `astro.config.mjs` redirects 또는 `public/` 패스스루로 유지.
- [ ] **Step 4: Commit** — `git commit -m "feat(work): privacy-* 스토어 URL 보존 + 리다이렉트"`

### Task 8: GitHub Actions 빌드/배포 갱신 + 라이브 검증

**Files:**
- Modify: `.github/workflows/*.yml`(기존 정적 rsync/pages → Astro 빌드 후 dist 배포)

- [ ] **Step 1: 워크플로 갱신** — `npm ci && npm run build` → `dist/` 를 Pages 에 배포. CNAME(work.kangdaejong.com)·.nojekyll 가 dist 에 포함되도록(`public/CNAME`, `public/.nojekyll` 배치).
- [ ] **Step 2: Verify (라이브)** — push 후 Actions 성공 → `curl -s https://work.kangdaejong.com | grep` 으로 허브 렌더 확인 + `curl -sI https://work.kangdaejong.com/privacy-memoyo.html` 200 확인(스토어 링크 살아있음) + 작업일지 샘플 페이지 200.
- [ ] **Step 3: Commit** — `git commit -m "ci(work): Astro 빌드/배포 워크플로 전환"`

### Task 9: 자동생성 스킬 재배선 (worklog/insight)

**Files:**
- Modify: worklog 스킬 / insight 스킬(`~/claude-skills/`) 의 출력 경로·포맷

- [ ] **Step 1: worklog 스킬** — HTML 직접쓰기 → `src/content/worklog/YYYY-MM-DD.md`(frontmatter 포함) 출력으로 변경. 발행 = 커밋 후 Astro 빌드/배포가 렌더.
- [ ] **Step 2: insight 스킬** — `src/content/insights/*.md` 출력으로 변경.
- [ ] **Step 3: Verify** — 무해 1건 발행 테스트 → 빌드 → 라이브에 새 글 노출 확인.
- [ ] **Step 4: 구 HTML 생성 경로 가역 정리** — 옛 HTML 출력 로직은 제거 말고 `_disabled` 보관(가역) + 주석. (정리=보관 룰.)
- [ ] **Step 5: Commit** — claude-skills repo 에 커밋.

---

## Self-Review 결과 (스펙 대조)

- 스펙 5섹션 → Task 6(apps/worklog/newsletter/insights/system) + Lab(Task 6) 커버. ✓
- 콘텐츠 컬렉션 이전 → Task 3·4. ✓
- privacy URL 보존 → Task 7(검증 게이트 포함). ✓
- 톤 통일 → Task 2(루트 토큰 대조). ✓
- 자동생성 재배선 → Task 9. ✓
- 배포 GH Pages 유지 → Task 8. ✓
- 비범위(검색/CMS/CF이전) 미포함 확인. ✓

## 위임 메모

- Phase 1~2(scaffold·토큰·콘텐츠 이전)는 한 노드가 순차. Phase 3(페이지)는 섹션별 병렬 가능(worklog/newsletter/insights/apps/system/lab 분할). Phase 4는 순차(URL·배포·스킬).
- 각 Phase = 별 PR 권장. privacy URL 검증(Task 7 Step 2)·라이브 검증(Task 8 Step 2)은 머지 전 필수 게이트.
