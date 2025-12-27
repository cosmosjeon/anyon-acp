# Checkpoint/Rewind System Implementation Plan

## Status: Planning
- **Created**: 2025-12-25
- **Author**: Claude Opus 4.5
- **Priority**: P2
- **Estimated Effort**: 3-5 days

---

## 1. Background

### 1.1 Problem Statement
Previously implemented checkpoint system had critical issues:
- **Performance**: Full project scan on every checkpoint creation (O(n) file traversal)
- **Memory**: No proper HashMap for O(1) checkpoint lookup - tree traversal instead
- **Race Conditions**: GC could delete blobs while checkpoint was being created
- **Test Coverage**: < 5% coverage on critical paths
- **Core Bug**: `check_auto_checkpoint` returned boolean but never actually created checkpoints

### 1.2 Decision
Complete removal of legacy checkpoint code and fresh implementation with:
1. **Hybrid Approach**: Claude Code's native `/rewind` for quick undo + custom milestone system
2. **Incremental Snapshots**: Use proven backup patterns (like rustic/conserve)
3. **Proper Architecture**: Content-addressable storage with O(1) lookups

---

## 2. Recommended Implementation Strategy

### 2.1 Phase 1: Claude /rewind Integration (Quick Win)
Leverage Claude Code's built-in rewind feature:

```
/rewind N  - Go back N prompts
Esc+Esc    - Quick rewind shortcut
```

**UI Integration:**
- Add "Rewind" button in session toolbar
- Use dialog to select rewind target
- Backend executes: `claude --resume <session> --continue "/rewind N"`

**Benefits:**
- Zero implementation cost for file snapshots
- Already handles file tracking internally
- 30-day retention built-in

**Limitations:**
- Can't track bash command file changes
- No cross-session snapshots
- UI limited to CLI interaction

### 2.2 Phase 2: Milestone Bookmark System (Custom)
For explicit user-created save points:

```rust
// Minimal data model
pub struct Milestone {
    id: Uuid,
    session_id: String,
    name: String,
    created_at: DateTime<Utc>,
    message_index: usize,
    file_hashes: HashMap<PathBuf, String>,  // path -> SHA256
}
```

**Features:**
- Manual creation only (button click or slash command)
- Lightweight metadata (just file hashes, not full content)
- Git integration for actual file restoration

**Workflow:**
1. User clicks "Create Milestone" or types `/milestone "name"`
2. System captures: message index + file tree hashes
3. To restore: git stash + checkout files to milestone state + /rewind to message

### 2.3 Phase 3: Incremental Backup (Future)
If full snapshot capability is needed later:

**Consider Using:**
- **rustic_core**: Restic-compatible, incremental, dedup, encryption
- **Conserve**: Pure Rust, simpler API, no external deps

**Architecture:**
```
.anyon/
  backups/
    snapshots/
      <session_id>/
        <timestamp>.snap
    blobs/
      <sha256>.zst  # zstd compressed, content-addressed
```

---

## 3. Implementation Details

### 3.1 Phase 1: Rewind UI (1-2 days)

**Frontend Changes:**
```typescript
// src/components/RewindDialog.tsx
interface RewindDialogProps {
  sessionId: string;
  messageCount: number;
  onRewind: (steps: number) => void;
}

// Shows slider or numeric input for rewind target
// Preview of what will be rewound (message snippets)
```

**Backend Changes:**
```rust
// src-tauri/src/commands/claude/execution.rs
#[tauri::command]
pub async fn rewind_session(
    session_id: String,
    steps: usize,
) -> Result<(), String> {
    // Execute: claude --resume <session> --continue "/rewind <steps>"
}
```

### 3.2 Phase 2: Milestone System (2-3 days)

**Data Storage:**
```sql
-- Using existing SQLite storage
CREATE TABLE milestones (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    message_index INTEGER NOT NULL,
    file_manifest TEXT NOT NULL  -- JSON: {path: hash}
);
```

**Rust Module:**
```rust
// src-tauri/src/milestone/mod.rs
pub mod milestone {
    pub async fn create(session_id: &str, name: &str) -> Result<Milestone>;
    pub async fn list(session_id: &str) -> Result<Vec<Milestone>>;
    pub async fn restore(milestone_id: &str) -> Result<()>;
    pub async fn delete(milestone_id: &str) -> Result<()>;
}
```

