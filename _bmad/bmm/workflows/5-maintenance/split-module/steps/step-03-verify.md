---
name: 'step-03-verify'
description: 'Verify build and tests, generate report, update audit results'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/split-module/steps/step-03-verify.md'
nextStepFile: null
---

# Step 3: Verify & Report

**Progress: Step 3 of 3**

---

## STEP GOAL

분할된 코드가 정상적으로 빌드되고 테스트를 통과하는지 검증하고, 결과 보고서를 생성합니다.

---

## EXECUTION SEQUENCE

### 1. Pre-Verification Check

검증 시작 전 파일 생성 확인:

```bash
# 생성된 파일들이 존재하는지 확인
ls -la {targetDir}/

# 예상 파일 목록과 비교
for file in {expectedFiles}; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing file: $file"
    exit 1
  fi
done
```

### 2. Language-Specific Build Verification

언어별로 빌드를 실행합니다.

---

#### TypeScript Verification

```bash
# Option 1: TypeScript compiler
npx tsc --noEmit

# Option 2: Vite build (프로젝트에 따라)
npm run build

# Option 3: Bun (ANYON 프로젝트)
bun build
```

**성공 조건**:
- Exit code: 0
- No type errors
- No missing imports

**실패 시**:
```
❌ TypeScript 빌드 실패

오류:
  {error_message}

롤백 중...
```

---

#### Rust Verification

```bash
# Debug build
cargo build

# Release build (권장)
cargo build --release

# Clippy (추가 검증)
cargo clippy -- -D warnings
```

**성공 조건**:
- Exit code: 0
- No compilation errors
- No clippy warnings

**실패 시**:
```
❌ Rust 빌드 실패

오류:
  {error_message}

롤백 중...
```

---

#### JavaScript Verification

```bash
# Syntax check
node --check {targetDir}/index.js

# ESLint (있는 경우)
npx eslint {targetDir}/

# Build (webpack/rollup 등)
npm run build
```

**성공 조건**:
- Exit code: 0
- No syntax errors
- No linting errors

---

### 3. Run Tests

프로젝트의 테스트를 실행합니다.

#### TypeScript/JavaScript Tests

```bash
# Bun test (ANYON 프로젝트)
bun test

# 또는 Jest/Vitest
npm test

# 특정 영역만 테스트
bun test {targetDir}/*.test.ts
```

#### Rust Tests

```bash
# Unit tests
cargo test

# Integration tests
cargo test --test '*'

# 특정 모듈만 테스트
cargo test {module_name}
```

**테스트 실패 시**:
```
⚠️ 테스트 실패: {failed_count}개

실패한 테스트:
  - {test1}
  - {test2}

롤백할까요? (yes/no)
```

### 4. Decide on Rollback

빌드/테스트 결과에 따라 롤백 여부를 결정합니다.

#### Success Path

```bash
# 백업 제거
git stash drop

echo "✅ 검증 성공 - 백업 제거됨"
```

#### Failure Path

```bash
# 변경 사항 롤백
git stash pop

# 생성된 디렉토리 제거
rm -rf {targetDir}

echo "❌ 검증 실패 - 변경 사항 롤백됨"
```

#### Partial Success

테스트는 실패했지만 빌드는 성공한 경우:

```yaml
질문: "빌드는 성공했으나 테스트가 실패했습니다. 어떻게 할까요?"
옵션:
  - keep: "변경사항 유지 (테스트는 수동 수정)"
  - rollback: "전체 롤백"
```

### 5. Update Audit Results

`sdd-docs/audits/audit-result.json`에서 처리된 이슈를 제거합니다.

```typescript
// audit-result.json 로드
const auditResult = JSON.parse(fs.readFileSync('sdd-docs/audits/audit-result.json', 'utf-8'));

// 처리된 이슈 제거
auditResult.issues = auditResult.issues.filter(issue =>
  !(issue.action === 'split_file' && issue.file === targetFile)
);

// 통계 업데이트
auditResult.summary = {
  critical: auditResult.issues.filter(i => i.priority === 'P0').length,
  warning: auditResult.issues.filter(i => i.priority === 'P1').length,
  info: auditResult.issues.filter(i => i.priority === 'P2').length,
};

// 저장
fs.writeFileSync('sdd-docs/audits/audit-result.json', JSON.stringify(auditResult, null, 2));
```

