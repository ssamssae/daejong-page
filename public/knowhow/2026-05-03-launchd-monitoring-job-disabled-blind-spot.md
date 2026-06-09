---
category: 자동화
tags: [launchd, macos, monitoring, alerting, plist, disabled, blind-spot, automation-ops]
first_discovered: 2026-04-26
related_issues:
  - 2026-04-26-review-status-disabled-blind-spot
  - 2026-04-21-launchd-silent-job-dropout
---

# 모니터링·알림 launchd 잡은 리소스 절감 잡과 같은 바구니에 비활성화하면 안 된다

- **첫 발견:** 2026-04-26 (Apple 심사 issue 메일 17h 누락 — `review-status-check` 가 `_disabled/` 에 방치됨)
- **재사용 영역:** macOS launchd LaunchAgent 로 자동화를 운영하는 모든 환경

## 한 줄 요약

토큰·리소스 절감 목적으로 launchd 잡을 `_disabled/` 폴더에 묶어 끌 때, **모니터링·알림·헬스체크 잡까지 같이 끄면** 외부 신호(Apple 심사 메일, Google Play 알림 등)가 도착해도 아무도 모른다. plist 파일 존재 ≠ 잡 활성.

## 사고 패턴

```
리소스 절감 결정
    ↓
com.claude.*.plist 전체 → _disabled/ 이동 (의도적)
    ↓
며칠 후 외부 이벤트 발생 (Apple 심사 issue, Play 정책 알림 등)
    ↓
모니터링 잡이 꺼져 있어 텔레그램 알림 0
    ↓
첫 번째 실 이벤트에서 비로소 "알림 안 왔네" 인지
    ↓
수 시간~수일 지연 가시화
```

## 분류 기준

| 잡 유형 | 설명 | 비활성화 정책 |
|--------|------|-------------|
| **리소스 소비형** | LLM API 호출, 데이터 처리, 동기화 | `_disabled/` OK |
| **모니터링·알림형** | 외부 메일 폴링, 상태 점검, 헬스체크 | **절대 단순 비활성화 금지** |

## 모니터링 잡 비활성화 시 강제 게이트

```bash
# 잡을 _disabled/ 로 이동하기 전 자문 체크리스트
echo "이 잡이 다음 중 하나면 _disabled/ 이동 금지:"
echo "  - 외부 서비스(Apple, Google) 신호 폴링"
echo "  - 심사 상태, 배포 결과 알림"
echo "  - 헬스체크 / launchd 등록 감지"
echo ""
echo "해결책: API 호출 0 인 lite 모드 plist 로 교체"
```

## 모니터링 잡 lite 모드 패턴

리소스 절감이 필요하다면, LLM 호출 0 · Gmail grep + 키워드 매치 + 텔레그램 전송 만 남긴 경량 버전으로 대체:

```xml
<!-- com.claude.review-status-check-lite.plist -->
<key>ProgramArguments</key>
<array>
  <string>/bin/bash</string>
  <string>/path/to/review-check-lite.sh</string>
</array>
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key><integer>9</integer>
  <key>Minute</key><integer>0</integer>
</dict>
```

```bash
# review-check-lite.sh — LLM 호출 0, Gmail API 만 사용
#!/bin/bash
RESULT=$(gmail_grep "from:apple.com newer_than:1d" 2>/dev/null)
if [ -n "$RESULT" ]; then
  telegram_send "🍎 Apple 메일 도착: $(echo "$RESULT" | head -3)"
fi
```

## 기존 _disabled/ 폴더 감사 방법

```bash
# _disabled/ 에 있는 잡 중 모니터링·알림 잡 걸러내기
ls ~/Library/LaunchAgents/_disabled/ | grep -E 'check|monitor|alert|status|review|notify'
```

모니터링 키워드 포함 파일이 있으면 lite 모드 복구 검토.

## stop 훅 연동 (세션 종료 시 자동 감지)

`~/.claude/hooks/stop-check-repos-dirty.sh` 에 추가:

```bash
# _disabled/ 에 모니터링 잡이 있으면 경고
DISABLED_MONITORS=$(ls ~/Library/LaunchAgents/_disabled/ 2>/dev/null \
  | grep -E 'check|monitor|alert|status|review')
if [ -n "$DISABLED_MONITORS" ]; then
  telegram_send "⚠️ 비활성 모니터링 잡 감지:\n$DISABLED_MONITORS\n→ lite 모드 복구 검토"
fi
```

## 함정

- "토큰 절감" 목적이라도 Gmail grep + 키워드 매치 수준의 모니터링은 API 비용 0 — 끌 이유가 없다.
- plist 파일이 `~/Library/LaunchAgents/` 에 있어도 `launchctl list` 에 없으면 잡은 동작하지 않는다. 파일 존재 = 잡 활성 아님.
- 재부팅 후 launchd 재등록 실패 (`launchctl load` silent fail)도 동일 blind spot 생성 — `launchctl list | grep com.claude` 로 주기적 확인 필수.

## 관련

- issues 원본: `2026-04-26-review-status-disabled-blind-spot.md`
- 연관 이슈: `2026-04-21-launchd-silent-job-dropout.md` (launchctl silent fail 패턴)
- 연관 노하우: `2026-05-03-launchd-register-verification-gate.md` (등록 검증 게이트)
