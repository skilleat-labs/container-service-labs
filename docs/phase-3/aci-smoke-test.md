<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 15분</span>

# ACI Smoke Test

ACR에 이미지를 올렸으니, ACA에 본격 배포하기 전에 **이미지가 정상적으로 동작하는지** 먼저 확인합니다.

이때 사용하는 것이 **Azure Container Instances(ACI)** 입니다.
컨테이너 하나를 수십 초 안에 띄우고, 확인 후 바로 삭제할 수 있어 이미지 검증(smoke test)에 적합합니다.

---

## Step 1. ACR 관리 사용자 활성화

ACI가 ACR에서 이미지를 pull하려면 인증이 필요합니다.
Smoke test 용도이므로 ACR의 **관리 사용자(Admin User)** 를 일시적으로 활성화합니다.

1. Azure Portal → **컨테이너 레지스트리** → `hanbatacr...` 선택
2. 왼쪽 메뉴 → **설정** → **액세스 키**
3. **관리 사용자** 토글을 **활성화**

![ACR 관리 사용자 활성화](../../assets/images/phase-3/acr-admin-enable.png)

!!! info "관리 사용자란?"
    ACR에 이미지를 push/pull할 수 있는 관리자 계정입니다.
    username과 password가 발급되어 누구든 자격증명만 알면 접근할 수 있어, **실무에서는 사용을 권장하지 않습니다.**
    ACA 배포 단계에서는 보안이 강화된 Managed Identity 방식으로 전환합니다.

---

## Step 2. ACI 생성 (Portal)

1. Azure Portal 검색창에 **컨테이너 인스턴스** 검색 → **+ 만들기**

2. **기본 사항** 탭에서 아래와 같이 입력합니다

    | 항목 | 값 |
    |------|-----|
    | 리소스 그룹 | `hanbat-rg` |
    | 컨테이너 이름 | `hanbat-api-smoke` |
    | 지역 | Korea Central |
    | 이미지 원본 | **Azure Container Registry** |
    | 레지스트리 | `hanbatacr...` (본인 ACR 선택) |
    | 이미지 | `hanbat-order-api` |
    | 이미지 태그 | `v1.0.0` |
    | OS 유형 | Linux |
    | 크기 | 1 vCPU, 1.5 GiB (기본값) |

3. **네트워킹** 탭으로 이동합니다

    | 항목 | 값 |
    |------|-----|
    | 네트워킹 유형 | 공용 |
    | DNS 이름 레이블 | `hanbat-smoke-<임의 숫자>` (전역 유일) |
    | 포트 | `8080` / TCP |

4. **검토 + 만들기** → **만들기**

프로비저닝 완료까지 **약 1분** 소요됩니다.

---

## Step 3. 동작 확인

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

## Step 4. ACI 삭제

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
