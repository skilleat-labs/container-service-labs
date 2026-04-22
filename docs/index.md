<div class="hero-section" markdown>

# 한밭푸드 ACA 이관 실습

**Azure Container Apps 13시간 강의 · 학생용 실습 가이드**

대전의 중소기업 한밭푸드 인프라팀이 되어
모놀리식 서버를 클라우드로 옮기는 여정을 직접 체험합니다.

</div>

## 여러분은 지금 한밭푸드 인프라팀입니다

오늘 오전, 한밭푸드 CTO에게 메일 한 통이 왔습니다.

> *"주문 조회 API, 이번 달 안에 클라우드로 올려주세요. 배포할 때마다 서비스 끊기는 거, 더 이상 CS팀이 못 받겠다고 합니다."*

여러분의 팀은 인프라 담당 3명. Docker는 쓸 줄 알지만 Azure는 처음입니다.
자, 지금부터 13시간 동안 실제로 해봅시다.

---

## 6단계 여정

<div class="phase-timeline" markdown>

<div class="phase-card" markdown>
<span class="phase-num">PHASE 0</span>
<span class="phase-name">환경 세팅</span>
<span class="phase-time">30분</span>
</div>

<div class="phase-card" markdown>
<span class="phase-num">PHASE 1</span>
<span class="phase-name">AS-IS 체험</span>
<span class="phase-time">60분</span>
</div>

<div class="phase-card" markdown>
<span class="phase-num">PHASE 2</span>
<span class="phase-name">고통 체험</span>
<span class="phase-time">60분</span>
</div>

<div class="phase-card" markdown>
<span class="phase-num">PHASE 3</span>
<span class="phase-name">첫 이관</span>
<span class="phase-time">120분</span>
</div>

<div class="phase-card" markdown>
<span class="phase-num">PHASE 4</span>
<span class="phase-name">재경기</span>
<span class="phase-time">90분</span>
</div>

<div class="phase-card" markdown>
<span class="phase-num">PHASE 5</span>
<span class="phase-name">의사결정</span>
<span class="phase-time">30분</span>
</div>

</div>

---

## 시작 전 준비 체크리스트

강의 시작 전에 아래 항목을 모두 확인해주세요.

- [ ] 강사가 공유한 **VM IP 주소**와 **비밀번호** 확보
- [ ] SSH 클라이언트 준비 (Windows: PowerShell / Mac·Linux: Terminal)
- [ ] **Azure 계정** 생성 완료 (개인 계정 또는 강의 제공 계정)
- [ ] **Docker Hub 계정** 생성 완료 ([hub.docker.com](https://hub.docker.com))
- [ ] 브라우저 탭 열어두기: Azure Portal ([portal.azure.com](https://portal.azure.com))

!!! warning "Azure 계정 없이는 Phase 3부터 진행 불가"
    Phase 3부터는 Azure 리소스를 직접 생성합니다. 무료 체험 계정($200 크레딧)으로도 충분하지만, 계정 생성에 5~10분 소요되므로 사전에 준비해두세요.

---

## 실습 환경 개요

| 항목 | 내용 |
|------|------|
| 실습 VM | Ubuntu 22.04 LTS (강사 배포) |
| 사전 설치 | Docker, Docker Compose, Azure CLI, Git |
| Azure 리전 | Korea Central |
| 실습 앱 | 한밭푸드 주문 조회 시스템 (Web + API) |

---

## 지금 시작하기

<div class="nav-buttons">
<a href="scenario/" class="nav-btn next">한밭푸드 시나리오 보기 →</a>
</div>

또는 바로 실습으로:

<div class="nav-buttons">
<a href="phase-0/" class="nav-btn next">Phase 0 · 환경 세팅 시작하기 →</a>
</div>
