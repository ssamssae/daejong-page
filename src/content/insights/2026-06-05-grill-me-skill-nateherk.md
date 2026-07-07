---
title: "The Skill That 10x'd My Claude Code Projects"
date: "2026-06-04"
source_url: "https://youtu.be/c0kaKxM2pHg"
source_author: "Nate Herk"
---

## 한 줄 요약
Nate Herk가 "grill me" 스킬(Matt PCO 원작)을 소개한다 — 사용자를 끝없이 질문하며 매 답변마다 checkpoint해 머릿속 지식을 knowledge doc으로 추출하고, 그걸로 스킬·컨텍스트·프로젝트 품질을 한 번에 끌어올리는 방법.

## 영상 메타
- URL: https://youtu.be/c0kaKxM2pHg
- 채널: Nate Herk | AI Automation
- 길이: 7분 24초
- 업로드: 2026-06-04
- 조회수: 3,824 / 좋아요 295
- 시청일: 2026-06-05 KST (🍎 가 자막 추출 후 요약)

## 픽업
- 모두가 같은 모델(예: Claude Opus 4.8)을 쓰면 같은 프롬프트로 같은 출력이 나온다. 차별화는 모델에 본인의 taste·voice·decisions 같은 context를 주입할 때 비로소 생긴다.
- 진짜 난제는 추출(extraction)이다 — 머릿속에 있는 걸 AI 시스템으로 옮기는 일. 클라이언트가 짜증낼 만큼 질문을 많이 던지는 그 과정이 성공률 95%냐 80%냐를 가른다.
- "grill me" 스킬은 본인을 끈질기게 질문해서, 답할 때마다 checkpoint하고 knowledge doc에 기록하며, 지식에 빈틈(gap)이 없어질 때까지 이 루프를 끝없이 반복한다.
- 원작(Matt PCO)은 4~5문장짜리 단순 프롬프트다("나를 끈질기게 인터뷰해라, 디자인 트리의 각 가지를 따라 의존성을 하나씩 해소하고, 매 질문마다 추천 답을 제시하고, 한 번에 하나씩 물어라, 코드베이스로 답할 수 있으면 코드베이스를 탐색해라"). 스킬은 복잡한 자동화일 필요 없이 "매번 말하기 싫은 프롬프트"면 된다.
- Nate가 추가한 건 매 질문 후 checkpointing이다. context window가 차면서 앞선 답을 misremember할까 봐, brainstorms 폴더에 Q&A log·핵심 결정이 담긴 md를 자동 생성한다. grill이 끝나면 관련 기존 스킬·문서까지 같이 업데이트하자고 제안한다.
- 일반적으로 스킬은 iteration 1에서 ~70%, 반복마다 조금씩 올라 10~30회 만에 ~95%에서 캡된다(비즈니스가 진화하니 100%엔 영영 못 감). grill me로 앞단에 시간을 쓰면 iteration 1에서 바로 ~90%로 점프해 훨씬 빨리 도달한다 — "6시간 나무 벨 거면 4시간 도끼 갈기".
- open flags 기능: grill 중 본인이 잘 모르는(담당 stakeholder만 아는) 부분은 flag로 표시해 두고, 정보를 얻어와 나중에 doc을 보강한다. 저장된 doc은 나중에 "다시 grill me, 새로 발견한 것들 반영하자"로 재방문할 수 있다.

## 용어
- **AIOS (AI Operating System)** [워크플로우 · 문화]: 개인·비즈니스 지식과 스킬을 한데 모아 AI가 본인처럼 판단·행동하게 만든 개인 AI 운영체제 개념.
- **skill** [하니스 · 패턴]: 매번 반복해 말하기 싫은 프롬프트나 절차를 재사용 가능하게 묶은 단위. 복잡한 자동화일 필요는 없다.
- **grill me** [하니스 · 패턴]: 사용자를 끈질기게 질문해 머릿속 지식을 knowledge doc으로 추출하는 스킬(Matt PCO 원작).
- **extraction** [워크플로우 · 문화]: 머릿속 지식을 AI 시스템으로 옮기는 과정 — 발화자가 꼽은 가장 어려운 단계.
- **context window** [컨텍스트 · 캐시]: 모델이 한 번에 보유하는 컨텍스트 한도. 길어지면 앞선 답을 misremember할 수 있다.
- **checkpoint** [컨텍스트 · 캐시]: 진행 중인 Q&A·결정을 중간중간 doc에 기록해 컨텍스트 소실로 인한 망각을 막는 동작.
- **knowledge doc / brainstorm doc** [지식 · 컨텍스트 자산]: grill 결과(알고리즘·핵심 결정·Q&A log)를 담은 마크다운 산출물. 나중에 재참조·재방문 가능.
- **open flags** [워크플로우 · 문화]: grill 중 본인이 모르는(타인만 아는) 부분을 표시해 추후 보강하도록 남기는 표식.
- **slash command** [도구 통신 (MCP · CLI · API)]: `/grill-me`처럼 스킬을 호출하는 명령.
