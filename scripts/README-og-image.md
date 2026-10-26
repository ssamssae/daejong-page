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

T-261012-032: 글별 카드(`src/lib/og-image.mjs`)는 회사홈 다크 팔레트(바탕 #121519·위 띠 #7aa2ff·제목 #e3e7ed)로 그린다. 그림을 바꾸면 `OG_IMAGE_VERSION` 을 올려 og:image 주소를 바꾼다. 공용 카드 버전(`social.png?v=`)은 회사홈 manifest 의 sha256 앞 16자리이고, `scripts/verify-og-images.mjs` 가 빌드 결과의 모든 HTML(정적 public 페이지 포함)이 그 버전을 쓰는지 검사한다. (T-261012-041 부터는 버전 없는 고정 주소 — 아래)

T-261027-001: 공용 카드 주소는 다시 회사홈과 같은 지문 주소 `social.png?v=<manifest sha256 앞 16자리>` 다. 10/27 대종님이 작업장 링크 미리보기에서 10/24 전 검은 카드를 봤다 — 메신저는 그림을 **주소별로** 저장해 두므로, 지문 없는 고정 주소는 그림이 바뀌어도 옛 사본을 다시 쓴다. 지문은 `src/lib/brand-tokens.mjs` 가 회사홈 `https://kangdaejong.com/brand/manifest.json` 한 곳에서 읽고(원본 복사 0), 정적 페이지(`public/*.html`)는 원본에 고정 주소를 둔 채 `scripts/version-shared-og.mjs`(postbuild 첫 단계)가 빌드 결과에서만 바꾼다. 회사홈이 카드를 바꾸면 이 사이트는 다음 빌드(매일 발행)에서 새 지문을 받는다. 이미 공유된 링크의 미리보기는 여전히 텔레그램 @WebpageBot 으로 새로 가져온다.

(이력) T-261012-041: 공용 카드(글 페이지 밖 모든 HTML)는 버전 없는 고정 주소 `https://kangdaejong.com/brand/current/social.png` 하나만 쓴다. 카드 그림을 바꿀 때는 회사홈(kangdaejong-com)의 그림만 바꿔 배포하면 이 사이트의 모든 페이지가 따라간다 — 이 저장소에서 고칠 곳은 없다. 회사홈 `/brand/*` 는 `max-age=0, must-revalidate` 라 고정 주소가 늘 최신 그림을 준다. `?v=` 를 다시 붙이면 `scripts/verify-og-images.mjs` 가 실패로 잡는다. 이미 공유된 링크의 메신저 미리보기는 메신저가 따로 저장한 사본이라 이 수정과 무관하다 — 텔레그램은 @WebpageBot 에 주소를 보내 새로 가져오게 한다.
