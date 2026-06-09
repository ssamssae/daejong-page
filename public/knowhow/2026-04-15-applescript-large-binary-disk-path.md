---
category: 자동화
tags: [applescript, macos, automation, file-upload]
first_discovered: 2026-04-15
related_issues:
  - 2026-04-15-aab-40mb-applescript-chunking
---

# AppleScript 로 대용량 바이너리 자동화 — 디스크 경로 패턴

- **첫 발견:** 2026-04-15 (메모요 AAB 40MB 업로드 자동화)
- **재사용 영역:** macOS GUI 자동화 (Play Console / App Store Connect / Finder 파일 업로드 다이얼로그 등 모든 파일 입력)

## 한 줄 요약

AppleScript-osa 브리지는 단일 호출 페이로드 크기 상한이 있어 1MB 이상 바이너리를 텍스트로 직접 못 넘긴다. **파일을 먼저 디스크에 두고 경로만 AppleScript 에 전달** 하는 패턴이 정답. 청크 분할 base64 우회는 가능하지만 안 권장.

## 차단 시그니처

```
AppleScript: 응답 없음 (file 입력 단계에서 hang)
```

40MB AAB 를 osascript 로 텍스트 페이로드 전달 시도 → 메모리에 통째로 올리려다 응답 없음 상태로 멈춤.

## 정답 패턴

```bash
# 1. 파일을 디스크에 먼저 둠 (~/Downloads, /tmp 등)
cp /path/to/large.aab /tmp/upload.aab

# 2. AppleScript 는 파일 경로만 받기
osascript -e '
tell application "System Events"
  ...
  set the clipboard to POSIX file "/tmp/upload.aab"
  keystroke "v" using {command down}
  ...
end tell
'
```

또는:

```applescript
tell application "Google Chrome" to activate
delay 0.5
tell application "System Events"
  click button "찾아보기" of window 1 of process "Google Chrome"
  delay 0.5
  keystroke "g" using {command down, shift down}  -- Go to folder
  delay 0.3
  keystroke "/tmp/upload.aab"
  keystroke return
end tell
```

## 반패턴 (피하기)

```python
# ❌ 안 좋음 — 메모리 통째 + 청크 28개 + AppleScript 조립
chunks = base64.b64encode(open('large.aab', 'rb').read())
for chunk in split_2mb(chunks):
    subprocess.run(['osascript', '-e', f'set chunk to "{chunk}"'])
# AppleScript 가 청크를 Blob 조립해서 임시 파일로 재구성
```

이 방식은 **돌긴 돌지만** 28번 osascript 호출 + 메모리 사용 + 디스크 IO 두 번. 단순히 디스크에 한번 쓰고 경로만 넘기면 1번 호출로 끝.

## Forcing Function

- 파일 업로드 자동화 = **디스크 경로 전달 디폴트** 룰 박기
- AppleScript 브리지는 텍스트 (URL, 짧은 메시지) 만, 바이너리 0
- 1MB 이상 페이로드 예상 시 osascript 호출 0 검토 — Playwright/Puppeteer 같은 브라우저 자동화가 더 적합한 케이스 많음

## 재사용 후보

- Play Console AAB 업로드 (메모요 사이클)
- App Store Connect IPA Transporter 업로드
- Finder 파일 업로드 다이얼로그 (Naver / Substack / 기타 웹)
- 큰 PDF / 비디오 / 이미지 업로드 자동화
