/**
 * Per-article share image (T-261010-061).
 * Renders a 1200x630 PNG per worklog/newsletter/insights entry at build time.
 * Fonts come from the pinned `pretendard` npm package (OFL-1.1), never the network.
 * Colors follow src/styles/tokens.css (white, slate, blue).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_COLLECTIONS = Object.freeze({
  worklog: '작업일지',
  newsletter: '뉴스레터',
  insights: '인사이트',
});

export const ogImagePath = (collection, id) => `/og/${collection}/${id}.png`;

const FONT_DIR = join(process.cwd(), 'node_modules/pretendard/dist/public/static');
let fonts;
const loadFonts = () =>
  (fonts ??= [
    [500, 'Pretendard-Medium.otf'],
    [600, 'Pretendard-SemiBold.otf'],
    [700, 'Pretendard-Bold.otf'],
  ].map(([weight, file]) => ({
    name: 'Pretendard',
    data: readFileSync(join(FONT_DIR, file)),
    weight,
    style: 'normal',
  })));

const h = (type, style, children) => ({ type, props: { style, children } });

// Shorter titles get a bigger size; every size is clamped to 3 lines with an ellipsis.
const titleSize = (title) => (title.length <= 22 ? 68 : title.length <= 44 ? 58 : 50);

export function ogTree({ collection, title, date, version }) {
  const label = OG_COLLECTIONS[collection];
  const clean = String(title).replace(/\s+/g, ' ').trim();
  // Same version label as ArticleFrame: EP148 for newsletters, v1.0.0 for worklogs.
  const meta = [date, version && (/^ep/i.test(version) ? version.toUpperCase() : `v${version}`)]
    .filter(Boolean)
    .join(' · ');
  return h(
    'div',
    {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 80px 56px',
      background: '#ffffff',
      borderTop: '12px solid #2458cc',
      fontFamily: 'Pretendard',
      color: '#242930',
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        h(
          'div',
          {
            display: 'flex',
            padding: '8px 20px',
            borderRadius: 999,
            background: '#eef3ff',
            color: '#2458cc',
            fontSize: 26,
            fontWeight: 700,
          },
          label,
        ),
        meta && h('div', { display: 'flex', color: '#626b78', fontSize: 26, fontWeight: 500 }, meta),
      ].filter(Boolean)),
      h(
        'div',
        {
          display: 'block',
          width: OG_WIDTH - 160, // root padding 80px on each side
          fontSize: titleSize(clean),
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          wordBreak: 'keep-all',
          overflow: 'hidden',
          lineClamp: 3,
          maxHeight: titleSize(clean) * 1.3 * 3,
        },
        clean,
      ),
      h(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 28,
          borderTop: '2px solid #e6e8ed',
          fontSize: 26,
        },
        [
          h('div', { display: 'flex', fontWeight: 600 }, '마이너스베타스튜디오 작업장'),
          h('div', { display: 'flex', fontWeight: 500, color: '#626b78' }, 'work.kangdaejong.com'),
        ],
      ),
    ],
  );
}

export async function renderOgPng(entry) {
  const svg = await satori(ogTree(entry), { width: OG_WIDTH, height: OG_HEIGHT, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}
