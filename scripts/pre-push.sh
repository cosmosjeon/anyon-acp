#!/bin/bash

# Pre-push hook for Claude Code
#
# [Stage 1] AUDIT - 변경 파일 코드 품질 검사, audit-result.json 생성
# [Stage 2] AUTO-FIX - P0 이슈 자동 수정 (자동화 가능한 것만)
# [Stage 3] DECISION - P0 수동 이슈 있으면 차단
# [Stage 4] DOC SYNC - 문서 동기화
#
# 환경변수:
#   SKIP_AUDIT=1  - 전체 스킵
#   SKIP_SYNC=1   - 문서 동기화만 스킵
#   SKIP_FIX=1    - 자동 수정 스킵

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AUDIT_RESULT="$PROJECT_ROOT/sdd-docs/audits/pre-push-result.json"
TEMP_AUDIT="$PROJECT_ROOT/.audit-temp.json"

# ============================================================
# macOS 호환성: timeout → gtimeout
# ============================================================
if [[ "$OSTYPE" == "darwin"* ]] && ! command -v timeout &> /dev/null; then
    if command -v gtimeout &> /dev/null; then
        timeout() { gtimeout "$@"; }
    else
        echo "Warning: timeout/gtimeout not found. Install with: brew install coreutils"
        timeout() { "$@"; }  # fallback: no timeout
    fi
fi

# ============================================================
# 유틸리티 함수
# ============================================================
print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ============================================================
# 사전 조건 체크
# ============================================================
if [ "$SKIP_AUDIT" = "1" ]; then
    echo "Skipping audit (SKIP_AUDIT=1)"
    exit 0
fi

if ! command -v claude &> /dev/null; then
    echo "Warning: Claude Code CLI not found, skipping audit"
    exit 0
fi

if ! command -v jq &> /dev/null; then
    echo "Warning: jq not found, skipping audit (install with: brew install jq)"
    exit 0
fi

# ============================================================
# Stage 0: 변경 파일 추출 (push될 모든 커밋)
# ============================================================
print_header "Stage 0: 변경 파일 추출"

# upstream 브랜치 결정
UPSTREAM=$(git rev-parse --abbrev-ref @{u} 2>/dev/null || echo "origin/main")
echo "Upstream: $UPSTREAM"

