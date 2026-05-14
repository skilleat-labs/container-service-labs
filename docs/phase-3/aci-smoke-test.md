<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 15분</span>

# ACI Smoke Test

ACR에 이미지를 올렸으니, ACA에 본격 배포하기 전에 **이미지가 정상적으로 동작하는지** 먼저 확인합니다.

이때 사용하는 것이 **Azure Container Instances(ACI)** 입니다.
컨테이너 하나를 수십 초 안에 띄우고, 확인 후 바로 삭제할 수 있어 이미지 검증(smoke test)에 적합합니다.

---

## Step 1. ACR 관리 사용자 활성화

ACI가 ACR에서 이미지를 pull하려면 인증이 필요합니다.
Smoke test 용도이므로 ACR의 **관리 사용자(Admin User)** 를 일시적으로 활성화합니다.

1. Azure Portal → **컨테이너 레지스트리** → `hanbatacr...` 선택
2. 왼쪽 메뉴 → **설정** → **액세스 키**
3. **관리 사용자** 토글을 **활성화**

![ACR 관리 사용자 활성화](../../assets/images/3-1.png)

!!! info "관리 사용자란?"
    ACR에 이미지를 push/pull할 수 있는 관리자 계정입니다.
    username과 password가 발급되어 누구든 자격증명만 알면 접근할 수 있어, **실무에서는 사용을 권장하지 않습니다.**
    ACA 배포 단계에서는 보안이 강화된 Managed Identity 방식으로 전환합니다.

---

## Step 2. ACI 생성 (Portal)

1. Azure Portal 검색창에 **컨테이너 인스턴스** 검색 → **+ 만들기**

2. **기본 사항** 탭에서 아래와 같이 입력합니다

    | 항목 | 값 |
    |------|-----|
    | 리소스 그룹 | 강사에게 할당받은 리소스 그룹 (예: `hanbat-rg-test01`) |
    | 컨테이너 이름 | `hanbat-api-smoke` |
    | 지역 | Korea Central |
    | 이미지 원본 | **Azure Container Registry** |
    | 레지스트리 | `hanbatacr...` (본인 ACR 선택) |
    | 이미지 | `hanbat-order-api` |
    | 이미지 태그 | `v1.0.0` |
    | OS 유형 | Linux |
    | 크기 | 1 vCPU, 1.5 GiB (기본값) |

3. **네트워킹** 탭으로 이동합니다

    | 항목 | 값 |
    |------|-----|
    | 네트워킹 유형 | 공용 |
    | 포트 | `8080` / TCP |

4. **모니터링** 탭으로 이동합니다

    **Enable container instance logs** 체크를 **해제**합니다.

    !!! warning "Log Analytics workspace 오류가 뜨면"
        체크가 활성화된 상태로 두면 Log Analytics workspace가 필요하다는 오류가 발생합니다. 이 실습은 로그 수집이 필요 없으므로 반드시 비활성화하세요.

5. **검토 + 만들기** → **만들기**

프로비저닝 완료까지 **약 1분** 소요됩니다.

---

## Step 3. 동작 확인

### IP 주소 확인

ACI 왼쪽 메뉴 **설정** → **컨테이너** → **속성** 탭을 클릭합니다.

**IP 주소** 항목에서 공용 IP를 확인합니다.

### 브라우저에서 확인

브라우저 주소창에 아래 URL을 입력합니다.

```
http://<IP 주소>:8080/version
```

아래와 같은 응답이 오면 이미지가 정상적으로 동작하는 겁니다.

```json title="응답"
{
  "version": "1.0.0",
  "service": "hanbat-order-api"
}
```

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
브라우저에서 <code>/version</code>이 JSON을 응답하나요?<br>
응답이 보이면 ACR 이미지가 정상임이 확인된 겁니다.<br>
확인이 끝나면 바로 Step 5로 넘어가 ACI를 삭제하세요.
</div>

---

## Step 4. ACI 탐색 (Portal)

