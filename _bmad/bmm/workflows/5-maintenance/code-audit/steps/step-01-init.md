---
name: 'step-01-init'
description: 'Initialize audit environment and prepare output directories'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-01-init.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-02-parallel-audit.md'
---

# Step 1: Initialize Audit Environment

**Progress: Step 1 of 3** - Next: Parallel Audit

---

## STEP GOAL

프로젝트 구조를 확인하고 감사 출력 디렉토리를 준비합니다.

---

## AUTOMATIC EXECUTION SEQUENCE

### 1. Verify Project Structure

다음 디렉토리가 존재하는지 확인:
- `src/` - Frontend (React + TypeScript)
- `src-tauri/src/` - Desktop Backend (Rust)
- `server/` - Auth Server (Node.js)

### 2. Check Audit Criteria

분석 기준 문서 확인:
```
@sdd-docs/audits/README.md
```

이 파일이 없으면 에러 출력 후 중단.

### 3. Prepare Output Directories

다음 디렉토리 존재 확인/생성:
```bash
mkdir -p sdd-docs/audits/frontend
mkdir -p sdd-docs/audits/desktop
mkdir -p sdd-docs/audits/server
```

### 4. Backup Existing Reports (Optional)

기존 보고서가 있으면 타임스탬프 백업:
- `code-audit-report.md` → `code-audit-report.backup.md`

---

## OUTPUT

```
✅ Step 1 Complete: Environment initialized

Project Structure:
  - Frontend: src/ (found)
  - Desktop: src-tauri/src/ (found)
  - Server: server/ (found)

Output Directories: Ready
Audit Criteria: Loaded from README.md
```

---

## PROCEED TO NEXT STEP

**AUTO-CONTINUE**: Load Step 2 immediately.

```
→ LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-02-parallel-audit.md
```
