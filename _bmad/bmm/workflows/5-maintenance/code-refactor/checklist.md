# Code Refactor Checklist

> 리팩토링 완료 전 확인 사항

---

## Pre-Refactor Checks

- [ ] `/code-audit` 실행 완료
- [ ] `sdd-docs/audits/audit-result.json` 존재
- [ ] `audit-result.json`에 `issues[]` 배열 포함
- [ ] Git 워킹 디렉토리 클린 상태

---

## Step 1: Priority Selection

- [ ] audit-result.json 로드 성공
- [ ] 이슈 수 by 우선순위 표시
- [ ] 사용자 우선순위 선택 완료
- [ ] 선택된 이슈 필터링 완료
- [ ] 영역별 그룹화 완료
- [ ] 롤백 포인트 생성됨 (git stash)

---

## Step 2: Parallel Refactoring

### Agent Execution
- [ ] Frontend Refactorer 에이전트 시작
- [ ] Desktop Refactorer 에이전트 시작
- [ ] Server Refactorer 에이전트 시작
- [ ] 모든 에이전트 완료 대기

### Per-Area Verification

#### Frontend
- [ ] 이슈 처리 완료
- [ ] `bun test` 실행
- [ ] 테스트 통과 또는 실패 기록
- [ ] `frontend/refactor-report.md` 생성

#### Desktop
- [ ] 이슈 처리 완료
- [ ] `cargo build --release` 실행
- [ ] 빌드 성공 또는 실패 기록
- [ ] `desktop/refactor-report.md` 생성

#### Server
- [ ] 이슈 처리 완료
- [ ] `node --check server/index.js` 실행
- [ ] 검증 성공 또는 실패 기록
- [ ] `server/refactor-report.md` 생성

---

## Step 3: Validation & Report

### Final Verification
- [ ] 전체 테스트 실행 (`bun test`)
- [ ] Desktop 빌드 확인
- [ ] Server 검증 확인

### Report Generation
- [ ] `sdd-docs/audits/refactor-report.md` 생성
- [ ] `sdd-docs/audits/refactor-result.json` 생성
- [ ] 처리된 이슈 목록 포함
- [ ] 실패한 이슈 목록 포함
- [ ] 변경된 파일 목록 포함

### Commit
- [ ] 변경 사항 스테이징 (`git add -A`)
- [ ] 커밋 메시지 생성
- [ ] 커밋 완료
- [ ] 롤백 포인트 정리 (`git stash drop`)

---

## Post-Refactor Verification

- [ ] 모든 테스트 통과
- [ ] 빌드 성공
- [ ] 커밋 생성됨
- [ ] 보고서 생성됨

---

## Error Cases

### 검증 실패 시
- [ ] 실패 원인 기록
- [ ] 롤백 옵션 안내
- [ ] 수동 처리 필요 이슈 목록 제공

### 이슈 처리 실패 시
- [ ] 개별 이슈 롤백
- [ ] 실패 원인 기록
- [ ] 다음 이슈로 진행

---

## Output Files Checklist

### Required
- [ ] `sdd-docs/audits/refactor-report.md`
- [ ] `sdd-docs/audits/refactor-result.json`

### Per Area (if issues exist)
- [ ] `sdd-docs/audits/frontend/refactor-report.md`
- [ ] `sdd-docs/audits/desktop/refactor-report.md`
- [ ] `sdd-docs/audits/server/refactor-report.md`

---

## Workflow Complete

- [ ] 콘솔 요약 출력
- [ ] 사용자에게 결과 표시
- [ ] 후속 작업 안내 (실패 이슈, 자동화 불가 이슈)
