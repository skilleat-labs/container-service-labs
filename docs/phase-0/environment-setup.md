<span class="phase-badge">PHASE 0</span>
<span class="time-badge">예상 30분</span>

# 환경 세팅

---

!!! info "강사 사전 준비 (학생은 건너뛰세요)"
    강의 시작 전 강사가 아래 작업을 완료해야 합니다.

    **1. 학생 계정 생성 (Microsoft Entra ID)**

    Azure Portal → **Microsoft Entra ID** → **사용자** → **+ 새 사용자 만들기**

    | 항목 | 예시 |
    |------|------|
    | 사용자 이름 | `test01@<강사_테넌트>.onmicrosoft.com` |
    | 이름 | Test 01 |
    | 비밀번호 | 초기 비밀번호 설정 후 학생에게 전달 |

    학생 수만큼 반복 생성합니다.

    **2. 구독 권한 부여**

    Azure Portal → **구독** → **액세스 제어(IAM)** → **+ 역할 할당**

    | 항목 | 값 |
    |------|-----|
    | 역할 | `기여자 (Contributor)` |
    | 대상 | 생성한 학생 계정 |

    학생별로 **별도 리소스 그룹**을 미리 만들고 해당 그룹에만 Contributor를 부여하면 계정 간 간섭을 막을 수 있습니다.

    **3. 학생에게 전달할 정보**

    - Azure 로그인 계정 (이메일 + 초기 비밀번호)
    - 사용할 리소스 그룹 이름 (예: `hanbat-rg-test01`)
    - 지역: `Korea Central`

---

## Step 1. Azure Portal 로그인

강사에게 받은 계정 정보로 Azure Portal에 로그인합니다.

```console title="브라우저 주소창"
https://portal.azure.com
```

처음 로그인 시 비밀번호 변경을 요구합니다. 새 비밀번호로 변경한 후 계속하세요.

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
우측 상단에 본인 계정 이름이 표시되고, 대시보드가 보이면 로그인 성공입니다.
</div>

---

## Step 2. VM 생성

### 기본 사항

Azure Portal 검색창에 **가상 머신**을 검색하고 **+ 만들기** → **Azure 가상 머신**을 클릭합니다.

**기본 사항** 탭에서 아래와 같이 입력합니다.

| 항목 | 값 |
|------|-----|
| 구독 | 강사가 안내한 구독 선택 |
| 리소스 그룹 | 강사가 배정한 리소스 그룹 (예: `hanbat-rg-test01`) |
| 가상 머신 이름 | `hanbat-lab-vm` |
| 지역 | **(Asia Pacific) Korea Central** |
| 가용성 옵션 | 인프라 중복 필요 없음 |
| 이미지 | **Ubuntu Server 22.04 LTS - x64 Gen2** (또는 24.04 LTS) |
| 크기 | **Standard_B2s** (2 vCPU, 4GiB) |

!!! warning "표에 없는 항목은 기본값 유지"
    위 표에 명시되지 않은 항목은 **모두 기본값으로 두고 변경하지 마세요.**

**관리자 계정** 섹션:

| 항목 | 값 |
|------|-----|
| 인증 형식 | **암호** |
| 사용자 이름 | `labuser` |
| 암호 | 본인이 기억할 수 있는 비밀번호 설정 |

!!! tip "이미지 버전"
    목록에서 22.04가 바로 보이지 않으면 24.04 LTS를 선택해도 됩니다. User Data 스크립트는 두 버전 모두 동일하게 동작합니다.

!!! warning "사용자 이름은 반드시 `labuser`"
    아래 User Data 스크립트가 `labuser` 계정을 기준으로 설정됩니다. 다른 이름을 사용하면 스크립트가 올바르게 동작하지 않습니다.

---

### 네트워킹

**네트워킹** 탭에서 인바운드 포트를 설정합니다.

| 항목 | 값 |
|------|-----|
| 공용 인바운드 포트 | **선택한 포트 허용** |
| 인바운드 포트 선택 | `SSH (22)` 선택 |

!!! info "8000 / 8080 포트는 나중에 추가"
    VM 생성 후 네트워크 보안 그룹(NSG)에서 추가합니다. 지금은 SSH(22)만 열어도 됩니다.

---

### 고급 — User Data 스크립트

**고급** 탭을 클릭하고, **User Data** 필드에 아래 스크립트를 붙여넣습니다.

