<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 90분</span>

# Phase 4 · 고통 해소

## 이 Phase에서 얻는 것

- ACA의 Revision 기반 무중단 배포 직접 체험
- Traffic Split으로 카나리 배포 구현
- KEDA 자동 확장 설정 및 검증

## Phase 4 구성

| 단계 | 내용 | 소요 시간 |
|------|------|-----------|
| [무중단 배포](zero-downtime-deploy.md) | Multiple Revision + Traffic Split | 45분 |
| [자동 확장](auto-scale.md) | HTTP Scaler 설정 + 부하 테스트 | 45분 |

---

## Phase 2의 고통 vs Phase 4의 해결

| Phase 2 고통 | Phase 4 해결 |
|-------------|-------------|
| 배포 지옥 (다운타임) | Revision 기반 무중단 배포 |
| 점진 배포 불가 | Traffic Split (80:20) |
| 스케일 불가 | KEDA HTTP 자동 확장 |

---

<div class="nav-buttons">
<a href="../phase-3/web-deploy/" class="nav-btn">← Phase 3 완료</a>
<a href="zero-downtime-deploy/" class="nav-btn next">무중단 배포 →</a>
</div>
