---
category: 멀티기기
tags: [agent-mesh, telegram, 3way, protocol, transport, macbook, wsl, macmini, agent-msg-notify]
related_issues:
  - 2026-05-08-codex-session-relay-telegram-mirror
---

# 3-way 에이전트 메시지 프로토콜 — 버그 패턴과 표준화 규칙

- **첫 발견:** 2026-05-08 (3기기 간 메시지 중복·포맷 파괴·전송 누락 반복)
- **재사용 영역:** MacBook / WSL / Mac mini 간 Telegram 경유 에이전트 명령·결과 교환

## 한 줄 요약

Protocol 헤더(`[🍎→🏭]`)와 Telegram 전송 목적지(token + chat_id)는 **완전히 다른 레이어**다. 이 둘을 혼동하거나 현재 실행 환경(로컬/피어 휴리스틱)으로 목적지를 추론하면 기기가 바뀔 때마다 엉뚱한 곳으로 전송된다.

---

## 핵심 버그 패턴 4개 (2026-05-08 발견 순서)

### 버그 1 — 포맷 위반: 타임스탬프가 프로토콜 메시지 본문에 삽입됨

**증상:** Telegram에 `[🍎→🪟] [명령] 내용 (09:48 KST)` 로 도착  
**원인:** `agent-msg-notify.sh` line 69에서 `MSG`에 `(${TIME})` 추가  
**수정:** `MSG="[${FROM}→${TO}] [${TYPE}] ${SUMMARY}"` — 타임스탬프 완전 제거

**엄격 포맷 (유일하게 허용되는 형식):**
```
[🍎→🪟] [명령] 내용
[🍎→🪟] [결과] 내용
[🪟→🏭] [알림] 내용
[🏭→🍎] [상태] 내용
```
허용 type: `명령 결과 알림 상태` 4종만. 그 외 → exit 1.

---

### 버그 2 — 중복 전송: 동일 메시지가 n회 전송됨

**증상:** 같은 `[명령]`이 Telegram에 2~3회 도착  
**원인:** 동시 호출 시 뮤텍스 없음 (재시도 루프, 레이스 컨디션)  
**수정:** `/tmp/agent-msg-lock/<hash>.lock` 파일 — 동일 (from, to, type, 내용) 3초 내 재호출 차단

```bash
LOCK_KEY=$(printf '%s' "${FROM_NORM}-${TO_NORM}-${TYPE}-${SUMMARY}" | md5sum | cut -c1-8)
LOCK_FILE="$LOCK_DIR/${LOCK_KEY}.lock"
if [[ -f "$LOCK_FILE" ]]; then
  LOCK_AGE=$(( UNIX_TS - $(cat "$LOCK_FILE" 2>/dev/null || echo 0) ))
  [[ $LOCK_AGE -lt 3 ]] && exit 0  # dedup
fi
echo "$UNIX_TS" > "$LOCK_FILE"
```

---

### 버그 3 — 상태머신 미완성: 전송 실패해도 COMPLETED

**증상:** Telegram 전송이 실패해도 상태 파일이 COMPLETED로 기록됨  
**원인:** curl 실패를 무시하고 상태를 무조건 resolve  
**수정:** 전송 성공(`curl exit 0`) 이후에만 COMPLETED, 실패 시 FAILED 기록

```bash
if curl -sS -m 5 ... > /dev/null 2>&1; then
  # COMPLETED: pending 파일 삭제
  [[ "$TYPE" == "결과" ]] && rm -f "$STATE_DIR/${STATE_KEY}-pending.json"
else
  # FAILED: 상태 파일 업데이트
  printf '{"status":"FAILED",...}' > "$STATE_DIR/${STATE_KEY}-pending.json"
  exit 1
fi
```

---

### 버그 4 (가장 중요) — Protocol identity ≠ Transport routing

**증상:** `[🏭→🍎] [결과]` 헤더는 올바른데 실제로 MacBook 봇 채팅이 아닌 곳으로 전송됨  
**원인:** token 선택을 "현재 기기 == TO 기기인가?" 휴리스틱으로 처리

```bash
# 기존 (잘못된 패턴)
if [[ "$TO_NORM" == "$LOCAL" ]]; then
  TOKEN="${TELEGRAM_BOT_TOKEN:-}"   # 로컬 봇 토큰
else
  TOKEN="${TELEGRAM_PEER_BOT_TOKEN:-}"  # 피어 봇 토큰
fi
# → 어느 기기에서 스크립트가 실행되는지에 따라 결과가 달라짐
```

