// T-261013-009: 작업장 노드 구성의 공개용 원본. 노드가 바뀌면 이 파일만 고친다.
// 스택 페이지 본문(노드 수)·포스터 문구·토폴로지 그림·운영 방식 칸이 모두 여기서 읽는다.
// 공개 페이지라 기기 주소·사설망 이름·접속 별칭·봇 아이디·계정은 넣지 않는다(scripts/verify-stack-page.mjs 가 검사).
export const fleet = {
  asOf: '2026-10-13',
  policyDate: '2026-10-11',
  nodes: [
    { name: '아테나', device: 'MacBook Pro', lead: true },
    { name: '볼칸', device: 'Mac mini' },
    { name: '제우스', device: 'Windows PC · WSL' },
    { name: '아폴론', device: 'Windows PC · WSL' },
  ],
  engines: ['Claude', 'Codex', 'Cursor', 'Grok'],
  workerEngines: ['Grok', 'Cursor'],
};

export const leadNode = fleet.nodes.find((node) => node.lead) ?? fleet.nodes[0];

const counts = ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const koCount = (n: number) => counts[n] ?? String(n);

export const koMonthDay = (iso: string) => {
  const [, month, day] = iso.split('-').map(Number);
  return `${month}월 ${day}일`;
};

// 받침 유무로 주격 조사(이/가)를 고른다 — 노드 이름이 바뀌어도 문장이 맞게.
const hasFinal = (word: string) => {
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
};
export const withSubject = (word: string) => word + (hasFinal(word) ? '이' : '가');
