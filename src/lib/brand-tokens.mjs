// T-261013-004: 회사 공용 디자인 값(색·폭)의 원본은 회사홈 https://kangdaejong.com/brand/current/tokens.css 하나다.
// 페이지는 그 CSS 를 읽고, 그림 생성기(글 카드)·검사·테스트는 같은 원본에서 만든 tokens.json 을 읽는다(빌드 때 네트워크 필요).
// BRAND_TOKENS_JSON=<로컬 tokens.json 경로> 를 주면 그 파일을 쓴다(회사홈 미배포 판을 미리 볼 때).
import { readFileSync } from 'node:fs';

export const BRAND_TOKENS_CSS = 'https://kangdaejong.com/brand/current/tokens.css';
export const BRAND_TOKENS_JSON = 'https://kangdaejong.com/brand/current/tokens.json';

async function load() {
  if (process.env.BRAND_TOKENS_JSON) return JSON.parse(readFileSync(process.env.BRAND_TOKENS_JSON, 'utf8'));
  const response = await fetch(BRAND_TOKENS_JSON);
  if (!response.ok) throw new Error(`brand tokens: ${BRAND_TOKENS_JSON} HTTP ${response.status}`);
  return response.json();
}

export const brandTokens = await load();

// T-261027-001: 공용 공유 카드 주소 = 회사홈과 같은 그림 지문(manifest 의 social.png sha256 앞 16자리).
//   10/27 대종님이 작업장 링크에서 10/24 전 검은 카드를 봤다 — 버전 없는 고정 주소(T-261012-041)는 메신저가 그림을
//   주소별로 저장해 두어 그림이 바뀌어도 옛 사본을 다시 쓴다. 지문은 회사홈 manifest 한 곳에서만 읽는다(복사본 0).
//   BRAND_MANIFEST_JSON=<로컬 manifest.json 경로> 를 주면 그 파일을 쓴다(회사홈 미배포 판을 미리 볼 때).
export const BRAND_MANIFEST_JSON = 'https://kangdaejong.com/brand/manifest.json';
export const SHARED_OG_IMAGE_BASE = 'https://kangdaejong.com/brand/current/social.png';

async function loadManifest() {
  if (process.env.BRAND_MANIFEST_JSON) return JSON.parse(readFileSync(process.env.BRAND_MANIFEST_JSON, 'utf8'));
  const response = await fetch(BRAND_MANIFEST_JSON);
  if (!response.ok) throw new Error(`brand manifest: ${BRAND_MANIFEST_JSON} HTTP ${response.status}`);
  return response.json();
}

const socialSha = (await loadManifest())?.files?.['social.png']?.sha256;
if (!/^[0-9a-f]{16,}$/.test(socialSha || '')) throw new Error('brand manifest: social.png sha256 이 없다');
export const SHARED_OG_IMAGE = `${SHARED_OG_IMAGE_BASE}?v=${socialSha.slice(0, 16)}`;
