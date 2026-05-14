<span class="phase-badge">PHASE 3-2</span>
<span class="time-badge">예상 30분</span>

# ACA 볼륨 (Volume)

컨테이너는 기본적으로 **Stateless(무상태)** 입니다.
재시작하거나 scale-out 되면 컨테이너 내부 파일이 사라집니다.

이 실습에서는 컨테이너 내부에 파일을 쓰고 재시작하면 사라지는 것을 확인한 뒤,
**Azure Files 볼륨**을 마운트해서 파일이 유지되는 것을 직접 비교합니다.

---

## 문제 확인

컨테이너 내부 파일시스템은 컨테이너가 재시작되면 초기화됩니다.

```
컨테이너 재시작
  → 내부 파일시스템 초기화 (이미지 상태로 리셋)
  → 저장했던 파일 모두 사라짐
```

### Step 0-1. 테스트 파일 쓰기

1. Azure Portal → **hanbat-api** 선택
2. 왼쪽 메뉴 → **모니터링 > 콘솔 (Console)**
3. 컨테이너: `hanbat-api` 선택 → **연결 (Connect)**

콘솔에서 테스트 파일을 작성합니다:

```bash title="콘솔"
echo "볼륨 테스트 - $(date)" > /app/test.txt
cat /app/test.txt
```

파일 내용이 출력되면 정상입니다.

### Step 0-2. 재시작 후 파일 사라짐 확인

Portal → **hanbat-api** → **수정 버전 관리** → 현재 revision → **수정 버전 다시 시작**

재시작 완료 후 콘솔에 다시 접속해서 확인합니다:

```bash title="콘솔 (재시작 후)"
cat /app/test.txt
```

```console title="출력"
cat: /app/test.txt: No such file or directory
```

!!! danger "볼륨이 없으면"
    재시작 시 컨테이너 내부에 저장한 모든 파일이 사라집니다.
    로그, 업로드 파일, DB 파일 등 중요한 데이터는 반드시 외부 스토리지에 저장해야 합니다.

---

이제 볼륨을 마운트해서 이 문제를 해결합니다.

---

## 볼륨 구성 개념

```
[ Azure Storage Account ]
  └── [ File Share: hanbat-data ]
            ↕ 마운트
[ hanbat-api 컨테이너 ]
  └── /app/persistent/  ← Azure Files에 저장 (재시작해도 유지)
```

---

## Step 1. Azure Storage Account 생성

1. Azure Portal 검색창 → **스토리지 계정** → **+ 만들기**

2. 기본 사항 탭:

    | 항목 | 값 |
    |------|-----|
    | 리소스 그룹 | `skilleat-container-lab` |
    | 스토리지 계정 이름 | `hanbatstorage<숫자>` (전역 유일) |
    | 지역 | Korea Central |
    | 성능 | 표준 |
    | 중복 | LRS (로컬 중복) |

3. **검토 + 만들기** → **만들기**

---

## Step 2. File Share 생성

1. 생성된 Storage Account → 왼쪽 메뉴 **데이터 스토리지 > 파일 공유**
2. **+ 파일 공유**

    | 항목 | 값 |
    |------|-----|
    | 이름 | `hanbat-data` |
    | 계층 | 트랜잭션 최적화 |

3. **만들기**

---

## Step 3. ACA 환경에 Storage 등록

ACA 볼륨을 사용하려면 먼저 **ACA 환경(Environment)** 에 Storage를 등록해야 합니다.

!!! info "Portal UI 대신 Cloud Shell 사용"
    이 단계는 Portal UI 폼에 액세스 키 입력 필드가 없어 정상 등록이 되지 않습니다.
    Portal 상단 **`>_`** 아이콘을 클릭해 **Cloud Shell**을 열고 아래 명령을 실행합니다.
    이미 로그인된 상태라 별도 인증이 필요 없습니다.

**① 액세스 키 확인**

