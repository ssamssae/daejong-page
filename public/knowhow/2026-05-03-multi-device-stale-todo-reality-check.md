---
category: 멀티기기
tags: [multi-device, todos, stale, reality-check, mac-wsl, parallel, preflight]
first_discovered: 2026-04-21
related_issues:
  - 2026-04-21-mac-wsl-todos-desync
---

# 멀티기기 환경에서 할일 추천·편집 전 reality check — stale 상태 추천 차단

- **첫 발견:** 2026-04-21 (Mac 이 WSL 에서 이미 완료된 작업을 stale todos 기반으로 오추천)
- **재사용 영역:** Mac/WSL 양기기 병렬 운영 + 한쪽이 todos 미갱신 상태로 작업 진행 시 모든 시나리오

## 한 줄 요약

한 기기가 코드 작업을 완료해도 todos 에 기록을 안 남기면, 다른 기기가 stale todos 를 읽고 이미 끝난 일을 다시 추천·착수하는 **"stale-on-stale" 이중 사고**가 발생한다. 할일 추천·조회 전에 `git pull` + `gh repo list` reality check 를 의무화하고, 코드 레벨 완료 이벤트 시 자동 todos 업데이트 트리거가 근본 방지책이다.

## 언제 쓰는가

- Mac/WSL 중 한쪽이 먼저 작업을 완료했을 때 다른 쪽에서 할일 추천을 받는 상황
- `~/daejong-page/todos/YYYY-MM-DD.md` 를 기반으로 "오늘 뭐 하지?" 물어볼 때
- 신규 repo 생성, OAuth 연동 등 todos 외부에서 직접 상태가 바뀌는 작업 후
- 양기기 병렬로 같은 프로젝트에 붙는 임의 시점

## 절차 (Preflight 체크리스트)

### A. todos 최신화 (항상 먼저)

```bash
cd ~/daejong-page && git pull --rebase
```

다른 기기가 push 한 완료 기록이 반영된 상태에서만 추천 진행.

### B. 최근 24h repo activity 확인

```bash
gh repo list <OWNER> --limit 20 --json name,pushedAt,description \
  | jq '[.[] | select(.pushedAt > (now - 86400 | todate))]'
```

열린 todos 의 키워드와 최근 push 된 repo 이름이 겹치면 "다른 기기가 이미 진행 중" 경고 → 사용자에게 먼저 알리고 확인 후 추천.

### C. "이미 완료" 판단 기준

최근 24h 이내 해당 repo/기능에 commit 이 있으면:
1. todos 파일에 완료로 표시
2. 사용자에게 "이미 끝난 것 같습니다. 확인해 주세요" 한 줄 표시
3. 그 할일은 추천 목록에서 제외

## 역방향 강제 — 코드 완료 시 todos 트리거

WSL 이 자율 코딩 완료 후 todos 갱신을 까먹는 패턴 차단:

- `gh repo create`, `git push origin main`, `gh pr merge` 등 **실제 세계 상태를 바꾸는 명령** 완료 시
- 현재 열린 todos 의 키워드와 매칭되는 항목이 있으면 텔레그램 1줄 알림: `"[repo명] 완료로 표시할까요?"`
- 사용자 `y` 응답 시 → Mac 에 라우팅해서 todos 갱신

## 함정

- `git pull` 없이 로컬 todos 만 읽으면 이미 다른 기기가 완료로 표시한 항목도 열린 것으로 나옴.
- WSL 이 사용자 발화 없이 자율적으로 작업하면 "완료 발화" 이벤트가 없어서 라우팅 트리거 자체가 안 걸린다 — 코드 레벨 완료 이벤트 감지가 더 안전.
- Mac 이 stale todos 기반으로 유도 질문(A/B 선택 등)을 만들어 사용자 답을 받아버리면, 실제로는 이미 결정된 사안을 재결정하는 기이한 상황이 발생.
- todos 추천 직전에 `git pull` 을 안 하면 3~4커밋 뒤처진 상태로 추천 — 특히 당일 아침 첫 세션에서 자주 발생.

## 관련

- issues 원본: `2026-04-21-mac-wsl-todos-desync.md`
- 메모리: `feedback_stale_check_before_recommend.md` — "뭐할까" 받으면 step 0 git pull
- 패턴 연관: `2026-05-02-policy-race-mac-wsl` — 같은 파일 동시 수정 race 방지 패턴도 참고
