---
name: 'step-03-verify'
description: 'Verify build success and generate report'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/split-component/steps/step-03-verify.md'
nextStepFile: null
---

# Step 3: Verify & Report

**Progress: Step 3 of 3** - Final Step

---

## STEP GOAL

TypeScript 컴파일을 검증하고, 결과 보고서를 생성하며, audit-result.json을 업데이트합니다.

---

## EXECUTION SEQUENCE

### 1. TypeScript Compilation Check

분할된 컴포넌트들이 올바르게 작동하는지 검증:

```bash
# Option 1: Full build (recommended)
npm run build

# Option 2: Type check only (faster)
tsc --noEmit

# Option 3: Vite type check
npx vite-node --check
```

**검증 결과 평가**:

```typescript
interface VerificationResult {
  command: string;
  exitCode: number;
  passed: boolean;
  errors: string[];
  warnings: string[];
}
```

### 2. Run Tests (if exist)

테스트가 있는 경우 실행:

```bash
# Check if tests exist
if [ -f "src/components/widgets/*.test.tsx" ]; then
  bun test src/components/widgets/
fi
```

### 3. Collect Results

#### 3.1 Changed Files

```bash
git diff --name-only
git status --porcelain
```

#### 3.2 File Metrics

```typescript
interface FileMetrics {
  created: {
    components: string[];
    shared: string[];
    index: string[];
    count: number;
  };
  updated: {
    imports: string[];
    count: number;
  };
  deleted: {
    original: string[];
    count: number;
  };
}
```

### 4. Generate Split Report

**파일**: `sdd-docs/audits/frontend/split-report.md`

```markdown
# Component Split Report

**Date:** [현재 날짜]
**Workflow:** BMAD Split Component v1.0
**Target:** [원본 파일명]

---

## Executive Summary

| 항목 | 값 |
|------|-----|
| 원본 파일 | [파일명] (N줄) |
| 생성된 컴포넌트 | N개 |
| 공유 파일 | N개 |
| 업데이트된 참조 | N개 파일 |

### Verification Result

| 검증 항목 | 결과 |
|----------|------|
| TypeScript Compilation | ✅/❌ |
| Tests | ✅/❌/⏭️ (없음) |

---

## Split Details

### Original File
- **Path:** `src/components/ToolWidgets.tsx`
- **Size:** 3,273 lines
- **Components:** 27
- **Shared Utilities:** 8

### New Structure
```
widgets/
├── index.ts                    # Barrel file (27 exports)
├── ApiKeyWidget.tsx            # 89 lines
├── PromptWidget.tsx            # 156 lines
├── HistoryWidget.tsx           # 203 lines
├── ... (24 more components)
└── shared/
    ├── types.ts                # 5 type definitions
    └── utils.ts                # 3 utility functions
```

---

## Created Files

### Components (27 files)
1. `src/components/widgets/ApiKeyWidget.tsx` (89 lines)
2. `src/components/widgets/PromptWidget.tsx` (156 lines)
3. `src/components/widgets/HistoryWidget.tsx` (203 lines)
...

### Shared Files (2 files)
1. `src/components/widgets/shared/types.ts` (45 lines)
2. `src/components/widgets/shared/utils.ts` (78 lines)

### Index File (1 file)
1. `src/components/widgets/index.ts` (31 lines)

---

## Updated References

다음 파일들의 import 경로가 업데이트되었습니다:

| File | Old Import | New Import |
|------|------------|------------|
| `src/pages/Dashboard.tsx` | `from './ToolWidgets'` | `from './widgets'` |
| `src/components/ToolPanel.tsx` | `from '@/components/ToolWidgets'` | `from '@/components/widgets'` |
...

---

## Metrics

### Code Distribution
- **Average component size:** 121 lines
- **Largest component:** HistoryWidget.tsx (203 lines)
- **Smallest component:** StatusWidget.tsx (45 lines)

### Maintainability Improvement
- **Before:** 1 file × 3,273 lines = Hard to navigate
- **After:** 30 files × ~110 lines avg = Easy to maintain

---

## Verification Details

### TypeScript Compilation
```
Command: npm run build
Exit Code: 0
Status: ✅ PASS

No type errors found.
```

### Tests
```
Command: bun test src/components/widgets/
Status: ⏭️ SKIPPED (no tests found)
```

---

## Rollback Information

롤백이 필요한 경우:
```bash
git stash pop
```

현재 stash:
```
stash@{0}: split-component-backup-20250120-143022
```

---

**Report Generated:** [timestamp]
**Workflow:** BMAD Split Component v1.0
```

### 5. Update audit-result.json

처리된 이슈를 resolved로 표시:

