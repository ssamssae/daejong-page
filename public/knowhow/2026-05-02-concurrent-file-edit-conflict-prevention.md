---
category: 인프라
tags: [multi-device, git, conflict, concurrent, coordination, mac, wsl]
related_issues:
  - 2026-05-02-policy-race-mac-wsl
  - 2026-05-01-wsl-mac-race-skill-edit
---

# 다기기 동시 작업 시 같은 파일 수정 충돌 방지 패턴

- **첫 발견:** 2026-05-01 (Mac + WSL 동시 skill-edit race), 2026-05-02 (CLAUDE.md policy race)
- **재사용 영역:** Mac 본진 + WSL 병렬 작업 시 전반. 특히 globals/CLAUDE.md, globals/AGENT.md 같은 정책 파일, 공유 skill/config 파일 수정 시.

## 한 줄 요약

두 작업자(Mac 본진·WSL)가 같은 파일을 31분 안에 각각 수정하면 git merge 충돌 0이어도 **의미적 race** 가 발생한다. `git merge --no-conflict` 는 안전성 보증이 아니다. **작업 시작 전 파일 선언 + 중복 감지 + 즉시 중단** 3단계가 충돌 방지의 전부다.

## 3단계 충돌 방지 패턴

### 1단계: 작업 시작 전 선언

작업 시작 시 텔레그램 1통:
```
[작업자: WSL]
[작업명: parking-lot-4tasks]
[브랜치: wsl/parking-lot-4tasks-2026-05-03]
[수정 예정 파일]
- knowhow/2026-04-26-*.md (신규)
- newsletter/ep-draft-plan-c-automation.md
```

### 2단계: 중복 감지

작업 시작 전 git fetch 후 확인:
```bash
# 상대방이 최근 수정한 파일 목록
git log origin/main..origin/HEAD --name-only --format="" 2>/dev/null | sort -u

# 또는 로컬: 다른 wsl/* 브랜치들이 건드린 파일 확인
git diff main...origin/wsl/other-branch --name-only
```

내 수정 예정 파일과 겹치는 파일이 있으면 → **3단계**.

### 3단계: 겹치면 즉시 중단 + 강대종 확인

임의 병합 시도 금지. 강대종님께 "파일 A가 양쪽 수정 예정인데 어떻게 할까요?" 1줄 질문 후 결정 위임.

## 특히 위험한 파일들

| 파일 | 이유 |
|---|---|
| `globals/CLAUDE.md` | 행동 룰 자체 — 잘못 통합되면 양 기기 행동 기준이 깨짐 |
| `globals/AGENT.md` | 상세 규칙 — CLAUDE.md 와 동일 위험도 |
| `skills/SKILL.md` (핸드오프 등) | 단일 파일이 여러 기기에서 참조 |
| `todos/YYYY-MM-DD.md` | Mac SoT, WSL 이 직접 쓰면 충돌 |

## 브랜치 분리 원칙

```
Mac 본진: mac/<task-name>-YYYY-MM-DD
WSL      : wsl/<task-name>-YYYY-MM-DD
```

- 브랜치가 달라도 **파일이 같으면** race 가능 → 브랜치 분리만으로 안전 X
- 선언 + 중복 감지가 실질적 보호

## 사후 처리

race 가 발생해서 git history 에 두 버전이 공존하면:
1. canonical 버전 결정 (강대종)
2. `git revert` 또는 `git merge -Xours` 로 명시적 통합
3. 통합 이유 commit message 에 기록

## 함정

- `git merge --no-conflict` 가 됐어도 두 변경이 **의미적으로 충돌**할 수 있음 (정책 섹션 제거 + 다른 정책 섹션 추가 = 내용 충돌, git 은 모름)
- PR squash merge 는 base 를 최신으로 가져가서 충돌이 자동 해소되는 것처럼 보이지만, 덮어쓴 쪽 작업이 사라짐

## 관련 이슈 (포스트모템)

- `issues/2026-05-02-policy-race-mac-wsl.md` — CLAUDE.md 동시 수정 사고
- `issues/2026-05-01-wsl-mac-race-skill-edit.md` — skill 파일 동시 수정 직전 사고
