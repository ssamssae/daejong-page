---
category: 워크플로우
tags: [claude-code, parallel, mac, wsl, multi-device, skill, automation, productivity]
---

# Mac + WSL 병렬 사이클 스킬 — /parallel-cycle

- **출처:** 강대종 본인 설계 + 2026-05-04 운영 검증
- **재사용 영역:** Claude Code 멀티기기 병렬 작업, 할일 일괄 소화, 사이클 자동화

## 한 줄 요약

`/parallel-cycle` 스킬 1회 호출로 Mac N개 + WSL N개 작업을 동시에 나눠 실행하고, 양쪽 완료 후 session-close 까지 자동 진행. 한 세션이 두 기기를 지휘하는 "혁명적" 병렬 생산성 패턴.

## 패턴

### 1. 스킬 구조

```
/parallel-cycle [N개씩 | "작업1, 작업2, WSL: 작업3, 작업4"]
```

- args 없으면 todos 에서 자동 선택 (기본 Mac 3 + WSL 3)
- `"N개씩"` → todos 에서 N개 Mac + N개 WSL 자동 발굴
- 구체 작업명 나열 → Mac/WSL 배분 명시 or 순서대로 전/후반

### 2. 자동 실행 흐름

```
0단계: todos 자동 선택 (HOLD/물리액션/외부차단 제외)
1단계: 텔레그램 1통 브리핑 → 확인 대기 없이 즉시 진행
2단계: wsl-directive.sh -f /tmp/parallel-cycle-wsl-directive.md
3단계: Mac 작업 1→2→...→M 순차 실행 (WSL 과 동시)
4단계: mac-report.sh 신호로 WSL 완료 감지
5단계: session-close 자동 호출
```

### 3. WSL 디렉티브 자동 생성

Mac이 wsl-directive.sh 로 WSL에 작업 패키지 전송. WSL 봇은 수신 즉시 독립 실행 + 완료 후 mac-report.sh 로 역 보고.

### 4. 배분 기준

| 작업 종류 | 담당 |
|-----------|------|
| Playwright, ASC, GitHub GUI, iOS 관련 | 🍎 Mac |
| 코드 수정, 분석, 문서, 디자인 | 🪟 WSL |
| 균등 가능 | 부하 적은 쪽 |
| 🍎🪟🤝 prefix | prefix 우선 |

### 5. 주요 안전장치

- 같은 파일 중복 수정 방지: WSL 디렉티브에 "수정 예정 파일 목록" 명시
- HOLD / 강대종 직접 / 실기기 USB / 물리 액션 자동 제외
- store/* 수정 금지, 배포 명시 승인 필수
- Mac 작업 실패 시 에러 알림 후 중단 vs 계속 확인

## 효과

- 기존: 순차 진행 → Mac 작업 끝나야 WSL 시작
- 병렬 사이클: 동시 진행 → 전체 처리량 2배 (이론)
- session-close 자동 연결 → 후속안 분류 + 텔레그램 보고까지 원스톱

## 주의

- Mac 본진 전용 스킬 (WSL에서 직접 호출 X)
- WSL session-close: [PARALLEL-CYCLE-WSL-DONE] 태그가 mac-report.sh 신호에 포함돼야 4단계 감지됨
- WSL 30분 무응답 시 텔레그램 경고 자동 발송
- 작업 선언(시작 보고) + 결과 보고(종료 보고) 기계적으로 지켜야 충돌 0
