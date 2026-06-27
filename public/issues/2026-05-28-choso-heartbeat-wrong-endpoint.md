# choso 맥미니 DEATH 오진단 — heartbeat ping.env 가 잘못된 endpoint(/codex-ping)로 override

- **발생 일자:** 2026-05-27 23:46 KST (오진단 박힌 시점) ~ 2026-05-28 00:00 KST (재발견 + 정정)
- **해결 일자:** 2026-05-28 00:01 KST
- **심각도:** mid (운영 dashboard 표시 버그, 외부영향 0, 데이터 손상 0)
- **재발 가능성:** low (검증 절차 박으면 차단)
- **영향 범위:** queue.kangdaejong.com 맥미니(🏭) 노드 alive/DEATH 타일

## 증상

- 2026-05-27 23:36 KST 폰 스크린샷(msg6243)에서 맥미니(🏭) 타일 DEATH 표시 (마지막 활동 5분 전).
- 진단 사이클(23:46 KST)에서 ping.env URL 박고 검증 후 "1~2분 안 alive 전환" 보고했으나, 24시간 뒤 폰 재확인(msg6249) 시 여전히 맥미니 안 나옴.

## 원인

진단 사이클(23:46 KST)에서 두 가지를 오해함:

1. **검증 curl payload 가 minimal**해서 `/ping` 이 HTTP 422 (`event field missing`) 던진 걸 schema 불일치로 오해. 실제 `choso-ping.sh` 스크립트는 `event` 필드 다 박아 보내므로 `/ping` 이 정답.
2. `/codex-ping` 으로 우회하면 HTTP 200 받기에 "fix 완료"로 판단했으나, 실제로는:
   - `/ping` → `db.upsert_ping` → `pings` 테이블 → 상단 5타일 alive/DEATH 데이터 소스
   - `/codex-ping` → `db.upsert_codex_ping` → `codex_pings` 테이블 → 별 UI 섹션(codex 노드 표시)

즉 heartbeat POST 가 HTTP 200 으로 돌아오긴 했지만, 노드 alive 타일을 그리는 테이블엔 안 박혀 맥미니 표시는 24시간 stale 그대로 유지.

원래 `~/.choso/ping.env` 에 `CHOSO_PING_URL` 라인이 없었던 게 정상 상태 — `choso-ping.sh` 가 decrypt-run.sh `--profile cf-access` fallback 으로 infra-config 의 `CHOSO_PING_URL=https://queue.kangdaejong.com/ping` 을 받아 올바른 endpoint 사용. 사이클이 line 추가하면서 정상 동작을 깬 셈.

## 조치

- `~/.choso/ping.env` 의 `CHOSO_PING_URL` 을 `https://queue.kangdaejong.com/ping` 으로 정정.
- `launchctl kickstart -k gui/$(id -u)/com.daejong.choso-heartbeat` 박음.
- 검증 = real-payload (`event:"heartbeat"`, `node:"🏭"`, `ts`, `ctx_pct=null`, ...) curl POST → `{"ts":1779894114}` HTTP 200.

## 재발 방지

1. **endpoint 우회 fix 전 backend code 확인 의무** — `/ping` vs `/codex-ping` 둘 다 200 던진다고 동등하지 않음. `main.py` 핸들러 본문에서 어느 테이블에 박는지 확인하지 않은 채 endpoint 변경 X.
2. **검증 curl 은 real-payload 로** — minimal payload 422 는 schema 만의 함정일 가능성. 진짜 스크립트 payload 의 일부 (`event`, `node`, `ts` 최소 3개) 를 박은 후 응답 비교.
3. **fix 검증은 endpoint 응답 + UI 표시 둘 다** — HTTP 200 만 보고 "fix LIVE" 단정 금지. 1~2분 뒤 실제 dashboard 에서 노드 alive 전환됐는지 확인 step 박을 것 (이번처럼 폰 재확인이 24시간 늦으면 stale 으로 묻힘).
4. **ping.env override 박기 전 infra-config profile fallback 동작 확인** — decrypt-run.sh `--profile cf-access` 가 이미 정답을 반환하면 override 자체가 불요. profile 확인 한 줄 (`decrypt-run.sh --profile cf-access bash -c 'echo $CHOSO_PING_URL'`) 박은 후 override 결정.

## 관련 메모리·이슈

- `project_choso_phase3_live.md` — `/ping` 이 노드 alive 데이터 소스라는 게 박혀있음 (놓침)
- `project_choso_deploy.md` — choso 운영 인프라 SoT
- `reference_choso_cf_access_friend_add.md` — CF Access policy / service token 운영
- `feedback_verify_memory_before_codex_surface.md` — 메모리 grep + 직접 verify 후 surface 룰 (이번 사이클도 verify 부족이 원인)
