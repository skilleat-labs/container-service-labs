<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 20분</span>

# ACR 생성 및 이미지 푸시

ACA는 컨테이너 이미지를 레지스트리에서 Pull합니다.
이 단계에서는 **Azure Container Registry(ACR)** 를 만들고, VM에 있는 이미지를 ACR에 Push합니다.

!!! info "왜 Docker Hub 대신 ACR인가요?"
    ACR은 Azure 내부 레지스트리입니다. ACA와 같은 Azure 환경 안에 있기 때문에 관리형 ID(Managed Identity)로 별도 자격증명 없이 이미지를 Pull할 수 있습니다. 실무에서도 Azure 환경이라면 ACR을 쓰는 것이 표준입니다.

---

## Azure CLI란?

**Azure CLI**는 터미널에서 `az` 명령어로 Azure 리소스를 생성·관리하는 도구입니다.
Portal에서 클릭으로 하는 모든 작업을 명령어 한 줄로 처리할 수 있어 자동화와 반복 작업에 강합니다.

!!! tip "공식 학습 자료"
    - **설치 가이드**: [Azure CLI 설치 (Microsoft Learn)](https://learn.microsoft.com/ko-kr/cli/azure/install-azure-cli)
    - **시작하기**: [Azure CLI 시작 (Microsoft Learn)](https://learn.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli)

---

## Step 0. Azure CLI 설치 확인 및 설치

먼저 `az` 명령어가 사용 가능한지 확인합니다.

```bash title="터미널"
az version
```

명령어를 찾을 수 없다는 오류가 나오면 아래 방법으로 설치합니다.

!!! info "설치 위치"
    Phase 0에서 생성한 VM에 SSH 접속한 상태에서 설치합니다.

=== "Ubuntu / Debian (VM)"

    ```bash title="터미널"
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
    ```

    설치 후 버전 확인:

    ```bash title="터미널"
    az version
    ```

    ```json title="출력"
    {
      "azure-cli": "2.x.x",
      ...
    }
    ```

=== "macOS"

    ```bash title="터미널"
    brew update && brew install azure-cli
    ```

=== "Windows"

    PowerShell에서 실행:

    ```powershell title="PowerShell (관리자)"
    winget install -e --id Microsoft.AzureCLI
    ```

설치 후 Azure 계정으로 로그인합니다.

!!! warning "VM에서는 반드시 `--use-device-code` 사용"
    VM에는 브라우저가 없으므로 일반 `az login`은 동작하지 않습니다.
    아래와 같이 디바이스 코드 방식으로 로그인해야 합니다.

```bash title="터미널"
az login --use-device-code
```

```console title="출력"
To sign in, use a web browser to open the page https://microsoft.com/devicelogin
and enter the code XXXXXXXX to authenticate.
```

출력된 코드를 복사한 뒤, **본인 PC 브라우저**에서 `https://microsoft.com/devicelogin` 을 열고 코드를 입력합니다. MFA 인증까지 완료하면 로그인됩니다.

!!! info "테넌트 지정이 필요한 경우"
    로그인 후 `No subscriptions found` 오류가 나오면 테넌트 ID를 명시해야 합니다.
    강사에게 테넌트 ID를 받아 아래처럼 실행하세요.

    ```bash title="터미널"
    az login --tenant <강사제공_TENANT_ID> --use-device-code
    ```

    테넌트 ID는 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 형태의 UUID입니다.
    `TENANT_ID` 라는 문자를 그대로 입력하면 안 됩니다.

로그인 성공 시:

```json title="출력"
[
  {
    "name": "Azure subscription",
    "state": "Enabled",
    ...
  }
]
```

---

## Step 1. 변수 설정

### 내 리소스 그룹과 리전 확인

강사마다 수강생에게 배정하는 리소스 그룹 이름과 리전이 다릅니다. 먼저 내 계정에 배정된 리소스 그룹을 조회합니다.

```bash title="터미널"
az group list --output table
```

```console title="출력 예시"
Name                Location       Status
------------------  -------------  ---------
hanbat-rg-test01    koreacentral   Succeeded
```

- **Name** 열 → 내 리소스 그룹 이름
- **Location** 열 → 내 리전

!!! warning "리소스 그룹이 여러 개 보인다면"
    강사가 배정해준 리소스 그룹 이름을 사용하세요. 모르겠으면 강사에게 확인합니다.

### 변수에 값 입력

조회한 값을 아래 명령에 그대로 입력합니다.

```bash title="터미널"
export RESOURCE_GROUP=<위에서 확인한 Name>      # 예: hanbat-rg-test01
export LOCATION=<위에서 확인한 Location>         # 예: koreacentral
export ACR_NAME=hanbatacr$RANDOM                # 전역 유일해야 하므로 랜덤값 추가
```

설정된 값을 확인합니다.

```bash title="터미널"
echo "RESOURCE_GROUP: $RESOURCE_GROUP"
echo "LOCATION:       $LOCATION"
echo "ACR_NAME:       $ACR_NAME"
```

!!! tip "ACR_NAME은 반드시 메모해두세요"
    `$RANDOM`으로 생성된 이름은 터미널을 닫으면 사라집니다. 이후 단계에서 계속 사용하므로 출력된 값을 메모해두세요.

---

## Step 2. ACR 생성

=== "포털"

    1. Azure Portal 검색창에 **컨테이너 레지스트리** 검색 → **+ 만들기**
    2. 기본 사항 입력:

       | 항목 | 값 |
       |------|-----|
       | 리소스 그룹 | 강사에게 할당받은 리소스 그룹 (예: `hanbat-rg-test01`) |
       | 레지스트리 이름 | `hanbatacr` + 임의 숫자 (전역 유일) |
       | 위치 | Korea Central |
       | SKU | **Basic** |

    3. **검토 + 만들기** → **만들기**

=== "CLI"

    ```bash title="터미널"
    az acr create \
      --name $ACR_NAME \
      --resource-group $RESOURCE_GROUP \
      --sku Basic \
      --location $LOCATION
    ```

    ```json title="응답"
    {
      "name": "hanbatacr12345",
      "loginServer": "hanbatacr12345.azurecr.io",
      "provisioningState": "Succeeded"
    }
    ```

    !!! tip "Portal에서 확인하기"
        CLI 실행 후 Azure Portal → **컨테이너 레지스트리** 로 이동하면 방금 만든 ACR이 목록에 표시됩니다. 리소스가 제대로 생성됐는지 눈으로 확인해보세요.

---

## Step 3. ACR 로그인

`az login`으로 Azure에 이미 로그인했는데 왜 또 로그인할까요?

`az login`은 **Azure 리소스를 관리**하는 권한입니다 (리소스 그룹 생성, ACR 만들기 등).
반면 `docker push`는 **Docker 데몬**이 실행하는 명령이라 Azure 로그인 정보를 모릅니다.

`az acr login`은 ACR 자격증명을 받아서 **Docker에게 전달**하는 역할을 합니다.
이 과정이 없으면 `docker push` 시 인증 오류가 발생합니다.

```
az login      → Azure CLI 인증  (리소스 관리 권한)
                      ↓
az acr login  → Docker 데몬에 ACR 자격증명 등록  (이미지 push/pull 권한)
                      ↓
docker push   → ACR에 이미지 업로드 성공
```

```bash title="터미널"
az acr login --name $ACR_NAME
```

```console title="출력"
Login Succeeded
```

---

## Step 4. VM의 이미지를 ACR로 Push

VM에는 이미 `docker compose up -d` 를 실행하면서 이미지가 Pull되어 있습니다.

**ACR 주소 확인:**

```bash title="터미널"
export ACR_SERVER=$(az acr show \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv)

echo $ACR_SERVER   # hanbatacr12345.azurecr.io
```

**이미지 확인:**

Phase 2 실습을 진행했다면 v2 이미지까지 이미 VM에 있습니다.

```bash title="터미널"
docker images | grep hanbat
```

```console title="출력"
skilleat/hanbat-order-api   v2.0.0   ...
skilleat/hanbat-order-api   v1.0.0   ...
skilleat/hanbat-order-web   v2.0.0   ...
```

목록에 없는 이미지가 있다면 그것만 pull합니다.

```bash title="터미널"
# 없는 이미지만 선택해서 실행
docker pull skilleat/hanbat-order-api:v1.0.0
docker pull skilleat/hanbat-order-api:v2.0.0
docker pull skilleat/hanbat-order-web:v2.0.0
```

**이미지 태그 + Push:**

```bash title="터미널"
# API 이미지 태그
docker tag skilleat/hanbat-order-api:v1.0.0 ${ACR_SERVER}/hanbat-order-api:v1.0.0
docker tag skilleat/hanbat-order-api:v2.0.0 ${ACR_SERVER}/hanbat-order-api:v2.0.0

# Web 이미지 태그 (v2만 사용 — v1은 nginx 프록시 미지원)
docker tag skilleat/hanbat-order-web:v2.0.0 ${ACR_SERVER}/hanbat-order-web:v2.0.0

# ACR에 Push
docker push ${ACR_SERVER}/hanbat-order-api:v1.0.0
docker push ${ACR_SERVER}/hanbat-order-api:v2.0.0
docker push ${ACR_SERVER}/hanbat-order-web:v2.0.0
```

!!! warning "Web은 반드시 v2.0.0을 사용하세요"
    v1.0.0은 nginx API 프록시 설정이 없어 주문 목록을 불러올 수 없습니다.
    Web 컨테이너는 반드시 **v2.0.0** 이미지를 사용해야 합니다.

---

## Step 5. Push 확인

### CLI 확인

```bash title="터미널"
az acr repository list \
  --name $ACR_NAME \
  --output table
```

```console title="출력"
Result
--------------------
hanbat-order-api
hanbat-order-web
```

```bash title="터미널"
az acr repository show-tags \
  --name $ACR_NAME \
  --repository hanbat-order-api \
  --output table
```

```console title="출력"
Result
--------
v1.0.0
v2.0.0
```

```bash title="터미널"
az acr repository show-tags \
  --name $ACR_NAME \
  --repository hanbat-order-web \
  --output table
```

```console title="출력"
Result
--------
v2.0.0
```

### Azure Portal에서 눈으로 확인 (필수)

CLI 결과만으로는 실제로 이미지가 잘 올라갔는지 확신하기 어렵습니다.
**반드시 Portal에서 직접 눈으로 확인하세요.**

1. [portal.azure.com](https://portal.azure.com) → 검색창에 **컨테이너 레지스트리** 검색
2. 방금 만든 `hanbatacr...` 선택
3. 왼쪽 메뉴 **서비스** 섹션 → **리포지토리** 클릭
4. 아래와 같이 두 리포지토리가 보이면 성공입니다

![ACR 리포지토리 목록](../../assets/images/3-1.png)

| 리포지토리 | 태그 |
|-----------|------|
| `hanbat-order-api` | `v1.0.0`, `v2.0.0` |
| `hanbat-order-web` | `v2.0.0` |

각 리포지토리를 클릭하면 태그별 이미지 크기와 push 시각도 확인할 수 있습니다.

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
<code>hanbat-order-api</code>, <code>hanbat-order-web</code> 두 이미지가 ACR에 있고,
<code>$ACR_SERVER</code> 값을 메모해뒀나요? 다음 단계에서 계속 사용합니다.
</div>

---

## 실습에서 사용할 이미지 정리

| 컨테이너 | v1 이미지 | v2 이미지 |
|---------|-----------|-----------|
| API | `<ACR_SERVER>/hanbat-order-api:v1.0.0` | `<ACR_SERVER>/hanbat-order-api:v2.0.0` |
| Web | — | `<ACR_SERVER>/hanbat-order-web:v2.0.0` ⬅ 이것만 사용 |

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 3 개요</a>
<a href="../aci-smoke-test/" class="nav-btn next">ACI Smoke Test →</a>
</div>
