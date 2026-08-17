---
title: "[한글자막] xAI가 드디어 해냈습니다... (Grok 4.6)"
date: "2026-08-17"
source_url: "https://www.youtube.com/watch?v=E5XnV3yc1Nw"
source_author: "Tech Bridge"
---

# [한글자막] xAI가 드디어 해냈습니다... (Grok 4.6) — Tech Bridge

## 한 줄 요약
xAI가 Grok 4.6을 출시했다. Cursor 인수로 확보한 코딩 데이터와 자체 GPU를 결합해 벤치마크·가격 경쟁력에서 GPT·Claude 계열에 바짝 다가섰다는 내용의 리뷰 영상이다.

## 영상 메타
- URL: https://www.youtube.com/watch?v=E5XnV3yc1Nw
- 채널: Tech Bridge
- 길이: 17분 15초
- 업로드: 2026-08-17
- 조회수: 36 / 좋아요 3
- 시청일: 2026-08-17 KST (🪽 헤르메스가 자막 추출 후 요약)

## 픽업
- Grok 4.6은 완전히 새로 학습한 모델이 아니라 Grok 4.5의 dot 업그레이드지만, 지식노동 벤치마크 GDPval에서 GPT 5.6 Codex Max와 Fable 5 Max를 제치고 1위를 기록했다.
- 체감 코딩 실력에 가장 가깝다고 여겨지는 Terminal-Bench에서 15%→26%로 뛰었고, 법률 벤치마크 Harvey에서도 15.8%로 경쟁 모델(2.5%, 11.3%)을 크게 앞섰다.
- 종합 지능지수(Artificial Analysis)에서는 Opus 5·Fable 5·GPT 5.6 Codex Max에 이어 4위지만, 작업당 비용은 약 83센트로 비슷한 지능의 GPT 5.6 Codex Max보다 저렴해 "얼마나 똑똑한가"보다 "작업당 얼마나 드는가"가 더 중요한 지표라고 강조한다.
- API 가격은 입력 100만 토큰당 $2, 출력 100만 토큰당 $6으로 GPT 5.6 Codex나 Fable보다 훨씬 저렴하며, Cursor·Grok Build 사용자에게는 출시 첫 주 2배 사용량을 제공한다.
- 이 도약의 핵심은 xAI의 Cursor 인수다 — Cursor는 방대한 코딩 데이터를 갖고 있었지만 GPU가 없었고, xAI는 122일 만에 GPU 20만 장을 구축했지만 좋은 모델이 없었다. 둘을 합쳐 Grok 4.5/4.6을 만들었다.
- Grok 4.5를 이용해 Grok 4.6의 SFT 학습 데이터(추론·에이전트 하네스·STEM·소프트웨어공학 등)를 재생성했다 — 이전 세대 모델이 다음 세대 모델의 학습을 돕는 재귀적 자기개선 패턴이 xAI에서도 나타나고 있다.
- Anthropic이 현재 xAI로부터 컴퓨트를 구매 중이라는 사실을 지적하며, Grok·Cursor 수요가 계속 커지면 계약 종료 후 xAI가 그 GPU 용량을 Cursor·Grok 쪽으로 돌릴 가능성이 있어 Anthropic 입장에서 리스크라고 평가했다.

## 용어
- **GDPval** [모델 · 구독]: OpenAI가 만든 벤치마크로, AI 모델이 실제 지식노동 업무를 얼마나 잘 처리하는지 측정한다.
- **Terminal-Bench** [모델 · 구독]: 터미널 환경에서의 실제 작업 수행 능력을 측정하는 코딩 벤치마크로, 사람이 체감하는 코딩 실력과 가장 가깝다고 알려져 있다.
- **Harvey** [모델 · 구독]: 법률 업무(legal use case) 처리 능력을 측정하는 벤치마크.
- **Artificial Analysis Intelligence Index** [모델 · 구독]: 여러 벤치마크를 종합해 모델의 지능 점수를 매기는 지표. 작업당 비용(cost per task)과 함께 봐야 실제 가성비를 알 수 있다.
- **cost per task** [빌링 · 운영]: 작업 하나를 완료하는 데 드는 비용 — 토큰 사용량과 토큰 단가를 함께 고려해야 나오는 지표.
- **dot 업그레이드** [모델 · 구독]: 완전히 새로 학습한 모델이 아니라 기존 모델(예: 4.5)을 소폭 개선한 버전(예: 4.6)을 가리키는 표현.
- **SFT (Supervised Fine-Tuning)** [하니스 · 패턴]: 사람이 정답을 붙인 데이터로 모델을 추가 학습시켜 특정 능력(코딩·추론 등)을 강화하는 훈련 방식.
- **재귀적 자기개선 (recursive self-improvement)** [워크플로우 · 문화]: 이전 세대 모델이 다음 세대 모델의 학습 데이터를 만들거나 개선을 돕는 방식. 영상에서는 Grok 4.5가 Grok 4.6의 학습 데이터를 재생성한 사례로 언급된다.
- **Grokbot** [도구 통신 (MCP · CLI · API)]: xAI가 Cursor 인수 이후 내놓은 비개발자용 에이전트 제품. 모델 선택이나 코드 노출 없이 문서·프레젠테이션 같은 결과물만 보여준다.
- **Cursor 인수** [커리어 · 조직]: SpaceX가 2026년 4월 코딩 IDE 회사 Cursor를 인수한 사건. Cursor의 코딩 데이터와 xAI의 GPU가 결합되며 Grok 4.5/4.6 도약의 배경이 됐다고 설명한다.
