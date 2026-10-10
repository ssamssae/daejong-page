// T-261010-062: Cloudflare Worker visitor-counter 재연결.
// 운영 호스트에서만 호출해 로컬 빌드·미리보기·검증 중에는 숫자가 오르지 않게 한다.
export const COUNTER_HOST = "work.kangdaejong.com";
export const COUNTER_ENDPOINT = "https://visitor-counter.ssamssae.workers.dev/count";

export function shouldCount(hostname) {
  return hostname === COUNTER_HOST;
}

export function counterUrl(site) {
  return `${COUNTER_ENDPOINT}?site=${encodeURIComponent(site)}`;
}

export function isCount(data) {
  return (
    Number.isFinite(data?.today) &&
    Number.isFinite(data?.total) &&
    data.today >= 0 &&
    data.total >= 0
  );
}

// 실패하면 표시를 바꾸지 않아 「-」가 그대로 남는다.
export async function loadVisitorCount(el, { hostname, fetchImpl }) {
  const site = el?.dataset?.visitors;
  if (!site || !shouldCount(hostname)) return false;
  try {
    const res = await fetchImpl(counterUrl(site), { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    if (!isCount(data)) return false;
    const [today, total] = el.querySelectorAll("b");
    if (!today || !total) return false;
    today.textContent = data.today.toLocaleString("ko-KR");
    total.textContent = data.total.toLocaleString("ko-KR");
    return true;
  } catch {
    return false;
  }
}
