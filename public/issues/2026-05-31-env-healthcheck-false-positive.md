# 2026-05-31 env-token-healthcheck false-positive — decrypt-run 빈 출력에 plain .env fallback 부재

## 발생 시각
2026-05-31 10:00 KST (daily launchd 헬스체크)

## 노드
🍎 본진 launchd 잡 (`com.daejong.env-token-healthcheck`) → 🖥 desktop3060ti / 💻 notebook3060 오탐 보고

## 증상
헬스체크가 "🚨 .env 토큰 health check FAIL — [desktop3060ti] ssh fail or .env empty / [notebook3060] ssh fail or .env empty, 본진 SoT 와 sync 필요" 알림 발사. 그러나 실측 결과 두 노드 모두 정상:
- ssh 정상(같은 시각 codex-mesh-vote fan-out 양 노드 응답).
- `.env` 존재·완전: TELEGRAM_BOT_TOKEN(자기봇)+MACBOOK/MACMINI/WSL/DESKTOP3060TI/NOTEBOOK3060 6개 토큰 전부 getMe HTTP 200.

## 근본 원인
`env-token-healthcheck.sh` 의 `token_dump_cmd` 가 `infra-config/decrypt-run.sh` + `~/.sops/age/keys.txt` 존재 시 **decrypt-run 브랜치를 타되, 빈 출력일 때 plain .env 로 fallback 하지 않음**. 두 노드는:
- decrypt-run.sh + keys.txt + telegram-bots.sops.yaml 다 있음 → decrypt-run 브랜치 진입.
- 그런데 `decrypt-run.sh: sops not found in PATH` (비대화형 ssh PATH 에 sops 바이너리 부재) → decrypt-run 빈 출력 (`2>/dev/null` 로 에러 삼킴).
- token_dump_cmd 가 빈 출력을 그대로 반환 → 헬스체크 `env_dump` 빈값 → "ssh fail or .env empty" 오판.

즉 **토큰 문제 아님 — 토큰 소스를 잘못 본 sourcing 버그**. 토큰은 plain .env 에 상주하고 봇도 .env 로 정상 작동.

## 조치 (fix, LIVE)
`env-token-healthcheck.sh` 수정 — decrypt-run 출력이 비면 plain `.env` 로 fallback (macbook 로컬 브랜치 + 4노드 `token_dump_cmd` 양쪽). bash -n PASS, `--dry-run` "all tokens 200 OK" 확인. claude-automations commit.
- 핵심: 헬스체크의 본분은 "토큰 getMe ping" — 토큰이 있는 소스(decrypt-run 또는 .env)를 가리지 않고 써야 함. 노드 sops 이행 여부에 무관하게 robust.

## 별개 관찰 (deferred, 비차단)
🖥🖥💻 노드에서 `sops` 바이너리가 비대화형 ssh PATH 에 없어 decrypt-run 이 자동화 컨텍스트에서 실패. telegram 토큰은 .env 에 상주하고 봇이 .env 를 읽으므로 현재 깨지는 기능 0. infra-config sops 이행은 별 트랙 — 필요 시 노드 PATH 에 sops 등록 또는 telegram profile 이행. 본 알림과 무관(이미 fallback 으로 해소).

## 교훈
- "ssh fail or .env empty" 같은 OR 진단 메시지는 어느 가지인지 실측 분리 후 단정 (이번엔 둘 다 거짓, 제3원인=sops PATH).
- "본진 SoT 와 sync 필요" 알림에 맹목 sync 금지 — 노드 .env 의 `TELEGRAM_BOT_TOKEN` 은 각 노드 자기 봇 토큰이라 본진 .env 복사 시 노드 봇 파손. 알림 문구가 위험한 액션을 유도할 수 있음.
- decrypt-run/secret 소스는 빈 출력 시 항상 working source 로 fallback (단일 소스 commit 금지).

## 관련
- 코드 ~/.claude/automations/scripts/env-token-healthcheck.sh (claude-automations 심링크 SoT)
- 메모리 [[feedback_noninteractive_ssh_skips_bashrc]] (비대화형 ssh PATH 함정, 같은 클래스)
- 메모리 [[feedback_handoff_stale_negative_assertion]] (negative 단정 verify 의무)
