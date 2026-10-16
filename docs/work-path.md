# 회사 도메인의 작업장 — T-261017-004

공개 주소는 `https://kangdaejong.com/work/`다. 회사와 작업장은 `https://kangdaejong.com/sitemap.xml`을 함께 사용한다. 기존 `work.kangdaejong.com`의 개별 링크는 같은 `/work/` 경로로 301 이동한다. 쿼리 문자열을 보존한다.

## 빌드와 역할

기존 Astro 빌드는 루트 산출물을 유지한다. postbuild의 `scripts/work-mount.mjs`가 `dist/work/`에 별도 산출물을 만든다. 실제 링크·스크립트·이미지·CSS 경로를 이동한다. 글의 코드 예제 본문은 유지한다. 각 HTML에 canonical을 하나만 남긴다. 기존 사이트맵에 있던 색인 가능 페이지만 새 사이트맵에 넣는다. 리디렉션·클릭 중계·noindex 페이지는 제외한다.

Pagefind는 두 경로에서 각각 색인을 만든다. 검색 UI는 `workshop-base` 메타 정보로 결과의 `/work/` 접두사를 설정한다. 원본 사이트도 이전 과정에서 계속 동작한다.

`main` 머지는 기존 GitHub Pages 자동 배포를 실행한다. 새 예약기나 배포 workflow는 추가하지 않는다. 회사 저장소 `workshop-router/`가 `/work*`와 `/sitemap.xml*`을 처리한다. 동일 zone의 원본 fetch는 `global_fetch_private_origin` 설정으로 Worker를 우회한다. 원본은 계속 GitHub Pages다.

## 이전 순서

1. 이 저장소 PR을 검토·머지한다. GitHub Pages의 `work.kangdaejong.com/work/` 산출물을 확인한다.
2. 기존 `daejong-nl-events` Worker에 새 회사 Origin 허용을 반영한다. 현재 D1·secret 바인딩을 보존한다. 예제 `wrangler.toml`에는 운영 D1 바인딩이 없으므로 그대로 배포하지 않는다. OPTIONS 응답으로 확인한다. 운영 분석 데이터에 시험 이벤트를 쓰지 않는다.
3. 회사 PR을 검토·머지한다. `workshop-router`를 배포한다. `/work/`와 통합 사이트맵을 먼저 검증한다.
4. 회사의 기존 `deploy:site`로 공통 메뉴를 반영한다. 기존 작업장 DNS를 백업한다. CNAME 대상은 유지한 채 프록시를 켠다. 기존 호스트 301과 원본 fetch의 반복 이동 여부를 검증한다.
5. 회사의 공개 전체 검사와 아래 기능 확인을 실행한다. 배포 성공과 검색엔진의 실제 재색인은 구분한다.

되돌림은 기존 작업장 DNS의 프록시를 원복하고 `workshop-router` 라우트를 제거한다. 공통 메뉴 변경을 되돌린다. 기존 루트 산출물을 유지하므로 원본 사이트는 계속 제공할 수 있다. 원본 파일·D1·도메인은 삭제하지 않는다.

## 확인 경로

`npm run build`는 기존 필수 검사, 변환 회귀 검사, 전체 HTML·내부 링크·사이트맵 검사를 실행한다. `node --test scripts/test-nl-instrument.mjs`는 새/기존 Origin 허용과 다른 Origin 차단을 메모리 저장소에서 확인한다.

회사 저장소를 먼저 빌드한 뒤 `COMPANY_DIST=/absolute/company/dist node tests/work-mount.browser.mjs`를 실행한다. `/work/` → 「기록 검색」에 「자동화」 입력 → 결과 글 열기 → `/work/products/`의 「Jarvis」 검색 → 회사 로고 링크 확인 순서다. 390/1440px에서 검사한다. 근거와 화면은 `site-release-report/`에 생성한다.

2026-10-17 로컬 빌드: HTML 956개, 사이트맵 905개, 내부 링크 누락 0개. 두 화면 폭의 검색·글 이동·제품 검색·회사 메뉴 검사를 통과했다. 공개 배포 확인은 T-261017-004 체크포인트에 기록한다. 실제 검색엔진의 수집·색인 완료는 이 빌드 결과로 주장하지 않는다.
