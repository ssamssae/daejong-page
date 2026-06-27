# 2026-06-01 세션클리어 '클리어 완료' 알림 간헐 미발송 (silent miss)

## 증상
아니키: "방금 세션클리어할 때 '새 세션 시작됨 (클리어 완료)' 문구가 안 뜨네" (msg29860, 스크린샷 1장 — 07:02 KST clear 는 정상 발송, 직후 ~07:07 손0 auto-resume clear 는 누락). 즉 clear 후 본진 봇이 보내는 "🍎 🔄 새 세션 시작됨 (클리어 완료)" 1통이 **간헐적으로** 안 옴.

## 노드
🍎 Mac 본진 — `~/.claude/hooks/session-start-clear-notify.sh` (SessionStart source==clear 게이트).

## 분류
**신규**. 2026-05-30 신설(T-260529-15)된 알림 자체가 간헐 실패하는 회귀성 reliability 버그.

## 진단 (천천히·정확하게 — 단정 회피)
- 훅 로직 자체는 **정상**: `bash -x` 로 source=clear 주입 시 토큰·chat_id 정상 로드(🍎, http 단계 도달), 정확한 본문으로 curl 까지 도달함. 07:02 정상 발송이 이를 뒷받침.
- env 로드도 정상: `load-telegram-env.sh` 가 decrypt-run(--profile telegram) → 실패 시 평문 `.env` fallback. cold/warm 모두 ~0.07s, 토큰 YES.
- **확정 못 한 부분**: 07:07 실패의 정확한 트리거. 기존 훅이 `curl ... >/dev/null 2>&1 || true` 로 **결과를 전혀 로깅 안 해서** 발사 여부·실패 사유의 증거가 0 → 사후 단정 불가.
- 가장 유력한 원인(circumstantial): `curl -sS -m 3` 의 **3초 전체 타임아웃이 너무 빡빡**. clear 직후 콜드 DNS/네트워크 첫 호출이 3초를 순간 초과하면 curl 실패 → `|| true` 로 침묵 → 메시지 누락. (대조: `bonjin-report.sh` 는 `-m` 무제한이라 같은 순간에도 성공.)
- 보조 가설(토큰 콜드로드 순간 실패)도 배제 못 하나, .env fallback 이 있어 가능성 낮음.

## 조치 (픽스, LIVE)
`session-start-clear-notify.sh` 의 발송 블록을 hardening + 관측성 추가 (hook timeout 10s 내 유지, settings.json 무변경):
1. **타임아웃 완화** — `-m 3` → `--connect-timeout 4 -m 9` (총 ≤9s < hook 10s). 콜드 네트워크 순간 지연 흡수.
2. **결과 로깅** — `~/.claude/logs/session-clear-notify.log` 에 `<ts> source=clear emoji=🍎 http=<code>` 1줄. 이제 발사·HTTP 결과가 남아 다음 누락 시 즉시 진단 가능(가장 중요한 변경 — blind→observable).
3. **토큰 미로드 시 침묵 exit 대신 SKIP 사유 로깅**.
4. 인코딩 안전화 — `-d text=` → `--data-urlencode`(이모지+한글+공백, bonjin-report 검증 패턴과 정합).

검증: 스텁 curl 로 source=clear → curl 새 인자 도달 + 로그 `http=200` 기록 / source=resume → 무로그 skip 확인. 실제 텔레그램 발송은 가짜 "클리어 완료" 가 아니키 폰에 뜨는 혼선 방지 위해 스텁으로만 검증(외부발신 사전경고 룰).

## 한계 / 후속
- 근본원인 100% 확정 아님(로그 부재 탓). 이번 로깅으로 재발 시 `http=<code>`/`ERR` 또는 `SKIP` 이 남으니 그때 정밀 분류. 재발+로그 확보 시 재시도(--retry) 추가 검토.

## 관련
- 코드 `~/.claude/hooks/session-start-clear-notify.sh`(= SoT `claude-automations/hooks/...`, hardlink)
- 신설 근거 issue: 알림 자체는 2026-05-30 T-260529-15
- tasks.md T-260601-05

## 재발 + 2차 진단 (2026-06-01 10:30 KST)
- 어제 픽스(connect4/m9 + http 로깅) LIVE 상태에서 10:30 KST 수동 세션클리어가 **또 누락** (아니키 msg29891, 스크린샷).
- 결정적 단서: notify 로그에 10:30 대한 줄이 **0개** (마지막 09:09 → 다음은 10:33 내 수동테스트). 어제 픽스는 "실제 호출이면 무조건 http/ERR/SKIP 1줄"을 보장 → 0줄이라는 건 실패가 **source 게이트(line 17) 이전 또는 게이트에서** 발생했다는 뜻.
- 스크립트 단독 검증: source=clear 주입 시 0.7s 만에 정상 로그+발송. env 로드 0.05s, jq /usr/bin/jq, telegram getMe 0.77s — 전 구간 <1s, 멀쩡. 즉 실패는 스크립트 본문이 아니라 **진입 자체/source 전달**.
- 어제 픽스의 갭: 로깅이 게이트 **이후**에만 있어 게이트 자체가 blind. 근본원인 3갈래(=clear인데 source 미전달 / hook 미호출(체인 드롭) / 게이트~발송 사이 사망) 를 0줄 증거로는 구분 불가.

## 2차 조치 (LIVE) — 게이트-이전 무조건 계측
`session-start-clear-notify.sh` 의 source 게이트 **직전**에 무조건 1줄 로깅 추가:
`<ts> ENTER source='<raw>'`. DO-NOT-REMOVE 마커 보호. 검증: source=resume → `ENTER source='resume'` + 게이트 exit(http 없음), source=clear → ENTER + http=200. 다음 누락 시:
1. `ENTER source='clear'` 있는데 http 없음 → 게이트~발송 사이 사망(그 순간 네트워크/킬).
2. `ENTER source='<clear아님>'` → clear 경로가 다른 source 전달(근본원인 확정).
3. ENTER 자체 없음 → hook 미호출/SessionStart 체인 드롭(clear-notify 가 9개 중 8번째 + clawd-hook 무timeout 등 체인 starvation 의심).

## 후속
- 다음 클리어 1회만 기다리면 위 3갈래 중 하나로 root cause 확정 → 그때 타겟 픽스(소스전달 정정 / 체인 재배치 / 발송 detach).
