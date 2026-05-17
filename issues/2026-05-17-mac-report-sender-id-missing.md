---
prevention_deferred: null
summary: "데스크탑3060Ti가 mac-report.sh로 보낸 본문에 sender 노드 신원 누락 → 본진이 '출처불명' 표기한 사고"
---

# mac-report body 에 sender 노드 신원 누락 → 본진 챗봇 "출처불명" 식별 사고

- **발생 일자:** 2026-05-17 23:32 KST (🖥 데스크탑3060Ti 노드의 daejong-page habits/issues 편집 보고 수신 시)
- **해결 일자:** 2026-05-17 23:38 KST (mac-report.sh 자동 prepend 패치)
- **심각도:** medium (식별 사고 자체는 cosmetic, 다만 reverse reply 발송 실패로 송신 노드 idle 위험)
- **재발 가능성:** low (스크립트 자동화 + idempotent guard 박힌 후)
- **영향 범위:** mac-report.sh 운반체, 5노드 cross-device 보고 chain

## 증상
🖥 데스크탑3060Ti 노드가 mac-report.sh 로 daejong-page habits.html + issues.html 편집 결과 본진 보고 송신. 본진 챗봇이 본문 paste 받았지만 sender 식별 불가 → 형님 텔레그램 보고에 "출처불명 노드" 표기. 강대종이 폰에 떨어진 `[🖥️→🍎] [결과] ...` (agent-msg-notify.sh 채널) 와 본진 paste 본문이 어긋난 걸 발견하고 원인 질문.

## 원인
mac-report.sh 가 두 채널로 분기 송신:
- **채널 A** — agent-msg-notify.sh 가 텔레그램 알림(80자 요약, `[🖥→🍎] [결과] <title>`) → 강대종 폰에는 떨어짐.
- **채널 B** — mac-report.sh 가 본진 tmux 'claude' 세션에 payload paste (`[Mac report title: <title>]\n\n<body>`) → 본진 챗봇이 처리.

봇끼리 텔레그램 수신 차단 룰 때문에 본진 챗봇은 채널 A 의 `[🖥→🍎]` prefix 를 못 봄. 본진은 채널 B body 만 신뢰. 그런데 body 첫 줄에 sender 신원이 박혀 있지 않음 — 🖥 데스크탑 chatbot 이 본문 첫 줄에 "본 노드가 처리한 daejong-page..." 로 시작해서 어느 노드인지 명시 누락. 🏭 맥미니/🪟 WSL chatbot 은 첫 줄에 "🏭 맥미니 ..." / "발신: 🪟 WSL → 🍎 본진" 식으로 신원 박는 컨벤션을 따라서 식별 OK 였는데, 🖥 데스크탑 chatbot 만 그 컨벤션을 빠뜨려 발생.

근본 원인은 mac-report.sh 자체가 sender 신원을 body 에 자동 prepend 하지 않고 송신 chatbot 의 prompt 컨벤션에만 의존했던 것. 5노드 chatbot 중 한 노드만 컨벤션을 빠뜨려도 식별 사고 발생.

## 조치
trio-vote 결과 [B] (PM/엔지니어→B 추천, 비판론자→D 이중벨트, 강대종 직접 결정 [B]) 채택. mac-report.sh 자체에 sender 자동 prepend 로직 추가:

1. `detect_sender_id()` 함수 추가 — FROM_DEVICE arg 우선, 없으면 hostname 기반 추론:
   - USERui-MacBookPro → 🍎 본진
   - mac-mini → 🏭 맥미니
   - DESKTOP-I4TR99I → 🪟 WSL
   - DESKTOP-0VAB3QC → 🖥 데스크탑 3060Ti
   - DESKTOP-4MNJ1C0 → 💻 노트북3060
2. payload 생성 시 body 첫 줄에 `[<sender_id> → 🍎 본진]` 자동 prepend
3. Idempotent guard — body 첫 줄에 이미 `[... → 🍎` 패턴 있으면 자동 prepend skip (chatbot 이 직접 박은 경우 중복 방지, 비판론자 우려 반영)

claude-automations repo 의 `scripts/mac-report.sh` symlink 가 5노드 공통이라 본진 push → 다른 노드 git pull 로 자동 sync.

검증: smoke test 5케이스 (no arg / wsl / macmini / 데스크탑 / notebook) 모두 정확한 sender 추론 + idempotent guard 동작 확인.

## 예방 (Forcing function 우선)
mac-report.sh 의 prepend 로직이 forcing function. 5노드 chatbot 컨벤션 누락에 의존하지 않고 스크립트가 단일 진실원(hostname/arg) 으로 자동 박음. Idempotent guard 가 chatbot 이 직접 박은 케이스도 중복 없이 처리.

추가 안전벨트: 본진의 mac-report-reverse-reply-check.sh Stop hook 가 mac-report paste 받으면 reverse reply 강제. reverse reply 호출 시 sender 식별 필요 → script prepend 가 안 되면 hook block. 즉 sender prepend 누락은 chain 으로 발견됨.

## 재발 이력

## 관련 링크
- mac-report.sh 패치 commit (claude-automations): 본 이슈 직전 push (mac-report-sender-id-prepend 변경)
- 텔레그램 형님 발견 msg_id 18946 + 18947
- trio-vote 결과 송신 msg_id 18948 + 18949 + 18951 (강대종 [B] 결정)
- 이전 mac-report 사고: `2026-05-08-mac-report-fake-result-notify.md` / `2026-05-13-mac-report-reverse-reply-missed.md`
