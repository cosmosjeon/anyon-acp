---
name: 'step-01-analyze'
description: 'Analyze target component and generate split plan'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/split-component/steps/step-01-analyze.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/split-component/steps/step-02-split.md'
---

# Step 1: Analyze Component

**Progress: Step 1 of 3**

---

## STEP GOAL

대상 컴포넌트를 분석하고 분할 계획을 생성한 후 사용자 확인을 받습니다.

---

## EXECUTION SEQUENCE

### 1. Load Target Issues

`sdd-docs/audits/audit-result.json` 파일에서 분할 대상 이슈를 로드합니다.

```typescript
interface SplitIssue {
  id: string;
  area: 'frontend';
  action: 'split_file';
  file: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
}

// Filter issues
const splitIssues = auditResult.issues.filter(
  i => i.area === 'frontend' && i.action === 'split_file'
);
```

### 2. Select Target File

여러 이슈가 있는 경우 사용자에게 선택 요청:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Split Component Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

분할 가능한 컴포넌트:

| # | File | Lines | Priority | Description |
|---|------|-------|----------|-------------|
| 1 | ToolWidgets.tsx | 3,273 | P1 | 27개 위젯 컴포넌트 포함 |
| 2 | Settings.tsx | 1,279 | P2 | 12개 설정 섹션 포함 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AskUserQuestion 사용**:
```yaml
질문: "어떤 컴포넌트를 분할할까요?"
옵션:
  - [파일명 목록]
  - "취소"
```

### 3. Read Target File

선택된 컴포넌트 파일을 읽습니다:

```typescript
const filePath = `src/components/${selectedFile}`;
const fileContent = await readFile(filePath);
```

### 4. Analyze Component Structure

파일 내용을 분석하여 다음을 식별합니다:

#### 4.1 Component Declarations

```typescript
interface ComponentInfo {
  name: string;
  type: 'function' | 'class' | 'const';
  startLine: number;
  endLine: number;
  isExported: boolean;
  dependencies: string[];
}

// Patterns to match:
// - export function ComponentName
// - export const ComponentName =
// - const ComponentName = () =>
// - function ComponentName()
```

#### 4.2 Imports and Dependencies

```typescript
interface ImportInfo {
  source: string;
  specifiers: string[];
  isTypeImport: boolean;
}

// Track all imports at file top
```

#### 4.3 Shared Utilities

```typescript
interface UtilityInfo {
  name: string;
  type: 'function' | 'const' | 'type' | 'interface';
  usedBy: string[]; // Which components use this
  isShared: boolean; // Used by multiple components
}

// Identify helper functions, types, constants
```

### 5. Generate Split Plan

분석 결과를 바탕으로 분할 계획 생성:

```typescript
interface SplitPlan {
  targetFile: string;
  targetDirectory: string;
  components: Array<{
    name: string;
    targetFile: string;
    dependencies: string[];
    sharedUtils: string[];
  }>;
  sharedUtilities: Array<{
    name: string;
    targetFile: string; // e.g., "shared/types.ts"
  }>;
  indexFile: {
    path: string;
    exports: string[];
  };
}
```

**분할 전략**:

1. **Individual Components**
   - 각 컴포넌트를 별도 파일로
   - 파일명: PascalCase (예: `ApiKeyWidget.tsx`)

2. **Shared Utilities**
   - 여러 컴포넌트가 사용하는 유틸리티
   - 위치: `shared/utils.ts`, `shared/types.ts`

3. **Index File**
   - 모든 컴포넌트를 re-export
   - 기존 import 경로 유지

### 6. Display Split Plan

사용자에게 분할 계획 표시:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Split Plan for ToolWidgets.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

현재 구조:
  - 파일: src/components/ToolWidgets.tsx (3,273 lines)
  - 컴포넌트: 27개
  - 공유 타입: 5개
  - 공유 유틸: 3개

분할 후 구조:
  widgets/
  ├── index.ts           # Re-export all widgets
  ├── ApiKeyWidget.tsx
  ├── PromptWidget.tsx
  ├── HistoryWidget.tsx
  ├── ... (24 more widgets)
  └── shared/
      ├── types.ts       # 공유 타입 정의
      └── utils.ts       # 공유 유틸 함수

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 생성될 파일: 30개
  - 컴포넌트: 27개
  - 공유 파일: 2개
  - 인덱스: 1개

🔗 Import 경로 영향:
  기존: import { ApiKeyWidget } from './ToolWidgets'
  유지: import { ApiKeyWidget } from './widgets'
  (index.ts가 re-export하므로 기존 코드 수정 불필요)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 7. Request User Confirmation

**AskUserQuestion 사용**:
```yaml
질문: "이 분할 계획으로 진행할까요?"
옵션:
  - "진행": "Step 2로 진행"
  - "수정": "분할 계획 조정 (수동)"
  - "취소": "워크플로우 종료"
```

**사용자가 "취소" 선택 시**:
```
🛑 Split Component 워크플로우가 취소되었습니다.
```

**사용자가 "수정" 선택 시**:
```
💡 분할 계획을 수동으로 조정해주세요.
   조정 후 Step 2를 수동으로 실행할 수 있습니다.
```

---

## OUTPUT

다음 정보를 Step 2로 전달:

```typescript
{
  targetFile: string,
  targetDirectory: string,
  splitPlan: SplitPlan,
  userApproved: boolean,
}
```

---

## DISPLAY

```
✅ Step 1 완료

분석 완료:
  - 대상: [파일명]
  - 컴포넌트: N개
  - 생성될 파일: N개

사용자 승인: ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 2: 컴포넌트 분할 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ANALYSIS PATTERNS

### Component Detection Regex

```typescript
const patterns = {
  exportFunction: /export\s+function\s+(\w+)/g,
  exportConst: /export\s+const\s+(\w+)\s*=/g,
  constArrow: /const\s+(\w+)\s*=\s*\(/g,
  function: /function\s+(\w+)\s*\(/g,
};
```

### Dependency Detection

```typescript
// Track imports used by each component
function analyzeDependencies(componentCode: string): string[] {
  const identifiers = extractIdentifiers(componentCode);
  return identifiers.filter(id => isImportedSymbol(id));
}
```

### Shared Utility Detection

```typescript
function isSharedUtility(symbol: string, components: ComponentInfo[]): boolean {
  const usageCount = components.filter(c =>
    c.dependencies.includes(symbol)
  ).length;

  return usageCount > 1;
}
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/split-component/steps/step-02-split.md`

(Only if user approved)
