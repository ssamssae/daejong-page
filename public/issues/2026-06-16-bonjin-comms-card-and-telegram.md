---
prevention_deferred: 2026-06-23
---

# 본진 외부발신 신뢰성 2건 — 문자 명함 미전송(도구 ok≠전달) + 본진 텔레그램 발신 경로 장애

- **발생 일자:** 2026-06-16 15:54 KST (명함) / 17:2x KST (텔레그램)
- **해결 일자:** 명함 = 2026-06-16 16:03 KST 해결 / 텔레그램 = 미해결(관찰, 경로 복구 대기)
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** 본진(🍎) 외부발신 — iMessage 첨부 / 텔레그램 봇 발신

## 증상
1) 토스 컨택에게 명함을 이메일+문자로 보냈는데, 이메일엔 명함 이미지가 첨부됐으나 문자(iMessage)엔 텍스트만 가고 명함 이미지가 안 감. 본진은 "명함도 보냈다"고 보고했으나 실제로는 누락.
2) 그 직후 본진 텔레그램이 "끊김" — 아니키가 텔레그램으로 보내도 응답이 없고, 결국 터미널로 접속해 물음. 본진 reply 가 504/502/timeout 으로 계속 실패. 다른 4노드 봇은 정상.

## 원인
1) **도구 리턴값을 실제 전달로 착각.** 표준 문자 도구(send-message.sh)는 텍스트 전용이라 명함 이미지는 별도 osascript 로 보냈는데, 파일을 `/tmp` 에 둠 → macOS Messages 앱은 샌드박스라 `/private/tmp` 를 못 읽어 첨부가 조용히 누락. 그런데 osascript 는 `image_sent_ok` 를 리턴 → 그 리턴값만 믿고 전달 확인 없이 "보냈다" 단정 보고. (기존 룰 "확인 없이 단정 금지" / `memory/feedback_verify_before_asserting_in_report` 자가위반.)
2) **본진 호스트 특정 텔레그램 경로 장애.** 처음엔 5노드 전부 텔레그램 IP(149.154.x/91.108.x) 도달 불가(google 200 정상, 텔레그램만 000) = ISP→텔레그램 경로 차단. 이후 4노드는 복구됐으나 본진만 발신(sendMessage=POST) 지속 타임아웃, getMe(GET)는 200. 닿는 IP에 강제 지정(`--resolve`)해도 sendMessage 실패 → DNS/IP 문제 아닌 경로/PMTU 블랙홀(POST 본문 큰 패킷 silent drop) 징후. (추정.)

## 조치
1) 파일을 `~/Pictures` 로 복사(샌드박스 접근 가능 경로) + osascript `as alias` 로 재전송 → `chat.db` 조회로 `is_sent=1, is_delivered=1` 눈으로 확인 후에야 전달 확정. 명함 자산은 `~/claude-coord/brand/minusbeta-namecard-2026-06-16.{png,html}` 영구 저장(`memory/reference_minusbeta_namecard.md`).
2) 진단: GET/POST 대조 + 노드간 대조로 "본진 호스트 경로" 문제로 격리. 코덱스 추천 DNS 수정(`tailscale set --accept-dns=false`) 실측 → Tailscale DNS·시스템 DNS 동일 IP(149.154.166.110) 반환으로 효과 0 + 노드 SSH(MagicDNS 짧은이름 의존) 끊김 → 즉시 `--accept-dns=true` 원복, SSH 전부 복구 확인. 폴백 채널 = iMessage(Apple망 정상)로 아니키 보고. 잔여 fix 후보 = 공유기 재부팅(경로 리셋) 또는 `sudo ifconfig en7 mtu 1400`(둘 다 아니키 손).

## 예방 (Forcing function 우선)
- **(공통) 외부발신은 도구 리턴값이 아니라 실제 전달을 증거로 확인 후 보고.** iMessage = `chat.db` `is_delivered`, 텔레그램 = API 응답 `ok:true`/HTTP 200, 메일 = message_id. 도구가 "성공" 리턴해도 전달 미확인이면 "전송 시도함(미확인)" 으로 분리 보고.
- **(1 코드) send-message.sh 에 이미지 첨부 인자 + 발송 후 chat.db 전달 검증 내장** → ad-hoc osascript / `/tmp` 경로 재발 차단. (deferred — 작성 마감 2026-06-23)
- **(2 코드) 본진 텔레그램 발신 실패 감지 시 iMessage 자동 폴백 알림 훅** → 발신 장애가 침묵으로 묻히지 않게(아니키가 "왜 끊겼냐" 묻기 전에 본진이 먼저 알림). (deferred — 작성 마감 2026-06-23)
- **막을 코드/훅:** `none` (deferred 2026-06-23 — 위 2개 forcing function 구현 예정)

## 재발 이력
<처음 생성>

## 관련 링크
- 메모리: `memory/feedback_verify_before_asserting_in_report.md`, `memory/reference_minusbeta_namecard.md`, `memory/reference_toss_contact_kim.md`
- 관련 이슈: `2026-04-20-terminal-only-reply-missed-telegram.md` (발신 채널 누락 계열)
