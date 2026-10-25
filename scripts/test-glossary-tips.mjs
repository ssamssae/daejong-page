// T-261025-009 · 글 본문 용어 툴팁(rehype-glossary-tips) — 용어 사전(ai-glossary.html.astro)에 있는 말이
// 인사이트·작업일지 본문에 처음 나올 때 한 줄 풀이를 붙이는 규칙을 검사한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import rehypeGlossaryTips from '../src/lib/rehype-glossary-tips.mjs';
import { parseGlossary } from '../src/lib/glossary-terms.mjs';

const UI_INSIGHT = '2026-10-25-vibe-coding-ui-terms-24-codekkaknoin.md';
const term = (name, definition, source) => `<div class="term">\n  <h3>${name}</h3>\n  <p>${definition}</p>\n  <span class="src">영상: ${source}</span>\n</div>`;
const GLOSSARY = [
  '<!-- BEGIN_GLOSSARY_DATA -->',
  '<h2>기타</h2>',
  term('드로어', '화면 옆에서 서랍처럼 열리는 패널.', UI_INSIGHT),
  term('Claude Code', 'Anthropic 의 CLI 기반 코딩 에이전트.', 'a.md'),
  term('Claude', 'Anthropic 의 AI 모델 이름.', 'b.md'),
  term('MCP', 'AI 가 바깥 도구를 부르는 공용 규격.', 'c.md'),
  term('scaling laws (스케일링 법칙)', '모델·데이터를 키우면 성능이 오른다는 경험 법칙.', 'd.md'),
  term('문서', '이 영상 맥락의 문서.', 'e.md'),
  term('토스트', '빵을 구워 내는 기계 이야기.', 'old.md'),
  term('토스트', '저장 뒤 화면 아래에 잠깐 떴다가 사라지는 알림.', `2026-10-01-x.md, ${UI_INSIGHT}`),
  term('&lt;loop&gt; 명령', '같은 일을 되풀이 시키는 명령.', 'f.md'),
  term('session', '뇌와 손을 묶어 이벤트를 흘리는 세션.', 'g.md'),
  term('Codex', 'OpenAI 의 코딩 에이전트.', 'h.md'),
  term('에이전트', '지시를 받아 코드를 고치는 AI 실행 주체. 영상은 이를 사람이 많아진 것으로 본다.', 'i.md'),
  term('Fable 5', '이 영상에서 발표된 상위 모델.', 'j.md'),
  term('Mythos', '이 대담 시점에 막 공개된 모델.', 'n.md'),
  term('Hermes', '서드파티 에이전트 하니스.', 'k.md'),
  term('Agent / Environment / Session', '강화학습의 세 요소.', 'l.md'),
  term('context window', '모델이 한 번에 볼 수 있는 글의 양.', 'm.md'),
  '<!-- END_GLOSSARY_DATA -->',
].join('\n');

const el = (tagName, children = [], properties = {}) => ({ type: 'element', tagName, properties, children: children.map((c) => (typeof c === 'string' ? { type: 'text', value: c } : c)) });
const root = (...children) => ({ type: 'root', children });
const post = (dir, name) => ({ path: resolve('src/content', dir, name) });
const run = (tree, file = post('worklog', '2026-10-23_v1.0.0.md'), options = {}) => {
  rehypeGlossaryTips({ glossarySource: GLOSSARY, ...options })(tree, file);
  return tree;
};
const tips = (node, found = []) => {
  if (node.type === 'element' && node.properties?.className?.includes('term-tip')) found.push(node);
  for (const child of node.children || []) tips(child, found);
  return found;
};
const text = (node) => (node.type === 'text' ? node.value : (node.children || []).map(text).join(''));
const termOf = (tip) => text(tip.children[0]);
const definitionOf = (tip) => text(tip.children[1]);

test('the first use of a glossary term becomes a button described by its definition', () => {
  const tree = run(root(el('p', ['설정 버튼을 누르면 드로어가 열리고, 다시 드로어를 닫아요.'])));
  const found = tips(tree);
  assert.equal(found.length, 1);
  const [button, body] = found[0].children;
  assert.equal(button.tagName, 'button');
  assert.equal(button.properties.type, 'button');
  assert.equal(text(button), '드로어');
  assert.equal(button.properties.ariaDescribedBy, body.properties.id);
  assert.equal(body.properties.role, 'tooltip');
  assert.equal(text(body), '화면 옆에서 서랍처럼 열리는 패널.');
  assert.equal(body.properties.dataPagefindIgnore, '');
  assert.equal(text(tree), '설정 버튼을 누르면 드로어화면 옆에서 서랍처럼 열리는 패널.가 열리고, 다시 드로어를 닫아요.');
});

