---
category: Android 배포
tags: [play-console, android, api, testers, google-groups, automation, closed-test]
first_discovered: 2026-04-16
related_issues:
  - 2026-04-16-play-console-testers-google-group
---

# Play Console testers REST API 는 개별 이메일을 받지 않는다 — Google Group 경유 설계 필수

- **첫 발견:** 2026-04-16 (메모요 사전예약자 자동 등록 시도 중 400 반환)
- **재사용 영역:** Play Console REST API 로 closed/open test 테스터를 자동 추가하는 모든 파이프라인

## 한 줄 요약

`edits.testers` API 의 `emails` 필드는 문서에 보이지만 실제 엔드포인트에서 수용되지 않는다. **`googleGroups` 배열만 유효** — 개별 이메일 추가는 Play Console UI 수동 입력뿐이다.

## 언제 쓰는가

- Play Console REST API / Android Publisher API 로 테스터 목록 자동화할 때
- 사전예약자·베타 사용자를 파이프라인으로 자동 추가하려 할 때
- `edits.testers` 엔드포인트를 처음 설계하는 모든 경우

## 오류 시그니처

```
POST https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}/edits/{editId}/testers/{track}
HTTP 400
{ "error": { "code": 400, "message": "..." } }
```

요청 바디에 `"emails": ["user@example.com"]` 형식으로 개별 이메일 지정 시 발생.

## 올바른 구조

```python
# ❌ 안 됨
body = {
    "emails": ["user1@example.com", "user2@example.com"]
}

# ✅ 올바른 방법
body = {
    "googleGroups": ["testers-group@googlegroups.com"]
}
```

## 전체 흐름 (자동화 권장 패턴)

```
개별 사용자 이메일
    ↓
Google Groups API 로 그룹 멤버 추가
    (Playwright 또는 Admin SDK)
    ↓
Play Console API 에 googleGroups 배열 전달
    ↓
테스트 트랙에 자동 포함
```

```python
from googleapiclient.discovery import build

def add_tester_via_group(service, package, edit_id, track, group_email):
    body = {"googleGroups": [group_email]}
    return service.edits().testers().update(
        packageName=package,
        editId=edit_id,
        track=track,
        body=body
    ).execute()
```

## 설계 체크리스트

새 앱 테스터 자동화 설계 시:

- [ ] "이 API 는 개별 이메일을 받는가, 그룹만 받는가?" 먼저 확인
- [ ] 전용 Google Group 생성 (`<app>-testers@googlegroups.com`)
- [ ] 개인 이메일 → 그룹 멤버 추가 파이프라인 구성
- [ ] Play Console 연결은 `googleGroups` 배열로만

## 함정

- 공식 문서 `v3/edits.testers` 에 `emails` 필드가 **정의**는 돼있지만 실제 엔드포인트에서 **무시**되거나 400 반환. 문서 ≠ 동작.
- Google Groups 생성 없이 Play Console UI 에서 직접 이메일 추가는 가능하지만 API 자동화 경로에서는 그룹 경유가 유일한 방법.
- Firebase App Distribution (별도 서비스) 은 개별 이메일 직접 지원 — Play Console 과 혼동 주의.

## 관련

- issues 원본: `2026-04-16-play-console-testers-google-group.md`
- Android Publisher API docs: `edits.testers` 리소스
- 참고: Firebase App Distribution = 개별 이메일 OK, Play Console = 그룹만
