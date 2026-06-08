# work.kangdaejong.com 리뉴얼 설계 (Astro 허브 마이그레이션)

STATUS: TODO / last_verified: 2026-06-08 / source_of_truth: 이 문서 (구현 전 설계)

## 배경 / 목적

현재 work.kangdaejong.com(`~/daejong-page`)은 정적 HTML 30+개 최상위 페이지가 각자 인라인 CSS로 분리돼 있고, 공통 레이아웃·디자인 시스템·빌드 프레임워크가 없다(index.html 단일 130KB, GitHub Pages 자동배포). 콘텐츠는 작업일지 133개·뉴스레터 72개·웹툰 14개 + 기술/잡학 페이지 다수. 전반 리뉴얼 시 페이지마다 손대야 해 일관성이 깨진다.

브레인스토밍(2026-06-08, 아니키)으로 확정한 방향:
- **1순위 목적 = 브랜드 허브** (탐색·입구 중심). 방문자가 "마이너스베타/강대종이 하는 게 다 여기 모여있네"를 느끼게.
- **빌드 접근 = Astro 풀 마이그레이션** (A안).
- **톤 = kangdaejong.com 루트와 통일** (다크 + 시안/마젠타 네온, mono+Pretendard).

## 핵심 섹션 (홈 1급)

1. 제품/앱 — 메모요·한줄일기·단어요·더치페이·약먹자 등 + 첫이름(AI 사주 작명 SaaS)
2. 작업일지 — 매일 빌드로그 (133개)
3. 뉴스레터 — 바이브코딩 (72개, Substack)
4. 인사이트 — 영상 요약 세컨드브레인
5. 자동화·기술 — 5노드 시스템 / stack / skills / smart-home 통합

그 외 잡학·실험(ai-glossary, habits, webtoons, stock, timeline, dead-ends, vrl-benchmark, vibecoding, sise 등)은 **Lab 1페이지**에 모은다.

## 아키텍처

- **스택**: Astro 정적 사이트 (SSG). 빌드 산출물 → GitHub Pages(work.kangdaejong.com) 자동배포 유지(기존 `.github/workflows` 재사용·갱신). CNAME·.nojekyll 보존.
- **공통 Layout**: `src/layouts/Layout.astro` — `<head>`(폰트·메타), 글로벌 nav, 푸터(사업자정보+Lab 링크). 모든 페이지가 상속.
- **디자인 토큰**: `src/styles/tokens.css`(또는 Layout 내 `:root`) — 루트 사이트와 동일: `--bg`(다크), `--cyan #00e5ff`, `--magenta #ff00aa`, 폰트 JetBrains Mono + Pretendard. 전체 톤을 한 곳에서 제어.
- **컴포넌트**: `SectionCard.astro`(허브 5섹션 타일), `PostList.astro`(목록), `PostCard.astro` 등 재사용 단위.

## 콘텐츠 모델 (Astro Content Collections)

- `src/content/worklog/*.md` — 작업일지 133개. 기존 `worklog-source/*.md`(마크다운 원본) 이전 + frontmatter(date, version, title) 정규화.
- `src/content/newsletter/*.md` — 뉴스레터 72개.
- `src/content/insights/*.md` — 인사이트.
- 목록/개별 페이지는 컬렉션에서 자동생성(`getCollection`).

## 페이지 구조 (라우트)

- `/` — 허브 홈: ①히어로(mβ 로고+마이너스베타/강대종+한줄 소개) ②5섹션 카드 ③최근 작업일지 3~5 + 최근 뉴스레터 3 미리보기 ④푸터(Lab+사업자정보).
- `/apps` — 제품/앱 + 첫이름.
- `/worklog` (목록) + `/worklog/[slug]` (개별).
- `/newsletter` (목록) + `/newsletter/[slug]`.
- `/insights` (목록) + 개별.
- `/system` — 자동화·기술 (stack·skills·smart-home 통합).
- `/lab` — 잡학·실험 모음.

## URL 보존 (필수 제약)

- `privacy-*.html` 10개(메모요·한줄일기·더치페이·약먹자·포모도로·한컵 등 앱 스토어가 링크하는 개인정보처리방침)는 **경로 그대로 유지**. 깨지면 스토어 정책 링크 위반. Astro에서 동일 경로로 출력하거나 정적 파일로 패스스루.
- 기존 주요 페이지 URL(예: 외부 링크·검색 인덱스된 것)은 리다이렉트(또는 동일 경로 유지)로 깨지지 않게.

## 자동생성 스킬 재배선

- `worklog` 스킬 / `insight` 스킬이 현재 HTML을 직접 쓰던 출력을 **마크다운(frontmatter 포함) → 콘텐츠 컬렉션 디렉토리**에 쓰도록 변경. 이후 Astro 빌드가 렌더. (자동화 유지가 전제 — 스킬 깨지면 안 됨.)

## 디자인 시스템

- 다크 배경 + 네온 카드 그리드. 제목 mono, 본문 Pretendard. hover 시 마젠타 포인트(루트와 통일). 반응형(모바일 1열).

## 마이그레이션 단계 (구현 plan에서 상세화)

1. Astro scaffold + Layout + 디자인 토큰(루트 토큰 포팅).
2. 허브 홈 + nav/푸터 + SectionCard.
3. 콘텐츠 컬렉션 3종(worklog/newsletter/insights) — 기존 HTML/md → md frontmatter 변환.
4. 섹션 목록/개별 페이지.
5. /apps, /system, /lab 페이지.
6. privacy-* URL 보존 + 리다이렉트.
7. 자동생성 스킬(worklog/insight) md 출력으로 재배선.
8. GH Actions 빌드/배포 갱신 → 라이브 검증.

## 비범위 (YAGNI)

- 댓글·검색·CMS·다국어 등 신규 기능 추가 X (요청 없음). 기존 콘텐츠를 통일된 톤의 허브로 재구성하는 것에 한정.
- 배포를 CF Pages로 옮기는 것은 이번 범위 아님(GH Pages 유지). 추후 별도 판단.

## 실행 메모

- 규모가 크므로(200+ 페이지/콘텐츠) 구현은 노드 위임 예정. 본진은 spec/plan 작성·리뷰·통합 담당.
- 작업일지/뉴스레터 콘텐츠 변환은 자동 스크립트(HTML→md)로 일괄 처리 검토.
