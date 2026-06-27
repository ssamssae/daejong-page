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

const tableIds = [...html.matchAll(/<td class="pid"[^>]*><a href="#([^"]+)"/g)].map((match) => match[1]);
const cardIds = [...html.matchAll(/<div class="card" id="([^"]+)"[^>]*>/g)].map((match) => match[1]);

function assertOrder(label, actualIds) {
  const actual = actualIds.join('\n');
  const expected = expectedIds.join('\n');
  if (actual !== expected) {
    throw new Error(`${label} order mismatch\nexpected:\n${expected}\nactual:\n${actual}`);
  }
}

assertOrder('policy table', tableIds);
assertOrder('policy cards', cardIds);
console.log(`policy order OK (${expectedIds.length} policies)`);
