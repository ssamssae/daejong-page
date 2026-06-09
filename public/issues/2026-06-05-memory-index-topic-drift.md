---
prevention_deferred: null
---

# MEMORY.md 인덱스 줄이 정본 토픽파일과 드리프트 → 매 세션 stale 신호 반복

- **발생 일자:** 2026-06-05 (누적: 2026-06-03 ~ 06-05)
- **해결 일자:** 2026-06-05 12:30 KST
- **심각도:** high
- **재발 가능성:** high
- **영향 범위:** 전 세션(본진) — 메모리 recall 기반 모든 판단/디렉티브

## 증상
첫이름(cheotireum) 작명 엔진이 이미 2026-06-02 실구현+프로덕션 LIVE인데, 새 세션마다 "작명엔진 mock 미구현, 만들어야 함"으로 오판해 재구현 헛작업 디렉티브를 반복 발사. 최소 4회: 6/3 노트북 오판, 6/4 autopilot 2회(다크톤 재탕 포함), 6/5 본진이 "e2e 검증 리스크 1순위"로 재프레이밍. 아니키 "작명엔진 계속 만들라고 하는데 이거 때문에 오늘 스테일 인프라 개선한 거거든 왜 그런 거야".

## 원인
계획(인덱스)·정본(토픽파일)·실제(코드) 3자 드리프트. 정본 토픽파일(`memory/project_cheotireum_naming_service.md`)은 "엔진 실구현+프로덕션 LIVE, mock 아님"이라 큰 STALE 경고까지 박혀 잘 갱신돼 있었음. 그러나 **매 세션 컨텍스트로 자동 로드되는 건 무거운 토픽파일이 아니라 `MEMORY.md`의 한 줄짜리 인덱스**인데, 그 인덱스 줄이 "결제껍데기만 깔림, 작명엔진 mock 미구현"으로 옛날 그대로 멈춰 있었음. 새 세션은 싼 인덱스 한 줄만 보고 stale 판단 → 헛작업. 2026-06-05 스테일 동기화 인프라(`stale-reconcile.py` 등)는 tasks.md↔git 축만 덮고 메모리 인덱스↔토픽파일 축은 안 덮은 사각.

## 조치
1. 즉시: cheotireum 인덱스 줄 정정 — "엔진 실구현+프로덕션 LIVE, mock 아님(오판 3회)"로 교체 (MEMORY.md).
2. 결정론 린터 신설: `~/claude-automations/scripts/memory-index-lint.py` — 토픽파일 description의 done-positive(LIVE/프로덕션/실구현) ↔ MEMORY.md 인덱스 줄의 stale-positive(mock/미구현/준비중) 모순 감지. 인덱스 줄이 자체 done-positive면 부정/인용("mock 아님")으로 보고 제외(부정-맹점 회피). commit `eae18c97`.
3. SessionStart 훅 신설: `~/.claude/hooks/session-start-memory-index-check.sh` — 새 세션 시작 시 린터 sweep, CONTRADICTION 있으면 세션 컨텍스트에 경고 주입("인덱스 한 줄만 믿지 말고 토픽파일 본문 확인"). 본진 settings.json SessionStart 등록. DO NOT REMOVE 가드 마커. commit `92b7c392`. 비용 0(로컬 python <1s, API 0), 드리프트 없으면 무출력.

## 예방 (Forcing function 우선)
새 세션이 stale 인덱스를 읽고 오판하기 직전에 자동 경고 주입 → 사람 의지 무의존. 인덱스가 정본과 모순일 때만 발화(false-positive 억제 위해 부정/인용 제외 로직 포함).

- **막을 코드/훅:** `~/.claude/hooks/session-start-memory-index-check.sh` (SessionStart, 본진 settings.json 등록, commit 92b7c392) + `~/claude-automations/scripts/memory-index-lint.py` (commit eae18c97)
  - 한계/후속: (1) 본진 전용(MEM_DIR=-Users-user 하드코딩) — Linux 노드(-home-ssamssae) 일반화는 후속. (2) 결정론 키워드 매칭이라 의미적 드리프트(키워드 안 겹치는)는 미감지 — 2주 실측 후 LLM 보조(스테일 동기화 3단계와 합류) 검토. (3) PostToolUse 편집시점 forcing은 미구현(SessionStart 읽기시점만) — 필요시 추가.

## 재발 이력
<처음 생성 — 비움>

## 관련 링크
- 메모리: `memory/project_cheotireum_naming_service.md` (정본, STALE 경고 포함), `memory/MEMORY.md` (인덱스, 정정됨)
- 관련 메모리: `memory/feedback_verify_repl_session_before_status_claim.md`, `memory/feedback_anti_stale_lifecycle.md`, `memory/project_stale_sync_architecture.md` (tasks.md↔git 축 — 본 이슈는 메모리 인덱스↔토픽 축, 사촌)
- 커밋: lint eae18c97 / hook 92b7c392
- 텔레그램: 아니키 "이거 왜그런거야 / 이슈박고 재발방지 구축" (2026-06-05)
