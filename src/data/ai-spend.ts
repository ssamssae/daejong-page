export type SpendCategory = 'ai' | 'infra' | 'hardware' | 'registration';

export type SpendItem = {
  date: string;
  name: string;
  vendor: string;
  account: string;
  category: SpendCategory;
  amountKrw: number;
  note?: string;
};

export const spendCategories: Array<{
  id: SpendCategory;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}> = [
  {
    id: 'ai',
    label: 'AI 구독·API',
    shortLabel: 'AI',
    description: 'Claude, ChatGPT, OpenAI API, OpenRouter 등 모델 사용료',
    color: '#2563eb',
  },
  {
    id: 'infra',
    label: '인프라·결제',
    shortLabel: 'infra',
    description: '도메인, 결제 가입비, 작업 도구성 소액 결제',
    color: '#127a3d',
  },
  {
    id: 'hardware',
    label: '하드웨어',
    shortLabel: 'hardware',
    description: '실기기 테스트와 개발용 장비',
    color: '#9a4d00',
  },
  {
    id: 'registration',
    label: '등록·행정',
    shortLabel: 'admin',
    description: '개발자 등록, 신고, 테스트 커뮤니티 비용',
    color: '#5f6470',
  },
];

export const aiSpendSource = {
  periodStart: '2026-04-11',
  periodEnd: '2026-07-23',
  canonicalTotalKrw: 6328019,
  sourceLabel: '아니키 미검증 임시값(스크린샷 전사)',
};

export const spendItems: SpendItem[] = [
  {
    date: '2026-07-23',
    name: '맥북 프로 14 M5 24GB/1TB(쿠팡)',
    vendor: 'Apple',
    account: '토스사업자통장',
    category: 'hardware',
    amountKrw: 3301000,
  },
  {
    date: '2026-07-18',
    name: 'OpenAI gpt Plus',
    vendor: 'OpenAI',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 27194,
  },
  {
    date: '2026-07-09',
    name: 'CLAUDE맥스20x',
    vendor: 'Anthropic',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 161449,
  },
  {
    date: '2026-07-07',
    name: 'CLAUDE맥스5x',
    vendor: 'Anthropic',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 154906,
  },
  {
    date: '2026-06-30',
    name: 'CLAUDE맥스20x',
    vendor: 'Anthropic',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 218583,
  },
  {
    date: '2026-06-19',
    name: 'CLAUDE맥스5x',
    vendor: 'Anthropic',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 157214,
  },
  {
    date: '2026-06-18',
    name: 'ChatGPT Pro 20x',
    vendor: 'OpenAI',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 137315,
  },
  {
    date: '2026-06-17',
    name: 'ChatGPT Pro 5x',
    vendor: 'OpenAI',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 130642,
  },
  {
    date: '2026-06-17',
    name: 'OpenAI gpt API',
    vendor: 'OpenAI',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 17003,
  },
  {
    date: '2026-06-07',
    name: 'OpenAI gpt Plus',
    vendor: 'OpenAI',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 27451,
  },
  {
    date: '2026-05-31',
    name: 'Anthropic Claude API $20',
    vendor: 'Anthropic',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 33898,
  },
  {
    date: '2026-05-27',
    name: 'OpenRouter $10',
    vendor: 'OpenRouter',
    account: '신한사업자통장',
    category: 'ai',
    amountKrw: 16597,
  },
  {
    date: '2026-05-26',
    name: 'OpenAI gpt API',
    vendor: 'OpenAI',
    account: '토스뱅크',
    category: 'ai',
    amountKrw: 8358,
  },
  {
    date: '2026-05-19',
    name: 'CLAUDE맥스20x',
    vendor: 'Anthropic',
    account: '토스뱅크',
    category: 'ai',
    amountKrw: 304829,
  },
  {
    date: '2026-05-07',
    name: 'NICE_ChatGPT Pro 5x(빌링)',
    vendor: 'OpenAI',
    account: '토스뱅크',
    category: 'ai',
    amountKrw: 144545,
  },
  {
    date: '2026-04-21',
    name: 'OpenAI gpt API',
    vendor: 'OpenAI',
    account: '현대카드',
    category: 'ai',
    amountKrw: 16623,
  },
  {
    date: '2026-04-19',
    name: 'CLAUDE맥스20x',
    vendor: 'Anthropic',
    account: '현대카드',
    category: 'ai',
    amountKrw: 210631,
  },
  {
    date: '2026-04-11',
    name: '구글 개발자계정 ai',
    vendor: 'Google',
    account: '현대카드',
    category: 'ai',
    amountKrw: 38328,
  },
  {
    date: '2026-04-11',
    name: 'CLAUDE맥스5x',
    vendor: 'Anthropic',
    account: '현대카드',
    category: 'ai',
    amountKrw: 168614,
  },
  {
    date: '2026-06-29',
    name: '인터넷상거래 입출금',
    vendor: '신한은행',
    account: '신한사업자통장',
    category: 'infra',
    amountKrw: 5300,
  },
  {
    date: '2026-05-31',
    name: '토스페이 가입비(인터넷상거래)',
    vendor: '토스페이',
    account: '신한사업자통장',
    category: 'infra',
    amountKrw: 330000,
  },
  {
    date: '2026-05-17',
    name: 'Cloudflare 홈페이지 도메인',
    vendor: 'Cloudflare',
    account: '토스뱅크',
    category: 'infra',
    amountKrw: 16584,
  },
  {
    date: '2026-04-11',
    name: '갤럭시 S24 512G(당근, 테스트폰)',
    vendor: '중고거래',
    account: '신한은행',
    category: 'hardware',
    amountKrw: 450000,
  },
  {
    date: '2026-05-07',
    name: '서울시 통신판매업 신고',
    vendor: '서울시',
    account: '토스뱅크',
    category: 'registration',
    amountKrw: 40500,
  },
  {
    date: '2026-04-11',
    name: '애플 개발자 등록(애플코리아)',
    vendor: 'Apple',
    account: '현대카드',
    category: 'registration',
    amountKrw: 129000,
  },
  {
    date: '2026-04-30',
    name: 'TESTERS COMMUNITY(안드로이드 테스터)',
    vendor: 'TESTERS COMMUNITY',
    account: '현대카드',
    category: 'registration',
    amountKrw: 58375,
    note: '분류 애매: 안드로이드 테스터 모집 비용으로 등록·행정에 임시 포함. 아니키 검증 대기.',
  },
  {
    date: '2026-04-16',
    name: 'TESTERS COMMUNITY(안드로이드 테스터)',
    vendor: 'TESTERS COMMUNITY',
    account: '현대카드',
    category: 'registration',
    amountKrw: 20580,
    note: '분류 애매: 안드로이드 테스터 모집 비용으로 등록·행정에 임시 포함. 아니키 검증 대기.',
  },
  {
    date: '2026-06-18',
    name: 'APPLE 메모앱 광고제거',
    vendor: 'Apple',
    account: '현대카드',
    category: 'infra',
    amountKrw: 2500,
    note: '분류 애매: 작업 도구성 소액 결제로 인프라·결제에 임시 포함. 아니키 검증 대기.',
  },
];
