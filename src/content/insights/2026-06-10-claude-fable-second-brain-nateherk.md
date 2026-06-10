---
title: "I Turned Claude Fable Into The Ultimate Second Brain"
date: "2026-06-10"
source_url: "https://youtu.be/8QQ_INxAhRs"
source_author: "Nate Herk | AI Automation"
---

# I Turned Claude Fable Into The Ultimate Second Brain — Nate Herk | AI Automation

## 한 줄 요약
Claude Fable 출시에 맞춰, 발화자가 수개월간 만들어 온 AI 운영체제(second brain + AI OS)를 "four C's(Context·Connections·Capabilities·Cadence)" 프레임워크로 어떻게 구축·운영·개선하는지 보여주는 실전 마인드셋 영상.

## 영상 메타
- URL: https://youtu.be/8QQ_INxAhRs
- 채널: Nate Herk | AI Automation
- 길이: 34분 20초 (2060초)
- 업로드: 2026-06-10
- 조회수: 1,861 / 좋아요 100
- 시청일: 2026-06-10 KST (🍎 가 자막 추출 후 요약)

## 픽업
- Claude Fable은 본질적으로 Claude Mythos 5에 사이버 가드레일을 더 얹은 모델. 6월 9일~22일까지만 구독으로 쓸 수 있고 이후 usage credit으로 전환됨. Opus의 2배 가격(입력 100만 토큰 $10 / 출력 $50)이라 세션 한도를 Opus보다 빨리 잡아먹는다 — 전환 전 2주 동안 충분히 써보라고 권함.
- AI 운영체제는 "four C's" 순서로 짓는다: Context(나·사업이 누구인지) → Connections(라이브 데이터 연결) → Capabilities(스킬·에이전트·자동화) → Cadence(잘 때 자동 실행). 앞 둘이 second brain, 뒤 둘이 AI OS. second brain 없이는 AI OS도 없다.
- "OS는 아키텍처가 아니라 default에서 시작한다." 여러 AI 탭·구독·커스텀 GPT를 닫고, 모든 걸 Claude Code(하니스) 통해 하는 습관 전환이 1단계 — 그래야 컨텍스트·메모리·선호가 쌓인다. 본질은 채택(adoption)·습관 문제.
- CLAUDE.md를 "라우터/라우팅 트리"로 본다. 목표뿐 아니라 규칙·레퍼런스·스킬·다른 프로젝트·위키가 어디 사는지를 가리키는 파일. 펄스체크 = 내가 직관적으로 폴더를 드릴다운해 찾을 수 있고, 에이전트도 빨리 찾는가(5분 헤매면 아키텍처를 고쳐야 할 신호).
- 스킬엔 완성품이 없다 — 쓸 때마다 "방금 한 거 좋았다/이건 싫었다, 스킬 업데이트해"로 매번 개선하면 그게 다 데이터. 스킬은 거창한 10단계 워크플로우일 필요 없고 매주 반복하는 프롬프트 하나여도 된다.
- "프롬프트는 절대 권한 계층이 아니다." 에이전트는 "할 수 있으면 한다" 전제로 다뤄야 — 프롬프트가 아니라 scoped 키로 물리적 행동 권한을 막아야 한다. 실제 사고: 에이전트가 task를 오해해 할인 코드 메일을 15~20만 명에게 오발송 → 사과문을 냈고, "키를 줘야지 프롬프트로 막지 마라"가 교훈.
- 결국 짓는 건 "folders and files"다 — myclaude·mycodex·agents.md를 다 두고 모델/하니스에 무관(tool-agnostic)하게 만든다. 내일 Codex로 갈아타든 Sonnet으로 돌아가든 상관없는, 내 사업·삶·역량의 반복 가능한 개인 운영체제를 짓는 것이지 "Claude Code OS"를 짓는 게 아니다.

## 용어
- **Claude Fable** [모델 · 구독]: Anthropic 신모델. Claude Mythos 5 기반에 사이버 가드레일을 추가, 출시 초기 구독 제공 후 usage credit으로 전환.
- **Claude Mythos** [모델 · 구독]: Anthropic이 수개월 티저해 온 고성능 모델. 일반 출시 X, cyber/infra 파트너 한정으로 풀렸던 모델.
- **Second Brain** [지식 · 컨텍스트 자산]: 나·사업·고객·채널 지식을 담아 질문하면 동료처럼 답하는 AI 지식 베이스. AI OS의 토대.
- **AI OS (AIOS)** [워크플로우 · 문화]: second brain 위에 스킬·에이전트·자동화를 얹어 OS처럼 그 안에서 일하는 시스템.
- **four C's** [워크플로우 · 문화]: Context·Connections·Capabilities·Cadence 4단계 — AI OS를 짓고 유지하는 순서 프레임워크.
- **CLAUDE.md (router)** [하니스 · 패턴]: 규칙·스킬·프로젝트·위키 경로를 가리키는 라우팅 트리 역할의 설정 파일.
- **Cadence** [워크플로우 · 문화]: 검증된 스킬을 트리거(수동·이벤트·스케줄)로 자동 실행시키는 단계. 비용·리스크·유지보수가 함께 오른다.
- **Permission Layer** [빌링 · 운영]: 프롬프트가 아니라 권한이 좁혀진 키로 에이전트의 실제 행동을 제한하는 안전장치. "할 수 있으면 한다" 전제.
- **Scoped API Key** [도구 통신 (MCP · CLI · API)]: 읽기 전용 등 권한을 좁힌 API 키 — 에이전트가 삭제·수정·발송 못 하게 막는 수단.
- **Context Rot** [컨텍스트 · 캐시]: 한 세션에 너무 많은 작업을 섞어 맥락이 뭉개지는 현상. 단계별 특화 세션(/clear 후 출력 체이닝)으로 회피.
