---
prevention_deferred: null
---

# 볼칸 iMessage 「알 수 없는 오류」 — securityd 재시작 뒤 오래 켜진 계정 데몬의 키 핸들 무효

- **발생 일자:** 2026-10-10 12:09 KST (잠복 시작 2026-10-09 10:36 KST, securityd 첫 충돌)
- **해결 일자:** 2026-10-10 12:35 KST (IDS 재등록 성공 12:35:53)
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 볼칸(Mac mini, macOS 26.7.1 25G241) 메시지 앱 iMessage·FaceTime 등록. 같은 시기 인터넷 계정 암호 요청 알림도 떠 있었다(같은 원인 추정, 미확인).

## 증상

메시지 앱이 멈춰 강제 종료 후 다시 켜니 iMessage 가 로그아웃돼 있었고, 로그인하면 「알 수 없는 오류」가 떴다. 예전에도 같은 증상이 있었고 그때는 맥미니 macOS 재설치까지 했다(사용자 진술, 10/4 볼칸 재설치 작업 T-261004-004 시기).

## 원인

1. 2026-10-09 securityd 가 3번 충돌했다(10:36·14:04·19:52, `EXC_BAD_ACCESS` / `PAC_EXCEPTION`, `/Library/Logs/DiagnosticReports/securityd-2026-10-09-*.ips`). launchd 가 securityd 를 새로 띄웠다.
2. identityservicesd·imagent·akd·accountsd 는 10/5 부터 계속 켜져 있어서 충돌 전 securityd 의 키 핸들을 계속 썼다.
3. 메시지 앱 재실행이 IDS 재인증을 불렀고, identityservicesd 가 인증서 요청(CSR)을 만들다 실패했다: `SecKeyCopyExternalRepresentation failed: CSSMERR_CSP_INVALID_KEY_REFERENCE (-67712)` → `IDS Authentication failure (error 46)` → `Login failed (error 18)`. 앱은 이것을 「알 수 없는 오류」로만 보여 줬다.

판정 기준: `ps -o lstart` 로 securityd 시작 시각이 위 4개 데몬보다 늦으면 이 상태다.

## 조치

- 진단: `/usr/bin/log show --predicate 'process == "identityservicesd"'` 로 CSSMERR·IDS Authentication failure 확인. ⚠️ zsh 의 맨 `log` 는 내장 명령이라 「too many arguments」·0줄이 나온다 — 반드시 `/usr/bin/log`, 0줄을 「기록 없음」으로 읽기 전에 활발한 프로세스로 대조군부터.
- 수리(사용자 승인 후): 메시지 앱이 꺼진 상태에서 4개 데몬 재시작. `launchctl kickstart -k` 는 SIP 로 거부(150) → `kill -TERM` (identityservicesd·imagent 종료) → akd·accountsd 는 TERM 뒤 12초간 살아 있어 `kill -KILL`. launchd 가 즉시 다시 띄웠다(imagent 는 메시지 앱을 열 때).
- 결과: 데몬 재시작 18초 뒤 `Registration SUCCESS ... on com.apple.madrid`(iMessage). 키체인 오류 재발 없음. 메시지 앱 계정 상태 iMessage·SMS `connected`. 재설치·재부팅·재로그인 불필요.
- 참고: 메시지 앱 계정 6개 = 같은 애플 계정 이메일을 쓰는 서비스 항목 3개 + 전화 중계 항목 3개(SMS·RCS·종류 미확인 1개). 연결 안 된 1개는 `enabled=false` 인 RCS 항목이라 고장이 아니다.

## 예방 (Forcing function 우선)

- **막을 코드/훅:** https://github.com/ssamssae/claude-automations/pull/2439
  - `scripts/macos-stale-keychain-handle-check.py` — 현재 securityd 보다 먼저 시작한 계정 데몬을 찾는다(종료코드 1). `--fix` 를 명시하면 그 데몬만 TERM → 버티는 같은 프로세스에만 KILL. 픽스처 = 볼칸 수리 전(stale)·수리 후(ok)·아테나(ok) 실측 ps, 변이 프로브 2종 rc=0. 시각 이름표 정정 후속 = PR #2441.
  - 정기 감시: https://github.com/ssamssae/claude-automations/pull/2443 — 볼칸·아테나 launchd `com.claude.macos-stale-keychain-watch` 가 30분마다 읽기 전용 검사, stale 이면 securityd 인스턴스당 1회 텔레그램 알림. 고치기(`--fix`)는 자동 실행하지 않는다. 2026-10-10 13:55 설치(대종님 승인), 첫 실행 OK, 알림 경로 시험 발신 실측.
- 운영 교훈: 맥 앱이 「알 수 없는 오류」로 로그인을 거부하면 재설치 전에 securityd 와 계정 데몬의 시작 시각부터 비교한다.

## 재발 이력

## 관련 링크
- PR: https://github.com/ssamssae/claude-automations/pull/2439 (감지 스크립트, 머지 f4fbb408)
- PR: https://github.com/ssamssae/claude-automations/pull/2443 (정기 감시, 머지 43cc792f)
- 메모리: `memory/reference_imessage_unknown_error_stale_securityd_handles.md`
- 장부: T-261010-022 (이 기록·감지 코드), T-261010-028 (정기 감시), T-261004-004 (10/4 볼칸 재설치)
