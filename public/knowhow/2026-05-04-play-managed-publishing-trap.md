---
category: Android 배포
tags: [play-console, android, managed-publishing, closed-test, publish, trap]
first_discovered: 2026-05-02
related_issues:
  - 2026-05-02-managed-publishing-closed-test-not-published
---

# Play Console 관리 게시(Managed Publishing) 함정

- **첫 발견:** 2026-05-02 (한줄일기 closed test 검토 통과 후 14일간 미게시)
- **재사용 영역:** Play Console 신규 앱 등록 + closed/open test 트랙 첫 배포 파이프라인

## 한 줄 요약

closed test 검토가 통과돼도 **관리 게시(Managed Publishing)가 ON이면 자동 publish가 차단**된다. 게시 개요 화면에서 관리 게시를 OFF로 토글해야 정상 게시된다.

## 언제 쓰는가

- Play Console 에 신규 앱을 등록하고 closed test 트랙으로 첫 배포할 때
- Google 검토 통과 후에도 테스터가 앱을 다운로드할 수 없다고 보고할 때
- 내부 테스트 → closed test → open test 트랙 전환 시 게시 여부 확인이 필요할 때

## 증상

- Google Play 검토가 **완료** 상태로 표시됨
- 트랙 상태 = "게시됨" 또는 "검토 통과" 처럼 보임
- 그런데 테스터가 옵트인 URL 로 접속해도 앱이 **설치 불가**
- 14일이 지나도 상태가 변하지 않음

## 원인

Play Console 계정 또는 앱 단위로 **관리 게시(Managed Publishing)** 옵션이 활성화되어 있으면:

1. Google 검토는 통과해도 실제 게시를 **사람이 수동으로 승인**해야 함
2. 이 토글이 어디 있는지 UI 상 눈에 잘 띄지 않아 존재 자체를 모르고 방치됨
3. **계정 단위**로 적용되므로 새로 만드는 모든 앱에 동일하게 영향

## 해결법

1. Play Console → 해당 앱 선택
2. 왼쪽 메뉴 → **게시 개요(Publishing overview)**
3. 상단에 **"관리 게시"** 섹션 확인
4. 토글이 **ON** 이면 → **OFF 로 전환**
5. 저장 후 몇 분 안에 자동 게시됨

```
Play Console
  └─ 앱 선택
       └─ 게시 개요 (Publishing overview)
            └─ 관리 게시 토글 → OFF ✅
```

## 예방 체크리스트

신규 앱 등록 + 첫 배포 시:

- [ ] 앱 등록 완료 직후 **게시 개요** 화면 접속
- [ ] **관리 게시 토글이 OFF** 인지 확인 (기본값이 ON일 수 있음)
- [ ] closed test 제출 전에 OFF 확인 한 번 더
- [ ] 검토 통과 후 24시간 내에 테스터가 실제 설치 가능한지 직접 검증
- [ ] 새 앱 추가할 때마다 동일 체크 (계정 단위 설정이므로 매번 확인)

## 함정 포인트

- "검토 통과" = "게시됨" 이 **아닐 수 있다**. 관리 게시 ON 상태면 별개의 수동 승인 단계가 존재.
- Play Console UI 에서 **명확한 경고나 안내가 없어** 수동 승인 대기 중인지 모르고 지나치기 쉽다.
- 한 번 OFF 로 바꾸면 이후 동일 계정의 앱들은 자동 게시되는 경우가 많지만, **계정 생성 시점·지역에 따라 다를 수 있으므로** 매 앱 첫 배포 때마다 확인 권장.

## 관련

- 첫 발견 이슈: 한줄일기 Android closed test 14일 보류 사고 (2026-05-02)
- memory: `feedback_managed_publishing_off_for_new_apps.md`
- Play Console 공식 문서: [게시 개요 및 관리 게시](https://support.google.com/googleplay/android-developer/answer/9859348)
