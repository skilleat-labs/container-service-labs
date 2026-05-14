<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 30분</span>

# ACA 볼륨 (Volume)

컨테이너는 기본적으로 **Stateless(무상태)** 입니다.
재시작하거나 scale-out 되면 컨테이너 내부 파일이 사라집니다.

이 실습에서는 hanbat-api의 SQLite DB가 컨테이너 재시작 시 사라지는 문제를
**Azure Files 볼륨**으로 해결합니다.

---

## 문제 확인

hanbat-api는 주문 데이터를 `/app/data/orders.db` (SQLite)에 저장합니다.

```
컨테이너 내부
  └── /app/data/orders.db  ← 컨테이너가 죽으면 함께 사라짐
```

### Step 0-1. 테스트 주문 추가

Azure Portal 콘솔로 컨테이너 내부에 직접 접속해서 주문 1건을 추가합니다.

1. Azure Portal → **hanbat-api** 선택
2. 왼쪽 메뉴 → **모니터링 > 콘솔 (Console)**
3. 컨테이너: `hanbat-api` 선택 → **연결 (Connect)**

콘솔 창이 열리면 Python으로 테스트 주문을 삽입합니다:

!!! info "sqlite3 CLI 대신 Python 사용"
    컨테이너 이미지에 `sqlite3` CLI가 포함되어 있지 않습니다.
    Python FastAPI 앱이므로 Python 표준 라이브러리의 `sqlite3` 모듈을 사용합니다.

```bash title="콘솔"
python3 -c "
import sqlite3
conn = sqlite3.connect('/app/data/orders.db')
conn.execute(\"INSERT OR REPLACE INTO orders VALUES ('ORD-TEST-9999', 3030, '볼륨 테스트 상품', 99000, '결제완료', '2026-05-14', '2026-05-20');\")
conn.commit()
count = conn.execute('SELECT COUNT(*) FROM orders;').fetchone()[0]
print('주문 수:', count)
conn.close()
"
```

`주문 수: 17` 이 나오면 정상 (기본 16건 + 추가 1건)

!!! tip "웹 메인 화면에서도 바로 확인 가능"
    웹은 `userId=3030`의 주문만 표시합니다.
    INSERT 시 userId를 **3030**으로 넣었으므로, hanbat-web을 새로고침하면 주문 목록에 **볼륨 테스트 상품**이 나타납니다.

### Step 0-2. 재시작 후 데이터 사라짐 확인

웹에서 **볼륨 테스트 상품**이 보이는 상태에서 컨테이너를 재시작합니다.

Portal → **hanbat-api** → **수정 버전 관리** → 현재 revision → **수정 버전 다시 시작**

재시작 후 웹을 새로고침하면 **볼륨 테스트 상품이 사라지고 원래 목록으로 초기화**됩니다.

!!! danger "볼륨이 없으면"
    재시작 시 DB 파일이 사라지고 seed 데이터(16건)로 초기화됩니다.
    사용자가 추가한 주문은 영구적으로 사라집니다.

---

이제 볼륨을 마운트해서 이 문제를 해결합니다.

---

## 볼륨 구성 개념

```
[ Azure Storage Account ]
  └── [ File Share: hanbat-data ]
            ↕ 마운트
[ hanbat-api 컨테이너 ]
  └── /app/data/orders.db  ← Azure Files에 저장
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

1. Portal → **Container Apps 환경** → `hanbat-env`
2. 왼쪽 메뉴 → **볼륨 탑재 (Volume mounts)**
3. **+ 추가**

    | 항목 | 값 |
    |------|-----|
    | 이름 | `hanbat-files` |
    | 서버 | `hanbatstorage<숫자>.file.core.windows.net` |
    | 파일 공유 이름 | `/hanbatstorage<숫자>/hanbat-data` |
    | 액세스 모드 | ReadWrite |

4. **추가** 클릭

!!! tip "스토리지 계정 이름 확인"
    Storage Account → **개요** 페이지 상단에서 스토리지 계정 이름을 확인할 수 있습니다.
    서버 주소는 `<스토리지계정이름>.file.core.windows.net` 형식입니다.

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
    | 탑재 경로 | `/app/data` |

6. **환경 변수** 섹션에서 `DB_PATH` 추가:

    | 이름 | 값 |
    |------|-----|
    | `DB_PATH` | `/app/data/orders.db` |

7. **저장** → **만들기**

---

## Step 5. 데이터 영속성 확인

**① 테스트 주문 다시 추가**

Portal → **hanbat-api** → **모니터링 > 콘솔 (Console)** → `hanbat-api` 컨테이너 연결

```bash title="콘솔"
python3 -c "
import sqlite3
conn = sqlite3.connect('/app/data/orders.db')
conn.execute(\"INSERT OR REPLACE INTO orders VALUES ('ORD-TEST-9999', 3030, '볼륨 테스트 상품', 99000, '결제완료', '2026-05-14', '2026-05-20');\")
conn.commit()
count = conn.execute('SELECT COUNT(*) FROM orders;').fetchone()[0]
print('주문 수:', count)
conn.close()
"
# 주문 수: 17 확인
```

**② 재시작**

Portal → **hanbat-api** → **수정 버전 관리** → `hanbat-api--vol` → **수정 버전 다시 시작**

**③ 재시작 후 웹에서 확인**

hanbat-web을 새로고침합니다 — **볼륨 테스트 상품이 그대로 남아있으면 볼륨 마운트 성공!**

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
재시작 후에도 주문 데이터가 유지되나요?<br>
Azure Files → hanbat-data 파일 공유에 <code>orders.db</code> 파일이 생성됐나요?
</div>

---

## Step 6. Azure Files에서 DB 파일 확인

1. Portal → **Storage Account** → **파일 공유** → `hanbat-data`
2. `orders.db` 파일이 생성된 것을 확인합니다

---

## 볼륨 미사용 vs 사용 비교

| 항목 | 볼륨 없음 | Azure Files 볼륨 |
|------|-----------|-----------------|
| 재시작 시 데이터 | 사라짐 | 유지 |
| Scale-out 시 | replica마다 DB 분리 | 모든 replica가 같은 파일 공유 |
| 비용 | 없음 | Storage 비용 발생 |
| 적합한 용도 | Stateless 앱 | DB 파일, 로그, 업로드 파일 |

!!! warning "SQLite + 여러 replica는 위험합니다"
    SQLite는 파일 기반 DB라 여러 replica가 동시에 쓰면 충돌이 발생합니다.
    Scale-out이 필요한 운영 환경에서는 **PostgreSQL, MySQL** 같은 외부 DB를 사용하세요.
    이 실습은 볼륨 마운트 개념 학습이 목적입니다.

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← Phase 3-2 개요</a>
<a href="../../phase-4/" class="nav-btn next">Phase 4 →</a>
</div>