test('the longer term wins and Latin terms only match whole words', () => {
  const tree = run(root(el('p', ['ClaudeX 와 MCPs 말고, Claude Code 로 MCP 서버를 붙였다.'])));
  assert.deepEqual(tips(tree).map(termOf), ['Claude Code', 'MCP']);
});

test('a Korean name written in parentheses also matches', () => {
  const tree = run(root(el('p', ['스케일링 법칙이 아직 통한다.'])));
  assert.deepEqual(tips(tree).map(termOf), ['스케일링 법칙']);
  assert.equal(definitionOf(tips(tree)[0]), '모델·데이터를 키우면 성능이 오른다는 경험 법칙.');
});

test('two-letter Korean everyday words and words glued to a longer word stay plain', () => {
  const tree = run(root(el('p', ['문서를 고쳤다. 미니드로어는 다른 말이다.'])));
  assert.deepEqual(tips(tree).map(termOf), []);
});

test('headings, links, code and the insight sections 용어·영상 메타 stay plain', () => {
  const tree = run(root(
    el('h2', ['드로어 정리']),
    el('p', [el('a', ['드로어 안내'], { href: '/x/' }), ' 와 ', el('code', ['드로어']), ' 그리고 MCP.']),
    el('h2', ['영상 메타']),
    el('ul', [el('li', ['Claude Code 영상'])]),
    el('h2', ['용어']),
    el('ul', [el('li', [el('strong', ['드로어']), ': 화면 옆 패널'])]),
  ), post('insights', UI_INSIGHT));
  assert.deepEqual(tips(tree).map(termOf), ['MCP']);
});

test('an insight uses the definition from its own video; other posts use the first one', () => {
  const sentence = () => root(el('p', ['저장하면 토스트가 떠요.']));
  assert.equal(definitionOf(tips(run(sentence(), post('insights', UI_INSIGHT)))[0]), '저장 뒤 화면 아래에 잠깐 떴다가 사라지는 알림.');
  assert.equal(definitionOf(tips(run(sentence()))[0]), '빵을 구워 내는 기계 이야기.');
});

test('everyday English words stay plain even when the glossary capitalizes them; proper names and phrases still match', () => {
  const tree = run(root(el('p', ['새 session 과 agent 를 열었다. Codex 로 고쳤고 Context Window 가 찼다.'])));
  assert.deepEqual(tips(tree).map(termOf), ['Codex', 'Context Window']);
});

test('a term glued into a path or a name stays plain', () => {
  const tree = run(root(el('p', ['claude-skills 저장소와 ~/.codex/ 폴더, MCP_SERVER 값과 MCP-bridge 이름'])));
  assert.deepEqual(tips(tree).map(termOf), []);
});

test('outside its own video a definition keeps only its first sentence, and video-only definitions are left out', () => {
  const worklog = run(root(el('p', ['에이전트가 Fable 5 와 Mythos 로 일했다.'])));
  assert.deepEqual(tips(worklog).map(termOf), ['에이전트']);
  assert.equal(definitionOf(tips(worklog)[0]), '지시를 받아 코드를 고치는 AI 실행 주체.');
  const ownInsight = run(root(el('p', ['에이전트가 Fable 5 로 일했다.'])), post('insights', 'j.md'));
  assert.deepEqual(tips(ownInsight).map(termOf), ['에이전트', 'Fable 5']);
  assert.equal(definitionOf(tips(ownInsight)[1]), '이 영상에서 발표된 상위 모델.');
});

test('our own machine names are not read as glossary words', () => {
  assert.deepEqual(tips(run(root(el('p', ['Athena·Hermes·Vulcan 세 노드를 맞췄다.'])))).map(termOf), []);
});

test('entities in the glossary page are decoded before matching', () => {
  const tree = run(root(el('p', ['<loop> 명령으로 돌렸다.'])));
  assert.deepEqual(tips(tree).map(termOf), ['<loop> 명령']);
});

test('a post gets at most the limit, and each tip has its own id', () => {
  const tree = run(root(el('p', ['드로어와 토스트, 그리고 MCP.'])), undefined, { limit: 2 });
  const found = tips(tree);
  assert.deepEqual(found.map(termOf), ['드로어', '토스트']);
  assert.notEqual(found[0].children[1].properties.id, found[1].children[1].properties.id);
});

test('only insight and worklog posts are touched', () => {
  const tree = run(root(el('p', ['드로어가 열린다.'])), post('newsletter', 'ep1.md'));
  assert.deepEqual(tips(tree), []);
});

test('the real glossary page parses into its terms', () => {
  const entries = parseGlossary(readFileSync('src/pages/ai-glossary.html.astro', 'utf8'));
  assert.ok(entries.length > 900, `entries ${entries.length}`);
  const hero = entries.find((entry) => entry.name === '히어로 섹션');
  assert.ok(hero, '히어로 섹션 is in the glossary');
  assert.ok(hero.sources.includes(UI_INSIGHT));
});
