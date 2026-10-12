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
