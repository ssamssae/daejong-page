---
category: 파이프라인
tags: [sync, backfill, file-naming, newsletter, cache, pipeline, overwrite-prevention]
related_issues:
  - 2026-05-01-ep5-backfill-overwrite
---

# 동기화 스크립트는 원본 파일을 절대 덮어쓰지 않는다 — 원본/캐시 파일 분리 필수

- **첫 발견:** 2026-05-01 (sync_from_substack.py가 EP5 원본 산문 `ep5-substack.md`를 backfill 결과로 덮어씀 → 원본 3500자 소멸)
- **재사용 영역:** 외부 서비스(Substack, Notion, CMS 등)에서 데이터를 가져와 로컬 파일에 캐시하는 모든 동기화 스크립트.

## 한 줄 요약

외부 서비스 sync/backfill 스크립트가 쓰는 캐시 파일 경로는 **원본 콘텐츠 파일과 반드시 달라야 한다.** 캐시 파일명을 원본과 같게 두면 sync 실행 때마다 원본이 덮여 git history에서만 복구 가능한 사고가 발생한다.

## 패턴

```
# 파일 역할 분리 규칙
ep<N>-<YYYY-MM-DD>.md    ← 원본 산문 (SoT, 수동 작성, 동기화 스크립트 접근 금지)
ep<N>-cache.md           ← backfill/sync 결과 (스크립트 전용, 원본과 별도 경로)
```

```python
# 동기화 스크립트 내 assert (Python 예시)
import os, re

PROTECTED_PATTERN = re.compile(r'ep\d+-\d{4}-\d{2}-\d{2}\.md')

def safe_write(path: str, content: str):
    assert not PROTECTED_PATTERN.search(os.path.basename(path)), \
        f"ABORT: 원본 파일 {path} 에 sync 결과 쓰기 금지"
    with open(path, 'w') as f:
        f.write(content)
```

```bash
# 새 에피소드 시작 시 원본 파일 먼저 commit (강제 순서)
git add newsletter/ep<N>-<DATE>.md
git commit -m "ep<N>: 원본 산문 초안"
# → 이 커밋 후에만 외부 발행 허용
```

## 왜 이렇게 해야 하는가

- 편집본 파일명과 sync 스크립트 cacheFile 경로가 같으면 스크립트 실행마다 원본 덮어쓰기.
- `ep<N>-substack.md` 처럼 "substack에서 왔다"는 힌트가 있어도 그 파일이 원본 산문일 경우 스크립트가 구분할 수 없음.
- git history로 복구는 가능하지만 복구 시점까지 원본이 없는 상태로 외부 발행이 진행될 수 있음.

## 하지 말아야 할 것

- cacheFile 경로를 원본 콘텐츠 파일과 같게 설정
- 동기화 스크립트에 원본 파일 보호 assertion 없이 배포
- 원본 commit 전 외부 발행 먼저 진행 (발행 후 원본 소멸 사고의 직접 원인)

## Forcing Function

- sync 스크립트 상단에 `PROTECTED_PATTERN` assert 1줄 — 원본 경로와 같은 파일명이면 즉시 abort
- 원본 파일 네이밍 컨벤션 통일: `ep<N>-<YYYY-MM-DD>.md` 고정 (연월일 포함 파일은 원본)
- CI/pre-commit: `ep*-[0-9]*.md` 에 해당하는 파일이 스크립트 자동 실행 트리거로 수정되면 경고

## 관련 이슈 (포스트모템)

- `issues/2026-05-01-ep5-backfill-overwrite.md`
