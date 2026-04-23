<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 20분</span>

# 고통 2: 스케일 불가

## 시나리오

> 오늘 한밭푸드가 지역 뉴스에 나왔습니다. 갑자기 주문 조회 트래픽이 3배 급증.
>
> 인프라팀에 알람이 울립니다: *API 응답 시간 급증*
>
> 김팀장: "빨리 서버 늘려!"
> 박주임(여러분): "... 어떻게요?"

---

## Step 1. 스크립트 실행

```bash title="터미널"
cd ~/hanbat-order-app
bash scripts/pain-2-scale-fail.sh
```

---

## Step 2. 출력 확인

```console title="출력"
[ 1단계 ] 현재 서버 상태 확인
hanbat-order-app-api-1   skilleat/hanbat-order-api:v1.0.0   Up 3 minutes
hanbat-order-app-web-1   skilleat/hanbat-order-web:v1.0.0   Up 3 minutes

[ 2단계 ] 부하 발생 (백그라운드, 10초)
[ 3단계 ] 응답 시간 측정 (5회)
  요청 1: 0ms
  요청 2: 0ms
  요청 3: 0ms
  요청 4: 0ms
  요청 5: 0ms

[ 4단계 ] API를 3개로 늘려보자! (--scale api=3)
----------------------------------------------------
[+] up 2/3
 ✔ Container hanbat-order-app-api-1 Running
 ⠏ Container hanbat-order-app-api-2 Starting
 ✔ Container hanbat-order-app-web-1 Running
Error response from daemon: failed to set up container networking:
driver failed programming external connectivity on endpoint hanbat-order-app-api-2:
Bind for 0.0.0.0:8080 failed: port is already allocated
----------------------------------------------------
```

<div class="pain-box">
<div class="pain-box-title">🔥 포트 충돌 오류 발생</div>

`docker-compose.yml` 에서 포트가 `"8080:8080"` 으로 고정되어 있어 두 번째 컨테이너가 같은 포트를 쓸 수 없습니다.
</div>

!!! info "응답 시간이 0ms로 나오는 이유"
    스크립트가 생성하는 부하만으로는 컨테이너 1개가 충분히 처리할 수 있는 수준입니다.
    실제 트래픽 급증 상황에서는 응답 시간이 눈에 띄게 늘어납니다.
    이 실습의 핵심은 응답 시간보다 **포트 충돌로 스케일 자체가 불가능하다**는 점입니다.

!!! warning "스크립트 실행 후 웹 접근이 안 된다면"
    `--scale api=3` 시도 중 web 컨테이너까지 재생성되면서 서비스가 완전히 내려갈 수 있습니다.
    이것은 고통 2의 **부수 피해**입니다 — 스케일을 시도했다가 오히려 기존 서비스까지 망가지는 상황입니다.

    아래 명령으로 복구하세요.

    ```bash title="터미널"
    cd ~/hanbat-order-app
    docker compose down
    docker compose up -d
    ```

    복구 후 `http://<VM_IP>:8000` 접속이 다시 되면 정상입니다.

---

## 원인 분석

| 문제 | 원인 |
|------|------|
| 포트 충돌 | 포트를 고정하면 컨테이너 2개가 같은 포트 사용 불가 |
| 로드밸런서 없음 | docker-compose 자체에는 로드밸런서 기능 없음 |
| 수동 작업 | 트래픽 급증을 감지하고 수동으로 명령을 실행해야 함 |

---

## ACA에서는 어떻게 해결될까?

!!! success "Phase 4 예고: KEDA HTTP 자동 확장"
    ACA는 HTTP 요청 수 기준으로 Replica를 자동으로 늘리고 줄입니다.
    로드밸런서, 서비스 디스커버리 모두 플랫폼이 자동으로 처리합니다.

---

<div class="nav-buttons">
<a href="../pain-1-deploy-hell/" class="nav-btn">← 고통 1</a>
<a href="../pain-3-no-canary/" class="nav-btn next">고통 3: 점진 배포 불가 →</a>
</div>
