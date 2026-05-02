# Substack 본문 이미지 회귀 점검 노트 — 2026-05-02

작성: 2026-05-02 14:30 KST · 작성자: 🪟 WSL (DESKTOP-I4TR99I) · directive: Mac→WSL multi-track A→D Track D

## TL;DR

디렉티브 전제 (`/p/3-ai`, `/p/32b`, `/p/f33` 3편 모두 회귀 의심) 를 소스 markdown 으로 1차 검증한 결과, **실제 회귀는 2편**:

| substack URL | 매핑 | 소스 IMAGE placeholder | assets 디렉토리 | 진단 |
|---|---|---|---|---|
| `https://daejongkang.substack.com/p/3-ai` | Ep.1 | 4개 (`ep1-substack.md`) | `assets/ep1/` 부재 | **회귀 CONFIRMED** |
| `https://daejongkang.substack.com/p/32b` | Ep.5 | 0개 (`ep5-2026-04-30.md`) | — | 회귀 NOT (디자인상 이미지 0) |
| `https://daejongkang.substack.com/p/f33` | Ep.4 | 0개 (`ep4-cache.md`) | — | 회귀 NOT (디자인상 이미지 0) |

추가 — 디렉티브 누락된 회귀:

| substack URL | 매핑 | 소스 IMAGE | assets | 진단 |
|---|---|---|---|---|
| (Ep.2 슬러그 미확정 — `index.json` 에 substackUrl 누락) | Ep.2 | 4개 (`ep2-substack.md`) | `assets/ep2/` 부재 | **회귀 의심** (Ep.1 과 동일 패턴) |

→ Ep.2 substack URL 은 강대종 본진에서 substack archive 로 1회 확인 후 본 문서 갱신 필요.

## 검증 한계

- WSL 은 substack 본문이 JS 하이드레이션 후 렌더되는 부분을 curl 로 못 봄. 소스 markdown 의 placeholder 카운트 vs assets 디렉토리 상태로 1차 추정만 함.
- 디렉티브 권고대로 **Playwright MCP (Mac 본진) 로 실제 발행본 본문 img 카운트 재검증** 필요 후 본 문서 갱신.
- Ep.4 / Ep.5 가 진짜로 본문에 이미지가 0개인지 (소스가 그렇게 디자인) Playwright 재확인하면 100% 확정. 현재는 markdown 신뢰.

## 패치 대상 (회귀 CONFIRMED 시 작업 풀)

### Ep.1 (`/p/3-ai`) — 4 placeholders

| index | label | desc 첫 30자 |
|---|---|---|
| 1 | Hero | "터미널 창 + 폰 텔레그램 창이..." |
| 2 | Architecture | 6칸 블록 다이어그램. LLM/임베딩... |
| 3 | Log capture | `journalctl --user -u gieogi-bot... |
| 4 | Result | 실제 텔레그램 대화 스크린샷... |

### Ep.2 (Ep.2 슬러그 — 본진 확인 후 채움) — 4 placeholders

| index | label | desc 첫 30자 |
|---|---|---|
| 1 | Hero | "텔레그램 채팅창에서 봇이 사라진..." |
| 2 | Quality matrix | 4분면 다이어그램. ① 같은 질문... |
| 3 | Drop terminal | `systemctl --user stop gieogi-bot... |
| 4 | Checklist card | 4문항 체크리스트 카드. 모바일... |

## 자동 fallback 생성 — `scripts/generate_fallback_image.py`

이 PR 에서 추가. PIL+Pretendard 1200×630 placeholder 카드 1개 생성.

```bash
# Ep.1 4컷 일괄 생성 (강대종 GO 시)
python3 scripts/generate_fallback_image.py \
  --caption '🖼 IMAGE 1 (Hero) — "터미널 창 + 폰 텔레그램 창이 나란히..." 1200×630px 권장.' \
  --output newsletter/assets/ep1/01-hero.png
# (2~4 동일)
```

### 한계

- 진짜 시각 정보 없는 텍스트 카드라 글에 더해주는 가치는 적음. 강대종 본인 디자인 (Excalidraw / DALL·E / 실 스크린샷) 이 본 PR 의 fallback 보다 우월. fallback 은 "본문에 raw IMAGE N 텍스트 노출" 회귀를 막는 최소 안전망.
- Substack 발행본의 본문 placeholder 텍스트는 PR 이후 Mac 본진 Playwright 패치 사이클에서 제거 필요 (이 PR scope 밖).

## Mac 본진 follow-up 플랜

1. Playwright MCP 로 `/p/3-ai` 재진입 → 본문 img 카운트 확인 (회귀 100% 확정)
2. Ep.2 substack URL 확정 → 같은 카운트 확인
3. Ep.1 / Ep.2 fallback 자산 8개 생성 (또는 강대종 본인 디자인 우선)
4. Substack 본문 edit → image insert + placeholder 텍스트 제거 → republish
5. `~/daejong-page/newsletter/index.json` 의 Ep.1 / Ep.2 entry 에 `substackUrl` 보강
6. 본 노트의 "회귀 의심" → "회귀 패치 완료" 로 갱신 + 패치된 commit/post URL 기록

## 본 PR 이 다루지 않는 것

- 실제 substack 본문 패치 (Mac 본진 only)
- Ep.4 / Ep.5 의 substack 본문 1차 검증 (markdown 신뢰)
- 실 디자인 자산 생성 (강대종 본인 영역, fallback 만 자동)
- newsletter/index.json 의 Ep.1 / Ep.2 substackUrl 보강 (확인 후 본진에서 1줄 추가)
