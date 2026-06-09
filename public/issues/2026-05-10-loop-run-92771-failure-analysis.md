---
date: 2026-05-10
slug: loop-run-92771-failure-analysis
status: resolved
affected: loop-run.sh (run-92771)
fixed_in: commit 직후 push (~/.claude/automations main)
severity: medium
tasks_failed: t2(wsl), t3(macmini)
summary: "loop-run run-92771 3기기 병렬 루프 중 WSL/맥미니 태스크 FAIL 원인 분석 + 수정 commit"

---

# loop-run run-92771 실패 원인 분석 + 수정

## 배경

Triple-Velocity 3기기 병렬 루프런:
- t1 macbook: rtk 설치 확인 → ✅ SUCCESS
- t2 wsl: agent-msg-notify.sh dedup guard 추가 → ❌ FAIL×2 → 수동 완료
- t3 macmini: 메모요 1.0.4+21 AAB 빌드 → ❌ FAIL×2 → SSH 직접 완료

## t2 실패 원인 — WSL interactive rebase 충돌

### 증상
```
[t2-r0] FAIL: origin HEAD ≠ dedup commit
[t2-r1] FAIL: origin HEAD 불변, dedup 커밋 아님
```

### 근본 원인
WSL이 `wsl/codex-relay-from-wsl-2026-05-08` 브랜치에서 interactive rebase 중이었음.
`scripts/codex-directive.sh` 에서 merge conflict 발생 → git 명령 전체 차단 상태.

loop-run retry는 **동일 명령 그대로 재시도** → 같은 환경에서 같은 실패 반복.

### 수동 복구 경로
```bash
git rebase --abort
git checkout main
git pull --ff-only   # 14커밋 fast-forward
# dedup guard 수동 적용
git commit -m 'fix(agent-msg-notify): add 10s dedup lock...'
git push             # commit e6fa8e5
```

### 미수정 (known limitation)
retry 로직이 환경 상태(git rebase 중 등)를 감지해 복구하는 기능 없음.
→ 향후 개선 포인트: git 관련 wsl task retry 시 `git rebase --abort 2>/dev/null || true` 선행.

---

## t3 실패 원인 — macmini에 소스 없음

### 증상
```
[t3-r0] FAIL: cd ~/simple_memo_app — No such file or directory
[t3-r1] FAIL: 동일 경로 에러 반복
```

### 근본 원인
PLAN이 Android aab = macmini 규칙에 따라 macmini에 배정했으나,
`~/simple_memo_app` 소스는 macbook에만 존재.

PLAN 프롬프트에 "소스 위치 검증" 규칙이 없었고,
retry도 동일 명령 재시도 → 경로 없음 동일 실패.

### trio-vote 결과 (2026-05-10)
A안(rsync 항상 포함) vs C안(pre-check 후 조건부 rsync)
→ C안 2-1 승 (엔지니어+비판론자)

### 수정 내용 (loop-run.sh PLAN 프롬프트)
```
Android aab 빌드(macmini) 필수 선행 규칙:
- 빌드 task 바로 앞에 반드시 pre-check+rsync task를 macbook device로 추가
- 형식: ssh mac-mini test -d ~/[프로젝트폴더] || rsync -az ~/[프로젝트폴더]/ mac-mini:~/[프로젝트폴더]/
- 이 task 없이 macmini Android 빌드 task만 단독 배정 금지
```

### flutter PATH 수정 (macmini case)
`~/flutter/bin` 단독 → `/opt/homebrew/bin:~/fvm/default/bin:~/flutter/bin` 순서로 확장.
Mac mini 실제 flutter 위치: `/opt/homebrew/bin/flutter`

---

## 수동 완료 경로 (t3)

1. macbook에서 rsync → mac-mini: `rsync -az ~/simple_memo_app/ mac-mini:~/simple_memo_app/`
2. SSH nohup 빌드: `ssh mac-mini 'cd ~/simple_memo_app && nohup /opt/homebrew/bin/flutter build appbundle --release > /tmp/memoyo-build.log 2>&1 &'`
3. 결과: app-release.aab 40MB, 2026-05-10 15:42 KST 완료

---

## 교훈

1. **retry = 동일 명령 재시도** → 환경 상태가 변하지 않으면 의미 없음. 환경 복구 step 필요.
2. **PLAN은 소스 위치를 모른다** → 기기 규칙("Android=macmini")만 보고 배정, 실제 파일 존재 여부 미검증.
3. **flutter PATH 기기별 차이** → macmini는 homebrew, wsl은 ~/flutter/bin, 하드코딩 위험.
4. **Codex(OpenClaw) 경유 JUDGE 응답 대기** → 3라운드×3분 = 최대 9분 소모. 단순 실패 판정엔 과함.

## 관련 파일
- `~/.claude/automations/scripts/loop-run.sh` — PLAN 프롬프트 + macmini PATH 수정
- `~/claude-automations/scripts/agent-msg-notify.sh` — dedup guard 추가 (commit e6fa8e5)
