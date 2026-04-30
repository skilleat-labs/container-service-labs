<span class="phase-badge">평가</span>
<span class="time-badge">90분</span>

# 평가 안내

## 평가 구조

| 구분 | 배점 | 과제 |
|------|------|------|
| 필수 A: Phase 3 이관 | 30점 | A-1~A-3 |
| 필수 B: Phase 4 재경기 | 30점 | B-1~B-3 |
| 필수 C: Phase 5 의사결정 | 10점 | C-1 |
| 도전 과제 | 30점 | — |
| **합계** | **100점** | 70점 이상 수료 |

---

## 평가 시간표 (90분)

| 시간 | 활동 |
|------|------|
| 0~10분 | 평가 안내 및 환경 초기화 |
| 10~50분 | 필수 과제 A + B (Phase 3, 4 재현) |
| 50~60분 | 필수 과제 C (Phase 5 매트릭스 작성) |
| 60~85분 | 도전 과제 |
| 85~90분 | 제출물 정리 및 업로드 |

!!! warning "평가 시 환경이 초기화됩니다"
    강사가 ACA 리소스를 삭제한 후 평가가 시작됩니다. Phase 3부터 다시 처음부터 진행해야 합니다. 실습 가이드를 참고하되, 직접 손으로 진행해야 합니다.

---

## 필수 과제 체크리스트

### 필수 A: Phase 3 이관 (30점)

- [ ] **A-1** (10점): `hanbat-api` + `hanbat-web` 배포 완료 캡처
  - Azure Portal에서 두 앱이 "실행 중" 상태인 화면
  - `hanbat-api`: Internal Ingress
  - `hanbat-web`: External Ingress
- [ ] **A-2** (10점): 브라우저 접속 성공 캡처
  - `https://hanbat-web.xxx.azurecontainerapps.io` 주문 목록 화면
- [ ] **A-3** (10점): CLI 확인 출력
  - `az containerapp list --resource-group hanbat-rg --output table` 결과 캡처

### 필수 B: Phase 4 재경기 (30점)

- [ ] **B-1** (15점): 무중단 배포 검증 로그
  - `phase4-no-downtime.log` 파일 (200 응답이 끊기지 않음)
- [ ] **B-2** (10점): 자동 확장 설정 및 동작 캡처
  - Azure Portal 스케일 설정 화면
  - Replica 수가 늘어난 모니터링 화면 (선택)
- [ ] **B-3** (5점): Traffic Split 설정 캡처
  - 두 Revision이 트래픽을 나눠받는 화면

### 필수 C: Phase 5 의사결정 (10점)

- [ ] **C-1** (10점): ACA vs AKS vs ACI 비교 매트릭스
  - 모든 항목이 채워진 표 (Word, Excel, PDF, 사진 모두 가능)
  - 한밭푸드 권장안 + 이유 2~3문장

---

## 도전 과제 체크리스트 (30점)

- [ ] **도전 1** (15점): GitHub Actions CI/CD 파이프라인 구성
  - 코드 push → 자동 이미지 빌드 → ACA 자동 배포
  - 워크플로우 YAML 파일 제출
- [ ] **도전 2** (15점): 커스텀 도메인 연결
  - ACA 앱에 보유한 도메인 또는 Azure 제공 서브도메인 연결
  - HTTPS 인증서 자동 발급 확인 캡처

---

<div class="nav-buttons">
<a href="../phase-5/decision-matrix/" class="nav-btn">← Phase 5</a>
<a href="submission-guide/" class="nav-btn next">제출 가이드 →</a>
</div>
