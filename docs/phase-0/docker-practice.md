<span class="phase-badge">PHASE 0</span>
<span class="time-badge">예상 90분</span>

# Docker 명령어 기초 실습

컨테이너 교육이 처음이라면 본 실습을 먼저 진행하세요.
볼륨, 네트워크, 컨테이너 간 통신까지 순서대로 익힙니다.

---

## 실습 전 확인사항

### Azure VM 공인 IP 확인

모든 실습은 강사에게 할당받은 **Azure VM**에서 진행합니다.
접속할 때는 본인에게 배정된 **공인 IP**를 사용하세요.

```bash title="터미널 — VM 접속"
ssh labuser@<본인_공인_IP>
```

### Azure NSG 인바운드 포트 설정

외부 브라우저에서 컨테이너에 접근하려면 Azure 포털에서 포트를 미리 열어야 합니다.

Azure Portal → VM → **네트워킹** → **인바운드 포트 규칙 추가**

| 항목 | 값 |
|------|-----|
| 원본 | My IP address |
| 대상 포트 범위 | 실습에서 사용할 포트 번호 |
| 프로토콜 | TCP |
| 작업 | 허용 |

!!! warning "포트를 열지 않으면 브라우저에서 접근이 되지 않습니다"
    컨테이너를 실행했는데 브라우저에서 연결이 안 된다면 NSG 인바운드 규칙을 먼저 확인하세요.

---

## 실습 1 · 볼륨

컨테이너가 삭제되어도 데이터가 남는 원리를 직접 확인합니다.
볼륨을 생성하고, 컨테이너에 마운트해서 데이터를 저장한 뒤 컨테이너를 지워도 데이터가 유지되는지 실습합니다.

<div style="margin: 1.2rem 0;">
  <a href="https://skilleat-labs.github.io/docker-k8s-labs/m8/modules/module8/1-2/#_3" target="_blank" style="display:inline-block; padding: 0.6rem 1.4rem; background:#1F5C99; color:#fff; border-radius:6px; text-decoration:none; font-weight:600;">
    실습 1 바로가기 →
  </a>
</div>

---

## 실습 2 · 네트워크

컨테이너끼리 이름으로 통신하는 원리를 익힙니다.
사용자 정의 네트워크를 만들고, 여러 컨테이너를 같은 네트워크에 연결해 서로 통신하는 실습을 진행합니다.

<div style="margin: 1.2rem 0;">
  <a href="https://skilleat-labs.github.io/docker-k8s-labs/m8/modules/module8/1-4/" target="_blank" style="display:inline-block; padding: 0.6rem 1.4rem; background:#1F5C99; color:#fff; border-radius:6px; text-decoration:none; font-weight:600;">
    실습 2 바로가기 →
  </a>
</div>

---

## 실습 3 · 미니 블로그 구성

볼륨과 네트워크를 모두 활용해 frontend + backend 구조의 미니 블로그를 docker run 명령으로 직접 구성합니다.

<div style="margin: 1.2rem 0;">
  <a href="https://skilleat-labs.github.io/docker-k8s-labs/m8/modules/module8/1-6/" target="_blank" style="display:inline-block; padding: 0.6rem 1.4rem; background:#1F5C99; color:#fff; border-radius:6px; text-decoration:none; font-weight:600;">
    실습 3 바로가기 →
  </a>
</div>

---

## 실습을 마쳤다면

세 실습을 완료했다면 Docker Compose 트러블슈팅 과제로 넘어가세요.

<div class="nav-buttons">
<a href="../environment-setup/" class="nav-btn">← 환경 세팅</a>
<a href="../troubleshooting-compose/" class="nav-btn next">도전 과제: 트러블슈팅 →</a>
</div>
