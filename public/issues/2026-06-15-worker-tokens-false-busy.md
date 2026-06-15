---
prevention_deferred: null
---

# 자율 워커 busy 판정 false-positive — idle 푸터 "clear to save Nk tokens" 가 busy regex 의 "tokens" 에 매칭

- **발생 일자:** 2026-06-15 (밤새, 03:30~10:35 KST 전 틱)
- **해결 일자:** 2026-06-15 11:00 KST
- **심각도:** high
- **재발 가능성:** medium
- **영향 범위:** 자율 워커 전체 (bonjin-worker / macmini-claude-worker / pull-worker) — claude 백엔드 세션 대상

## 증상
어젯밤 IAP 작업 후 본진워커(bonjin-claude)를 켰는데 밤새 한 task 도 실행 안 함. 노드현황 모니터는 같은 시간대(07:30·08:00·08:30·09:00) "🍎 본진 idle 27%" 로 찍었는데, bonjin-worker 로그는 매 30분 틱(05:04~10:35) 전부 "SKIP — REPL busy (진행 중 작업, 양보)". idle 인데 busy 로 오판해 영영 일을 안 잡음.

## 원인
Gate3 busy 판정이 tmux pane 마지막 6줄을 `grep -qiE "esc to interrupt|Working|tokens"` 로 검사. 그런데 **idle 상태의 claude 세션도 컨텍스트가 쌓이면 하단에 "/clear to save NNNk tokens" 힌트를 표시**한다. 이 힌트의 "tokens" 가 regex 에 매칭 → idle 인데 false-busy. 컨텍스트가 쌓인 본진(27% 등)은 항상 이 힌트가 떠 있어 매 틱 false-busy → worker 가 영영 자리를 못 잡음. (active 스피너의 "↓ Nk tokens" 와 idle 힌트의 "save Nk tokens" 가 둘 다 "tokens" 라 단어만으론 구분 불가.)

## 조치
busy 판정 직전 `grep -v "clear to save"` 로 idle 힌트 줄만 제외한 뒤 기존 regex 적용. idle 푸터(false-busy 안 남) / active 스피너("↓ tokens"+"esc to interrupt", busy 남) 양방향 테스트 통과.
- bonjin-worker.sh — commit 154ab73
- macmini-claude-worker.sh / pull-worker.sh (동일 버그) — commit c1894c7
- codex 워커 2종(bonjin-codex / macmini-codex)은 "tokens used" 라 idle 힌트("save Nk tokens")와 안 겹쳐 무관 — 미변경.
가드 마커(중복 자가주입 방지) 유지한 채 로직만 surgical 수정.

## 예방 (Forcing function 우선)
busy 판정에서 idle UI 힌트 줄을 구조적으로 제외 → idle 세션이 busy 로 오판될 수 없음. 향후 busy regex 에 새 토큰 추가 시 "idle 화면에도 그 단어가 뜨는가" 1회 self-check.

- **막을 코드/훅:** `~/claude-automations/scripts/bonjin-worker.sh` (commit 154ab73) + `macmini-claude-worker.sh`·`pull-worker.sh` (commit c1894c7) — busy grep 전 `grep -v "clear to save"` 필터.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 커밋: 154ab73 (bonjin-worker), c1894c7 (macmini-claude / pull-worker) — ssamssae/claude-automations
- 메모리: `memory/project_bonjin_worker_live.md`
- 텔레그램: 2026-06-15 오전 아니키 "본진 idle 27% 인데 왜 안돔" 스크린샷 지적으로 발견
