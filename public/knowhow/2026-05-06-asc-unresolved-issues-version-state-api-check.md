---
title: "ASC UI '해결되지 않은 문제' ≠ 실제 심사 거절 — API로 정확한 버전 상태 확인"
date: 2026-05-06
tags: [ios, asc, app-store, api, submit]
severity: medium
category: submit-workflow
---

## 증상

ASC 웹 UI에서 iOS 제출 페이지에 **"해결되지 않은 문제(Unresolved Issues)"** 배너가 뜨고 "앱 심사에 다시 제출" 버튼이 보임. 개발자가 이미 심사 제출을 눌렀는데 실패한 건지 불명확.

## 원인

ASC UI가 보여주는 `reviewSubmission` 의 state(`UNRESOLVED_ISSUES`)와 실제 앱 버전의 심사 상태(`appStoreVersions.appVersionState`)는 **별개** 임.

- `reviewSubmission.state = UNRESOLVED_ISSUES` → 제출 컨테이너 자체의 이전 상태 (이미 처리 완료된 케이스도 이 라벨이 남을 수 있음)
- `appStoreVersions.appVersionState = WAITING_FOR_REVIEW` → 실제 버전이 Apple 검토 큐에 들어간 상태

UI만 보면 "아직 제출 안 됨"처럼 보이지만, 실제로는 이미 Apple 심사 큐에 들어가 있는 경우가 있음.

## 해결 — ASC API로 정확한 상태 확인

Playwright 로그인 없이 **JWT API 키**로 확인 가능. Mac에 이미 키 있음:
- `~/.claude/secrets/asc-api-key.json` (key_id + issuer_id)
- `~/.claude/secrets/AuthKey_RU7URQ5453.p8`

```python
# ~/claude-skills/submit-app/asc_client.py 활용
cd ~/claude-skills/submit-app

python3 -c "
import sys; sys.path.insert(0, '.')
from asc_client import make_jwt
import requests, json

token = make_jwt()
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 1. 앱 ID 조회
resp = requests.get('https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=com.daejongkang.wordyo', headers=headers)
app_id = resp.json()['data'][0]['id']

# 2. 최신 버전 상태 확인 (이게 실제 심사 상태의 truth)
resp = requests.get(f'https://api.appstoreconnect.apple.com/v1/apps/{app_id}/appStoreVersions?filter[platform]=IOS&limit=3', headers=headers)
for v in resp.json()['data']:
    print(v['attributes']['versionString'], v['attributes']['appVersionState'])
"
```

`appVersionState = WAITING_FOR_REVIEW` → 정상, Apple 검토 큐에 있음. 추가 조치 불필요.

## 오늘 발생 케이스 (단어요 1.0.1)

- 사용자가 ASC UI에서 수동으로 심사 제출 → UI에 "해결되지 않은 문제" 표시됨
- `reviewSubmission` 목록 조회: UNRESOLVED_ISSUES 1개 + READY_FOR_REVIEW(items 0개) 유령 4개 존재
- `appStoreVersions/1e1e7ba6` 조회: `appVersionState = WAITING_FOR_REVIEW` ✓
- `reviewSubmission` state: COMPLETE (처리 완료)
- **결론**: 이미 Apple 검토 큐 진입. 아무것도 할 필요 없었음.

## 유령 제출(READY_FOR_REVIEW + items 0개) 정리

API 오류로 제출이 여러 번 실패하면 ASC가 빈 `reviewSubmission`을 자동 생성함.
이것들은 버전 attach가 안 돼 있어서 실제 심사에 영향 없음. 방치해도 무방.
필요 시 `PATCH /v1/reviewSubmissions/{id}` `canceled: true` 로 정리 가능 (단, UNRESOLVED_ISSUES 상태는 취소 불가).

## 참고

- `apple-reject-resubmit-via-cancel.md` — 진짜 거절된 경우 cancel 우회 재제출 방법
- `~/claude-skills/submit-app/asc_client.py` — JWT 인증 공통 클라이언트
