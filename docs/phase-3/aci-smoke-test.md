<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 20분</span>

# ACI Smoke Test

ACR에 이미지를 올렸으니, ACA에 본격 배포하기 전에 **이미지가 정상적으로 동작하는지** 먼저 확인합니다.

이때 사용하는 것이 **Azure Container Instances(ACI)** 입니다.
컨테이너 하나를 수십 초 안에 띄우고, 확인 후 바로 삭제할 수 있어 이미지 검증(smoke test)에 적합합니다.

---

## Managed Identity란?

ACI가 ACR에서 이미지를 pull하려면 "내가 누구인지" 증명해야 합니다.

**일반 방식 (Admin 계정)**
```
ACI → ACR
"누구세요?" → username: admin / password: xxxx
→ 비밀번호를 어딘가에 저장해야 함 → 유출 위험
```

**Managed Identity 방식**
```
ACI → ACR
"누구세요?" → "저 Azure의 이 리소스예요" (Azure가 자동 증명)
→ 비밀번호 없음 · 만료 없음 · 유출 위험 없음
```

Managed Identity는 Azure 리소스에게 **사원증**을 발급하는 것과 같습니다.
비밀번호를 외우는 대신 사원증을 태그하면 출입이 허용되는 것처럼,
ACI가 "나는 ACR에서 이미지를 pull할 수 있는 리소스야"라고 자동으로 증명합니다.

!!! info "ACA도 같은 방식을 사용합니다"
    이후 ACA 배포에서도 ACR 이미지를 Managed Identity로 pull합니다.
    지금 여기서 개념을 익혀두면 ACA 배포 단계가 훨씬 자연스럽게 이해됩니다.

---

## Step 1. User-assigned Managed Identity 생성

### 왜 User-assigned인가?

Managed Identity는 두 종류입니다.

| 종류 | 설명 | 특징 |
|------|------|------|
| System-assigned | 특정 리소스에 자동 생성 | 리소스 삭제 시 함께 삭제 |
| User-assigned | 별도로 만들어두고 여러 리소스에 재사용 | 독립적으로 관리 가능 |

ACI smoke test는 잠시 썼다가 삭제할 리소스입니다.
**User-assigned**로 만들어두면 ACI를 삭제해도 identity는 남아있어 ACA에서도 재사용할 수 있습니다.

### 생성 방법

