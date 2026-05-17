---
prevention_deferred: null
---

# `find` shell function (bfs wrapper) 로 인한 mac-mini credential inventory false alarm

- **발생 일자:** 2026-05-18 07:15 KST
- **해결 일자:** 2026-05-18 07:27 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** mac-mini Claude Code 세션의 모든 인벤토리/credential 점검 보고

## 증상
mac-mini 환경 점검 보고를 만들면서 `find ~ -maxdepth 5 -name "*-upload-keystore.jks"` 가 빈 결과를 반환 → "memoyo keystore 없음" 으로 단정. 1차 보고 직후 형님 "전부 설치하자/고고" ack 받고 본진에 안전채널 keystore 운반 directive 송신 직전 단계까지 갔다. 재검증에서 `/usr/bin/find` 로 같은 패턴 돌리니 simple_memo_app/android/memoyo-upload-keystore.jks 포함 7개 jks 전부 정상 적재, Play Service Account JSON (~/.claude/secrets/play-service-account.json) + ASC AuthKey_RU7URQ5453.p8 도 정상 — false alarm 확정.

## 원인
Claude Code zsh shell snapshot 이 `find` 를 함수로 wrap 해 내부적으로 `bfs` (Breadth-First Search) 바이너리를 호출. 일부 glob 패턴에서 매치 못 잡고 fd-style "0 for '<pattern>'" 빈결과 반환. 거기에 android/app/* 만 보면 된다는 stale 가정 (실제 build.gradle.kts 는 `file("../${it}")` 로 android/ 한 단계 위 본다) 까지 겹쳐 stale-on-stale. 1차 인벤토리 단계에서 verify 없이 단정한 게 직접 원인.

## 조치
- `/usr/bin/find` 로 재인벤토리 → 7개 jks + Play JSON + ASC .p8 모두 정상 확인
- 본진 directive 송신 중단, 형님에 false alarm 정정 reply (message 4645)
- feedback memory `memory/feedback_find_is_bfs_alias.md` 저장 + MEMORY.md 인덱스 추가

## 예방 (Forcing function)
- credential / keystore / Play JSON / ASC key 등 "있다/없다" 가 외부 directive 트리거가 되는 인벤토리 보고는 **반드시 `/usr/bin/find` 절대경로** 사용. 1차 결과가 비면 `type find` 로 wrapping 확인 후 재실행.
- gradle / fastlane 등의 path resolution (`file("../${it}")` 등) 까지 같이 봐서 "실제 빌드가 찾을 수 있는지" 검증 후에만 "없음" 단정.
- feedback memory 가 매 세션 로드되므로 다음 세션부터는 트리거 매칭됨. 추가로 인벤토리 스킬 만들 일 있으면 사전 hook 으로 `find=/usr/bin/find` 강제 alias 검토.

## 재발 이력
(처음 생성)

## 관련 링크
- 메모리: `memory/feedback_find_is_bfs_alias.md`
- 텔레그램 메시지: 4639 (1차 잘못된 보고) → 4640~4642 (설치 진행) → 4645 (false alarm 정정)
