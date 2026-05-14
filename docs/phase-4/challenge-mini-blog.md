<span class="phase-badge">PHASE 3-2</span>
<span class="challenge-badge">도전 과제</span>

# 도전 과제: 미니 블로그 ACA 이관

## 과제 개요

Docker 기반으로 운영하던 **미니 블로그 서비스**를 ACA로 이관합니다.

이관 과정에서 **다중 replica 환경의 데이터 불일치 문제**를 직접 발견하고,
지금까지 배운 **Azure Files 볼륨**으로 스스로 해결해봅니다.

---

## 서비스 구조

```
사용자 브라우저
     ↓ (HTTPS)
frontend (Nginx) — ACA External Ingress
     ↓ (HTTP /posts)
backend (Flask) — ACA Internal Ingress
     ↓
/app/data.json 저장
```

- **frontend**: Nginx 기반 정적 페이지 서빙 + backend로 API 요청 프록시
- **backend**: Flask 기반 REST API, 게시글을 `data.json`에 저장/조회
- **두 컨테이너는 ACA 환경 내부 통신**으로 연결

---

## 사용 이미지

| 서비스 | Docker Hub 이미지 |
|--------|-------------------|
| frontend | `skilleat/frontend:v4-kb5` |
| backend | `skilleat/backend:v4-kb5` |

---

## 1단계. 이미지 ACR에 등록

Docker Hub 이미지를 본인의 ACR로 옮깁니다.

```bash
# ACR 로그인
az acr login --name <ACR이름>

# frontend
docker pull skilleat/frontend:v4-kb5
docker tag skilleat/frontend:v4-kb5 <ACR이름>.azurecr.io/mini-blog-frontend:v1
docker push <ACR이름>.azurecr.io/mini-blog-frontend:v1

# backend
docker pull skilleat/backend:v4-kb5
docker tag skilleat/backend:v4-kb5 <ACR이름>.azurecr.io/mini-blog-backend:v1
docker push <ACR이름>.azurecr.io/mini-blog-backend:v1
```

---

## 2단계. ACA에 backend 배포

| 항목 | 값 |
|------|-----|
| 앱 이름 | `backend-service` |
| 이미지 | `<ACR이름>.azurecr.io/mini-blog-backend:v1` |
| Ingress | **Internal** |
| 포트 | `5000` |
| 최소 replica | `2` |
| 최대 replica | `2` |

!!! tip "앱 이름이 곧 hostname"
    ACA 환경 내부에서는 **앱 이름이 hostname**이 됩니다.
    frontend 이미지는 `backend-service`라는 이름으로 backend를 찾도록 설정되어 있으므로
    반드시 앱 이름을 `backend-service`로 지정해야 합니다.

---

## 3단계. ACA에 frontend 배포

| 항목 | 값 |
|------|-----|
| 앱 이름 | `mini-blog-web` |
| 이미지 | `<ACR이름>.azurecr.io/mini-blog-frontend:v1` |
| Ingress | **External** |
| 포트 | `80` |

---

## 4단계. 동작 확인

1. `mini-blog-web`의 외부 URL로 브라우저 접속
2. 글 작성 폼에 제목과 내용 입력 → 등록
3. 등록한 글이 화면에 출력되는지 확인

---

## 5단계. 문제 발견 — 데이터가 사라진다?

여러 번 글을 작성하면서 브라우저를 **새로고침**해봅니다.

글이 **나타났다 사라졌다** 하는 현상이 발생합니까?

!!! question "왜 이런 현상이 발생할까요?"
    backend가 **2개의 replica**로 실행 중입니다.
    각 replica는 각자의 `/app/data.json`을 갖고 있습니다.
    요청이 replica A에 도달하면 A의 데이터, replica B에 도달하면 B의 데이터가 반환됩니다.

    ```
    요청 1 → replica A → data.json (글 3개)
    요청 2 → replica B → data.json (글 1개)  ← 다른 데이터!
    ```

---

## 6단계. 볼륨으로 해결

지금까지 배운 Azure Files 볼륨을 활용해서 이 문제를 해결합니다.

모든 replica가 **동일한 파일 공유**를 바라보면 데이터가 일치합니다.

```
replica A ─┐
           ├─→ Azure Files (data.json) ← 하나의 파일 공유
replica B ─┘
```

**힌트:**

- backend 컨테이너 내부 콘솔에서 `data.json`이 어느 경로에 저장되는지 확인하세요
- 해당 경로에 Azure Files 볼륨을 마운트하면 됩니다
- Step 1~4(Storage 생성 → File Share → 환경 등록 → 볼륨 마운트)는 본문 실습과 동일합니다

---

## 완료 기준

| 항목 | 확인 |
|------|------|
| Docker Hub 이미지를 ACR에 push 완료 | ☐ |
| `backend-service` (Internal, 2 replica) 배포 완료 | ☐ |
| `mini-blog-web` (External) 배포 완료 | ☐ |
| 브라우저에서 글 작성 및 출력 확인 | ☐ |
| 새로고침 시 데이터 불일치 현상 발견 | ☐ |
| Azure Files 볼륨 마운트 후 데이터 일치 확인 | ☐ |

---

<div class="nav-buttons">
<a href="auto-scale/" class="nav-btn">← 자동 확장</a>
<a href="../phase-5/" class="nav-btn next">Phase 5 →</a>
</div>
