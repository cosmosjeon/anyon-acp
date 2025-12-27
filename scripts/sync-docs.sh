#!/bin/bash

# SDD Documentation Sync Script
# Runs in CI/CD pipeline after merge to dev

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BMAD_OUTPUT="$PROJECT_ROOT/sdd-docs"
SYNC_STATUS="$BMAD_OUTPUT/sync-status.json"

echo "================================"
echo "SDD Documentation Sync"
echo "================================"

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
echo "Timestamp: $TIMESTAMP"

# Count source files
COMPONENT_COUNT=$(find "$PROJECT_ROOT/src/components" -name "*.tsx" -type f 2>/dev/null | wc -l | tr -d ' ')
HOOK_COUNT=$(find "$PROJECT_ROOT/src/hooks" -name "*.ts" -type f 2>/dev/null | wc -l | tr -d ' ')
STORE_COUNT=$(find "$PROJECT_ROOT/src/stores" -name "*.ts" -type f 2>/dev/null | wc -l | tr -d ' ')
TAURI_CMD_COUNT=$(find "$PROJECT_ROOT/src-tauri/src/commands" -name "*.rs" -type f 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "Source File Counts:"
echo "  Components: $COMPONENT_COUNT"
echo "  Hooks: $HOOK_COUNT"
echo "  Stores: $STORE_COUNT"
echo "  Tauri Commands: $TAURI_CMD_COUNT"

# Check for drift (files modified after last sync)
LAST_SYNC=$(grep -o '"last_full_sync": "[^"]*"' "$SYNC_STATUS" | cut -d'"' -f4)
echo ""
echo "Last sync: $LAST_SYNC"

# Count changed files since last sync
CHANGED_COMPONENTS=$(find "$PROJECT_ROOT/src/components" -name "*.tsx" -newer "$SYNC_STATUS" 2>/dev/null | wc -l | tr -d ' ')
CHANGED_HOOKS=$(find "$PROJECT_ROOT/src/hooks" -name "*.ts" -newer "$SYNC_STATUS" 2>/dev/null | wc -l | tr -d ' ')
CHANGED_STORES=$(find "$PROJECT_ROOT/src/stores" -name "*.ts" -newer "$SYNC_STATUS" 2>/dev/null | wc -l | tr -d ' ')
CHANGED_CMDS=$(find "$PROJECT_ROOT/src-tauri/src/commands" -name "*.rs" -newer "$SYNC_STATUS" 2>/dev/null | wc -l | tr -d ' ')

TOTAL_CHANGED=$((CHANGED_COMPONENTS + CHANGED_HOOKS + CHANGED_STORES + CHANGED_CMDS))

echo ""
echo "Changed since last sync:"
echo "  Components: $CHANGED_COMPONENTS"
echo "  Hooks: $CHANGED_HOOKS"
echo "  Stores: $CHANGED_STORES"
echo "  Tauri Commands: $CHANGED_CMDS"
echo "  Total: $TOTAL_CHANGED"

# Update sync-status.json timestamp
if command -v jq &> /dev/null; then
    # Use jq if available
    jq --arg ts "$TIMESTAMP" '.last_full_sync = $ts' "$SYNC_STATUS" > "$SYNC_STATUS.tmp" && mv "$SYNC_STATUS.tmp" "$SYNC_STATUS"
else
    # Fallback to sed
    sed -i.bak "s/\"last_full_sync\": \"[^\"]*\"/\"last_full_sync\": \"$TIMESTAMP\"/" "$SYNC_STATUS"
    rm -f "$SYNC_STATUS.bak"
fi

echo ""
echo "Updated sync-status.json"

# Quick Audit Scan
echo ""
echo "Running quick audit scan..."
CONSOLE_LOG_COUNT=$(grep -r "console.log" "$PROJECT_ROOT/src" 2>/dev/null | wc -l | tr -d ' ')
ANY_TYPE_COUNT=$(grep -r ": any" "$PROJECT_ROOT/src" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
UNWRAP_COUNT=$(grep -r "\.unwrap()" "$PROJECT_ROOT/src-tauri/src" 2>/dev/null | wc -l | tr -d ' ')
EXPECT_COUNT=$(grep -r "\.expect(" "$PROJECT_ROOT/src-tauri/src" 2>/dev/null | wc -l | tr -d ' ')

# Count large files (>1000 lines)
LARGE_FILES_COUNT=$(find "$PROJECT_ROOT/src" "$PROJECT_ROOT/src-tauri/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.rs" \) -exec wc -l {} \; 2>/dev/null | awk '$1 > 1000' | wc -l | tr -d ' ')

echo "Quick Audit Results:"
echo "  console.log: $CONSOLE_LOG_COUNT"
echo "  any types: $ANY_TYPE_COUNT"
echo "  unwrap(): $UNWRAP_COUNT"
echo "  expect(): $EXPECT_COUNT"
echo "  Large files (>1000 LOC): $LARGE_FILES_COUNT"

# Generate CURRENT-STATUS.md (AI Context Brief)
CURRENT_BRANCH=$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo "unknown")
RECENT_COMMITS=$(cd "$PROJECT_ROOT" && git log -5 --oneline 2>/dev/null || echo "No commits available")

cat > "$BMAD_OUTPUT/CURRENT-STATUS.md" << EOF
# Current Project Status

**Last Updated:** $TIMESTAMP

## Quick Stats

- Branch: $CURRENT_BRANCH
- Components: $COMPONENT_COUNT | Hooks: $HOOK_COUNT | Stores: $STORE_COUNT
- Tauri Commands: $TAURI_CMD_COUNT files

## Code Quality (Quick Audit)

| Metric | Count | Target | Status |
|--------|-------|--------|--------|
| console.log | $CONSOLE_LOG_COUNT | 0 | $([ "$CONSOLE_LOG_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |
| any types | $ANY_TYPE_COUNT | 0 | $([ "$ANY_TYPE_COUNT" -lt 20 ] && echo "✅" || echo "⚠️") |
| unwrap() | $UNWRAP_COUNT | 0 | $([ "$UNWRAP_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |
| expect() | $EXPECT_COUNT | 0 | $([ "$EXPECT_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |
| Large files | $LARGE_FILES_COUNT | 0 | $([ "$LARGE_FILES_COUNT" -eq 0 ] && echo "✅" || echo "⚠️") |

> Run \`/audit-codebase\` for full audit report

## Recent Changes

\`\`\`
$RECENT_COMMITS
\`\`\`

## Documentation

- Full index: sdd-docs/index.md
- Architecture: sdd-docs/specs/
- Audit report: sdd-docs/audits/code-audit-report.md
EOF

echo ""
echo "Generated CURRENT-STATUS.md"

# Summary
echo ""
echo "================================"
echo "Documentation Sync Report"
echo "================================"
echo "Changed files detected: $TOTAL_CHANGED"
if [ "$TOTAL_CHANGED" -gt 0 ]; then
    echo "Status: DOCUMENTATION UPDATED"
else
    echo "Status: NO CHANGES (timestamps updated)"
fi
echo "Last synced: $TIMESTAMP"
echo "================================"
