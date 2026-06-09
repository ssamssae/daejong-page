---
category: 크롤링
tags: [selenium, undetected-chromedriver, python, captcha, 자동화, 버전호환]
---

# undetected-chromedriver — Python 3.10 전용, 3.11+ 크래시

- **출처:** AI 인사이더 클럽 (2026-04-16, FinPred 공유)
- **재사용 영역:** captcha 우회 크롤링이 필요한 모든 Python 자동화

## 한 줄 요약

undetected-chromedriver(uc)는 Google/Cloudflare captcha를 전부 통과하지만 **Python 3.11 이상에서 크래시**. pyenv로 3.10 환경 격리 필수.

## 패턴

### 1. Python 3.10 환경 세팅

```bash
pyenv install 3.10.14
pyenv local 3.10.14
pip install undetected-chromedriver
```

### 2. 기존 selenium 코드에서 2줄 변경

```python
# 기존
from selenium import webdriver
driver = webdriver.Chrome()

# uc로 교체 (captcha 통과)
import undetected_chromedriver as uc
driver = uc.Chrome()
```

### 3. Chrome 버전 불일치 자동 대응 (Windows)

```python
import winreg
key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
    r"Software\Google\Chrome\BLBeacon")
version = winreg.QueryValueEx(key, "version")[0]
major = int(version.split(".")[0])
driver = uc.Chrome(version_main=major)
```

### 4. Chrome 136+ 자동 로그인 우회

Chrome 136부터 Default 프로파일 디버그 접속 차단됨.

```python
# Default 프로파일 사용 금지 (v136+)
options = uc.ChromeOptions()
options.add_argument("--user-data-dir=/path/to/new_profile_name")
driver = uc.Chrome(options=options)
# 이 새 프로파일에서 수동 로그인 1회 → 이후 자동화에서 자동 로그인
```

## 주의

- Python 가상환경을 3.10으로 격리하지 않으면 크래시 재현 어려움 (버전에 따라 간헐적)
- 유지보수가 활발하지 않음 — 메이저 Chrome 업그레이드 시 드라이버 버전 확인 필요
- Playwright는 captcha 통과 불가 (일반 자동화에만 적합)
