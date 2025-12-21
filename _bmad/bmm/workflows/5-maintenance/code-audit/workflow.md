# Code Audit Workflow

> BMAD 패턴 기반 코드 품질/유지보수성 자동 분석 워크플로우

---

## WORKFLOW ARCHITECTURE

- **Execution Mode**: Automatic (no user interaction during workflow)
- **Parallelization**: 3 agents run simultaneously for Frontend/Desktop/Server
- **Micro-file Design**: Each step is self-contained
- **Just-In-Time Loading**: Only current step in memory
- **Sequential Enforcement**: Steps execute in exact order

---

## WORKFLOW RULES (NON-NEGOTIABLE)

### Execution Rules
- 🚀 **AUTO-EXECUTE**: Do not wait for user confirmation between steps
- 🔄 **PARALLEL AGENTS**: Launch 3 agents simultaneously in Step 2
- ⏱️ **WAIT FOR ALL**: Wait until all parallel agents complete
- 📊 **AGGREGATE RESULTS**: Combine all results in Step 3

### Critical Rules
- 🛑 NEVER skip steps
- 📖 ALWAYS read entire step file before execution
- 💾 ALWAYS save outputs to specified paths
- ✅ ALWAYS reference `@sdd-docs/audits/README.md` for criteria

---

## WORKFLOW EXECUTION

### Step 1: Initialize
```
LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-01-init.md
EXECUTE: Environment setup and directory preparation
```

### Step 2: Parallel Audit
```
LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-02-parallel-audit.md
EXECUTE: Launch 3 Task agents in parallel
WAIT: All agents complete
```

### Step 3: Complete
```
LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-03-complete.md
EXECUTE: Aggregate results and generate summary
```

---

## OUTPUT FILES

| File | Purpose |
|------|---------|
| `sdd-docs/audits/frontend/audit-report.md` | Frontend analysis |
| `sdd-docs/audits/desktop/audit-report.md` | Desktop (Tauri/Rust) analysis |
| `sdd-docs/audits/server/audit-report.md` | Server analysis |
| `sdd-docs/audits/code-audit-report.md` | Overall summary |
| `sdd-docs/audits/audit-result.json` | JSON results |

---

## ANALYSIS CRITERIA

All agents MUST follow the criteria defined in:
```
@sdd-docs/audits/README.md
```

### Priority Order:
1. **AI 생성 코드 문제** (우선 검사)
2. **Bloaters** (Long Method 50줄+, Complexity 10+)
3. **Dispensables** (Dead Code, Duplication)
4. **SOLID 위반**
5. **기술 부채** (TODO, any, 하드코딩)

### Severity Classification:
- **Critical**: Push 차단, 즉시 수정 필요
- **Warning**: 권장 수정
- **Info**: 참고 사항

---

## START WORKFLOW

**BEGIN NOW**: Load Step 1 and execute automatically.

```
→ LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-01-init.md
```
