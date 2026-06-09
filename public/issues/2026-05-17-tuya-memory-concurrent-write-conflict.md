# 2026-05-17 — tuya_devices.md 동시 쓰기로 인한 autostash 충돌 (반복 발생)

## 발생

2026-05-17 11:38~11:42 KST.

1. 11:38 강대종 → 🖥 desktop3060Ti: "tuya 선풍기꺼줘"
2. 🖥 가 처리: Tuya API 로 디바이스 목록 → 씬 목록 enumerate → `선풍기 끄기` (S5rM5ZrAQI8CDzdk) 트리거 성공
3. 🖥 가 메모 부재 인지 후 `~/claude-skills/openclaw-handoff/memory/tuya_devices.md` 에 선풍기 IR 섹션 추가 (커밋 X, push X, 로컬에만)
4. 11:42 🍎 본진이 같은 노드에 `claude-skills/skills-private 분리 마이그레이션` directive paste
5. `git pull --rebase --autostash` 실행
6. **충돌** — 본진이 5분 먼저 (origin/main HEAD `9893fd5` 인근 commit `402e0ce`, `5a180a1`) 같은 파일에 22개 씬 enumerate 포함 더 완전한 버전을 push 한 상태였음. 🖥 autostash pop 시 `<<<<<<< Updated stream` / `>>>>>>> Stashed changes` 충돌 마커 발생

## 강대종 멘트

> 왜 이런 일이 발생하지 저번에도 그랬는데 이슈등록하고 재발방재도 등록해줘

→ 반복 패턴 = "두 노드가 거의 동시에 같은 SoT memory 파일에 독립적으로 같은 내용을 추가하려고 함"

## 원인

**구조적 문제**: tuya_devices.md 같은 SoT memory 파일은 어느 노드에서나 "이 정보 메모에 없네" → 자동으로 추가하는 패턴이 있음. 두 노드가 같은 분량의 정보를 동시에 발견하면 양쪽 다 같은 파일에 쓰려고 시도 → push race + autostash pop 충돌.

이번 경우:
- 🍎 본진은 11:33~11:38 사이에 선풍기/에어컨/공기청정기 + 22개 씬 enumerate 풍부한 업데이트 작업
- 🖥 desktop3060Ti 는 같은 시간에 "선풍기 꺼줘" 처리 중 미니 업데이트 (선풍기/에어컨/공기청정기 3종, 씬 4개)
- 둘 다 같은 H2 섹션 (`## 🌀 IR 가전` 와 `## ❄️ IR 디바이스`) 신설 → 통합 X 영역 충돌

데이터 손실은 0 (본진 버전이 🖥 버전의 strict superset). 그러나 사용자 입장에서 "왜 충돌해? 또?" 라는 마찰.

## 기존 관련 이슈

`2026-05-16-stale-recover-loss.md` (병렬 작업 중 stale-on-stale 사고) 와 같은 계열. CLAUDE.md 의 "병렬 작업 + 충돌 방지 원칙" 6번 조항 ("수정 예정 파일 목록 먼저 텔레그램으로 선언") 위반.

## 재발방지 (3중 방어)

### 1. SoT memory 파일 쓰기 = Mac 본진 routing (강한 룰)

CLAUDE.md 의 "todo 자동 라우팅" 과 같은 패턴을 memory 파일에도 적용:

- `~/claude-skills/openclaw-handoff/memory/*.md` 수정은 🍎 Mac 본진 전담
- 다른 노드 (🪟 🏭 🖥 💻) 는 텔레그램으로 "📝 메모 추가 요청: tuya_devices.md 에 OO 디바이스 ID OOO, 씬 OOO 추가해주세요" → 본진 처리
- 단, 본진이 응답 X 인 시간대 (밤) 에는 fallback 으로 직접 쓸 수 있지만 **반드시 push 전 `git pull --rebase` 필수**

### 2. 메모 쓰기 전 git pull 의무화 (보조 룰)

memory/* 또는 issues/* 등 SoT 파일을 수정하기 직전 무조건:

```bash
cd ~/claude-skills && git pull --rebase --autostash
# 그 다음 edit → git add → git commit → git push 까지 한 turn 내 완료
```

손에 들고 있는 시간 (uncommitted) 최소화. "조회 후 30초 안에 push 못 하면 commit 자체를 미루기."

### 3. 충돌 발생 시 본진 우선 (방어 룰)

claude-skills/memory/* 충돌 시:

- 본진 (origin/main) 의 버전이 보통 superset → `git checkout HEAD -- <file>` + `git stash drop` 으로 본진 채택
- 내 변경분이 본진에 없는 정보면 별도 PR/directive 로 본진에 요청

## 처리 결과

- 충돌 파일: `git checkout HEAD -- openclaw-handoff/memory/tuya_devices.md` + `git stash drop` 으로 본진 버전 채택. ✅
- skills-private 마이그레이션은 이어서 정상 완료. ✅
- 본 이슈 박음. ✅

## 영구 해결 (자동화 정비 후보)

- `~/.claude/hooks/pre-edit-claude-skills.sh` 만들기: claude-skills 안 memory/* 파일 Edit/Write 직전 자동으로 `git pull --rebase --autostash` 수행. 충돌 시 hook 가 block + 텔레그램으로 본진에 알림.
- 또는 SoT memory 파일에 `<!-- WRITE_VIA: mac-main -->` 같은 magic comment + chatbot 이 인지하면 Edit 거부.
