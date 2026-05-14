<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 20분</span>

# 롤백 실습

v2 배포 후 문제가 발생했다고 가정합니다.
ACA에서 롤백이 얼마나 빠르고 안전한지 직접 체험합니다.

---

## Phase 2와 비교

<div class="pain-box">
<div class="pain-box-title">Phase 2에서 겪은 것 (심화 A)</div>

`docker compose down && docker compose up -d` → 롤백 중 2~5초 다운타임 발생
</div>

<div class="checkpoint">
<div class="checkpoint-title">Phase 4에서 해결할 것</div>

트래픽 비율만 변경 → 다운타임 0초 롤백
</div>

---

## 시나리오

> v2 배포 후 고객 클레임이 들어왔습니다.
> 배송 추적 기능에서 오류가 발생하고 있습니다.
> 즉시 v1으로 롤백해야 합니다.

---

## Step 1. 모니터링 시작

롤백 **전부터** 모니터링을 시작합니다.

```bash title="터미널 (모니터링 먼저 실행)"
while true; do
  curl -s -o /dev/null \
    -w "$(date '+%H:%M:%S') - %{http_code}\n" \
    https://hanbat-web2.wittymushroom-f618034a.koreacentral.azurecontainerapps.io
  sleep 0.5
done | tee ~/phase4-rollback.log
```

200이 끊기지 않는지 확인하면서 다음 단계를 진행합니다.

---

## Step 2. 현재 상태 확인

```bash title="터미널 2"
az containerapp ingress traffic show \
  --name hanbat-api \
  --resource-group skilleat-container-lab
```

v2가 100% (또는 80%) 트래픽을 받고 있는 상태를 확인합니다.

---

## Step 3. v1으로 즉시 롤백

```bash
az containerapp ingress traffic set \
  --name hanbat-api \
  --resource-group skilleat-container-lab \
  --revision-weight hanbat-api--v2=0 hanbat-api--v1=100
```

!!! tip "ACA 롤백의 핵심"
    v1 revision이 살아있는 상태에서 **트래픽 비율만 바꾸는 것**이 롤백입니다.
    컨테이너를 내리거나 재시작하지 않으므로 다운타임이 0초입니다.

---

## Step 4. 롤백 확인

```bash
for i in $(seq 1 10); do
  curl -s https://hanbat-web2.wittymushroom-f618034a.koreacentral.azurecontainerapps.io/api/version | grep -o '"version":"[^"]*"'
done
```

전부 `v1.0.0`이 나오면 롤백 완료입니다.

브라우저에서도 확인합니다 — 파란 테마로 돌아오면 성공입니다.

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
모니터링 로그에서 200이 끊기지 않았나요?<br>
끊기지 않았다면 <strong>다운타임 0초 롤백</strong> 성공입니다.
</div>

---

## Step 5. 모니터링 로그 확인

```bash
cat ~/phase4-rollback.log
```

롤백 시점에도 200이 유지되고 있으면 무중단 롤백 증명 완료입니다.

---

## Phase 2 vs Phase 4 비교

| 항목 | Phase 2 (Docker Compose) | Phase 4 (ACA) |
|------|--------------------------|---------------|
| 롤백 방법 | `docker compose down && up` | 트래픽 비율 변경 |
| 다운타임 | 2~5초 | 0초 |
| 롤백 시간 | 수 분 | 수 초 |
| 이전 버전 | 컨테이너 재시작 필요 | Revision 항상 대기 중 |

---

<div class="nav-buttons">
<a href="../zero-downtime-deploy/" class="nav-btn">← 무중단 배포</a>
<a href="../auto-scale/" class="nav-btn next">자동 확장 →</a>
</div>
