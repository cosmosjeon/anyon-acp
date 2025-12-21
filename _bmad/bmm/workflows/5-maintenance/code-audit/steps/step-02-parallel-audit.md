---
name: 'step-02-parallel-audit'
description: 'Launch 3 parallel agents to audit Frontend, Desktop, and Server'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-02-parallel-audit.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-03-complete.md'
---

# Step 2: Parallel Audit Execution

**Progress: Step 2 of 3** - Next: Complete

---

## STEP GOAL

3개의 Task 에이전트를 병렬로 실행하여 Frontend, Desktop, Server를 동시에 분석합니다.

---

## CRITICAL: PARALLEL EXECUTION

**You MUST launch all 3 agents in a SINGLE message with multiple Task tool calls.**

Do NOT wait for one agent to complete before launching the next.

---

## AGENT DEFINITIONS

### Agent 1: Frontend Auditor

```yaml
subagent_type: general-purpose
description: "Audit Frontend codebase"
prompt: |
  You are a code quality auditor. Analyze the Frontend codebase for maintainability issues.

  **Scope**: src/**/*.{ts,tsx}

  **Criteria** (from sdd-docs/audits/README.md):
  1. AI 생성 코드 문제 (우선)
     - 중복 코드 (DRY 위반)
     - 문맥 무시 (기존 패턴 미사용)
     - 실패한 리팩토링 (.refactored/.optimized 파일)

  2. Bloaters
     - Long Method: 50줄+ (Critical), 30-50줄 (Warning)
     - Long File: 500줄+ (Warning)
     - Cyclomatic Complexity: 10+ (Critical)

  3. Dispensables
     - Dead Code
     - Duplicated Code

  4. SOLID 위반
     - Single Responsibility 위반

  5. 기술 부채
     - TODO/FIXME 주석
     - any 타입 사용
     - console.log 남발

  **Output**: Write detailed report to:
  sdd-docs/audits/frontend/audit-report.md

  **Format**: Follow the template structure with:
  - Executive Summary (Critical/Warning/Info counts)
  - Detailed findings by category
  - File-by-file issue list
  - Recommendations
```

### Agent 2: Desktop Auditor

```yaml
subagent_type: general-purpose
description: "Audit Desktop (Tauri/Rust) codebase"
prompt: |
  You are a code quality auditor. Analyze the Desktop/Tauri codebase for maintainability issues.

  **Scope**: src-tauri/src/**/*.rs

  **Criteria** (Rust-adapted from sdd-docs/audits/README.md):
  1. AI 생성 코드 문제 (우선)
     - 중복 코드 (DRY 위반)
     - 문맥 무시 (기존 패턴 미사용)

  2. Bloaters (Rust-specific)
     - Long Function: 50줄+ (Critical), 30-50줄 (Warning)
     - Long File: 500줄+ (Warning)
     - Complex match statements

  3. Rust-specific Issues
     - unwrap() 과다 사용 (Warning)
     - expect() 과다 사용 (Warning)
     - clone() 과다 사용 (Info)
     - Dead code (#[allow(dead_code)])

  4. 기술 부채
     - TODO/FIXME 주석
     - Hardcoded secrets
     - Magic numbers

  **Output**: Write detailed report to:
  sdd-docs/audits/desktop/audit-report.md

  **Format**: Follow the template structure with:
  - Executive Summary (Critical/Warning/Info counts)
  - Detailed findings by category
  - File-by-file issue list
  - Recommendations
```

### Agent 3: Server Auditor

```yaml
subagent_type: general-purpose
description: "Audit Server codebase"
prompt: |
  You are a code quality auditor. Analyze the Server codebase for maintainability issues.

  **Scope**: server/**/*.{js,ts}

  **Criteria** (from sdd-docs/audits/README.md):
  1. AI 생성 코드 문제 (우선)
     - 중복 코드 (DRY 위반)
     - 문맥 무시 (기존 패턴 미사용)
     - Embedded HTML in JS (AI code smell)

  2. Bloaters
     - Long Function: 50줄+ (Critical), 30-50줄 (Warning)
     - Monolithic file structure

  3. Server-specific Issues
     - Hardcoded secrets (Critical)
     - Permissive CORS (Warning)
     - No rate limiting (Warning)
     - In-memory database (Warning)

  4. 기술 부채
     - TODO/FIXME 주석
     - console.log 대신 로거 사용
     - Magic numbers

  **Output**: Write detailed report to:
  sdd-docs/audits/server/audit-report.md

  **Format**: Follow the template structure with:
  - Executive Summary (Critical/Warning/Info counts)
  - Detailed findings by category
  - File-by-file issue list
  - Recommendations
```

---

## EXECUTION COMMAND

**Launch all 3 agents NOW in a single message:**

```
<Tool: Task>
  subagent_type: general-purpose
  description: "Audit Frontend codebase"
  prompt: [Agent 1 prompt]
</Task>

<Tool: Task>
  subagent_type: general-purpose
  description: "Audit Desktop codebase"
  prompt: [Agent 2 prompt]
</Task>

<Tool: Task>
  subagent_type: general-purpose
  description: "Audit Server codebase"
  prompt: [Agent 3 prompt]
</Task>
```

---

## WAIT FOR COMPLETION

After launching, wait for all 3 agents to complete using TaskOutput.

---

## PROCEED TO NEXT STEP

After all agents complete:

```
→ LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-03-complete.md
```
