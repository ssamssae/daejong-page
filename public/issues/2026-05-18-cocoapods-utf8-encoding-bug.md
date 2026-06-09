# 🐛 CocoaPods 1.16.2 + Ruby 4.0.3 UTF-8 인코딩 버그 — `pod install` 즉사

**일자**: 2026-05-18
**기기**: 🏭 Mac mini (macOS arm64), homebrew Ruby 4.0.3, CocoaPods 1.16.2_2
**상황**: 메모요 1.0.5+22 release build 1차 사이클 중 `pod install` 실행 시 즉사
**해결됨**: ✅

## 증상

`cd ios && pod install` 실행 시 stacktrace 와 함께 즉사:

```
/opt/homebrew/Cellar/ruby/4.0.3/lib/ruby/4.0.0/unicode_normalize/normalize.rb:153:in 'UnicodeNormalize.normalize':
Unicode Normalization not appropriate for ASCII-8BIT (Encoding::CompatibilityError)
    from /opt/homebrew/Cellar/cocoapods/1.16.2_2/libexec/gems/cocoapods-1.16.2/lib/cocoapods/config.rb:167:in 'String#unicode_normalize'
    from /opt/homebrew/Cellar/cocoapods/1.16.2_2/libexec/gems/cocoapods-1.16.2/lib/cocoapods/config.rb:167:in 'Pod::Config#installation_root'
    from /opt/homebrew/Cellar/cocoapods/1.16.2_2/libexec/gems/cocoapods-1.16.2/lib/cocoapods/config.rb:227:in 'Pod::Config#podfile_path'
    ...
```

## 원인

Ruby 4.0 의 `String#unicode_normalize` 는 인코딩이 ASCII-8BIT 인 문자열을 정규화 불가. CocoaPods 1.16.2 의 `Pod::Config#installation_root` 가 현재 디렉토리 경로 (`pwd`) 를 `String#unicode_normalize(:nfc)` 으로 정규화하려 시도하는데, LANG/LC_ALL 환경변수가 비어있거나 ASCII 류로 설정되면 Ruby 가 경로 문자열을 ASCII-8BIT 으로 받음 → 정규화 호출 즉시 `Encoding::CompatibilityError`.

Claude Code shell 환경은 LANG 을 명시 setup 하지 않아 (또는 `C` / `POSIX` 디폴트) ASCII-8BIT 으로 문자열이 들어옴.

## 해결

`LANG` + `LC_ALL` 환경변수를 `en_US.UTF-8` 로 명시:

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
```

`flutter build ipa` 도 내부적으로 `pod install` 호출하므로 동일 환경변수 prefix 필요:

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 flutter build ipa --release --export-method app-store
```

## 재발 가능 범위

- **모든 Flutter iOS 앱 빌드** (포모도로, 로또, 한줄일기, 단어요, 메모요 등) — `pod install` 또는 `flutter build ipa` 호출하는 모든 워크플로우
- **submit-app 스킬의 iOS 빌드 단계** — 환경변수 prefix 누락 시 즉사
- **night-builder v2 launchd 워커** — 환경변수 inherit 여부 확인 필요 (launchd 는 GUI 세션의 LANG 안 받음, plist 에 `EnvironmentVariables` 박아야 함)

## 재발 방지 체크리스트

- [ ] `submit-app` 스킬의 iOS build step 에 `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` prefix 명시
- [ ] night-builder v2 plist 에 `<key>EnvironmentVariables</key><dict><key>LANG</key><string>en_US.UTF-8</string><key>LC_ALL</key><string>en_US.UTF-8</string></dict>` 박혀있는지 확인
- [ ] 다른 앱 빌드 directive 작성 시 환경변수 prefix 명시 (또는 `pod install` 래퍼 스크립트 만들어 envar 강제)
- [ ] 장기적으로 homebrew Ruby 업그레이드 또는 cocoapods 1.16.3+ 출시 시 본 버그 fix 확인 후 환경변수 prefix 제거 검토

## 관련

- 메모요 1.0.5+22 release build 사이클 (2026-05-18) 에서 1차 발견 + 해결
- CocoaPods upstream issue: 검색 시 `Unicode Normalization not appropriate for ASCII-8BIT cocoapods` 키워드로 GitHub issue 다수 확인 가능 (Ruby 4.x 출시 후 일반 함정)