동작 확인이 끝났으면 ACI의 주요 기능을 Portal에서 직접 살펴봅니다.

### 로그 확인

왼쪽 메뉴 **설정** → **컨테이너** → **로그** 탭을 클릭합니다.

컨테이너가 시작되면서 출력한 로그가 보입니다.

```console title="로그 예시"
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8080
```

!!! tip "ACI 로그의 특성"
    ACI는 컨테이너가 삭제되면 로그도 함께 사라집니다. 운영 환경에서는 Log Analytics workspace를 연결해 로그를 영구 보관합니다.

### 콘솔 접속 (Connect)

왼쪽 메뉴 **설정** → **컨테이너** → **연결** 탭을 클릭합니다.

실행 명령을 `/bin/sh`로 두고 **연결**을 클릭하면 컨테이너 내부 셸에 접속됩니다.

접속 후 아래 명령어를 직접 실행해보세요.

```bash title="컨테이너 내부"
# 실행 중인 프로세스 확인 (ps가 없는 경우)
# PID 1은 ACI 내부 인프라 프로세스(/pause)이므로 전체 프로세스를 확인합니다
cat /proc/*/cmdline 2>/dev/null | tr '\0' ' ' | tr ':' '\n'

# 환경변수 확인
env | grep APP

# API 내부 호출 (wget 대신 Python 사용)
python3 -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8080/health').read().decode())"
```

!!! info "VM SSH vs ACI Connect"
    VM은 SSH로 외부에서 접속하지만, ACI는 Azure Portal을 통해 컨테이너 내부에 직접 연결합니다. 별도 SSH 설정 없이 바로 셸을 사용할 수 있는 것이 ACI의 장점입니다.

### 이벤트 확인

**연결** 탭 옆 **이벤트** 탭을 클릭하면 컨테이너 생성·시작 이력을 확인할 수 있습니다.

```console title="이벤트 예시"
Pulling  → 이미지를 ACR에서 내려받는 중
Pulled   → 이미지 다운로드 완료
Created  → 컨테이너 생성 완료
Started  → 컨테이너 시작 완료
```

---

## Step 5. ACI 삭제

Smoke test 목적이 달성됐으니 즉시 삭제합니다.
ACI는 실행 중인 시간만큼 과금되므로 확인 즉시 삭제하는 것이 좋습니다.

1. Azure Portal → **컨테이너 인스턴스** → `hanbat-api-smoke` 선택
2. 상단 **삭제** 클릭 → 확인

!!! tip "ACI의 핵심 특성이 바로 이겁니다"
    띄우고 → 확인하고 → 삭제. 전체 과정이 수분 안에 끝납니다.
    실행한 시간만큼만 초 단위로 과금되므로 이 실습에서 발생한 비용은 거의 0에 가깝습니다.
    반면 ACA는 상시 운영 서비스에 적합합니다 — 이 차이가 **ACI vs ACA 선택 기준**입니다.

---

## 도전 과제

API 확인에 성공했다면 **Web 이미지도 직접 띄워보세요.**

힌트:
- 이미지: `hanbat-order-web:v2.0.0`
- 포트: `80`
- 확인 URL: `http://<FQDN>/`

Web ACI도 확인 후 **반드시 삭제**하세요.

CLI로 삭제하려면 VM 터미널에서 아래 명령어를 실행합니다.

```bash title="터미널"
az container delete \
  --resource-group <본인_리소스_그룹> \
  --name <컨테이너_이름> \
  --yes
```

생성한 ACI가 모두 삭제됐는지 확인합니다.

```bash title="터미널"
az container list --resource-group <본인_리소스_그룹> --output table
```

아무것도 출력되지 않으면 삭제 완료입니다.

---

## 다음 단계

<div class="nav-buttons">
<a href="../acr-push/" class="nav-btn">← ACR 이미지 푸시</a>
<a href="../environment-create/" class="nav-btn next">ACA 환경 생성 →</a>
</div>
