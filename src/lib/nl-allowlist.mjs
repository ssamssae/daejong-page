/**
 * Newsletter product-link allowlist (T-260908-019).
 * Open redirects are rejected: only these destinations may leave /nl-go/.
 * dest_kind=first_party is the only surface that can emit newsletter_product_visit.
 */

export const OWNED_HOST = 'work.kangdaejong.com';
export const PRODUCTS_PATH = '/products';

export const EVENTS = Object.freeze({
  click: 'newsletter_product_click',
  visit: 'newsletter_product_visit',
});

export const SOURCES = Object.freeze({
  web: 'web_newsletter',
  substack: 'substack_email',
});

/** Apple id → product slug */
export const APPLE_IDS = {
  '6764308678': 'hanjul',
  '6762068073': 'memoyo',
  '6762072499': 'dutchpay',
  '6762100639': 'yakmukja',
  '6766556759': 'wordyo',
  '6765536616': 'hankeup',
  '6765536777': 'pomodoro',
  '6769037337': 'mini-expense',
  '6766077265': 'lottocalc',
  '6791480413': 'cheotireum',
};

/** Play applicationId → product slug */
export const PLAY_IDS = {
  'com.daejongkang.hanjul': 'hanjul',
  'com.daejongkang.simple_memo_app': 'memoyo',
  'com.daejongkang.dutchpay': 'dutchpay',
  'com.daejongkang.yakmukja': 'yakmukja',
  'com.daejongkang.wordyo': 'wordyo',
  'com.ssamssae.pomodoro': 'pomodoro',
  'com.ssamssae.mini_expense': 'mini-expense',
  'com.daejongkang.lottocalc': 'lottocalc',
  'com.daejongkang.cheotireum': 'cheotireum',
  'com.minusbeta.babmeokja': 'babmeokja',
};

export const HOST_SLUGS = {
  'cheotireum.kangdaejong.com': 'cheotireum',
  'hanjang.kangdaejong.com': 'hanjang',
  'taekil.kangdaejong.com': 'taekil',
  'babmeokja.kangdaejong.com': 'babmeokja',
};

export const GITHUB_REPOS = {
  'ssamssae/grok-telegram-bridge': 'grok-bridge',
  'ssamssae/codex-telegram-bridge': 'codex-bridge',
  'ssamssae/claude-telegram-bridge': 'claude-bridge',
  'ssamssae/cursor-telegram-bridge': 'cursor-bridge',
  'ssamssae/local-telegram-bridge': 'local-bridge',
};

export function normalizeDest(raw, base = 'https://work.kangdaejong.com') {
  let url;
  try {
    url = new URL(String(raw || '').trim(), base);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  url.hash = '';
  url.hostname = url.hostname.toLowerCase();
  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }
  return url;
}

export function destKindFor(url) {
  if (!url) return 'external';
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (url.hostname === OWNED_HOST && path === PRODUCTS_PATH) return 'first_party';
  return 'external';
}

/** Reverse of slugForUrl: worker checks this instead of trusting client dest_kind. */
export function isKnownProduct(product) {
  const p = String(product || '');
  if (p === 'products') return true;
  if (Object.values(APPLE_IDS).includes(p)) return true;
  if (Object.values(PLAY_IDS).includes(p)) return true;
  if (Object.values(HOST_SLUGS).includes(p)) return true;
  if (Object.values(GITHUB_REPOS).includes(p)) return true;
  return /^ebook-\d+$/.test(p);
}

export function serverDestKindForProduct(product) {
  return String(product) === 'products' ? 'first_party' : 'external';
}

export function slugForUrl(raw) {
  const url = typeof raw === 'string' ? normalizeDest(raw) : raw;
  if (!url) return null;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (url.hostname === OWNED_HOST && path === PRODUCTS_PATH) return 'products';

  const apple = url.pathname.match(/\/id(\d+)/);
  if (url.hostname === 'apps.apple.com' && apple) {
    return APPLE_IDS[apple[1]] || null;
  }
  if (url.hostname === 'play.google.com') {
    const id = url.searchParams.get('id');
    return (id && PLAY_IDS[id]) || null;
  }
  if (url.hostname === 'kmong.com' || url.hostname === 'www.kmong.com') {
    const gig = path.match(/^\/gig\/(\d+)$/);
    return gig ? `ebook-${gig[1]}` : null;
  }
  if (HOST_SLUGS[url.hostname]) return HOST_SLUGS[url.hostname];
  if (url.hostname === 'github.com') {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const repo = `${parts[0]}/${parts[1]}`;
      return GITHUB_REPOS[repo] || null;
    }
  }
  return null;
}

export function extractQuotedUrls(source) {
  const out = [];
  const re = /\burl:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source))) out.push(m[1]);
  return out;
}

export function hopIdFor(product, url) {
  if (url.hostname === 'apps.apple.com') return `${product}-ios`;
  if (url.hostname === 'play.google.com') return `${product}-android`;
  if (url.hostname === 'github.com' && url.pathname.includes('/releases/')) {
    return `${product}-release`;
  }
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path.endsWith('/sample')) return `${product}-sample`;
  if (path.includes('/guides')) return `${product}-guides`;
  return product;
}

export function buildAllowlist(urls) {
  const entries = [];
  const seen = new Set();
  const owned = [
    'https://work.kangdaejong.com/products/',
    'https://work.kangdaejong.com/products',
    '/products/',
    '/products',
  ];
  for (const raw of [...owned, ...urls]) {
    const url = normalizeDest(raw);
    if (!url) continue;
    const product = slugForUrl(url);
    if (!product) continue;
    const dest = url.toString();
    const hop = hopIdFor(product, url);
    const key = hop;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      hop,
      product,
      dest,
      dest_kind: destKindFor(url),
    });
  }
  return entries;
}

export function lookupHop(allowlist, hop) {
  const slug = String(hop || '').trim();
  if (!slug) return null;
  return allowlist.find((e) => e.hop === slug) || null;
}

export function matchHref(allowlist, href) {
  const url = normalizeDest(href);
  if (!url) return null;
  const dest = url.toString();
  const exact = allowlist.find((e) => e.dest === dest);
  if (exact) return exact;
  const product = slugForUrl(url);
  if (!product) return null;
  const hop = hopIdFor(product, url);
  return allowlist.find((e) => e.hop === hop) || null;
}

export function hopPath(hop, { campaign, source } = {}) {
  const params = new URLSearchParams();
  if (campaign) params.set('c', campaign);
  if (source) params.set('s', source);
  const q = params.toString();
  return `/nl-go/${encodeURIComponent(hop)}/${q ? `?${q}` : ''}`;
}

export function campaignFromPath(filePath) {
  const m = String(filePath || '').match(/ep\d+/i);
  return m ? m[0].toLowerCase() : '';
}
