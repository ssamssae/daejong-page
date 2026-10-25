// T-261025-009 · 용어 사전(src/pages/ai-glossary.html.astro)의 항목을 읽어 글 본문에서 찾을 이름표로 만든다.
// 사전 원본은 scripts/regen-ai-glossary.py 가 인사이트의 「## 용어」에서 모아 BEGIN/END_GLOSSARY_DATA 사이에 쓰는
// <div class="term"><h3>이름</h3><p>풀이</p><span class="src">영상: 파일, 파일</span></div> 이다 — 이 형식을 그대로 읽는다.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (value) => value
  .replace(/<[^>]+>/g, '')
  .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => {
    if (name[0] === '#') return String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    return ENTITIES[name.toLowerCase()] ?? whole;
  })
  .replace(/\s+/g, ' ')
  .trim();

export function parseGlossary(page) {
  const block = page.split('<!-- BEGIN_GLOSSARY_DATA -->')[1]?.split('<!-- END_GLOSSARY_DATA -->')[0] ?? '';
  const entries = [];
  for (const match of block.matchAll(/<div class="term">\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<span class="src">([\s\S]*?)<\/span>/g)) {
    const name = decode(match[1]);
    const definition = decode(match[2]);
    const sources = decode(match[3]).replace(/^영상:\s*/, '').split(/\s*,\s*/).filter(Boolean);
    if (name && definition) entries.push({ name, definition, sources });
  }
  return entries;
}

// 「scaling laws (스케일링 법칙)」 → 두 이름, 「골든 패치 / 테스트 패치」 → 두 이름. 괄호 안에 「/」가 있으면 설명이라 이름으로 쓰지 않는다.
export function termKeys(name) {
  const match = name.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  const [base, alias] = match ? [match[1], match[2]] : [name, ''];
  const keys = base.split(' / ').map((key) => key.trim());
  if (alias && !alias.includes('/')) keys.push(alias.trim());
  return keys.filter(Boolean);
}

// 작업일지가 우리 노드 이름으로 쓰는 말 — 사전에 같은 철자의 다른 뜻(예: Hermes = 에이전트 하니스)이 있어도 풀지 않는다.
const OUR_NAMES = new Set(['athena', 'hermes', 'vulcan', 'zeus', 'apollo', 'themis', 'raiden', '아테나', '헤르메스', '볼칸', '제우스', '아폴론', '테미스', '라이덴']);

// 한국어만 있는 이름은 세 글자 이상 — 「문서」·「채널」·「인증」 같은 두 글자 일상어가 사전 뜻으로 잘못 풀리지 않게.
// 소문자 영어 한 단어(session·context·agent)도 일상어라 풀지 않는다. 대문자 약어(MCP·API)는 두 글자부터, 나머지는 세 글자부터.
export function usableKey(key) {
  if (OUR_NAMES.has(key.toLowerCase()) || /^[a-z]+$/.test(key)) return false;
  const hangul = key.match(/[가-힣]/g)?.length ?? 0;
  const latin = key.match(/[A-Za-z0-9]/g)?.length ?? 0;
  if (hangul && !latin) return hangul >= 3;
  if (/^[A-Z0-9]{2,}$/.test(key)) return true;
  return key.replace(/\s/g, '').length >= 3;
}

// 앞은 한글·영문·숫자나 경로·이름 기호(- _ / . ~)에 붙어 있으면 안 되고(「미니드로어」·「~/.codex」 X), 영문으로 끝나는 이름은 뒤도
// 영문·숫자·- _ / 에 붙지 않아야 한다(「MCPs」·「MCP_SERVER」·「claude-skills」 X). 한국어로 끝나는 이름 뒤에는 조사가 붙으므로 뒤는 보지 않는다.
// 여러 단어 영문 이름(「context window」)만 대소문자를 가리지 않는다. 한 단어 영문 이름은 사전에 쓴 대소문자 그대로 찾는다 —
// 사전이 「Agent / Environment / Session」처럼 첫 글자를 대문자로 쓴 일상어가 본문의 소문자 session 에 걸리지 않게(Codex·Cursor 같은 이름은 그대로 걸린다).
export function termPattern(key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const before = /[가-힣A-Za-z0-9]/.test(key[0]) ? '(?<![가-힣A-Za-z0-9_\\-/.~])' : '';
  const after = /[A-Za-z0-9]/.test(key.at(-1)) ? '(?![A-Za-z0-9_\\-/])' : '';
  const loose = /\s/.test(key) && !/[가-힣]/.test(key) && !/^[A-Z0-9\s]+$/.test(key);
  return new RegExp(before + escaped + after, loose ? 'i' : '');
}

// 같은 이름이 여러 영상에서 나왔으면 풀이를 모두 남긴다(어느 풀이를 쓸지는 글이 정한다). 긴 이름부터 찾도록 길이 순으로 둔다.
export function buildTerms(entries) {
  const byKey = new Map();
  for (const entry of entries) {
    for (const key of termKeys(entry.name)) {
      if (!usableKey(key)) continue;
      const id = key.toLowerCase();
      if (!byKey.has(id)) byKey.set(id, { key, pattern: termPattern(key), definitions: [] });
      byKey.get(id).definitions.push({ text: entry.definition, sources: entry.sources });
    }
  }
  return [...byKey.values()].sort((a, b) => b.key.length - a.key.length);
}
