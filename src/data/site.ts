// 정본 사이트 데이터 모듈 (회사정보 + 헤더/푸터 메뉴 구조) — T-260720-030.
//
// daejong-page(work.kangdaejong.com) 내부 단일소스. Nav.astro / Footer.astro 는
// 회사정보·메뉴를 여기서 import 한다(이전엔 각 컴포넌트에 인라인 하드코딩 → 이중관리).
//
// 회사정보(company)는 크로스레포 정본(kangdaejong.com/mb-components.js <mb-footer>)과
// 반드시 동일해야 한다. CI 드리프트 가드 scripts/verify-canonical-company.mjs 가
// src/data/_vendored/mb-header-canonical.json 스냅샷과 대조해 불일치 시 fail-closed
// (kangdaejong-com #30 / founder #11 가드와 대칭). 본진 결정 (b) vendored copy:
// CI 는 라이브 fetch 하지 않고 vendored 스냅샷만 본다. 정본 변경 시 `npm run sync:canonical`
// 로 스냅샷 갱신 후 아래 값을 맞춘다. 값 변경은 렌더에 반영되므로 design-skill 게이트 대상.
export const company = {
  name: "마이너스베타스튜디오",
  representative: "강대종",
  bizNumber: "878-21-02478",
  mailOrderNumber: "제 2026-서울마포-1177 호",
  address: "서울특별시 마포구 만리재로10길 4 (공덕동)",
  category: "정보통신업 / 응용 소프트웨어 개발 및 공급업",
  email: "minusbetastudio@gmail.com",
};

// 헤더 메뉴 — daejong-page 로컬 구조(상대경로 섹션). 크로스레포 정본과 라벨은 같으나
// href 는 이 사이트 기준(상대경로)이라 드리프트 가드 대상 아님 — 정본은 절대경로/트레일링
// 슬래시가 달라 대조 시 오탐. 네비 "구성" 재편(파운더 기본+작업장 3개)은 T-260720-029 별건.
// 여기서는 현행 값을 그대로 이관한다(렌더 diff 0).
export const navPrimary = [
  { href: '/', label: '작업장' },
  { href: '/products/', label: '제품' },
  { href: '/worklog', label: '작업일지' },
  { href: '/newsletter', label: '뉴스레터' },
  { href: '/insights', label: '인사이트' },
  { href: '/system', label: '시스템' },
];
export const navSecondary = [
  { href: 'https://kangdaejong.com', label: '회사소개' },
  { href: 'https://founder.kangdaejong.com', label: '대표소개' },
  { href: '/cost/', label: '비용공개' },
  { href: '/lab', label: 'lab' },
];
