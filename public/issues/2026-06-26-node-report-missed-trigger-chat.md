---
prevention_deferred: null
---

# 노드 작업보고가 트리거/노드 봇챗에 누락 — "멈췄냐" 오인

- **발생 일자:** 2026-06-26 ~10:00 KST (deploy/T-260626-07 작업 중)
- **해결 일자:** 2026-06-26 16:00 KST
- **심각도:** medium
- **재발 가능성:** high
- **영향 범위:** 모든 노드(🪟🏭🖥💻)의 작업·디렉티브 완료 보고 → 아니키가 트리거하고 지켜보는 봇챗

## 증상
아니키가 WSL 봇챗에서 "진행해줘" 디렉티브를 던진 뒤, 노드가 ~30분 작업(PR 배포 + 후속 디렉티브)을 하는 동안 그 채팅방엔 보고가 0건이었다. 아니키는 긴 침묵만 보고 "뭐야 멈췄냐"고 물었다. 실제로는 작업 중이었고 보고는 본진 DM + Mesh 그룹으로만 갔다.

## 원인
`mac-report.sh`(노드→본진 보고 정본)의 미러 타깃이 **본진 + 오케스트레이터(≠본진일 때) + Mesh 그룹** 뿐이고, **노드 자기 봇챗**(아니키가 디렉티브를 트리거·관전하는 창)은 타깃이 아니었다. 본진이 오케면 오케 식별자가 본진과 같아 2026-06-07 도입된 "수신자 창 미러"도 안 타서 노드 챗이 완전 사각. 이날은 본진 claude tmux 세션이 down → tmux paste 실패 → 폴백이 본진 DM + 그룹으로만 가 노드 챗 누락이 표면화됐다.

## 조치
`mac-report.sh` 에 self-chat 미러 추가: 보고 발신 노드가 본진도 오케도 아니면 노드 자기 봇챗에도 노드보고 1통을 보낸다(dedup 키 = to|type|summary 라 기존 본진/오케 발송과 충돌 X, 실패해도 graceful). 이 사건 보고 자체도 트리거 챗(WSL)에 직접 전달.

## 예방 (Forcing function 우선)
mac-report 가 노드 보고를 **노드 자기 봇챗에도 항상 미러** → 본진/그룹 폴백 상황에서도 트리거 챗이 보고를 받는다. 사람 의지가 아닌 보고 경로 자체에 박았다.

- **막을 코드/훅:** https://github.com/ssamssae/claude-automations/pull/197 (`scripts/mac-report.sh` self-chat 미러)

## 재발 이력
<처음 생성 — 비움>

## 관련 링크
- PR: https://github.com/ssamssae/claude-automations/pull/197
- 관련 이슈: `2026-05-13-mac-report-reverse-reply-missed.md` (reverse 방향 보고 누락), `2026-04-20-terminal-only-reply-missed-telegram.md`
- 사건 발단 작업: PR #195(브릿지 바이너리 가드), #196(T-260626-07 nightly live-session 가드)
