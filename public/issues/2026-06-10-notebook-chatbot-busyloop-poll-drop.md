---
prevention_deferred: null
---

# 노트북 텔레그램 챗봇 busy-loop spin 으로 폴링 끊김 — 본진 SSH restart 로 복구

- **발생 일자:** 2026-06-10 ~10:22 KST (spin 시작 추정) / 증상 노출 10:38~10:45
- **해결 일자:** 2026-06-10 10:46 KST
- **심각도:** medium
- **재발 가능성:** medium-high
- **영향 범위:** 💻 노트북(노트북 노드) 텔레그램 챗봇 — 5노드 동형 구조라 다른 노드도 잠재 위험

## 증상
아니키가 텔레그램으로 보낸 메시지(10:38 "아", 10:45 "ㅎㅇ")에 챗봇이 무응답. 본진이 10:46 SSH 로 들어와 chatbot 서비스를 restart 한 뒤에야 응답 재개.

## 원인
끊겨있던 chatbot 인스턴스는 ~10:22 에 떠서 10:46 restart 까지 약 23분간 CPU 를 23분 28초 소비 = wall-time 내내 CPU 100% spin(busy-loop). 메모리는 5.7M flat → 메모리 누수/OOM 이 아니라 "연결을 못 잡고 재시도만 도는 tight loop". 이 상태면 telegram long-poll 이 응답을 못 해 메시지가 안 들어온다. 메모리 `project_wsl_chatbot_autostart` 의 "헤드리스 텔레그램 폴링 미해결(plugin shutdown 루프)" 패턴과 동일.

- **trigger (추정):** 세션 bash_history 에 `sc.exe stop sshd; sc.exe config sshd start= disabled`(mirrored 네트워킹 전환 시 Windows sshd 끄는 작업) 흔적. 이 네트워킹 전환이 WSL 네트워크/DNS 를 흔들면 polling 이 끊긴 연결에서 재접속 busy-loop 에 빠질 수 있음. tailscale 도 `/etc/resolv.conf overwritten` DNS 경고 상태. 단 plugin stdout 이 tmux 안이라 systemd journal 에 안 남아 직접 인과는 미확정. node_networking_modes 의 "데스크탑이 mirrored 전환 중 frozen" 사고와 동형.
- **구조적 약점 (진짜 근본):** chatbot 이 tmux 안 claude 로 돌아서 systemd 가 폴링 health 를 못 본다. 그래서 spin/끊김이 나도 노드 스스로 자동 복구가 안 되고 본진의 외부 SSH 개입이 필요했다.

## 조치
- 본진(본진, (비공개))이 10:45:45~10:46:51 SSH 3연속 접속 → 10:46:10 `systemctl --user restart claude-chatbot.service` 로 spin 끊고 복구.
- 원인 분석: systemd `Consumed 23min CPU / 5.7M memory` 로그 + journalctl sshd Accepted + `tailscale status` IP→노드 매핑으로 "본진이 살림" 확정.

## 예방 (Forcing function 우선)
노드 로컬 자동 감지·복구 watchdog 2축 신설. 본진 외부 개입 없이 노드 스스로 폴링 끊김을 복구하고, 재발 시 근본원인을 캡처한다.

- **막을 코드/훅:** `~/.claude/watchdog/chatbot-spin-watchdog.sh` (cron `*/2 * * * *`, `# chatbot-spin-watchdog`)
  - ① **자동 감지·복구:** telegram API 대역(149.154/91.108) :443 ESTAB 연결 개수 = 폴링 liveness. 정상이면 long-poll 연결 ESTAB, spin/crash/네트워크끊김이면 0 으로 수렴. 3회 연속(약 6분) 무연결이면 `systemctl --user restart claude-chatbot.service` 자동 실행 + 폰 알림 1통 + 로그. restart 후 15분 쿨다운(무한루프 가드).
  - ② **진단 로깅:** watchdog 가 매 tick 마다 `tmux pipe-pane` 으로 chatbot 세션 출력을 `/tmp/chatbot-session.log` 에 저장(없으면 설정). 다음 재발 땐 "왜 spin 했나"를 캡처 가능. 50MB 크기 가드.
  - **검증됨:** 정상상태 false-restart 없음 / 무연결 시 fails 1→2 누적·FAIL_NEED=3 전 restart 안 함 / 연결 복구 시 fails=0 리셋 / cron 최소환경(env -i)에서 `systemctl --user` 복구경로 닿음 / pipe-pane 로깅 ON.
  - **미검증(한계):** 실제 강제 restart end-to-end 는 현재 미실행 — restart 가 watchdog 를 호스팅한 chatbot 세션 자체를 죽이기 때문(이 세션에서 작업 중). 복구 명령은 본진이 10:46 동일 명령으로 성공 입증 + cron 환경 도달 확인으로 갈음. 통제된 강제 트리거 테스트는 대화 종료 후 별도 수행 예정.
  - **5노드 표준화:** 노트북 로컬에서 검증 후, 본진 경유로 본진/맥미니/라이덴/데스크탑에도 동형 배포 제안 예정(인프라 정책이라 본진 머지 게이트).

## 재발 이력
<처음 생성 — 비워둠>

## 관련 링크
- 메모리: `project_wsl_chatbot_autostart` (헤드리스 폴링 plugin shutdown 루프), `reference_node_networking_modes` (mirrored 전환 frozen), `feedback_node_directive_false_success_check_render`
- watchdog: `~/.claude/watchdog/chatbot-spin-watchdog.sh`
- 텔레그램: 2026-06-10 오전 분석 스레드