# push될 변경 파일 추출
CHANGED_FILES=$(git diff --name-only "$UPSTREAM"..HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.rs' 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
    echo "변경된 코드 파일 없음. push 진행."
    exit 0
fi

echo "검사 대상 파일:"
echo "$CHANGED_FILES" | sed 's/^/  /'

# 영역 판별
HAS_FRONTEND=$(echo "$CHANGED_FILES" | grep -E "^src/" | head -1 || true)
HAS_DESKTOP=$(echo "$CHANGED_FILES" | grep -E "^src-tauri/" | head -1 || true)
HAS_SERVER=$(echo "$CHANGED_FILES" | grep -E "^server/" | head -1 || true)

# ============================================================
# Stage 1: AUDIT
# ============================================================
print_header "Stage 1: 코드 감사"

# 변경 파일 내용 수집 (최대 200줄씩)
FILES_CONTENT=""
for file in $CHANGED_FILES; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        FILES_CONTENT+="
=== $file ===
$(head -200 "$PROJECT_ROOT/$file")
"
    fi
done

# 감사 프롬프트
AUDIT_PROMPT=$(cat <<EOF
You are a code quality auditor. Analyze the following changed files and output a structured JSON result.

## Changed Files
$FILES_CONTENT

## Audit Criteria (Priority Order)

### 1. AI-Generated Code Issues (Highest)
- Copy/Paste abuse: DRY violations, duplicated code
- Context ignorance: Not following project patterns
- Orphaned files: .refactored/.optimized files not integrated

### 2. Bloaters
- Long Method: 50+ lines (P0), 30-50 lines (P1)
- Cyclomatic Complexity: 10+ branches (P0)
- Long File: 500+ lines (P1)

### 3. Dispensables
- Dead Code: Unused functions, orphaned imports
- Duplicated Code: Similar logic in multiple places

### 4. Security
- Hardcoded secrets: JWT, API keys, passwords (P0)
- Permissive CORS: origin: "*" (P0)
- Empty catch blocks (P1)
- Missing input validation (P1)

### 5. Type Safety
- any type usage (P1)
- Untyped parameters (P2)

### 6. Technical Debt
- TODO/FIXME comments (P2)
- console.log in production (P1)
- Magic numbers (P2)

## Output Format

CRITICAL: Output ONLY valid JSON, no markdown, no explanation.

{
  "summary": {
    "critical": <number>,
    "warning": <number>,
    "info": <number>,
    "pass": <boolean - true if critical is 0>
  },
  "issues": [
    {
      "id": "<area>-<type>-<number>",
      "priority": "P0|P1|P2",
      "area": "frontend|desktop|server",
      "type": "security|dead_code|duplication|bloater|type_safety|tech_debt",
      "title": "<short description>",
      "file": "<relative path>",
      "line": <line number or null>,
      "action": "delete_file|replace_pattern|extract_utility|add_type|remove_log|split_file|refactor_function",
      "description": "<detailed description>",
      "fix": {
        "type": "delete|replace|create|refactor",
        "target": "<pattern or file path>",
        "replacement": "<replacement content or null>"
      }
    }
  ]
}

## Action Classification
- Automatable: delete_file, replace_pattern, extract_utility, add_type, remove_log
- Non-automatable (requires manual): split_file, refactor_function

If no issues found, return: {"summary":{"critical":0,"warning":0,"info":0,"pass":true},"issues":[]}
EOF
)

# Claude 실행
echo "Claude에 감사 요청 중... (타임아웃: 5분)"
AUDIT_OUTPUT=$(timeout 300 claude -p "$AUDIT_PROMPT" --dangerously-skip-permissions 2>&1 || echo '{"summary":{"critical":0,"warning":0,"info":0,"pass":true},"issues":[]}')

# JSON 추출 (마크다운 코드블록 제거)
AUDIT_JSON=$(echo "$AUDIT_OUTPUT" | sed -n '/^{/,/^}/p' | head -1)
if [ -z "$AUDIT_JSON" ]; then
    # 코드블록 내부에서 추출 시도
    AUDIT_JSON=$(echo "$AUDIT_OUTPUT" | sed -n '/```json/,/```/p' | sed '1d;$d')
fi
if [ -z "$AUDIT_JSON" ]; then
    AUDIT_JSON='{"summary":{"critical":0,"warning":0,"info":0,"pass":true},"issues":[]}'
fi

# JSON 유효성 검사
if ! echo "$AUDIT_JSON" | jq . > /dev/null 2>&1; then
    echo "Warning: Invalid JSON response, using default"
    AUDIT_JSON='{"summary":{"critical":0,"warning":0,"info":0,"pass":true},"issues":[]}'
fi

# 임시 파일에 저장
echo "$AUDIT_JSON" > "$TEMP_AUDIT"

# 결과 분석
CRITICAL_COUNT=$(echo "$AUDIT_JSON" | jq '.summary.critical // 0')
WARNING_COUNT=$(echo "$AUDIT_JSON" | jq '.summary.warning // 0')
INFO_COUNT=$(echo "$AUDIT_JSON" | jq '.summary.info // 0')
IS_PASS=$(echo "$AUDIT_JSON" | jq '.summary.pass // true')

echo ""
echo "감사 결과: Critical=$CRITICAL_COUNT, Warning=$WARNING_COUNT, Info=$INFO_COUNT"

# P0 이슈 분류
P0_AUTOMATABLE=$(echo "$AUDIT_JSON" | jq '[.issues[] | select(.priority == "P0" and (.action | IN("delete_file", "replace_pattern", "extract_utility", "add_type", "remove_log")))]')
P0_AUTOMATABLE_COUNT=$(echo "$P0_AUTOMATABLE" | jq 'length')

P0_MANUAL=$(echo "$AUDIT_JSON" | jq '[.issues[] | select(.priority == "P0" and (.action | IN("split_file", "refactor_function")))]')
P0_MANUAL_COUNT=$(echo "$P0_MANUAL" | jq 'length')

echo "P0 이슈: 자동화 가능=$P0_AUTOMATABLE_COUNT, 수동 필요=$P0_MANUAL_COUNT"

# 이슈 목록 출력
if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo ""
    echo "발견된 Critical 이슈:"
    echo "$AUDIT_JSON" | jq -r '.issues[] | select(.priority == "P0") | "  - [\(.action)] \(.title) (\(.file))"'
fi

# ============================================================
# Stage 2: AUTO-FIX (P0 자동화 가능 이슈만)
# ============================================================
if [ "$P0_AUTOMATABLE_COUNT" -gt 0 ] && [ "$SKIP_FIX" != "1" ]; then
    print_header "Stage 2: P0 자동 수정 ($P0_AUTOMATABLE_COUNT개)"

    # 롤백 포인트 생성
    STASH_MSG="pre-push-backup-$(date +%Y%m%d-%H%M%S)"
    git stash push -m "$STASH_MSG" --include-untracked 2>/dev/null || true
    git stash pop 2>/dev/null || true  # 작업 복원 (stash는 유지)

    # 수정 프롬프트
    REFACTOR_PROMPT=$(cat <<EOF
You are a code refactoring agent. Apply the following P0 fixes to the codebase.

## Issues to Fix
$P0_AUTOMATABLE

## Action Instructions

### delete_file
- Delete the specified file using the filesystem

### replace_pattern
- Find fix.target in the file
- Replace with fix.replacement

### add_type
- Analyze context to infer proper type
- Replace 'any' with specific type

### remove_log
- Remove console.log/warn/error calls (except error handling)

## Important
- Apply each fix carefully
- After fixing, briefly confirm what was done

Output format for each fix:
FIXED: <issue_id> - <what was done>
or
FAILED: <issue_id> - <error reason>

At the end, output: FIX_COMPLETE
EOF
    )

    echo "Claude에 수정 요청 중..."
    REFACTOR_OUTPUT=$(timeout 300 claude -p "$REFACTOR_PROMPT" --dangerously-skip-permissions 2>&1 || echo "FIX_FAILED")

    # 수정 결과 확인
    FIXED_COUNT=$(echo "$REFACTOR_OUTPUT" | grep -c "^FIXED:" || echo 0)
    FAILED_COUNT=$(echo "$REFACTOR_OUTPUT" | grep -c "^FAILED:" || echo 0)

    echo "수정 결과: 성공=$FIXED_COUNT, 실패=$FAILED_COUNT"

    # 검증
    VERIFY_FAILED=0

    if [ -n "$HAS_FRONTEND" ]; then
        echo "Frontend 검증 중..."
        if ! bun test --passWithNoTests 2>/dev/null; then
            echo "Frontend 검증 실패"
            VERIFY_FAILED=1
        fi
    fi

    if [ -n "$HAS_DESKTOP" ] && [ "$VERIFY_FAILED" = "0" ]; then
        echo "Desktop 검증 중..."
        if ! cargo check -p anyon 2>/dev/null; then
            echo "Desktop 검증 실패"
            VERIFY_FAILED=1
        fi
    fi

    if [ -n "$HAS_SERVER" ] && [ "$VERIFY_FAILED" = "0" ]; then
        echo "Server 검증 중..."
        if ! node --check server/index.js 2>/dev/null; then
            echo "Server 검증 실패"
            VERIFY_FAILED=1
        fi
    fi

    if [ "$VERIFY_FAILED" = "1" ]; then
        echo ""
        echo "검증 실패, 변경사항 롤백 중..."
        git checkout -- . 2>/dev/null || true
        echo "롤백 완료"
    else
        echo "검증 통과"
        # 수정된 파일 스테이징
        git add -A 2>/dev/null || true
    fi
fi

# ============================================================
# Stage 3: DECISION
# ============================================================
print_header "Stage 3: 결정"

# P0 수동 이슈가 있으면 차단
if [ "$P0_MANUAL_COUNT" -gt 0 ]; then
    echo ""
    echo "PUSH 차단: $P0_MANUAL_COUNT개의 P0 이슈가 수동 수정 필요"
    echo ""
    echo "$P0_MANUAL" | jq -r '.[] | "  - [\(.action)] \(.title)"'
    echo "    파일: \(.file)"
    echo "    설명: \(.description)"
    echo ""
    echo "해결 방법:"
    echo "  1. 위 이슈들을 수동으로 수정하세요"
    echo "  2. 또는 다음 워크플로우를 사용하세요:"
    echo "     - split_file → /split-component 또는 /split-module"
    echo "     - refactor_function → 수동 리팩토링"
    echo ""

    # 감사 결과 저장 (나중에 참조용)
    mv "$TEMP_AUDIT" "$AUDIT_RESULT" 2>/dev/null || true

    exit 1
fi

# 모든 P0 해결됨
echo "모든 Critical 이슈 해결됨. push 진행 가능."

# 감사 결과 저장
mv "$TEMP_AUDIT" "$AUDIT_RESULT" 2>/dev/null || true

# ============================================================
# Stage 4: DOC SYNC (기존 로직 유지)
# ============================================================
if [ "$SKIP_SYNC" = "1" ]; then
    echo ""
    echo "문서 동기화 스킵 (SKIP_SYNC=1)"
else
    print_header "Stage 4: 문서 동기화"

    SYNC_PROMPT="변경된 파일들을 분석하고 관련 문서를 업데이트하세요:

변경 파일:
$CHANGED_FILES

문서 매핑 규칙:
- src/components/ 변경 → sdd-docs/specs/component-inventory.md 업데이트
- src/hooks/, src/stores/ 변경 → sdd-docs/specs/architecture-frontend.md 업데이트
- src-tauri/ 변경 → sdd-docs/specs/architecture-desktop.md 업데이트
- server/ 변경 → sdd-docs/specs/architecture-server.md 업데이트
- 타입 변경 → sdd-docs/specs/data-models.md 업데이트

작업:
1. 변경 영역 파악
2. 해당 문서만 업데이트 (새 컴포넌트/함수 추가, 삭제된 항목 제거)
3. 업데이트한 파일 목록 출력

마지막 줄에 반드시: SYNC_DONE"

    echo "Claude에 문서 동기화 요청 중... (타임아웃: 120초)"
    SYNC_OUTPUT=$(timeout 120 claude -p "$SYNC_PROMPT" --dangerously-skip-permissions 2>&1 || echo "SYNC_TIMEOUT")

    # 변경된 문서 스테이징
    if git diff --name-only sdd-docs/specs/ 2>/dev/null | grep -q .; then
        echo "변경된 문서를 커밋에 추가합니다..."
        git add sdd-docs/specs/
        git commit --amend --no-edit 2>/dev/null || true
        echo "문서 업데이트 완료"
    else
        echo "업데이트할 문서 없음"
    fi
fi

# ============================================================
# 완료
# ============================================================
print_header "push 진행"
echo ""
exit 0
