---
prevention_deferred: null
summary: "Codex 응답이 codex-session-relay 때문에 본진 채팅에 중복 미러링되어 화면이 어지러워진 사고"
---

# codex-session-relay가 Codex 응답을 본진 채팅에 중복 미러링

- **발생 일자:** 2026-05-07 21:58 KST (최초) / **2026-05-08 19:20 KST (재발)**
- **해결 일자:** 2026-05-08 00:55 KST (1차) / **2026-05-08 20:22 KST (2차)**
- **심각도:** ~~medium~~ → **high** (재발로 격상)
- **재발 가능성:** ~~low~~ → **high** (자동화 작업 중 실수 재기동 패턴 확인)
- **영향 범위:** 본진(@MyClaude) 텔레그램 채팅

## 증상
Codex가 텔레그램으로 응답할 때마다 `🏭 Codex→Claude: "..."` 형태로 본진 채팅에 동일 내용이 중복 전송됨.

## 원인
Mac mini의 `com.user.codex-session-relay` launchd job(Python)이 `~/.openclaw/logs/gateway.log`를 tail -f로 감시하다가 Codex 응답 감지 시 SSH mac 경유 → 본진 텔레그램에 재전송. 2026-05-07 21:58경 생성된 것으로 추정.

## 조치
Mac mini에서 `launchctl bootout + disable gui/$(id -u)/com.user.codex-session-relay` 실행.
`com.user.codex-relay-daemon`도 동시에 disable (당시 이미 멈춰있었음).

## 예방 (Forcing function 우선)
Mac mini에 `com.user.codex-*` 패턴 신규 launchd job 생성 시 본진 텔레그램 채널 영향 여부 강대종 명시 승인 후 등록. 생성 전 `launchctl list | grep codex` 로 기존 job 목록 확인 필수.

## 재발 이력

### 2차 재발 — 2026-05-08 19:20 KST
- **재발 원인:** 본진 Claude가 3-way 라우팅 Task A 수행 중 `codex-session-relay.py`를 비활성화 상태인 줄 모르고 수동 재기동 (`nohup python3 ... &`). 이미 PID 83358로 실행 중이던 프로세스도 있었고, 추가로 84313을 기동하며 중복 실행 상태 진입.
- **조치:** `pkill -f codex-session-relay.py` + `pkill -f codex-relay-daemon.sh` → all stopped 확인 (20:22 KST)
- **예방 보강:** 본진 메모리에 "codex-session-relay 재기동 금지" 피드백 추가. mac-mini 라우팅 작업 전 `ps aux | grep codex` 체크 의무화.

## 관련 링크
- 텔레그램: 2026-05-08 00:53~00:55 KST 사이 스크린샷 포함 보고 (1차)
- 텔레그램: 2026-05-08 19:20~20:22 KST 재발/수정 (2차)
