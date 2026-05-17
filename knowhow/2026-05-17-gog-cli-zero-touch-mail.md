# 자동 메일 발사는 Gmail MCP create_draft 가 아니라 gog CLI send 가 zero-touch

자동화 사이클 안에서 메일 한 통 발사가 목적이라면 Gmail MCP create_draft 는 부적합. 초안만 생기고 사람이 Gmail UI 들어가 send 버튼 눌러야 해서 zero-touch 가 끊긴다. gog CLI 의 `gog send` 한 줄이 OAuth 기반으로 즉시 발송해서 사이클 자동화 fit.

## 핵심

zero-touch (사람 손 0) vs 안전 (사람 검토 후 발송) 기준으로 도구 결정. 자동화 사이클 default 는 zero-touch — gog CLI.

## 비교

| 항목                 | Gmail MCP create_draft               | gog CLI send                                                   |
| -------------------- | ------------------------------------ | -------------------------------------------------------------- |
| 발사                 | 초안만 (수동 send 별도)              | 즉시 발송                                                      |
| 호출                 | MCP 도구 (Claude conversation 안)    | `gog send --to ... --subject ... --body ...` 한 줄             |
| SMTP credential      | 불필요 (OAuth)                       | 불필요 (OAuth)                                                 |
| 자동화 사이클 fit    | ❌ — 사람 손 1번 필요                | ✅ — zero-touch                                                |
| 안전 (실수 발송 방지)| ✅ — 검토 후 발송                    | ❌ — 즉시 발송 → typo 발견 후 retract 불가                     |

## 적합 케이스

- **gog send**: 정형화된 자동 메일 (예: "사이클 마감 보고 메일", "릴리즈 노트 자동 발송", "stale 페이지 알림")
- **Gmail MCP create_draft**: 1회성 메일, 톤·문구 검토 필요한 메일, 외부 stakeholder 에게 보내는 메일

## 함정

도구가 이미 설치돼 있는데 1차 PATH 에서 못 찾고 "환경 한계" 핑계로 떠넘기는 패턴이 흔하다. **도구·메모리·환경 5단계 search 끝까지** 한 다음에 결정.

## 다시 꺼내쓰는 법

- 자동 메일 발사 코드 작성할 때 default 는 `gog send` 한 줄
- "발송 전 본인 확인 필수" 케이스만 create_draft 로 fallback
- gog 못 찾으면 PATH 확인 (`~/.bun/bin` / `~/bin` / homebrew) — 핑계 전에 search
