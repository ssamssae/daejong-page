import test from 'node:test';
import assert from 'node:assert/strict';
import { entryHasOnlyNewerDatesAbove } from '../verify-knowhow-refresh.mjs';

const file = '2026-09-29-lightweight-agent-task-ledger.md';
const date = '2026-09-29';

test('newer knowhow may sit above the 2026-09-29 entry', () => {
  const entries = [
    { file: '2026-11-11-youtube-subtitle-429-translated-track.md', date: '2026-11-11' },
    { file, date },
    { file: '2026-09-14-launchd-config-live-env-three-way-check.md', date: '2026-09-14' },
  ];
  assert.equal(entryHasOnlyNewerDatesAbove(entries, file, date), true);
});

test('an older or non-date row above the refresh entry fails', () => {
  const olderAbove = [
    { file: '2026-09-14-launchd-config-live-env-three-way-check.md', date: '2026-09-14' },
    { file, date },
  ];
  assert.equal(entryHasOnlyNewerDatesAbove(olderAbove, file, date), false);

  const invalidAbove = [
    { file: 'undated.md', date: 'undefined' },
    { file, date },
  ];
  assert.equal(entryHasOnlyNewerDatesAbove(invalidAbove, file, date), false);
});
