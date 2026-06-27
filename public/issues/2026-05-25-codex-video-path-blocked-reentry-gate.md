---
date: 2026-05-25
node: 💻 notebook3060
severity: low
status: blocked-until-reentry
tags: [codex, video, cost, preflight, reentry-gate, side-project]
prevention_deferred: null
---

# codex 영상 생성 path 차단 — 추가결제 금지 상태에서 env 점검과 카피 작성으로 토큰 낭비

- **발생 일자:** 2026-05-25 KST
- **심각도:** low (외부 발송/결제 사고는 없음, 토큰과 시간 낭비)
- **재발 가능성:** medium → low (preflight gate 를 지키면 낮음)
- **영향 범위:** codex 노드의 영상 제작 task, 뉴스레터/콘텐츠 B 트랙

## 사건

T-260525-24 후속 정리. B 트랙 영상 발행 시도 중 codex 노드가 영상 생성/편집 경로를 계속 탐색했지만, 실제 실행 가능한 무료 경로가 없었다.

확인된 차단점:

1. `sora.com` / `sora.openai.com` 은 접근 경로가 sunset 또는 `chatgpt.com/sora` 리다이렉트로 막혔다.
2. OpenAI TTS / Platform API 경로는 ChatGPT Plus 구독과 별도 결제라서 형님 의도인 "추가결제 X" 에 위반된다.
3. WSL 쪽에 `ffmpeg`, Pexels, Pixabay 기반 영상 제작 경로가 준비돼 있지 않았다.
4. 실행 불가능한 상태에서 env 점검과 카피 작성에 codex 토큰 16,579 + 5,714 를 소비했다.

## 결정

영상 path 는 아래 재진입 조건 중 하나가 충족될 때까지 보류한다.

1. OpenAI 가 새 video generation product 를 출시하고, 그 경로가 ChatGPT Plus 포함 또는 codex 사용 예산 안에서 동작한다.
2. 형님이 OpenAI Platform 결제를 명시 승인한다.
3. 무료 video generation tier 또는 무료 로컬/웹 도구가 발견되고, 실제 1편 PoC 로 검증된다.

그 전까지 뉴스레터/콘텐츠 확장은 영상보다 웹툰, 정적 카드, 이미지 슬라이드, 텍스트 기반 발행 path 를 우선한다.

## 재발 원인

- "영상 만들기" directive 를 받으면 바로 카피/콘티 작성으로 들어가도 된다는 암묵 전제.
- 비용 승인과 도구 가용성 확인이 creative work 뒤에 붙어 있었다.
- WSL executor 의 로컬 미디어 스택 부재를 차단 조건으로 즉시 판단하지 않고 계속 우회 경로를 찾았다.

## 재진입 전 preflight

영상 관련 task 는 카피/콘티/스토리보드 작성 전에 다음을 먼저 통과해야 한다.

1. **비용 게이트:** 추가 결제가 0원인지, 아니면 형님 명시 승인 범위 안인지 확인.
2. **생성 게이트:** video generation 또는 렌더링 도구가 실제 사용 가능해야 한다.
3. **로컬 도구 게이트:** 필요한 경우 `ffmpeg` 등 렌더링 도구가 설치돼 있어야 한다.
4. **소스 게이트:** Pexels/Pixabay/자체 이미지 등 소재 라이선스와 접근 경로가 확인돼야 한다.
5. **PoC 게이트:** 전체 시리즈가 아니라 1편 샘플 산출물로 먼저 검증한다.

하나라도 실패하면 "영상 path 차단, 웹툰/정적 카드 우선" 으로 보고하고 종료한다. 차단 상태에서 카피 작성만 계속하는 것은 금지한다.

## 관련 task

- `T-260525-02` — 뉴스레터 Ep1~12 영상 발행 초안/PoC 흐름
- `T-260525-24` — codex 영상 path 차단 lesson + 재진입 조건

## 재발 이력

<처음 생성 시 비워둠>
