<span class="phase-badge">PHASE 3</span>
<span class="time-badge">예상 40분</span>

# Web 앱 배포 (External Ingress)

Web 앱은 **External Ingress**로 배포합니다 — 인터넷에서 HTTPS로 직접 접근 가능.

---

## Step 1. Web 앱 배포

=== "포털 (추천)"

    1. Azure Portal → **Container Apps** → **+ 만들기**

    2. **기본 사항** 탭:

       | 항목 | 값 |
       |------|-----|
       | 컨테이너 앱 이름 | `hanbat-web` |
       | 지역 | Korea Central |
       | Container Apps 환경 | `hanbat-env` (기존 환경 선택) |

    3. **컨테이너** 탭:

       | 항목 | 값 |
       |------|-----|
       | 이미지 | `<ACR_SERVER>/hanbat-order-web:v2.0.0` |
       | CPU 및 메모리 | 0.25 CPU, 0.5Gi |

       환경 변수:

       | 이름 | 값 |
       |------|-----|
       | `API_URL` | `/api` |

       !!! warning "반드시 v2.0.0을 사용하세요"
           v1.0.0은 nginx API 프록시 설정이 없어 주문 목록을 불러올 수 없습니다.

       !!! info "API 통신 구조"
           `hanbat-web`의 nginx가 `/api/*` 요청을 ACA 내부 `hanbat-api` 서비스로 프록시합니다.
           브라우저는 외부에서 내부 URL에 직접 접근할 수 없기 때문에 nginx가 중간에서 대신 전달합니다.

           ```
           브라우저 → https://hanbat-web.xxx/api/orders
                      → nginx (hanbat-web 컨테이너)
                      → http://hanbat-api/orders  (ACA 내부 통신)
           ```

           nginx는 같은 ACA 환경 내 앱을 **앱 이름만으로** 찾습니다 (`http://hanbat-api`).
           별도의 `API_BACKEND` 환경변수 설정 없이 자동으로 동작합니다.

    4. **수신(Ingress)** 탭:

       | 항목 | 값 |
       |------|-----|
       | 수신 | **사용** |
       | 수신 트래픽 | **어디서나** ← External |
       | 대상 포트 | `80` |

       !!! danger "대상 포트는 80"
           Web 컨테이너(nginx)의 내부 포트는 **80**입니다.

    5. **검토 + 만들기** → **만들기**

=== "CLI"

    ```bash title="터미널"
    az containerapp create \
      --name hanbat-web \
      --resource-group $RESOURCE_GROUP \
      --environment $ACA_ENV \
      --image ${ACR_SERVER}/hanbat-order-web:v2.0.0 \
      --registry-server ${ACR_SERVER} \
      --target-port 80 \
      --ingress external \
      --min-replicas 1 \
      --max-replicas 3 \
      --env-vars API_URL=/api
    ```

---

## Step 2. Web 앱 URL 확인 및 환경변수 저장

```bash title="터미널"
WEB_URL=$(az containerapp show \
  --name hanbat-web \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo "https://$WEB_URL"
```

```console title="출력"
https://hanbat-web.xxx.koreacentral.azurecontainerapps.io
```

!!! tip "`WEB_URL` 변수는 이후 실습에서 계속 사용해요"
    터미널을 닫으면 변수가 사라지니, 세션이 끊겼을 경우 위 명령을 다시 실행하세요.

---

## Step 3. 브라우저 접속

```console title="브라우저 주소창"
https://hanbat-web.xxx.koreacentral.azurecontainerapps.io
```

한밭푸드 주문 조회 화면(초록 테마, v2)이 나오면 성공입니다.

![ACA에서 동작하는 한밭푸드 주문 조회 화면](../assets/images/phase-3/web-success.png)

<div class="checkpoint">
<div class="checkpoint-title">✅ Phase 3 완료 체크리스트</div>

- [ ] `hanbat-api` — Internal Ingress, Running, 대상 포트 8080
<br>
- [ ] `hanbat-web` — External Ingress, Running, 대상 포트 80, 이미지 v2.0.0
<br>
- [ ] `https://hanbat-web.xxx.azurecontainerapps.io` 접속 성공
<br>
- [ ] 주문 목록이 화면에 표시됨 (초록 테마, v2)
<br>
- [ ] 화면 캡처 저장 (평가 A-1, A-2)

</div>

---

## 자주 만나는 문제

<details>
<summary>주문 목록이 비어있습니다 (API 연결 실패)</summary>

브라우저 개발자도구(F12) → Network 탭에서 `/orders` 요청이 실패하는지 확인하세요.

`API_URL` 환경 변수가 올바른지 확인:

```bash title="터미널"
az containerapp show \
  --name hanbat-web \
  --resource-group $RESOURCE_GROUP \
  --query "properties.template.containers[0].env"
```

`API_URL` 이 `/api` 로 설정되어 있어야 합니다.

</details>

<details>
<summary>브라우저에서 "사이트에 연결할 수 없음"</summary>

1. URL이 `https://` 로 시작하는지 확인
2. Ingress가 External인지 확인:

```bash title="터미널"
az containerapp ingress show \
  --name hanbat-web \
  --resource-group $RESOURCE_GROUP \
  --query "external"
# true 여야 함
```

</details>

---

<div class="nav-buttons">
<a href="../api-deploy/" class="nav-btn">← API 앱 배포</a>
<a href="../../phase-4/" class="nav-btn next">Phase 4 · 재경기 →</a>
</div>
