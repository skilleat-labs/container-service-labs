# 유용한 명령어 모음 (치트시트)

---

## Docker Compose

```bash title="Docker Compose 주요 명령어"
# 서비스 시작 (백그라운드)
docker compose up -d

# v2로 전환 (오버레이 적용)
docker compose -f docker-compose.yml -f docker-compose.v2.yml up -d

# 서비스 중지
docker compose down

# 컨테이너 상태 확인
docker compose ps

# 실시간 로그
docker compose logs -f
docker compose logs -f api      # 특정 서비스만

# 컨테이너 내부 접속
docker compose exec api bash

# 스케일 시도 (포트 충돌 발생 — Phase 2 고통 체험용)
docker compose up -d --scale api=3
```

---

## 고통 체험 스크립트

```bash title="터미널"
cd ~/hanbat-order-app

# 고통 1: 배포 지옥 (v1→v2 전환 중 503 체험)
bash scripts/pain-1-deploy-hell.sh

# 고통 2: 스케일 불가 (포트 충돌 체험)
bash scripts/pain-2-scale-fail.sh

# Phase 4: ACA 부하 테스트 (스케일 아웃 확인)
bash scripts/load-test.sh <ACA_WEB_FQDN> 50 120
```

---

## API 직접 호출

```bash title="터미널"
# 헬스체크
curl http://localhost:8080/health

# 버전 확인
curl http://localhost:8080/version

# 주문 목록 조회
curl "http://localhost:8080/orders?userId=3030"

# 주문 상세 조회
curl http://localhost:8080/orders/ORD-001
```

---

## Azure CLI — ACR 명령어

```bash title="터미널"
# ACR 생성
az acr create \
  --name $ACR_NAME \
  --resource-group hanbat-rg \
  --sku Basic \
  --location koreacentral

# ACR 로그인
az acr login --name $ACR_NAME

# ACR 주소 확인
export ACR_SERVER=$(az acr show \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv)

# 이미지 태그 + Push
docker tag skilleat/hanbat-order-api:v1.0.0 ${ACR_SERVER}/hanbat-order-api:v1.0.0
docker push ${ACR_SERVER}/hanbat-order-api:v1.0.0

# ACR 이미지 목록
az acr repository list --name $ACR_NAME --output table

# 이미지 태그 목록
az acr repository show-tags \
  --name $ACR_NAME \
  --repository hanbat-order-api \
  --output table
```

---

## Azure CLI — ACA 핵심 명령어

### 환경 관리

```bash title="터미널"
# ACA 환경 생성
az containerapp env create \
  --name hanbat-env \
  --resource-group hanbat-rg \
  --location koreacentral

# 환경 목록
az containerapp env list \
  --resource-group hanbat-rg \
  --output table
```

### 앱 생성

```bash title="터미널"
# API 앱 (Internal, 포트 8080)
az containerapp create \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --environment hanbat-env \
  --image ${ACR_SERVER}/hanbat-order-api:v1.0.0 \
  --registry-server ${ACR_SERVER} \
  --target-port 8080 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars APP_VERSION=1.0.0

# Web 앱 (External, 포트 80)
az containerapp create \
  --name hanbat-web \
  --resource-group hanbat-rg \
  --environment hanbat-env \
  --image ${ACR_SERVER}/hanbat-order-web:v1.0.0 \
  --registry-server ${ACR_SERVER} \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars APP_VERSION=1.0.0 "API_URL=https://<API_INTERNAL_FQDN>"
```

### 앱 관리

```bash title="터미널"
# 앱 목록
az containerapp list \
  --resource-group hanbat-rg \
  --output table

# URL 확인
az containerapp show \
  --name hanbat-web \
  --resource-group hanbat-rg \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv

# 이미지 업데이트 (새 Revision)
az containerapp update \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --image ${ACR_SERVER}/hanbat-order-api:v2.0.0 \
  --set-env-vars APP_VERSION=2.0.0

# 로그 확인
az containerapp logs show \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --follow
```

### Revision 관리

```bash title="터미널"
# Multiple 모드 전환
az containerapp revision set-mode \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --mode Multiple

# Revision 목록
az containerapp revision list \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --output table

# Traffic Split 설정
az containerapp ingress traffic set \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --revision-weight \
    hanbat-api--v1revision=80 \
    hanbat-api--v2revision=20
```

### 자동 확장

```bash title="터미널"
# HTTP Scaler 설정
az containerapp update \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --min-replicas 1 \
  --max-replicas 10 \
  --scale-rule-name http-scale \
  --scale-rule-type http \
  --scale-rule-http-concurrency 10

# Replica 목록
az containerapp replica list \
  --name hanbat-api \
  --resource-group hanbat-rg \
  --output table
```

### 리소스 정리

```bash title="터미널"
# 리소스 그룹 전체 삭제 (실습 종료 후 필수!)
az group delete \
  --name hanbat-rg \
  --yes \
  --no-wait
```

---

## 무중단 검증 원라이너

```bash title="터미널 (평가 B-1 로그 수집)"
while true; do
  curl -s -o /dev/null \
    -w "$(date '+%H:%M:%S') - %{http_code}\n" \
    https://hanbat-web.xxx.koreacentral.azurecontainerapps.io
  sleep 0.5
done | tee ~/phase4-no-downtime.log
```

---

## SSH 파일 전송

```bash title="터미널 (로컬에서 실행)"
# VM → 로컬 다운로드
scp labuser@<VM_IP>:~/phase4-no-downtime.log .

# 디렉터리 전체 다운로드
scp -r labuser@<VM_IP>:~/submission ./
```

---

<div class="nav-buttons">
<a href="../common-errors/" class="nav-btn">← 자주 만나는 오류</a>
<a href="../../" class="nav-btn next">시작 페이지로 →</a>
</div>
