/**
 * Single collector origin for hop + visit + aggregator.
 * Production value comes from PUBLIC_NL_EVENTS_ORIGIN after wrangler deploy.
 * Do not guess *.ssamssae.workers.dev.
 */

export function nlCollectorOrigin(envLike) {
  const env = envLike || (typeof import.meta !== 'undefined' ? import.meta.env : {});
  const result = validateNlCollectorOrigin(env.PUBLIC_NL_EVENTS_ORIGIN);
  return result.ok ? result.origin : '';
}

export function validateNlCollectorOrigin(rawValue, { requireWorkersDev = false } = {}) {
  const raw = String(rawValue || '').trim();
  if (!raw) return { ok: false, reason: 'missing' };
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  if (url.protocol !== 'https:') return { ok: false, reason: 'https_required' };
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    return { ok: false, reason: 'origin_only' };
  }
  if (requireWorkersDev && !url.hostname.endsWith('.workers.dev')) {
    return { ok: false, reason: 'workers_dev_required' };
  }
  return { ok: true, origin: url.origin };
}

export function nlEventsUrl(origin, path = '/v1/events') {
  const base = String(origin || '').replace(/\/$/, '');
  if (!base) return '';
  return `${base}${path}`;
}
