<span class="phase-badge">PHASE 3-2</span>

# Phase 3-2 · 스토리지 & 볼륨

ACA에 앱을 배포했습니다. 그런데 데이터는 어디에 저장되나요?

컨테이너는 기본적으로 **Stateless(무상태)** 입니다.
재시작하거나 새 Revision이 배포되면 컨테이너 내부 파일은 사라집니다.

이 단계에서는 **Azure Files 볼륨**을 사용해 데이터를 영속적으로 저장하는 방법을 배웁니다.

---

## 이 단계에서 배울 것

- 컨테이너가 Stateless인 이유와 볼륨이 필요한 상황
- ACA에서 지원하는 볼륨 종류
- Azure Files 볼륨 마운트 실습

---

## 볼륨이 필요한 상황

| 상황 | 볼륨 필요 여부 |
|------|--------------|
| API 서버 (DB는 외부) | ❌ 불필요 |
| 파일 업로드 서버 | ✅ 필요 |
| SQLite 사용 앱 | ✅ 필요 |
| 로그 영구 보관 | ✅ 필요 |
| 설정 파일 공유 | ✅ 필요 |

---

## ACA 볼륨 종류

| 종류 | 설명 | 용도 |
|------|------|------|
| **Azure Files** | Azure Storage File Share 마운트 | DB 파일, 업로드, 로그 영구 보관 |
| **Ephemeral** | 컨테이너 그룹 내 임시 공유 | 같은 앱의 컨테이너 간 파일 공유 |
| **Secret** | Kubernetes Secret 방식 | 인증서, 키 파일 마운트 |

---

<div class="nav-buttons">
<a href="../phase-3/web-deploy/" class="nav-btn">← Web 앱 배포</a>
<a href="volume/" class="nav-btn next">볼륨 실습 →</a>
</div>
