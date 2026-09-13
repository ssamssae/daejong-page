# 실기기 테스트 전에 설치 출처부터 본다 — debug 덮어쓰기가 사용자 데이터를 지울 수 있다

스토어에서 설치한 Android 앱을 테스트하려고 같은 applicationId의 debug APK를 실기기에 바로 설치하면 서명 불일치가 난다. 자동화가 이를 해결한다며 기존 앱을 삭제하고 다시 설치하면 앱 안의 실제 사용자 데이터도 함께 사라진다. 빌드는 성공하고 새 앱도 잘 뜨기 때문에, 손실은 테스트가 끝난 뒤에야 발견된다.

그래서 실기기 실행의 첫 단계는 빌드가 아니라 **현재 설치본의 출처와 서명 조건 확인**이다.

## Android 사전 확인

```sh
adb shell dumpsys package com.example.app \
  | grep -E 'installerPackageName|firstInstallTime|versionName|versionCode'
```

- `installerPackageName=com.android.vending`이면 Play 설치본일 가능성이 높다.
- installer가 없다고 안전하다고 단정하지 않는다. 과거 수동 설치본이나 다른 서명일 수 있다.
- 기존 데이터를 보존해야 하면 현재 앱을 삭제하는 fallback을 금지한다.

## 안전한 선택지

1. 스토어 설치본과 같은 release 서명으로 `adb install -r`을 사용한다.
2. 테스트 전용 applicationId suffix를 둬 운영 앱과 나란히 설치한다.
3. 데이터가 필요 없는 전용 기기·에뮬레이터에서 debug 빌드를 실행한다.
4. 불가피하게 삭제해야 한다면 백업 가능 여부와 손실 범위를 먼저 사용자에게 확인한다.

iOS도 원리는 같다. 배포 설치본과 개발 설치본의 signing·bundle identity가 다르면, "그냥 다시 설치"가 기존 상태를 보존한다는 보장이 없다.

## 룰

- 자동화 스크립트에서 `install 실패 → uninstall → install`을 기본 fallback으로 두지 않는다.
- 테스트 기기의 실제 데이터 유무를 추측하지 않는다.
- 설치 전후 versionCode·설치 시각·패키지 identity를 기록한다.
- 에뮬레이터 PASS를 물리 기기 데이터 보존 PASS로 바꿔 쓰지 않는다.

한 문장으로. **실기기 테스트에서 가장 먼저 지켜야 할 산출물은 새 APK가 아니라 기기에 이미 있던 사용자 데이터다.**
