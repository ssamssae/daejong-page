---
category: Flutter iOS
tags: [flutter, ios, physical-device, coredevice, whitesreen, trust, developer-mode, usb]
first_discovered: 2026-05-04
related_issues: []
---

# Flutter iOS 흰화면 — 물리 기기 CoreDevice unavailable

- **첫 발견:** 2026-05-04 (아이폰 물리 기기 flutter run 시 흰화면 또는 빌드 실패)
- **재사용 영역:** Flutter 앱을 Mac 에 연결된 아이폰 물리 기기에서 debug 실행할 때

## 한 줄 요약

Flutter iOS 물리 기기 실행 시 흰화면이 뜨거나 `CoreDevice unavailable` 오류가 나면, **USB 연결 + 기기 신뢰(Trust) 허용 + 개발자 모드 활성화** 3단계를 순서대로 확인한다.

## 언제 쓰는가

- 처음 아이폰을 Mac 에 연결해 `flutter run` 을 실행할 때
- 기기를 새로 초기화하거나 iOS 업데이트 후 연결할 때
- Simulator 는 잘 되는데 물리 기기에서만 흰화면이 뜰 때
- `flutter devices` 목록에 기기가 보이지 않거나 연결이 불안정할 때

## 증상

- 앱이 기기에 설치는 됐는데 실행하면 **흰화면(White Screen)** 만 표시
- `flutter run` 중 아래와 같은 오류 출력:
  ```
  Error: CoreDevice with identifier ... is unavailable
  ```
- Xcode → Window → Devices and Simulators 에서 기기가 보이지 않음
- 기기가 보여도 "연결되지 않음(disconnected)" 상태

## 원인

1. **USB 연결 불량 또는 미연결**: Lightning/USB-C 케이블이 데이터 전송을 지원해야 함 (충전 전용 케이블은 안 됨)
2. **신뢰(Trust) 미허용**: 기기 화면에 "이 컴퓨터를 신뢰하겠습니까?" 팝업이 떴으나 허용하지 않은 상태
3. **개발자 모드 비활성화**: iOS 16 이상에서 개발자 모드를 켜야 개발 빌드 설치 가능. 초기화 후 또는 기기 교체 시 기본값 OFF

## 해결법

### 1단계: USB 케이블 확인

```
[Mac] ←── 데이터 전송 지원 USB 케이블 ──→ [아이폰]
```

- 충전 전용 케이블이 아닌 **데이터 전송 지원** 케이블 사용
- 케이블 교체 후 Mac 에서 기기 인식 여부 확인: `instruments -s devices`

### 2단계: 기기 신뢰(Trust) 허용

1. 아이폰을 Mac 에 연결
2. 아이폰 화면에 **"이 컴퓨터를 신뢰하겠습니까?(Trust This Computer?)"** 팝업 확인
3. **신뢰** 탭 → 아이폰 암호 입력
4. 팝업이 이미 지나갔다면: 설정 → 일반 → 전송 또는 iPhone 재설정 → **위치 및 개인 정보 보호 재설정** 후 재연결

### 3단계: 개발자 모드 활성화 (iOS 16+)

1. 아이폰 → **설정** 앱
2. **개인 정보 보호 및 보안** → 아래로 스크롤
3. **개발자 모드** → **토글 ON**
4. 재시작 확인 팝업 → **재시작 및 켜기** 선택
5. 재시작 후 잠금 해제하면 개발자 모드 활성화 완료

### 4단계: 재실행

```bash
# flutter devices 로 기기 인식 확인
flutter devices

# 기기 ID 로 지정해서 실행
flutter run -d <device-id>
```

## 예방 체크리스트

물리 기기 첫 연결 또는 초기화 후:

- [ ] 데이터 전송 지원 USB 케이블 사용 확인
- [ ] 기기 화면에 Trust 팝업 → **신뢰** 탭 확인
- [ ] iOS 16 이상이면 **개발자 모드 ON** 확인
- [ ] `flutter devices` 에서 기기가 정상 목록에 표시되는지 확인
- [ ] Xcode → Devices and Simulators 에서도 연결 상태 교차 확인

## 함정 포인트

- Trust 팝업은 **잠금 해제 상태**에서만 뜬다. 화면이 잠겨 있으면 팝업이 안 보여 연결이 인식 안 된 것처럼 보임.
- 개발자 모드는 iOS 버전마다 메뉴 위치가 다를 수 있음 (iOS 16: 개인 정보 보호 및 보안 하위 / iOS 17+: 동일 경로).
- `flutter run` 전에 `flutter devices` 로 기기 인식 먼저 확인하는 습관 필수.
- Mac mini M1 (arm64) 에서 `iproxy` 실행 시 Rosetta 미설치면 dart VM attach 실패 — 별도 이슈 참고.

## 관련

- knowhow: `2026-04-29-apple-silicon-rosetta-iproxy.md` (Mac mini Rosetta 이슈)
- memory: `project_mac_mini_ios_debug_rosetta.md`
- 참고: `flutter doctor` 로 Xcode 설정 전반 진단 가능
