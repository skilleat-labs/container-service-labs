<span class="phase-badge">평가</span>
<span class="time-badge">5분</span>

# 제출 가이드

---

## 제출물 구조

제출할 파일을 아래 구조로 ZIP으로 압축하세요.

```text
[수강생이름]_hanbat-aca-submission.zip
  A-1_portal-apps-running.png      # 필수 A-1
  A-2_browser-access.png           # 필수 A-2
  A-3_cli-list-output.png          # 필수 A-3
  B-1_phase4-no-downtime.log       # 필수 B-1
  B-2_autoscale-setting.png        # 필수 B-2
  B-3_traffic-split.png            # 필수 B-3
  C-1_decision-matrix.pdf          # 필수 C-1
  challenge/                        # 선택
    github-actions.yml              # 도전 1
    custom-domain.png               # 도전 2
```

---

## 파일명 명명 규칙

```
형식: [과제번호]_[내용설명].[확장자]
예시: A-1_portal-apps-running.png
      B-1_phase4-no-downtime.log
      C-1_decision-matrix.pdf
```

!!! warning "파일명에 한글, 공백 사용 금지"
    채점 시스템에서 한글 파일명과 공백이 포함된 파일명은 오류가 발생할 수 있습니다. 영문+하이픈만 사용하세요.

---

## ZIP 파일 만들기

```bash
# VM에서 실행
cd ~
mkdir submission

# 필수 파일 복사
cp ~/A-1_portal-apps-running.png ~/submission/
cp ~/A-2_browser-access.png ~/submission/
cp ~/A-3_cli-list-output.png ~/submission/
cp ~/phase4-no-downtime.log ~/submission/B-1_phase4-no-downtime.log
cp ~/B-2_autoscale-setting.png ~/submission/
cp ~/B-3_traffic-split.png ~/submission/
cp ~/C-1_decision-matrix.pdf ~/submission/

# ZIP 압축
zip -r [본인이름]_hanbat-aca-submission.zip submission/
```

로컬 PC로 파일 다운로드 (scp 이용):

```bash
# 로컬 PC 터미널에서 실행
scp labuser@<VM_IP>:~/<이름>_hanbat-aca-submission.zip .
```

---

## 제출 방법

강사가 안내하는 방법 중 하나로 제출합니다.

- [ ] LMS 시스템 파일 업로드 (강사 안내 링크)
- [ ] 이메일 제출 (강사 이메일로)
- [ ] Google Drive 폴더 업로드 (강사 공유 폴더)

---

## 리소스 삭제 (필수!)

평가 제출 후 **반드시** Azure 리소스를 삭제하세요. 삭제하지 않으면 계속 비용이 발생합니다.

```bash
az group delete \
  --name hanbat-rg \
  --yes \
  --no-wait
```

!!! danger "리소스 삭제는 복구 불가"
    리소스 그룹을 삭제하면 안에 있는 모든 리소스(ACA 환경, 앱, 로그 등)가 삭제됩니다. 제출 완료 후에 실행하세요.

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← 평가 개요</a>
<a href="../../reference/common-errors/" class="nav-btn next">오류 대응 →</a>
</div>
