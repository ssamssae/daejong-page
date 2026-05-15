# 한줄일기 코드베이스 감사 (2026-05-15)

버전 `1.1.0+6` 기준. 분석 범위: `lib/` 전체, `pubspec.yaml`, `AndroidManifest.xml`, `ios/Runner/Info.plist`.  
작성: 💻 notebook3060 / 브랜치 `notebook3060/audit-hanjul-2026-05-15`

---

## 성능 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|---------|
| P1 | **LocalStore 이중 인스턴스** — HomeScreen·StatsScreen 각자 `LocalStore(key: 'hanjul_entries_v1')` 생성 후 `initState()`에서 독립 `loadList()` 호출. 탭 전환 시 SharedPreferences를 2회 읽고, 두 화면의 상태가 순간적으로 불일치 가능. | `home_screen.dart:20-24`, `stats_screen.dart:23-27` | 中 | Provider/Riverpod 등 단일 상태 계층으로 entries 공유; LocalStore는 1개 인스턴스만 유지. |
| P2 | **SharedPreferences.getInstance() 매 호출 시 재요청** — `loadList()`·`saveList()`·`clear()` 전부 `await SharedPreferences.getInstance()` 호출. 단건 작업마다 플러그폼 채널 왕복 발생. | `local_store.dart:28`, `:40`, `:46` | 低-中 | `LocalStore` 생성자에서 `getInstance()` 1회 수행 후 `_prefs` 필드로 캐싱. |
| P3 | **스트릭 재계산 매 빌드** — HomeScreen의 `_streak()`와 StatsScreen의 `_currentStreak`·`_longestStreak` 게터가 `build()` 경로에서 호출되며 매번 `_items` 전체를 `toSet()` + sort 수행. 항목 수 증가 시 O(n log n) 누적. | `home_screen.dart:176-201`, `stats_screen.dart:85-123` | 中 | `_items` 변경 시에만 재산출하도록 `_reload()` 안에서 캐싱; 게터를 필드로 교체. |
| P4 | **`_selectedEntry()` 선형 탐색 매 렌더** — StatsScreen에서 히트맵 셀 선택 시 `setState` 후 `_selectedEntry()`가 `_items` 전체를 순회. 일기 수가 많아질수록 렌더마다 낭비. | `stats_screen.dart:166-176` | 低-中 | 날짜 → DiaryEntry 맵(`Map<DateTime, DiaryEntry>`)을 `_reload()` 시 미리 구성; `_selected` 변경 시 O(1) 조회. |
| P5 | **공유 이미지를 메인 스레드에서 3× DPR 인코딩** — `boundary.toImage(pixelRatio: 3.0)` + `image.toByteData(format: png)` 모두 UI isolate에서 동기 수행. 통계 카드 크기에 따라 수십 ms 메인스레드 블로킹 및 순간 화면 멈춤. | `stats_screen.dart:139-143` | 低-中 | `compute()`로 PNG 인코딩을 별도 isolate에서 수행; 또는 공유 중 로딩 표시로 UX 커버. |

---

## 보안 (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|---------|
| S1 | **일기 내용 평문 저장** — DiaryEntry(text + aiReply)가 JSON 문자열로 SharedPreferences에 암호화 없이 저장됨. 루팅된 Android에서 `adb backup` 또는 root shell로 내용 노출 가능. iOS는 sandbox로 어느 정도 보호되지만 iCloud 백업에 포함됨. | `local_store.dart:39-43`, `entry.dart:28-34` | **高** | `flutter_secure_storage` 도입 또는 기기 바인딩 키로 JSON 블롭 AES-GCM 암호화. 단기: 최소한 `NSFileProtectionComplete`(iOS) / Android Keystore 활용 검토. |
| S2 | **http.Client 누수** — `WriteScreen`이 매 인스턴스 생성 시 `AiService()` (→ `http.Client()`)를 새로 생성하나 `dispose()`에서 `_client.close()` 미호출. 화면을 열고 닫을 때마다 HTTP 연결 풀이 누적됨. | `write_screen.dart:19`, `ai_service.dart:37` | 中 | `AiService`를 싱글턴으로 격상하거나, `WriteScreen.dispose()`에서 `_ai.close()` 호출; `AiService`에 `void close() => _client.close()` 추가. |
| S3 | **인증서 피닝 부재** — Cloudflare Worker 엔드포인트 호출 시 표준 TLS만 사용. 공용 Wi-Fi 또는 기업 프록시 환경에서 MITM이 일기 텍스트를 가로챌 수 있음. | `ai_service.dart:83-91` | 中 | `http_certificate_pinning` 패키지 도입 또는 Cloudflare의 SPKI 핀 하드코딩. 단기: 최소한 README/개인정보 처리방침에 "일기 본문이 AI 처리를 위해 서버 전송됨" 명시. |
| S4 | **Device ID 하드웨어 비바인딩** — 속도 제한용 Device ID가 `Random.secure()` 16바이트로 생성되어 앱 데이터 삭제 시 재발급됨. 악의적 사용자가 앱 초기화 반복으로 rate limit 우회 가능. | `ai_service.dart:51-65` | 低 | 설계상 의도된 트레이드오프이므로 코드 주석으로 명시; 강화 필요 시 `device_info_plus`의 기기 식별자를 보조 신호로 추가 (단, 개인정보 주의). |
| S5 | **AI 오류 detail이 UI에 노출** — `AiServiceException.detail`(예: `"upstream_failed"`, `"empty_reply"`) 및 statusCode가 `SelectableText`로 사용자에게 그대로 표시됨. Worker 내부 오류 코드가 노출되면 공격자의 탐색(enumeration)에 활용될 수 있음. | `write_screen.dart:354-363`, `ai_service.dart:14-25` | 低 | 프로덕션 빌드에서는 detail을 내부 로그로만 남기고 UI에는 불투명한 오류 코드(예: `[ERR-7]`)만 노출; `kDebugMode` 분기로 구분. |

