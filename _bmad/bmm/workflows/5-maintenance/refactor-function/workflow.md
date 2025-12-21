# Refactor Function Workflow

> 긴 함수를 여러 작은 함수로 분할하는 Semi-automatic 워크플로우

---

## Overview

| 항목 | 내용 |
|------|------|
| **입력** | `sdd-docs/audits/audit-result.json`에서 `action: "refactor_function"` 이슈 |
| **출력** | 리팩토링된 코드 + `sdd-docs/audits/refactor-function-report.md` |
| **실행 방식** | 3단계 순차 실행 (사용자 확인 포함) |
| **예상 시간** | 함수당 5-10분 |

---

## WORKFLOW ARCHITECTURE

- **Execution Mode**: Semi-automatic (사용자 확인 후 진행)
- **Target**: Long Methods (50줄 이상) 또는 High Complexity (CC 10+)
- **Languages**: TypeScript/JavaScript, Rust
- **Safety**: git stash 백업 + 단계별 검증

---

## Target Functions (예시)

대상이 되는 긴 함수들:

| Function | Lines | Language | Module |
|----------|-------|----------|--------|
| `handleSendPrompt` | 505줄 | TypeScript | Frontend |
| `main()` | 402줄 | Rust | Desktop |
| `spawn_agent_system()` | 322줄 | Rust | Desktop |

**리팩토링 결과**:
- `handleSendPrompt` → `validateInput`, `setupEventListeners`, `executeCommand`
- `main()` → `setup_linux_ime`, `init_plugins`, `setup_application`
- `spawn_agent_system()` → `create_process`, `setup_io_handlers`, `spawn_monitor`

---

## Prerequisites

1. `/code-audit` 실행 완료
2. `audit-result.json`에 `action: "refactor_function"` 이슈 존재
3. 대상 함수가 테스트 가능하거나 수동 검증 가능

---

## Workflow Steps

### Step 1: Analyze Function
- 대상 함수 읽기 및 책임(responsibility) 식별
- 추출할 서브 함수 계획 수립
- 의존성 분석 (공유 변수/상태)
- 사용자에게 리팩토링 계획 확인 요청

### Step 2: Extract Sub-functions
- git stash로 백업 생성
- 서브 함수 추출 실행
- 언어별 처리 (async/await, 타입, 소유권)
- 보안 이슈 수정 포함

### Step 3: Verify & Report
- 빌드 검증
- 테스트 실행 (있는 경우)
- 동작 동일성 확인
- 성공 시 stash drop, 실패 시 stash pop
- 결과 보고서 생성

---

## Step Files

```
steps/
├── step-01-analyze.md      # 함수 분석 + 계획 수립
├── step-02-extract.md       # 서브 함수 추출 실행
└── step-03-verify.md        # 검증 + 보고서 생성
```

---

## Language-Specific Handling

### TypeScript/JavaScript
- async/await 패턴 보존
- 타입 정의 유지 (TypeScript)
- 클로저 변수 파라미터로 전환
- 보안: path traversal, injection 검사

### Rust
- async/await 보존
- 소유권(ownership) 처리
- 수명(lifetime) 처리
- Result/Option 타입 활용

---

## Safety Measures

### 1. Rollback Points
```bash
git stash push -m "refactor-function-backup-{function_name}"
```

### 2. Verification Steps
- **Frontend**: `bun test` + `npm run build`
- **Desktop**: `cargo build --release`
- **Server**: `node --check server/index.js`

### 3. User Confirmation
- Step 1 완료 후: 리팩토링 계획 확인
- Step 2 완료 후: 추출된 코드 검토
- Step 3: 최종 결과 확인

---

## Example Refactoring

**Before** (handleSendPrompt - 505줄):
```typescript
async function handleSendPrompt() {
  // Input validation (50줄)
  // Setup listeners (100줄)
  // Execute command (200줄)
  // Handle response (150줄)
  // Cleanup (5줄)
}
```

**After**:
```typescript
async function handleSendPrompt() {
  const validatedInput = validateInput();
  const listeners = setupEventListeners();
  const result = await executeCommand(validatedInput);
  handleCommandResponse(result, listeners);
  cleanup(listeners);
}
```

---

## Supported Security Fixes

리팩토링 중 발견된 보안 이슈 자동 수정:

| Issue | Fix |
|-------|-----|
| Path Traversal | `path.resolve()` + validation |
| SQL Injection | Parameterized queries |
| XSS | Input sanitization |
| Hardcoded Secrets | Environment variables |

---

## Start Workflow

→ LOAD: `_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-01-analyze.md`
