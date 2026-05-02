# Substack 회귀 sweep — WSL 1차 (2026-05-02)

작성: 2026-05-02 16:55 KST · 작성자: 🪟 WSL (DESKTOP-I4TR99I) · 디렉티브: Mac→WSL 분배 (16:36 KST)

## 점검 제외 (본진 republish 큐)

- `/p/3-ai` — Mac 본진 republish 진행 중
- `/p/463` — Mac 본진 republish 진행 중

→ 디렉티브 명시 제외. 본 sweep 에서는 curl probe 하지 않음.

## URL 매핑 클리어업 (사전 조사)

디렉티브는 `/p/3-ai (Ep.6 추정)` 으로 표기했으나, 다음 두 출처 모두 `/p/3-ai = Ep.1`, `/p/463 = Ep.2` 로 일치:

1. 이전 WSL Track D 노트 — `newsletter/REGRESSION-NOTE-2026-05-02.md` 11행: `/p/3-ai` → Ep.1
2. 미머지 PR #18 (commit 2950aad) `newsletter/index.json` — Ep.1 substackUrl=`/p/3-ai`, Ep.2 substackUrl=`/p/463`, Ep.3 substackUrl=`/p/70-0-1`

따라서 **디렉티브의 sweep 스코프 (Ep.1·Ep.2·Ep.4·Ep.5) 와 URL 제외 (`/p/3-ai`·`/p/463`) 는 실질적으로 Ep.4·Ep.5 만 sweep 가능**. Ep.1·Ep.2 는 Mac 본진 active republish 영역과 겹쳐 race condition 위험으로 본 sweep 에서 제외.

(URL 매핑 정정은 본 보고에서 surface only — `index.json` 은 PR #18 머지 시 Mac 본진이 갱신.)

## 점검 결과

| Ep | URL | `<img>` 카운트 (article body) | `IMAGE N` 텍스트 잔존 | 회귀 의심 |
|----|-----|-------------------------------|------------------------|-----------|
| Ep.4 | `https://daejongkang.substack.com/p/f33` | 0 | 0 | NO (디자인상 이미지 0) |
| Ep.5 | `https://daejongkang.substack.com/p/32b` | 0 | 0 | NO (디자인상 이미지 0) |
| Ep.1 | `https://daejongkang.substack.com/p/3-ai` | — (skip, 본진 republish) | — | (본진 처리 중) |
| Ep.2 | `https://daejongkang.substack.com/p/463` | — (skip, 본진 republish) | — | (본진 처리 중) |

### 측정 방법

- `curl -sL <url>` 로 발행본 HTML 페치 (Ep.4: 163,612 bytes / Ep.5: 150,163 bytes)
- Python 정규식으로 `<article>...</article>` 본문 영역 추출 후 `<img\s` + `\bIMAGE\s+\d+\b` 카운트
- 전체 HTML 의 `<img` 1개씩은 모두 article 외부 (header/social meta) — 본문 0 확정

### 검증 한계

- substack 클라이언트 사이드 이미지 lazy hydration 케이스가 있으면 curl HTML 만으로는 누락 가능. 디자인상 이미지 0 결론은 이전 WSL Track D 노트의 소스 markdown (`ep4-cache.md`, `ep5-2026-04-30.md`) 에서 `IMAGE N` placeholder 0개 확인과 교차검증되어 신뢰도 OK.
- 절대 확정이 필요하면 Mac 본진 Playwright MCP 로 동일 URL 재진입 후 article DOM `img` 카운트 1회 더 돌리면 됨 (이번 sweep 의 scope 밖).

## 회귀 의심 회차 명단

- **없음** (Ep.4 + Ep.5 둘 다 회귀 NO 재확인)
- Ep.1 + Ep.2 의 회귀 여부는 Mac 본진 republish 사이클에서 처리 중

## 본 sweep 이 다루지 않는 것

- `/p/3-ai`, `/p/463` curl probe (디렉티브 명시 제외)
- `index.json`, `ep*-cache.md`, `ep*-substack.md` 수정 (디렉티브 금지)
- `REGRESSION-NOTE-2026-05-02.md` 수정 (Mac 본진 워킹 파일)
- 실 substack 본문 patch / republish (Mac 본진 영역)
- Ep.3 점검 (디렉티브 스코프 밖)