---

## Dead code (top 5)

| # | 이슈 | 위치 | 영향도 | 권장 fix |
|---|------|------|--------|---------|
| D1 | **`simple_app.dart` 전체** — `SimpleApp` 위젯은 공장 템플릿에서 복사된 스캐폴드이며, 프로젝트 어디에도 import되지 않음. `main.dart`는 커스텀 `HanjulApp`을 직접 사용. | `lib/common/simple_app.dart` (40줄 전체) | 低-中 | 파일 삭제; 템플릿 재사용 필요 시 공장 repo에서 가져올 것. |
| D2 | **`time_slot.dart` 전체** — `TimeSlot` enum · `slotOf()` · `slotLabel()` · `slotPrompt()` 모두 import 없음. `WriteScreen`의 입력 힌트("오늘은 어떤 하루였나요?")는 정적 문자열로 대체됨. 시간대별 프롬프트 기능이 구현 도중 철회된 흔적. | `lib/common/time_slot.dart` (36줄 전체) | 低-中 | 기능 부활 계획 있으면 BACKLOG.md에 TODO 추가 후 보존; 계획 없으면 삭제. |
| D3 | **`home_screen.dart:69` `final removed = e` 별칭** — `_delete()` 내부에서 파라미터 `e`의 별칭인 `removed`를 만들고 곧바로 `_undoDelete(removed)` 에 넘김. `e` 직접 사용과 동일. | `home_screen.dart:69` | 低 | `removed` 선언 제거; `_undoDelete(e)` 직접 호출. |
| D4 | **`StatsScreenState`·`reload()` 불필요한 공개 접근성** — `State<StatsScreen>` 구현체가 `_StatsScreenState`가 아닌 `StatsScreenState`(공개)이고 `reload()` 메서드도 공개. 외부에서 GlobalKey를 통해 호출하는 코드는 없음. HomeScreen의 패턴(`_HomeScreenState`, `_reload()`)과 불일치. | `stats_screen.dart:20`, `:40` | 低 | `class StatsScreenState` → `class _StatsScreenState`, `reload()` → `_reload()`로 변경; 접근 범위 최소화. |
| D5 | **`pubspec.yaml:2` 제너릭 description** — `"A new Flutter project."` — Flutter 프로젝트 생성 시 자동 삽입되는 플레이스홀더. 배포된 앱에 의미 없는 잔재. | `pubspec.yaml:2` | 低 | `"한 줄로 기록하는 오늘의 일기 앱"` 등 실제 설명으로 교체. |

---

## 종합 의견

한줄일기는 **기능 범위가 좁고 코드가 작아 전반적으로 안정적**이다. 파일 수 10개 미만, 외부 의존성 5개(cupertino_icons, shared_preferences, http, share_plus, path_provider)로 공격 표면이 제한적이며, AI 호출을 Cloudflare Worker 프록시로 감싸 API 키를 앱 번들에서 제외한 점은 올바른 설계 결정이다. AndroidManifest의 권한도 INTERNET 하나뿐으로 최소화되어 있다.

**가장 즉각적인 개선 대상은 S1(평문 저장)**이다. 한줄일기의 핵심 가치는 "내 감정을 솔직하게 적는 것"인데, 그 텍스트가 루팅 기기나 백업 경로에서 평문으로 읽힌다면 제품의 신뢰도와 직결된다. `flutter_secure_storage` 도입 또는 최소한 iOS `NSFileProtectionComplete` 적용이 가장 우선순위가 높다. P1+P3(이중 store + 스트릭 반복 계산)는 현재 항목 수가 적어 체감되지 않지만, 사용자가 1년치 일기를 쌓으면 탭 전환마다 노이즈가 생기기 시작할 수 있다. 단일 상태 레이어 도입을 다음 리팩토링 사이클의 기준점으로 잡는 것이 좋다.

**다음 사이클 우선순위**: S1 평문 저장 암호화 → P1 LocalStore 단일 상태 레이어 → D1·D2 dead file 정리.
