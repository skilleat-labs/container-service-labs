<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 15분</span>

# 심화 C: 로그가 뒤섞인다

## 시나리오

> 간신히 API 컨테이너를 두 개 띄웠습니다.
>
> 그런데 얼마 후 일부 요청에서 오류가 납니다.
>
> *"어느 컨테이너에서 난 오류인지 로그 봐서 추적해봐."*
>
> 로그를 열었더니 — 두 컨테이너의 로그가 시간 순으로 뒤섞여 나옵니다.

---

## Step 1. 기존 서비스 실행 확인

```bash title="터미널"
cd ~/hanbat-order-app
docker compose up -d
docker compose ps
```

```console title="출력"
NAME                       STATUS
hanbat-order-app-api-1     Up
hanbat-order-app-web-1     Up
```

---

## Step 2. docker compose가 만든 네트워크 확인

docker compose는 실행 시 자동으로 네트워크를 생성합니다. 이름을 확인합니다.

```bash title="터미널"
docker network ls | grep hanbat
```

```console title="출력"
hanbat-order-app_default   bridge
```

이 네트워크에 api-2를 연결해야 api-1과 같은 네트워크에서 동작합니다.

---

## Step 3. api 컨테이너를 하나 더 실행

포트 충돌 없이 8081 포트로 두 번째 api 컨테이너를 실행합니다.

```bash title="터미널"
docker run -d \
  --name api-2 \
  --network hanbat-order-app_default \
  -p 8081:8080 \
  skilleat/hanbat-order-api:v1.0.0
```

두 컨테이너가 모두 실행 중인지 확인합니다.

```bash title="터미널"
docker ps --filter "name=api"
```

```console title="출력"
NAMES                      PORTS
hanbat-order-app-api-1     0.0.0.0:8080->8080/tcp
api-2                      0.0.0.0:8081->8080/tcp
```

---

## Step 4. 각 컨테이너에 요청 보내기

```bash title="터미널"
# api-1 (8080)에 요청
for i in $(seq 1 5); do
  curl -s http://localhost:8080/orders > /dev/null
done

# api-2 (8081)에 요청
for i in $(seq 1 5); do
  curl -s http://localhost:8081/orders > /dev/null
done
```

---

## Step 5. 로그 확인 — 뒤섞임 체험

```bash title="터미널"
docker logs hanbat-order-app-api-1 &
docker logs api-2 &
```

두 컨테이너의 로그가 터미널에 동시에 출력되어 뒤섞입니다.

```console title="출력 예시 — 어느 컨테이너 로그인지 구분이 어렵습니다"
INFO:     172.18.0.1:54321 - "GET /orders HTTP/1.1" 200
INFO:     172.18.0.1:54400 - "GET /orders HTTP/1.1" 200
INFO:     172.18.0.1:54210 - "GET /orders HTTP/1.1" 500  ← 어느 컨테이너?
INFO:     172.18.0.1:54500 - "GET /orders HTTP/1.1" 200
INFO:     172.18.0.1:54610 - "GET /orders HTTP/1.1" 200
```

500 에러가 어느 컨테이너에서 발생했는지 로그만으로는 알 수 없습니다.

---

## Step 6. 컨테이너별로 따로 보기

그나마 컨테이너 이름을 지정하면 분리해서 볼 수 있습니다.

```bash title="터미널"
# api-1 로그만
docker logs hanbat-order-app-api-1

# api-2 로그만
docker logs api-2
```

그런데 실제 운영에서는:

- 컨테이너가 몇 개인지 매번 확인해야 함
- 각각 따로 열어봐야 함
- 로그를 한 곳에 모아서 검색하는 기능이 없음

<div class="pain-box">
<div class="pain-box-title">🔥 컨테이너가 늘어날수록 로그 추적이 더 어려워집니다</div>

컨테이너 1개일 때는 <code>docker logs</code> 하나면 됐습니다.<br>
3개, 5개로 늘어나면? 각각 열어서 비교해야 합니다.<br>
중앙 집중형 로그 수집 없이는 운영이 사실상 불가능합니다.
</div>

---

## Step 7. 컨테이너 제거 (정리)

!!! warning "반드시 이 순서대로 실행하세요"
    api-2가 네트워크에 연결된 상태에서 `docker compose down`을 하면 네트워크를 삭제하지 못해 이후 `docker compose up -d`가 실패합니다.
    **api-2를 먼저 제거한 뒤** compose를 내려야 합니다.

```bash title="터미널"
# 1. api-2 먼저 제거
docker rm -f api-2

# 2. 그 다음 compose 재시작
docker compose down && docker compose up -d
```

---

## 정리

| 항목 | docker-compose (단일 호스트) | ACA |
|------|----------------------------|-----|
| 로그 위치 | 컨테이너별 분산 | Azure Monitor에 중앙 집중 |
| 검색 | 불가 (grep 수동) | 쿼리 가능 |
| 컨테이너 증가 시 | 더 복잡해짐 | 자동 수집 |

!!! success "ACA에서는"
    모든 Replica의 로그가 Azure Monitor / Log Analytics로 자동 수집됩니다.
    컨테이너가 몇 개든 한 곳에서 검색하고 필터링할 수 있습니다.

---

<div class="nav-buttons">
<a href="../extra-b-healthcheck/" class="nav-btn">← 심화 B: 헬스체크</a>
<a href="../extra-d-env-hell/" class="nav-btn next">심화 D: 환경변수 지옥 →</a>
</div>
