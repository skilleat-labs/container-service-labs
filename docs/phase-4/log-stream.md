<span class="phase-badge">PHASE 4</span>
<span class="time-badge">예상 20분</span>

# 로그 스트림 실습

운영 중인 앱에서 문제가 생겼을 때 **로그를 실시간으로 확인하는 방법**을 익힙니다.
ACA의 Log stream은 SSH 없이 바로 컨테이너 로그를 볼 수 있습니다.

---

## Step 1. Log stream 열기

1. Azure Portal → **hanbat-api** 선택
2. 왼쪽 메뉴 → **모니터링 > 로그 스트림 (Log stream)**
3. 로그가 실시간으로 출력되는 것을 확인합니다

---

## Step 2. 트래픽 발생시키기

Log stream을 열어둔 채로 터미널에서 요청을 보냅니다.

```bash title="터미널"
for i in $(seq 1 20); do
  curl -s https://<WEB_URL>/api/orders > /dev/null
  sleep 0.3
done
```

Log stream에 요청 로그가 실시간으로 찍히는 것을 확인합니다.

```console title="Log stream 출력 예시"
INFO:     10.0.0.1:12345 - "GET /orders HTTP/1.1" 200 OK
INFO:     10.0.0.1:12345 - "GET /orders HTTP/1.1" 200 OK
INFO:     10.0.0.1:12345 - "GET /health HTTP/1.1" 200 OK
```

---

## Step 3. 특정 Revision 로그만 보기

Traffic Split 중에 **v2 revision 로그만** 확인해봅니다.

1. **hanbat-api** → **수정 버전 관리 (Revisions and replicas)**
2. **hanbat-api--v2** 클릭
3. 왼쪽 메뉴 → **로그 스트림**

특정 revision으로 들어온 요청만 필터링해서 볼 수 있습니다.

---

## Step 4. hanbat-web 로그와 비교

새 탭에서 **hanbat-web** 로그도 열어봅니다.

1. Azure Portal → **hanbat-web** → **로그 스트림**

브라우저에서 화면을 새로고침하면서 web 로그와 api 로그가 동시에 찍히는 것을 확인합니다.

```console title="hanbat-web 로그 예시"
10.0.0.1 - - "GET / HTTP/1.1" 200
10.0.0.1 - - "GET /api/orders HTTP/1.1" 200  ← nginx가 api로 프록시
```

!!! info "실무에서 Log stream 활용"
    - 배포 직후 오류가 나는지 즉시 확인
    - Traffic Split 중 특정 버전에서만 오류 발생하는지 구분
    - SSH 없이 컨테이너 내부 로그 실시간 확인

---

## Step 5. CLI로 로그 확인

Portal 외에 터미널에서도 로그를 볼 수 있습니다.

```bash title="api 로그 (실시간)"
az containerapp logs show \
  --name hanbat-api \
  --resource-group skilleat-container-lab \
  --follow
```

```bash title="특정 revision 로그"
az containerapp logs show \
  --name hanbat-api \
  --resource-group skilleat-container-lab \
  --revision hanbat-api--v2 \
  --follow
```

`Ctrl + C` 로 종료합니다.

<div class="checkpoint">
<div class="checkpoint-title">✅ 확인 포인트</div>
Log stream에서 실시간으로 요청 로그가 찍히나요?<br>
v2 revision 로그만 따로 볼 수 있나요?
</div>

---

<div class="nav-buttons">
<a href="../rollback/" class="nav-btn">← 롤백 실습</a>
<a href="../auto-scale/" class="nav-btn next">자동 확장 →</a>
</div>
