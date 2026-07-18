---
prevention_deferred: null
---

# 오토파일럿 5일 무발사 — Fable5 프로모 배너 "keep working" busy 오탐

- **발생 일자:** 2026-07-13 23:05 KST (첫 무발사 틱) — 인지 2026-07-18 오전 (아니키 "어제 오토파일럿 왜 작동안했는지 원인 찾아줘")
- **해결 일자:** 2026-07-18 10:23 KST (#882 머지) / 역방향 갭 10:54 (#884)
- **심각도:** medium — 야간 자율 생산 5일 전면 정지, 데이터 손실·외부 피해 0
- **재발 가능성:** medium — Claude Code UI 문구·스피너는 버전마다 바뀜
- **영향 범위:** 맥미니 claude 야간 워커(무발사) + tmux-repl-busy.sh 소비 레일 전반(bonjin/macmini 워커 4종·리뷰 라우터 2종·idle-auto-resume·chatbot-monitor·workflow-audit)

## 증상
7/13 밤부터 5일간 야간 자율 레일이 일감을 한 건도 안 넣음. 23:00 토글 ON·5분 킥은 매일 정상인데, 워커 로그는 매 틱 "SKIP — REPL busy (양보)"뿐. 실제 맥미니 클로드 화면은 빈 프롬프트 idle.

## 원인
idle 화면에 상시 노출된 Fable 5 프로모션 안내문 "another model to keep working within your remaining limits" 가 busy 정규식의 `Working` 단어 매칭(대소문자 무시·화면 아무 위치)에 걸림. 근본 원인은 "상태표시줄 구조가 아니라 단어 존재로 busy 를 판정"하는 설계 — 동계열 전례(2026-06-15 "clear to save tokens" 힌트 오탐)를 제외필터로만 지엽 수리해 구조적 원인이 존치됐던 것. 부수: 양보는 정상 경로라 경보 0 = 5일 침묵 기아.

## 조치
① PR#882 (main `eadae3f`): busy 동사를 스피너+동사+경과시간 구조 앵커로 이관, 당일 맥미니 화면 원본 fixture 화.
② 당일 역방향 갭(실작업 중을 idle 로 오판, Escape 끼어들기 위험) 라이브 실측 → PR#884 (main `bd0c1e3`): 스피너 6종+세그먼트 상태줄 커버, 한국어 불릿 산문 제외.
③ 맥미니 pull·라이브 이중대조 실측(idle rc=1 / busy rc=0).
④ 워치독 잔존 구식 패턴은 T-260718-020 이월.

## 예방 (Forcing function 우선)
같은 실수(단어 매칭 busy 판정)가 코드로 다시 들어오면 실캡처 기반 회귀 fixture 가 잡는다.

- **막을 코드/훅:** `claude-automations/scripts/tests/test_tmux_repl_busy_fable5.sh` — 실캡처 회귀 fixture 24케이스(프로모 배너 idle·불릿 산문 idle·xhigh 세그먼트 busy 등), PR#882 `eadae3f` + PR#884 `bd0c1e3`
- 추가(등재됨): Gate3 연속 busy-양보 장기화(예: 48h) 시 경보 1통 — "정상 양보"의 침묵 기아 조기 표면화. task = T-260718-022 (2026-07-18 아니키 GO).

## 재발 이력


## 관련 링크
- PR: ssamssae/claude-automations#882, #884
- task: T-260718-006 · T-260718-010 · T-260718-020 (워치독 패턴 정렬 후속) · T-260718-022 (연속 양보 경보)
- 전례: 2026-06-15 tokens 힌트 오탐 (macmini-claude-worker.sh Gate3 주석)
