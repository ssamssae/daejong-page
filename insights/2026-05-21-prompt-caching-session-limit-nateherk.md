---
source_type: video
source_url: https://www.youtube.com/watch?v=6cEQEba0i2A
source_author: Nate Herk
source_channel: Nate Herk | AI Automation
source_title: The One Habit That Doubles Your Claude Code Session Limit
source_duration: 10분 43초
source_published: 2026-05-21
consumed_at: 2026-05-21
tags: [claude-code, prompt-caching, tokens, AI-automation, session-limits]
---

# Claude Code 세션 한도를 2배로 늘리는 습관 (prompt caching) — Nate Herk | AI Automation

## 한 줄 요약
Claude Code 의 prompt caching 이 세션 한도와 토큰을 어떻게 아끼는지, 캐시 TTL(구독 1시간 vs API·서브에이전트 5분)·3계층 캐시 구조·캐시를 깨는 행동(1시간 방치·모델 전환·시스템/프로젝트 변경)을 8020 수준으로 정리한 영상.

## 영상 메타
- URL: https://www.youtube.com/watch?v=6cEQEba0i2A
- 채널: Nate Herk | AI Automation
- 길이: 10분 43초
- 업로드: 2026-05-21
- 조회수: 1,136 / 좋아요 54
- 시청일: 2026-05-21 KST (🖥 데스크탑이 자막 추출 후 요약)

## 픽업
- 캐시된 토큰은 일반 input 의 10% 비용만 든다. 화자 예시로 하루 9,100만 토큰이 캐시됐을 때 실제론 약 900만 토큰 처리한 비용만 청구됐다.
- Claude 구독(터미널·확장의 Claude Code) 캐시 TTL 은 1시간. 세션을 1시간 이상 안 건드리고 다음 메시지를 보내면 그 세션 전체가 uncache 되어 처음부터 재처리된다(비쌈).
- API 와 서브에이전트는 TTL 이 기본 5분(비용 더 내면 1시간으로 올릴 수 있음). 주간 한도를 넘겨 per-token API 영역으로 들어가면 구독도 5분으로 떨어진다.
- 캐시는 3계층 구조 — 시스템(instructions·tool 정의·output style), 프로젝트(CLAUDE.md·memory·rules), 대화(reply·message). 대화 계층만 매 turn 재처리되는 게 정상이고, 시스템·프로젝트 계층이 깨지면 전체가 재처리된다.
- cache create = 캐시에 처음 쓰는 1회 비용으로 다음 turn 부터 회수된다. cache read = 재사용된 토큰으로 fresh input 보다 10배 싸다.
- 모델을 바꾸면(prefix matching 이라 prefix 가 달라져) 캐시가 전부 깨진다. `model opus-plan`(plan=opus, 실행=sonnet)도 매 toggle 이 모델 스위치라 fresh cache 를 새로 시작한다.
- CLAUDE.md 는 세션 중 편집해도 재시작 전엔 적용되지 않아 캐시가 안전하다. 화자의 3습관: 1시간 넘게 멈추지 말 것, task 를 바꿀 땐 /compact 나 /clear 로 새로 시작할 것, 큰 문서는 chat 대신 project 에 넣을 것.
