# Legacy Code Cleanup Plan

## Overview
- **Total Files**: 19개
- **Estimated Time**: 병렬 실행으로 1-2분
- **Risk Level**: Low (모든 파일이 미사용 확인됨)

---

## Phase 1: Parallel Deletion (3개 서브에이전트 동시 실행)

### Agent 1: Components Cleanup
**삭제 대상 (10개)**
```
src/components/TokenCounter.tsx
src/components/CodeViewer.tsx
src/components/SessionDropdown.tsx
src/components/PreviewPromptDialog.tsx
src/components/AgentsModal.tsx
src/components/StorageTab.tsx
src/components/AnalyticsConsent.tsx
src/components/MarkdownEditor.tsx
src/components/Topbar.tsx
src/components/ClaudeFileEditor.tsx
```

### Agent 2: Hooks Cleanup
**삭제 대상 (7개)**
```
src/hooks/useApiCall.ts
src/hooks/useDebounce.ts
src/hooks/useLoadingState.ts
src/hooks/usePagination.ts
src/hooks/useDevWorkflow.ts
src/components/claude-code-session/useCheckpoints.ts
src/components/claude-code-session/useClaudeMessages.ts
```

**수정 필요: src/hooks/index.ts**
- 삭제할 export 라인:
  - `export { useLoadingState } from './useLoadingState';`
  - `export { useDebounce, useDebouncedCallback } from './useDebounce';`
  - `export { useApiCall } from './useApiCall';`
  - `export { usePagination } from './usePagination';`

### Agent 3: Misc Cleanup
**삭제 대상 (2개)**
```
src/lib/api-tracker.ts
src/components/ui/radio-group.tsx
```

---

## Phase 2: Verification (순차 실행)

### Step 1: TypeScript Build Check
```bash
npm run build
```

### Step 2: Verify No Broken Imports
- 빌드 성공 확인
- 런타임 에러 없음 확인

---

## Execution Commands

### Agent 1 Commands
```bash
rm src/components/TokenCounter.tsx
rm src/components/CodeViewer.tsx
rm src/components/SessionDropdown.tsx
rm src/components/PreviewPromptDialog.tsx
rm src/components/AgentsModal.tsx
rm src/components/StorageTab.tsx
rm src/components/AnalyticsConsent.tsx
rm src/components/MarkdownEditor.tsx
rm src/components/Topbar.tsx
rm src/components/ClaudeFileEditor.tsx
```

### Agent 2 Commands
```bash
rm src/hooks/useApiCall.ts
rm src/hooks/useDebounce.ts
rm src/hooks/useLoadingState.ts
rm src/hooks/usePagination.ts
rm src/hooks/useDevWorkflow.ts
rm src/components/claude-code-session/useCheckpoints.ts
rm src/components/claude-code-session/useClaudeMessages.ts
# + Edit src/hooks/index.ts to remove exports
```

### Agent 3 Commands
```bash
rm src/lib/api-tracker.ts
rm src/components/ui/radio-group.tsx
```

---

## Rollback Plan
모든 파일이 git tracked 상태이므로:
```bash
git checkout -- <deleted-files>
```

---

## Summary

| Phase | Agent | Files | Action |
|-------|-------|-------|--------|
| 1 | Agent 1 | 10 components | Delete |
| 1 | Agent 2 | 7 hooks + 1 edit | Delete + Edit index.ts |
| 1 | Agent 3 | 2 misc | Delete |
| 2 | Main | - | Build verification |

**Total: 19 files deleted, 1 file edited**
