---
prevention_deferred: null
---

# 맥미니 mac-report 가 스크린샷 PNG 바이너리를 본문 텍스트로 paste → 본진 컨텍스트 폭증

- **발생 일자:** 2026-05-20 20:22 KST
- **해결 일자:** 2026-05-20 20:48 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** mac-report.sh · 본진 컨텍스트 윈도우 · 5노드 보고 채널 전체

## 증상
직전 사이클 막판 🏭 맥미니가 작업 결과를 mac-report 로 보고하면서 스크린샷 PNG 파일을 보고 본문으로 넘김. 본진 tmux 'claude' 세션에 PNG 바이너리가 텍스트로 paste 되어 컨텍스트 윈도우가 한 번에 폭증 → 형님 "컨텍스트 비우자".

## 원인
mac-report.sh 가 REPORT_FILE 인자를 내용 검증 없이 그대로 `cat` 해서 tmux load-buffer/paste-buffer 함. 바이너리(이미지/PDF)인지, 비정상적으로 큰지 거르는 가드가 전무. 스크린샷처럼 텍스트 아닌 파일을 보고 본문으로 넘기면 raw 바이트가 그대로 컨텍스트에 박힘.

## 조치
mac-report.sh 진입부(REPORT_FILE 존재 체크 직후)에 forcing function 3중 가드 추가:
1. NUL 바이트 검사 — `tr -d '\000' | cmp -s` 로 바이너리 감지 시 exit 6. (초안의 `grep -qU $'\x00'` 은 NUL 을 인자로 못 넘겨 빈 패턴=전부 매칭 버그라 tr/cmp 로 교체.)
2. `file --mime-encoding` 이 us-ascii/utf-8/utf-16/iso-8859 계열 아니면 exit 6.
3. 텍스트라도 64KB 초과면 exit 7 ("요약 + 경로로 분리해 보고").
거부 메시지에 "스크린샷은 경로만 보고, 바이너리 본문 금지" 안내. 검증: 가짜 PNG → exit 6 차단 / 한글 UTF-8 텍스트 → 통과 PASS.

## 예방 (Forcing function 우선)
위 스크립트 가드가 코드 레벨 강제 — 바이너리/대용량 본문을 넘기면 mac-report 자체가 exit 6/7 로 막아 사람 의지에 의존 안 함. 운영 컨벤션도 함께: **스크린샷·이미지는 파일 경로만 보고하고, 본진이 Read(텔레그램 image_path 또는 경로)로 직접 연다.** 노드가 첨부를 mac-report 본문으로 넘기는 경로 자체를 봉쇄.

## 재발 이력
<처음 생성 시 비워둠>

## 관련 링크
- 커밋: claude-automations 23ea5f0 (scripts/mac-report.sh 가드)
- 메모리: 핸드오프 노트 (직전 사이클 mac-report PNG 오염)
- 텔레그램 메시지: id 20804 (형님 "이슈박고 재발방지")
