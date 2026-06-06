import assert from 'node:assert/strict';
import { buildInsightHtml, parseInsightMd, renderBody, safeUrl, sanitizeRenderedHtml } from '../insight-render.js';

const md = `---
source_type: article
source_url: javascript:alert(1)
tags: [xss, security]
---

# Unsafe <img src=x onerror=alert(1)>

- [bad](javascript:alert(1))
- https://example.com/path?q=1

> quote <svg onload=alert(1)>

\`\`\`
<script>alert(1)</script>
\`\`\`
`;

const parsed = parseInsightMd(md);
assert.equal(parsed.title, 'Unsafe <img src=x onerror=alert(1)>');
assert.equal(safeUrl('javascript:alert(1)'), '#');
assert.match(renderBody(parsed.body), /<a href="https:\/\/example\.com\/path\?q=1"/);
assert.doesNotMatch(renderBody(parsed.body), /<img|<svg|<script|<a[^>]+href="javascript:|<[^>]+onerror=|<[^>]+onload=/i);

const html = buildInsightHtml({ title: 'Demo', date: '2026-06-06', source_type: 'article' }, parsed);
assert.doesNotMatch(html, /<img|<svg|<script|<[^>]+href="javascript:|<[^>]+onerror=|<[^>]+onload=/i);
assert.match(html, /<a href="https:\/\/example\.com\/path\?q=1" target="_blank" rel="noreferrer noopener">/);
assert.match(sanitizeRenderedHtml('<p>ok</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>'), /<p>ok<\/p><a href="#" target="_blank" rel="noreferrer noopener">x<\/a>/);

console.log('PASS: insight renderer sanitization');
