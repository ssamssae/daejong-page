---
title: "Claude Code Took Over Unreal Engine 5 and Built a Game"
date: "2026-06-16"
source_url: "https://youtu.be/iRcrZjOt5H8"
source_author: "Stefan 3D AI"
---

## 한 줄 요약
무료 플러그인 2개(Unreal Claude + Vibe UE)와 MCP로 Claude Code를 Unreal Engine 5에 연결해, 프롬프트만으로 endless runner 게임(무한 트랙·3레인·장애물·코인·UI·게임오버)을 실제로 플레이 가능한 수준까지 만들어 본 워크플로우 데모.

## 영상 메타
- URL: https://youtu.be/iRcrZjOt5H8
- 채널: Stefan 3D AI
- 길이: 16분 45초
- 업로드: 2026-06-10
- 조회수: 96,236 / 좋아요 3,867
- 시청일: 2026-06-16 KST (🍎 가 자막 추출 후 요약)

## 픽업
- UE5 + Claude Code 연결은 무료 플러그인 2개 조합이 정답: **Unreal Claude**(MCP 내장 — 뷰포트 스크린샷·오브젝트 이동 담당) + **Vibe UE**(블루프린트 편집·파이썬 스크립트 실행, API 키 필요하지만 자체 에이전트만 안 쓰면 무료). 유료/안 되는 플러그인이 시중에 널렸으니 이 둘만.
- 셋업 = 플러그인 2개 + 이를 UE 씬에 연결하는 MCP 2개 + 의존성(node, MS C++ 라이브러리). 설치 안 된 의존성은 Claude에게 시키면 됨. 설치 후 **에디터 재시작, 때로는 Claude Code까지 재시작**해야 MCP가 잡힘.
- 바이브코딩 시작 전 **무조건 Git 먼저** — 마일스톤마다 "commit해" 프롬프트로 체크포인트를 박아야 언제든 revert 가능. AI 에이전트는 git 버전 추적과 극도로 잘 맞는다.
- Claude는 스스로 게임을 실행→스크린샷→자기 검토(self-review)까지 함. 무한 트랙·자동 전진·3레인 A/D 전환·장애물·코인·점수 UI·게임오버 전부 프롬프트로 구현됨.
- 한계: 블루프린트를 기능적으로는 잘 짜지만 **미적으로는 스파게티**(노드 배치 엉성). "깔끔하게 해줘"로는 안 고쳐짐 — 현 단계에선 사람이 감독 필요. 또 일반적/피상적 프롬프트엔 가장 쉬운 방법으로 구현해 확장성·유지보수가 떨어짐.
- **에셋은 외부에서 준비, Claude는 조직·로직 담당이 베스트 워크플로우**. 3D/이미지 에셋은 ChatGPT 이미지 등으로 미리 만들어 zip+스크린샷으로 드롭하면 Claude가 알아서 이름 맞춰 배치. Claude 자체 생성은 약함.
- 비용 감각: 코인 랜덤 배치(장애물과 안 겹치게) 한 기능에 **15분 / Opus 4.8 토큰 14,000개** 소모 — 복잡한 단위 작업은 꽤 비쌀 수 있음.

## 용어
- **Unreal Engine 5 (UE5)** [기타]: Epic Games의 3D 게임 엔진. 블루프린트(비주얼 스크립팅)와 C++ 기반.
- **Blueprint** [기타]: UE의 노드 기반 비주얼 스크립팅 — 코드 없이 게임 로직을 시각적으로 연결.
- **Unreal Claude** [도구 통신 (MCP · CLI · API)]: UE5용 오픈소스 플러그인. MCP 내장으로 Claude가 뷰포트 스크린샷·오브젝트 이동 가능.
- **Vibe UE** [도구 통신 (MCP · CLI · API)]: UE5용 오픈소스 플러그인. 블루프린트 편집·파이썬 실행 도구 제공(API 키 필요, 자체 에이전트는 유료).
- **MCP (Model Context Protocol)** [도구 통신 (MCP · CLI · API)]: AI 모델과 외부 도구(여기선 UE 씬)를 연결하는 표준 프로토콜.
- **endless runner** [기타]: 캐릭터가 자동 전진하며 장애물 피하고 코인 먹는 게임 장르(서브웨이 서퍼 류).
- **self-review** [하니스 · 패턴]: AI가 작업 결과를 스스로 실행·스크린샷·검토해 검증하는 패턴.
- **PBR (Physically Based Rendering)** [기타]: 물리 기반 렌더링 — 사실적 재질 표현을 위한 텍스처 맵 세트.
