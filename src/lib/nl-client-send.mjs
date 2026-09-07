/**
 * Browser send helpers. sendBeacon false must retry; storage is written after success.
 */

import { nlEventsUrl } from './nl-collector.mjs';

export function visitStorageKey(clickId) {
  return `nl-visit:${clickId}`;
}

export function shouldMarkVisitSent({ beaconOk, fetchOk }) {
  return beaconOk === true || fetchOk === true;
}

export async function postNlEvent(origin, payload, { sendBeacon, fetchImpl } = {}) {
  const url = nlEventsUrl(origin);
  if (!url) return { ok: false, reason: 'collector_unconfigured' };
  const body = JSON.stringify(payload);
  const beacon = typeof sendBeacon === 'function'
    ? sendBeacon
    : (typeof navigator !== 'undefined' && navigator.sendBeacon
      ? navigator.sendBeacon.bind(navigator)
      : null);
  if (beacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      if (beacon(url, blob)) return { ok: true, via: 'beacon' };
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
    return { ok: Boolean(res && res.ok), via: 'fetch', status: res ? res.status : 0 };
  } catch {
    return { ok: false, via: 'fetch', reason: 'send_failed' };
  }
}
