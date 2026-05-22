# 메모요 경쟁사 분석 (2026-05-15)

대상: 메모요 (simple_memo_app, 1.0.4+21). 글로벌 + 한국 시장 메모/노트 앱 경쟁 구도 + 메모요 차별 포지셔닝 1차 draft. loop-fleet 사이클 3 의 🍎 본진 슬롯 산출물 (competitor track).

## 경쟁사 매트릭스

| 앱 | 카테고리 | 가격 | 데이터 정책 | 핵심 USP | 메모요 대비 |
|---|---|---|---|---|---|
| **Google Keep** | 글로벌 #1 (안드로이드 사실상 default) | 무료 | Google 계정 클라우드 sync 필수, 광고 0, 모든 plat 접근 | 컬러풀 sticky note 카드 + 음성/체크리스트/리마인더 통합 + 모든 기기 동기화 | Memoyo win: **로컬 전용 / 계정 0**. Keep win: 동기화 / 음성 메모 / 리마인더. |
| **Apple Notes** | iOS/macOS default, iCloud 통합 | 무료 (Apple 기기 한정) | iCloud sync 필수, 풍부한 서식 + 첨부 + Apple Intelligence rewrite | iCloud · 폴더 · 첨부 · 손글씨(Pencil) · AI 정리 (2025+) | Memoyo win: Android 도 지원 + 데이터 외부 0. Notes win: Apple 생태계 완전 통합. |
| **Samsung Notes** | Galaxy default | 무료 | Samsung Cloud sync (옵션) + S Pen 통합 | S Pen 손글씨 → 텍스트 + PDF import + AI 요약 | Memoyo win: 모든 Android. Samsung Notes win: Galaxy 전용 UX 최적. |
| **에스메모 (SMEMO)** | 한국 **11년 연속 메모장 1위, 1천만+ DL** | 무료 (광고 0) + 프리미엄 옵션 | **PC + 모바일 자체 클라우드 sync** + 비밀 메모 잠금 + 위젯 + 폴더 + 색상 | "국내 유일 PC↔모바일 동기화 무료 메모장" + 위젯 강력 + 비밀 메모 | Memoyo win: 다크 전용 + 미니멀 + 외부 서버 0. SMEMO win: 11년 시장 신뢰 + PC sync + 위젯. |
| **Bear** | minimalist + Markdown writer 타겟 | Free (1 기기) / Pro $2.99/월 (sync) | iCloud sync, 마크다운 + 태그 시스템 | Markdown + 태그 + 깔끔한 typography + writer 친화 export | Memoyo win: 일반 사용자 친화 + 무료 풀 기능 + Android. Bear win: writer/maker 전용 깊이. |
| **Simplenote** | 글로벌 미니멀 free | 무료 (Automattic) | 자체 클라우드 sync, 모든 plat, 광고 0 | "가장 단순한 무료 미니멀 메모장" + 모든 기기 sync + 마크다운 | Memoyo win: 다크 전용 + 한국어 친화 + 외부 서버 0. Simplenote win: cross-device sync 무료. |
| **Standard Notes** | privacy-first 글로벌 | Free (기본) / Productivity $90/년 | **End-to-end 암호화** sync + 모든 plat + 오픈소스 | E2E 암호화 + 오픈소스 신뢰 + privacy-first 마케팅 | Memoyo win: 한국어 친화 + 한국 시장 진입 쉬움 + 더 가벼움. Standard Notes win: E2E 암호화 + 글로벌 privacy 커뮤니티 신뢰. |

## 메모요 USP 검증

ASO description 에 박힌 4 셀링포인트:

1. **"광고 0 · 인앱결제 0 · 트래커 0"** — 검증 OK. Keep/Notes/Samsung Notes/Simplenote 모두 광고 0 (Standard Notes 도) 이라 **차별점 자체로는 약함**. 한국 시장에선 무료 메모장 다수가 광고 있음 (`appbiabi.com/memo-application/` 의 무료 메모장 추천 7개 중 광고 없는 게 일부) → **한국 시장 한정 차별점**.
2. **"100% 로컬 저장 / 외부 서버 0"** — 검증 OK. **한국 시장에서 unique** (에스메모/Keep/Notes/Samsung Notes 모두 클라우드 sync 디폴트). 글로벌 시장에선 Standard Notes 와 경합 (단 E2E 암호화 vs 로컬 단독은 다른 차원). **가장 강력한 차별점**.
3. **"다크 모드 전용"** — 검증 약함 (그러나 무결). 다른 앱은 다크가 옵션. 메모요는 다크 전용. **시장 niche** 라 셀링 임팩트는 중간 — "다크가 좋다고 명시 선호하는 사용자" 세그먼트엔 결정타.
4. **"제목 없이 본문만, 계정 가입 없음, 설치 즉시 사용"** — 검증 OK. Keep 도 가까운 UX 이지만 Google 계정 강제. 메모요 = 진짜 0-friction.

