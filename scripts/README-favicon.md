# favicon / apple-touch-icon 빌더 (`build-favicon.js`)

`homepage_icon.svg` 를 입력으로 `favicon.ico` (multi-resolution) + `apple-touch-icon.png` (180×180) 을 생성하는 self-contained 빌더.

## 입력 / 출력
- 입력: `../homepage_icon.svg` (사이트 fundamental 아이콘 — 노란 그라데이션 + 검은 지구본)
- 출력 1: `../favicon.ico` (16×16, 32×32, 48×48 PNG bundled into ICO)
- 출력 2: `../apple-touch-icon.png` (180×180 PNG)

## 왜 homepage_icon.svg 가 source-of-truth 인가
사이트가 처음부터 사용해 온 fundamental 아이콘. 기존 `sise.html:19` 의 `<link rel="icon" href="./homepage_icon.svg">` 도 이 파일을 가리키고 있었음. og-default.png 의 흰 백/토스블루 톤과 다르지만 favicon 의 site identity 는 homepage_icon 그대로 유지하는 게 정공법 (사용자 인지 보존).

og-default 톤으로 별도 favicon 디자인이 필요하면 본 빌더 복제 후 `SRC_SVG` 만 교체.

## 호출
```bash
cd scripts
npm install                  # 한 번만
node build-favicon.js        # ../favicon.ico + ../apple-touch-icon.png 갱신
# 또는
npm run build:favicon
```

## 디자인 변경 패턴
1. `homepage_icon.svg` 자체를 갈아끼우면 favicon + apple-touch-icon + (sise.html / portfolio.html 등의 다른 사용처) 모두 자동 영향
2. favicon 만 별도 디자인이면 본 빌더 복제 후 `SRC_SVG` 다른 파일로 지정

## 빌드 산출물 git 정책
- `favicon.ico` `apple-touch-icon.png` 자체는 repo 루트에 commit
- 빌드 도구 (`node_modules/`, `package-lock.json`) 는 `.gitignore` (이미 `build-og-image.js` 에서 처리)
- 본 빌더도 결정적 — 동일 입력이면 동일 ICO/PNG 출력
