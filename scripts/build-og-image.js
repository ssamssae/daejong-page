// OG 공유 이미지 빌더 — 1200×630 PNG 생성.
//
// 사용:
//   cd scripts && npm install
//   node build-og-image.js [output.png]
//
// 기본 출력: ../og-default.png (repo 루트).
// 폰트 (Pretendard OTF 3 weight) 는 처음 호출 시 cdn.jsdelivr.net 에서 .fonts/ 로 자동 다운로드.
// 시스템 폰트·ImageMagick·Pillow 의존 없음. WSL Ubuntu PEP 668 차단 환경에서도 동작.
//
// 디자인 변형 (이벤트별 / 페이지별 og:image) 필요 시 본 파일의 svg 템플릿만 수정.

const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONT_DIR = path.join(__dirname, '.fonts');
const FONT_BASE =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static';
const FONT_FILES = [
  'Pretendard-Bold.otf',
  'Pretendard-SemiBold.otf',
  'Pretendard-Regular.otf',
];

const DEFAULT_OUTPUT = path.resolve(__dirname, '..', 'og-default.png');
const OUTPUT = path.resolve(process.argv[2] || DEFAULT_OUTPUT);

function downloadTo(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

async function ensureFonts() {
  if (!fs.existsSync(FONT_DIR)) fs.mkdirSync(FONT_DIR, { recursive: true });
  for (const name of FONT_FILES) {
    const dest = path.join(FONT_DIR, name);
    if (fs.existsSync(dest)) continue;
    process.stdout.write(`fetch ${name} ... `);
    await downloadTo(`${FONT_BASE}/${name}`, dest);
    process.stdout.write('ok\n');
  }
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect x="0" y="0" width="12" height="630" fill="#3182F6"/>
  <text x="90" y="260" font-family="Pretendard" font-weight="700" font-size="160" fill="#191F28">강대종</text>
  <text x="92" y="340" font-family="Pretendard" font-weight="600" font-size="48" fill="#4A5568">Solo founder · Vibe coder</text>
  <text x="92" y="410" font-family="Pretendard" font-weight="400" font-size="32" fill="#4E5968">Flutter · Claude Code · 1인 앱 개발</text>
  <text x="92" y="540" font-family="Pretendard" font-weight="600" font-size="36" fill="#3182F6">kangdaejong.com</text>
  <text x="1108" y="600" text-anchor="end" font-family="Pretendard" font-weight="400" font-size="20" fill="#8B95A1">@ssamssae · 2026</text>
</svg>`;

async function main() {
  await ensureFonts();
  const opts = {
    fitTo: { mode: 'width', value: 1200 },
    background: 'rgba(255, 255, 255, 1)',
    font: {
      fontFiles: FONT_FILES.map((n) => path.join(FONT_DIR, n)),
      loadSystemFonts: false,
      defaultFontFamily: 'Pretendard',
    },
  };
  const resvg = new Resvg(svg, opts);
  const pngData = resvg.render().asPng();
  fs.writeFileSync(OUTPUT, pngData);
  console.log(`OK ${OUTPUT} (${pngData.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
