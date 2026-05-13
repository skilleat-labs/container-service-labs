<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 15분</span>

# 심화 A: 롤백도 지옥이다

## 시나리오

> v2 배포 후 고객 CS가 폭주합니다.
>
> *"배송 추적이 이상해요!", "주문 내역이 안 보여요!"*
>
> 김팀장: "빨리 v1으로 되돌려!"
>
> 배포가 지옥이었다면, 롤백도 지옥입니다.

---

## Step 1. v2 배포 (문제 상황 만들기)

먼저 v2를 배포해서 "문제가 생긴 상황"을 만듭니다.

```bash title="터미널"
cd ~/hanbat-order-app
docker compose -f docker-compose.yml -f docker-compose.v2.yml up -d
```

```bash title="터미널"
docker compose ps
```

v2가 올라와 있는지 확인합니다.

```bash title="터미널"
curl -s http://localhost:8080/version | python3 -m json.tool
```

```console title="출력"
{
    "version": "2.0.0",
    ...
}
```

---

## Step 2. 롤백 시도 — 브라우저를 새로고침하면서 실행

브라우저에서 `http://<VM_IP>:8000` 을 열어두고, **F5를 반복**하면서 아래 명령을 실행합니다.

```bash title="터미널"
docker compose down && docker compose up -d
```

<div class="pain-box">
<div class="pain-box-title">🔥 롤백 중에도 다운타임이 발생합니다</div>

<code>docker compose down</code> 으로 컨테이너가 내려가는 순간부터<br>
<code>docker compose up -d</code> 로 v1이 다시 뜰 때까지 — 또 서비스 중단입니다.<br><br>
배포도 다운타임, 롤백도 다운타임.
</div>

---

## Step 3. 다운타임 직접 측정

터미널을 **두 개** 열어서 진행합니다. 하나는 모니터링, 하나는 롤백 명령입니다.

!!! tip "터미널 추가 접속 방법"
    현재 SSH 창을 유지한 채로, **새 터미널 창을 열어 VM에 다시 SSH 접속**합니다.

    ```bash title="새 터미널 창"
    ssh labuser@<VM_공인_IP>
    ```

**터미널 A — 모니터링 실행 (먼저 실행)**

```bash title="터미널 A"
for i in $(seq 1 20); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:8080/health 2>/dev/null || echo "ERR")
  echo "$(date +%H:%M:%S)  $STATUS"
  sleep 0.5
done
```

**터미널 B — 롤백 명령 실행**

터미널 A에서 `200` 응답이 나오는 것을 확인한 뒤 실행합니다.

```bash title="터미널 B"
cd ~/hanbat-order-app
docker compose down && docker compose up -d
```

```console title="출력 예시"
01:10:01  200
01:10:02  200
01:10:02  ERR   ← down 시작
01:10:03  ERR
01:10:04  ERR
01:10:05  ERR   ← up 완료까지 약 3~5초
01:10:06  200   ← 복구
```

---

## 정리

| 작업 | 다운타임 |
|------|----------|
| v1 → v2 배포 | 발생 (2~3초) |
| v2 → v1 롤백 | 동일하게 발생 |
| 장애 감지 → 롤백 결정 → 실행 | 수동, 수 분 소요 가능 |

배포와 롤백 모두 수동이고 모두 다운타임이 발생합니다.

!!! success "ACA에서는"
    Revision 전환은 트래픽 비율만 바꾸면 됩니다. v1 Revision이 살아있는 상태에서 트래픽을 100% 되돌리면 — **다운타임 0초**.

---

<div class="nav-buttons">
<a href="../pain-1-deploy-hell/" class="nav-btn">← 고통 1: 배포 지옥</a>
<a href="../extra-b-healthcheck/" class="nav-btn next">심화 B: 헬스체크 →</a>
</div>
