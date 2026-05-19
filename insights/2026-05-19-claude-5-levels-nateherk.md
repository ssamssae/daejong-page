---
source_type: video
source_url: https://www.youtube.com/watch?v=ZRb7D6R64hM
source_author: Nate Herk
source_channel: Nate Herk | AI Automation
source_title: Every Level of Claude Explained in 21 Minutes
source_duration: 21분 42초
source_published: 2026-05-12
consumed_at: 2026-05-19
tags: [claude, claude-code, agents, ai-automation, claude-cowork, claude-routines]
---

# Every Level of Claude Explained in 21 Minutes — Nate Herk | AI Automation

## 한 줄 요약
Nate Herk 가 Claude 를 400시간 이상 써본 경험으로, 단순 챗봇 사용자(Enthusiast)부터 Cloud Routines 로 24/7 자동화를 굴리는 아키텍트(Architect)까지 5단계로 나누어 각 단계의 핵심 기능, 정체 원인, 다음 단계로 올라가는 치트코드를 설명한다.

## 영상 메타
- URL: https://www.youtube.com/watch?v=ZRb7D6R64hM
- 채널: Nate Herk | AI Automation
- 길이: 21분 42초
- 업로드: 2026-05-12
- 조회수: 124,999 / 좋아요 4,665
- 시청일: 2026-05-19 KST (🖥 데스크탑3060Ti 가 자막 추출 후 요약)

## 픽업
- **Level 1 → 2 치트코드는 "첫 프로젝트 생성"** — Nate Herk 가 말하길, Level 1 사용자 대부분은 Claude 를 단순 검색바처럼 쓰다가 멈춘다. 프로젝트를 만들고 레퍼런스 문서 몇 개 + 시스템 프롬프트를 넣으면 모든 새 채팅이 프리로드 상태로 시작되며, 이게 Level 2 의 척추(spine)다.
- **Level 2 의 진짜 무기는 6가지 기능 스택** — Nate Herk 는 memory + past chat search, 50+ connectors(Slack/Drive/Gmail/GitHub), 실제 파일 생성(Excel/PPT/Word/PDF, 무료 포함), 영속 저장 + 공개 링크 가능한 artifacts, 채팅 안에서 즉시 만드는 inline visuals, Microsoft Office 네이티브 add-on 을 핵심으로 꼽는다. "Claude 가 brainstorming tool 이 아니라 deliverable tool 이 되는 지점."
- **Level 3 = Claude Cowork, n8n 의 컴퓨터 버전** — Nate Herk 가 n8n 사용자들에게 비유하길, Cowork 는 "당신 컴퓨터에서 풀 파일시스템 액세스로 살아가는 n8n". Downloads 폴더 3개월치 카오스를 정렬·rename·요약하라고 시키고 커피 한 잔 마시고 오면 끝나있다. 단, Pro/Max/Team/Enterprise 유료 전용.
- **Skills 는 한 번 정의하면 chat/cowork/code 어디서나 작동** — Nate Herk 발언: skills 는 markdown 파일로 정의한 재사용 워크플로우. Anthropic 공식 16개 + 커뮤니티 100개 이상 이미 publish 되어 있어, "처음부터 만들지 말고 먼저 검색해서 설치 후 커스터마이즈하라."
- **Level 4 의 황금 습관 — Claude 가 실수할 때마다 claude.md 업데이트** — Nate Herk 가 강조: Anthropic 자체 팀이 쓰는 방법. "매번 실수할 때마다 'claude.md 업데이트해서 다시는 이 실수 하지 마' 라고 시켜라. 몇 주 후 Claude 가 당신의 작업 방식대로 자기 자신을 학습한다." 단 파일은 200줄 이내로, 큰 디테일은 별도 파일로 빼고 @filename 으로 참조.
- **Boris Churnny(Claude Code 빌더) 의 5-parallel-sessions 패턴** — Nate Herk 인용: Anthropic 의 Boris 는 매일 최소 5개 Claude 세션을 number 매긴 터미널 탭에 띄워 각각 isolated workspace 에서 돌린 뒤, 자리 비웠다 돌아와 여러 개의 review-ready PR 을 회수한다. "parallel productivity 가 아니라 a different category of work."
- **MCP 보다 CLI 우선 — Anthropic 공식 권고** — Nate Herk 가 강조: GitHub/AWS/Google Workspace 같이 CLI 가 존재하면 MCP 대신 CLI 를 쓰는 게 토큰 60~70% 절약. "rule 은 CLI first, API endpoints second, skills third, MCP only when nothing else fits." 2026년 1월 출시된 tool search 가 MCP overhead 10% 초과 시 자동 defer 해 85% 줄여준다.
- **Level 5 의 정체 원인은 기술이 아니라 trust** — Nate Herk 가 영상에서 가장 강조한 부분: Cloud Routines 설정 자체는 거의 누구나 할 수 있지만 "내가 자는 동안 돌아가는 시스템에 핸들을 넘기는 게 무섭다." 해법은 운전 배우는 것과 동일 — 고속도로가 아니라 빈 주차장에서 시작. 외부 영향 0인 low-stakes routine (예: 본인에게만 가는 daily stand-up summary) 부터 몇 주 지켜본 후 신뢰가 쌓이면 다음 10개로 확장.
