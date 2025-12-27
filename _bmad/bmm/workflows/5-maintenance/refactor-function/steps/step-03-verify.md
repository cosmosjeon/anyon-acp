---
name: 'step-03-verify'
description: 'Verify refactored code and generate report'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-03-verify.md'
nextStepFile: null
---

# Step 3: Verify & Report

**Progress: Step 3 of 3**

---

## STEP GOAL

리팩토링된 코드를 검증하고 결과 보고서를 생성합니다.

---

## EXECUTION SEQUENCE

### 1. Build Verification

언어별 빌드를 실행하여 컴파일 오류를 확인합니다.

#### TypeScript/JavaScript

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 또는 프로젝트 빌드
npm run build
```

**성공 시**:
```
✅ TypeScript compilation successful
   No type errors found
```

**실패 시**:
```
❌ TypeScript compilation failed

Error details:
{file}:{line}:{column} - {error message}

Rolling back changes...
```

#### Rust

```bash
# Cargo 빌드
cd src-tauri
cargo build --release
```

**성공 시**:
```
✅ Rust compilation successful
   Binary: target/release/{app_name}
```

**실패 시**:
```
❌ Rust compilation failed

Error details:
   Compiling {crate} v{version}
   error[E0308]: mismatched types
     --> {file}:{line}:{column}
      |
      | {code snippet}
      |

Rolling back changes...
```

### 2. Test Execution

테스트가 존재하는 경우 실행합니다.

#### TypeScript/JavaScript

```bash
# 단위 테스트 실행
bun test {file}.test.ts

# 또는 전체 테스트
bun test
```

**테스트가 없는 경우**:
```
⚠️ No tests found for {functionName}
   Manual verification recommended
```

**테스트 성공**:
```
✅ All tests passed
   {passCount} tests, {assertCount} assertions
```

**테스트 실패**:
```
❌ Test failed

Failed test: {testName}
Expected: {expected}
Received: {received}

Rolling back changes...
```

#### Rust

```bash
# Rust 테스트 실행
cd src-tauri
cargo test {function_name}
```

### 3. Behavioral Verification

리팩토링 전후 동작 동일성을 확인합니다.

#### Automated Checks

```typescript
// 1. 함수 시그니처 일치 확인
interface FunctionSignature {
  name: string;
  parameters: string[];
  returnType: string;
  async: boolean;
}

// Before
const originalSig: FunctionSignature = {
  name: 'handleSendPrompt',
  parameters: ['rawPrompt: string'],
  returnType: 'Promise<void>',
  async: true,
};

// After - 시그니처가 동일해야 함
const refactoredSig: FunctionSignature = {
  name: 'handleSendPrompt',
  parameters: ['rawPrompt: string'], // 동일
  returnType: 'Promise<void>',        // 동일
  async: true,                        // 동일
};
```

#### Manual Verification Checklist

사용자에게 수동 확인 요청:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Manual Verification Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please verify the following behaviors:

1. ✓ Function accepts same inputs
2. ✓ Function produces same outputs
3. ✓ Error handling works identically
4. ✓ Side effects are preserved
5. ✓ Performance is acceptable

All checks passed? (yes/no)
```

### 4. Code Quality Metrics

리팩토링 효과를 측정합니다.

```typescript
interface QualityMetrics {
  before: {
    lines: number;
    complexity: number;
    functions: number;
  };
  after: {
    lines: number;          // 원본 함수만
    complexity: number;     // 원본 함수만
    functions: number;      // 추출된 함수 포함
  };
  improvement: {
    linesReduction: number;       // %
    complexityReduction: number;  // %
    modularization: number;       // 추출된 함수 수
  };
}
```

**예시**:
```
📊 Quality Improvement:

Before:
  - Lines: 505
  - Complexity: 45
  - Functions: 1

After:
  - Main function: 50 lines (90% reduction)
  - Total functions: 6 (+5 extracted)
  - Avg complexity: 7 (84% reduction)

Overall:
  ✅ Lines reduced by 90%
  ✅ Complexity reduced by 84%
  ✅ 5 reusable functions extracted
```

### 5. Security Verification

보안 수정 사항을 확인합니다.

```bash
# 보안 취약점 재검사
npm audit        # Node.js
cargo audit      # Rust (cargo-audit 설치 필요)
```

**수정된 보안 이슈 확인**:
```typescript
interface SecurityFix {
  type: 'path_traversal' | 'sql_injection' | 'hardcoded_secret' | 'xss';
  before: string;  // 취약한 코드 예시
  after: string;   // 수정된 코드 예시
  severity: 'critical' | 'high' | 'medium' | 'low';
}
```

**보고 예시**:
```
🛡️ Security Fixes Applied:

1. Path Traversal Prevention
   - File: {file}
   - Function: loadFile()
   - Severity: Critical
   - Fix: Added path.resolve() + validation

2. Hardcoded Secret Removal
   - File: {file}
   - Function: generateToken()
   - Severity: High
   - Fix: Moved to environment variable
```

### 6. Finalize or Rollback

검증 결과에 따라 최종 결정을 내립니다.

#### Success Path

```bash
# Stash 제거 (백업 불필요)
git stash drop

# 변경사항 확정
# (커밋은 사용자가 직접 수행)
```