**종합** — 4 셀링포인트 중 가장 강력한 건 **#2 "외부 서버 0"** + **#4 "계정 0"** 두 가지 묶음. ASO description 다음 차수에서 이 두 가지 강조를 더 굵게 갈 가치 있음.

## 포지셔닝 제안

**1차 타겟 세그먼트**: 한국 시장에서 "내 메모가 외부 서버로 안 갔으면" 하는 사람 + "계정 가입 귀찮다" 하는 사람. 구체적으로 —
- 직장 / 학교 비밀번호·민감 정보 임시 메모하는 사람
- 클라우드 동기화 거부 (개인정보 우려) 사용자
- 가벼운 노트만 필요 (메모/Keep/Notes 다중 기능 부담)
- 다크 UI 선호자

**2차 타겟**: 글로벌 시장에서 한국어 메모장 찾는 사용자 (재외 한국인 등). 한국어 UI + 다크 + 미니멀 조합은 글로벌에선 unique.

**경쟁 회피**:
- **에스메모와 정면 경합 X** — 에스메모는 11년 시장 신뢰 + PC sync 가 USP. 메모요가 sync 로 따라가면 약점 노출. **반대 방향 (sync 없는 게 강점) 으로 포지셔닝 고수**.
- **Bear / Standard Notes 글로벌 비교 X** — 가격/타겟 다름. 메모요는 한국어 무료 시장 단독 플레이.
- **Keep / Notes 비교 X** — 거대 default 앱과는 cross-platform sync 차원으로 안 싸움.

**마케팅 메시지 강화 후보** (다음 ASO 사이클에 반영):
- 현재: "심플한 다크 메모장. 광고 없이 본문만 빠르게 적고 스와이프로 즐겨찾기 정리."
- 강화: "**클라우드 안 쓰는 메모장**. 광고 0, 계정 0, 외부 서버 전송 0. 다크 모드 전용 미니멀 노트."

**약점 보완 제안** (다음 제품 사이클):
- (a) **PIN/생체인증 잠금** 추가 — Standard Notes 의 privacy-first 메시지 흡수 + 에스메모 "비밀 메모" 견제. memoyo 1.0.5~1.0.6 후보.
- (b) **사용자 클라우드 옵션** (iCloud Drive / Google Drive 파일 export) — 본 앱 서버 0 유지하면서 sync 욕구 일부 흡수. **사용자가 자기 클라우드에 직접 저장**. memoyo 1.1.0 후보.
- (c) **위젯 추가** — 에스메모 강력 USP 견제. memoyo 1.0.5~1.0.6 후보.

## 다음 액션

1. 다음 ASO 사이클 (3~4주 후 analytics 회수 후) 에서 "클라우드 안 쓰는 메모장" 표어 A/B 테스트 — Play Console 사용자 지정 스토어 등록 기능.
2. memoyo 1.0.5 백로그에 **PIN 잠금 / 위젯 / 클라우드 export** 3개 후보 등재. 강대종 우선순위 판단.
3. 본 spec 은 1차 draft — 4주 후 Google Trends + Play 다운로드 데이터 확보 후 v2 재작성 (실제 검색 패턴 검증).

## 출처

- [10 Best Note Taking Apps 2026 (TechShout)](https://www.techshout.com/best-note-taking-apps/)
- [Apple Notes vs. Google Keep 2026 (Smart Remote Gigs)](https://smartremotegigs.com/apple-notes-vs-google-keep/)
- [The 7 best note-taking apps in 2026 (Zapier)](https://zapier.com/blog/best-note-taking-apps/)
- [메모장 - 에스메모 (Google Play)](https://play.google.com/store/apps/details?id=com.minwise.smemoFree&hl=en_US)
- [무료 메모장 어플 / 메모 위젯 추천 TOP 7 (appbiabi)](https://appbiabi.com/memo-application/)
- [광고 없는 메모어플 없을까요? (딜바다)](http://www.dealbada.com/bbs/board.php?bo_table=forum_android&wr_id=1713)
