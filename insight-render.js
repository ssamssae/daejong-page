const ALLOWED_TAGS = new Set([
  'div', 'span', 'a', 'p', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'blockquote', 'pre', 'code',
  'strong', 'em', 'hr', 'dl', 'dt', 'dd', 'br'
]);

export function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// href 스킴 allowlist — http(s) 절대 URL 만 통과, javascript:/data: 등 위험 스킴은 '#' 로 무력화
export function safeUrl(u) {
  const s = (u || '').trim();
  return /^https?:\/\//i.test(s) ? s : '#';
}

export function parseInsightMd(md) {
  const frontmatter = {};
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end > 0) {
      const fmBlock = md.slice(3, end);
      for (const fl of fmBlock.split('\n')) {
        const m = fl.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*?)\s*$/);
        if (m) {
          let val = m[2];
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith('[') && val.endsWith(']')) {
            val = val.slice(1, -1).split(',').map(t => t.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
          }
          frontmatter[m[1]] = val;
        }
      }
      md = md.slice(end + 4).trimStart();
    }
  }
  const lines = md.split('\n');
  let title = '';
  const bodyBuf = [];
  let titleSeen = false;
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (!titleSeen && line.trim().startsWith('# ') && !line.trim().startsWith('## ')) {
      title = line.trim().slice(2).trim();
      titleSeen = true;
      continue;
    }
    bodyBuf.push(line);
  }
  return { title, frontmatter, body: bodyBuf.join('\n').trim() };
}

function inline(s) {
  let x = escapeHtml(s);
  x = x.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
  x = x.replace(/(^|[^"'>])((?:https?):\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noreferrer noopener">$2</a>');
  x = x.replace(/`([^`]+)`/g, '<code>$1</code>');
  x = x.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return x;
}

export function renderBody(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const out = [];
  let listBuf = [];
  let listType = null;
  let codeBuf = [];
  let inCode = false;
  let quoteBuf = [];

  const flushList = () => {
    if (listBuf.length) {
      const tag = listType === 'ol' ? 'ol' : 'ul';
      out.push('<' + tag + '>');
      for (const it of listBuf) out.push('<li>' + inline(it) + '</li>');
      out.push('</' + tag + '>');
      listBuf = [];
      listType = null;
    }
  };
  const flushCode = () => {
    if (codeBuf.length) {
      out.push('<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>');
      codeBuf = [];
    }
  };
  const flushQuote = () => {
    if (quoteBuf.length) {
      out.push('<blockquote>' + quoteBuf.map(q => '<p>' + inline(q) + '</p>').join('') + '</blockquote>');
      quoteBuf = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');

    if (/^```/.test(line)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        flushQuote();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuf.push(rawLine); continue; }

    if (/^\s*>\s?/.test(line)) {
      flushList();
      quoteBuf.push(line.replace(/^\s*>\s?/, ''));
      continue;
    }
    flushQuote();

    if (/^---+\s*$/.test(line)) {
      flushList();
      out.push('<hr>');
      continue;
    }

    const h4 = line.match(/^####\s+(.*)$/);
    if (h4) { flushList(); out.push('<h4>' + inline(h4[1]) + '</h4>'); continue; }
    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) { flushList(); out.push('<h3>' + inline(h3[1]) + '</h3>'); continue; }
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) { flushList(); out.push('<h2>' + inline(h2[1]) + '</h2>'); continue; }

    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ordered) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listBuf.push(ordered[1]);
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listBuf.push(line.replace(/^\s*-\s+/, ''));
      continue;
    }
    flushList();
    if (line === '') { out.push(''); continue; }
    out.push('<p>' + inline(line) + '</p>');
  }
  flushList();
  flushCode();
  flushQuote();
  return out.join('\n');
}

function sanitizeAnchorTag(attrs) {
  const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/i);
  const href = safeUrl(hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '');
  return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noreferrer noopener">';
}

function sanitizeOpenTag(tag, attrs) {
  const name = tag.toLowerCase();
  if (!ALLOWED_TAGS.has(name)) return '';
  if (name === 'hr' || name === 'br') return '<' + name + '>';
  if (name === 'a') return sanitizeAnchorTag(attrs);
  return '<' + name + '>';
}

export function sanitizeRenderedHtml(html) {
  if (!html) return '';
  const blocked = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'svg', 'math'];
  let out = html;
  for (const tag of blocked) {
    out = out.replace(new RegExp('<\\s*' + tag + '\\b[\\s\\S]*?<\\s*\\/\\s*' + tag + '\\s*>', 'gi'), '');
    out = out.replace(new RegExp('<\\s*' + tag + '\\b[^>]*\\/?>', 'gi'), '');
  }
  out = out.replace(/<\s*\/\s*([a-zA-Z0-9:-]+)\s*>/g, (m, tag) => {
    const name = tag.toLowerCase();
    return ALLOWED_TAGS.has(name) ? '</' + name + '>' : '';
  });
  out = out.replace(/<\s*([a-zA-Z0-9:-]+)([^>]*)>/g, (m, tag, attrs) => sanitizeOpenTag(tag, attrs));
  return out;
}

export function buildInsightHtml(entry, parsed) {
  const fm = parsed.frontmatter || {};
  const title = parsed.title || entry.title || fm.source_title || '(제목 없음)';
  const srcType = fm.source_type || entry.source_type || '';
  const tags = Array.isArray(fm.tags) ? fm.tags : (fm.tags ? [fm.tags] : []);
  const date = entry.date || fm.consumed_at || '';

  let html = '';
  html += '<div class="detail-head">';
  if (date) html += '<div class="detail-date">' + escapeHtml(date) + '</div>';
  html += '<div class="detail-title">' + escapeHtml(title) + '</div>';
  html += '<div class="badges">';
  if (srcType) {
    const map = {
      video: 'badge-src-video', book: 'badge-src-book',
      podcast: 'badge-src-podcast', article: 'badge-src-article',
      talk: 'badge-src-talk', paper: 'badge-src-paper'
    };
    const labelMap = {
      video: '영상', book: '책', podcast: '팟캐스트',
      article: '아티클', talk: '토크', paper: '논문'
    };
    const cls = map[srcType] || 'badge-tag';
    const label = labelMap[srcType] || srcType || '기타';
    html += '<span class="badge ' + cls + '">' + escapeHtml(label) + '</span>';
  }
  for (const t of tags) html += '<span class="badge badge-tag">#' + escapeHtml(t) + '</span>';
  html += '</div>';
  html += '</div>';

  const rows = [];
  if (fm.source_author) rows.push(['저자', escapeHtml(fm.source_author)]);
  if (fm.source_channel && fm.source_channel !== fm.source_author) rows.push(['채널', escapeHtml(fm.source_channel)]);
  if (fm.source_duration) rows.push(['길이', escapeHtml(fm.source_duration)]);
  if (fm.source_published) rows.push(['발행', escapeHtml(fm.source_published)]);
  if (fm.consumed_at) rows.push(['시청/소비', escapeHtml(fm.consumed_at)]);
  if (fm.source_url) rows.push(['원본', '<a href="' + escapeHtml(safeUrl(fm.source_url)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(fm.source_url) + ' ↗</a>']);
  if (rows.length) {
    html += '<dl class="meta-grid">';
    for (const [k, v] of rows) {
      html += '<dt>' + escapeHtml(k) + '</dt><dd>' + v + '</dd>';
    }
    html += '</dl>';
  }

  html += '<div class="body">' + renderBody(parsed.body || '') + '</div>';
  return sanitizeRenderedHtml(html);
}
