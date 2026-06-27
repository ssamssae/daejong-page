# araseo-voice home 타겟 self-target 디스패치 버그 (2026-06-07)

## 증상
Siri 음성비서(araseo-voice)로 home(본진) 타겟 음성명령("다음 할일 뭐야", "에어컨 꺼줘")을 말하면 전부 실행 안 됨. 폰에 `dispatch home rc=4 ❌ self-target 가드: 이미 🍎 본진에서 호출됨(<mac-host>), 본진→본진 SSH publickey 거부` 상태 메시지만 떴다.

## 근본원인
`~/apps/araseo-voice/scripts/araseo-siri-route.py` 의 `dispatch()` 가 home 타겟에서 `DISPATCH["home"] = mac-directive.sh` 를 `bash mac-directive.sh '[VOICE] <명령>'` 로 호출. 그런데 `mac-directive.sh` 는 **노드→본진 SSH 명령주입**용이라 본진 자신에서 실행되면 self-target 가드(hostname 감지)가 `rc=4` abort. 2026-06-07 라우팅 backend 로 'directive 인프라(가)'를 고르며 DISPATCH["home"] 에 mac-directive.sh 가 박힌 게 직접 원인. (참고: 같은 repo daemon.py/sender.py 는 Telethon 경로지만 Siri 라우터는 안 씀.)

## 진단 중 빠진 stale 함정 2개 (본진 자기교정)
1. **tuya 클라우드 만료 오진** — 음성 "에어컨 꺼줘"가 안 되자 `tuya-control.py 에어컨꺼` 직접 호출 → "subscription expired" 클라우드 에러를 보고 "Tuya 클라우드 죽음"으로 오진. 실제론 (a) 로컬 LAN 경로가 정상이었고 (b) 로컬 맵엔 토글형 `에어컨`만 있어 클라우드용 키 `에어컨꺼`가 미스→만료 클라우드 폴백한 것. 아니키 "투야 로컬로 돌린지가 언젠데 기억이 스테일이구만" 지적으로 교정.
2. **Telethon "검증 경로" stale 전제** — mesh/trio-vote가 (a) Telethon을 "daemon.py가 이미 쓰는 검증된 경로"라 가정하고 골랐으나, 구현 전 실측에서 Telethon 완전 미설정(.env 없음=API키 미발급, 유저봇 .session 부재, daemon 한번도 성공실행 안됨) 발견. **코드 존재 ≠ 런타임 동작.** 구현 착수 전 실측이 stale 전제 위 코드 쌓기를 차단.

## 해결
home 분기 `dispatch_home_local()` 추가 — mac-directive.sh가 SSH 후 하는 `tmux load-buffer/paste-buffer + send-keys -t claude` 를 **SSH 없이 로컬에서 직접** 실행해 본진 claude 세션에 음성명령 주입. `ARASEO_HOME_TMUX` env로 세션명 override. home은 DISPATCH dict에서 제거.

핵심 통찰: **home(자기 자신) 타겟은 텔레그램 왕복·SSH 자체가 불필요.** (a) Telethon이 푸는 문제("봇은 자기 발신 메시지를 inbound로 못 받음")가 home엔 애초에 없음 — home은 로컬이라 텔레그램을 거칠 이유가 없음. mesh-vote 4-0.

## 의사결정 경로
mesh-vote((a) Telethon) → trio-vote((a) 3-0, stale 전제) → 실측으로 전제 붕괴 → codex-mesh-vote 시도(codex 월한도 0% 소진으로 0/5 실패) → claude mesh-vote((b) 4-0) → 구현.

## 검증
격리 tmux 세션 주입 rc=0 + 텍스트 랜딩 + 실제 Siri 음성("안녕하세요" 응답 / "선풍기 켜줘" 실행) end-to-end 통과. 커밋 ssamssae/araseo-voice main.

## 후속 (별건)
tuya 로컬 맵의 에어컨/선풍기가 IR 토글(ch1/ch2 → SmartLife 단일 전원토글 IR)이라 음성 "켜줘/꺼줘" 분리 매칭 불가(토글만). 켜/꺼 분리하려면 SmartLife에 별도 ON/OFF IR 씬 등록 필요(에어컨은 보통 분리 IR 코드 있음, 선풍기는 토글만일 수 있음) — 아니키 Tuya 앱 작업 포함. 메모리 [[../../projects/-Users-user/memory/reference_araseo_voice_home_local_inject]].
