---
category: 자동화
tags: [newsletter, substack, sync, cache, file-naming, source-of-truth]
related_issues:
  - 2026-05-01-ep5-backfill-overwrite
---

# 뉴스레터 원본 파일과 싱크 캐시 파일은 반드시 분리

- **첫 발견:** 2026-04-30/2026-05-01 (sync_from_substack.py 가 ep5 원본을 backfill 캐시로 덮어씀)
- **재사용 영역:** 외부 플랫폼(Substack, 네이버 블로그 등) ↔ 로컬 마크다운 sync 파이프라인 전반.

## 한 줄 요약

로컬 원본 파일과 외부 플랫폼 backfill 캐시가 **같은 파일명을 공유하면** sync 스크립트가 원본을 덮어쓴다. **파일명 컨벤션을 처음부터 둘로 나눠야** 한다.

## 컨벤션 (daejong-page/newsletter/)

| 파일 패턴 | 용도 | 수정 주체 | sync 스크립트 접근 |
|---|---|---|---|
| `ep<N>-<YYYY-MM-DD>.md` | **원본 prose** — 발행 전 편집 파일 | 사람 / Claude Code | 읽기 전용, 절대 덮어쓰기 X |
| `ep<N>-cache.md` | **backfill 캐시** — Substack/네이버에서 가져온 HTML→markdown 변환본 | sync 스크립트 전용 | 자유롭게 덮어쓰기 가능 |

## 규칙

1. **신규 ep 작성 시**: `ep<N>-<DATE>.md` 먼저 commit → 그 다음에 외부 플랫폼 발행.
2. **Substack/네이버 backfill 시**: sync 스크립트 cacheFile 경로를 `ep<N>-cache.md` 로 명시. `ep<N>-<DATE>.md` 경로를 입력으로 받지 않는다.
3. **sync 스크립트 guard**: 원본 파일(`ep<N>-<DATE>.md` 패턴) 경로에 쓰기를 시도하면 assert/exit 1.

## 코드 guard 예시 (Python)

```python
import re, sys

OUTPUT_PATH = "newsletter/ep6-cache.md"  # 항상 -cache.md

# 실수로 원본 경로로 덮어쓰는 것 방지
if re.search(r'ep\d+-\d{4}-\d{2}-\d{2}\.md$', OUTPUT_PATH):
    sys.exit("원본 파일 덮어쓰기 금지. -cache.md 사용하세요.")
```

## 기존 ep 마이그레이션

`ep<N>-substack.md` 처럼 컨벤션 이전의 파일이 있으면:
```bash
git mv newsletter/ep4-substack.md newsletter/ep4-2026-04-30.md
git mv newsletter/ep5-substack.md newsletter/ep5-2026-04-30.md
git commit -m "newsletter: 원본 파일명 컨벤션 통일 (ep4/5)"
```

## 함정

- `ep<N>.md` 처럼 날짜 없는 단순 이름도 캐시로 오인 → 날짜 포함 필수
- sync 스크립트가 여러 명(또는 여러 세션)에서 동시에 실행되면 -cache.md 도 race 가능 → 단일 실행 보장 필요 (lockfile 또는 cron 단일 트리거)

## 관련 이슈 (포스트모템)

- `issues/2026-05-01-ep5-backfill-overwrite.md` — Ep5 원본 prose 덮어쓰기 사고 원본
