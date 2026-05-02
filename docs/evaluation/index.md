<span class="phase-badge">평가</span>
<span class="time-badge">60분</span>

# 평가 풀이 가이드

!!! tip "핵심 원칙"
    본 평가는 강의에서 실습한 내용을 그대로 재현하는 구조입니다. 새로운 내용은 없습니다.
    **필수 과제(70점) 중 50점 이상이면 수료**입니다. 편하게 진행하세요.

## 평가 구조

| 구분 | 배점 | 합계 |
|------|------|------|
| Part A. 컨테이너 배포 (필수) | A-1·A-2·A-3 각 10점 | 30점 |
| Part B. 자동 확장 (필수) | B-1·B-2·B-3 각 10점 | 30점 |
| Part C. 서비스 비교 (필수) | C-1 | 10점 |
| 도전 과제 | A-4·A-5·A-6·B-4·C-2·C-3 | 30점 |
| **합계** | | **100점** |

!!! info "수료 기준"
    필수 과제만 집중하면 45~50분이면 충분합니다.

---

## Part A. 컨테이너 배포 (필수 30점)

### A-1. ACA Environment 생성 (10점)

**무엇을 해야 하나**

Azure Portal에서 ACA Environment를 생성합니다.

| 항목 | 값 |
|------|-----|
| 리소스 이름 | `env-studentXX` (XX = 본인 번호) |
| 지역 | Korea Central |

**풀이 순서**

1. Azure Portal → **Container Apps Environments** → **+ 만들기**
2. 이름: `env-studentXX`, 지역: `Korea Central`
3. 생성 완료 후 상태가 **Succeeded**인 화면 전체 캡처

**제출**: `A-01_environment.png` (Environment 생성 화면, 상태 Succeeded 표시)

---

### A-2. Container App 배포 + FQDN 접속 (10점)

**무엇을 해야 하나**

Container App을 배포하고 브라우저로 접속해 v1.0.1 화면을 확인합니다.

| 항목 | 값 |
|------|-----|
| 앱 이름 | `myapp-studentXX` |
| 이미지 | `skilleat/pod-info-app:v1.0.1` |
| Ingress | External |
| Target port | `8080` |

**풀이 순서**

1. Azure Portal → **Container Apps** → **+ 만들기**
2. Environment: `env-studentXX` 선택
3. 이미지: `skilleat/pod-info-app:v1.0.1`
4. Ingress: **External**, Target port: `8080`
5. 배포 완료 후 **Application URL(FQDN)** 복사
6. 브라우저에서 FQDN 접속 → `v1.0.1` 화면 확인

**제출**: `A-02_ingress_access.png` (**주소창 + 화면 내용이 모두 보이도록** 전체 화면 캡처)

---

### A-3. Revision 2개 생성 (10점)

**무엇을 해야 하나**

Revision 모드를 Multiple로 전환하고 v2.0.0 이미지로 새 Revision을 생성합니다.

**풀이 순서**

1. `myapp-studentXX` → 왼쪽 메뉴 **애플리케이션 > 수정버전 및 복제본** 클릭
2. 상단 **배포 모드** 클릭 → **Multiple** 선택 후 저장
3. **+ 새 수정 버전 만들기** 클릭
4. Revision suffix: `v2`
5. 이미지 태그를 `v2.0.0`으로 변경
6. **만들기** → Revision 목록에 2개가 **Active** 상태인 것 확인

**제출**: `A-03_revision_list.png` (Revision 2개가 보이는 목록 화면)

!!! note "이해 확인 문항 (3점 포함)"
    **Q. Revision 모드를 Single이 아닌 Multiple로 설정하지 않으면 어떤 문제가 발생하나요?**

    A. Single 모드에서는 새 Revision이 배포되면 기존 Revision이 즉시 비활성화되어 Traffic Split이 불가능하고, 배포 중 순간적인 다운타임이 발생할 수 있습니다.

---

## Part B. 자동 확장 (필수 30점)

### B-1. Scale Rule 설정 (10점)

**무엇을 해야 하나**

HTTP 동시 요청 수 기반 Scale Rule을 설정합니다.

| 항목 | 값 |
|------|-----|
| min Replicas | `1` |
| max Replicas | `10` |
| 트리거 | HTTP Concurrent Requests = `5` |

**풀이 순서**

1. `myapp-studentXX` → 왼쪽 메뉴 **스케일** 탭
2. **+ 규칙 추가** 클릭
3. 형식: **HTTP 크기 조정**, 동시 요청 수: `5`
4. Replica 범위: 최솟값 `1`, 최댓값 `10` → **저장**

**제출**: `B-01_scale_rule.png` (Scale 탭 설정 화면)

!!! note "이해 확인 문항 (3점 포함)"
    **Q. HTTP Concurrent Requests를 5로 설정했을 때, 어떤 상황에서 Replica가 증가하나요?**

    A. 현재 Replica 1개가 처리 중인 동시 요청 수가 5를 초과하면 KEDA가 추가 Replica를 자동으로 생성합니다.

---

### B-2. 부하 발생 (10점)

**무엇을 해야 하나**

동시 요청을 최소 60초간 지속 발생시킵니다. A-2에서 확인한 FQDN을 사용합니다.