Portal → **Storage Account** `hanbatstorage<숫자>` → **보안 + 네트워킹 > 액세스 키** → `key1` 복사

**② ACA 환경 이름 확인**

```bash title="Cloud Shell"
az containerapp env list --resource-group skilleat-container-lab -o table
```

**③ Storage 등록**

```bash title="Cloud Shell"
az containerapp env storage set \
  --name <환경이름> \
  --resource-group skilleat-container-lab \
  --storage-name hanbat-files \
  --azure-file-account-name hanbatstorage<숫자> \
  --azure-file-account-key <KEY1> \
  --azure-file-share-name hanbat-data \
  --access-mode ReadWrite
```

`"provisioningState": "Succeeded"` 가 나오면 등록 완료입니다.

---

## Step 4. hanbat-api에 볼륨 마운트

1. Portal → **hanbat-api** → **수정 버전 관리** → **+ 새 수정 버전 만들기**
2. **Name/suffix**: `vol`

3. 상단 **볼륨 (Volumes)** 탭 클릭 → **+ 추가**

    | 항목 | 값 |
    |------|-----|
    | 볼륨 이름 | `data-volume` |
    | 스토리지 유형 | Azure Files |
    | Azure Files | `hanbat-files` |

4. **컨테이너 (Container)** 탭 → `hanbat-api` 클릭

5. **볼륨 탑재 (Volume Mounts)** 섹션 → **+ 추가**

    | 항목 | 값 |
    |------|-----|
    | 볼륨 | `data-volume` |
    | 탑재 경로 | `/app/persistent` |

6. **저장** → **만들기**

---

## Step 5. 파일 영속성 확인

**① 볼륨 경로에 테스트 파일 쓰기**

Portal → **hanbat-api** → **모니터링 > 콘솔 (Console)** → `hanbat-api` 컨테이너 연결

```bash title="콘솔"
echo "볼륨 테스트 - $(date)" > /app/persistent/test.txt
cat /app/persistent/test.txt
```

**② 재시작**

Portal → **hanbat-api** → **수정 버전 관리** → `hanbat-api--vol` → **수정 버전 다시 시작**

**③ 재시작 후 확인**

콘솔에 다시 접속해서 파일이 남아있는지 확인합니다:

```bash title="콘솔 (재시작 후)"
cat /app/persistent/test.txt
```

파일 내용이 그대로 출력되면 볼륨 마운트 성공!

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
재시작 후에도 <code>/app/persistent/test.txt</code> 파일이 유지되나요?<br>
Azure Files → hanbat-data 파일 공유에 <code>test.txt</code> 파일이 보이나요?
</div>

---

## Step 6. Azure Files에서 파일 확인

1. Portal → **Storage Account** → **파일 공유** → `hanbat-data`
2. `test.txt` 파일이 생성된 것을 확인합니다

컨테이너가 재시작되어도 Azure Files에 파일이 남아있기 때문에, 다시 마운트되면 그대로 접근할 수 있습니다.

---

## 볼륨 미사용 vs 사용 비교

| 항목 | 볼륨 없음 | Azure Files 볼륨 |
|------|-----------|-----------------|
| 재시작 시 파일 | 사라짐 | 유지 |
| Scale-out 시 | replica마다 파일 분리 | 모든 replica가 같은 파일 공유 |
| 비용 | 없음 | Storage 비용 발생 |
| 적합한 용도 | Stateless 앱 | 업로드 파일, 로그, 설정 파일 |

!!! tip "운영 환경에서 DB는 외부 서비스 사용"
    파일 기반 DB(SQLite)를 볼륨에 저장하면 여러 replica가 동시에 쓸 때 충돌이 발생합니다.
    운영 환경에서는 **Azure Database for PostgreSQL, MySQL** 같은 관리형 DB를 사용하세요.

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 3-2 개요</a>
<a href="../../phase-4/" class="nav-btn next">Phase 4 →</a>
</div>
