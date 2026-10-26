# 기능 확인 경로

## 공용 아이콘·배포 누락 방지 — T-261013-046

- 진입: `/work/products/` → 전체/모바일 앱/웹 서비스/오픈소스 → 첫이름 또는 Jarvis 검색. 같은 회사홈 아이콘을 공용 정본 `https://kangdaejong.com/brand/products/catalog.json`에서 읽는다. 제품별 고정 주소를 사용한다.
- `src/data/products.ts`에는 제품 ID만 지정한다. 승인 이미지 또는 사유 있는 예외가 없으면 빌드 실패. Local Bridge의 기존 기호는 명시적 예외다. 첫이름은 정본에 ID가 없거나 아이콘 없는 `approved-placeholder`이면 로더와 검증 CLI에서 `cheotireum.webp`·`cheotireum@2x.webp` 정본 주소로 보충한다. 이미 등록된 아이콘은 그대로 사용한다. 순수 검증 함수는 입력 카탈로그와 예외 검증 계약을 유지한다. 과거 출처 JSON은 역사 자료로 보존한다.
- 검증: `bash tests/test_product_icon_contract.sh`, postbuild `verify:product-icons`, PR 필수 `site-release-contract`. 구버전 이미지·누락 카드·미등록 제품은 실패한다.
- 첫이름 아이콘 경로(T-261026-030): 기존 [파란색 ㅊ SVG](https://github.com/ssamssae/cheotireum/blob/c9b7fc14c0de43644f2feca355c6c291937ef09d/web/brand-mark.svg)를 사용하는 중앙 WebP 주소를 참조한다. 로그인 없이 로컬 `/work/products/`에서 첫이름 카드를 찾는다. 기대값은 48px 이미지의 정본 `src`와 1x·2x `srcset`이다. `npm run build` 뒤 `python3 -m unittest discover -s tests -p test_product_offboarding.py`로 생성 HTML을 검사한다. 이 변경은 수동 PR 생성까지이며 공개 이미지 서빙은 중앙 자산 배포에 의존한다.
- 기존 Pages 배포 뒤 `verify-production`이 공개 커밋, 정본 자산 hash, 모든 사이트맵 HTML, 390/1440px × light/dark 대표 화면을 검사한다. JSON/PNG를 Actions artifact로 보존한다. 실패하면 배포 워크플로도 실패한다. 웹 배포와 Telegram 미리보기 완료는 별도다.

## 홈페이지와 같은 헤더·톤 — T-261003-017

- `Layout.astro`의 모든 페이지는 흰 배경, 파란 강조색 #2458cc, Pretendard, 최대 본문 1440px(`--page-max`)을 사용한다. 노트 문서와 제품 화면도 같은 토큰을 따른다.
- 다크 모드(T-261012-024): `Layout.astro`가 `<html data-theme="auto">`를 켜고, 기기 설정이 다크면 `tokens.css` 다크 블록(회사홈 kangdaejong.com과 같은 팔레트 #121519 바탕·#7aa2ff 강조)이 적용된다. 리터럴 색은 `var(--토큰, 원래색)`으로 감싸 라이트 화면은 그대로다. 공용 헤더·푸터는 `--mb-host-*`를 상속한다. 제품 그림(ProductArt)·영상 바탕·데이터 색(시세 등락·자비스 막대)은 그림 색이라 그대로 둔다.
- 헤더 정본은 `https://kangdaejong.com/mb-components.js`. 프로젝트·앱·연락은 회사 홈의 해당 구역으로 연결하고, 둘러보기에서 작업장 기존 목적지로 이동한다.
- 로컬: `npm run build`는 기존 prebuild 검사와 907개 공개 HTML·내부 링크·노트 검증을 수행한다. `tests/shared-tone.spec.mjs`는 홈/제품/작업일지/뉴스레터/시스템/타임라인/스택을 390·1440px에서 검사한다. 로컬의 `SHARED_HEADER_FILE`은 미배포 정본을 테스트 응답으로 제공하며 라이브 검증에서는 지정하지 않는다.
- 공유 카드와 favicon은 중앙 brand 자산을 유지한다. 공유 이미지는 `https://kangdaejong.com/brand/current/social.png` 고정 주소를 사용한다(T-261012-041). 예외: 작업일지·뉴스레터·인사이트 글 페이지는 글별 이미지를 쓴다(T-261010-061).
- main 머지는 기존 GitHub Pages 워크플로를 실행한다. 사용자 전체 톤 변경의 공개 반영 범위이며 배포 설정 변경은 없다. 원격 실행 결과와 실제 CSS·화면 확인은 T-261003-017 체크포인트에 별도로 기록한다.

## T-261003-018 · 사이트 디자인 통일

공통 톤: 17개 레이아웃 계열 중 외부 스토어 이동용 redirect를 제외한 16개 화면을 390/1440px로 대조. products/?category=tool#catalog에서 7개 도구 → Jarvis 검색 1개 → 검색 해제 7개, 제품 화면과 사용 예시 펼치기. 안내·실험실·목록·글·정적 개인정보 페이지 공통 색/제목/헤더 적용. shared-tone, skills-page, knowhow-page 브라우저 검사 및 전체 빌드 링크 검사.

## 전자책 판매 종료 — T-261003-019

- 승인: 2026-10-03 사용자 전자책 오프보딩 및 홈페이지 반영 요청. 크몽 3종 판매 중지, 원본 보존.
- 진입: 대표 홈페이지 `/#books`, `/digital-products/`, 작업장 `/products/`의 전자책.
- 기대: 판매 종료 안내, 신규 구매 링크 및 가격 없음. 공개 무료 양식 링크 정상.
- 검증: 양쪽 빌드, 기존 전자책 화면 회귀 및 뉴스레터 구매 hop 제거 검사. 공개 반영·크몽 실측 근거는 `/Users/user/reports/T-261003-019/`에 기록.

## 제품 종료 기록과 공유 카드 — T-261004-001

- `/work/products/`: 현재 앱 6종·웹 서비스 1종·공개 도구 7종을 카탈로그에 포함. 모바일 앱/웹 서비스/오픈소스 분류와 첫이름·Jarvis 검색을 확인한다. 종료한 11개 제품·서비스는 날짜·상태를 별도 표시하고 신규 구매 링크를 제공하지 않는다.
- `/work/timeline.html/`: 2026-10-03 종료 이벤트 11개와 기존 출시 이력을 함께 표시한다. 종료 데이터는 `src/data/retired-products.json` 한 곳에서 관리한다.
- 모든 Layout 페이지의 OG/Twitter 이미지와 제목·설명은 공통 레이아웃에서 한 번만 출력한다. 공통 공유 카드는 중앙 다크 이미지의 고정 주소를 사용한다(T-261012-041). 기존 Telegram 메시지에 저장된 미리보기의 갱신은 사이트 배포만으로 보장되지 않는다.
- 검증: `npm run build`, `node scripts/verify-products-page.mjs`, `node scripts/verify-offboarding-ui.mjs` (기본 localhost:4391, `VERIFY_BASE`로 공개 주소 지정). 390/1440px 분류·검색·종료 이벤트·가로 넘침·중복 메타데이터 검사 통과. 근거 `/Users/user/reports/T-261004-001/`.
- main 머지는 기존 GitHub Pages 자동 배포를 실행한다. 사용자 홈페이지 최신화 승인 범위이며 배포 설정은 그대로다.

## 첫이름 유료 웹 서비스 복구 — T-261024-052

- 사전 조건: 로그인 없이 로컬 빌드를 확인한다. `PUBLIC_NL_EVENTS_ORIGIN`은 저장소 Actions 변수와 같은 공개 collector 주소를 사용한다.
- 진입·조작: `/work/`의 요약 바 확인 → `/work/products/`의 웹 서비스 필터 선택 → 전체 필터에서 첫이름 검색 → 카드의 웹에서 시작하기·무료 샘플·한자 확인 링크 확인.
- 기대: 요약 바는 `웹 서비스 1`, 웹 서비스 필터와 첫이름 검색은 카드 1개다. 전체 활성 카드는 14개이며 종료 목록은 11개다. 첫이름 종료 오기는 목록과 타임라인에서 제거된다. 작명서 가격은 1,000원이며 링크는 첫이름 도메인의 `/`, `/sample-report`, `/hanja-check`다.
- 로컬 실측(2026-10-24): 필수 5개 검증과 `node scripts/verify-products-page.mjs` 통과. `VERIFY_BASE=http://127.0.0.1:4391/work VERIFY_OUT=<근거 폴더> node scripts/verify-offboarding-ui.mjs`로 390/1440px 필터·검색·링크·요약·타임라인을 확인했다. 가로 넘침과 브라우저 예외는 없었다. 이 변경 PR에 검증 결과를 기록한다.
- 아이콘 회귀: 누락 catalog의 보조 항목, 정본 아이콘 우선, 검증 함수의 입력 불변성을 검사한다. 뉴스레터 회귀는 세 링크의 고유 hop과 `/other` 충돌 거부를 검사한다.
- 승인 경계: 이번 작업은 수동 PR 생성까지다. PR 머지·프로덕션 배포·결제 실행은 하지 않는다. 공개 작업장 반영은 이번 로컬 검증의 범위가 아니다.

## 제품 아이콘 — T-261013-044

- 진입: 로그인 없이 `/products/`. 모바일 앱·오픈소스 분류와 제품 검색으로 카드를 찾는다.
- 기대: 앱 6종·입타·자비스·Grok/Codex/Claude/Cursor 브릿지는 T-261011-068에서 승인한 회사 홈 아이콘을 표시한다. 같은 96px WebP를 48px로 표시한다. 정리본에 아이콘이 없는 Local Telegram Bridge는 기존 기호를 유지한다.
- 출처: 그록봇의 `icons-20261011` 정리본과 회사 홈 배포 자산. `src/data/product-icon-sources.json`은 현재 카탈로그 아이콘 12개의 원본·배포 파일 해시를 구분한다. 종료 제품의 기존 파일은 보존한다.
- 검증: `npm run build`, `node scripts/verify-product-icons.mjs`, `node scripts/verify-products-page.mjs`. 화면 확인은 390/1440px·라이트/다크에서 이미지 로딩, 분류·검색, 가로 넘침을 확인한다. 로컬·공개 반영 근거는 `/Users/user/reports/T-261013-044/verification.json`에 기록한다.
- main 머지는 기존 GitHub Pages 자동 배포를 실행한다. 이번 제품 아이콘 공개 교체 요청의 반영 경로이며 배포 설정은 바꾸지 않는다.

## 글별 공유 이미지 — T-261010-061

- 진입: `/worklog/<id>/`, `/newsletter/<id>/`, `/insights/<id>/` 글 페이지의 링크를 메신저·SNS에 공유한다.
- 기대: 미리보기에 그 글의 분류·날짜(버전)·제목이 들어간 1200x630 이미지가 뜬다. 긴 제목은 3줄에서 말줄임한다. 홈·목록·기타 페이지는 중앙 공통 이미지를 유지한다.
- 구현: `src/lib/og-image.mjs`(satori + @resvg/resvg-js, `pretendard` npm 패키지 OFL-1.1 폰트, 네트워크 미사용)가 `src/pages/og/[collection]/[slug].png.ts`에서 빌드 때 `/og/<collection>/<id>.png`를 만든다. 글 페이지는 `Layout`의 `image`로 그 절대 주소를 넘긴다.
- 검증: `npm run build`의 postbuild `npm run verify:og-images`가 컬렉션별 원문 수 = 글 페이지 수 = PNG 수, 글마다 og:image·twitter:image 1개가 자기 PNG를 가리킴, PNG 1200x630, 홈 공통 이미지 유지를 검사한다. 이미 저장된 메신저 미리보기의 갱신은 배포만으로 보장되지 않는다.
## 작업장 주소 이전 — T-261017-004

- 진입점: `https://kangdaejong.com/work/`. 로그인 없이 사용한다.
- 조작: 기록 검색 → 결과 글 열기 → 제품 목록 검색 → 회사 로고 클릭.
- 기대: 작업장 내부 이동은 `/work/`를 유지한다. 회사 로고는 회사 홈으로 간다. 옛 글 링크는 같은 새 경로로 301 이동한다. 회사와 작업장은 루트 사이트맵을 함께 쓴다.
- 로컬 근거: `tests/work-mount.test.mjs`, `scripts/verify-work-mount.mjs`, `tests/work-mount.browser.mjs`. 2026-10-17의 390/1440px 검색·이동 검사를 통과했다. 공개 배포·검색엔진 색인 상태는 별도 확인한다. [배포 순서](work-path.md).

## 글 본문 용어 툴팁 — T-261025-009

- 출발: 인사이트 「바이브코더 필수 UI 용어 24가지」(2026-10-25)의 툴팁 — 대종님 「추천1~4 진행해줘」의 추천 4.
- 진입점: `/work/insights/<id>/`·`/work/worklog/<id>/` 글 본문. 로그인 없이.
- 조작: PC 는 점선 밑줄 단어에 마우스를 올리거나 키보드(Tab)로 고른다. 휴대전화는 단어를 누른다 — 다시 누르거나 바깥을 누르면 닫힌다. ESC 로도 닫는다.
- 기대: 용어 사전(`src/pages/ai-glossary.html.astro`)에 있는 말이 그 글에서 처음 나올 때 한 줄 풀이가 뜬다(한 글에 최대 12개). 인사이트는 그 영상의 풀이를 그대로, 다른 글은 사전 풀이의 첫 문장을 쓴다(영상 속 상황 — 「영상」·「발화자」·「대담」·「강연」·「인터뷰」 — 을 말하는 풀이는 건너뛴다). 풀지 않는 것: 제목·링크·코드, 인사이트의 「용어」·「영상 메타」 구역, 두 글자 한국어 일상어(문서·채널), 영어 일상어(session·agent — 사전이 대문자로 써도), 경로·이름에 붙은 말(`claude-skills`·`~/.codex`·`MCP_SERVER`), 우리 노드 이름(Athena·Hermes·Vulcan…). 풀이 상자는 화면 좌우 여백 안에 들어온다. 풀이는 사이트 검색 색인에서 뺀다(`data-pagefind-ignore`).
- 구현: 빌드 때 `src/lib/rehype-glossary-tips.mjs`(사전 읽기 `src/lib/glossary-terms.mjs`)가 표시를 달고(`astro.config.mjs` 의 `rehypePlugins`), `src/components/TermTips.astro` 가 모양(공용 톤 이름만)과 여닫기를 맡는다. 사전이 바뀌면 다음 빌드에 자동 반영된다. 로컬에서 플러그인 코드를 고친 뒤에는 `node_modules/.astro/data-store.json`(본문 결과 저장분)을 지우고 빌드해야 반영된다 — CI 는 매번 새로 설치하므로 영향 없음.
- 근거: `scripts/test-glossary-tips.mjs`(prebuild, 14개), `tests/term-tips.spec.mjs`(미리보기 서버 대상 5개 — 마우스·키보드·ESC·휴대전화 누르기·360px 화면 안). 2026-10-25 제우스 로컬 — 전체 빌드·postbuild 검사 통과(직접 숫자 707 ≤ 기준선 707), 브라우저 시험 16개 통과, 399편에 1,729개(한 편 최대 12개).
- 미확인·갱신 조건: 공개 배포 뒤 실제 화면.
