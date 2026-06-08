---
title: "Claude Code Dynamic Workflows Clearly Explained"
date: "2026-05"
source_url: "https://youtu.be/jZgcWCzxh1I"
source_author: "Nate Herk | AI Automation"
---

# Claude Code Dynamic Workflows Clearly Explained — Nate Herk | AI Automation

## 한 줄 요약
Claude Code의 dynamic workflows가 무엇이고 skill·sub-agent·agent team과 어떻게 다른지, 언제 쓰면 좋고(독립적으로 쪼개지는 width형 병렬 작업) 언제 오버킬인지, 그리고 비용 폭증을 어떻게 통제하는지를 정리한 영상.

## 영상 메타
- URL: https://youtu.be/jZgcWCzxh1I
- 채널: Nate Herk | AI Automation
- 길이: 16분 31초
- 업로드: 2026-05
- 조회수: 14,543 / 좋아요 459
- 시청일: 2026-05-31 KST (🍎 본진이 자막 추출 후 요약)

## 픽업
- Dynamic workflows는 Opus 4.8과 함께 나온 기능으로, Claude Code가 JavaScript 스크립트를 작성해 수십~수백 개의 sub-agent를 띄운다. 플랜을 Claude가 직접 들고 있는 게 아니라, 생성된 JS 파일이 실행 주체가 되어 에이전트들을 dispatch한다. 저장해두고 나중에 재실행할 수 있다.
- skill → sub-agent → agent team → workflow는 사다리(ladder)다. 위로 갈수록 복잡도·기능이 늘지만 리스크·비용도 커진다. skill=재사용 레시피(how), sub-agent=메인과 분리된 context의 병렬 작업자(서로 대화 X, 메인에만 보고), agent team=서로 대화하며 task list 공유하는 crew(group chat), workflow=혼자 일하는 sub-agent들의 결과를 끝에 merge.
- 비용이 크다. 발화자는 데스크탑 전체를 크롤하는 workflow 프롬프트 한 번으로 $200/월 플랜의 절반을 30분 만에 소진했다. 각 agent가 자기 context window를 가진 full Claude call이라 input 토큰이 폭증한다(output보다 input이 큼). 대응: 스코프를 bound하고 deliverable을 명시하고 worker는 haiku에 태운다.
- /goal vs workflow = depth vs width. /goal은 "done == true"가 될 때까지 여러 turn 반복하는 루프(원하면 24시간+도 가능). workflow는 여러 sub-agent가 병렬로 서로 다른 일을 하고 끝에 synthesize하는 width 플레이(50+개 수평), 종료 기준을 계속 체크하는 루프가 아니다.
- 쓸지 판단하는 질문: "이 일이 동시에 독립적으로 실행 가능한 여러 조각으로 쪼개지는가?" yes면 workflow를 시도. 단일 편집·빠른 질문·일반 지식작업엔 대개 오버킬. 코드베이스 전수 리뷰나 400파일 마이그레이션처럼 리스크 높고 조각화되는 일에 적합.
- /deep-research는 workflow를 자동 호출하는 기능. 병렬 리서치 agent들이 각 claim에 투표한 뒤 인용이 달린 deep research 리포트를 만들어준다.
- workflow는 실수로 발동되지 않는다 — 명시적 "yes, run it" 확인이 필요하고 raw 스크립트도 미리 볼 수 있다. ultracode는 effort 레벨 중 가장 비싼 모드로, xhigh reasoning + 매 프롬프트를 workflow로 처리해 권한을 우회하고 바로 orchestrate한다. 호출은 "set me up a dynamic workflow to..."처럼 명시적으로 하는 게 좋다('workflow'가 일상 표현으로 섞이면 오작동 방지).

## 용어
- **Dynamic Workflow** [하니스 · 패턴]: Claude Code가 JS 스크립트를 생성해 다수 sub-agent를 병렬 오케스트레이션하는 기능. 결과는 끝에 merge되어 메인에 회신.
- **Sub-agent** [하니스 · 패턴]: 메인 세션과 분리된 context window로 병렬 실행되는 작업자. 서로 통신하지 않고 메인 세션에만 결과 보고.
- **Agent Team** [하니스 · 패턴]: 서로 대화하며 task list를 공유하는 소규모 에이전트 crew. war room·council·debate 같은 협업 구조.
- **/goal** [워크플로우 · 문화]: 종료 기준(done==true) 충족까지 여러 turn 반복하는 루프형 실행. depth 축.
- **/deep-research** [워크플로우 · 문화]: workflow를 자동 호출해 병렬 리서치 + claim 투표 + 인용 리포트를 생성하는 기능.
- **ultracode** [모델 · 구독]: xhigh reasoning에 매 프롬프트 workflow 처리를 더한 최고비용 effort 모드.
- **effort level** [모델 · 구독]: Opus 모델의 reasoning 강도 설정(low / medium / high / extra high / max).
- **Skill** [하니스 · 패턴]: 재사용 가능한 실행 레시피. sub-agent나 workflow 안에 nest되어 호출될 수 있음.
