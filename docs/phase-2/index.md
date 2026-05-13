<span class="phase-badge">PHASE 2</span>
<span class="time-badge">예상 60분</span>

# Phase 2 · 고통 체험

## 이 Phase에서 얻는 것

- docker-compose 방식의 한계를 직접 체험
- ACA가 해결하는 문제가 무엇인지 구체적으로 이해
- 기술 선택의 근거를 **경험**으로 습득

## Phase 2 구성

| 단계 | 내용 | 소요 시간 |
|------|------|-----------|
| [고통 1: 배포 지옥](pain-1-deploy-hell.md) | 배포 시 다운타임 직접 목격 | 20분 |
| [고통 2: 스케일 불가](pain-2-scale-fail.md) | 트래픽 급증 시 수동 스케일의 한계 | 20분 |
| [고통 3: 점진 배포 불가](pain-3-no-canary.md) | 20% 트래픽만 새 버전으로 보내기 불가 | 20분 |

### 심화 실습

| 단계 | 내용 | 소요 시간 |
|------|------|-----------|
| [심화 A: 롤백도 지옥이다](extra-a-rollback.md) | 롤백도 다운타임 — 배포도 롤백도 수동 | 15분 |
| [심화 B: 헬스체크 없는 배포](extra-b-healthcheck.md) | 컨테이너 Up ≠ 앱 준비 완료 | 15분 |
| [심화 C: 로그가 뒤섞인다](extra-c-log-chaos.md) | 컨테이너 늘수록 디버깅이 더 어려워짐 | 15분 |
| [심화 D: 환경변수 지옥](extra-d-env-hell.md) | 컨테이너는 뜨는데 동작이 이상함 | 15분 |

---

## 왜 이 Phase가 중요한가

<div class="pain-box">
<div class="pain-box-title">⚠️ 고통을 느껴야 해결책이 의미 있습니다</div>
ACA의 무중단 배포, 자동 확장, Traffic Split 기능은 그냥 외우는 것이 아닙니다.
직접 문제를 겪고 나서 "아, 이래서 이 기능이 필요했구나" 라는 순간을 만들기 위한 Phase입니다.
</div>

---

<div class="nav-buttons">
<a href="../phase-1/as-is-docker-compose/" class="nav-btn">← Phase 1 완료</a>
<a href="pain-1-deploy-hell/" class="nav-btn next">고통 1: 배포 지옥 →</a>
</div>
