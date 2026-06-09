---
prevention_deferred: null
---

# 초소 PR #6 머지·배포 후에도 라이브가 옛 화면 — CSS 캐시로 새 HTML 이 무스타일 렌더

- **발생 일자:** 2026-05-20 20:30 KST
- **해결 일자:** 2026-05-20 20:50 KST
- **심각도:** low
- **재발 가능성:** high
- **영향 범위:** 초소(choso) 정적자산 배포 · Cloudflare/브라우저 캐시 · queue.kangdaejong.com

## 증상
초소 PR #6(노드/큐 박스 분리 + 5타일 가로 그리드)을 머지하고 맥미니 배포까지 했는데, 폰 라이브(queue.kangdaejong.com)는 여전히 옛 세로 일렬 리스트로 보임. 맥미니 로컬 렌더(희망화면)와 실제 라이브 화면이 달랐음 — 새 HTML 의 `.node-chip` div 들이 스타일 없이 세로로 쌓임.

## 원인
새 HTML(.node-chip / .status-grid div)은 정상 배포됐지만, 그 div 를 꾸미는 새 style.css 가 Cloudflare/브라우저 캐시에 옛 버전으로 박혀 있었음. CSS 링크가 버전 없는 `/static/style.css` 이고 Cache-Control 헤더도 없어 캐시 무효화 트리거가 전무. 옛 style.css 엔 `.status-grid`/`.node-chip` 규칙 자체가 없어 새 div 가 무스타일로 렌더. 게다가 origin(127.0.0.1:7777) curl 검증은 통과했는데, 그건 캐시 앞단이라 실제 사용자 경로(엣지/브라우저 캐시)를 못 잡는 헛검증이었음.

## 조치
1. 즉시: index.html CSS 링크에 수동 `?v=20260520b` 캐시버스팅 쿼리 추가 → 새 URL 로 캐시 미스 강제 (commit b08c028).
2. 영구(trio-vote 3-0): 수동 토큰을 **CSS 파일 내용 해시 자동 주입**으로 대체 — FastAPI `asset_v()` 가 요청 시 `hashlib.md5(style.css).hexdigest()[:8]` 계산, Jinja `?v={{ css_v }}` 주입 (commit 6303ef9). CSS 변경 시에만 토큰이 변해 자동 캐시버스트. 검증: 큐 레이아웃 CSS 변경(153bb55) 시 토큰이 a249107d → 2e218c9f 로 손 없이 자동 갱신 PASS.

## 예방 (Forcing function 우선)
CSS 파일 내용 해시 기반 `?v={{css_v}}` 자동 주입이 코드 레벨 강제 — CSS 바뀌면 토큰이 자동으로 바뀌어 캐시 무효화가 사람 손 없이 보장됨. trio-vote 3-0 으로 순수 git SHA 안의 두 함정(1: CSS 안 바뀐 커밋에도 토큰 변경=불필요 무효화, 2: startup 1회 rev-parse 라 uvicorn 미재시작 시 SHA stale) 도 회피. + 검증 룰: **정적 자산 배포는 origin curl 통과만으로 "끝" 판정 금지 — 캐시 경로/캐시버스트 적용 여부까지 확인.**

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 커밋: choso b08c028(수동 임시), 6303ef9(파일해시 자동주입), 153bb55(큐 5칸 + 자동버스트 검증)
- PR: ssamssae/choso #6 (박스 분리, merge 8759b8d)
- 텔레그램 메시지: id 20806 (형님 "이것도 이슈박고"), id 20810 (trio-vote 3-0 결과)
