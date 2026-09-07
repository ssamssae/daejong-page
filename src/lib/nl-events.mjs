/**
 * First-party newsletter click/visit events (T-260908-019).
 * No PII, IP, or UA stored. click_id is an opaque correlation token.
 */

import { EVENTS, SOURCES, isKnownProduct, serverDestKindForProduct } from './nl-allowlist.mjs';

export { EVENTS, SOURCES, isKnownProduct };

export const CSV_COLUMNS = [
  'occurred_at',
  'event',
  'source',
  'campaign',
  'product',
  'click_id',
  'dest_kind',
];

/** T017 projection keeps source/campaign/dest_kind so web vs NA mail and external vs first_party stay joinable. */
export const T017_CSV_COLUMNS = [
  'ts',
  'event',
  'object_id',
  'actor_id',
  'source',
  'campaign',
  'dest_kind',
];

/**
 * Googlebot/Bingbot do not contain a standalone word "bot".
 * Word-boundary \\bbot\\b alone would miss them.
 */
const BOT_UA = /googlebot|bingbot|applebot|yandexbot|duckduckbot|baiduspider|slurp|crawler|spider|preview|facebookexternalhit|whatsapp|telegram|discord|nl-fixture|\bbot\b/i;

/** Owned /products landing is the only first_party visit surface. Client dest_kind is not trusted. */
export function serverDestKind(product) {
  return serverDestKindForProduct(product);
}

export function visitMatchesClick(visit, click) {
  if (!visit || !click) return false;
  return click.event === EVENTS.click
    && visit.event === EVENTS.visit
    && click.click_id === visit.click_id
    && click.product === visit.product
    && click.source === visit.source
    && click.campaign === visit.campaign
    && click.dest_kind === 'first_party'
    && visit.dest_kind === 'first_party';
}

export function serverOccurredAt(now = new Date()) {
  return now.toISOString();
}

export function isBotUa(ua) {
  return BOT_UA.test(String(ua || ''));
}

export function isTestRequest({ search, headers } = {}) {
  const q = search instanceof URLSearchParams
    ? search
    : new URLSearchParams(String(search || '').replace(/^\?/, ''));
  if (q.get('nl_test') === '1') return true;
  const headerBag = headers && typeof headers.get === 'function'
    ? headers
    : new Headers(headers || {});
  if (headerBag.get('X-NL-Fixture') === '1') return true;
  return false;
}

export function newClickId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function landingUrl(entry, { clickId, campaign, source }) {
  const url = new URL(entry.dest);
  url.searchParams.set('from', 'nl');
  url.searchParams.set('nlc', clickId);
  url.searchParams.set('p', entry.product);
  if (campaign) url.searchParams.set('utm_campaign', campaign);
  if (source) url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'newsletter');
  return url.toString();
}

export function parseEvent(input) {
  const event = String(input?.event || '').trim();
  const source = String(input?.source || '').trim();
  const campaign = String(input?.campaign || '').trim();
  const product = String(input?.product || '').trim();
  const click_id = String(input?.click_id || '').trim();
  const occurred_at = String(input?.occurred_at || '').trim();
  if (event !== EVENTS.click && event !== EVENTS.visit) {
    return { ok: false, error: 'unknown_event' };
  }
  if (source !== SOURCES.web && source !== SOURCES.substack) {
    return { ok: false, error: 'unknown_source' };
  }
  if (!campaign || !/^[a-z0-9._-]{1,64}$/i.test(campaign)) {
    return { ok: false, error: 'bad_campaign' };
  }
  if (!product || !/^[a-z0-9._-]{1,64}$/i.test(product)) {
    return { ok: false, error: 'bad_product' };
  }
  if (!click_id || !/^[a-z0-9-]{8,80}$/i.test(click_id)) {
    return { ok: false, error: 'bad_click_id' };
  }
  const dest_kind = String(input?.dest_kind || '').trim();
  if (dest_kind !== 'first_party' && dest_kind !== 'external') {
    return { ok: false, error: 'bad_dest_kind' };
  }
  if (!occurred_at || Number.isNaN(Date.parse(occurred_at))) {
    return { ok: false, error: 'bad_occurred_at' };
  }
  return {
    ok: true,
    row: { occurred_at, event, source, campaign, product, click_id, dest_kind },
  };
}

export function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows, { projection = 't019' } = {}) {
  if (projection === 't017') {
    const header = T017_CSV_COLUMNS.join(',');
    const body = rows.map((r) => {
      const event = r.event === EVENTS.click ? 'nl_click' : 'nl_visit';
      return [
        r.occurred_at,
        event,
        r.product,
        r.click_id,
        r.source,
        r.campaign,
        r.dest_kind,
      ].map(csvEscape).join(',');
    });
    return [header, ...body].join('\n') + '\n';
  }
  const header = CSV_COLUMNS.join(',');
  const body = rows.map((r) => CSV_COLUMNS.map((k) => csvEscape(r[k])).join(','));
  return [header, ...body].join('\n') + '\n';
}

export function createEventStore() {
  const rows = [];
  const keys = new Set();
  return {
    insert(row, { excluded = false } = {}) {
      if (excluded) return { stored: false, reason: 'excluded' };
      const key = `${row.event}\0${row.click_id}`;
      if (keys.has(key)) return { stored: false, reason: 'duplicate' };
      keys.add(key);
      rows.push({ ...row });
      return { stored: true };
    },
    findClick(clickId) {
      return rows.find((r) => r.event === EVENTS.click && r.click_id === clickId) || null;
    },
    all() {
      return rows.slice();
    },
    csv(opts) {
      return toCsv(rows, opts);
    },
  };
}

export function decideRecord({ row, destKind, ua, search, headers, collectSource = SOURCES.web }) {
  if (isBotUa(ua) || isTestRequest({ search, headers })) {
    return { record: false, reason: 'excluded' };
  }
  if (row.source !== collectSource) {
    return { record: false, reason: 'source_na' };
  }
  if (row.source === SOURCES.substack) {
    return { record: false, reason: 'source_na' };
  }
  const kind = destKind || row.dest_kind;
  if (row.event === EVENTS.visit && kind !== 'first_party') {
    return { record: false, reason: 'visit_na' };
  }
  return { record: true };
}
