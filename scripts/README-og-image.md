# OG 이미지 빌더 (`build-og-image.js`)

1200×630 PNG SNS 공유 이미지 (`og-default.png`) 를 생성하는 self-contained 빌더.

## 왜 Node + @resvg/resvg-js 인가
- WSL Ubuntu 24.04 PEP 668 가 `pip install Pillow` 차단
- 시스템에 ImageMagick · rsvg-convert · inkscape · chromium 모두 부재 가능
- `@resvg/resvg-js` = Rust native SVG renderer, npm prebuilt binary, 시스템 폰트 의존 0
- 폰트는 `cdn.jsdelivr.net/Pretendard` 에서 `.fonts/` 로 자동 fetch (one-shot)

## 호출
```bash
cd scripts
npm install                        # 한 번만
node build-og-image.js             # ../og-default.png 갱신
node build-og-image.js out.png     # 임의 경로 출력
# 또는
npm run build:og
```

## 디자인 변형 패턴
이벤트별·페이지별 og:image 가 필요하면 본 파일의 `svg` 템플릿 + `OUTPUT` 인자만 갈아끼우면 됩니다.

예시 — 출시 앱별 카드:
1. `build-og-image.js` 복사 → `build-og-app-{slug}.js`
2. 상단 텍스트를 앱 이름 / 한 줄 카피로 교체
3. `node build-og-app-{slug}.js ../store/og-{slug}.png`

폰트·캔버스·렌더 옵션은 그대로 재사용. 색상 톤 가이드는 `~/.claude/CLAUDE.md` (사이트 카드 톤) 참고.

## 빌드 산출물 git 정책
- `og-default.png` 자체는 repo 루트에 commit (이미 `863fdd5` 에 머지됨)
- `.fonts/` Pretendard OTF (4.5MB) 는 `.gitignore` — repo bloat 회피, 빌더가 cdn 에서 매번 fetch
- `node_modules/` `package-lock.json` 도 `.gitignore`
- 본 빌더가 결정적 — 동일 입력이면 동일 PNG 출력. 빌드 reproducibility OK.
