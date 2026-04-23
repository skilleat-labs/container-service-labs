<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 20분</span>

# ACA 환경 생성

ACA에서 앱을 배포하려면 먼저 **환경(Environment)**을 만들어야 합니다.
환경은 여러 컨테이너 앱이 공유하는 네트워크·로깅 공간입니다.

---

## 리소스 구조 이해

```console title="리소스 구조"
Azure 구독
  리소스 그룹 (hanbat-rg)       <- 관련 리소스를 묶는 폴더
    ACA 환경 (hanbat-env)       <- 컨테이너 앱들의 공유 공간
      hanbat-api  (API 앱)
      hanbat-web  (Web 앱)
```

!!! info "리소스 그룹(Resource Group)이란?"
    Azure에서 관련 리소스를 하나의 그룹으로 묶어 관리하는 논리적 컨테이너입니다. 실습이 끝나면 이 리소스 그룹 하나만 삭제하면 안에 있는 모든 리소스가 한꺼번에 삭제됩니다.

---

## Step 1. 변수 설정

```bash title="터미널"
export RESOURCE_GROUP=hanbat-rg
export LOCATION=koreacentral
export ACA_ENV=hanbat-env
```

---

## Step 2. Azure Container Apps 확장 설치

Azure CLI(`az`)를 설치해도 **Container Apps 명령어는 기본으로 포함되어 있지 않습니다.**
이 단계에서 Container Apps 전용 명령어 묶음을 추가로 설치합니다.

설치하지 않으면 이후 `az containerapp ...` 명령어를 실행할 때 아래 오류가 납니다:

```console title="설치 전 오류"
az: 'containerapp' is not in the 'az' command group
```

아래 명령어로 설치합니다:

```bash title="터미널"
az extension add --name containerapp --upgrade
```

```console title="출력"
Extension 'containerapp' is already installed.
```

이미 설치되어 있으면 위와 같이 출력됩니다. 정상입니다.

## Step 3. 리소스 공급자 등록

Azure는 서비스별로 **리소스 공급자(Resource Provider)** 를 구독에 등록해야 해당 서비스를 사용할 수 있습니다.

쉽게 말해, Azure에는 수백 가지 서비스가 있는데 **처음 사용하는 서비스는 "이 구독에서 이 서비스를 쓰겠다"고 먼저 신청해야 합니다.** 등록하지 않으면 리소스를 만들려고 할 때 아래와 같은 오류가 납니다:

```console title="등록 전 오류"
The subscription is not registered to use namespace 'Microsoft.App'.
```

Container Apps를 사용하려면 두 가지를 등록해야 합니다:

| 공급자 | 역할 |
|--------|------|
| `Microsoft.App` | Azure Container Apps 서비스 자체 |
| `Microsoft.OperationalInsights` | ACA 환경이 내부적으로 사용하는 로그 수집 서비스 (Log Analytics) |

```bash title="터미널"
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

등록은 백그라운드에서 처리되므로 완료까지 1~2분 걸립니다. 아래 명령으로 완료됐는지 확인합니다:

```bash title="터미널"
az provider show --namespace Microsoft.App --query registrationState
```

```console title="출력"
"Registered"
```

!!! tip "이미 등록된 경우"
    구독에서 이전에 Container Apps를 한 번이라도 사용했다면 이미 `Registered` 상태일 수 있습니다. 그래도 명령어를 실행하면 알아서 넘어가므로 그냥 실행하면 됩니다.

---

## Step 4. ACA 환경 생성

CLI로 생성합니다. 2~5분 소요됩니다.

```bash title="터미널"
az containerapp env create \
  --name $ACA_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

```json title="응답"
{
  "name": "hanbat-env",
  "properties": {
    "provisioningState": "Succeeded"
  }
}
```

---

## Step 5. Portal에서 확인

Azure Portal에서 제대로 생성됐는지 눈으로 확인합니다.

1. [portal.azure.com](https://portal.azure.com) → 검색창에 **Container Apps 환경** 검색
2. 목록에 `hanbat-env` 가 보이면 성공입니다

![ACA 환경 생성 확인](../assets/images/phase-3/env-create.png)

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
Portal 목록에 <code>hanbat-env</code>가 보이고, 상태가 <strong>Succeeded</strong>이면 완료입니다.
</div>

---

## 자주 만나는 문제

<details>
<summary>"The resource provider is not registered" 오류가 납니다</summary>

```bash title="터미널"
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

등록 후 1~2분 기다렸다가 다시 시도하세요.

</details>

<details>
<summary>환경 생성이 5분 이상 걸립니다</summary>

Azure 백엔드에서 Log Analytics Workspace와 ACA 환경을 함께 프로비저닝하므로 시간이 걸립니다. 10분까지는 정상입니다. 기다리세요.

</details>

---

## 다음 단계

<div class="nav-buttons">
<a href="../aci-smoke-test/" class="nav-btn">← ACI Smoke Test</a>
<a href="../api-deploy/" class="nav-btn next">API 앱 배포 →</a>
</div>
