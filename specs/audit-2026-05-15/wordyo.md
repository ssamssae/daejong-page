# 단어요 코드베이스 감사 (2026-05-15)

작성: 2026-05-15, WSL (wsl/audit-wordyo-2026-05-15 브랜치) — audit only, 코드 수정 없음
대상: ~/apps/wordyo @ e0a1a86 (1.0.2+1)
조사 범위: lib/ (7 파일, 1292 라인) · test/ (2 파일, 106 라인) · android/app/src/main/AndroidManifest.xml · ios/Runner/Info.plist · pubspec.yaml · assets/

요약 — 작은 코드베이스(1300 라인). 큰 구조 결함 0, 그러나 옛 한줄일기 잔재(theme heat/AI 토큰)와 await-in-loop · 사용 0 의존성이 다수.

## 성능 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|----------|
| P1 | `_load()` await-in-loop — 카테고리당 30 단어, 각 ref 마다 `isCompleted` + `isFavorite` 2회 await. 30단어 = 60 platform channel round-trip 직렬화. 카테고리 전환마다 발생. | lib/screens/home_screen.dart:84-87 | 중 | `SharedPreferences.getKeys()` 1회 + 메모리 Set 매칭으로 변경. listFavorites 패턴 그대로 listCompleted 신설. await 60→2. |
| P2 | `_computeCategoryStats()` 카테고리 전환마다 6개 카테고리 JSON 전부 재파싱 + 각 단어 `isCompleted` await. 30 × 6 = 180 prefs 읽기 + 6 JSON parse. | lib/screens/home_screen.dart:102-114 | 고 | `WordRepository` 에 In-memory cache(`Map<String,List<Word>>`) + 시작 시 1회 prebuild. `_load()` 와 통합해 prefs 읽기 중복 제거. |
| P3 | `getStreak()` 무한 후방 탐색 — 연속 사용일 N이면 매 호출당 N+1 prefs 읽기. 365일 사용자 = 매 화면 진입/완료 토글마다 365 reads. | lib/services/learning_progress_service.dart:93-104 | 중 | 상한(`maxLookback: 90`) 추가 + streak last-computed 캐시(`wordyo.streak.cache.YYYY-MM-DD`) 도입. |
| P4 | `loadCategory()` JSON 재파싱 — rootBundle 캐시는 있으나 jsonDecode 는 매번 실행. `_computeCategoryStats()` + `_load()` 합쳐 한 번 전환에 6+1 = 7회 파싱. | lib/services/word_repository.dart:9-16 | 저 | `WordRepository` 인스턴스 필드에 `Map<String,List<Word>>` cache. 1회 로드 후 hit. |
| P5 | `incrementViewCount()` 매 카드 노출마다 prefs write 발생 + 이 데이터를 읽는 코드 없음(P3 ~ P4 와 별개). 디스크 IO 낭비 + 데이터 영구 적재. | lib/screens/home_screen.dart:119 (호출) + lib/services/learning_progress_service.dart:64-75 (정의) | 저 | UI 에서 사용 안 하므로 호출 + 메서드 삭제 (Dead code D3 와 짝). 추후 통계 화면 추가 시 부활. |

## 보안 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|----------|
| S1 | Android `INTERNET` 권한 선언 — lib/ 어디서도 네트워크 호출 0. ASO description "외부 서버 호출 0, 오프라인 완전 동작" 과 정면 모순. Google Play Data safety 폼도 false 답변 위험. | android/app/src/main/AndroidManifest.xml:2 | 중 | `<uses-permission android:name="android.permission.INTERNET"/>` 삭제. Flutter 디버그 모드는 자동 추가하지만 release 매니페스트에선 제거 가능. |
| S2 | 사용 0 의존성 4개 (`http` `share_plus` `path_provider` `cupertino_icons`) — 각 패키지가 자체 권한·SDK 코드를 포함해 release APK/IPA 에 동봉됨. 공격면 + 마케팅 진술과 mismatch. | pubspec.yaml:25-28 (cupertino_icons 는 의도적 가능) | 중 | `flutter pub deps -- --style=compact` 확인 후 `http`/`share_plus`/`path_provider` 3개 삭제. cupertino_icons 는 Material 만 쓰면 삭제 OK. |
| S3 | iOS Info.plist `NSAppTransportSecurity` 미명시. 기본값은 HTTPS-only 라 실제 위험 0 이지만, S2 의 http 패키지 잔존 동안 미래 누군가 HTTP URL 호출 시 검토 누락 가능. | ios/Runner/Info.plist (none) | 저 | S2 해결 후 자연스럽게 해소. 또는 명시적 `NSAllowsArbitraryLoads = false` 박기. |
| S4 | Seed JSON 스키마 검증 0 — `Word.fromJson` 이 `as String` 직접 캐스트. 자산 변조(rooted device · 향후 OTA 시드 도입 시) → 런타임 unhandled `TypeError`. | lib/models/word.dart:20-28 + lib/services/word_repository.dart:13-15 | 저 | `as String?` + `?? ''` defensive cast 또는 `try/catch` 에서 빈 카테고리로 폴백. 1.x 에선 OTA 없으니 우선순위 낮음. |
| S5 | SharedPreferences 평문 저장 — 학습 완료/즐겨찾기/일별 카운트가 평문. PII 0 이므로 위험은 매우 낮으나, iOS 백업 plist 가 클라우드 백업 대상. 무결성 검증 없음(타 앱이 prefs 쓸 수 없으나 root/jailbreak 시 변조 가능). | lib/services/learning_progress_service.dart:1-126 | 저 | 현재 데이터 민감도 기준 fix 불필요. 추후 학습 기록을 자랑·공유 기능(share_plus 활용?) 추가 시 변조 방지 hash 박기. |

