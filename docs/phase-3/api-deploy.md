<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 40분</span>

# API 앱 배포 (Internal Ingress)

API 앱은 **Internal Ingress**로 배포합니다 — ACA 환경 내부에서만 접근 가능, 인터넷에 노출 안 됨.

---

!!! info "ACR 관리 사용자 유지"
    ACA Portal에서 이미지를 선택할 때 ACR 관리 사용자가 필요합니다. **비활성화하지 말고 그대로 두세요.**
    실제 운영에서는 앱 생성 후 Managed Identity로 전환해 비밀번호 없이 안전하게 관리합니다.

---

## 왜 Internal인가?

!!! warning "API를 External로 배포하면 안 되는 이유"
    AS-IS에서 `http://VM_IP:8080` 으로 누구나 API에 직접 접근 가능했던 것이 보안 문제였습니다.
    ACA에서 Internal로 설정하면 Web 앱을 통해서만 API에 접근할 수 있습니다.

---

## Step 1. API 앱 배포

1. Azure Portal → **Container Apps 환경** → **hanbat-env** → 왼쪽 메뉴 **Apps** → **+ 만들기**

2. **기본 사항 (Basics)** 탭:

   | 항목 | 값 |
   |------|-----|
   | 컨테이너 앱 이름 | `hanbat-api` |
   | 지역 | Korea Central |
   | Container Apps 환경 | `hanbat-env` (자동 선택됨) |

3. **컨테이너 (Container)** 탭:

   | 항목 | 값 |
   |------|-----|
   | 이미지 소스 | Azure Container Registry |
   | 이미지 및 태그 | `<ACR_SERVER>/hanbat-order-api:v1.0.0` |
   | CPU 및 메모리 | 0.25 CPU, 0.5Gi |

   환경 변수:

   | 이름 | 값 |
   |------|-----|
   | `APP_VERSION` | `1.0.0` |

4. **수신 (Ingress)** 탭:

   | 항목 | 값 |
   |------|-----|
   | 수신 | **사용** |
   | 수신 트래픽 | **컨테이너 앱 환경으로 제한** ← Internal |
   | 대상 포트 | `8080` |

5. **검토 + 만들기 (Review + create)** → **만들기 (Create)**

!!! danger "앱 이름은 반드시 `hanbat-api`"
    Web 컨테이너의 nginx가 `http://hanbat-api` 로 내부 통신합니다.
    앱 이름이 다르면 API 연결이 실패합니다.

!!! danger "대상 포트는 반드시 8080"
    API 컨테이너 내부 포트는 **8080**입니다. 다른 포트를 입력하면 Health Check 실패로 앱이 계속 재시작됩니다.

---

## Step 2. 최소 복제본 수 설정

생성 완료 후 바로 진행합니다.

1. **hanbat-api** 클릭 → 왼쪽 메뉴 **Scale (규모 조정)**
2. **Min replicas** `0` → `1` 로 변경
3. **저장 (Save)**

!!! warning "반드시 최소 복제본 수를 1로 설정하세요"
    기본값은 0입니다. 0으로 두면 트래픽이 없을 때 컨테이너가 내려가고, Web에서 API를 호출할 때 cold start 중 nginx가 타임아웃(504)을 반환합니다.

---

## Step 3. 배포 확인

1. **hanbat-api** → **Overview**
2. **Status**: `Running` 확인
3. **FQDN**에 `.internal.` 이 포함되어 있으면 Internal Ingress가 올바르게 설정된 것입니다

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
Status가 <code>Running</code>이고 FQDN에 <code>.internal.</code> 이 포함되어 있으면 완료입니다.
</div>

---

## 자주 만나는 문제

<details>
<summary>앱이 계속 재시작됩니다 (Restart Loop)</summary>

대상 포트가 `8080`인지 확인하세요. 로그 확인:

```bash title="터미널"
az containerapp logs show \
  --name hanbat-api \
  --resource-group $RESOURCE_GROUP \
  --tail 30
```

</details>

<details>
<summary>이미지 Pull 실패</summary>

ACR 로그인 상태인지 확인하세요.

```bash title="터미널"
az acr login --name $ACR_NAME
```

ACR에 이미지가 있는지 확인하세요.

```bash title="터미널"
az acr repository show-tags \
  --name $ACR_NAME \
  --repository hanbat-order-api \
  --output table
```

</details>

---

<div class="nav-buttons">
<a href="../environment-create/" class="nav-btn">← ACA 환경 생성</a>
<a href="../web-deploy/" class="nav-btn next">Web 앱 배포 →</a>
</div>
