---
prevention_deferred: 2026-07-18
---

# 데스크탑 claude 브릿지 systemd 유닛 소실 — 17분 봇 다운

- **발생 일자:** 2026-07-11 22:35 KST
- **해결 일자:** 2026-07-11 22:52 KST
- **심각도:** medium
- **재발 가능성:** medium
- **영향 범위:** 데스크탑 노드 claude 텔레그램 봇 (다운 17분, 사용자 메시지 1건 배달 지연 1012초). codex 봇·타 노드 무영향.

## 증상
데스크탑 claude 봇 무응답. 브릿지 워치독이 22:37부터 rc=1 헛돌기(관리 대상 systemd 유닛 자체가 없어 복구 불가), 사용자 질문 1건이 큐에 갇혀 stuck_pending 경보 발생.

## 원인
journal 실측: 22:35:43까지 브릿지 정상 가동 로그 → 22:35:50 systemd Stopping/Stopped 직후 유저 유닛 파일(claude-telegram-bridge.service)까지 소실. (추정) 같은 시각 사용자가 데스크탑 실기기에서 파워쉘 브릿지 설치 재도전 중이었고, bridge_setup 의 uninstall/setup 경로가 WSL 쪽 서비스 등록을 걷어냈을 가능성 유력. 확정은 포렌식 태스크(T-260711-79) 몫.

## 조치
본진이 WSL 노드 정본 유닛을 복제(노드명 env 만 교체)해 복원 → daemon-reload → enable --now → active·워치독 rc=0·health-check ok 실측. 갇혔던 큐 메시지는 워치독 재기동으로 배출. 부수: 데스크탑 repo 를 방치된 작업 브랜치에서 main 으로 복귀.

## 예방 (Forcing function 우선)
(deferred — 작성 마감 2026-07-18) T-260711-79 에서 구현 예정: ①유닛 파일을 repo 템플릿으로 SoT 화 ②워치독이 유닛 부재를 감지하면 rc=1 헛돌기 대신 자동 재설치 또는 "유닛 소실" 명시 경보를 내는 forcing function ③포렌식으로 삭제 주체 확정 후 해당 경로(bridge_setup uninstall 등)에 내부 노드 가드 추가.

- **막을 코드/훅:** `none`

## 재발 이력

## 관련 링크
- 포렌식 태스크: T-260711-79 (until:2026-07-18)
- 관련 릴리스: claude-telegram-bridge v0.7.1 (윈도우 마찰 수리 — 같은 날 파워쉘 재도전의 배경)
- 텔레그램: stuck_pending 경보 22:52:08 KST
