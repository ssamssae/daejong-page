# Substack 본문 이미지 회귀 점검 노트 — 2026-05-02

작성: 2026-05-02 14:30 KST · 작성자: 🪟 WSL (DESKTOP-I4TR99I) · directive: Mac→WSL multi-track A→D Track D

## TL;DR

디렉티브 전제 (`/p/3-ai`, `/p/32b`, `/p/f33` 3편 모두 회귀 의심) 를 소스 markdown 으로 1차 검증한 결과, **실제 회귀는 2편**:

| substack URL | 매핑 | 소스 IMAGE placeholder | assets 디렉토리 | 진단 |
|---|---|---|---|---|
| `https://daejongkang.substack.com/p/3-ai` | Ep.1 | 4개 (`ep1-substack.md`) | `assets/ep1/` 생성 ✅ | **회귀 CONFIRMED + fallback 자산 적재 완료** |
| `https://daejongkang.substack.com/p/463` | Ep.2 | 4개 (`ep2-substack.md`) | `assets/ep2/` 생성 ✅ | **회귀 CONFIRMED + fallback 자산 적재 완료** |
| `https://daejongkang.substack.com/p/70-0-1` | Ep.3 | (이번 점검 대상 아님) | (별개) | 본문 IMAGE N 텍스트 0 — 회귀 NOT |
| `https://daejongkang.substack.com/p/32b` | Ep.5 | 0개 (`ep5-2026-04-30.md`) | — | 회귀 NOT (디자인상 이미지 0) |
| `https://daejongkang.substack.com/p/f33` | Ep.4 | 0개 (`ep4-cache.md`) | — | 회귀 NOT (디자인상 이미지 0) |

→ Ep.2 슬러그 = `/p/463` 로 본진 Mac 에서 RSS 피드 (`/feed`) + curl 비교로 확정 (2026-05-02 15:50 KST).

## 검증 한계

- ~~WSL 은 substack 본문이 JS 하이드레이션 후 렌더되는 부분을 curl 로 못 봄.~~ → Mac 본진에서 curl 만으로도 raw HTML 안에 `IMAGE 1`/`IMAGE 2`/`IMAGE 3`/`IMAGE 4` 리터럴 텍스트가 그대로 노출돼있어 회귀 100% 확정. JS 하이드레이션 무관하게 본문 placeholder 텍스트가 그대로 발행본에 박혀있는 패턴.
- Ep.4 / Ep.5 / Ep.3 도 같은 grep 으로 0건 확인 → 소스 markdown 신뢰 가능.

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

1. ~~Playwright MCP 로 `/p/3-ai` 재진입 → 본문 img 카운트 확인~~ → 본진 curl grep `IMAGE [0-9]` 으로 회귀 100% 확정 (2026-05-02 15:50 KST). Playwright 불필요.
2. ~~Ep.2 substack URL 확정~~ → `/p/463` 으로 확정 (RSS feed + 제목 매칭). 같은 IMAGE 1/2/3/4 노출 확인.
3. ~~Ep.1 / Ep.2 fallback 자산 8개 생성~~ → 본진 `mac/track-d-fallback-assets-2026-05-02` 브랜치에서 PIL+Pretendard 8컷 적재 완료 (1200×630). 강대종님은 본인 디자인 우선이지만 그동안 IMAGE N 텍스트 노출 차단을 위해 fallback 박는 하이브리드 채택.
4. Substack 본문 edit → image insert + placeholder 텍스트 제거 → republish (Ep.1, Ep.2). **PENDING** — Mac 본진 Playwright MCP 가 cwd 이슈로 안 떠있음, 별도 수정 후 진행.
5. ~~index.json 의 Ep.1 / Ep.2 entry 에 `substackUrl` 보강~~ → Ep.1 / Ep.2 / Ep.3 모두 보강 완료 (Ep.3 도 누락 발견).
6. 본 노트의 "회귀 의심" → "회귀 패치 완료" 로 갱신 + 패치된 commit/post URL 기록 → Substack republish 후 별도 PR 에서 마무리.

## 본 PR 이 다루지 않는 것

- 실제 substack 본문 패치 (Mac 본진 only)
- Ep.4 / Ep.5 의 substack 본문 1차 검증 (markdown 신뢰)
- 실 디자인 자산 생성 (강대종 본인 영역, fallback 만 자동)
- newsletter/index.json 의 Ep.1 / Ep.2 substackUrl 보강 (확인 후 본진에서 1줄 추가)
