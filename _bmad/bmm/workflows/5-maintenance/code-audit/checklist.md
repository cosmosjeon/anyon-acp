# Code Audit Checklist

> 감사 완료 전 확인 사항

---

## Pre-Audit Checks

- [ ] 프로젝트 구조 확인 (src/, src-tauri/src/, server/)
- [ ] 감사 기준 문서 존재 확인 (sdd-docs/audits/README.md)
- [ ] 출력 디렉토리 준비됨

---

## Analysis Categories

### 1. AI 생성 코드 문제 (우선 검사)
- [ ] 중복 코드 탐지 (DRY 위반)
- [ ] 문맥 무시 패턴 탐지 (기존 유틸 미사용)
- [ ] 실패한 리팩토링 파일 탐지 (.refactored/.optimized)
- [ ] 과도한 복잡성 탐지

### 2. Bloaters
- [ ] Long Method 탐지 (50줄+)
- [ ] Long File 탐지 (500줄+)
- [ ] Cyclomatic Complexity 탐지 (10+)
- [ ] Long Parameter List 탐지 (3+)

### 3. Dispensables
- [ ] Dead Code 탐지
- [ ] Duplicated Code 탐지
- [ ] Speculative Generality 탐지

### 4. SOLID 위반
- [ ] Single Responsibility 위반 탐지
- [ ] 과도한 의존성 탐지

### 5. 기술 부채
- [ ] TODO/FIXME/HACK 주석 탐지
- [ ] any 타입 사용 탐지 (TypeScript)
- [ ] unwrap()/expect() 남용 탐지 (Rust)
- [ ] 하드코딩된 설정값 탐지
- [ ] console.log 남발 탐지

---

## Severity Classification

- [ ] Critical 이슈 분류됨 (Push 차단 대상)
- [ ] Warning 이슈 분류됨 (권장 수정)
- [ ] Info 이슈 분류됨 (참고 사항)

---

## Output Verification

### Area Reports
- [ ] `sdd-docs/audits/frontend/audit-report.md` 생성됨
- [ ] `sdd-docs/audits/desktop/audit-report.md` 생성됨
- [ ] `sdd-docs/audits/server/audit-report.md` 생성됨

### Summary Reports
- [ ] `sdd-docs/audits/code-audit-report.md` 생성됨
- [ ] `sdd-docs/audits/audit-result.json` 생성됨

### Content Validation
- [ ] 모든 보고서에 Executive Summary 포함
- [ ] 모든 보고서에 Critical/Warning/Info 개수 명시
- [ ] 모든 보고서에 권장 조치 목록 포함
- [ ] 전체 요약에 영역별 테이블 포함

---

## Post-Audit

- [ ] 전체 등급 계산됨 (A-E)
- [ ] pass/fail 판정됨 (Critical 0개 = pass)
- [ ] 콘솔 요약 출력됨

---

## Audit Complete

- [ ] 모든 체크리스트 항목 완료
- [ ] 사용자에게 결과 요약 표시
