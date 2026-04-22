<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 45분</span>

# 무중단 배포 + Traffic Split

Phase 2 고통 1(배포 시 503)과 고통 3(점진 배포 불가)을 ACA로 해결합니다.

---

## Phase 2와 비교

<div class="pain-box">
<div class="pain-box-title">Phase 2에서 겪은 것</div>

`docker compose -f docker-compose.yml -f docker-compose.v2.yml up -d` → 컨테이너 재생성 중 10초 503 발생
</div>

<div class="checkpoint">
<div class="checkpoint-title">Phase 4에서 해결할 것</div>

Revision 교체 → 다운타임 0초 / Traffic Split → v1:v2 = 80:20
</div>

---

## Step 1. Multiple Revision 모드 활성화

=== "포털"

    `hanbat-api` → **수정 버전 관리** → 수정 버전 모드: **여러 개** → **저장**

=== "CLI"

    ```bash title="터미널"
    az containerapp revision set-mode \
      --name hanbat-api \
      --resource-group $RESOURCE_GROUP \
      --mode Multiple
    ```

---

## Step 2. 현재 Revision 확인

```bash title="터미널"
az containerapp revision list \
  --name hanbat-api \
  --resource-group $RESOURCE_GROUP \
  --output table
```

```console title="출력"
Name                      Active    TrafficWeight    CreatedTime
------------------------  --------  ---------------  -------------------
hanbat-api--abc123        True      100              2026-04-21T09:00:00
```

---

## Step 3. 무중단 검증 시작

터미널을 하나 열어두고 모니터링을 시작합니다. **배포 전부터** 실행해야 합니다.

```bash title="터미널 (모니터링 — 배포 전 미리 실행)"
# WEB_URL이 없으면 먼저 설정
WEB_URL=$(az containerapp show \
  --name hanbat-web \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

while true; do
  curl -s -o /dev/null \
    -w "$(date '+%H:%M:%S') - %{http_code}\n" \
    https://$WEB_URL
  sleep 0.5
done | tee ~/phase4-no-downtime.log
```

!!! tip "이 파일이 평가 B-1 제출물"
    `phase4-no-downtime.log` 에 200이 끊기지 않고 출력되면 무중단 배포 증명 완료입니다.

---

## Step 4. v2 Revision 배포

=== "포털"

    `hanbat-api` → **수정 버전 관리** → **+ 새 수정 버전 만들기**
    → 이미지를 `<ACR_SERVER>/hanbat-order-api:v2.0.0` 으로 변경 → **만들기**

=== "CLI"

    ```bash title="터미널"
    az containerapp update \
      --name hanbat-api \
      --resource-group $RESOURCE_GROUP \
      --image ${ACR_SERVER}/hanbat-order-api:v2.0.0 \
      --set-env-vars APP_VERSION=2.0.0 \
      --revision-suffix v2
    ```

배포 후 로그를 확인하면 **200이 끊기지 않습니다**. v1이 계속 트래픽을 받고 있기 때문입니다.

```console title="모니터링 출력 (200 끊김 없음)"
10:30:01 - 200
10:30:01 - 200
10:30:02 - 200   ← v2 배포 중에도 200 유지
10:30:02 - 200
10:30:03 - 200
```

---

## Step 5. Traffic Split 80:20 설정

v2 Revision이 Running 상태가 되면 트래픽을 분배합니다.

```bash title="터미널"
# Revision 목록 다시 확인
az containerapp revision list \
  --name hanbat-api \
  --resource-group $RESOURCE_GROUP \
  --output table
```

```console title="출력"
Name                      Active    TrafficWeight
------------------------  --------  ---------------
hanbat-api--0000001       True      100              ← v1
hanbat-api--v2            True        0              ← v2 (방금 배포)
```

!!! warning "리비전 이름 확인 필수"
    위 출력에서 v1/v2 리비전 이름을 확인한 뒤 아래 명령어에 직접 입력하세요.
    `LatestRevision=True`로만 지정하면 v1/v2 모두 v2로 인식되어 트래픽이 제대로 분산되지 않습니다.

=== "포털"

    수정 버전 관리 화면에서 v1: **80**, v2: **20** 입력 → **저장**

=== "CLI"

    ```bash title="터미널"
    # revision list에서 확인한 이름으로 변경
    V1_REVISION=hanbat-api--0000001
    V2_REVISION=hanbat-api--v2

    az containerapp ingress traffic set \
      --name hanbat-api \
      --resource-group $RESOURCE_GROUP \
      --revision-weight \
        ${V1_REVISION}=80 \
        ${V2_REVISION}=20
    ```

---

## Step 6. 버전 분산 확인

```bash title="터미널"
for i in {1..20}; do
  curl -s "https://$WEB_URL/api/version" \
    | grep -o '"version":"[^"]*"' || true
done | sort | uniq -c
```

```console title="출력"
 16  "version":"1.0.0"   ← 약 80%
  4  "version":"2.0.0"   ← 약 20%
```

---

## Step 7. 100% v2 전환

검증 완료 후 v2로 전체 전환합니다.

=== "포털"

    v1: **0**, v2: **100** → 저장

=== "CLI"

    ```bash title="터미널"
    az containerapp ingress traffic set \
      --name hanbat-api \
      --resource-group $RESOURCE_GROUP \
      --revision-weight \
        ${V2_REVISION}=100
    ```

Web 화면이 파란 테마(v1) → 초록 테마(v2)로 바뀌고, 배송 추적 기능이 추가됩니다.

<div class="checkpoint">
<div class="checkpoint-title">✅ 완료 체크리스트</div>

- [ ] Multiple Revision 모드 활성화
- [ ] v2(`skilleat/hanbat-order-api:v2.0.0`) 배포
- [ ] `phase4-no-downtime.log` — 200 끊김 없음 확인 (평가 B-1)
- [ ] Traffic Split 80:20 설정 캡처 (평가 B-3)
- [ ] 100% v2 전환 완료

</div>

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 4 개요</a>
<a href="../auto-scale/" class="nav-btn next">자동 확장 →</a>
</div>
