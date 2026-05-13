<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 15분</span>

# 심화 B: depends_on만으로는 부족하다

## 시나리오

> 배포 직후 모니터링 화면에서 두 컨테이너 모두 `Up` 상태로 바뀌었습니다.
>
> 안심하고 브라우저를 열었는데 — 주문 조회가 안 됩니다.
>
> `docker compose ps`를 보면 분명히 다 떠 있는데, 왜 안 될까요?

---

## DEPLOY_HELL_MODE란?

`docker-compose.yml`을 열어보면 이런 주석이 있습니다.

```yaml
environment:
  # - DEPLOY_HELL_MODE=true   # 시작 후 10초간 503
  # - SLOW_MODE=true          # 모든 응답 500ms 지연
```

이 모드들은 **일부러 심어둔 교육용 장치**입니다.

실제 운영 환경에서는 앱이 시작될 때 DB 연결, 설정 로드, 캐시 워밍 등 초기화 작업이 필요해서 **컨테이너가 시작돼도 잠깐 요청을 못 받는 상황**이 자연스럽게 발생합니다. 실습 환경에서는 이 상황이 우연히 안 생길 수도 있으니, 환경변수 하나로 **언제든 재현할 수 있게** 만들어둔 것입니다. 기본값은 주석(`#`)으로 꺼져 있습니다.

---

## depends_on의 진짜 의미

현재 `docker-compose.yml`에는 이렇게 설정되어 있습니다.

```yaml
web:
  depends_on:
    - api
```

이 설정의 의미는 딱 하나입니다.

> **"api 컨테이너가 시작되면 web 컨테이너를 시작해라"**

api **앱**이 실제로 요청을 받을 준비가 됐는지는 전혀 확인하지 않습니다.

```
depends_on이 보는 것:   [api 프로세스 실행됨] → web 시작 ✅
depends_on이 모르는 것: [api 앱 초기화 중...] → 요청 실패 ❌
```

---

## Step 1. DEPLOY_HELL_MODE 활성화

```bash title="터미널"
cd ~/hanbat-order-app
```

`docker-compose.yml`에서 주석을 해제합니다.

```bash title="터미널"
sed -i 's/# - DEPLOY_HELL_MODE=true/- DEPLOY_HELL_MODE=true/' docker-compose.yml
```

확인합니다.

```bash title="터미널"
grep DEPLOY_HELL_MODE docker-compose.yml
```

```console title="출력"
      - DEPLOY_HELL_MODE=true
```

---

## Step 2. 재배포 후 즉시 브라우저 접속

```bash title="터미널"
docker compose down && docker compose up -d
```

컨테이너가 뜨는 즉시 브라우저에서 접속합니다.

```
http://<VM_IP>:8000
```

주문 조회가 실패하거나 오류가 납니다.

```bash title="터미널"
docker compose ps
```

```console title="출력"
NAME                       STATUS
hanbat-order-app-api-1     Up 3 seconds (health: starting)
hanbat-order-app-web-1     Up 2 seconds
```

web은 api가 **시작만 되자마자** 떴습니다. api 앱은 아직 초기화 중(`health: starting`)인데도요.

---

## Step 3. 10초 후 다시 확인

10초가 지나면 api가 정상 응답을 시작합니다. 브라우저를 새로고침하면 주문 목록이 나타납니다.

```bash title="터미널"
docker compose ps
```

```console title="출력"
NAME                       STATUS
hanbat-order-app-api-1     Up 15 seconds (healthy)
hanbat-order-app-web-1     Up 14 seconds
```

<div class="pain-box">
<div class="pain-box-title">🔥 컨테이너는 Up인데 서비스는 안 되는 상황</div>

<code>docker compose ps</code>는 정상으로 보였지만 실제 사용자는 10초간 오류를 봤습니다.<br>
<code>depends_on</code>만으로는 앱의 준비 상태를 보장할 수 없습니다.
</div>

---

## 해결 방법 — condition: service_healthy

`depends_on`에 조건을 추가하면 api가 실제로 준비된 후에 web이 뜹니다.

```yaml title="docker-compose.yml"
web:
  depends_on:
    api:
      condition: service_healthy   # api가 healthy 상태가 될 때까지 web 시작 대기
```

하지만 이것도 **수동으로 설정해야 하는 항목**이고, 설정을 빠뜨리면 그냥 모르고 지나갑니다.

---

## Step 4. 원상 복구

```bash title="터미널"
sed -i 's/- DEPLOY_HELL_MODE=true/# - DEPLOY_HELL_MODE=true/' docker-compose.yml
docker compose down && docker compose up -d
```

---

## 정리

| 항목 | depends_on (기본) | condition: service_healthy |
|------|-------------------|---------------------------|
| 확인 기준 | 컨테이너 프로세스 시작 | 앱 healthcheck 통과 |
| 앱 준비 보장 | ❌ | ✅ |
| 설정 난이도 | 쉬움 | 수동 설정 필요 |

!!! success "ACA에서는"
    Startup Probe가 기본 제공됩니다. 앱이 실제로 준비된 후에만 트래픽이 전달되며, 별도 설정 없이도 플랫폼이 자동으로 처리합니다.

---

<div class="nav-buttons">
<a href="../extra-a-rollback/" class="nav-btn">← 심화 A: 롤백 지옥</a>
<a href="../extra-c-log-chaos/" class="nav-btn next">심화 C: 로그 혼돈 →</a>
</div>
