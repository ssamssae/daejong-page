import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { noteHref } from './note-path.mjs';

// Render public notes in their new reader without changing historical source files.
export default function remarkNoteLinks() {
  const publicRoot = resolve('public');
  const readers = new Map();
  for (const group of ['knowhow', 'issues', 'dead-ends']) {
    const index = JSON.parse(readFileSync(resolve(publicRoot, group, 'index.json'), 'utf8'));
    for (const entry of index.entries) readers.set(resolve(publicRoot, group, entry.file?.trim() || entry.slug + '.md'), noteHref(group, entry));
  }
  return (tree, file) => {
    const source = resolve(String(file.path || ''));
    if (!source.startsWith(publicRoot + sep)) return;
    const walk = node => {
      // Public Markdown is a record, not an executable page template.
      if (node.type === 'html') node.type = 'text';
      if (node.type === 'link' && /^(?:javascript|data|vbscript):/i.test(node.url)) {
        node.type = 'emphasis';
        delete node.url;
      }
      if (node.type === 'heading' && node.depth === 1) node.depth = 2;
      if (node.type === 'link' && !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(node.url)) {
        const [path, fragment] = node.url.split('#');
        const destination = resolve(dirname(source), decodeURIComponent(path));
        if (destination.startsWith(publicRoot + sep) && existsSync(destination)) {
          const href = readers.get(destination) || '/' + destination.slice(publicRoot.length + 1).split(sep).map(encodeURIComponent).join('/');
          node.url = href + (fragment ? '#' + fragment : '');
        } else {
          // Private/unpublished references remain readable text rather than a broken public link.
          node.type = 'emphasis';
          delete node.url;
          node.children.push({ type: 'text', value: ' (공개되지 않은 참조)' });
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