```
✅ Refactoring Complete

Changes ready for commit:
  - {file}: {extractedCount} functions extracted
  - Original function reduced by {reduction}%
  - {securityFixCount} security issues fixed

Suggested commit message:
  refactor({area}): extract functions from {functionName}

  - Split {originalLines}-line function into {newFunctionCount} smaller functions
  - Reduced complexity from {oldCC} to {newCC}
  - Fixed {securityFixCount} security issues (path traversal, hardcoded secrets)

Next steps:
  1. Review changes: git diff
  2. Commit: git commit -am "refactor: ..."
  3. Test manually if needed
```

#### Failure Path

```bash
# Stash 복원 (변경사항 되돌리기)
git stash pop

# 또는 변경사항 완전 제거
git checkout -- {file}
```

```
❌ Verification Failed

Reason: {failureReason}

Changes have been rolled back to original state.

Options:
  1. Modify refactoring plan (return to Step 1)
  2. Manual refactoring
  3. Skip this function for now

Your choice: ___
```

### 7. Generate Report

결과 보고서를 생성합니다.

```markdown
# Refactor Function Report

Generated: {timestamp}
Workflow: refactor-function

---

## Summary

| Metric | Value |
|--------|-------|
| Function | {functionName} |
| File | {file} |
| Language | {language} |
| Status | ✅ Success / ❌ Failed |

---

## Refactoring Details

### Original Function
- Lines: {originalLines}
- Complexity: {originalComplexity}
- Issues: {issueTypes}

### Extracted Functions

1. **{functionName1}**
   - Lines: {lines}
   - Responsibility: {responsibility}
   - Parameters: {params}
   - Return: {returnType}

2. **{functionName2}**
   - Lines: {lines}
   - Responsibility: {responsibility}
   - Parameters: {params}
   - Return: {returnType}

... (모든 추출된 함수)

---

## Quality Improvement

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Lines (main) | {before} | {after} | {reduction}% |
| Complexity | {before} | {after} | {reduction}% |
| Functions | 1 | {count} | +{count-1} |

---

## Security Fixes

{security_fix_list}

---

## Verification Results

- ✅ Build: Passed
- ✅ Tests: {testStatus}
- ✅ Manual: Confirmed by user
- ✅ Security: {fixCount} issues resolved

---

## Files Modified

- {file}

---

## Next Steps

- [ ] Review extracted functions
- [ ] Add tests for new functions
- [ ] Update documentation
- [ ] Consider reusing extracted functions elsewhere

---

## Rollback Info

Stash ID: {stashId} (dropped on success)
Timestamp: {timestamp}
```

**보고서 저장**:
```bash
# 보고서 저장 위치
sdd-docs/audits/refactor-function-report.md
```

### 8. Update Audit Result

`audit-result.json`을 업데이트합니다.

```typescript
// 해당 이슈의 status 업데이트
{
  "id": "FUNC-001",
  "status": "resolved", // pending → resolved
  "resolvedAt": "2025-12-20T10:30:00Z",
  "resolution": {
    "workflow": "refactor-function",
    "extractedFunctions": 5,
    "linesReduction": "90%",
    "complexityReduction": "84%",
    "securityFixes": 2
  }
}
```

---

## OUTPUT

```typescript
{
  verificationResult: {
    buildPassed: boolean,
    testsPassed: boolean,
    manualVerified: boolean,
    securityVerified: boolean,
  },
  metrics: QualityMetrics,
  securityFixes: SecurityFix[],
  reportPath: string,
  status: 'success' | 'failed',
  rollbackPerformed: boolean,
}
```

---

## DISPLAY

### Success Case

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Refactor Function Workflow Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Results:

Function: {functionName}
Status: ✅ Success
Time: {duration}s

Improvements:
  ✅ Lines reduced: 505 → 50 (90%)
  ✅ Complexity reduced: 45 → 7 (84%)
  ✅ Functions extracted: 5
  ✅ Security fixes: 2

Verification:
  ✅ Build: Passed
  ✅ Tests: Passed ({testCount} tests)
  ✅ Manual: Confirmed
  ✅ Security: All issues resolved

📄 Report: sdd-docs/audits/refactor-function-report.md

💾 Rollback point removed (changes confirmed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next: Review changes and commit

git diff {file}
git commit -am "refactor({area}): extract functions from {functionName}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Failure Case

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Refactor Function Workflow Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Function: {functionName}
Status: ❌ Failed
Reason: {failureReason}

Verification:
  ❌ Build: Failed
  {error details}

🔄 Changes rolled back to original state

Options:
  1. Modify plan and retry (Step 1)
  2. Manual refactoring
  3. Skip for now

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## SAFETY CHECKS

### 1. Build Failure
```
❌ Build failed after refactoring
   Reason: {error}
   Action: Rolling back...
```

### 2. Test Failure
```
❌ Tests failed after refactoring
   Failed: {testNames}
   Action: Rolling back...
```

### 3. Manual Verification Failed
```
⚠️ User reported behavioral differences
   Action: Rolling back...
```

---

## FINAL WORKFLOW STATUS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 Workflow Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Steps Completed:
  ✅ Step 1: Analyze (User approved)
  ✅ Step 2: Extract (5 functions)
  ✅ Step 3: Verify (All checks passed)

Total Time: {totalDuration}

Audit Result Updated:
  - Issue ID: {issueId}
  - Status: pending → resolved
  - Resolved at: {timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
