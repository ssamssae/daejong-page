/**
 * Browser send helpers. sendBeacon false must retry; storage is written after success.
 */

import { nlEventsUrl } from './nl-collector.mjs';

export function visitStorageKey(clickId) {
  return `nl-visit:${clickId}`;
}

export function shouldMarkVisitSent({ acknowledged }) {
  return acknowledged === true;
}

export async function postNlEvent(origin, payload, { sendBeacon, fetchImpl, requireAck = false } = {}) {
  const url = nlEventsUrl(origin);
  if (!url) return { ok: false, reason: 'collector_unconfigured' };
  const body = JSON.stringify(payload);
  const beacon = typeof sendBeacon === 'function'
    ? sendBeacon
    : (typeof navigator !== 'undefined' && navigator.sendBeacon
      ? navigator.sendBeacon.bind(navigator)
      : null);
  if (beacon && !requireAck) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      if (beacon(url, blob)) return { ok: true, acknowledged: false, via: 'beacon' };
    } catch {
      /* retry with fetch */
    }
  }
  const fetchFn = typeof fetchImpl === 'function'
    ? fetchImpl
    : (typeof fetch === 'function' ? fetch : null);
  if (!fetchFn) return { ok: false, reason: 'send_failed' };
  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
      mode: 'cors',
    });
    const data = typeof res?.json === 'function' ? await res.json() : {};
    return { ok: Boolean(res?.ok), acknowledged: Boolean(res?.ok && (data.stored === true || data.reason === 'duplicate')), reason: data.reason, via: 'fetch', status: res?.status || 0 };
  } catch {
    return { ok: false, via: 'fetch', reason: 'send_failed' };
  }
}

// Arrival can beat the click beacon. Retry the same ID; the collector deduplicates it.
export async function postConfirmedVisit(origin, payload, options = {}) {
  const wait = options.wait || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await wait(250 * 2 ** (attempt - 1));
    result = await postNlEvent(origin, payload, { ...options, requireAck: true });
    if (shouldMarkVisitSent(result)) return result;
    if (result.reason !== 'click_pending' && result.status && result.status < 500) return result;
  }
  return result;
}
