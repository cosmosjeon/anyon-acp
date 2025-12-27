---
name: 'step-03-validate'
description: 'Final validation, commit creation, and report generation'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-03-validate.md'
nextStepFile: null
---

# Step 3: Validate & Report

**Progress: Step 3 of 3** - Final Step

---

## STEP GOAL

전체 검증을 수행하고, 커밋을 생성하며, 최종 보고서를 작성합니다.

---

## EXECUTION SEQUENCE

### 1. Final Verification

모든 변경 사항에 대한 최종 검증:

```bash
# Frontend
bun test

# Desktop
cargo build --release

# Server
node --check server/index.js
```

### 2. Collect Changed Files

```bash
git diff --name-only
git status --short
```

### 3. Generate Summary Report

**파일**: `sdd-docs/audits/refactor-report.md`

```markdown
# ANYON 리팩토링 보고서

**Date:** [현재 날짜]
**Selected Priority:** [P0/P0+P1/ALL]
**Workflow:** BMAD Code Refactor v1.0

---

## Executive Summary

| 항목 | 값 |
|------|-----|
| 처리된 이슈 | N개 |
| 성공 | N개 |
| 실패 | N개 |
| 스킵 (자동화 불가) | N개 |

### 최종 검증

| 영역 | 결과 |
|------|------|
| Frontend (bun test) | ✅/❌ |
| Desktop (cargo build) | ✅/❌ |
| Server (node --check) | ✅/❌ |

---

## 변경된 파일

[변경된 파일 목록]

---

## 처리된 이슈 상세

### P0 Issues

| ID | Area | Type | Title | Status |
|----|------|------|-------|--------|
| sec-001 | desktop | security | JWT 하드코딩 | ✅ |

### P1 Issues

| ID | Area | Type | Title | Status |
|----|------|------|-------|--------|
| type-001 | frontend | type_safety | any 타입 | ✅ |

---

## 실패한 이슈 (수동 처리 필요)

| ID | Area | Type | Title | Reason |
|----|------|------|-------|--------|
| ... | ... | ... | ... | ... |

---

## 영역별 상세 보고서

- [Frontend Refactor Report](./frontend/refactor-report.md)
- [Desktop Refactor Report](./desktop/refactor-report.md)
- [Server Refactor Report](./server/refactor-report.md)

---

## 커밋 정보

- Commit Hash: [hash]
- Message: [message]

---

**Report Generated:** [timestamp]
**Workflow:** BMAD Code Refactor v1.0
```

### 4. Generate JSON Result

**파일**: `sdd-docs/audits/refactor-result.json`

```json
{
  "timestamp": "[ISO8601]",
  "selectedPriority": "P0|P0+P1|ALL",
  "summary": {
    "total": N,
    "success": N,
    "failed": N,
    "skipped": N
  },
  "areas": {
    "frontend": {
      "success": N,
      "failed": N,
      "verification": "pass|fail"
    },
    "desktop": {
      "success": N,
      "failed": N,
      "verification": "pass|fail"
    },
    "server": {
      "success": N,
      "failed": N,
      "verification": "pass|fail"
    }
  },
  "processedIssues": [
    {
      "id": "sec-001",
      "status": "success|failed|skipped",
      "details": "처리 결과 설명"
    }
  ],
  "changedFiles": [
    "src-tauri/src/main.rs",
    "server/index.js"
  ],
  "commit": {
    "hash": "[commit hash]",
    "message": "[commit message]"
  }
}
```

### 5. Create Commit

성공적으로 검증된 경우에만 커밋 생성:

```bash
git add -A

git commit -m "$(cat <<'EOF'
refactor([priority]): 코드 품질 개선

## 변경 사항
- [변경 요약]

## 처리된 이슈
- [이슈 목록]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

커밋 메시지 예시:
```
refactor(P0): 보안 취약점 및 Dead Code 수정

## 변경 사항
- JWT 하드코딩 제거 (Desktop, Server)
- Orphaned 리팩토링 파일 4개 삭제
- 중복 코드 유틸 함수로 추출

## 처리된 이슈
- sec-001: JWT 하드코딩 (Desktop)
- sec-002: JWT 하드코딩 (Server)
- dead-001~004: Orphaned files (Frontend)
- dup-001: 중복 코드 통합 (Frontend)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### 6. Cleanup Rollback Point

성공 시 롤백 포인트 제거:

```bash
git stash drop
```

실패 시 롤백 안내:

```
⚠️ 일부 검증 실패. 롤백하려면:
   git stash pop
```

---

## OUTPUT

콘솔에 최종 결과 표시:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Code Refactor Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  선택된 우선순위: [P0/P0+P1/ALL]

  처리된 이슈: N개
    ✅ 성공: N개
    ❌ 실패: N개
    ⏭️ 스킵: N개

📁 변경된 파일:
  - src-tauri/src/main.rs
  - server/index.js
  - (deleted) 4 orphaned files
  - src/lib/widgetUtils.ts (new)

🧪 검증 결과:
  Frontend: ✅ bun test 통과
  Desktop: ✅ cargo build 성공
  Server: ✅ node --check 성공

📝 커밋 생성됨:
  [commit hash] refactor(P0): 보안 취약점 및 Dead Code 수정

📄 생성된 보고서:
  - sdd-docs/audits/refactor-report.md
  - sdd-docs/audits/refactor-result.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ERROR CASES

### 검증 실패 시

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Code Refactor Partially Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  처리된 이슈: N개
    ✅ 성공: N개
    ❌ 실패: N개

🔴 검증 실패:
  Desktop: ❌ cargo build 실패
    → 에러: [에러 메시지]

💡 권장 조치:
  1. 실패한 변경 사항 수동 검토
  2. 롤백: git stash pop
  3. 또는 부분 커밋: git add [successful_files]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## WORKFLOW COMPLETE

리팩토링 워크플로우가 완료되었습니다.

### 후속 작업 안내

실패한 이슈가 있는 경우:
1. `refactor-report.md`에서 실패 원인 확인
2. 수동으로 해당 이슈 처리
3. 필요시 `/code-audit` 재실행하여 상태 확인

자동화 불가 이슈가 있는 경우:
- `split_file` 이슈 → `/split-widgets` 또는 `/split-api` 워크플로우 사용
- `refactor_function` 이슈 → 수동 리팩토링 필요