1. [portal.azure.com](https://portal.azure.com) 검색창에 **관리 ID** 검색 → **+ 만들기**
2. 아래와 같이 입력합니다

    | 항목 | 값 |
    |------|-----|
    | 구독 | 강사가 안내한 구독 |
    | 리소스 그룹 | `hanbat-rg` |
    | 지역 | Korea Central |
    | 이름 | `hanbat-identity` |

3. **검토 + 만들기** → **만들기**

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
리소스 그룹 <code>hanbat-rg</code>에 <code>hanbat-identity</code>가 생성되었나요?
</div>

---

## Step 2. ACR에 AcrPull 역할 부여

Managed Identity가 생성됐다고 바로 ACR에서 이미지를 pull할 수 있는 건 아닙니다.
**"이 Identity는 ACR에서 이미지를 pull할 수 있다"** 는 권한을 명시적으로 부여해야 합니다.

1. Azure Portal → **컨테이너 레지스트리** → `hanbatacr...` 선택
2. 왼쪽 메뉴 → **액세스 제어(IAM)**
3. **+ 역할 할당 추가** 클릭
4. **역할** 탭 → 검색창에 `AcrPull` 입력 → **AcrPull** 선택 → **다음**
5. **멤버** 탭

    | 항목 | 값 |
    |------|-----|
    | 액세스 할당 대상 | **관리 ID** |
    | 멤버 | **+ 멤버 선택** → `hanbat-identity` 검색 후 선택 |

6. **검토 + 할당** → **할당**

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
ACR → 액세스 제어(IAM) → <strong>역할 할당</strong> 탭에서
<code>hanbat-identity</code>가 <code>AcrPull</code> 역할로 보이면 완료입니다.
</div>

---

## Step 3. ACI 생성 (Portal)

이제 ACI를 만들면서 Managed Identity를 연결합니다.

### 기본 사항

1. Azure Portal 검색창에 **컨테이너 인스턴스** 검색 → **+ 만들기**
2. **기본 사항** 탭에서 아래와 같이 입력합니다

    | 항목 | 값 |
    |------|-----|
    | 리소스 그룹 | `hanbat-rg` |
    | 컨테이너 이름 | `hanbat-api-smoke` |
    | 지역 | Korea Central |
    | 이미지 소스 | **Azure Container Registry** |
    | 레지스트리 | `hanbatacr...` (본인 ACR 선택) |
    | 이미지 | `hanbat-order-api` |
    | 이미지 태그 | `v1.0.0` |
    | OS 유형 | Linux |
    | 크기 | 1 vCPU, 1.5 GiB (기본값) |

### 네트워킹

3. **네트워킹** 탭으로 이동합니다

    | 항목 | 값 |
    |------|-----|
    | 네트워킹 유형 | 공용 |
    | DNS 이름 레이블 | `hanbat-smoke-<임의 숫자>` (전역 유일) |
    | 포트 | `8080` / TCP |

### ID (Managed Identity 연결)

4. **고급** 탭으로 이동 → **ID** 섹션을 찾습니다
5. **사용자 할당** → **+ 추가** → `hanbat-identity` 선택 → **추가**

!!! warning "이미지 pull 인증 오류가 나면"
    기본 사항 탭에서 이미지를 선택할 때 자격 증명 오류가 나는 경우,
    ACR의 **액세스 키** 메뉴에서 **관리자 사용자**를 일시적으로 활성화한 뒤
    다시 시도해보세요. ACI 생성 완료 후 다시 비활성화합니다.

### 검토 + 만들기

6. **검토 + 만들기** → **만들기**

프로비저닝 완료까지 **약 1분** 소요됩니다.

---

## Step 4. 동작 확인

### FQDN 확인

ACI 개요 페이지에서 **FQDN** 값을 확인합니다.

```
hanbat-smoke-<숫자>.koreacentral.azurecontainer.io
```

### 브라우저에서 확인

브라우저 주소창에 아래 URL을 입력합니다.

```
http://<FQDN>:8080/version
```

아래와 같은 응답이 오면 이미지가 정상적으로 동작하는 겁니다.

```json title="응답"
{
  "version": "1.0.0",
  "service": "hanbat-order-api"
}
```

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
브라우저에서 <code>/version</code>이 JSON을 응답하나요?<br>
응답이 보이면 ACR 이미지가 정상임이 확인된 겁니다.
</div>

---

## Step 5. ACI 삭제

Smoke test 목적이 달성됐으니 즉시 삭제합니다.
ACI는 실행 중인 시간만큼 과금되므로 확인 즉시 삭제하는 것이 좋습니다.

1. Azure Portal → **컨테이너 인스턴스** → `hanbat-api-smoke` 선택
2. 상단 **삭제** 클릭 → 확인

!!! tip "ACI의 핵심 특성이 바로 이겁니다"
    띄우고 → 확인하고 → 삭제. 전체 과정이 수분 안에 끝납니다.
    실행한 시간만큼만 초 단위로 과금되므로 이 실습에서 발생한 비용은 거의 0에 가깝습니다.
    반면 ACA는 상시 운영 서비스에 적합합니다 — 이 차이가 **ACI vs ACA 선택 기준**입니다.

---

## 다음 단계

<div class="nav-buttons">
<a href="../acr-push/" class="nav-btn">← ACR 이미지 푸시</a>
<a href="../environment-create/" class="nav-btn next">ACA 환경 생성 →</a>
</div>
