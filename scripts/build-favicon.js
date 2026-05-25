// favicon.ico + apple-touch-icon.png 빌더.
//
// 입력: ../homepage_icon.svg (사이트 fundamental 아이콘 — 노란 그라데이션 + 검은 지구본)
// 출력:
//   ../favicon.ico (multi-resolution 16/32/48 PNG bundled into ICO)
//   ../apple-touch-icon.png (180×180 PNG)
//
// 사용:
//   cd scripts && npm install
//   node build-favicon.js
//
// site identity 보존 위해 homepage_icon.svg 를 그대로 raster 변환.
// og-default.png 톤 (토스블루) 과 다른 톤이지만 site favicon 의 source-of-truth 는
// 처음부터 homepage_icon.svg 였음 (sise.html:19 의 <link rel="icon"> 도 이 파일).

const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default;

const ROOT = path.resolve(__dirname, '..');
const SRC_SVG = path.join(ROOT, 'homepage_icon.svg');
const OUT_ICO = path.join(ROOT, 'favicon.ico');
const OUT_APPLE = path.join(ROOT, 'apple-touch-icon.png');

const ICO_SIZES = [16, 32, 48];
const APPLE_TOUCH_SIZE = 180;

function renderSvgToPng(svg, size) {
  const opts = {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0, 0, 0, 0)',
    font: { loadSystemFonts: false },
  };
  const resvg = new Resvg(svg, opts);
  return resvg.render().asPng();
}

async function main() {
  const svg = fs.readFileSync(SRC_SVG, 'utf8');

  // 1. ICO: 16/32/48 PNG → multi-resolution ICO
  const icoPngs = ICO_SIZES.map((size) => renderSvgToPng(svg, size));
  const icoBuf = await pngToIco(icoPngs);
  fs.writeFileSync(OUT_ICO, icoBuf);
  console.log(`OK ${OUT_ICO} (${icoBuf.length} bytes, sizes ${ICO_SIZES.join('/')})`);

  // 2. apple-touch-icon: 180×180 PNG
  const applePng = renderSvgToPng(svg, APPLE_TOUCH_SIZE);
  fs.writeFileSync(OUT_APPLE, applePng);
  console.log(`OK ${OUT_APPLE} (${applePng.length} bytes, ${APPLE_TOUCH_SIZE}×${APPLE_TOUCH_SIZE})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
