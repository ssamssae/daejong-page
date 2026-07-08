import { readFileSync } from 'node:fs';
import policyData from '../src/data/fleet-policy.json' with { type: 'json' };

const html = readFileSync('dist/policy/index.html', 'utf8');

const expectedIds = policyData.policies
  .map((policy, index) => ({ ...policy, index }))
  .sort((a, b) => {
    const byDate = b.changed.localeCompare(a.changed);
    return byDate || a.index - b.index;
  })
  .map((policy) => policy.id);

const railIds = [...html.matchAll(/<article class="recent-policy" id="([^"]+)"[^>]*>/g)].map((match) => match[1]);
const registryIds = [...html.matchAll(/<article class="policy-row" id="registry-([^"]+)"[^>]*>/g)].map((match) => match[1]);

function assertOrder(label, actualIds) {
  const actual = actualIds.join('\n');
  const expected = expectedIds.join('\n');
  if (actual !== expected) {
    throw new Error(`${label} order mismatch\nexpected:\n${expected}\nactual:\n${actual}`);
  }
}

const requiredSnippets = [
  'class="policy-page"',
  'aria-label="정책 요약"',
  'class="policy-stat-grid"',
  'class="recent-rail"',
  'class="policy-registry"',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`policy renewal structure missing: ${snippet}`);
  }
}

if (html.includes('class="ptable"')) {
  throw new Error('old policy table should not be rendered after renewal');
}

assertOrder('policy recent rail', railIds);
assertOrder('policy registry', registryIds);
console.log(`policy order OK (${expectedIds.length} policies)`);
