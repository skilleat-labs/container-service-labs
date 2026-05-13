<span class="phase-badge">PHASE 0</span>
<span class="time-badge">예상 20분</span>

# 도전 과제: Docker Compose 트러블슈팅

## 시나리오

> 동료가 미니 블로그 서비스를 Docker Compose로 구성해두고 퇴근했습니다.
>
> *"실행만 하면 돼요, `docker compose up -d` 하면 됩니다."*
>
> 그런데 막상 실행해보니 브라우저에서 블로그가 열리지 않습니다.
> **원인을 찾아 고쳐보세요.**

---

## 주어진 docker-compose.yml

```yaml title="docker-compose.yml"
services:
  backend:
    image: skilleatlab.azurecr.io/backend:v4-kb5
    container_name: backend-api

  frontend:
    image: skilleatlab.azurecr.io/frontend:v4-kb5
    ports:
      - "8080:8080"
    depends_on:
      - backend
    networks:
      - app-net

networks:
  app-net:
    driver: bridge
```

---

## 실행

```bash title="터미널"
docker compose up -d
```

브라우저에서 `http://<VM_IP>:8080` 에 접속해보세요.

정상 동작하면 글을 작성하고, backend 컨테이너 내부에서 `/app/data.json`이 저장되었는지 확인하면 완료입니다.

---


<div class="nav-buttons">
<a href="../environment-setup/" class="nav-btn">← 환경 세팅</a>
<a href="../../phase-1/" class="nav-btn next">Phase 1 · AS-IS 체험 →</a>
</div>
