---
prevention_deferred: null
---

# 메모요 Drive 백업 — 동명 GCP 프로젝트 분산으로 앱이 보는 쪽에 Drive API 미활성

- **발생 일자:** 2026-05-17 ~ 2026-05-19 KST (사흘 막힘)
- **해결 일자:** 2026-05-19 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** 메모요 Drive 1버튼 백업(1.0.7), 향후 OAuth/Google API 쓰는 모든 앱

## 증상
메모요 1.0.7 Drive 1버튼 백업을 누르면 동의창이 안 뜨고 "Drive 권한이 필요해요"만 반복. 계정 연결을 끊고 재시도해도 동일. 에러도 없이 조용히 실패. 사흘 막힘.

## 원인
동명 GCP 프로젝트 2개가 분산 원인. memoyo-496812("memoyo", project number 601847949978) 와 memoyo-beta 두 개가 존재. 앱은 OAuth client id(project number 601847949978 = memoyo-496812)를 보고 로그인 요청하는데, Drive API 활성화·scope 설정은 다른 프로젝트(memoyo-beta)에 해둔 상태였음. 앱이 보는 memoyo-496812 쪽에 Drive API가 미활성 → drive 권한 요청이 조용히 거부 → 동의창 자체가 안 뜸.

SHA-1(폰 APK 실서명 = GCP 등록값과 완전 일치), 테스트 사용자(테스트 계정 등록됨), 앱 코드 전부 정상이었음. 유일한 어긋남이 "어느 프로젝트에 Drive API를 켰는가"였다.

## 조치
앱이 실제로 보는 프로젝트에 Drive API 활성화:
```
gcloud services enable drive.googleapis.com --project memoyo-496812
```
켜자마자 폰에서 동의창이 뜨고 백업 성공 — Drive 안에 Memoyo 폴더 + memoyo-export json 업로드 확인. 폰 verify 완료.

## 예방 (Forcing function 우선)
- **OAuth client id의 project number를 SoT로 삼는다.** 모든 설정(API 활성화 / 동의 화면 / 테스트 사용자 / SHA-1)이 그 project number의 프로젝트 안에 있는지 확인. 동명 프로젝트가 2개 이상이면 이름이 아니라 client id의 project number로 구분.
- **진단 순서 고정:** Google API 권한 요청이 logcat에 안 잡히고 조용히 실패하면, 코드/SHA-1을 째려보기 전에 `gcloud services list --enabled --project <client-id-project>` 로 앱이 보는 프로젝트의 API 활성 상태부터 확인. (Ep16 "내용 말고 위치부터" 룰의 OAuth 버전)

## 재발 이력
<처음 생성 — 비어있음>

## 관련 링크
- 메모리: `project_memoyo_1_0_7_active.md`
- 관련 이슈: `2026-05-02-google-oauth-playwright-stealth-bypass.md` (별건 — Playwright 로그인 자동화)
- 뉴스레터: Ep13 (이 사건의 일반 독자용 서사) — https://daejongkang.substack.com/p/oauth
