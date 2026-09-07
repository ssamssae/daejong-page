/**
 * Single collector origin for hop + visit + aggregator.
 * Production value comes from PUBLIC_NL_EVENTS_ORIGIN after wrangler deploy.
 * Do not guess *.ssamssae.workers.dev.
 */

export function nlCollectorOrigin(envLike) {
  const env = envLike || (typeof import.meta !== 'undefined' ? import.meta.env : {});
  const raw = String(env.PUBLIC_NL_EVENTS_ORIGIN || '').trim().replace(/\/$/, '');
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:') return '';
  return url.origin;
}

export function nlEventsUrl(origin, path = '/v1/events') {
  const base = String(origin || '').replace(/\/$/, '');
  if (!base) return '';
  return `${base}${path}`;
}
