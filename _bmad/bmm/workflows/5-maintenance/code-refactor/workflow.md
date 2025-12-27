# Code Refactor Workflow

> 코드 감사 결과를 기반으로 자동 리팩토링을 수행하는 워크플로우

---

## Overview

| 항목 | 내용 |
|------|------|
| **입력** | `sdd-docs/audits/audit-result.json` |
| **출력** | 수정된 코드 + `sdd-docs/audits/refactor-report.md` |
| **실행 방식** | 3단계 순차 실행 + 병렬 에이전트 |
| **예상 시간** | 5-10분 (이슈 수에 따라 변동) |

---

## Prerequisites

1. `/code-audit` 실행 완료
2. `sdd-docs/audits/audit-result.json` 파일 존재
3. `audit-result.json`에 `issues[]` 배열 포함

---

## Workflow Steps

### Step 1: Select Priority & Load Issues
- 사용자에게 우선순위 선택 질문 (P0/P1/P2)
- `audit-result.json`에서 이슈 로드
- 영역별 작업 분류

### Step 2: Parallel Refactoring
- 3개 Task 에이전트 병렬 실행 (Frontend/Desktop/Server)
- 각 에이전트가 해당 영역의 이슈 처리
- 각 단계마다 검증 (테스트/빌드)

### Step 3: Validate & Report
- 전체 테스트 실행
- 결과 보고서 생성
- 커밋 생성

---

## Step Files

```
steps/
├── step-01-select-priority.md  # 우선순위 선택 + 이슈 로드
├── step-02-parallel-refactor.md # 병렬 리팩토링 실행
└── step-03-validate.md          # 검증 + 보고서 생성
```

---

## Supported Actions

이 워크플로우에서 자동 처리 가능한 작업:

| Action | 설명 | 예시 |
|--------|------|------|
| `delete_file` | 파일 삭제 | Dead Code 제거 |
| `replace_pattern` | 패턴 교체 | JWT 하드코딩 수정 |
| `extract_utility` | 유틸 추출 | 중복 코드 통합 |
| `add_type` | 타입 추가 | any 타입 제거 |
| `remove_log` | 로그 제거 | console.log 정리 |

### 별도 워크플로우 필요 (자동 처리 불가)

| Action | 별도 워크플로우 |
|--------|----------------|
| `split_file` | `/split-widgets`, `/split-api` |
| `refactor_function` | 수동 리팩토링 |

---

## Safety Measures

### 1. Rollback Points
- 작업 시작 전 git stash
- 실패 시 git checkout으로 복구

### 2. Verification
- Frontend: `bun test`
- Desktop: `cargo build --release`
- Server: `node --check server/index.js`

### 3. Incremental Execution
- P0만 먼저 실행 권장
- 성공 후 P1/P2 진행

---

## Start Workflow

→ LOAD: `_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-01-select-priority.md`
