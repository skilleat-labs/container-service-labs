<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 10분</span>

# 자동 재시작 (Auto Restart)

컨테이너가 예기치 않게 종료되면 ACA는 자동으로 재시작합니다.
이 실습에서는 컨테이너를 직접 강제 종료하고, ACA가 스스로 복구하는 과정을 눈으로 확인합니다.

---

## Step 1. 모니터링 준비

브라우저에서 **hanbat-web** 을 열어둡니다.
컨테이너가 죽는 순간 화면이 어떻게 변하는지 바로 확인하기 위해서입니다.

---

## Step 2. 컨테이너 강제 종료

1. Portal → **hanbat-api** → **모니터링 > 콘솔 (Console)**
2. 시작 명령을 **`/bin/bash`** 로 변경 후 **연결**

!!! warning "sh가 아닌 bash로 연결"
    기본 `sh` 쉘에는 `kill` 명령이 없습니다.
    반드시 `/bin/bash`로 연결해야 합니다.

3. 콘솔에서 PID 1 강제 종료:

```bash title="콘솔 (bash)"
kill 1
```

콘솔 연결이 즉시 끊기면 컨테이너가 종료된 것입니다.

---

## Step 3. 웹 브라우저에서 확인

브라우저에서 **hanbat-web** 을 새로고침합니다.

- 페이지가 로딩 중 상태(🔄)로 바뀌며 연결을 계속 시도합니다
- 잠시 후 — ACA가 자동으로 컨테이너를 재시작하면 — 페이지가 정상적으로 돌아옵니다

---

## Step 4. 재시작 횟수 확인

Portal에서 자동 재시작이 일어난 것을 확인합니다.

1. Portal → **hanbat-api** → **수정 버전 관리 (Revisions and replicas)**
2. 현재 revision 클릭 → 패널 하단 **복제본 (Replicas)** 확인
3. **다시 시작** 횟수가 1 이상이면 자동 재시작 성공

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
브라우저가 로딩 중 상태에서 자동으로 복구됐나요?<br>
복제본의 <strong>다시 시작 횟수</strong>가 증가했나요?
</div>

---

## Phase 2와 비교

| 항목 | Phase 2 (Docker Compose) | Phase 4 (ACA) |
|------|--------------------------|---------------|
| 컨테이너 종료 시 | 수동으로 `docker start` 필요 | 자동 재시작 |
| 복구 개입 | 운영자가 직접 대응 | ACA가 자동 처리 |
| 다운타임 | 운영자가 인지할 때까지 지속 | 수십 초 이내 복구 |

---

<div class="nav-buttons">
<a href="log-stream/" class="nav-btn">← 로그 스트림</a>
<a href="auto-scale/" class="nav-btn next">자동 확장 →</a>
</div>
