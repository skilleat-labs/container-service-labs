<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 20분</span>

# 고통 1: 배포 지옥

## 시나리오

> 개발팀에서 연락이 왔습니다.
> *"주문 조회 v2 나왔어요! 배송 추적 기능 추가됐습니다. 지금 배포해주세요."*
>
> 지금 시각은 오후 12시 30분 — 점심 피크 타임입니다.

---

## Step 1. 배포 스크립트 실행

```bash title="터미널"
cd ~/hanbat-order-app
bash scripts/pain-1-deploy-hell.sh
```

---

## Step 2. 출력 확인

스크립트가 자동으로 v2를 배포하면서 HTTP 상태를 모니터링합니다.

```console title="출력"
======================================================
  고통 체험 1: 배포 지옥
======================================================

[ 1단계 ] 현재 v1 서버 상태 확인
{"version": "1.0.0", "theme": "blue", ...}

[ 2단계 ] 백그라운드에서 HTTP 상태 모니터링 시작 (20초간)
          → 배포 중 에러가 발생하면 여기서 확인됩니다

  01:45:04  [OK ] HTTP 200
  01:45:05  [OK ] HTTP 200

[ 3단계 ] v2 배포 시작 (docker compose recreate)
          → 이 시점부터 서비스가 일시 중단됩니다

  01:45:09  [OK ] HTTP 200
 Container hanbat-order-app-api-1 Recreate
  01:45:10  [!!!] HTTP 000ERR  ← 서비스 중단 발생!
 Container hanbat-order-app-api-1 Recreated
 Container hanbat-order-app-web-1 Recreate
 Container hanbat-order-app-web-1 Recreated
  01:45:11  [!!!] HTTP 000ERR  ← 서비스 중단 발생!
 Container hanbat-order-app-api-1 Started
 Container hanbat-order-app-web-1 Started
  01:45:11  [!!!] HTTP 000ERR  ← 서비스 중단 발생!
  01:45:12  [OK ] HTTP 200    ← 복구
  01:45:13  [OK ] HTTP 200
```

<div class="pain-box">
<div class="pain-box-title">🔥 이게 바로 배포 지옥입니다</div>

컨테이너가 재생성되는 약 <strong>2~3초 동안</strong> 한밭푸드 고객들은 주문 조회가 안 되는 상태입니다.
점심 피크 타임에 이런 일이 생기면? CS팀 전화 폭주.
</div>

---

## 왜 다운타임이 발생하나?

!!! info "스크립트 결과 분석의 '502/503' 표현에 대해"
    스크립트 마지막에 "502 / 503 / ERR 발생을 확인했을 것입니다"라고 나오지만, 실제로는 `000ERR`만 발생합니다.
    `000ERR`은 HTTP 응답 자체가 없다는 의미 — 즉 서버가 응답하기 전에 연결이 끊긴 것입니다.
    `503`보다 더 심각한 상태입니다.

`000ERR`은 HTTP 응답 자체가 없다는 뜻입니다 — 연결 자체가 거부됩니다.

| 단계 | 설명 |
|------|------|
| 컨테이너 Recreate | 기존 컨테이너를 내리고 새 컨테이너를 올림 |
| 포트 바인딩 공백 | 내리는 순간부터 새 컨테이너가 포트를 열기 전까지 연결 불가 |
| 복구 | 새 컨테이너가 시작되면 즉시 200 응답 |

---

## ACA에서는 어떻게 해결될까?

!!! success "Phase 4 예고: Revision 기반 무중단 배포"
    ACA는 v1 컨테이너가 트래픽을 받는 상태에서 v2를 새 Revision으로 준비합니다.
    v2의 Health Probe가 통과된 순간에만 트래픽이 전환되므로 **다운타임 = 0초**.

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 2 개요</a>
<a href="../pain-2-scale-fail/" class="nav-btn next">고통 2: 스케일 불가 →</a>
</div>
