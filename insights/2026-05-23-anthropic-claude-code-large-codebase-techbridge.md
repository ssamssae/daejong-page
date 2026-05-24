---
source_type: video
source_url: https://youtu.be/diF0Qbj56ys
source_author: Tech Bridge
source_channel: Tech Bridge
source_title: "[한글자막] Anthropic이 공개한 대규모 코딩 프로젝트용 최고의 Claude Code 설정법"
source_duration: 14분 7초
source_published: 2026-05-22
consumed_at: 2026-05-23
tags: [claude-code, agents, harness, AI-automation, anthropic, software-engineering, llm-tooling]
---

# [한글자막] Anthropic이 공개한 대규모 코딩 프로젝트용 최고의 Claude Code 설정법 — Tech Bridge

## 한 줄 요약
Anthropic 이 정리한 대규모 코드베이스용 Claude Code 셋업법 — file system 기반 navigation 위에 Claude.md·hooks·skills·plugins·LSP·MCP·subagents 7요소로 harness 를 짜고, progressive context loading 으로 토큰을 아끼는 원칙을 압축 정리.

## 영상 메타
- URL: https://youtu.be/diF0Qbj56ys
- 채널: Tech Bridge
- 길이: 14분 7초
- 업로드: 2026-05-22
- 조회수: 1937 / 좋아요 72
- 시청일: 2026-05-23 KST (🖥 데스크탑3060Ti 가 자막 추출 후 요약)

## 픽업
- 코딩 에이전트의 코드 navigation 방식은 두 가지인데, RAG(전체 코드 임베딩 + 시맨틱 검색)는 코드베이스가 커지면 hallucination(없어진 모듈을 만들어내는) 때문에 사실상 폐기됐고, 지금은 Claude Code 처럼 bash 의 ls/grep 으로 직접 좁혀가는 file system 기반이 표준. bash 도구는 context window 를 불필요한 스니펫으로 더럽히지 않기 때문.
- "모델이 아무리 강해도 harness 가 약하면 의미 없다." Claude Code·Codex·Gemini CLI 의 결과물이 좋은 이유는 inherent harness 가 강하기 때문이고, 대규모 프로젝트일수록 그 위에 프로젝트에 맞춘 자체 harness 를 얹어야 함. 오픈소스 harness(Superpowers 등)도 대규모에선 결국 자체 셋업이 필요.
- Claude.md 는 세션 내내 메모리에 박혀 있으니 ~300 라인 정도로 짧게 유지하고, monorepo 면 각 subdir 마다 자체 Claude.md 를 둬서 agent 가 그 디렉토리로 들어갈 때만 progressive 하게 로드되게 할 것. 한 파일에 모든 컨벤션 박으면 agent 가 지금 필요 없는 정보로 산만해짐. 모델이 진화하면 옛 모델 기준 지시는 토큰 낭비 — 주기적으로 다듬어야 함.
- Hook 은 Claude.md 에서 흐려질 지시를 forcing function 으로 강제하는 장치. 특히 stop hook 은 세션 종료 후 agent 가 학습 내용을 회고해 Claude.md 를 자동 업데이트하게 만들어 같은 실수 반복 방지에 효과적. pre-tool use hook 으로 건드리면 안 되는 파일 보호, session start hook 으로 컨텍스트 초기 로드, exit code hook 으로 에러 피드백 루프 등.
- Skills 는 매 세션 자동 로드되는 게 아니라 필요할 때 progressive disclosure 로 펼쳐지는 구조. path scope 를 주면 특정 디렉토리에서만 활성화돼 외부 작업 시 context bloat 0. 프로젝트 specific 한 specialized 지시는 Claude.md 가 아니라 skills 로 빼는 게 토큰 효율 정답. Plugins 는 skills + hooks + MCP 를 한 패키지로 묶어 팀 전체에 동일 컨텍스트를 배포하는 용도.
- LSP(Language Server Protocol)는 IDE 의 "정의로 이동" 수준 코드 인텔리전스를 agent 에 주는 통합. 없으면 agent 는 텍스트 패턴 매칭만 해서 잘못된 symbol 에 착지하기 쉬움. 메이저 언어는 덜 중요하지만 비주류 언어일수록 필수 — 에러가 나기 전, 코드 짜기 전에 미리 셋업해야 함.
- Sub agents 는 자기만의 isolated context window 를 가지고 위임받은 task 만 처리한 뒤 최종 결과만 main orchestrator 에 돌려줌. 덕분에 main context 가 부풀지 않고 병렬화도 가능. Claude 내장 explore 같은 기본 agent 도 본인 프로젝트 구조에 맞춰 override 해 두면 매번 Claude.md 로 길안내하는 토큰 낭비를 줄일 수 있음.
