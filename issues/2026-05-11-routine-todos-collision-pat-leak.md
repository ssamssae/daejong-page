---
prevention_deferred: null
---

# Anthropic Cloud routine 이 /todo 스킬 파일경로에 매일 commit + prompt 안 GitHub PAT 평문 노출

- **발생 일자:** 2026-05-10 05:04 KST (첫 가시 충돌, 매일 새벽 5시 반복)
- **해결 일자:** 2026-05-11 09:35 KST (routine #1 disabled + prompt redacted + 오늘 todos 봉합 + 4기기 sync)
- **심각도:** medium (데이터 손실 0. 다만 PAT 평문 노출은 high.)
- **재발 가능성:** medium (routine 재활성화 시 같은 문제, 다른 routine 도 같은 패턴 가능)
- **영향 범위:** Anthropic Cloud routines, daejong-page/todos, /todo 스킬, GitHub OAuth 토큰

## 증상

1. `~/daejong-page/todos/YYYY-MM-DD.md` 가 매일 origin 에 8줄 newsletter 소재 commit (작성자 = GitHub noreply email). 본진 /todo 스킬은 같은 경로에 262줄 정상 todos untracked. 매일 충돌.
2. 충돌 분석 중 routine #1 prompt 안 GitHub PAT(gho_*) 평문 발견. 검증 HTTP 200 → 토큰 여전히 유효.

## 원인

1. **중복 routine 2개** — `뉴스레터-소재-수집` (#1, GitHub API PUT) + `뉴스레터 소재 자동 수집 (매일 05:00 KST)` (#2, 텔레그램 surface only). 강대종이 #1 만들 때 #2 존재 모름. cron 같은 시간, 일부 목적 겹침.
2. **routine prompt 안 secret hardcode** — 환경변수/secret store 패턴 미사용. 토큰이 5곳(routine config + 클라우드 세션 로그 + jsonl + transcript + 채팅) 잔류.
3. **파일경로 협의 0** — routine 이 `/todo` 스킬 관리 경로(`todos/YYYY-MM-DD.md`) 그대로 사용. 도메인 충돌. routine 작성자가 /todo 스킬 존재 모름.

## 조치

1. routine #1 `enabled: false` (RemoteTrigger update HTTP 200)
2. routine #1 prompt 전체를 비활성 안내문 + PAT 자리를 `REVOKED_2026-05-11` 문자열로 교체. 재활성화돼도 GitHub 쓰기 X.
3. 2026-05-11 todos 봉합 — local 262줄 + origin 8줄 newsletter 를 `## 뉴스레터 소재 (auto-collected)` 섹션으로 흡수, commit/push.
4. 4기기 (WSL/Mac mini/Desktop/Hermes) claude-skills HEAD 동기화 (`682c73f`).
5. PAT revoke 는 todos 등재 (퇴근 후 OAuth app revoke + 재인증).

## 예방 (Forcing function 우선)

1. **새 routine 생성 전 자동 dedup 점검** — `/schedule create` 호출 시 기존 routine list 와 cron + 목적 키워드(prompt 첫 50자) 비교. ≥ 80% 유사도면 "기존 routine X 와 중복 가능. 그대로 진행? 또는 X 갱신?" 사용자 컨펌 강제.
2. **routine prompt 토큰 평문 금지 — 정책 + 검증 훅** — `/schedule` 스킬에 pre-create validator 추가. body 안 `gho_/ghp_/github_pat_/AKIA/sk-/Bearer` 패턴 grep 잡히면 거절 + 환경변수 패턴 안내.
3. **/todo 스킬에 same-path 외부 commit 감지** — /todo 가 `todos/YYYY-MM-DD.md` 쓰기 전 `git log --since="1 day ago" -- todos/...` 으로 외부 commit 점검. 있으면 차이 surface + 사용자 컨펌 후 merge.
4. **메모리 신규 엔트리** — `feedback_routine_no_hardcoded_secrets.md` ("Anthropic Cloud routine prompt 에 토큰/시크릿 평문 금지. 환경변수 패턴 또는 secret reference만 사용.")

## 재발 이력

_(없음)_

## 관련 링크

- routine: `trig_01AYfeGw8CC1vzkpL7QNmcUJ` (`뉴스레터-소재-수집`, disabled+redacted)
- 유지 routine: `trig_01RwLsU4z1BoJ1JHLRPFFbiX` (`뉴스레터 소재 자동 수집 (매일 05:00 KST)`, 텔레그램 surface only)
- 봉합 commit: daejong-page `todos/2026-05-11.md` (+264/-3)
- 관련 이슈: `2026-04-21-mac-wsl-todos-desync.md` (구조 유사 — 두 writer 동일 경로, 다른 원인)
- 텔레그램 스레드: 15510~15577 (2026-05-10 21:35 ~ 2026-05-11 02:50 KST)
