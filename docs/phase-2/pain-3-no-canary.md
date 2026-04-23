<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 20분</span>

# 고통 3: 점진 배포 불가

## 시나리오

> 이번에 API v2가 나왔습니다. 개발팀이 조심스럽게 말합니다.
>
> *"이번 버전 좀 불안해요. 일단 20%만 먼저 배포해서 괜찮으면 100% 전환하면 어떨까요?"*
>
> 여러분은 생각합니다: *"docker-compose로... 그게 가능한가?"*

---

## 시도해보기

v1과 v2를 동시에 실행해봅니다.

```bash title="터미널"
# 터미널 A: v1 실행 중 (현재 상태)
docker compose ps
```

```console title="출력"
hanbat-order-app-api-1   skilleat/hanbat-order-api:v1.0.0   Up   0.0.0.0:8080->8080/tcp
hanbat-order-app-web-1   skilleat/hanbat-order-web:v1.0.0   Up   0.0.0.0:8000->80/tcp
```

v2를 8081 포트로 추가 실행해봅니다.

!!! warning "Azure NSG에서 포트 8081을 먼저 열어야 합니다"
    Azure Portal → VM → **네트워킹** → **인바운드 포트 규칙 추가**

    | 항목 | 값 |
    |------|-----|
    | 대상 포트 범위 | `8081` |
    | 프로토콜 | TCP |
    | 작업 | 허용 |
    | 이름 | `allow-8081` |

```bash title="터미널"
docker run -d \
  -e APP_VERSION=2.0.0 \
  -p 8081:8080 \
  skilleat/hanbat-order-api:v2.0.0
```

이제 v1(8080), v2(8081) 두 API가 동시에 뜨긴 합니다.

브라우저에서 각각 `/version`을 열어보면 다른 버전이 떠 있는 걸 직접 확인할 수 있습니다.

```
http://<VM_IP>:8080/version   → {"version": "1.0.0", ...}
http://<VM_IP>:8081/version   → {"version": "2.0.0", ...}
```

v1과 v2가 동시에 살아있습니다. 그런데...

<div class="pain-box">
<div class="pain-box-title">🔥 트래픽을 80:20으로 나눌 방법이 없습니다</div>

`API_URL`은 브라우저 JS에 주입되는 단순 문자열 하나입니다.
브라우저 JS는 이 주소 하나로만 API를 호출하므로, v1(8080)으로 100% 가거나 v2(8081)로 100% 가거나 — 둘 중 하나만 가능합니다.
80:20으로 나누려면 JS 코드 자체에 두 주소를 알고 비율대로 분배하는 로직이 있어야 합니다.
</div>

---

## 가능한 방법이 아예 없나?

nginx를 앞에 두면 가능은 합니다:

```nginx title="nginx 설정 예시"
upstream api_backend {
  server localhost:8080 weight=8;  # 80%
  server localhost:8081 weight=2;  # 20%
}
```

하지만 이렇게 하려면:

- nginx 설치 및 설정
- 비율 바꿀 때마다 설정 파일 수정 + nginx reload
- 버전별 모니터링, 롤백, 트래픽 기록 — 모두 수동

---

## Phase 2 총정리

| 고통 | 원인 | ACA 해결책 |
|------|------|-----------|
| 배포 시 000ERR 발생 | 컨테이너 재생성 중 연결 끊김 | Revision 기반 무중단 배포 |
| 스케일 불가 | 포트 고정으로 복수 실행 불가 | KEDA 자동 스케일 + 내장 LB |
| 점진 배포 불가 | 트래픽 비율 조절 기능 없음 | Traffic Split |

<div class="checkpoint">
<div class="checkpoint-title">✅ Phase 2 완료 체크리스트</div>

- [ ] 고통 1: 배포 중 000ERR 직접 목격 <br>
- [ ] 고통 2: `--scale api=3` 포트 충돌 확인 <br>
- [ ] 고통 3: 점진 배포 불가 확인 <br>
- [ ] 세 고통과 ACA 해결책 매핑 이해

</div>

---

<div class="nav-buttons">
<a href="../pain-2-scale-fail/" class="nav-btn">← 고통 2</a>
<a href="../../phase-3/" class="nav-btn next">Phase 3 · 첫 이관 →</a>
</div>
