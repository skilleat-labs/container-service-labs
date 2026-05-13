<span class="phase-badge">PHASE 1</span>
<span class="time-badge">예상 20분</span>

# 도전 과제: Docker Compose 트러블슈팅

## 시나리오

> 동료가 미니 블로그 서비스를 Docker Compose로 구성해두고 퇴근했습니다.
>
> *"실행만 하면 돼요, `docker compose up -d` 하면 됩니다."*
>
> 그런데 막상 실행해보니 브라우저에서 블로그가 열리지 않습니다.
> **로그를 보고 원인을 찾아 고쳐보세요.**

---

## 서비스 구조

```
브라우저
  ↓ (localhost:8080)
frontend (Nginx, 포트 80)
  ↓ /posts 요청을 프록시
backend (Flask, 포트 5000)
  ↓
data.json 저장
```

- frontend와 backend는 **사용자 정의 네트워크**로 통신
- frontend nginx는 `backend-service`라는 이름으로 backend를 찾음

---

## 주어진 docker-compose.yml

아래 파일을 그대로 사용해서 실행해보세요.

```yaml title="docker-compose.yml"
services:
  backend:
    image: skilleatlab.azurecr.io/backend:v4-kb5
    container_name: backend-api
    networks:
      - app-net

  frontend:
    image: skilleatlab.azurecr.io/frontend:v4-kb5
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks:
      - app-net

networks:
  app-net:
    driver: bridge
```

---

## Step 1. 일단 실행해보기

```bash title="터미널"
docker compose up -d
```

컨테이너가 뜨는지 확인합니다.

```bash title="터미널"
docker compose ps
```

---

## Step 2. 브라우저 접속

```
http://<VM_IP>:8080
```

정상적으로 보이지 않는다면 **로그를 확인**합니다.

---

## Step 3. 로그 확인

```bash title="터미널"
docker compose logs frontend
```

아래와 같은 오류 로그가 출력됩니다.

```console title="frontend 로그"
frontend-1  | 2024/01/01 00:00:00 [error] 7#7: *1 connect() failed (111: Connection refused)
frontend-1  |   while connecting to upstream,
frontend-1  |   client: 172.18.0.1, server: ,
frontend-1  |   request: "GET /posts HTTP/1.1",
frontend-1  |   upstream: "http://backend-service:5000/posts",
frontend-1  |   host: "192.168.56.10:8080"
frontend-1  | 2024/01/01 00:00:01 [error] 7#7: *1 no live upstreams while connecting to upstream
```

!!! question "로그에서 힌트를 찾으세요"
    - nginx가 어떤 이름으로 backend를 찾고 있나요?
    - 현재 docker-compose.yml에서 backend 컨테이너 이름은 무엇인가요?

---

## Step 4. 원인 파악 및 수정

로그와 docker-compose.yml을 비교해서 잘못된 부분을 찾고 고쳐보세요.

!!! tip "힌트"
    `docker compose logs`와 `docker compose ps` 명령으로 현재 상태를 충분히 파악한 뒤 수정하세요.

수정 후 재실행합니다.

```bash title="터미널"
docker compose down && docker compose up -d
```

---

## Step 5. 동작 확인

브라우저에서 `http://<VM_IP>:8080` 접속 후 글을 작성해봅니다.

**backend에 데이터가 저장됐는지 확인:**

```bash title="터미널"
docker exec -it backend-service sh
cat /app/data.json
exit
```

브라우저에서 작성한 내용이 JSON으로 출력되면 성공입니다.

---

## 정답 확인

??? success "정답 보기 (먼저 스스로 해결해보세요)"

    **문제 1 — container_name 오류**

    frontend nginx는 `backend-service`라는 이름으로 backend를 찾습니다.
    그런데 `container_name: backend-api`로 설정되어 있어 이름을 찾지 못합니다.

    ```yaml
    # 수정 전
    container_name: backend-api

    # 수정 후
    container_name: backend-service
    ```

    **수정된 docker-compose.yml:**

    ```yaml title="docker-compose.yml (수정 완료)"
    services:
      backend:
        image: skilleatlab.azurecr.io/backend:v4-kb5
        container_name: backend-service
        networks:
          - app-net

      frontend:
        image: skilleatlab.azurecr.io/frontend:v4-kb5
        ports:
          - "8080:80"
        depends_on:
          - backend
        networks:
          - app-net

    networks:
      app-net:
        driver: bridge
    ```

---

## 완료 기준

| 항목 | 확인 |
|------|------|
| 로그에서 오류 원인 직접 발견 | |
| docker-compose.yml 수정 완료 | |
| 브라우저에서 블로그 정상 접속 | |
| 글 작성 후 data.json 저장 확인 | |

---

<div class="nav-buttons">
<a href="../as-is-docker-compose/" class="nav-btn">← AS-IS 체험</a>
<a href="../../phase-2/" class="nav-btn next">Phase 2 · 고통 체험 →</a>
</div>
