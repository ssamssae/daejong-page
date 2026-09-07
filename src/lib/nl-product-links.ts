import { apps, ebooks, saas, tools } from '../data/products';
import { buildAllowlist, hopPath, lookupHop, matchHref, SOURCES } from './nl-allowlist.mjs';

function allProductUrls(): string[] {
  const urls: string[] = [];
  for (const group of [apps, saas, tools, ebooks]) {
    for (const item of group) {
      for (const link of item.links) {
        if (link.url) urls.push(link.url);
      }
    }
  }
  return urls;
}

export const nlAllowlist = buildAllowlist(allProductUrls());

export function wrapNewsletterHref(href: string, campaign: string): string | null {
  const hit = matchHref(nlAllowlist, href);
  if (!hit) return null;
  return hopPath(hit.hop, { campaign, source: SOURCES.web });
}

export function hopEntry(hop: string) {
  return lookupHop(nlAllowlist, hop);
}

export { hopPath, SOURCES };
