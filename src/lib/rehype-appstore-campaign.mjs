import { tagAppStoreHref } from './app-store-link.mjs';

// 마크다운 본문(작업일지·뉴스레터·인사이트)의 App Store 링크에 캠페인 표식을 빌드 때 붙인다.
// 본문 파일은 고치지 않는다.
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && node.tagName === 'a' && node.properties && Object.prototype.hasOwnProperty.call(node.properties, 'href')) {
    node.properties.href = tagAppStoreHref(node.properties.href);
  }
  for (const child of node.children || []) walk(child);
}

export default function rehypeAppStoreCampaign() {
  return (tree) => {
    walk(tree);
  };
}
