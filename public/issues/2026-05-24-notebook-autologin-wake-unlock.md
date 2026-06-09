---
prevention_deferred: null
---

# 노트북 Windows 부팅 자동로그인 + 슬립 wake 잠금 해제 (Hello 정책 우회)

- **발생 일자:** 2026-05-24 09:17 KST
- **해결 일자:** 2026-05-24 10:29 KST
- **심각도:** low
- **재발 가능성:** medium
- **영향 범위:** 노트북(💻) 부팅/wake 워크플로우 — SSH 헤드 노드 무인 운영 가능 여부

## 증상
노트북 재부팅 / 슬립 wake 시마다 Windows Hello 로그인 화면이 뜨고 엔터 두 번 눌러야 진입. 외출용 SSH 헤드 노드인데 부팅마다 손이 필요해 진짜 무인 운영 불가.

## 원인
세 가지가 겹침:
1. `AutoAdminLogon` 레지스트리 키 미설정(또는 0) → 부팅 시 로그인 화면 무조건 표시.
2. Win11 의 `DevicePasswordLessBuildVersion=2` 가 `netplwiz` 의 "사용자가 이 컴퓨터를 사용하려면 사용자 이름과 암호를 입력해야 함" 체크박스 자체를 숨김 → GUI 경로로 자동로그인 켜기 불가.
3. 슬립 wake 시 콘솔 잠금 동작은 powercfg `CONSOLELOCK` GUID 키가 부재할 때 기본값(잠금 안 함) 으로 작동하나, `reg query` 시 "키 또는 값을 찾을 수 없습니다" 라서 silent fail 로 오해함. 실제론 키 set 이 아니라 키 부재 = 기본값 적용 = 정상.

## 조치
elevated PowerShell 1회 (UAC "예" 한 번 클릭) 로 한 번에 박음:
- `HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` 에 `AutoAdminLogon=1`, `DefaultUserName=<user>`, `DefaultDomainName=<host>` 설정
- `HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device` 에 `DevicePasswordLessBuildVersion=0` 설정 (Hello 강제 정책 해제)
- `powercfg /SETACVALUEINDEX` + `/SETDCVALUEINDEX` 로 CONSOLELOCK 0 시도 (verify 단계에서 키 부재로 보였지만 형님 실측 wake 테스트 PASS)

verify:
- 재부팅 1회 후 비번 없이 사용자 계정 자동 진입 확인 (육안)
- 슬립 wake 테스트 — 비번 없이 진입 확인 (육안)

## 예방 (Forcing function 우선)
- **powercfg 의 "키 부재 = silent fail" 결론을 내기 전에 "키 부재 = 기본값 동작" 가설 먼저 검토.** registry 키 만들어진 여부와 실제 동작은 별개의 검증 채널이며, powercfg 의 sub-setting 은 기본값이 OS 에 박혀 있어 키가 없어도 동작한다. 검증 시 `powercfg /Q SCHEME_CURRENT SUB_NONE <setting_guid>` 로 active scheme 의 `Current AC Power Setting Index` / `Current DC Power Setting Index` 직접 read 해서 실제 적용값 확인할 것. registry read 만으로 fail 단정 금지.
- Windows Update 가 정책 키를 덮어쓸 가능성 medium → 재발 시 같은 elevated 스크립트 재실행. 재발 잦으면 startup task 로 idempotent 박는 스크립트 등록 고려(현재 미설치 — 1회 재발까지는 수동 재실행 유지).

## 재발 이력
<처음 생성 시 비워둠. 재발 발생 시 "- YYYY-MM-DD: 상황 한 줄" 로 한 줄 추가>

## 관련 링크
- 텔레그램 메시지 ID 비공개
- 직전 세션 로그: 비공개
