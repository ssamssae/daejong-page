---
category: 환경 설정
tags: [macos, ssh, systemsetup, fda, full-disk-access, tahoe, terminal, ghostty, remote-login]
related_issues:
  - 2026-04-26-tahoe-ssh-cli-block
---

# macOS Ventura 이상에서 SSH 활성화는 GUI 토글만 — CLI systemsetup 차단

- **첫 발견:** 2026-04-26 (Mac mini M1, macOS Tahoe 26.4.1 셋업 중)
- **재사용 영역:** macOS 13+ 머신 신규 셋업 시 SSH 원격 로그인 활성화. 특히 새로 설치한 터미널 앱(Ghostty 등) 에서 sudo 권한이 있어도 차단.

## 한 줄 요약

macOS Ventura (13+) 부터 `sudo systemsetup -setremotelogin on` 은 호출 터미널 앱에 **Full Disk Access(FDA) 가 부여되어 있어야** 실행됨. 신규 설치 터미널은 항상 FDA 미부여 상태 → GUI 토글이 유일한 무조건 통과 경로.

## 증상

```
$ sudo systemsetup -setremotelogin on
Password:
setremotelogin: Turning Remote Login on or off requires Full Disk Access privileges.
```

sudo 비밀번호는 통과하지만 그 이후 FDA 부족으로 거부. exit 1 반환.

## 패턴 (재사용 가능한 절차)

### SSH 활성화 표준 절차 (macOS 13+)

**CLI 시도 금지.** 대신:

1. `시스템 설정` > `일반` > `공유` > **원격 로그인** 토글 ON
2. 접근 허용 대상 확인 (전체 사용자 또는 특정 계정)
3. 본진에서 SSH 연결 확인: `ssh <hostname>` → `hostname` + `whoami` + `arch` 출력 검증

### FDA 경유 CLI 방식 (비권장 — 추가 단계)

터미널 앱에 FDA 를 직접 부여하는 방법도 있으나 시간이 더 걸림:

1. `시스템 설정` > `개인정보 보호 및 보안` > `전체 디스크 접근`
2. 사용 중인 터미널 앱 추가 → 토글 ON
3. 터미널 앱 재시작
4. 이후 `sudo systemsetup -setremotelogin on` 실행 가능

단계가 더 많으므로 GUI 토글이 선호됨.

## 체크리스트 (신규 24/7 머신 SSH 셋업 시)

- [ ] GUI 경로로 SSH 활성화 (`시스템 설정 > 공유 > 원격 로그인`)
- [ ] `ssh <hostname>` 연결 검증 — `hostname` 출력 확인
- [ ] `whoami` 및 `arch` 출력 확인 (M1 = arm64)
- [ ] Tailscale 등 VPN 경유 시 tailnet 주소로도 SSH 확인

## 주의

- CLI 자동화(스크립트, launchd, Ansible) 에서 `systemsetup -setremotelogin` 호출 금지 — FDA 조건 충족 없이는 항상 실패
- macOS 버전 업마다 동일 정책 유지 예상 (Ventura 이후 강화 추세)
