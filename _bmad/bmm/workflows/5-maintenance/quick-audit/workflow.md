# Quick Audit Workflow

> 빠른 코드 품질 체크 - Critical 이슈만 집중

---

## WORKFLOW ARCHITECTURE

- **Execution Mode**: Automatic
- **Parallelization**: 3 agents (Frontend/Desktop/Server)
- **Focus**: Critical issues only (숫자 기반 빠른 체크)
- **Output**: Single summary file

---

## WORKFLOW RULES

- 🚀 **AUTO-EXECUTE**: 사용자 확인 없이 진행
- 🔄 **PARALLEL AGENTS**: 3개 에이전트 동시 실행
- 📊 **QUICK STATS**: 숫자 기반 요약만

---

## EXECUTION

### Step 1: Parallel Quick Scan

```
LOAD: @_bmad/bmm/workflows/5-maintenance/quick-audit/steps/step-01-parallel-scan.md
EXECUTE: Launch 3 agents, wait for completion
```

### Step 2: Summarize

```
LOAD: @_bmad/bmm/workflows/5-maintenance/quick-audit/steps/step-02-summarize.md
EXECUTE: Combine results into single file
```

---

## OUTPUT

| File | Purpose |
|------|---------|
| `sdd-docs/audits/quick-audit-result.md` | 전체 요약 |

---

## START WORKFLOW

**BEGIN NOW**: Load Step 1 and execute.

```
→ LOAD: @_bmad/bmm/workflows/5-maintenance/quick-audit/steps/step-01-parallel-scan.md
```
