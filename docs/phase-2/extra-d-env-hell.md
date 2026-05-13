<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 15분</span>

# 심화 D: 환경변수 지옥

## 시나리오

> VM IP가 바뀌어서 `docker-compose.yml`의 `API_URL`을 수정했습니다.
>
> `docker compose up -d` — 컨테이너는 정상적으로 올라왔습니다.
>
> 그런데 브라우저에서 주문 목록이 보이지 않습니다.
>
> *컨테이너가 뜨긴 떴는데, 뭔가 잘못됐습니다.*
>
> 이게 환경변수 지옥입니다 — 오류 메시지도 없고, 로그도 멀쩡한데 동작이 틀립니다.

---

## Step 1. 현재 docker-compose.yml 확인

```bash title="터미널"
cd ~/hanbat-order-app
cat docker-compose.yml | grep API_URL
```

```console title="출력"
      - API_URL=http://<VM_IP>:8080
```

web 컨테이너가 브라우저에 전달하는 API 주소입니다. 포트가 `8080`이어야 합니다.

---

## Step 2. 환경변수를 잘못 수정해보기

실수로 포트를 `9090`으로 잘못 입력합니다.

```bash title="터미널"
sed -i 's/:8080/:9090/' docker-compose.yml
```

변경된 내용을 확인합니다.

```bash title="터미널"
cat docker-compose.yml | grep API_URL
```

```console title="출력"
      - API_URL=http://<VM_IP>:9090   ← 잘못된 포트
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

컨테이너는 아무 문제 없이 올라왔습니다.

---

## Step 4. 동작 확인

브라우저에서 `http://<VM_IP>:8000` 에 접속합니다.

화면은 열리지만 **주문 목록이 표시되지 않습니다.** 브라우저 개발자 도구(F12) → Console 탭을 열면 아래와 같은 오류가 보입니다.

```
Failed to fetch  http://<VM_IP>:9090/orders
```

`docker compose ps`로 확인하면 컨테이너는 멀쩡합니다.

```bash title="터미널"
docker compose ps
```

```console title="출력"
NAME                       STATUS
hanbat-order-app-api-1     Up (healthy)
hanbat-order-app-web-1     Up
```

<div class="pain-box">
<div class="pain-box-title">🔥 컨테이너는 멀쩡한데 동작이 이상한 상황</div>

<code>docker compose ps</code> — <strong>Up</strong> (정상처럼 보임)<br>
<code>docker compose logs</code>만 봐서는 원인이 바로 안 보임<br>
환경변수 값 하나가 틀렸을 뿐인데 원인을 찾는 데 시간이 걸립니다.
</div>

---

## Step 5. 원인 파악

실행 중인 컨테이너에 어떤 환경변수가 실제로 주입됐는지 확인합니다.

```bash title="터미널"
docker inspect hanbat-order-app-web-1 | grep API_URL
```

```console title="출력"
"API_URL=http://<VM_IP>:9090"   ← 잘못된 포트 확인
```

---

## Step 6. 복구

```bash title="터미널"
sed -i 's/:9090/:8080/' docker-compose.yml

docker compose down && docker compose up -d
```

브라우저에서 다시 확인합니다. 주문 목록이 정상적으로 표시되면 완료입니다.

---

## 환경변수가 많아지면

실제 운영 환경에서는 `docker-compose.yml`에 수십 개의 환경변수가 있습니다.

```
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
REDIS_HOST=...
API_KEY=...
SECRET_KEY=...
```

배포할 때마다 직접 수정하고, 오타가 없는지 확인하고, 환경별(dev/staging/prod)로 따로 관리해야 합니다.

<div class="pain-box">
<div class="pain-box-title">🔥 환경변수 직접 관리의 현실</div>

- 잘못 넣어도 컨테이너는 정상 기동 — 원인 찾기 어려움
- 민감한 값(API 키, 비밀번호)이 파일에 평문으로 저장됨
- 변경 이력이 없어 누가 언제 바꿨는지 알 수 없음
- 환경별로 파일이 늘어나면 관리가 점점 복잡해짐
</div>

---

## 정리

| 항목 | docker-compose | ACA |
|------|---------------|-----|
| 환경변수 관리 | 파일 직접 편집 | Azure Portal / CLI로 설정 |
| 민감 정보 | 파일에 평문 저장 위험 | Azure Key Vault 연동 |
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
