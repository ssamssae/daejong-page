import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source = readFileSync('src/components/Nav.astro', 'utf8');
assert(source.includes('src="https://kangdaejong.com/mb-components.js"'));
assert(source.includes('<mb-header active={active} tone="studio">'));
assert(source.includes('href="https://kangdaejong.com/"'));
assert(source.includes("path.startsWith('/worklog')") && source.includes("path.startsWith('/newsletter')"));
assert(!source.includes('navPrimary') && !source.includes('navMore'));
console.log('Nav shared header and canonical home verification passed');
