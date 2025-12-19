---
description: 'Synchronize project documentation with current codebase state'
---

# Sync Documentation

Documentation synchronization command for SDD (Spec-Driven Development) methodology.

## Instructions

When this command is invoked, perform the following steps:

### 1. Load Current State

Read the sync status file:
- `_bmad-output/sync-status.json`

### 2. Check for Drift

For each document in `documents.auto_generated`:
- Compare `last_synced` timestamp with source file modification times
- If source files are newer, mark document for regeneration

For each document in `documents.manual_with_drift_detection`:
- Check if watched files have changed since `last_reviewed`
- If changes detected, add to `drift_indicators` array

### 3. Regenerate Auto-Generated Documents

For documents marked for regeneration:

**component-inventory.md:**
- Scan `src/components/**/*.tsx` for React components
- Scan `src/hooks/**/*.ts` for custom hooks
- Scan `src/stores/**/*.ts` for Zustand stores
- Update component counts and list

**api-contracts.md:**
- Scan `src-tauri/src/commands/**/*.rs` for Tauri commands
- Scan `server/src/**/*.js` for REST endpoints
- Update API documentation

**data-models.md:**
- Scan `src-tauri/src/db/**/*.rs` for SQLite schemas
- Scan `src/types/**/*.ts` for TypeScript interfaces
- Update data model documentation

**source-tree-analysis.md:**
- Regenerate directory tree structure
- Update file counts and organization

### 4. Update Metadata

For hybrid documents (project-overview.md, development-guide.md):
- Update auto-generated sections (statistics, versions)
- Preserve manual sections unchanged

### 5. Report Drift Warnings

If manual documents have drift indicators:
- List which architecture docs may need review
- Show which source files changed

### 6. Update Sync Status

- Update `last_synced` timestamps for regenerated docs
- Update `last_full_sync` timestamp
- Save updated `sync-status.json`

## Output

Provide a summary report:
```
Documentation Sync Report
========================
Auto-regenerated: X documents
Drift warnings: Y documents need review
Audit progress: Z/242 issues resolved
Last synced: [timestamp]
```
