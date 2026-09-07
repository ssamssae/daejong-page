/**
 * First-party newsletter click/visit collector (T-260908-019).
 * Stores no IP, UA, or email.
 */

import {
  parseEvent,
  toCsv,
  createEventStore,
  decideRecord,
} from '../../src/lib/nl-events.mjs';

const ALLOWED_ORIGINS = new Set([
  'https://work.kangdaejong.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

const memory = createEventStore();

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://work.kangdaejong.com';
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-nl-fixture',
    'access-control-max-age': '86400',
  };
}

function json(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(request) },
  });
}

async function persist(env, row) {
  if (env?.NL_EVENTS) {
    try {
      await env.NL_EVENTS.prepare(
        `INSERT OR IGNORE INTO nl_events
         (event, source, campaign, product, click_id, occurred_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(
        row.event,
        row.source,
        row.campaign,
        row.product,
        row.click_id,
        row.occurred_at,
      ).run();
      return { stored: true };
    } catch (err) {
      return { stored: false, reason: String(err) };
    }
  }
  const store = env.store || memory;
  return store.insert(row);
}

async function readAll(env) {
  if (env?.NL_EVENTS) {
    const res = await env.NL_EVENTS.prepare(
      'SELECT occurred_at, event, source, campaign, product, click_id FROM nl_events ORDER BY occurred_at',
    ).all();
    return res.results || [];
  }
  const store = env.store || memory;
  return store.all();
}

export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method === 'GET' && url.pathname === '/v1/health') {
    return json({ ok: true, service: 'daejong-nl-events', pii: false }, 200, request);
  }
  if (request.method === 'GET' && url.pathname === '/v1/events.csv') {
    const rows = await readAll(env);
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
    let body;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return json({ ok: false, error: 'bad_json' }, 400, request);
    }
    const parsed = parseEvent(body);
    if (!parsed.ok) return json(parsed, 400, request);
    const decision = decideRecord({
      row: parsed.row,
      destKind: body.dest_kind || 'external',
      ua: request.headers.get('user-agent'),
      search: url.searchParams,
      headers: request.headers,
    });
    if (!decision.record) {
      return json({ ok: true, stored: false, reason: decision.reason }, 202, request);
    }
    const result = await persist(env, parsed.row);
    return json({ ok: true, ...result }, result.stored ? 201 : 200, request);
  }
  return json({ ok: false, error: 'not_found' }, 404, request);
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
