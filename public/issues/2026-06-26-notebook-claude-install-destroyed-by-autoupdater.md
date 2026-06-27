# 노트북 claude 설치 파손 — in-process 자동업데이터 mid-swap bin 소실 (WSL 부팅)

- 날짜: 2026-06-26 (KST)
- 노드: 💻 노트북 (notebook3060, <desktop-host>, WSL2)
- 증상: 노트북 claude 텔레그램 브릿지 route_unhealthy → escalate 반복. 추적하니 claude 설치 자체가 파손.

## 타임라인
1. 노트북 부팅(18:29) 후 claude CLI 가 새 온보딩 프롬프트("Try the new fullscreen renderer?")에 멈춤 → SessionStart sidecar 미등록 → route_unhealthy. Esc 로 닫아 일시 route-ok.
2. ~18:55 재발. claude in-process 자동업데이트("Auto-updating…")가 라이브 세션 중 atomic swap 실패 → **bin/claude.exe·패키지 소실**(gutted). `~/.npm-global/bin/claude` 정상 심볼릭 소실, 실패 staging 명(`.claude-HqMVuNTZ`)만 잔존, 패키지 내 `.claude-code-DycUbYqO` orphan staging.
3. claude-tmux.service 재시작해도 binary 없어 세션 생성 실패 → tmux default 서버 down → route_escalate("no server running").

## 근본 원인
노트북에 **DISABLE_AUTOUPDATER=1 보호가 없었음** → claude in-process 자동업데이터 동작 → WSL 라이브 세션 중 swap 실패로 bin 소실(메모리 [[reference_claude_autoupdate_infra]] 의 "182회 사고" 패턴). 정본 인프라(야간 update 스크립트 + DISABLE_AUTOUPDATER)가 노트북엔 미적용이었던 갭.

## 복구 (2026-06-26, 전부 가역)
1. 깨진 패키지/staging 백업 격리(.broken / .orphan-bak).
2. peer(데스크탑 desktop3060ti, WSL linux-x64, v2.1.193)에서 tar 복제(맥미니 relay, 240MB): `ssh desktop 'tar cf - -C ~/.npm-global/lib/node_modules/@anthropic-ai claude-code'` → `ssh notebook 'tar xf - -C ...'`.
3. bin 심볼릭 재생성: `ln -sf ../lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe ~/.npm-global/bin/claude`.
4. `claude --version` = 2.1.193 OK.

## 재발방지 (적용)
노트북 `~/.config/systemd/user/claude-tmux.service.d/override.conf` 에 `Environment=DISABLE_AUTOUPDATER=1` 추가 + daemon-reload + restart. claude CLI `/proc/<pid>/environ` + tmux-g 반영 확인.

## 미해결 / 후속
- **브릿지 route 잔여 fragility**: claude 바이너리 복구 후에도 route_failed("no SessionStart sidecar entry for tmux pane; proc-fd/pane-tty/latest-project-jsonl 모두 none") 지속. 원인은 binary 아님 — idle claude 세션은 transcript 가 없어(session-start 로그 전부 transcript_exists:false) 브릿지가 pane↔세션 매핑 실패. 브릿지 재시작으로 안 풀림. 세션에 실제 대화 활동 생기면 풀릴 가능성, 아니면 브릿지 route 로직(idle 세션 sidecar 등록) 수정 필요. 다중 재시작은 효과 없고 세션 churn 만 유발 → 중단함.
- ⚠️ **Fleet 갭**: 데스크탑(desktop3060ti) 실행 중 claude `/proc/<pid>/environ` 엔 DISABLE_AUTOUPDATER 가 **없었음**(override 파일은 claude-chatbot.service 에 있으나 실 프로세스 미반영). 5노드 전부 "claude 프로세스 environ 에 실제 effective 한가" 감사 필요 — 안 그러면 다른 노드도 동일 파손 가능.

## 교훈
- route_unhealthy 표면 뒤 근본(binary 파손)까지 파야. 세션 안 뜸 → binary 확인.
- "설정 파일에 있음" ≠ "실 프로세스 environ 에 있음". `/proc/<pid>/environ` 으로 검증.
- 안 듣는 재시작 반복 금지 — 효과 확인되면 멈추고 근본/핸드오프로.
