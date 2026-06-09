# 2026-05-18 — WSL cc 좀비 사고 (nightly-update atomic swap 충돌)

## 발생

2026-05-18 07:23 KST 경, 🪟 WSL. 형님이 WSL 터미널에서 `cc` 쳤는데 챗봇 안 뜸. 🖥 데스크탑3060Ti 가 SSH 로 WSL 진단:
- `/usr/bin/claude` symlink 부재
- `/usr/lib/node_modules/@anthropic-ai/claude-code/` 디렉토리 통째로 비어있음
- `npm ls -g` 메타에는 `@anthropic-ai/claude-code@` 가 버전 빈 채로 등록 (좀비)
- 형님이 `sudo npm uninstall + install` 로 직접 복구 (ENOTEMPTY 도중 떴으나 메인 흐름 완주, 2.1.143 회복)

## 원인 (본진 SSH 로 WSL nightly-update log 직접 확인)

`~/.claude/automations/logs/claude-code-nightly-update.log` 핵심 라인:

```
=== 2026-05-11 07:15:20 KST (Linux) === cc session active, skipping this run
... (5/11~5/17 매일 가드 발동 — skip)
=== 2026-05-18 07:19:37 KST (Linux) ===
npm prefix: /usr
npm prefix not user-writable; using sudo -n (NOPASSWD rule detected)
before: 2.1.132 (Claude Code)
changed 2 packages in 11m
after: 2.1.143 (Claude Code)
ok
```

타임라인:
1. WSL systemd timer 가 매일 07:15 KST 경 `claude-code-nightly-update.sh` 자동 실행
2. 가드 = `tmux has-session -t=claude` 활성 시 skip (in-process updater 대신 cron 방식으로 atomic swap 안정성 확보 — 메모리 [[feedback_cc_dies_after_autoupdate]] 박힘)
3. 5/11~5/17 매일 가드 발동해서 skip → 무사
4. 오늘 5/18 07:19:37 KST 에는 WSL tmux 'claude' 세션 **부재** (형님이 WSL 재시작했거나 새벽 어느 시점 cc 종료) → 가드 안 잡힘 → 실행 진입
5. 업데이트 11분 소요 (2.1.132 → 2.1.143), 07:30:37 KST 경 종료 추정
6. 형님이 07:23 KST 경 `cc` 시도 — 정확히 atomic swap 중간 phase. npm 이 기존 디렉토리 임시 백업으로 rename 한 직후 + 새 디렉토리 mv 전 = 빈 디렉토리 + symlink 부재 = 형님이 본 좀비
7. 형님 sudo npm uninstall + install 가 nightly-update 의 npm 과 동시 진행 → ENOTEMPTY 충돌, 그러나 둘 다 메인 흐름은 끝까지 진행 → 결과 동일 (2.1.143)

## 기존 알려진 사고와의 관계

- `feedback_cc_dies_after_autoupdate.md` 메모리는 **in-process updater** (cc 자체가 idle 시점에 자기 업데이트하는 패턴) 가 stub-binary 죽이는 현상 박은 것 → 대응 = DISABLE_AUTOUPDATER=1 + cron 방식 nightly-update.sh
- 오늘 사고는 cron 방식이 작동했지만 **cc 세션 부재 윈도우가 열린 케이스** — 가드 자체는 의도대로 동작했지만 윈도우 안에서 형님 cc 시도가 atomic swap 과 충돌

## 재발 방지 옵션

(가) **WSL systemd timer 시간 조절** — 가장 단순. 현재 매일 07:15 KST 에 실행, 형님 7-8시 cc 사용 시간대와 겹침. 새벽 4시 또는 점심 시간대 (예: 13:00) 로 옮기면 cc 세션 active 보장 확률 ↑. `systemctl --user edit claude-code-nightly-update.timer` 수정. 비가역 환경 변화라 형님 ack 필요.

(나) **가드 강화** — `nightly-update.sh` 시작 시 tmux session 부재여도 npm 락 파일 (`/usr/lib/node_modules/.staging` 존재 등) 추가 검사, 또는 update 진행 중 lock 파일 박아 형님 cc 시도 차단. 코드 변경, 형님 ack 필요.

(다) **본 issue 박기** — 자율 진행 (지금 이 파일). 재발 시 (가)/(나) 근거 됨.

## 본진 자율 처리
- (다) 본 issue 박음 (이 파일)
- 데스크탑3060Ti 에 1.5차 reverse reply 송신 완료 (`/tmp/desktop3060ti-reverse-reply-wsl-cc-zombie.txt`)
- 강대종 텔레그램 2차 reply 완료 (msg id 19128)
- (가)/(나) 는 형님 ack 받아 진행 — 형님이 cc 사용 시간대 알려주면 timer 시간 산정

## 검증 / 후속

- 다음 nightly-update 실행 시점 (5/19 07:15 KST 추정) 에 cc 세션 active 면 skip 정상 작동 확인
- 만약 또 cc 세션 부재로 실행 진입하면 (가)/(나) 적용 우선순위 ↑
- (가) 적용 후 5/19~5/25 일주일 무사고면 fix 완료 표시