**Frontend Components:**
```
src/components/
  MilestoneList.tsx      - List milestones with restore/delete actions
  CreateMilestone.tsx    - Modal for naming milestone
  MilestoneIndicator.tsx - In-chat marker showing milestone points
```

---

## 4. API Design

### 4.1 Tauri Commands

```rust
// Rewind (Phase 1)
#[tauri::command]
async fn rewind_session(session_id: String, steps: usize) -> Result<(), String>;

// Milestones (Phase 2)
#[tauri::command]
async fn create_milestone(session_id: String, name: String) -> Result<Milestone, String>;

#[tauri::command]
async fn list_milestones(session_id: String) -> Result<Vec<Milestone>, String>;

#[tauri::command]
async fn restore_milestone(milestone_id: String) -> Result<(), String>;

#[tauri::command]
async fn delete_milestone(milestone_id: String) -> Result<(), String>;
```

### 4.2 Frontend API

```typescript
// src/lib/api/milestones.ts
export const milestonesApi = {
  create: (sessionId: string, name: string) => Promise<Milestone>,
  list: (sessionId: string) => Promise<Milestone[]>,
  restore: (milestoneId: string) => Promise<void>,
  delete: (milestoneId: string) => Promise<void>,
};

// src/lib/api/rewind.ts
export const rewindApi = {
  rewind: (sessionId: string, steps: number) => Promise<void>,
};
```

---

## 5. Testing Strategy

### 5.1 Unit Tests
- Milestone CRUD operations
- File hash calculation
- Rewind command generation

### 5.2 Integration Tests
- Session rewind via Claude CLI
- Milestone creation/restoration flow
- Concurrent milestone operations

### 5.3 E2E Tests
- Full user flow: create session -> make changes -> create milestone -> make more changes -> restore
- Rewind UI interaction

---

## 6. Migration Path

### 6.1 Cleanup Completed
The following has been removed:
- `src-tauri/src/checkpoint/` module (entire directory)
- `src-tauri/src/commands/claude/checkpoints.rs`
- `src/components/TimelineNavigator.tsx`
- `src/components/CheckpointSettings.tsx`
- `src/lib/api/checkpoints.ts`
- All checkpoint types in `src/lib/api/types.ts`
- Analytics events for checkpoints

### 6.2 Data Migration
No migration needed - previous checkpoint data was never persisted properly.

---

## 7. Success Criteria

1. **Phase 1 Complete When:**
   - [ ] Rewind button appears in session UI
   - [ ] Clicking shows rewind target selector
   - [ ] Executing rewind works with Claude CLI
   - [ ] Error handling for rewind failures

2. **Phase 2 Complete When:**
   - [ ] Users can create named milestones
   - [ ] Milestones show in session timeline
   - [ ] Restore works and files revert correctly
   - [ ] Integration with git stash for safety

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude /rewind behavior changes | High | Abstract behind our API, fallback to manual restore |
| Large project milestone creation slow | Medium | Background creation, progress indicator |
| Restore conflicts with unsaved work | High | Always git stash before restore, warn user |
| Session ID mismatches | Medium | Validate session exists before operations |

---

## 9. Future Considerations

- **Collaborative Milestones**: Share milestone points with team members
- **Auto-Milestone**: Create milestone before destructive operations
- **Diff View**: Show changes between milestones
- **Export/Import**: Portable milestone bundles

---

## Appendix: Deleted Code Summary

### Backend (Rust)
| File | Lines | Description |
|------|-------|-------------|
| `checkpoint/mod.rs` | 287 | Core types (Checkpoint, Timeline, etc) |
| `checkpoint/manager.rs` | 787 | CheckpointManager with snapshot logic |
| `checkpoint/storage.rs` | 460 | Content-addressable storage |
| `checkpoint/state.rs` | 156 | Session state management |
| `commands/claude/checkpoints.rs` | 280 | Tauri command handlers |

### Frontend (React/TypeScript)
| File | Lines | Description |
|------|-------|-------------|
| `TimelineNavigator.tsx` | 450 | Timeline UI component |
| `CheckpointSettings.tsx` | 180 | Settings dialog |
| `api/checkpoints.ts` | 120 | API client |
| `api/types.ts` | ~90 | Type definitions |
| `analytics/types.ts` | ~30 | Analytics event types |
| `analytics/events.ts` | ~30 | Event builders |
| `hooks/useAnalytics.ts` | ~20 | Hook functions |