=== "Mac / Linux"

    ```bash
    while true; do curl -s "https://<FQDN>/api/orders/1" > /dev/null; done &
    ```

=== "Windows (PowerShell)"

    ```powershell
    while($true){Invoke-WebRequest "https://<FQDN>/api/orders/1" -UseBasicParsing | Out-Null}
    ```

!!! warning "FQDN 교체 필수"
    `<FQDN>`을 A-2에서 확인한 본인 앱 주소로 교체하세요. 부하 종료 시 `Ctrl+C`를 누릅니다.

**제출**: `B-02_load_test.txt` (부하 스크립트 실행 로그 또는 캡처)

---

### B-3. Replica 증설 관찰 (10점)

**무엇을 해야 하나**

부하 발생 중 Replica가 1 → 3 이상으로 늘어난 것을 3개 이상 시점으로 기록합니다.

**풀이 순서**

부하 발생 후 1~2분 대기한 뒤 아래 방법으로 확인합니다.

=== "Azure Portal"

    `myapp-studentXX` → 왼쪽 메뉴 **애플리케이션 > 수정버전 및 복제본** → revision 클릭 → **복제본** 탭

=== "CLI"

    ```bash
    az containerapp replica list \
      --name myapp-studentXX \
      --resource-group <리소스그룹명> \
      --output table
    ```

**관찰 표 양식** (보고서에 포함)

| 시각 | Replica 수 | 비고 |
|------|-----------|------|
| 부하 전 | 1 | 초기 상태 |
| 부하 1분 후 | | |
| 부하 2분 후 | | |

!!! info "스케일 아웃 반응 시간"
    ACA의 자동 확장은 수십 초~2분 내에 반응합니다. 60초 부하로도 충분히 관찰 가능합니다.

!!! note "이해 확인 문항 (3점 포함)"
    **Q. min-replicas를 0이 아닌 1로 설정해야 하는 이유를 한 문장으로 쓰시오.**

    A. min-replicas를 0으로 설정하면 트래픽이 없을 때 모든 Replica가 종료(Scale to Zero)되어 첫 요청 시 Cold Start 지연이 발생하므로, 응답 지연 없이 즉시 처리하려면 최소 1개를 항상 유지해야 합니다.

**제출**: 보고서 관찰 표 또는 `B-03_metrics.png` (Azure Monitor 그래프)

---

## Part C. 서비스 비교 (필수 10점)

### C-1. ACA · AKS · ACI 3자 비교표 (10점)

**무엇을 해야 하나**

아래 항목을 포함한 비교표를 작성합니다. 최소 4개 항목 필수입니다.

| 항목 | ACA | AKS | ACI |
|------|-----|-----|-----|
| 과금 모델 | vCPU·메모리 사용 시간 (Scale to Zero 가능) | 노드(VM) 단위 상시 과금 | 컨테이너 실행 시간 초 단위 |
| 자동 확장 | KEDA 기반, Scale to Zero 지원 | HPA/KEDA, Scale to Zero 별도 설정 | 없음 (수동) |
| 무중단 배포 | Revision 기반 Traffic Split 기본 지원 | Rolling Update / Canary 직접 구성 | 미지원 |
| 필요 운영 인력 | 최소 (PaaS, K8s 지식 불필요) | 높음 (K8s 전문가 필요) | 최소 (단순 실행 용도) |
| 네트워크 제어 | 제한적 | VNet 완전 제어 | 제한적 |
| 적합한 워크로드 | 이벤트 기반 마이크로서비스 | 대규모·복잡한 워크로드 | 단발성 배치·CI 작업 |

**제출**: 작성한 비교표 (Word, Excel, PDF, 사진 모두 가능)

---

## 도전 과제 (30점)

시간이 남는 경우에만 수행하세요.

| 과제 | 배점 | 내용 |
|------|------|------|
| A-4. Zone Redundancy | 5점 | Environment 생성 시 Zone Redundancy = Enabled (생성 후 변경 불가) |
| A-5. Traffic Split 80:20 | 5점 | v1 80% / v2 20% 트래픽 분배 설정 |
| A-6. 무중단 배포 검증 | 5점 | 배포 중 HTTP 5xx 에러 0건 증명 (`A-04_zero_downtime.txt`) |
| B-4. Replica 축소 관찰 | 5점 | 부하 중단 후 Replica가 min으로 줄어드는 것 관찰 (5~10분 소요) |
| C-2. 0 트래픽 비용 분석 | 5점 | ACA·AKS·ACI 각각 0 트래픽 시 비용 차이 2줄 이상 기술 |
| C-3. 최종 권장안 | 5점 | 운영자 3명·간헐적 트래픽·K8s 전문 인력 없음 조건에서 권장 서비스 선택 + 근거 |

!!! warning "A-4 주의"
    Zone Redundancy는 Environment **생성 시**에만 설정 가능합니다. 나중에 변경할 수 없습니다.

---

<div class="nav-buttons">
<a href="../phase-5/decision-matrix/" class="nav-btn">← Phase 5</a>
<a href="submission-guide/" class="nav-btn next">제출 가이드 →</a>
</div>
