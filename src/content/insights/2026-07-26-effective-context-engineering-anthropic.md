---
title: "Claude 5 세대의 컨텍스트 설계 새 규칙 — 더하기가 아니라 덜어내기"
date: "2026-07-26"
source_url: "https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models"
source_author: "Thariq Shihipar (Anthropic)"
---

## 한 줄 요약
모델이 똑똑해지면 컨텍스트 설계의 일은 규칙을 더 잘 쓰는 게 아니라 규칙을 걷어내는 쪽으로 옮겨간다 — Anthropic은 Claude Opus 5·Fable 5용 Claude Code 시스템 프롬프트의 80% 이상을 지우고도 코딩 평가에서 측정 가능한 손실이 없었고, 그 경험을 여섯 쌍의 "예전엔 이렇게 / 지금은 이렇게"로 정리했다.

## 출처 메타
- URL: https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models
- 매체: Anthropic (claude.com 블로그)
- 저자: Thariq Shihipar, member of technical staff
- 게시일: 2026-07-24
- 수집일: 2026-07-26 KST
- 경위 메모: 커뮤니티에 돌던 요약 글 "[Claude 5 시대, 컨텍스트 설계 7가지 규칙]" 스크린샷이 발단이었다. 그 글의 원문을 특정해 보니 이 Anthropic 블로그였고, **규칙은 7개가 아니라 6개**다(요약 글의 '7가지'는 필자 카운팅). 초판은 인접 글인 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)를 1차 출처로 잡았는데, 원문 특정 후 이 글로 교체하고 여섯 규칙 완전판으로 보강했다. 글 주소(slug)는 이미 공개된 링크가 깨지지 않도록 초판 그대로 둔다.

## 픽업
- 출발점은 자기 반성이다. Anthropic이 스스로 진단한 문제는 프롬프트가 부족한 게 아니라 과했다는 것 — "we were overconstraining Claude Code, both through our system prompt and in our CLAUDE.md files and skills." 그래서 지운다. **"We removed over 80% of Claude Code's system prompt for models like Claude Opus 5 and Claude Fable 5 with no measurable loss on our coding evaluations."**
- 왜 프롬프트가 아니라 '컨텍스트'가 문제인가 — 컨텍스트는 한 번의 요청이 아니라 수많은 요청에 두루 쓰이는 자산이라 프롬프트만큼 구체적일 수 없다: "Unlike a prompt, context is used generally across many requests, so it cannot be as specific." 구체적으로 못 쓰는데 길게 쓰면 제약만 남는다.
- **규칙 ①: 규칙을 주지 말고 판단하게 하라** (Then: Give Claude rules / Now: Let Claude use judgement). "주석 달지 마라" 같은 고정 규칙 대신 판단의 기준을 준다 — "Write code that reads like the surrounding code: match its comment density, naming, and idiom."
- **규칙 ②: 예시를 주지 말고 인터페이스를 설계하라** (Then: Give Claude examples / Now: Design interfaces). 예시는 도움이 되는 만큼 탐색 범위를 가둔다 — "giving examples actually constrains them to a certain exploration space." 도구 이름과 매개변수만으로 사용법이 드러나게 만드는 편이 낫다.
- **규칙 ③: 다 미리 붓지 말고 필요할 때 열어라** (Then: Put it all upfront / Now: Use progressive disclosure). 스킬을 잘게 나눠 두면 "Claude Code can selectively call" 하는 식으로 필요한 순간에만 컨텍스트에 들어온다.
- **규칙 ④: 반복해 적지 말고 도구 설명 한 곳에 적어라** (Then: Repeat yourself / Now: Simple tool descriptions). 같은 사용법을 프롬프트 여기저기 반복하던 것을 지웠다 — "we could delete these repeat examples and put instructions on how to use tools in the tool descriptions."
- **규칙 ⑤: CLAUDE.md에 손으로 적는 기억에서 자동 기억으로** (Then: Memory in CLAUDE.md files / Now: Auto-memory). "Claude now automatically saves memories that are relevant to the work and to you." 사람이 적어 넣어야만 남던 것이 스스로 남는 쪽으로 옮겨간다.
- **규칙 ⑥: 빈약한 명세 대신 풍부한 참조물** (Then: Simple specs / Now: Rich references). 마크다운 명세 한 장보다 코드·테스트 스위트·HTML 목업·평가 루브릭처럼 두꺼운 자료가 낫다 — "Claude can handle increasingly more complicated references."
- 구성 요소마다 맡는 일이 다르다. 시스템 프롬프트는 제품 맥락 — "A system prompt is heavily tied to the product context. It tells Claude what product it's operating in and what it's doing." CLAUDE.md는 저장소가 무엇인지 짧게 적고 대부분의 토큰을 코드베이스의 '함정'에 쓴다. 스킬은 필요할 때 찾아 읽는 가벼운 안내서로 쪼갠다. 참조물은 명세·목업·코드처럼 직접 보여주는 자료다.
- 우리 플릿 대응 — 45% 하드클리어 + 재개 포인터는 컨텍스트를 비우고 이어가는 장치, `tasks.md` 단일 SoT는 창 밖 기억, 대량 읽기 서브에이전트 위임은 본체 창을 지키는 분업, `MEMORY.md` 인덱스 + 파일 분리는 규칙 ③의 점진적 공개 그 자체다. 반대로 규칙 ①·④는 아직 숙제다: 운영 문서에 "하지 마라" 형태의 고정 규칙과 중복 설명이 남아 있다.
- 맺음은 권유형이다 — "Across your system prompt, skills, and CLAUDE.md files, you may need to simplify just like we did." 좋은 컨텍스트는 더하는 일이 아니라 덜어내는 일이 됐다.

## 용어
- **Unhobbling (족쇄 풀기)** [모델 · 운용]: 낡은 제약을 걷어내 모델이 원래 가진 판단력을 쓰게 하는 것. 이 글의 첫 섹션 제목이자 전체 논지.
- **Progressive disclosure (점진적 공개)** [하니스 · 패턴]: 자료를 미리 다 넣지 않고 가벼운 참조만 두었다가 필요한 시점에 열어 단계적으로 발견하게 하는 로딩 전략.
- **Auto-memory (자동 기억)** [하니스 · 패턴]: 사람이 파일에 적어 넣지 않아도 모델이 작업·사용자와 관련된 기억을 스스로 저장하는 방식. CLAUDE.md 수동 메모리의 후속.
- **Rich references (풍부한 참조물)** [하니스 · 패턴]: 짧은 명세 대신 코드·테스트·목업·루브릭처럼 고충실도 자료를 그대로 건네는 방식.
- **Tool description (도구 설명)** [하니스 · 인터페이스]: 사용법을 프롬프트에 반복하는 대신 도구 정의 한 곳에 두는 단일 출처.
- **Context rot (컨텍스트 부패)** [모델 · 한계]: 컨텍스트가 길수록 개별 토큰에 배분되는 주의가 얇아져 정확도가 내려가는 현상. 이 글의 짝이 되는 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)에서 다루는 개념으로, 왜 덜어내야 하는지의 이유에 해당한다.
