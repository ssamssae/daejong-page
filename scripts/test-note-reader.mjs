import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { noteHref, noteSlug } from '../src/lib/note-path.mjs';
import remarkNoteLinks from '../src/lib/remark-note-links.mjs';

test('all indexed records retain unique paths, including repeated editorial slugs', () => {
  for (const group of ['knowhow', 'issues', 'dead-ends']) {
    const { entries } = JSON.parse(readFileSync(`public/${group}/index.json`, 'utf8'));
    assert.equal(new Set(entries.map(noteSlug)).size, entries.length);
    assert(entries.every(e => noteHref(group, e).startsWith(`/notes/${group}/`)));
  }
});
test('notes retain usable references without publishing private or executable links', () => {
  const tree = { type: 'root', children: [
    { type:'heading', depth:1, children:[{type:'text',value:'Title'}] },
    { type:'link', url:'2026-05-24-mac-mini-group-mirror-token-mismatch.md', children:[{type:'text',value:'Related'}] },
    { type:'link', url:'../memory/private-test.md', children:[{type:'text',value:'Private reference'}] },
    { type:'html', value:'<script>alert(1)</script>' },
    { type:'link', url:'javascript:alert(1)', children:[{type:'text',value:'Example'}] },
  ] };
  remarkNoteLinks()(tree, {path:resolve('public/issues/example.md')});
  assert.equal(tree.children[0].depth, 2);
  assert.equal(tree.children[1].url, '/notes/issues/2026-05-24-mac-mini-group-mirror-token-mismatch/');
  assert.equal(tree.children[2].type, 'emphasis');
  assert.equal(tree.children[2].url, undefined);
  assert.equal(tree.children[3].type, 'text');
  assert.equal(tree.children[4].url, undefined);
});
test('existing authored collection content is not rewritten', () => {
  const tree = {type:'root',children:[{type:'heading',depth:1,children:[]}]};
  remarkNoteLinks()(tree,{path:resolve('src/content/worklog/example.md')});
  assert.equal(tree.children[0].depth, 1);
});
