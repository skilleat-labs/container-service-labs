<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 15분</span>

# 심화 D: 환경변수 지옥

## 시나리오

> v2 배포를 준비하면서 .env 파일을 수정했습니다.
>
> `docker compose up -d` — 컨테이너는 정상적으로 올라왔습니다.
>
> 그런데 브라우저에서 확인하니 화면이 이상합니다.
>
> *컨테이너가 뜨긴 떴는데, 뭔가 잘못됐습니다.*
>
> 이게 환경변수 지옥입니다 — 오류 메시지도 없고, 로그도 멀쩡한데 동작이 틀립니다.

---

## Step 1. 현재 .env 파일 확인

```bash title="터미널"
cd ~/hanbat-order-app
cat .env
```

```console title="출력"
APP_VERSION=1.0.0
API_HOST=api
API_PORT=8080
```

---

## Step 2. 환경변수를 잘못 수정해보기

실수로 `API_PORT`를 틀리게 입력합니다.

```bash title="터미널"
# API_PORT를 잘못된 값으로 변경
sed -i 's/API_PORT=8080/API_PORT=9090/' .env

cat .env
```

```console title="출력"
APP_VERSION=1.0.0
API_HOST=api
API_PORT=9090   ← 잘못된 값
```

---

## Step 3. 배포

```bash title="터미널"
docker compose down && docker compose up -d
```

```console title="출력"
[+] Running 2/2
 ✔ Container hanbat-order-app-api-1  Started
 ✔ Container hanbat-order-app-web-1  Started
```

컨테이너는 정상적으로 올라왔습니다.

---

## Step 4. 동작 확인

브라우저에서 `http://<VM_IP>:8000` 에 접속합니다.

주문 조회 화면이 열리지만 주문 목록이 표시되지 않거나 오류가 납니다.

```bash title="터미널"
# 로그 확인
docker compose logs web
```

```console title="출력"
web-1  | ... connect() failed (111: Connection refused) while connecting to upstream
web-1  | ... upstream: "http://api:9090/orders"
```

로그를 보면 `api:9090`으로 요청을 보내고 있습니다 — 잘못된 포트입니다.

<div class="pain-box">
<div class="pain-box-title">🔥 컨테이너는 멀쩡한데 동작이 이상한 상황</div>

<code>docker compose ps</code> — <strong>Up</strong> (정상처럼 보임)<br>
<code>docker compose logs</code> — 로그 보기 전까지 원인 파악 불가<br>
환경변수가 많아질수록 실수 가능성이 높아지고, 추적도 어려워집니다.
</div>

---

## Step 5. 원인 파악 및 복구

실행 중인 컨테이너에 어떤 환경변수가 주입됐는지 직접 확인합니다.

```bash title="터미널"
docker inspect hanbat-order-app-web-1 | grep -A 20 '"Env"'
```

```console title="출력"
"Env": [
    "API_HOST=api",
    "API_PORT=9090",   ← 잘못된 값 확인
    ...
]
```

.env 파일을 원래대로 복구합니다.

```bash title="터미널"
sed -i 's/API_PORT=9090/API_PORT=8080/' .env

docker compose down && docker compose up -d
```

브라우저에서 다시 확인합니다.

---

## 환경변수가 많아지면

실제 운영 환경에서는 .env 파일에 수십 개의 항목이 있습니다.

```
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
REDIS_HOST=...
REDIS_PORT=...
API_KEY=...
SECRET_KEY=...
...
```

배포할 때마다 이걸 직접 수정하고, 오타가 없는지 확인하고, 환경별(dev/staging/prod)로 다르게 관리해야 합니다.

<div class="pain-box">
<div class="pain-box-title">🔥 .env 파일 관리의 현실</div>

- 파일이 git에 올라가면 보안 사고
- 올리지 않으면 팀원과 공유가 어려움
- 환경별로 파일이 늘어나면 관리가 복잡해짐
- 잘못 넣어도 컨테이너는 정상 기동 — 원인 찾기가 어려움
</div>

---

## 정리

| 항목 | docker-compose (.env) | ACA |
|------|----------------------|-----|
| 환경변수 관리 | .env 파일 직접 편집 | Azure Portal / CLI로 설정 |
| 민감 정보 | .env 파일에 평문 저장 위험 | Azure Key Vault 연동 |
| 변경 이력 | 없음 | 감사 로그 자동 기록 |
| 실수 시 탐지 | 로그 직접 확인 | 배포 실패로 즉시 감지 |

!!! success "ACA에서는"
    환경변수를 Azure Portal에서 설정하고, 민감한 값은 Key Vault 참조로 안전하게 관리합니다.
    변경 이력이 자동으로 기록되어 누가 언제 바꿨는지 추적할 수 있습니다.

---

<div class="nav-buttons">
<a href="../extra-c-log-chaos/" class="nav-btn">← 심화 C: 로그 혼돈</a>
<a href="../../phase-3/" class="nav-btn next">Phase 3 · 첫 이관 →</a>
</div>
