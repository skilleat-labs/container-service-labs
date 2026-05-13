<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 15분</span>

# 심화 B: 컨테이너는 떴는데 앱은 아직 준비 중

## 시나리오

> 배포 직후 모니터링 화면에서 컨테이너 상태가 `Up`으로 바뀌었습니다.
>
> 안심하고 공지를 올렸는데 — 고객 CS가 들어옵니다.
>
> *"방금 접속했더니 오류가 났어요."*
>
> 컨테이너는 떴지만, **앱이 실제로 요청을 받을 준비가 됐는지는 별개의 문제**입니다.

---

## Docker가 "컨테이너 시작"을 판단하는 기준

Docker는 컨테이너 내부 **프로세스가 실행됐는지**만 확인합니다.
앱이 HTTP 요청을 처리할 수 있는 상태인지는 알지 못합니다.

```
컨테이너 시작 순서:

  [프로세스 실행]  →  Docker: "Up 상태"로 표시
        ↓
  [포트 바인딩]
        ↓
  [앱 초기화 (DB 연결, 설정 로드 등)]
        ↓
  [실제로 요청 처리 가능한 상태]   ← 이 시점이 진짜 "준비 완료"
```

Docker는 맨 위 단계만 보고 `Up`이라고 표시합니다.

---

## Step 1. 배포 직후 응답 확인

v2를 배포하고, **컨테이너가 시작되자마자 즉시** 요청을 보냅니다.

```bash title="터미널"
cd ~/hanbat-order-app

# 배포와 동시에 즉시 요청 반복
docker compose -f docker-compose.yml -f docker-compose.v2.yml up -d & \
for i in $(seq 1 10); do
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" --max-time 1 http://localhost:8080/health 2>/dev/null || echo "ERR")
  echo "$(date +%H:%M:%S)  $RESULT"
  sleep 0.3
done
```

```console title="출력 예시"
01:20:01  ERR   ← 아직 준비 안 됨
01:20:01  ERR
01:20:02  ERR
01:20:02  200   ← 이 시점부터 실제로 응답 가능
01:20:03  200
```

`docker compose ps`는 이미 `Up`으로 표시되어 있지만, 실제 요청은 잠깐 실패합니다.

---

## Step 2. healthcheck 추가해보기

`healthcheck`를 설정하면 Docker가 앱의 실제 준비 상태를 주기적으로 확인합니다.

```yaml title="docker-compose.yml에 healthcheck 추가"
services:
  api:
    image: skilleat/hanbat-order-api:v1.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 5s      # 5초마다 확인
      timeout: 3s       # 3초 안에 응답 없으면 실패
      retries: 3        # 3번 연속 실패하면 unhealthy
      start_period: 10s # 시작 후 10초는 유예
```

설정 후 `docker compose up -d` 하면 `docker compose ps`에서 상태가 달라집니다.

```console title="healthcheck 적용 전"
NAME   STATUS
api-1  Up 5 seconds
```

```console title="healthcheck 적용 후"
NAME   STATUS
api-1  Up 5 seconds (health: starting)   ← 준비 중
api-1  Up 20 seconds (healthy)           ← 이제 진짜 준비 완료
```

<div class="pain-box">
<div class="pain-box-title">🔥 healthcheck가 없으면</div>

Docker는 컨테이너가 `Up` 상태만 되면 바로 트래픽을 받습니다.<br>
앱이 초기화되는 1~3초 사이에 들어온 요청은 그대로 실패합니다.<br>
로드밸런서가 있다면 <code>healthy</code> 상태가 된 후에만 트래픽을 보낼 수 있지만,<br>
docker-compose에는 로드밸런서가 없습니다.
</div>

---

## 정리

| 항목 | Docker (healthcheck 없음) | healthcheck 적용 |
|------|--------------------------|-----------------|
| 준비 판단 기준 | 프로세스 실행 여부 | 실제 HTTP 응답 여부 |
| 트래픽 전환 시점 | 컨테이너 시작 즉시 | healthy 확인 후 |
| 초기 요청 실패 가능성 | 있음 | 없음 |

!!! success "ACA에서는"
    Startup Probe / Readiness Probe가 기본 제공됩니다.
    앱이 실제로 요청을 받을 수 있는 상태가 된 후에만 트래픽이 전달됩니다.

---

<div class="nav-buttons">
<a href="../extra-a-rollback/" class="nav-btn">← 심화 A: 롤백 지옥</a>
<a href="../extra-c-log-chaos/" class="nav-btn next">심화 C: 로그 혼돈 →</a>
</div>
