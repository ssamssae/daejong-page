// 정본 제품 데이터 (T-260723-061) — 랜딩(index)·제품(products) 페이지 공통 소스.
//   제품 개수·공개 브릿지 버전을 여기 한 곳에서만 관리하고, 두 페이지가 빌드타임에
//   파생한다(length·버전 파생). 손으로 박은 상수의 스테일 재발방지 — T-260722-012 phase1
//   근본패턴(스테일=하드코딩 상수에서만 발생)의 잔여 축(제품개수·브릿지버전) 마무리.

export const apps = [
  {
    name: '한줄일기 + AI 응원', status: 'iOS LIVE · Android LIVE · ₩1,900',
    desc: '하루 한 줄 일기를 쓰면 AI가 공감+응원 한 줄 답글을 남겨줍니다. 53주 감정 히트맵, 로컬 저장, 계정 가입 0.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6764308678' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.hanjul' },
    ],
  },
  {
    name: '메모요', status: 'iOS · Android LIVE',
    desc: '심플한 다크 테마 메모 앱. 복수 선택 삭제를 지원하는 가벼운 메모 도구.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6762068073' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.simple_memo_app' },
    ],
  },
  {
    name: '더치페이 계산기', status: 'iOS LIVE · Android LIVE',
    desc: '여러 명이 먹은 자리를 편하게 나눠 내는 정산 도우미. 금액·인원수 입력만으로 바로 정산.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6762072499' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.dutchpay' },
    ],
  },
  {
    name: '약먹자', status: 'iOS LIVE · Android LIVE',
    desc: '복약 시간을 놓치지 않게 도와주는 알림 앱. 약 등록 → 알림 시각 설정만으로 매일 챙겨줍니다.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6762100639' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.yakmukja' },
    ],
  },
  {
    name: '단어요', status: 'iOS LIVE · Android LIVE',
    desc: '영어 단어를 카드처럼 넘기며 학습하는 미니 단어장. 진행도와 즐겨찾기를 기기 안에 저장합니다.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6766556759' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.daejongkang.wordyo' },
    ],
  },
  {
    name: '한컵', status: 'iOS LIVE',
    desc: '하루 물 섭취량 트래커. 1컵 단위 카운트와 일일 목표량으로 수분 섭취를 챙겨주는 미니 앱.',
    links: [{ label: 'App Store', url: 'https://apps.apple.com/kr/app/id6765536616' }],
  },
  {
    name: '포모도로', status: 'iOS LIVE · Android LIVE',
    desc: '25분 집중 + 5분 휴식 사이클 타이머. 집중 보조 미니 앱.',
    links: [
      { label: 'App Store', url: 'https://apps.apple.com/kr/app/id6765536777' },
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.ssamssae.pomodoro' },
    ],
  },
];

export const saas = [
  {
    name: '첫이름 — AI 사주 작명', status: '웹 SaaS · ₩19,900 · 결제 연동 준비중',
    desc: '사주·획수·인명용한자 결정론 분석 + AI 뜻풀이 하이브리드 작명 서비스.',
    links: [{ label: '결제 연동 준비중', disabled: true }],
  },
];

// 공개 브릿지 버전 단일 소스 — status 문구·release URL 을 여기서 파생해 페이지 간 drift 를 없앤다.
// (버전 자체의 실 릴리스 대조는 별도 게이트 몫 — 잔여, PR 본문 참조.)
const codexRepo = 'https://github.com/ssamssae/codex-telegram-bridge';
const claudeRepo = 'https://github.com/ssamssae/claude-telegram-bridge';
export const bridges = {
  codex: { version: '0.9.2', repo: codexRepo },
  claude: { version: '0.10.1', repo: claudeRepo },
} as const;

export const tools = [
  {
    name: 'Codex Telegram Bridge', status: `오픈소스 · v${bridges.codex.version}`,
    desc: 'Codex CLI REPL을 텔레그램에서 제어하는 전용 브릿지. 텍스트·이미지·영상·음성·파일 입력, 진행보고, reasoning mirror, typing recovery를 지원합니다.',
    links: [
      { label: 'GitHub', url: bridges.codex.repo },
      { label: 'Release', url: `${bridges.codex.repo}/releases/tag/v${bridges.codex.version}` },
    ],
  },
  {
    name: 'Claude Telegram Bridge', status: `오픈소스 · v${bridges.claude.version}`,
    desc: 'Claude Code live tmux 세션을 텔레그램으로 연결하는 전용 브릿지. claude -p 없이 세션 주입·transcript 추출·미디어 local_path 전달로 동작합니다.',
    links: [
      { label: 'GitHub', url: bridges.claude.repo },
      { label: 'Release', url: `${bridges.claude.repo}/releases/tag/v${bridges.claude.version}` },
    ],
  },
];

export const ebooks = [
  {
    name: '1인회사 AI자동화', status: '마이너스베타스튜디오(mβ) · ₩10,000',
    desc: '1인 비즈니스의 구조화부터 콘텐츠, 자동화, 판매까지 실제 작업 흐름을 정리한 전자책.',
    links: [{ label: '크몽에서 구매', url: 'https://kmong.com/gig/786557' }],
  },
  {
    name: '혼자서 AI팀', status: '마이너스베타스튜디오(mβ) · ₩15,000',
    desc: '혼자 일하면서 여러 AI 역할을 팀처럼 구성하고 운영하는 방법을 정리한 전자책.',
    links: [{ label: '크몽에서 구매', url: 'https://kmong.com/gig/786749' }],
  },
];

export const productCounts = {
  apps: apps.length, tools: tools.length, saas: saas.length, ebooks: ebooks.length,
  total: apps.length + tools.length + saas.length + ebooks.length,
};
