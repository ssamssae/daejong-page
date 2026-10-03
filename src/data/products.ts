import retiredProducts from './retired-products.json';

// 정본 제품 데이터 (T-260723-061) — 랜딩(index)·제품(products) 페이지 공통 소스.
//   제품 개수·공개 브릿지 버전을 여기 한 곳에서만 관리하고, 두 페이지가 빌드타임에
//   파생한다(length·버전 파생). 손으로 박은 상수의 스테일 재발방지 — T-260722-012 phase1
//   근본패턴(스테일=하드코딩 상수에서만 발생)의 잔여 축(제품개수·브릿지버전) 마무리.

export const apps = [
  {
    name: '한줄일기', icon: '/product-icons/6764308678-f4fa94ec51.jpg', status: 'iOS LIVE · Android LIVE',
    desc: '하루 한 줄, 부담 없는 일기. 53주 감정 히트맵, 로컬 저장, 계정 가입 0 — 거창한 일기 대신 한 줄이면 충분합니다.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6764308678' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.hanjul' },
    ],
  },
  {
    name: '메모요', icon: '/product-icons/6762068073-9fffec3bbd.jpg', status: 'iOS · Android LIVE',
    desc: '심플한 다크 테마 메모 앱. 복수 선택 삭제를 지원하는 가벼운 메모 도구.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6762068073' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.simple_memo_app' },
    ],
  },
  {
    name: '더치페이 계산기', icon: '/product-icons/6762072499-17c5730a71.jpg', status: 'iOS LIVE · Android LIVE',
    desc: '여러 명이 먹은 자리를 편하게 나눠 내는 정산 도우미. 금액·인원수 입력만으로 바로 정산.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6762072499' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.dutchpay' },
    ],
  },
  {
    name: '약먹자', icon: '/product-icons/6762100639-41b67f90b6.jpg', status: 'iOS LIVE · Android LIVE',
    desc: '복약 시간을 놓치지 않게 도와주는 알림 앱. 약 등록 → 알림 시각 설정만으로 매일 챙겨줍니다.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6762100639' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.yakmukja' },
    ],
  },
  {
    name: '심플 가계부', icon: '/product-icons/6769037337-2ad919041d.jpg', status: 'iOS LIVE · Android LIVE',
    desc: '하루 지출을 빠르게 적는 미니멀 가계부. 가입 없이 기기 안에서만 기록합니다.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6769037337' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.ssamssae.mini_expense' },
    ],
  },
  {
    name: '계산기알람', status: '모바일 앱',
    desc: '계산 문제를 풀며 잠에서 깨는 알람 앱.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6811111727' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.ireonayo' },
    ],
  },
];

export const saas = [];

// 공개 브릿지 버전 단일 소스 — status 문구·release URL 을 여기서 파생해 페이지 간 drift 를 없앤다.
// (버전 자체의 실 릴리스 대조는 별도 게이트 몫 — 잔여, PR 본문 참조.)
const grokRepo = 'https://github.com/ssamssae/grok-telegram-bridge';
const codexRepo = 'https://github.com/ssamssae/codex-telegram-bridge';
const claudeRepo = 'https://github.com/ssamssae/claude-telegram-bridge';
const cursorRepo = 'https://github.com/ssamssae/cursor-telegram-bridge';
const localRepo = 'https://github.com/ssamssae/local-telegram-bridge';
export const bridges = {
  grok: { version: '0.5.3', repo: grokRepo },
  codex: { version: '0.9.9', repo: codexRepo },
  claude: { version: '0.14.2', repo: claudeRepo },
  cursor: { version: '0.4.2', repo: cursorRepo },
  local: { version: '0.2.0', repo: localRepo },
} as const;

export const tools = [
  {
    name: 'Jarvis Mac', status: 'macOS · 오픈소스 · 실험',
    desc: 'Mac 마이크의 호출어로 Cursor에 질문하고 Google Nest에서 답을 듣는 음성 비서 실험. 실제 발화·1회 청취와 응답 지연까지 확인했습니다.',
    links: [
      { label: '제작기와 실측', url: 'https://work.kangdaejong.com/jarvis/' },
      { label: 'GitHub', url: 'https://github.com/ssamssae/jarvis-mac' },
    ],
  },
  {
    name: '입타 (Ipta)', icon: '/product-icons/ipta-779f2694b7.png', status: 'Mac · Windows · 오픈소스',
    desc: 'Mac · Windows용 한국어 음성 입력. 받아쓰기는 내 컴퓨터에서 처리하고, AI 문장 다듬기는 선택해서 사용합니다.',
    links: [
      { label: 'Mac 다운로드', url: 'https://github.com/ssamssae/ipta/releases/tag/v0.1.24' },
      { label: 'Windows 다운로드', url: 'https://github.com/ssamssae/ipta/releases/tag/v0.1.25' },
      { label: '사용 안내', url: 'https://kangdaejong.com/ipta/' },
    ],
  },
  {
    name: 'Grok Telegram Bridge', status: '오픈소스 · 공개 배포',
    desc: '텔레그램으로 자기 컴퓨터의 Grok 세션을 부리는 브릿지. Claude·Codex·Cursor·Local 브릿지의 형제 도구입니다.',
    links: [
      { label: 'GitHub', url: bridges.grok.repo },
      { label: 'Release', url: `${bridges.grok.repo}/releases/latest` },
    ],
  },
  {
    name: 'Codex Telegram Bridge', status: '오픈소스 · 공개 배포',
    desc: 'Codex CLI REPL을 텔레그램에서 제어하는 전용 브릿지. 텍스트·이미지·영상·음성·파일 입력, 진행보고, reasoning mirror, typing recovery를 지원합니다.',
    links: [
      { label: 'GitHub', url: bridges.codex.repo },
      { label: 'Release', url: `${bridges.codex.repo}/releases/latest` },
    ],
  },
  {
    name: 'Claude Telegram Bridge', status: '오픈소스 · 공개 배포',
    desc: 'Claude Code live tmux 세션을 텔레그램으로 연결하는 전용 브릿지. claude -p 없이 세션 주입·transcript 추출·미디어 local_path 전달로 동작합니다.',
    links: [
      { label: 'GitHub', url: bridges.claude.repo },
      { label: 'Release', url: `${bridges.claude.repo}/releases/latest` },
    ],
  },
  {
    name: 'Cursor Telegram Bridge', status: '오픈소스 · 공개 배포',
    desc: '이미 떠 있는 Cursor TUI 세션을 텔레그램으로 연결하는 전용 브릿지. 긴 턴 대기, 모델 선택, 승인 버튼을 폰에서 다룹니다.',
    links: [
      { label: 'GitHub', url: bridges.cursor.repo },
      { label: 'Release', url: `${bridges.cursor.repo}/releases/latest` },
    ],
  },
  {
    name: 'Local Telegram Bridge', status: '오픈소스 · 공개 배포',
    desc: '로컬 Ollama·LM Studio 모델을 텔레그램과 터미널의 같은 대화로 연결하는 브릿지. 모델별 기록·clear·재시작 복구를 지원합니다.',
    links: [
      { label: 'GitHub', url: bridges.local.repo },
      { label: 'Release', url: `${bridges.local.repo}/releases/latest` },
    ],
  },
];

export const ebooks = [];
export { retiredProducts };

export const productCounts = {
  apps: apps.length, tools: tools.length, saas: saas.length, ebooks: ebooks.length,
  total: apps.length + tools.length + saas.length + ebooks.length,
};
