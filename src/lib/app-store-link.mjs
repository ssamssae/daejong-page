// T-261117-098 · 작업장에서 나가는 우리 앱 App Store 주소에 애플 캠페인 표식을 붙인다.
// pt = Minus Beta Studio 개발자 계정(2026-11-17 App Store Connect 실측), ct = 이 사이트 채널.

export const OUR_APP_IDS = [
  '6762068073',
  '6764308678',
  '6816725770',
  '6812609143',
  '6769037337',
  '6766556759',
  '6765536777',
  '6765536616',
  '6762100639',
  '6762072499',
  '6820080312',
  '6766077265',
  '6811111727',
];

export const CAMPAIGN = { pt: '128771490', ct: 'workshop', mt: '8' };

const OUR_IDS = new Set(OUR_APP_IDS);
const CAMPAIGN_QUERY = `pt=${CAMPAIGN.pt}&ct=${CAMPAIGN.ct}&mt=${CAMPAIGN.mt}`;

export function tagAppStoreHref(href) {
  if (typeof href !== 'string' || href === '') return href;
  let url;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  if (url.protocol !== 'https:' || url.hostname !== 'apps.apple.com') return href;
  const id = url.pathname.match(/\/id(\d+)/)?.[1];
  if (!id || !OUR_IDS.has(id)) return href;
  if (url.searchParams.has('pt')) return href;
  const hashAt = href.indexOf('#');
  const beforeHash = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : href.slice(hashAt);
  const joiner = beforeHash.includes('?') ? '&' : '?';
  return `${beforeHash}${joiner}${CAMPAIGN_QUERY}${hash}`;
}
