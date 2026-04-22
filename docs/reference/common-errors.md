# 자주 만나는 오류

실습 중 자주 등장하는 오류와 해결 방법을 정리했습니다.

---

## Azure CLI 관련

<details>
<summary>❌ "The resource provider 'Microsoft.App' is not registered"</summary>

**원인**: Azure 구독에 Container Apps 리소스 공급자가 등록되지 않음

**해결**:

```bash
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights

# 등록 완료 확인 (1~2분 소요)
az provider show --namespace Microsoft.App --query registrationState
```

`"Registered"` 가 나오면 재시도하세요.

</details>

<details>
<summary>❌ "No subscriptions found" (az login 후)</summary>

**원인**: Azure 계정에 활성 구독 없음

**해결**:
1. [portal.azure.com](https://portal.azure.com) 에서 무료 체험 구독 활성화
2. 또는 `az account list --all` 로 비활성 구독 확인 후 `az account set --subscription <ID>` 로 활성화

</details>

<details>
<summary>❌ az login 후 계정 선택이 필요합니다</summary>

여러 Azure 계정이 있는 경우:

```bash
# 계정 목록 확인
az account list --output table

# 사용할 구독 선택
az account set --subscription "<구독 이름 또는 ID>"
```

</details>

---

## Docker 관련

<details>
<summary>❌ "docker: permission denied"</summary>

**해결**:

```bash
# 방법 1: sudo 사용
sudo docker compose up -d

# 방법 2: 그룹 추가 (이후 재로그인 필요)
sudo usermod -aG docker $USER
newgrp docker
```

</details>

<details>
<summary>❌ Docker Hub push: "denied: requested access to the resource is denied"</summary>

**원인**: 로그인 안 됨 or 이미지 이름의 계정명이 틀림

**해결**:

```bash
# 로그인 확인
docker info | grep Username

# 재로그인
docker logout
docker login

# 이미지 이름 확인 (yourid 부분이 본인 Docker Hub ID여야 함)
docker images | grep hanbat
```

</details>

<details>
<summary>❌ "port is already allocated" (포트 8000 또는 80)</summary>

**해결**:

```bash
# 포트 사용 중인 프로세스 찾기
sudo lsof -i :8000
sudo lsof -i :80

# 또는 netstat으로 확인
sudo netstat -tlnp | grep :8000

# 기존 컨테이너가 점유 중이라면
docker compose down
docker compose up -d
```

</details>

---

## Azure Container Apps 관련

<details>
<summary>❌ ACA 앱이 계속 재시작됩니다 (Restart Loop)</summary>

**원인 확인**:

```bash
az containerapp logs show \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --tail 50
```

주요 원인:
- 대상 포트 번호가 틀림 (api는 8000, web은 3000 이어야 함)
- 이미지 Pull 실패 (이미지 이름 오타 또는 Private 이미지)
- 앱 시작 오류 (환경 변수 누락)

</details>

<details>
<summary>❌ Container App 생성이 5분 이상 걸립니다</summary>

**이것은 오류가 아닙니다.**

ACA 환경(Environment) 생성 시 Log Analytics Workspace를 함께 프로비저닝하므로 5~10분 소요됩니다. 기다리세요. 10분 이상 걸리면 Azure Portal에서 배포 상태를 확인하세요.

</details>

<details>
<summary>❌ External Ingress URL 접속 안 됨 (ERR_CONNECTION_REFUSED)</summary>

**체크리스트**:

```bash
# 1. Ingress가 external인지 확인
az containerapp ingress show \
  --name hanbat-web \
  --resource-group hanbat-rg \
  --query "external"
# true 여야 함

# 2. 앱이 Running 상태인지 확인
az containerapp show \
  --name hanbat-web \
  --resource-group hanbat-rg \
  --query "properties.runningStatus"
# Running 이어야 함

# 3. URL이 https:// 로 시작하는지 확인
# http:// 는 redirect 안 됨 — 반드시 https:// 사용
```

</details>

<details>
<summary>❌ Internal FQDN으로 외부에서 접속이 안 됩니다</summary>

**이것은 정상입니다.**

Internal Ingress는 ACA 환경 내부에서만 접근 가능합니다. 인터넷 브라우저에서는 열리지 않는 것이 정상적인 보안 설계입니다. Web 앱이 API를 호출하는 것은 ACA 내부 네트워크를 통해 이루어집니다.

</details>

<details>
<summary>❌ Traffic Split 설정 후 Revision 이름을 모릅니다</summary>

```bash
# 현재 Revision 목록 확인
az containerapp revision list \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --output table
```

</details>

---

## 네트워크 관련

<details>
<summary>❌ SSH 접속이 안 됩니다 (Connection Refused)</summary>

1. VM IP 주소 재확인 (강사에게 문의)
2. 회사 방화벽: IT팀에 22번 포트 허용 요청
3. `ssh -v labuser@<IP>` 로 디버그 출력 확인

</details>

---

<div class="nav-buttons">
<a href="../../evaluation/submission-guide/" class="nav-btn">← 제출 가이드</a>
<a href="../useful-commands/" class="nav-btn next">유용한 명령어 →</a>
</div>