## Dead code (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|----------|
| D1 | 한줄일기 잔재 색상 토큰 — `aiBubble` · `aiBubbleBorder` · `aiAccent` · `heatL0~heatL4` 8개 색상이 정의만 되고 lib/ 어디서도 참조 0. theme.dart 헤더 주석 "B2 emotion-heatmap design tokens" 자체가 한줄일기 origin. | lib/theme.dart:12-14, 33-37 (+ 주석 1, 32) | 중 | 8개 const + 관련 주석 4줄 삭제. theme.dart 헤더 주석 "B2 emotion-heatmap" → "단어요 design tokens" 로 정정. |
| D2 | 사용 0 의존성 4개 — 위 S2 와 동일 항목. dead surface + dead bundle size. APK ~수백KB, IPA 도 유사. | pubspec.yaml:25-28 | 중 | S2 와 같이 처리. |
| D3 | `getViewCount()` 메서드 + `_viewCountPrefix` orphan 데이터 — `incrementViewCount` 가 prefs 에 쓰지만 `getViewCount` 호출자 0. 사용자 prefs 에 `wordyo.seen.*` 키 누적만 됨. | lib/services/learning_progress_service.dart:22, 35-36, 64-75 + home_screen.dart:119 | 저 | `_recordView()` 호출 + `incrementViewCount` + `getViewCount` + `_viewCountKey` + `_viewCountPrefix` 일괄 삭제. 기존 사용자 prefs 의 orphan 키는 다음 prefs 마이그레이션(향후 어차피 한 번 필요)에서 청소. |
| D4 | `cupertino_icons` 의존성 + iOS 위젯 사용 0 — main.dart 가 `MaterialApp` 만 사용. CupertinoIcons 클래스 reference 0. | pubspec.yaml:24 | 저 | D2 와 같이 삭제. |
| D5 | theme.dart 주석 잔재 — "AI 답글은 brand-blue 박스로 통합 (사용자 피드백 2026-04-26)" 4줄 (theme.dart:10-11) + B2 emotion-heatmap 헤더(1) + heatmap scale 주석(32). 단어요엔 AI 응원 1줄(motivation_pool) 있으나 "파란박스 AI 답글" 디자인 아님. | lib/theme.dart:1, 10-11, 32 | 저 | 주석 8줄 삭제 또는 단어요 맥락으로 재작성. D1 과 같이 처리. |

## 종합 의견

코드베이스는 작고 잘 정돈됐다. 1292 라인에 TODO/FIXME/HACK 0, print 0, dead import 0 — 텍스트 표면은 깨끗. 그러나 **"단어요 = 한줄일기 fork"** 흔적이 의존성과 theme 토큰에 그대로 박혀 있다. 사용 0 패키지 3~4개와 색상 토큰 8개, AI 답글 주석 4줄, 한줄일기 origin 헤더 1줄 — 전부 한 번에 삭제해도 동작에 영향 0. ASO description 에서 "외부 서버 호출 0, 오프라인 동작" 을 핵심 차별점으로 박았는데 코드와 매니페스트가 그 진술을 반증하는 흔적(INTERNET 권한, http 패키지)을 들고 있는 게 가장 risky.

성능 이슈 5개 중 P1·P2 는 같은 await-in-loop 패턴 변형이라 한 번에 fix 가능. `LearningProgressService.listFavorites` 가 이미 `getKeys()` + 메모리 매칭 패턴을 쓰고 있어 같은 형태로 `listCompleted` 신설하면 자연스럽게 통합. 30단어 × 6카테고리 사용자 기준 카테고리 전환 시 prefs IO 가 ~360회 → ~6회로 떨어진다(체감 가능한 카테고리 전환 지연 0). P3 streak 무한 탐색은 365일+ 사용자만 체감하지만 안전망으로 90일 상한은 박아두는 게 좋다.

다음 사이클 우선순위 (1줄): **S1+S2+D1~D5 를 묶어 "한줄일기 잔재 청소 + ASO 진술 정합화" PR 1개** — 의존성 3개 + 색상 8개 + INTERNET 권한 + viewCount 데드 + 주석 잔재. P1/P2 는 별도 cycle.
