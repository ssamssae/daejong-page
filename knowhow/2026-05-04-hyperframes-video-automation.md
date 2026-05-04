---
category: AI 도구
tags: [hyperframes, claude-code, 영상자동화, tts, 자막, remotion, 콘텐츠생성]
---

# Hyperframes — CC 스킬로 스크립트→TTS→자막→영상 풀자동화

- **출처:** AI 인사이더 클럽 (2026-04-26, FinPred 공유)
- **재사용 영역:** 설명 영상, 쇼츠, 피치 덱 영상 자동 생성

## 한 줄 요약

`heygen-com/hyperframes` CC 스킬을 추가하면 자연어 지시 한 줄로 스크립트 작성 → TTS 생성 → 자막 합성 → 영상 렌더링 전 과정 자동화.

## 패턴

### 1. 스킬 추가 (1회)

```bash
npx skills add heygen-com/hyperframes
```

### 2. 영상 생성 명령

```bash
claude --model sonnet --dangerously-skip-permissions -p \
  "Use hyperframes. 뉴턴 이론의 한계를 설명하는 1분 한국어 피치 비디오 만들어. 배경음악 낮게, 한국어 자막 포함."
```

### 3. Remotion (React 기반 대안)

React 코드로 영상을 프로그래밍 방식으로 생성. 데이터 시각화 영상, 반복 포맷 콘텐츠에 적합.

```bash
npx create-video@latest
```

## 주의

- HeyGen API 키 필요 (유료)
- `--dangerously-skip-permissions` 는 격리된 개발 환경에서만 사용
- 한국어 TTS 품질은 HeyGen 계정 플랜에 따라 다름
