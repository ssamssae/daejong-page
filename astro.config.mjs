import { defineConfig } from 'astro/config';
import remarkNoteLinks from './src/lib/remark-note-links.mjs';
import sitemap from '@astrojs/sitemap';

// T-260728-093 축2: sitemap 을 수기 정적 파일(31 URL)에서 자동생성으로 전환.
//   수기본은 worklog·newsletter·insights 개별 글을 담지 못해 색인이 링크 크롤링에만
//   의존했다. 구 파일은 삭제하지 않고 _retired/ 로 보관했다(원칙7).
//
// ⚠️ noindex 판정 페이지는 sitemap 에 넣지 않는다 — 색인하지 말라고 말한 페이지를
//   색인해달라고 제출하는 모순을 막는다. 현행 대상은 /apps 1건이고
//   T-260728-063 에서 "의도적 noindex" 로 판정됐다(해제 금지).
//   페이지를 추가로 noindex 하면 이 목록에도 같이 넣어야 한다.
// T-261012-040: 옛 주소 이동 껍데기 5곳(src/pages/*.html.astro, noindex)도 사이트맵 밖에 둔다.
const NOINDEX_PATHNAMES = ['/apps', '/apps/', '/404', '/404/', '/404.html', '/worklog.html', '/worklog.html/', '/newsletter.html', '/newsletter.html/', '/insights.html', '/insights.html/', '/insight.html', '/insight.html/', '/portfolio.html', '/portfolio.html/'];

export default defineConfig({
  site: 'https://work.kangdaejong.com',
  output: 'static',
  markdown: { remarkPlugins: [['remark-gfm', { singleTilde: false }], remarkNoteLinks] },
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHNAMES.includes(new URL(page).pathname),
    }),
  ],
  // P4 (T-260609-05) 레거시 URL 이동은 T-261012-040 부터 src/pages/<옛이름>.html.astro 껍데기(공유 카드 포함)가 맡는다.
});
