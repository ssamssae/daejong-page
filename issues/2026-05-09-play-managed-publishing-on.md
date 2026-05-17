---
prevention_deferred: null
summary: "메모요 Play 심사 통과했는데 관리 게시 ON 으로 발행 안 됨 — 한줄일기에 이어 동일 사고 2번째"
---

# Play Console 관리 게시 ON — 심사 통과 후 미발행

- **발생 일자:** 2026-05-09 06:49 KST
- **해결 일자:** 2026-05-09 06:51 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** Android Play Store 출시 앱 전체 (계정 단위 설정)

## 증상
메모요 프로덕션 심사 통과 후 Play Store에 발행이 안 됨. 1.0.3(build 20) 출시 준비 상태로 멈춰 있었음. 한줄일기(2026-05-02)에 이어 2번째 동일 사고.

## 원인
Play Console 계정 단위 "관리 게시(Managed Publishing)" 가 ON. 심사 통과해도 개발자가 수동으로 "변경사항 게시"를 클릭하지 않으면 발행되지 않음. 1차 사고 후 feedback 메모리에 등록했으나 실제 제출 프로세스에 체크포인트가 없어 재발.

## 조치
1. Play Console → 게시 개요 → 변경사항 1개 게시 클릭 → 즉시 발행
2. 관리 게시 OFF로 변경 (이후 심사 통과 시 자동 발행)

## 예방 (Forcing function 우선)

1. **submit-app 스킬 체크리스트에 강제 항목 추가**: Android 심사 제출 전 "Play Console 게시 개요 → 관리 게시 OFF 확인" 체크. 사람 의지 의존이지만 체크리스트 통과 전 제출 불가 구조.
2. **submit-app.sh 자동 감지**: 제출 스크립트에서 Play Developer API `edits.tracks.get` 또는 Playwright로 게시 개요 상태 확인 → ON이면 경고 출력 후 중단.
3. **즉시 적용**: 관리 게시 OFF 상태로 유지. 이미 OFF로 변경 완료 (2026-05-09).

## 재발 이력
- 2026-05-02: 한줄일기 Android 동일 사고. feedback_managed_publishing_off_for_new_apps.md 등록.
- 2026-05-09: 메모요. feedback 있었으나 제출 시 체크 누락으로 재발.

## 관련 링크
- 메모리: `memory/feedback_managed_publishing_off_for_new_apps.md`
- 1차 사고: 한줄일기 2026-05-02 (project_hanjul_android_alpha_live.md)
- 텔레그램 메시지: id 14412
