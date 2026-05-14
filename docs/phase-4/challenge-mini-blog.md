<span class="phase-badge">PHASE 4</span>
<span class="challenge-badge">도전 과제</span>

# 도전 과제: 미니 블로그 ACA 이관

## 과제 개요

Docker 기반으로 운영하던 미니 블로그 서비스를 ACA로 이관합니다.
이관 후 replica를 늘리면서 발생하는 **데이터 불일치 문제를 직접 발견**하고,
지금까지 배운 내용을 총동원해서 **스스로 해결**합니다.

---

## 서비스 구조

미니 블로그는 **두 개의 컨테이너**로 구성되어 있습니다.

```
브라우저
  ↓ https://<ACA 외부 URL>
frontend (Nginx)
  — 정적 페이지를 서빙
  — 글 작성/조회 요청을 backend로 프록시
  ↓ http://backend-service:5000
backend (Flask)
  — REST API 처리
  — 게시글을 /app/data.json 파일에 저장/조회
```

| 컨테이너 | 역할 | 내부 포트 |
|----------|------|-----------|
| frontend | Nginx — 페이지 서빙 + API 프록시 | 80 |
| backend | Flask — REST API + 데이터 저장 | 5000 |

!!! info "통신 방식"
    frontend는 `http://backend-service:5000` 으로 backend를 호출합니다.
    ACA 환경 내부에서는 **앱 이름이 곧 hostname**이 되므로,
    backend의 ACA 앱 이름은 반드시 `backend-service`여야 합니다.

---

## 사용 이미지

| 서비스 | Docker Hub |
|--------|------------|
| frontend | `skilleat/frontend:v4-kb5` |
| backend | `skilleat/backend:v4-kb5` |

---

## 과제 1. 이미지 ACR 등록

Docker Hub에서 이미지를 가져와 본인의 ACR에 등록합니다.

**요구 조건**

- `skilleat/frontend:v4-kb5` → 본인 ACR에 push
- `skilleat/backend:v4-kb5` → 본인 ACR에 push

---

## 과제 2. ACA 배포

아래 조건을 만족하도록 두 앱을 ACA에 배포합니다.

**backend**

| 조건 | 값 |
|------|-----|
| 앱 이름 | `backend-service` |
| Ingress | Internal |
| 포트 | `5000` |
| replica | `1` (우선 1개로 시작) |

**frontend**

| 조건 | 값 |
|------|-----|
| Ingress | External |
| 포트 | `80` |

---

## 과제 3. 동작 확인 및 문제 발견

frontend 외부 URL로 브라우저에 접속해서 글을 작성합니다.

글이 정상적으로 등록되고 화면에 출력되는지 확인합니다.

**이제 backend replica를 2개로 늘려보세요.**

replica를 늘린 뒤 글을 여러 건 작성하고 브라우저를 **반복해서 새로고침**합니다.

!!! question "어떤 현상이 발생하나요?"
    작성한 글이 새로고침할 때마다 나타났다 사라졌다 합니다.
    왜 이런 현상이 발생하는지 생각해보세요.

---

## 과제 4. 볼륨으로 문제 해결

발견한 문제를 **Azure Files 볼륨**으로 해결합니다.

**요구 조건**

- 모든 replica가 동일한 `data.json`을 바라보도록 구성
- 볼륨 마운트 후 replica 2개 상태에서 글을 작성해도 새로고침 시 데이터가 유지될 것

---

## 완료 기준

| 항목 | 확인 |
|------|------|
| Docker Hub 이미지를 ACR에 push 완료 | ☐ |
| `backend-service` (Internal, 포트 5000) 배포 완료 | ☐ |
| `frontend` (External, 포트 80) 배포 완료 | ☐ |
| 브라우저에서 글 작성 및 출력 확인 | ☐ |
| replica 2개 상태에서 데이터 불일치 현상 발견 | ☐ |
| Azure Files 볼륨 마운트 후 데이터 일치 확인 | ☐ |

---

<div class="nav-buttons">
<a href="auto-scale/" class="nav-btn">← 자동 확장</a>
<a href="../phase-5/" class="nav-btn next">Phase 5 →</a>
</div>
