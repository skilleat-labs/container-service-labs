<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 20분</span>

# 도전 과제: ACI 컨테이너 그룹

ACI Smoke Test에서는 컨테이너 하나를 띄웠습니다.
이번에는 **api + web 두 컨테이너를 하나의 ACI로** 묶어서 배포해봅니다.

---

## 컨테이너 그룹이란?

ACI에서 여러 컨테이너를 하나의 단위로 묶는 개념입니다.
같은 그룹 안의 컨테이너끼리는 **`localhost`** 로 통신합니다.

```
[ Container Group ]
  ├── web   → 외부에서 :8000 으로 접근
  └── api   → web이 localhost:8080 으로 호출
```

!!! warning "Docker Compose와 다른 점"
    Docker Compose에서는 서비스 이름(`hanbat-order-api`)으로 통신했지만,
    ACI 컨테이너 그룹에서는 반드시 **`localhost`** 를 사용해야 합니다.
    그래서 web 컨테이너에 `API_URL=http://localhost:8080` 환경변수를 설정합니다.

---

## YAML 필수값 확인

작성 전에 어떤 값이 필수인지 공식 문서에서 확인합니다.

**참고 문서**: [컨테이너 그룹 YAML 참조 — Microsoft Learn](https://learn.microsoft.com/ko-kr/azure/container-instances/container-instances-reference-yaml)

| 레벨 | 필수 속성 |
|------|-----------|
| 최상위 | `name`, `apiVersion`, `properties` |
| `properties` | `containers`, `osType` |
| 컨테이너 각각 | `name`, `image`, `resources.requests.cpu`, `resources.requests.memoryInGB` |
| `imageRegistryCredentials` | `server`, (username/password) |
| `ipAddress` | `ports`, `type` |

---

## Step 1. YAML 파일 작성

VM 터미널에서 파일을 만듭니다.

```bash
vi ~/container-group.yaml
```

아래 YAML에서 `< >` 부분을 본인 값으로 채우고, **web 컨테이너 부분은 직접 작성**하세요.

```yaml
apiVersion: 2019-12-01
name: hanbat-group
properties:
  containers:
  - name: web
    properties:
      image: <ACR이름>.azurecr.io/hanbat-order-web:v1.0.0
      environmentVariables:
      - name: API_URL
        value: "http://localhost:8080"
      - name: API_BACKEND_URL
        value: "http://localhost:8080"
      resources:
        requests:
          cpu: 0.5
          memoryInGB: 0.5
      ports:
      - port: 8000

  imageRegistryCredentials:
  - server: <ACR이름>.azurecr.io
    username: <액세스 키 → 사용자 이름>
    password: <액세스 키 → 암호>

  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: # 직접 채우세요
```

!!! question "힌트"
    - web 위에 api 컨테이너를 같은 계층으로 추가하세요
    - api는 외부에 포트를 열 필요가 없습니다
    - cpu: 0.5, memoryInGB: 0.5 로 설정하세요
    - 이미지: `<ACR이름>.azurecr.io/hanbat-order-api:v1.0.0`

!!! tip "ACR 자격증명 확인 방법"
    Azure Portal → **컨테이너 레지스트리** → `hanbatacr...` 선택
    → **설정** → **액세스 키**

    [ACI Smoke Test](./aci-smoke-test.md)에서 활성화한 관리 사용자 정보를 그대로 사용합니다.

!!! info "왜 api에는 ports가 없나요?"
    api는 web과 `localhost`로 통신하므로 외부에 포트를 노출할 필요가 없습니다.
    외부에서 직접 접근하는 web 컨테이너만 `ipAddress.ports`에 등록합니다.

---

## Step 2. 배포

```bash
az container create \
  --resource-group <본인_리소스_그룹> \
  --file ~/container-group.yaml
```

배포 완료까지 약 1~2분 소요됩니다.

---

## Step 3. 접속 확인

### 공용 IP 확인

```bash
az container show \
  --resource-group <본인_리소스_그룹> \
  --name hanbat-group \
  --query ipAddress.ip \
  --output tsv
```

### 브라우저에서 접속

```
http://<공용IP>:8000
```

주문 목록 화면이 뜨면 성공입니다.

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
브라우저에서 주문 목록 화면이 보이나요?<br>
주문이 정상적으로 조회되면 web → api 통신이 성공한 겁니다.
</div>

---

## Step 4. 로그 확인

```bash
# api 로그
az container logs \
  --resource-group <본인_리소스_그룹> \
  --name hanbat-group \
  --container-name api

# web 로그
az container logs \
  --resource-group <본인_리소스_그룹> \
  --name hanbat-group \
  --container-name web
```

---

## Step 5. 삭제

확인이 끝나면 즉시 삭제합니다.

```bash
az container delete \
  --resource-group <본인_리소스_그룹> \
  --name hanbat-group \
  --yes
```

---

## 정리

| 항목 | Docker Compose | ACI 컨테이너 그룹 |
|------|---------------|-----------------|
| 컨테이너 간 통신 | 서비스 이름 | `localhost` |
| 백엔드 주소 설정 | `hanbat-order-api:8080` | `localhost:8080` |
| 이미지 저장소 | Docker Hub / ACR | ACR (private) |
| 스케일 | 컨테이너 단위 불가 | 그룹 단위 불가 |

!!! info "ACI 컨테이너 그룹의 한계"
    컨테이너를 **개별 스케일**하거나 **개별 재배포**하는 것은 불가능합니다.
    이 한계를 해결하는 것이 다음 단계에서 배울 **Azure Container Apps**입니다.

---

## 다음 단계

<div class="nav-buttons">
<a href="../aci-smoke-test/" class="nav-btn">← ACI Smoke Test</a>
<a href="../environment-create/" class="nav-btn next">ACA 환경 생성 →</a>
</div>
