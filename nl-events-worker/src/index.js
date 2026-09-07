/**
 * First-party newsletter click/visit collector (T-260908-019 / T-260908-025).
 * Stores no IP, UA, or email.
 * Conversion = visit / matching click (same click_id+product+source+campaign).
 */

import {
  parseEvent,
  toCsv,
  decideRecord,
  EVENTS,
  SOURCES,
  serverDestKind,
  visitMatchesClick,
  serverOccurredAt,
  isKnownProduct,
} from '../../src/lib/nl-events.mjs';

const ALLOWED_ORIGINS = new Set([
  'https://work.kangdaejong.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://work.kangdaejong.com';
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-nl-fixture, x-nl-read-key',
    'access-control-max-age': '86400',
  };
}

function requestOriginAllowed(request) {
  return ALLOWED_ORIGINS.has(request.headers.get('Origin') || '');
}

function json(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(request) },
  });
}

export function storageMode(env = {}) {
  if (env.NL_EVENTS) return 'd1';
  if (env.store) return 'memory';
  return 'unavailable';
}

function healthBody(env, probeOverride) {
  const mode = storageMode(env);
  const probe = probeOverride || {
    storage: mode,
    diagnostic: mode === 'unavailable' ? 'storage_unconfigured' : 'fixture_memory',
  };
  const storage = probe.storage;
  return {
    ok: storage !== 'unavailable',
    service: 'daejong-nl-events',
    pii: false,
    storage,
    csv: 't019+t017-projection',
    collect_source: SOURCES.web,
    substack: 'NA',
    conversion: 'visit/click',
    coverage: storage === 'unavailable' ? 'NA' : 'collecting',
    diagnostic: probe.diagnostic,
  };
}

async function probeStorage(env) {
  const mode = storageMode(env);
  if (mode === 'd1') {
    try {
      await env.NL_EVENTS.prepare('SELECT 1 AS ready FROM nl_events LIMIT 1').first();
      return { storage: mode, diagnostic: 'schema_ready' };
    } catch {
      return { storage: 'unavailable', diagnostic: 'd1_schema_unavailable' };
    }
  }
  if (mode === 'memory') return { storage: mode, diagnostic: 'fixture_memory' };
  return { storage: 'unavailable', diagnostic: 'storage_unconfigured' };
}

function readKeyOk(env, request) {
  const expected = String(env.NL_EVENTS_READ_KEY || '');
  if (!expected) return false;
  const got = request.headers.get('X-NL-Read-Key') || '';
  if (got.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < expected.length; i += 1) {
    out |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return out === 0;
}

async function persist(env, row) {
  const mode = storageMode(env);
  if (mode === 'd1') {
    try {
      const info = await env.NL_EVENTS.prepare(
        `INSERT OR IGNORE INTO nl_events
         (event, source, campaign, product, click_id, dest_kind, occurred_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        row.event,
        row.source,
        row.campaign,
        row.product,
        row.click_id,
        row.dest_kind,
        row.occurred_at,
      ).run();
      if (info?.meta && Number(info.meta.changes) === 0) {
        return { stored: false, reason: 'duplicate' };
      }
      return { stored: true };
    } catch (err) {
      return { stored: false, ok: false, error: 'storage_unavailable', reason: 'd1_error' };
    }
  }
  if (mode === 'memory') return env.store.insert(row);
  return { stored: false, ok: false, error: 'storage_unavailable' };
}

async function readAll(env) {
  const mode = storageMode(env);
  if (mode === 'd1') {
    const res = await env.NL_EVENTS.prepare(
      'SELECT occurred_at, event, source, campaign, product, click_id, dest_kind FROM nl_events ORDER BY occurred_at',
    ).all();
    return res.results || [];
  }
  if (mode === 'memory') return env.store.all();
  throw new Error('storage_unavailable');
}

async function findClick(env, clickId) {
  const mode = storageMode(env);
  if (mode === 'd1') {
    const row = await env.NL_EVENTS.prepare(
      `SELECT event, source, campaign, product, click_id, dest_kind
       FROM nl_events WHERE event = ? AND click_id = ?`,
    ).bind(EVENTS.click, clickId).first();
    return row || null;
  }
  if (mode === 'memory' && typeof env.store.findClick === 'function') {
    return env.store.findClick(clickId);
  }
  return null;
}

export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method === 'GET' && url.pathname === '/v1/health') {
    const probe = await probeStorage(env);
    const body = healthBody(env, probe);
    return json(body, body.ok ? 200 : 503, request);
  }
  if (request.method === 'GET' && url.pathname === '/v1/events.csv') {
    const mode = storageMode(env);
    if (mode === 'unavailable') {
      return json({ ok: false, error: 'storage_unavailable', coverage: 'NA' }, 503, request);
    }
    if (!readKeyOk(env, request)) {
      return json({ ok: false, error: 'csv_forbidden' }, 401, request);
    }
    let rows;
    try {
      rows = await readAll(env);
    } catch {
      return json({ ok: false, error: 'storage_unavailable', coverage: 'NA' }, 503, request);
    }
    const projection = url.searchParams.get('projection') === 't017' ? 't017' : 't019';
    const csv = toCsv(rows, { projection });
    return new Response(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'cache-control': 'no-store',
        ...corsHeaders(request),
      },
    });
  }
  if (request.method === 'POST' && url.pathname === '/v1/events') {
    if (!requestOriginAllowed(request)) {
      return json({ ok: false, error: 'origin_forbidden' }, 403, request);
    }
    if (storageMode(env) === 'unavailable') {
      return json({ ok: false, error: 'storage_unavailable', coverage: 'NA', diagnostic: 'storage_unconfigured' }, 503, request);
    }
    let body;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return json({ ok: false, error: 'bad_json' }, 400, request);
    }
    const parsed = parseEvent(body);
    if (!parsed.ok) return json(parsed, 400, request);
    if (!isKnownProduct(parsed.row.product)) {
      return json({ ok: false, error: 'unknown_product' }, 400, request);
    }
    const destKind = serverDestKind(parsed.row.product);
    const row = {
      ...parsed.row,
      dest_kind: destKind,
      occurred_at: serverOccurredAt(),
    };
    const decision = decideRecord({
      row,
      destKind,
      ua: request.headers.get('user-agent'),
      search: url.searchParams,
      headers: request.headers,
      collectSource: SOURCES.web,
    });
    if (!decision.record) {
      return json({ ok: true, stored: false, reason: decision.reason }, 202, request);
    }
    if (row.event === EVENTS.visit) {
      let click;
      try {
        click = await findClick(env, row.click_id);
      } catch {
        return json({ ok: false, error: 'storage_unavailable', coverage: 'NA', diagnostic: 'd1_read_unavailable' }, 503, request);
      }
      if (click && !visitMatchesClick(row, click)) {
        return json({ ok: true, stored: false, reason: 'visit_mismatch' }, 202, request);
      }
    }
    const result = await persist(env, row);
    if (result.error === 'storage_unavailable') {
      return json({ ok: false, error: 'storage_unavailable', coverage: 'NA', diagnostic: 'd1_write_unavailable' }, 503, request);
    }
    return json({ ok: true, stored: Boolean(result.stored), reason: result.reason || undefined }, result.stored ? 201 : 200, request);
  }
  return json({ ok: false, error: 'not_found' }, 404, request);
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