### 6. Generate Split Report

`sdd-docs/audits/split-report.md` 보고서를 생성합니다.

```markdown
# Module Split Report

**Date**: {current_date}
**Workflow**: split-module
**Status**: {success/failed}

---

## Summary

| 항목 | 값 |
|------|-----|
| 원본 파일 | {originalFile} ({originalLines}줄) |
| 출력 디렉토리 | {targetDir}/ |
| 생성된 모듈 | {moduleCount}개 |
| 언어 | {language} |
| 빌드 결과 | {build_status} |
| 테스트 결과 | {test_status} |

---

## Created Modules

### {module1.name}
- **File**: `{module1.filename}`
- **Lines**: ~{module1.lines}
- **Symbols**: {module1.symbolCount}개
- **Exports**:
  - {symbol1}
  - {symbol2}
  - ...

### {module2.name}
...

---

## Updated Files

Import/use 문이 업데이트된 파일:

- `{file1}` - {changeCount1}개 변경
- `{file2}` - {changeCount2}개 변경

---

## Verification Results

### Build
\`\`\`
{build_output}
\`\`\`

### Tests
\`\`\`
{test_output}
\`\`\`

---

## Issues Resolved

audit-result.json에서 다음 이슈 제거됨:

- [{issue_id}] {issue_title}

---

## Next Steps

{if success}
✅ 모듈 분할 완료
  - 코드 리뷰 권장
  - 추가 리팩토링 검토

{if failed}
❌ 모듈 분할 실패
  - 롤백 완료
  - 수동 분할 필요
```

### 7. Display Final Summary

사용자에게 최종 결과를 표시합니다.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Split Module Workflow 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 결과:

원본 파일: {originalFile} ({originalLines}줄)
→ 분할됨: {targetDir}/ ({moduleCount}개 모듈)

생성된 파일:
  ✓ {file1}
  ✓ {file2}
  ✓ {file3}

업데이트된 파일: {updateCount}개

검증 결과:
  ✓ 빌드: 성공
  ✓ 테스트: {testResult}

📄 상세 보고서: sdd-docs/audits/split-report.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 다음 단계:
  1. 코드 리뷰 수행
  2. 추가 리팩토링 검토
  3. 다른 대형 파일 분할 (있는 경우)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ERROR SCENARIOS

### Build Failure

```typescript
if (buildExitCode !== 0) {
  console.error('❌ 빌드 실패');
  console.error(buildOutput);

  // 자동 롤백
  await rollback(stashId);

  // 실패 보고서 생성
  await generateFailureReport({
    step: 'build',
    error: buildOutput,
  });

  process.exit(1);
}
```

### Test Failure

```typescript
if (testExitCode !== 0) {
  console.warn('⚠️ 테스트 실패');
  console.warn(testOutput);

  // 사용자에게 선택 요청
  const choice = await askUser({
    question: '빌드는 성공했으나 테스트가 실패했습니다. 어떻게 할까요?',
    options: {
      keep: '변경사항 유지 (테스트는 수동 수정)',
      rollback: '전체 롤백',
    },
  });

  if (choice === 'rollback') {
    await rollback(stashId);
  } else {
    await generatePartialSuccessReport();
  }
}
```

### Rollback Function

```typescript
async function rollback(stashId: string) {
  console.log('🔄 롤백 중...');

  // 1. 생성된 디렉토리 제거
  await exec(`rm -rf ${targetDir}`);

  // 2. Git stash pop
  await exec(`git stash pop ${stashId}`);

  // 3. 확인
  console.log('✅ 롤백 완료');
}
```

---

## OUTPUT FILES

| File | Purpose |
|------|---------|
| `sdd-docs/audits/split-report.md` | 상세 분할 보고서 |
| `sdd-docs/audits/audit-result.json` | 업데이트된 감사 결과 (이슈 제거됨) |
| `{targetDir}/*` | 분할된 모듈 파일들 (성공 시) |

---

## WORKFLOW COMPLETE

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Split Module Workflow 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{success_message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**End of Workflow**
