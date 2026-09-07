/**
 * Isolated fixture tests for newsletter click vs visit (T-260908-019).
 * Does not write to the live collector.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildAllowlist,
  extractQuotedUrls,
  hopPath,
  lookupHop,
  matchHref,
  slugForUrl,
} from '../src/lib/nl-allowlist.mjs';
import {
  createEventStore,
  decideRecord,
  EVENTS,
  isBotUa,
  isTestRequest,
  parseEvent,
  SOURCES,
  toCsv,
} from '../src/lib/nl-events.mjs';
import { handleRequest } from '../nl-events-worker/src/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function allowlist() {
  const src = fs.readFileSync(path.join(root, 'src/data/products.ts'), 'utf8');
  return buildAllowlist(extractQuotedUrls(src));
}

function event(overrides = {}) {
  return {
    event: EVENTS.click,
    source: SOURCES.web,
    campaign: 'ep7',
    product: 'hanjul',
    click_id: '11111111-1111-4111-8111-111111111111',
    occurred_at: '2026-09-08T07:20:00+09:00',
    dest_kind: 'first_party',
    ...overrides,
  };
}

test('products.ts URLs are all allowlisted with a slug', () => {
  const src = fs.readFileSync(path.join(root, 'src/data/products.ts'), 'utf8');
  const urls = extractQuotedUrls(src);
  assert.ok(urls.length > 10);
  const missing = urls.filter((u) => !slugForUrl(u));
  assert.deepEqual(missing, []);
});

test('open redirect: unknown hop is rejected', () => {
  const list = allowlist();
  assert.equal(lookupHop(list, 'not-a-product'), null);
  assert.equal(matchHref(list, 'https://evil.example/phish'), null);
});

test('ep7 App Store link still resolves to the same hanjul dest after hop', () => {
  const list = allowlist();
  const original = 'https://apps.apple.com/kr/app/id6764308678';
  const hit = matchHref(list, original);
  assert.equal(hit.product, 'hanjul');
  assert.equal(hit.dest, 'https://apps.apple.com/kr/app/id6764308678');
  assert.equal(hit.dest_kind, 'external');
  assert.equal(hopPath(hit.hop, { campaign: 'ep7', source: 'web_newsletter' }), '/nl-go/hanjul-ios/?c=ep7&s=web_newsletter');
});

test('owned /products hop is first_party; kmong is visit=NA', () => {
  const list = allowlist();
  const owned = matchHref(list, '/products/');
  assert.equal(owned.dest_kind, 'first_party');
  const ebook = matchHref(list, 'https://kmong.com/gig/786557');
  assert.equal(ebook.dest_kind, 'external');
  assert.equal(ebook.product, 'ebook-786557');
});

test('bot and nl_test traffic is excluded', () => {
  assert.equal(isBotUa('Mozilla/5.0 Googlebot/2.1'), true);
  assert.equal(isBotUa('NL-FIXTURE'), true);
  assert.equal(isBotUa('Mozilla/5.0 Chrome/120'), false);
  assert.equal(isTestRequest({ search: 'nl_test=1' }), true);
  assert.equal(isTestRequest({ headers: { 'X-NL-Fixture': '1' } }), true);
});

test('click success + owned visit are separate; tab close is click only', () => {
  const store = createEventStore();
  const click = event();
  const visit = event({ event: EVENTS.visit, click_id: click.click_id });
  assert.equal(store.insert(click).stored, true);
  assert.equal(store.insert(visit).stored, true);
  assert.equal(store.all().length, 2);
  const onlyClick = createEventStore();
  onlyClick.insert(click);
  assert.equal(onlyClick.all().filter((r) => r.event === EVENTS.visit).length, 0);
  assert.equal(onlyClick.all().filter((r) => r.event === EVENTS.click).length, 1);
});

test('same event+click_id is counted once', () => {
  const store = createEventStore();
  const row = event();
  assert.equal(store.insert(row).stored, true);
  assert.equal(store.insert(row).reason, 'duplicate');
  assert.equal(store.all().length, 1);
});

test('visit on external dest is NA (not stored)', () => {
  const visit = event({ event: EVENTS.visit });
  const decision = decideRecord({
    row: visit,
    destKind: 'external',
    ua: 'Mozilla/5.0',
  });
  assert.equal(decision.reason, 'visit_na');
});

test('CSV contract and T017 name projection', () => {
  const row = event();
  const csv = toCsv([row]);
  assert.match(csv, /^occurred_at,event,source,campaign,product,click_id,dest_kind\n/);
  assert.match(csv, /newsletter_product_click/);
  const t017 = toCsv([row], { projection: 't017' });
  assert.match(t017, /^ts,event,object_id,actor_id\n/);
  assert.match(t017, /nl_click/);
  assert.equal(t017.includes('newsletter_product_click'), false);
});

test('parseEvent rejects PII-shaped extras by ignoring them and bad ids', () => {
  const ok = parseEvent(event({ email: 'a@b.c', ip: '1.1.1.1' }));
  assert.equal(ok.ok, true);
  assert.equal(ok.row.email, undefined);
  assert.equal(parseEvent(event({ click_id: 'no' })).ok, false);
  assert.equal(parseEvent(event({ source: 'email_performance' })).ok, false);
});

test('worker fixture: click then visit, reject bad dest via allowlist, bot excluded, duplicate', async () => {
  const store = createEventStore();
  const env = { store };
  const clickId = '22222222-2222-4222-8222-222222222222';
  const post = (body, headers = {}, url = 'https://daejong-nl-events.test/v1/events') =>
    handleRequest(new Request(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }), env);

  const clickRes = await post({
    ...event({ click_id: clickId }),
    dest_kind: 'first_party',
  });
  assert.equal(clickRes.status, 201);

  const visitRes = await post({
    ...event({ event: EVENTS.visit, click_id: clickId }),
    dest_kind: 'first_party',
  });
  assert.equal(visitRes.status, 201);

  const dup = await post({
    ...event({ click_id: clickId }),
    dest_kind: 'first_party',
  });
  const dupJson = await dup.json();
  assert.equal(dupJson.reason, 'duplicate');

  const bot = await post(
    { ...event({ click_id: '33333333-3333-4333-8333-333333333333' }), dest_kind: 'first_party' },
    { 'user-agent': 'Googlebot' },
  );
  assert.equal((await bot.json()).reason, 'excluded');

  const testHit = await post(
    {
      ...event({ click_id: '44444444-4444-4444-8444-444444444444' }),
      dest_kind: 'first_party',
    },
    {},
    'https://daejong-nl-events.test/v1/events?nl_test=1',
  );
  assert.equal((await testHit.json()).reason, 'excluded');

  const csvRes = await handleRequest(new Request('https://daejong-nl-events.test/v1/events.csv'), env);
  const csv = await csvRes.text();
  assert.match(csv, /newsletter_product_click/);
  assert.match(csv, /newsletter_product_visit/);
  assert.equal(csv.includes('Googlebot'), false);
  assert.equal((csv.match(/22222222-2222-4222-8222-222222222222/g) || []).length, 2);
});

test('worker GET health and unknown route', async () => {
  const health = await handleRequest(new Request('https://daejong-nl-events.test/v1/health'));
  assert.equal(health.status, 200);
  const miss = await handleRequest(new Request('https://daejong-nl-events.test/v1/nope'));
  assert.equal(miss.status, 404);
});
