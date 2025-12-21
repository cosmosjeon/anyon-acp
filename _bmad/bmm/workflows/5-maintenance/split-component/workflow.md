# Split Component Workflow

> React 컴포넌트를 여러 파일로 분할하는 BMAD 워크플로우

---

## WORKFLOW ARCHITECTURE

- **Execution Mode**: Semi-automatic (사용자 확인 후 진행)
- **Input Source**: `sdd-docs/audits/audit-result.json`
- **Target Issues**: `action: "split_file"` AND `area: "frontend"`
- **Parallelization**: None (sequential execution)
- **Micro-file Design**: Each step is self-contained
- **Safety First**: Git stash backup before modifications

---

## WORKFLOW RULES (NON-NEGOTIABLE)

### Execution Rules
- 🤝 **USER CONFIRMATION**: Wait for user approval of split plan
- 📋 **SEQUENTIAL**: Execute steps in exact order
- 💾 **BACKUP FIRST**: Always create git stash before modifications
- 🧪 **VERIFY ALWAYS**: Run TypeScript compilation after split

### Critical Rules
- 🛑 NEVER skip steps
- 📖 ALWAYS read entire step file before execution
- 🔍 ALWAYS analyze component structure before splitting
- ✅ ALWAYS verify build success before finalizing

---

## USE CASES

### 대상 컴포넌트 예시

| File | Lines | Target Structure |
|------|-------|------------------|
| `ToolWidgets.tsx` | 3,273줄 | → `widgets/` directory with individual widgets |
| `Settings.tsx` | 1,279줄 | → Individual setting components |
| Large container components | 500줄+ | → Separate presentational components |

### 분할 기준
- 파일 크기: 500줄 이상
- 내부 컴포넌트: 3개 이상의 독립적 컴포넌트
- 재사용 가능성: 다른 곳에서 사용 가능한 컴포넌트

---

## WORKFLOW EXECUTION

### Step 1: Analyze
```
LOAD: @_bmad/bmm/workflows/5-maintenance/split-component/steps/step-01-analyze.md
EXECUTE: Component analysis and split plan generation
OUTPUT: Split plan for user confirmation
```

### Step 2: Split
```
LOAD: @_bmad/bmm/workflows/5-maintenance/split-component/steps/step-02-split.md
EXECUTE: Extract components to separate files
OUTPUT: Restructured component files
```

### Step 3: Verify
```
LOAD: @_bmad/bmm/workflows/5-maintenance/split-component/steps/step-03-verify.md
EXECUTE: Build verification and result reporting
OUTPUT: Verification report and updated audit-result.json
```

---

## OUTPUT FILES

| File | Purpose |
|------|---------|
| `[component-name]/index.ts` | Re-export barrel file |
| `[component-name]/[SubComponent].tsx` | Individual component files |
| `sdd-docs/audits/frontend/split-report.md` | Split operation report |
| `sdd-docs/audits/audit-result.json` | Updated with resolved issues |

---

## SAFETY MEASURES

### 1. Rollback Points
- Git stash created before any file modifications
- Can rollback with `git stash pop` if issues occur

### 2. Verification
- TypeScript compilation: `npm run build` or `tsc --noEmit`
- Test execution (if tests exist): `bun test`

### 3. User Control
- User approves split plan before execution
- Can abort at any time before Step 2

---

## START WORKFLOW

**IMPORTANT**: This workflow requires user input. Do not auto-execute all steps.

```
→ LOAD: @_bmad/bmm/workflows/5-maintenance/split-component/steps/step-01-analyze.md
```
