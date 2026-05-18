# 🐛 asc-deliver --submit whatsNew null → 409 STATE_ERROR

**일자**: 2026-05-18
**기기**: 🏭 Mac mini (메모요 1.0.5+23 store 업로드 사이클)
**상황**: asc-deliver.py --submit 호출 시 새 version 의 whatsNew=null → ASC 가 review submission 거부
**해결됨**: ✅

## 증상

메모요 1.0.5+23 iOS submit 시:

```
asc-deliver 1차: submit 409 STATE_ERROR
```

ASC API 응답: review submission 에 whatsNew (release notes) 누락 → 거부.

## 원인

`asc-deliver.py` 가 `fastlane/metadata/<locale>/release_notes.txt` 가 없으면 PATCH whatsNew 단계를 skip. 그 결과 새 version 의 whatsNew 필드가 null 인 채로 review submission 시도 → ASC 가 "새 version 은 whatsNew 필수" 정책 적용해 거부.

ASC 정책: **1.0.x 새 version 마다 whatsNew 필수**. 같은 버전 재업로드는 기존 whatsNew 재사용 가능하지만, build number bump 등으로 새 review submission 시작하면 매번 갱신 필요.

## 해결

`fastlane/metadata/ko/release_notes.txt` (또는 `en-US/release_notes.txt` 같은 locale 별 파일) 작성:

```bash
mkdir -p ~/simple_memo_app/fastlane/metadata/ko
cat > ~/simple_memo_app/fastlane/metadata/ko/release_notes.txt <<'EOF'
이번 업데이트에서 바뀐 점: 수동 내보내기/가져오기 / 1단계 되돌리기 / 편집 모드 전체 선택 / 자동 동기화 제거
EOF
```

그 후 asc-deliver.py 재호출 → PATCH whatsNew 단계가 release_notes.txt 본문 적용 → submit PASS.

## 재발 가능 범위

- **모든 iOS submit 사이클** — 매 build number bump 또는 새 version 출하 시 release_notes.txt 갱신 필요
- **submit-app 스킬의 iOS submit 단계** — release_notes.txt 부재 또는 stale 상태에서 호출하면 같은 거부

## 재발 방지 체크리스트

- [ ] `asc-deliver.py` 에 "whatsNew 없음" 감지 시 명시 surface 로직 추가 — silent skip 대신 "release_notes.txt 작성 필요" warning + abort
- [ ] submit-app 스킬의 iOS submit step 전제로 `fastlane/metadata/<locale>/release_notes.txt` 존재 + version 매칭 grep 추가
- [ ] 각 앱 repo 에 `fastlane/metadata/<locale>/release_notes.txt` 영구 commit (별 사이클로 처리)
- [ ] 다음 출하 사이클 directive 작성 시 release notes 본문 명시 + 맥미니가 그 본문으로 release_notes.txt 작성

## 관련

- 메모요 1.0.5+23 store 업로드 사이클 (2026-05-18) iOS submit 1차 거부
- 직전 1.0.3+20 (2026-05-12) 첫 production 출하 사이클에선 manage 했었을 텐데 본 함정 발견 안 됨 — 그때 release_notes.txt 가 어떻게 존재했었는지 별 사이클에 점검 가치
- [[2026-05-18-android-applicationid-snake-case]] 와 같은 사이클에서 surface
