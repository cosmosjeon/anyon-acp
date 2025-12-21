---
name: 'step-01-select-priority'
description: 'Load audit results and select priority level for refactoring'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-01-select-priority.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-02-parallel-refactor.md'
---

# Step 1: Select Priority & Load Issues

**Progress: Step 1 of 3**

---

## STEP GOAL

감사 결과를 로드하고 사용자에게 리팩토링 범위를 선택받습니다.

---

## EXECUTION SEQUENCE

### 1. Load Audit Results

`sdd-docs/audits/audit-result.json` 파일을 읽어 이슈 목록을 로드합니다.

```typescript
interface AuditResult {
  issues: Issue[];
  summary: { critical: number; warning: number; info: number };
}

interface Issue {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  area: 'frontend' | 'desktop' | 'server';
  type: string;
  title: string;
  file: string;
  line: number | null;
  action: string;
  description: string;
  fix: {
    type: 'delete' | 'replace' | 'create' | 'refactor';
    target: string;
    replacement?: string;
  };
}
```

### 2. Validate Issues Array

`issues[]` 배열이 존재하는지 확인합니다.

**배열이 없는 경우**:
```
⚠️ audit-result.json에 issues[] 배열이 없습니다.
   /code-audit를 다시 실행하여 액션 가능한 이슈 데이터를 생성해주세요.
```

### 3. Count Issues by Priority

```typescript
const countByPriority = {
  P0: issues.filter(i => i.priority === 'P0').length,
  P1: issues.filter(i => i.priority === 'P1').length,
  P2: issues.filter(i => i.priority === 'P2').length,
};

const automatable = issues.filter(i =>
  ['delete_file', 'replace_pattern', 'extract_utility', 'add_type', 'remove_log'].includes(i.action)
);
```

### 4. Display Summary & Ask User

사용자에게 다음 정보를 표시하고 선택을 요청합니다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Code Refactor Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 현재 감사 결과:

| Priority | 이슈 수 | 자동화 가능 |
|----------|--------|------------|
| P0 (Critical) | N개 | N개 |
| P1 (Warning) | N개 | N개 |
| P2 (Info) | N개 | N개 |

※ 자동화 불가 이슈는 별도 워크플로우 필요
  (split_file, refactor_function 등)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AskUserQuestion 사용**:

```yaml
질문: "어느 우선순위까지 처리할까요?"
옵션:
  - P0: "P0만 (Critical - 권장, 가장 안전)"
  - P0+P1: "P0 + P1 (스프린트 범위)"
  - ALL: "전체 (P0 + P1 + P2)"
```

### 5. Filter Selected Issues

선택된 우선순위에 따라 이슈 필터링:

```typescript
const selectedIssues = issues.filter(i => {
  if (selection === 'P0') return i.priority === 'P0';
  if (selection === 'P0+P1') return ['P0', 'P1'].includes(i.priority);
  return true; // ALL
});

// 자동화 가능한 이슈만 필터링
const automatableIssues = selectedIssues.filter(i =>
  ['delete_file', 'replace_pattern', 'extract_utility', 'add_type', 'remove_log'].includes(i.action)
);
```

### 6. Group by Area

영역별로 이슈 그룹화:

```typescript
const issuesByArea = {
  frontend: automatableIssues.filter(i => i.area === 'frontend'),
  desktop: automatableIssues.filter(i => i.area === 'desktop'),
  server: automatableIssues.filter(i => i.area === 'server'),
};
```

### 7. Create Rollback Point

작업 시작 전 현재 상태 저장:

```bash
git stash push -m "refactor-backup-$(date +%Y%m%d-%H%M%S)"
```

---

## OUTPUT

다음 정보를 다음 단계로 전달:

```typescript
{
  selectedPriority: 'P0' | 'P0+P1' | 'ALL',
  issuesByArea: {
    frontend: Issue[],
    desktop: Issue[],
    server: Issue[],
  },
  totalCount: number,
  skippedCount: number, // 자동화 불가 이슈 수
}
```

---

## DISPLAY

```
✅ Step 1 완료

선택된 우선순위: [P0/P0+P1/ALL]
처리할 이슈:
  - Frontend: N개
  - Desktop: N개
  - Server: N개
  - 총: N개

⚠️ 자동화 불가 이슈 (스킵): N개
  (별도 워크플로우 필요: split_file, refactor_function)

💾 롤백 포인트 생성됨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 2: 병렬 리팩토링 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-02-parallel-refactor.md`
