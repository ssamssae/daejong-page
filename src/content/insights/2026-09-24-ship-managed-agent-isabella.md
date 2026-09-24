---
title: "Ship your first Managed Agent"
date: "2026-09-24"
source_url: "https://www.youtube.com/watch?v=19HDQ9HppOA"
source_author: "Isabella He"
---

# 첫 Managed Agent 만들기 — Isabella He

## 한 줄 요약
Anthropic Applied AI의 Isabella He가 Claude Managed Agents로 장애 대응 에이전트를 직접 조립하며, 하네스를 모델과 같이 바꿔야 하는 이유와 Agent·Environment·Session 구조를 설명한 강연.

## 영상 메타
- URL: https://www.youtube.com/watch?v=19HDQ9HppOA
- 요청 글: https://x.com/jouhatsu_ai/status/2102803719469306110
- 채널: Claude
- 발화: Isabella He (Anthropic Applied AI, technical staff)
- 길이: 37분 9초
- 업로드: 2026-05-26
- 조회수: 148,213 / 좋아요 3,302
- 시청일: 2026-09-24 KST (🦉 가 자막 추출 후 요약)

## 픽업
- Messages API는 토큰을 넣고 받는 것뿐이라 컨텍스트, 에이전트 루프, 압축을 개발자가 직접 만들어야 했다고 한다. Agent SDK는 Claude Code를 프로그램으로 부르게 했지만 호스팅과 확장은 여전히 개발자 몫이었다. Managed Agents는 샌드박스, 관찰, 도구 실행을 Anthropic이 맡고, 개발자는 할 일과 도구 설정에 집중하게 한다고 말한다. 이 방식으로 프로덕션까지 10~15배 빨라진 사례를 봤다고 한다.
- 하네스는 모델과 같이 바뀌어야 한다고 한다. Sonnet 4.5는 컨텍스트가 남아 있어도 일을 일찍 끝내는 context anxiety가 있어서 하네스에 대응을 넣었다. Opus 4.5에서는 그 행동이 사라져 그 대응이 쓸모없어졌다. 압축, 캐시, 이런 대응을 Anthropic이 맡기려고 Managed Agents를 만들었다고 말한다.
- 자원은 세 가지다. Agent는 뇌로, 모델·시스템 프롬프트·MCP·스킬을 정한다. Environment는 손으로, 실제로 행동하는 컨테이너다. Session이 둘을 묶고 이벤트를 흘려보낸다. 루프는 서버에서 돌아서 노트북을 닫거나 화면을 새로고침해도 세션이 남는다.
- 뇌와 손을 떼 놓으면 자격 증명이 샌드박스 밖으로 나가고, 컨테이너를 먼저 띄우지 않아도 생각이 시작된다. 그 분리로 P95 첫 토큰 시간이 90% 넘게 줄었다고 한다.
- 실습 에이전트의 시스템 프롬프트는 짧다. SRE이고, 장애를 보며, metrics·최근 배포·diff 도구가 있다고만 알린다. 개발자가 시간을 쓰는 곳은 어떤 파일과 로그를 올리느냐는 컨텍스트라고 한다. 네트워크는 허용 목록이고, 자기 컨테이너에서 실행할 수 있으며, MCP는 비공개 터널로 둘 수 있다고 말한다.
- Managed Agents는 요청과 응답이 아니라 이벤트를 세션 로그에 쌓는다. 컨테이너가 죽으면 루프 전체를 재시작하지 않고 컨테이너만 다시 띄운다. 로컬 JSON 도구는 같은 규약으로 Datadog 같은 운영 도구에 바꿀 수 있다. 세션 상태는 idle, running, rescheduling, terminated이고, 웹훅이 오면 세션을 다시 깨울 수 있다고 한다.
- 시연에서 에이전트는 P99 지연이 기준의 10배인 원인을 데이터베이스 풀 고갈로 보고, Alice의 order summary 리팩터 커밋을 지목한 뒤 다른 원인을 빼고 다음 행동을 제안했다. 여기서 멈추지 않고 Claude Code로 수정과 PR까지 맡기면 사람은 감독만 한다고 말한다. 기본 위에 서브에이전트, 메모리와 dreaming, 원하는 결과를 채점하는 outcomes, 사용자·세션별 자격 증명을 따로 암호화하는 vaults가 있다고 한다.

## 용어
- **Claude Managed Agents** [하니스 · 패턴]: 에이전트 루프, 샌드박스, 관찰, 도구 실행을 Anthropic이 호스팅하는 제품. 개발자는 할 일과 도구를 정한다.
- **Agent / Environment / Session** [하니스 · 패턴]: 뇌(모델·프롬프트·도구), 손(컨테이너), 둘을 묶고 이벤트를 흘리는 세션.
- **context anxiety** [기타]: Sonnet 4.5가 컨텍스트가 남아 있는데도 일을 일찍 마치던 행동. Opus 4.5에서는 사라졌다고 말한다.
- **events** [하니스 · 패턴]: 사용자 메시지, 도구 호출, 에이전트 답을 세션 로그에 쌓는 단위. 요청 한 번과 응답 한 번이 아니다.
- **dreaming** [지식 · 컨텍스트 자산]: 에이전트가 자기 메모리 로그를 보고 무엇을 남길지 정하는 Managed Agents 기능.
- **outcomes** [하니스 · 패턴]: 원하는 결과의 채점표를 주면, 에이전트가 그 결과에 닿도록 도구 호출을 고른다.
- **vaults** [기타]: 자격 증명을 에이전트와 분리된 곳에 암호화해 두고, 사용자·세션 단위로 쓰는 저장소.
- **subagents** [하니스 · 패턴]: 조율 에이전트가 다른 에이전트를 띄워 각자 컨텍스트에서 일을 하고 결과를 되돌리게 하는 방식.
