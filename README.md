# 한밭푸드 ACA 이관 실습 사이트

Azure Container Apps(ACA) 13시간 강의의 학생용 실습 가이드입니다.
대전 중소기업 한밭푸드의 모놀리식 → 클라우드 전환 여정을 직접 따라가는 핸즈온 실습.

## 구조

6단계 Phase로 구성된 전환 여정:

| Phase | 내용 | 소요 시간 |
|-------|------|-----------|
| Phase 0 | 환경 세팅 (VM SSH, Azure 로그인) | 30분 |
| Phase 1 | AS-IS 체험 (docker-compose) | 60분 |
| Phase 2 | 고통 체험 (배포 지옥, 스케일 불가, 점진 배포 불가) | 60분 |
| Phase 3 | 첫 이관 (Docker Hub → ACA) | 120분 |
| Phase 4 | 재경기 (무중단 배포, 자동 확장) | 90분 |
| Phase 5 | 의사결정 (ACA vs AKS vs ACI) | 30분 |

## 로컬 미리보기

```bash
pip install -r requirements.txt
mkdocs serve
```

브라우저에서 http://127.0.0.1:8000 접속

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

배포 전 확인:
1. Repository Settings → Pages → Source를 **GitHub Actions** 로 설정
2. `mkdocs.yml`의 `site_url`을 실제 GitHub Pages 주소로 변경

```yaml
# mkdocs.yml
site_url: https://<username>.github.io/hanbat-aca-labs/
```

## 이미지 추가 방법

스크린샷 등 이미지는 `docs/assets/images/` 하위 Phase별 디렉터리에 저장하세요.

```
docs/assets/images/
├── phase-3/
│   ├── rg-create.png
│   ├── env-create.png
│   ├── api-basic.png
│   └── web-success.png
└── phase-4/
    ├── multi-revision.png
    └── traffic-split.png
```

마크다운에서 참조:

```markdown
![설명](../assets/images/phase-3/env-create.png)
```

## 기여 가이드

1. `main` 브랜치에서 새 브랜치 생성
2. 수정 후 PR 생성
3. `mkdocs serve` 로 로컬 확인 후 머지

## 라이선스

Copyright © 2026 Skilleat · 교육 목적으로만 사용 가능