```typescript
// Read current audit-result.json
const auditResult = await readJSON('sdd-docs/audits/audit-result.json');

// Find and update the issue
const issueIndex = auditResult.issues.findIndex(
  i => i.action === 'split_file' && i.file === targetFile
);

if (issueIndex !== -1) {
  auditResult.issues[issueIndex] = {
    ...auditResult.issues[issueIndex],
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: 'split-component-workflow',
    resolution: {
      method: 'component_split',
      filesCreated: createdFiles.length,
      targetDirectory: targetDirectory,
    },
  };
}

// Write back
await writeJSON('sdd-docs/audits/audit-result.json', auditResult);
```

### 6. Cleanup Rollback Point

**성공 시**:
```bash
git stash drop
```

**출력**:
```
✅ Rollback point removed (changes verified)
```

**실패 시**:
```
⚠️ Rollback point preserved
   롤백하려면: git stash pop
```

---

## DISPLAY - SUCCESS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Split Component Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  원본: ToolWidgets.tsx (3,273 lines)

  생성된 파일: 30개
    📦 Components: 27개
    🔧 Shared: 2개
    📋 Index: 1개

  업데이트된 파일: 5개
    🔗 Import 경로 변경

📁 새 구조:
  src/components/widgets/
  ├── index.ts
  ├── ApiKeyWidget.tsx
  ├── PromptWidget.tsx
  ├── ... (24 more)
  └── shared/
      ├── types.ts
      └── utils.ts

🧪 검증 결과:
  TypeScript: ✅ npm run build 성공
  Tests: ⏭️ 없음

📝 생성된 보고서:
  - sdd-docs/audits/frontend/split-report.md

📋 audit-result.json 업데이트:
  - Issue [ID] marked as resolved

💾 Rollback point removed (changes verified)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## DISPLAY - FAILURE

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Split Component Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  생성된 파일: 30개
  업데이트된 파일: 5개

🔴 검증 실패:
  TypeScript: ❌ Compilation errors

에러 내용:
  src/components/widgets/ApiKeyWidget.tsx:15:23
    → Cannot find name 'WidgetConfig'

  src/components/widgets/shared/types.ts:8:12
    → Type 'unknown' is not assignable to type 'string'

💡 권장 조치:
  1. 에러 수동 수정 후 재검증
  2. 또는 롤백: git stash pop

⚠️ Rollback point preserved
   롤백: git stash pop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ERROR HANDLING

### TypeScript 에러 발생 시

```typescript
if (verificationResult.exitCode !== 0) {
  console.error('❌ TypeScript compilation failed');
  console.error('Errors:');
  verificationResult.errors.forEach(err => console.error(`  - ${err}`));

  console.log('\n💡 Options:');
  console.log('  1. Fix errors manually and re-run verification');
  console.log('  2. Rollback: git stash pop');
  console.log('\n⚠️ Rollback point preserved');

  // Don't drop stash
  // Don't update audit-result.json
  return { success: false, errors: verificationResult.errors };
}
```

### Partial Success

일부 파일만 생성되고 실패한 경우:

```typescript
if (createdFiles.length < expectedFiles.length) {
  console.warn('⚠️ Partial split completed');
  console.warn(`  Expected: ${expectedFiles.length} files`);
  console.warn(`  Created: ${createdFiles.length} files`);

  // Generate partial report
  // Preserve rollback point
}
```

---

## POST-WORKFLOW ACTIONS

### 성공 시 권장 작업

1. **커밋 생성**:
```bash
git add -A
git commit -m "refactor(frontend): split ToolWidgets into individual components

- Split ToolWidgets.tsx (3,273 lines) into 27 component files
- Created shared types and utilities
- Updated import paths in 5 files

Resolves: [Issue ID from audit-result.json]

🤖 Generated with Claude Code
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

2. **수동 검토**:
   - 각 컴포넌트 파일의 import가 올바른지 확인
   - 불필요한 import 제거
   - 코드 포맷팅 (prettier)

3. **문서 업데이트**:
   - Component inventory 업데이트
   - Architecture docs 업데이트 (필요시)

### 실패 시 권장 작업

1. **에러 분석**:
   - TypeScript 에러 메시지 확인
   - 누락된 import 식별
   - 타입 불일치 수정

2. **수동 수정**:
   - 에러가 발생한 파일 직접 수정
   - `npm run build`로 재검증

3. **롤백 고려**:
   - 에러가 너무 많으면 롤백 권장
   - 분할 전략 재검토 후 재시도

---

## WORKFLOW COMPLETE

Split Component 워크플로우가 완료되었습니다.

### 다음 단계

성공한 경우:
1. 변경사항 커밋
2. `/code-audit` 재실행하여 개선 확인
3. 다른 split_file 이슈가 있으면 반복

실패한 경우:
1. 에러 수정 후 재검증
2. 또는 롤백 후 수동 분할
