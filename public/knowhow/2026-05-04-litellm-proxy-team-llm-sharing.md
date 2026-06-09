---
category: 인프라
tags: [litellm, ollama, local-llm, proxy, openai-api, 팀공유, self-hosted]
---

# LiteLLM 프록시 — 로컬 LLM을 팀에 OpenAI API 형식으로 공유

- **출처:** AI 인사이더 클럽 (2026-04-16~17, 다수 언급)
- **재사용 영역:** 팀 내 로컬 LLM 서버 구축, 여러 기기에서 동일 모델 접근

## 한 줄 요약

LiteLLM 프록시 서버 1개로 Ollama 로컬 LLM을 다른 PC에서 OpenAI API 형식으로 사용 가능. 기존 OpenAI SDK 코드 수정 없이 로컬 모델로 전환.

## 패턴

### 1. 설치

```bash
pip install litellm[proxy]
```

### 2. 설정 파일

```yaml
# litellm_config.yaml
model_list:
  - model_name: local-llm
    litellm_params:
      model: ollama/llama3
      api_base: http://localhost:11434

  - model_name: local-qwen
    litellm_params:
      model: ollama/qwen2.5:7b
      api_base: http://localhost:11434
```

### 3. 프록시 서버 실행

```bash
litellm --config litellm_config.yaml --port 8000
```

### 4. 다른 PC에서 접근

```python
from openai import OpenAI
client = OpenAI(
    base_url="http://[서버IP]:8000",
    api_key="anything"  # 로컬이면 임의 값
)
response = client.chat.completions.create(
    model="local-llm",
    messages=[{"role": "user", "content": "안녕"}]
)
```

## 로컬 LLM 하드웨어 기준 (그룹 합의)

| 예산 | 하드웨어 | 실용 모델 |
|------|----------|-----------|
| ~100만원 | RTX 5060Ti 16GB | 7~12B |
| ~300만원 | RTX 3090 24GB | 30B 일부 |
| 최고 성능 | Mac Studio M5 (출시 대기) | 128~512GB 통합 메모리 |

## 주의

- 방화벽에서 8000 포트 허용 필요
- 인터넷 노출 시 API 키 인증 추가 권장 (`--api-key` 옵션)
- Ollama 먼저 실행 후 LiteLLM 시작
