# 회사 브랜드 소비 계약

회사 로고는 `kangdaejong-com` 정본의 https://kangdaejong.com/brand/current/ 에서 불러온다. 버전과 파일 hash는 https://kangdaejong.com/brand/manifest.json 에 있다.

작업장 Layout·Footer와 기존 정적 개인정보 안내의 회사 favicon/공유이미지도 이 고정 주소를 쓴다. 새 회사 이미지를 로컬 public에 복사하거나 버전을 소비 사이트에 박아 넣지 않는다. 회사 정본 자산이 바뀌면 작업장 재배포는 필요 없다. 서비스 자체 아이콘과 기사별 이미지는 이 정책의 대상이 아니다.

`npm run build` 후 `python3 tests/test_company_brand.py`로 빌드 전체의 옛 회사 자산 경로 재유입을 확인한다. 실제 변경 절차는 정본 저장소의 `docs/company-brand.md`를 따른다.
