---
category: Claude Code
tags: [claude-code, token, cache, ttl, 최적화, 비용절감]
---

# Claude Code 캐시 TTL 5분 최적화 — 토큰 절약 리듬

- **출처:** AI 인사이더 클럽 (2026-04-16~17, 다수 멤버 공유)
- **재사용 영역:** Claude Code 장시간 작업, 토큰 비용 최적화

## 한 줄 요약

Anthropic 프롬프트 캐시 TTL은 5분(300초). 같은 컨텍스트에서 **300초 안에 다음 메시지를 보내면 캐시 히트** → 입력 토큰 90% 할인. 리듬 조정만으로 비용 대폭 절감 가능.

## 패턴

### 1. ccctail로 캐시 히트율 모니터링

```bash
uvx ccctail -f            # 실시간 cache miss 로그
uvx ccctail --all > out.txt  # 전체 기록 덤프 후 분석
```

cache_read_input_tokens 가 낮으면 → 300초 이내 후속 메시지 리듬 유지

### 2. 컨텍스트 관리 합의 (그룹 검증)

| 전략 | 권장 여부 | 이유 |
|------|-----------|------|
| 30~40% 사용 후 /clear | ✅ 권장 | 컨텍스트 비대화 방지 |
| /compact | ❌ 비추천 | 요약 중 정보 손실 발생 |
| 80%까지 쓰고 리뷰 | 상황 따라 | 장시간 작업에만 |

### 3. 모델 분업으로 비용 최적화

```
Opus   → 계획 수립, 복잡한 디버깅, 설계 검증 (비싸지만 판단력)
Sonnet → 메인 구현 (기본값)
Haiku  → 파일 읽기, 단순 grep, 반복 검증 (가장 저렴)
```

실용 공식: "Opus로 설계 → Sonnet으로 구현 → Haiku로 검증"

## 주의

- 캐시 히트는 컨텍스트 내용이 동일할 때만 적용. /clear 후에는 캐시 미스
- ccctail은 uvx로 설치 없이 바로 실행 가능 (`uvx ccctail`)
