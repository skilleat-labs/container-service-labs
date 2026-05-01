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

기본값은 Single(단일) 모드입니다. Traffic Split을 사용하려면 먼저 Multiple 모드로 바꿔야 합니다.

1. **hanbat-api** → 왼쪽 메뉴 **수정 버전 관리 (Revisions and replicas)**
2. 상단 **수정 버전 모드 (Revision mode)** → **여러 개 (Multiple)** 선택
3. **저장 (Save)**

---

## Step 2. 현재 Revision 확인

1. **hanbat-api** → 왼쪽 메뉴 **수정 버전 관리 (Revisions and replicas)**
2. 목록에 현재 revision이 1개 보이고 트래픽 **100%** 가 할당되어 있으면 정상입니다

현재 revision 이름을 메모해둡니다 (예: `hanbat-api--0000001`). 이후 Traffic Split 설정 시 사용합니다.

---

## Step 3. 무중단 검증 시작

배포 **전부터** 모니터링을 시작해야 다운타임이 없다는 걸 증명할 수 있습니다.

```bash title="터미널 (모니터링 — 배포 전 미리 실행)"
# WEB_URL 확인
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

1. **hanbat-api** → 왼쪽 메뉴 **수정 버전 관리 (Revisions and replicas)** → **+ 새 수정 버전 만들기 (New revision)**

2. **컨테이너 (Container)** 탭:

   | 항목 | 값 |
   |------|-----|
   | 이미지 및 태그 | `<ACR_SERVER>/hanbat-order-api:v2.0.0` |

3. **환경 변수** 섹션:

   | 이름 | 값 |
   |------|-----|
   | `APP_VERSION` | `2.0.0` |

4. **만들기 (Create)**

!!! warning "환경변수도 반드시 변경하세요"
    이미지만 v2.0.0으로 바꾸고 `APP_VERSION`을 그대로 두면 footer에 `v1.0.0`이 표시됩니다. 이미지와 환경변수를 함께 변경해야 합니다.

배포 후 모니터링 로그를 확인하면 **200이 끊기지 않습니다**. v2가 뜨는 동안 v1이 계속 트래픽을 받고 있기 때문입니다.

```console title="모니터링 출력 (200 끊김 없음)"
10:30:01 - 200
10:30:01 - 200
10:30:02 - 200   ← v2 배포 중에도 200 유지
10:30:02 - 200
10:30:03 - 200
```

---

## Step 5. Traffic Split 80:20 설정

v2 Revision이 **Running** 상태가 되면 트래픽을 분배합니다.

1. **hanbat-api** → 왼쪽 메뉴 **수정 버전 관리 (Revisions and replicas)**
2. 목록에 v1, v2 revision이 모두 보입니다
3. v1 트래픽: **80**, v2 트래픽: **20** 입력
4. **저장 (Save)**

!!! info "Revision 이름 확인"
    수정 버전 관리 목록에서 각 revision의 이름과 현재 트래픽 비중을 확인할 수 있습니다.
    v2는 방금 배포한 revision이며 현재 트래픽 0%로 표시됩니다.

---

## Step 6. 버전 분산 확인

브라우저에서 화면을 여러 번 새로고침합니다.

- 약 **80%** 확률로 파란 테마 (v1)
- 약 **20%** 확률로 초록 테마 (v2)

두 가지 화면이 번갈아 나타나면 Traffic Split이 동작하는 것입니다.

!!! tip "캡처 저장"
    v1/v2 화면이 각각 뜨는 순간을 캡처합니다 (평가 B-3).

---

## Step 7. 100% v2 전환

검증 완료 후 v2로 전체 전환합니다.

1. **hanbat-api** → 왼쪽 메뉴 **수정 버전 관리 (Revisions and replicas)**
2. v1 트래픽: **0**, v2 트래픽: **100** 입력
3. **저장 (Save)**

Web 화면이 파란 테마(v1) → 초록 테마(v2)로 바뀌고, 배송 추적 기능이 추가됩니다.

<div class="checkpoint">
<div class="checkpoint-title">✅ 완료 체크리스트</div>

- [ ] Multiple Revision 모드 활성화
<br>
- [ ] v2(`hanbat-order-api:v2.0.0`) 배포
<br>
- [ ] `phase4-no-downtime.log` — 200 끊김 없음 확인 (평가 B-1)
<br>
- [ ] Traffic Split 80:20 설정 캡처 (평가 B-3)
<br>
- [ ] 100% v2 전환 완료

</div>

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 4 개요</a>
<a href="../auto-scale/" class="nav-btn next">자동 확장 →</a>
</div>
