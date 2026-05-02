<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 45분</span>

# 자동 확장 (Auto Scale)

Phase 2 고통 2(포트 충돌로 스케일 불가)를 ACA로 해결합니다.

---

## Step 1. 스케일 규칙 설정

=== "포털"

    `hanbat-api` → **스케일** 탭 → **+ 규칙 추가**

    | 항목 | 값 |
    |------|-----|
    | 규칙 이름 | `http-scale` |
    | 형식 | HTTP 크기 조정 |
    | 동시 요청 수 | `10` |

    Replica 범위: 최솟값 `1`, 최댓값 `10` → **저장**

=== "CLI"

    ```bash title="터미널"
    az containerapp update \
      --name hanbat-api \
      --resource-group $RESOURCE_GROUP \
      --min-replicas 1 \
      --max-replicas 10 \
      --scale-rule-name http-scale \
      --scale-rule-type http \
      --scale-rule-http-concurrency 10
    ```

---

## Step 2. 현재 Replica 확인

```bash title="터미널"
az containerapp replica list \
  --name hanbat-api \
  --resource-group $RESOURCE_GROUP \
  --output table
```

```console title="출력"
Name                        Running
--------------------------  -------
hanbat-api--def456-abc123   True      ← 현재 1개
```

---

## Step 3. 부하 생성

`WEB_URL`이 설정되지 않았다면 먼저 실행합니다.

```bash title="터미널"
WEB_URL=$(az containerapp show \
  --name hanbat-web \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)
```

`load-test.sh` 스크립트를 실행합니다.

```bash title="터미널"
cd ~/hanbat-order-app
bash scripts/load-test.sh $WEB_URL 50 120
```

스크립트가 `meta.containerInstanceId` 변화를 실시간으로 출력합니다:

```console title="스크립트 출력"
── containerInstanceId 변화 (스케일 아웃 확인) ──
  10:40:01  Replica: abc123def456   ← 1번 Replica
  10:40:02  Replica: abc123def456
  10:40:15  Replica: xyz789ghi012   ← 2번 Replica 추가됨!
  10:40:16  Replica: abc123def456
  10:40:17  Replica: xyz789ghi012
```

---

## Step 4. Replica 자동 증가 확인

```bash title="터미널"
az containerapp replica list \
  --name hanbat-api \
  --resource-group $RESOURCE_GROUP \
  --output table
```

```console title="출력"
Name                        Running
--------------------------  -------
hanbat-api--def456-abc123   True    ← 기존
hanbat-api--def456-xyz789   True    ← 자동 추가!
hanbat-api--def456-ghi012   True    ← 자동 추가!
```

!!! info "스케일 아웃 반응 시간"
    ACA의 자동 확장은 수십 초~2분 내에 반응합니다. 부하를 충분히 지속시켜야 합니다.

### Azure Portal에서도 확인할 수 있습니다

1. **hanbat-api** 클릭
2. 왼쪽 메뉴 **애플리케이션 > 수정버전 및 복제본** 클릭
3. 현재 revision 행 클릭 → 우측 **복제본** 탭 클릭
4. 실행 중인 Replica 목록과 상태(Running)를 실시간으로 확인할 수 있습니다

---

## Step 5. 설정 저장 (평가용)

```bash title="터미널"
az containerapp show \
  --name hanbat-api \
  --resource-group $RESOURCE_GROUP \
  --query "properties.template.scale" \
  > ~/phase4-autoscale-config.json

cat ~/phase4-autoscale-config.json
```

```json title="응답"
{
  "maxReplicas": 10,
  "minReplicas": 1,
  "rules": [
    {
      "custom": {
        "metadata": {"concurrentRequests": "10"},
        "type": "http"
      },
      "name": "http-scale"
    }
  ]
}
```

<div class="checkpoint">
<div class="checkpoint-title">✅ Phase 4 완료 체크리스트</div>

- [ ] KEDA HTTP Scaler 설정 완료
- [ ] `load-test.sh` 실행 후 `containerInstanceId` 변화 확인
- [ ] Replica 수가 1 → 2 이상으로 늘어남 확인
- [ ] Azure Portal 스케일 설정 화면 캡처 (평가 B-2)
- [ ] `phase4-autoscale-config.json` 저장

</div>

---

<div class="nav-buttons">
<a href="../zero-downtime-deploy/" class="nav-btn">← 무중단 배포</a>
<a href="../../phase-5/" class="nav-btn next">Phase 5 · 의사결정 →</a>
</div>