```bash title="User Data 스크립트"
#!/bin/bash
set -e

# install dependencies
apt-get update -y
apt-get install -y ca-certificates curl gnupg git

# add Docker official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# add Docker apt repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# install Docker Engine + Compose plugin
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# add labuser to docker group
usermod -aG docker labuser

# enable Docker service
systemctl enable docker
systemctl start docker

# clone lab source
git clone https://github.com/skilleat-labs/hanbat-order-app.git /home/labuser/hanbat-order-app
chown -R labuser:labuser /home/labuser/hanbat-order-app
```


---

### 검토 + 만들기

**검토 + 만들기** 탭에서 설정을 확인하고 **만들기**를 클릭합니다.

VM 프로비저닝 완료까지 **2~3분** 소요됩니다.

---

## Step 3. 포트 추가 (NSG)

VM 배포가 완료되면 네트워크 보안 그룹에 실습 포트를 추가합니다.

생성된 VM → **네트워킹** → **인바운드 포트 규칙 추가**를 두 번 클릭해 아래 두 규칙을 추가합니다.

| 항목 | 규칙 1 | 규칙 2 |
|------|--------|--------|
| 대상 포트 범위 | `8000` | `8080` |
| 프로토콜 | TCP | TCP |
| 작업 | 허용 | 허용 |
| 이름 | `allow-8000` | `allow-8080` |

---

## Step 4. VM IP 확인 및 SSH 접속

VM 개요 페이지에서 **공용 IP 주소**를 확인합니다.

=== "Windows (PowerShell)"

    ```powershell title="터미널 (Windows PowerShell)"
    ssh labuser@<공용_IP_주소>
    ```

=== "Mac / Linux (Terminal)"

    ```bash title="터미널 (Mac / Linux)"
    ssh labuser@<공용_IP_주소>
    ```

처음 접속 시 아래 메시지가 나오면 `yes`를 입력하세요.

```console title="프롬프트"
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

접속 성공 시:

```console title="접속 성공"
labuser@hanbat-lab-vm:~$
```

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
프롬프트가 <code>labuser@hanbat-lab-vm:~$</code> 형태로 바뀌었나요?
</div>

---

## Step 5. 환경 확인

VM 접속 후 User Data 스크립트가 정상 실행되었는지 확인합니다.

!!! info "VM 생성 직후라면 1~2분 대기"
    User Data 스크립트는 VM 최초 부팅 시 백그라운드에서 실행됩니다. SSH 접속 직후에는 아직 실행 중일 수 있습니다.

**Docker 확인:**

```bash title="터미널"
docker --version
```

```console title="출력"
Docker version 24.x.x, build xxxxxxx
```

```bash title="터미널"
docker compose version
```

```console title="출력"
Docker Compose version v2.x.x
```

**소스 파일 확인:**

```bash title="터미널"
ls ~/hanbat-order-app
```

```console title="출력"
api/  docker-compose.yml  docker-compose.v2.yml  README.md  scripts/  web/
```

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
<code>docker --version</code>, <code>docker compose version</code> 이 정상 출력되고,
<code>~/hanbat-order-app</code> 디렉터리에 파일이 있으면 환경 세팅 완료입니다.
</div>

---

## 자주 만나는 문제

<details>
<summary>SSH 접속이 안 됩니다 (Connection refused / Timeout)</summary>

1. VM의 **공용 IP**가 맞는지 확인하세요.
2. NSG에서 포트 22가 허용되어 있는지 확인하세요.
3. VM이 **실행 중** 상태인지 Azure Portal에서 확인하세요.

```bash title="터미널 (디버그)"
ssh -v labuser@<IP>
```

</details>

<details>
<summary><code>docker</code> 명령어가 없다고 나옵니다</summary>

User Data 스크립트 실행 로그를 확인합니다.

```bash title="터미널"
cat /var/log/cloud-init-output.log | tail -50
```

오류가 있으면 수동으로 설치합니다.

```bash title="터미널"
sudo apt-get update -y && sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

</details>

<details>
<summary><code>~/hanbat-order-app</code> 디렉터리가 없습니다</summary>

git clone URL이 잘못되었을 수 있습니다. 수동으로 클론합니다.

```bash title="터미널"
git clone https://github.com/skilleat-labs/hanbat-order-app.git ~/hanbat-order-app
```

</details>

---

## 다음 단계

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 0 개요</a>
<a href="../../phase-1/" class="nav-btn next">Phase 1 · AS-IS 체험 →</a>
</div>