**수정: Layer 1 / Layer 2 완전 분리**

```bash
# Layer 1 — Protocol identity (메시지 헤더, 불변)
MSG="[${FROM}→${TO}] [${TYPE}] ${SUMMARY}"

# Layer 2 — Transport routing (실행 환경 완전 무관, TO 이름만 보고 결정)
case "$TO_NORM" in
  macbook|mac|본진)
    SEND_TOKEN="${TELEGRAM_BOT_TOKEN_MACBOOK:-}"
    SEND_CHAT="${TELEGRAM_CHAT_ID_MACBOOK:-${TELEGRAM_CHAT_ID:-538806975}}"
    ;;
  wsl)
    SEND_TOKEN="${TELEGRAM_BOT_TOKEN_WSL:-}"
    SEND_CHAT="${TELEGRAM_CHAT_ID_WSL:-${TELEGRAM_CHAT_ID:-538806975}}"
    ;;
  macmini|mini)
    SEND_TOKEN="${TELEGRAM_BOT_TOKEN_MACMINI:-}"
    SEND_CHAT="${TELEGRAM_CHAT_ID_MACMINI:-${TELEGRAM_CHAT_ID:-538806975}}"
    ;;
  *) echo "ERROR: unknown destination '$TO_NORM'" >&2; exit 1 ;;
esac
```

**핵심 원칙:**
> Protocol 헤더는 논리 라우팅의 출처.  
> Telegram 메타데이터는 전송 레이어일 뿐.  
> 절대로 Telegram sender/chat context에서 Protocol identity를 역추론하지 말 것.

---

## 공유 안 되는 버그 반복 방지 — 3기기 동기화 체계

이 프로토콜의 반복 버그는 **3기기가 각자 스크립트를 수정하면서 서로 다른 버전을 실행**하기 때문.

### 해결 원칙

1. **SoT(Source of Truth): `~/.claude/automations` git repo + `main` 브랜치**
2. **수정 후 즉시 `git push`** — 수정한 기기 책임
3. **다른 기기는 `git pull` 또는 `scp` 로 sync** — 작업 시작 전 항상
4. **Mac mini는 git pull 경로 불안정** → `scp` fallback 사용:
   ```bash
   scp ~/.claude/automations/scripts/agent-msg-notify.sh mac-mini:~/.claude/automations/scripts/
   ```

### 각 기기 env 파일 필수 변수

`~/.claude/channels/telegram/.env` — 3기기 모두 동일하게 유지:

```bash
TELEGRAM_BOT_TOKEN_MACBOOK=<맥북봇토큰>
TELEGRAM_BOT_TOKEN_WSL=<WSL봇토큰>
TELEGRAM_BOT_TOKEN_MACMINI=<맥미니봇토큰>
TELEGRAM_CHAT_ID=538806975          # 사용자 Telegram ID (공통)
```

Layer 2 분리 이후 `TELEGRAM_BOT_TOKEN` / `TELEGRAM_PEER_BOT_TOKEN` 는 불필요.  
단, 하위호환 fallback으로 유지해도 무방.

---

## 상태머신 요약

```
명령 전송 → WAITING_RESULT 파일 생성 (/tmp/agent-msg-state/{from}-{to}-pending.json)
결과 전송 성공 → COMPLETED (파일 삭제)
결과 전송 실패 → FAILED (파일에 status 업데이트)
타임아웃/FAILED 후 재전송 방지 → 미구현 (로컬 /tmp 기반, 크로스기기 sync 없음)
```

크로스기기 상태 추적(맥미니가 명령 보내고 맥북이 결과 처리)은 현재 미지원.  
같은 기기 내 명령→결과 페어링만 추적 가능.

---

## 검증 체크리스트

수정 후 반드시 5단계 순차 검증:

1. `bash agent-msg-notify.sh macbook wsl debug "테스트" 2>&1` → `exit 1` + ERROR 메시지
2. `MSG` 변수에 KST 없는지 확인 (`echo "$MSG" | grep -q KST && echo FAIL || echo PASS`)
3. 동일 인자 3초 내 2회 호출 → 두 번째는 `(dedup: ... skipping)`
4. `명령` 후 `/tmp/agent-msg-state/*-pending.json` 생성 확인
5. `결과` 후 pending 파일 삭제 확인

---

## SoT 파일

`~/.claude/automations/scripts/agent-msg-notify.sh` (main 브랜치)
