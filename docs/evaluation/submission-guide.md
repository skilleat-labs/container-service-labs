<span class="phase-badge">평가</span>
<span class="time-badge">5분</span>

# 제출 가이드

---

## 제출물 구조

아래 구조로 ZIP 파일을 만들어 LMS에 업로드하세요.

```text
studentXX-aca-eval.zip
  A-01_environment.png          # 필수 A-1: Environment 생성 완료 화면
  A-02_ingress_access.png       # 필수 A-2: 브라우저 접속 화면 (주소창 포함)
  A-03_revision_list.png        # 필수 A-3: Revision 2개 Active 목록
  B-01_scale_rule.png           # 필수 B-1: Scale 탭 설정 화면
  B-02_load_test.txt            # 필수 B-2: 부하 스크립트 실행 로그
  B-03_metrics.png              # 필수 B-3: Replica 증설 확인 화면
  report.docx                   # 보고서 (이해 확인 답변 + 관찰 표 포함)
  challenge/                    # 도전 과제 (선택)
    A-04_zero_downtime.txt      # A-6: 무중단 배포 curl 로그
    C-2_cost_analysis.txt       # C-2: 0 트래픽 비용 분석
    C-3_recommendation.txt      # C-3: 최종 권장안
```

!!! warning "파일명 규칙"
    파일명에 **한글과 공백 사용 금지**입니다. 영문·숫자·하이픈만 사용하세요.

---

## 스크린샷 주의사항

- 주소창, 시각, 리소스명이 모두 보이도록 **전체 화면**으로 캡처하세요.
- A-02는 **FQDN 주소창과 v1.0.1 화면 내용**이 모두 보여야 합니다.

---

## ZIP 파일 만들기

```bash
cd ~
mkdir studentXX-aca-eval
cp A-01_environment.png studentXX-aca-eval/
cp A-02_ingress_access.png studentXX-aca-eval/
cp A-03_revision_list.png studentXX-aca-eval/
cp B-01_scale_rule.png studentXX-aca-eval/
cp B-02_load_test.txt studentXX-aca-eval/
cp B-03_metrics.png studentXX-aca-eval/
cp report.docx studentXX-aca-eval/
zip -r studentXX-aca-eval.zip studentXX-aca-eval/
```

---

## 제출 방법

강사가 안내하는 방법으로 제출합니다.

- [ ] LMS 시스템 파일 업로드
- [ ] 이메일 제출
- [ ] Google Drive 폴더 업로드

---

## 리소스 삭제 (제출 완료 후)

```bash
az group delete \
  --name <리소스그룹명> \
  --yes \
  --no-wait
```

!!! danger "제출 완료 후 실행"
    리소스 그룹을 삭제하면 모든 리소스가 삭제됩니다. 반드시 제출 후에 실행하세요.

---

<div class="nav-buttons">
<a href="../" class="nav-btn">← 평가 가이드</a>
</div>
