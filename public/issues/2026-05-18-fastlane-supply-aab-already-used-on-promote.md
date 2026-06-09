# 🐛 fastlane supply --rollout aab 재업로드 — Version code 23 has already been used

**일자**: 2026-05-18
**기기**: 🏭 Mac mini (메모요 1.0.5+23 Android production rollout 사이클)
**상황**: fastlane supply 가 같은 명령에서 draft → completed + rollout 시도 → aab 재업로드 시도로 거부
**해결됨**: ✅

## 증상

메모요 Android 1.0.5+23 을 production draft 로 1차 업로드 성공 후, 같은 fastlane supply 명령에서 `--release_status completed --rollout 1.0` 으로 promote 시도:

```
Version code 23 has already been used. Try another version code.
```

Play API 가 같은 version code aab 재업로드로 인식해 거부.

## 원인

fastlane supply 의 디폴트 동작: aab 파일 인자가 있으면 매 호출마다 새 업로드 시도. draft 상태에서 같은 aab 를 promote 만 하려는 의도였는데 fastlane 이 재업로드로 해석.

## 해결

promote 단계에서 `--skip_upload_aab true --skip_upload_apk true` 추가해서 트랙 promote 만 진행:

```bash
fastlane supply \
  --package_name com.daejongkang.simple_memo_app \
  --track production \
  --release_status completed \
  --rollout 1.0 \
  --skip_upload_aab true \
  --skip_upload_apk true
```

또는 한번에 completed + rollout 으로 첫 호출에 박기 (2단계 분리 X):

```bash
fastlane supply \
  --package_name com.daejongkang.simple_memo_app \
  --aab build/.../memoyo-1.0.5-23.aab \
  --track production \
  --release_status completed \
  --rollout 1.0
```

## 재발 가능 범위

- **모든 Android production rollout 사이클** — fastlane supply 가 draft → promote 2단계 분리 패턴 쓸 때마다 재발 가능
- **submit-app 스킬의 Android rollout 단계** — 같은 호출 패턴 가능성

## 재발 방지 체크리스트

- [ ] submit-app 스킬의 Android rollout step 표준화: (1) draft 업로드 + verify (2) skip_upload + promote 의 명시 2단계 분리 또는 1단계 통합 호출 — 둘 중 하나로 lock
- [ ] fastlane Appfile 에 디폴트 옵션 박을지 검토 (그러나 draft 1단계와 promote 2단계 옵션 다름 — 호출 시점에 명시 권장)
- [ ] 다음 Android 출하 directive 에 "1단계 draft 업로드 + 2단계 promote(skip_upload_aab true) 패턴" 명시

## 관련

- 메모요 1.0.5+23 Android production 100% rollout 사이클 (2026-05-18) 1차 promote 거부
- [[2026-05-18-android-applicationid-snake-case]] / [[2026-05-18-asc-deliver-whatsnew-required]] / [[2026-05-18-cocoapods-utf8-encoding-bug]] 와 같은 사이클에서 surface
