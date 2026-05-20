# context-show 본진 자기 자신 trigger 시 손0 원칙 위반

**발생 시각**: 2026-05-20 09:47 KST (msg id ~20308 형님 surface)
**노드**: 🍎 본진
**스킬**: `~/claude-skills/context-show/SKILL.md`

## 증상

형님이 텔레그램에서 "컨텍스트" 발화 → 본진 챗봇이 nohup 3초 detached send-keys 로 자기 자기 tmux 에 `/context` 박음 → 본진 tmux 안에서 /context 출력 + 도미노 그래프 박힘 → 그런데 **본진 챗봇이 그 stdout 을 받으려면 다음 turn 이 발생해야 함**. 다음 turn 발생 = 형님이 추가 발화 1통 박아야 함. 형님이 발화 안 하면 stdout 영원히 capture 안 됨 → % forward 발사 X.

= **손0 원칙 위반**. 자동화 길에서 형님 추가 행동 ("아무말이나 채팅") 필요.

## 함정의 원인

context-show 스킬 절차 (1)(2) 가 **비동기 nohup 3초 detached + 다음 turn stdout capture** 패턴. 이 패턴은 본진 자기 자신 trigger 시 다음 turn 자동 트리거 메커니즘 0:
- 본진 챗봇 자체는 turn 끝나면 idle
- send-keys 박은 /context 결과가 tmux 안에 박히지만 본진 챗봇 입장에서는 별 신호 X
- 다음 user input 또는 외부 wake-up signal 없으면 다음 turn 진입 X

다른 노드 / 텔레그램 → 본진 trigger 케이스에서는 mac-report 또는 directive paste 가 본진을 깨우므로 자연스럽게 다음 turn 진입. 자기 자신 trigger 만 stuck.

## fix 옵션 (다음 사이클 형님 결정)

### (A) 같은 turn 동기 처리

Bash 안에서 send-keys 박고 sleep 5 후 `tmux capture-pane -p -t <pane> -S -300` 박아 scrollback 읽고 % 추출 + 텔레그램 reply 1통. 다음 turn 기다림 0.

**위험**: 본진 챗봇이 실행 중인 pane (`$TMUX_PANE`) 에 send-keys 박으면 self-feedback — 본 turn 의 user input 으로도 박힐 위험. 별 pane 식별 필요. 첫 attached pane = 본진 챗봇이 attached 면 자기 자신.

### (B') ScheduleWakeup 60s 박기

옛 nohup 3초 detached 패턴 그대로 + 같은 turn 안 ScheduleWakeup `delaySeconds=60` 박아 1분 후 자기 turn 자동 trigger. 그 turn 에서 마커 + stdout capture + forward.

**장점**: self-feedback 위험 0, 형님 손0
**단점**: 1분 delay (즉시 응답 X), ScheduleWakeup 큐 추가

### (C) 다른 메커니즘

file 기반 fire-and-poll, 외부 launchd, 또는 본진 자기 자신 인지 시 (A) 시도 + 실패 시 (B') fallback 등 더 정교한 패턴.

## 임시 우회 (fix 전까지)

형님이 "컨텍스트" 발화 후 본진 챗봇이 nohup fire + 텔레그램 "발사. 다음 turn capture 예정" 안내 → 형님이 추가 발화 1통 ("ㅇ" 한 글자도 OK) → 본진 챗봇 다음 turn 진입 → stdout capture → % forward.

## 추천 fix

**(B') ScheduleWakeup 60s** — 단순함 + 안전. 같은 turn 안에서 nohup fire + ScheduleWakeup 60s 박으면 형님 손0 + self-feedback 0 + 1분 delay 만 부담. (A) 는 self-feedback 위험 + pane 식별 복잡도라 후순위.

## 적용 (2026-05-20, 옵션 C 채택)

형님 결정 = **(C) nohup 백그라운드 fire**. ScheduleWakeup (B') 은 챗봇 turn 추가 = API 호출 = Anthropic 토큰/비용 회색지대 (ScheduleWakeup 이 /loop dynamic 모드 도구라 회피). context-show 는 "% 한 줄" 만 필요해 LLM 의미 처리가 불필요하므로 C 가 최적.

조치:
- `~/claude-skills/context-show/fire.sh` 신설 — bash 가 send-keys /context → sleep → capture-pane → % 추출 (괄호 안 % 우선) → telegram sendMessage 직접 forward 전부 처리. LLM turn 추가 0.
- `~/claude-skills/context-show/SKILL.md` C 방식 재작성 — 챗봇은 (a) 안내 reply 1통 + (b) nohup fire 1번만. "다음 turn capture" 흐름 + 마커 파일 완전 제거 → self-trigger stuck 근본 제거.
- 검증: 형님 "컨텍스트" 발화 → ~8초 후 `🍎 16%` 도착 (실제 % 추출 정확도는 첫 실사용 시 확인).

## 관련 메모리

- [[feedback_user_hands_off_when_automation_exists]] — 손0 원칙
- 본 스킬 SKILL.md (2026-05-20 fix 예정) — 자기 자신 trigger / 다른 노드 trigger 분기 명문화
