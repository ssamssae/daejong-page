---
prevention_deferred: null
summary: "맥미니 ~/.ssh/config에 'mac' alias 누락 → mac-report.sh reverse channel 5노드 중 맥미니만 비대칭"
---

# mac-mini 의 ~/.ssh/config 본진 향 alias 'mac' 누락 — mac-report.sh reverse channel 비대칭

- **발생 일자:** 2026-05-15 20:42 KST (mac-mini-directive.sh smoke test 회신 받았으나 본진 자동 회수 0)
- **해결 일자:** 2026-05-15 20:55 KST (mac mini ~/.ssh/config 에 Host mac alias 4줄 추가)
- **심각도:** medium (loop-fleet/mesh 운영에서 mac mini 결과 자동 회수 0, 강대종 paste 운반 필요)
- **재발 가능성:** low (config 한 줄 fix, 회귀 위험 낮음)
- **영향 범위:** mac-report.sh / cross-device fleet directive 양방향 / mac mini 노드 결과 회수

## 증상

본진 → mac mini directive 는 mac-mini-directive.sh paste 로 잘 도달 (smoke test 425 bytes PASS).
mac mini → 본진 결과 회수는 0 — mac mini 가 mac-report.sh 호출하려 해도 `ssh mac` alias 미설정으로 fail. 강대종이 mac mini 봇 채팅 캡쳐 paste 로 운반해야만 본진이 회신 인지.
WSL/desktop3060ti/notebook3060 은 같은 mac-report.sh 가 정상 작동 (Host mac alias 셋업) — 비대칭은 mac mini 한 곳.

## 원인

mac-report.sh 는 非-Mac 분기에서 `ssh "$MAC_HOST"` 호출 (MAC_HOST=mac 디폴트). WSL/desktop3060ti/notebook3060 의 ~/.ssh/config 에는 `Host mac macbook` (또는 동등) alias 셋업되어 있어서 동작. mac mini 의 ~/.ssh/config 에는 그 alias 가 없었음 — 셋업 누락. 2026-05-14 mac mini 가 Codex/OpenClaw → Claude Code 5번째 노드로 전환되면서 outbound (mac-mini-directive.sh) 는 셋업했지만 inbound 회수에 필요한 reverse SSH alias 는 빠짐.

직접 확인 (2026-05-15 20:50 KST):
- mac mini key auth 본진 향 OK (`ssh user@<본진 Tailnet IP> hostname` → `USERui-MacBookPro.local` 회신)
- mac mini `grep -A 3 '^Host mac$' ~/.ssh/config` → no match
- mac-report.sh 파일 자체는 동일 commit `ae9d41f`, 2196 bytes 양 기기 동일

대칭 verify (다른 3노드, 2026-05-15 20:56 KST):
- WSL ~/.ssh/config: `Host mac macbook` ✅
- desktop3060ti ~/.ssh/config: `Host mac macbook` ✅
- notebook3060 ~/.ssh/config: `Host mac` ✅
- 3노드 모두 `ssh mac '/opt/homebrew/bin/tmux has-session -t claude'` → `session-exists` (round-trip PASS)

## 조치

mac mini ~/.ssh/config 에 4줄 추가:

```
# 본진 (Mac MacBookPro) — mac-report.sh reverse channel, 2026-05-15
Host mac
  HostName <본진 Tailnet IP>
  User user
```

검증:
- `ssh mac hostname` → `USERui-MacBookPro.local`
- `ssh mac '/opt/homebrew/bin/tmux has-session -t claude'` → `session-exists`

또 본진 → 4 노드 outbound 도 일괄 verify (강대종 추가 요청 "desktop laptop 도 양 기기간 호출 대칭"): wsl/mac-mini/desktop3060ti/notebook3060 모두 `ssh <alias> hostname` 정상 회신 — 본진 ~/.ssh/config 의 alias entry 4건 OK.

## 예방 (Forcing function 우선)

**1순위 — 새 노드 셋업 체크리스트에 reverse alias 명시**: ~/.claude/skills/MACHINE_ROLES.md 또는 별도 onboarding 문서에 새 fleet 노드 추가 시 `outbound directive script` + `inbound mac alias in ~/.ssh/config` 양쪽 셋업 박는 체크리스트. 노드 전환마다 비대칭 누락 사고 반복 방지.

**2순위 — mac-report.sh 시작부 alias 검증 + 친절한 에러**: 非-Mac 분기 진입 직후 `ssh -o BatchMode=yes "$MAC_HOST" true 2>&1` 한 줄로 alias/key auth 검증. fail 시 "ssh alias 'mac' 미설정 또는 key 미등록 — ~/.ssh/config 에 본진 향 Host mac 셋업 필요" 메시지 + exit. silent fail 차단.

**3순위 — fleet smoke 사이클에 reverse round-trip 검증 강제**: loop-fleet 또는 별도 fleet-health 스킬이 노드별 outbound + inbound round-trip 둘 다 ping 후 둘 다 PASS 아닌 노드는 idle 처리 + 강대종 surface. 본 fix 검증 시점에 본진 → 4 노드 + 4 노드 → 본진 round-trip 행렬 한번 통째로 verify 한 게 forcing function 견본 — 스킬화 가능.

## 재발 이력

(처음 생성)

## 관련 링크

- 관련 이슈: `2026-05-15-codex-directive-routing-stale.md` (outbound 부재 — 본 이슈와 같은 transition 의 비대칭 쌍)
- 관련 이슈: `2026-05-12-codex-bidirectional-routing-failure.md` (옛 Codex 시절 양방향 fail, 본 이슈는 Claude Code 전환 후 비대칭 셋업 누락 별개)
- 메모리: `project_macmini_codex_to_claude_code.md`
- 텔레그램: 2026-05-15 20:42 KST smoke test 알림, 20:45 KST 강대종 캡쳐, 20:53 KST 진단 보고, 20:55 KST fix 완료, 20:56 KST 4노드 round-trip 행렬 PASS
