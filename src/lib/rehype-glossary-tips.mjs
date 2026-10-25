import { readFileSync } from 'node:fs';
import { basename, resolve, sep } from 'node:path';
import { buildTerms, parseGlossary } from './glossary-terms.mjs';

// T-261025-009 · 인사이트 「바이브코더 필수 UI 용어 24가지」의 툴팁 — 용어 사전에 있는 말이 인사이트·작업일지 본문에
// 처음 나올 때 그 말을 버튼으로 바꾸고 한 줄 풀이를 붙인다(모양·여닫기는 src/components/TermTips.astro).
//   · 글마다 같은 말은 처음 한 번만, 한 글에 최대 limit 개까지 — 밑줄이 글을 덮지 않게.
//   · 제목·링크·코드·버튼 안과 인사이트의 「용어」(이미 풀이 목록)·「영상 메타」 구역은 건드리지 않는다.
//   · 인사이트는 그 영상에서 나온 풀이를 그대로 쓴다. 그 밖의 글은 사전 풀이의 첫 문장만 쓰고(한 줄 풀이),
//     첫 문장이 영상 속 상황(「영상」·「발화자」·「대담」·「강연」·「인터뷰」)을 말하면 그 풀이는 건너뛴다(어느 영상인지 모르는 글에서 헷갈리지 않게).
//     쓸 풀이가 없으면 그 말은 두고 간다.
//   · 풀이는 사이트 검색 색인에 넣지 않는다(data-pagefind-ignore).
const POSTS = ['insights', 'worklog'];
const SKIP_TAGS = new Set(['a', 'button', 'code', 'pre', 'kbd', 'samp', 'script', 'style', 'svg', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const SKIP_SECTIONS = new Set(['용어', '영상 메타']);
const LIMIT = 12;

const textOf = (node) => (node.type === 'text' ? node.value : (node.children || []).map(textOf).join(''));

function collectTexts(tree) {
  const texts = [];
  const walk = (node, parent) => {
    if (node.type === 'text') {
      if (node.value.trim()) texts.push({ node, parent });
      return;
    }
    if (node.type !== 'element' || SKIP_TAGS.has(node.tagName)) return;
    for (const child of [...node.children]) walk(child, node);
  };
  let skipping = false;
  for (const child of tree.children || []) {
    if (child.type === 'element' && child.tagName === 'h2') skipping = SKIP_SECTIONS.has(textOf(child).trim());
    if (!skipping) walk(child, tree);
  }
  return texts;
}

const firstSentence = (text) => text.split(/(?<=[.!?])\s+/)[0];
function pickDefinition(term, post) {
  const own = term.definitions.find((definition) => definition.sources.includes(post));
  if (own) return own.text;
  return term.definitions.map((definition) => firstSentence(definition.text)).find((sentence) => !/영상|발화자|대담|강연|인터뷰/.test(sentence)) ?? null;
}

const tipNode = (label, definition, n) => ({
  type: 'element', tagName: 'span', properties: { className: ['term-tip'] }, children: [
    { type: 'element', tagName: 'button', properties: { type: 'button', className: ['term-tip-term'], ariaDescribedBy: `term-tip-${n}` }, children: [{ type: 'text', value: label }] },
    { type: 'element', tagName: 'span', properties: { id: `term-tip-${n}`, role: 'tooltip', className: ['term-tip-body'], dataPagefindIgnore: '' }, children: [{ type: 'text', value: definition }] },
  ],
});

export default function rehypeGlossaryTips({ glossarySource, glossaryPath = 'src/pages/ai-glossary.html.astro', limit = LIMIT } = {}) {
  const roots = POSTS.map((dir) => resolve('src/content', dir) + sep);
  let terms = null;
  return (tree, file) => {
    const source = resolve(String(file?.path || ''));
    if (!roots.some((root) => source.startsWith(root))) return;
    terms ??= buildTerms(parseGlossary(glossarySource ?? readFileSync(glossaryPath, 'utf8')));
    const texts = collectTexts(tree);
    // 글 전체에 한 번이라도 나오는 이름만 추린 뒤 글자 조각마다 찾는다(사전 1,000여 개 × 조각 수를 피한다).
    const whole = texts.map(({ node }) => node.value).join('\n');
    const post = basename(source);
    const definitions = new Map();
    for (const term of terms) {
      if (!term.pattern.test(whole)) continue;
      const definition = pickDefinition(term, post);
      if (definition) definitions.set(term, definition);
    }
    const candidates = [...definitions.keys()];
    const used = new Set();
    let count = 0;
    for (const { node, parent } of texts) {
      if (count >= limit || used.size === candidates.length) break;
      const pieces = [];
      let rest = node.value;
      while (rest && count < limit) {
        let best = null;
        for (const term of candidates) {
          if (used.has(term)) continue;
          const match = term.pattern.exec(rest);
          if (match && (!best || match.index < best.index || (match.index === best.index && match[0].length > best.label.length))) best = { index: match.index, label: match[0], term };
        }
        if (!best) break;
        used.add(best.term);
        count += 1;
        if (best.index) pieces.push({ type: 'text', value: rest.slice(0, best.index) });
        pieces.push(tipNode(best.label, definitions.get(best.term), count));
        rest = rest.slice(best.index + best.label.length);
      }
      if (!pieces.length) continue;
      if (rest) pieces.push({ type: 'text', value: rest });
      parent.children.splice(parent.children.indexOf(node), 1, ...pieces);
    }
  };
}
