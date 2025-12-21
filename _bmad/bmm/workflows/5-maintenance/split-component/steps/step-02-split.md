---
name: 'step-02-split'
description: 'Extract components to separate files with backup'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/split-component/steps/step-02-split.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/split-component/steps/step-03-verify.md'
---

# Step 2: Split Components

**Progress: Step 2 of 3**

---

## STEP GOAL

컴포넌트를 개별 파일로 추출하고 index 파일을 생성합니다.

---

## EXECUTION SEQUENCE

### 1. Create Rollback Point

모든 파일 수정 전 백업 생성:

```bash
git stash push -m "split-component-backup-$(date +%Y%m%d-%H%M%S)"
```

**출력 표시**:
```
💾 Rollback point created
   롤백하려면: git stash pop
```

### 2. Create Directory Structure

```bash
# Example: ToolWidgets.tsx → widgets/
mkdir -p src/components/widgets/shared
```

**생성할 디렉토리**:
```
[target-directory]/
├── shared/         # 공유 유틸리티 (필요시)
└── [components]    # 개별 컴포넌트 파일들
```

### 3. Extract Shared Utilities

공유 타입과 유틸리티를 먼저 추출:

#### 3.1 Types File

**파일**: `[target-directory]/shared/types.ts`

```typescript
// Extract shared type definitions
export interface WidgetProps {
  // ...
}

export type WidgetConfig = {
  // ...
}
```

#### 3.2 Utils File

**파일**: `[target-directory]/shared/utils.ts`

```typescript
// Extract shared utility functions
export function formatWidgetData(data: unknown) {
  // ...
}

export const WIDGET_CONSTANTS = {
  // ...
}
```

### 4. Extract Individual Components

각 컴포넌트를 개별 파일로 추출:

```typescript
interface ExtractOperation {
  sourceFile: string;
  targetFile: string;
  componentName: string;
  startLine: number;
  endLine: number;
  imports: string[];
}

// For each component in split plan
for (const component of splitPlan.components) {
  await extractComponent(component);
}
```

#### 4.1 Component File Template

**파일**: `[target-directory]/[ComponentName].tsx`

```typescript
// Import dependencies
import React from 'react';
import { type WidgetProps } from './shared/types';
import { formatWidgetData } from './shared/utils';

// External imports from original file
import { Button } from '@/components/ui/button';

// Component code (extracted from original)
export function ApiKeyWidget({ ... }: WidgetProps) {
  // Component implementation
}
```

**Import 처리 전략**:

1. **React Imports**: 필요시 자동 추가
2. **Shared Types/Utils**: 상대 경로로 import
3. **External Dependencies**: 원본 파일의 import 복사
4. **Internal Dependencies**: 같은 디렉토리에서 import

#### 4.2 Update Imports

각 컴포넌트 파일의 import 문 업데이트:

```typescript
function updateImports(componentCode: string, dependencies: string[]): string {
  // 1. Add React import if needed
  let updatedCode = componentCode;
  if (usesJSX(componentCode) && !hasReactImport(componentCode)) {
    updatedCode = `import React from 'react';\n${updatedCode}`;
  }

  // 2. Add shared imports
  const sharedTypes = dependencies.filter(d => isSharedType(d));
  if (sharedTypes.length > 0) {
    updatedCode = `import { ${sharedTypes.join(', ')} } from './shared/types';\n${updatedCode}`;
  }

  // 3. Add utility imports
  const sharedUtils = dependencies.filter(d => isSharedUtil(d));
  if (sharedUtils.length > 0) {
    updatedCode = `import { ${sharedUtils.join(', ')} } from './shared/utils';\n${updatedCode}`;
  }

  return updatedCode;
}
```

### 5. Create Index File

모든 컴포넌트를 re-export하는 배럴 파일 생성:

**파일**: `[target-directory]/index.ts`

```typescript
// Re-export all components
export { ApiKeyWidget } from './ApiKeyWidget';
export { PromptWidget } from './PromptWidget';
export { HistoryWidget } from './HistoryWidget';
// ... (all other components)

// Re-export shared types/utils (optional)
export type { WidgetProps, WidgetConfig } from './shared/types';
export { formatWidgetData, WIDGET_CONSTANTS } from './shared/utils';
```

**생성 로직**:

```typescript
function generateIndexFile(components: ComponentInfo[]): string {
  const exports = components
    .map(c => `export { ${c.name} } from './${c.name}';`)
    .join('\n');

  const typeExports = splitPlan.sharedUtilities
    .filter(u => u.type === 'type' || u.type === 'interface')
    .map(u => u.name);

  const utilExports = splitPlan.sharedUtilities
    .filter(u => u.type === 'function' || u.type === 'const')
    .map(u => u.name);

  let indexContent = `// Auto-generated barrel file\n\n`;
  indexContent += `// Components\n${exports}\n\n`;

  if (typeExports.length > 0) {
    indexContent += `// Types\nexport type { ${typeExports.join(', ')} } from './shared/types';\n\n`;
  }

  if (utilExports.length > 0) {
    indexContent += `// Utilities\nexport { ${utilExports.join(', ')} } from './shared/utils';\n`;
  }

  return indexContent;
}
```

### 6. Update Original File References

원본 파일을 사용하는 다른 파일들의 import 경로 업데이트:

#### 6.1 Find Referencing Files

```bash
# Find all files importing the original component
rg "from ['\"].*ToolWidgets['\"]" src/ -l
rg "from ['\"]@/components/ToolWidgets['\"]" src/ -l
```

#### 6.2 Update Import Paths

```typescript
// Before:
import { ApiKeyWidget } from './ToolWidgets';
import { PromptWidget } from '@/components/ToolWidgets';

// After:
import { ApiKeyWidget } from './widgets';
import { PromptWidget } from '@/components/widgets';
```

**자동 교체 로직**:

```typescript
function updateImportPaths(referencingFiles: string[], oldPath: string, newPath: string) {
  for (const file of referencingFiles) {
    // Replace relative imports
    replaceInFile(file, `from '${oldPath}'`, `from '${newPath}'`);
    replaceInFile(file, `from "${oldPath}"`, `from "${newPath}"`);

    // Replace absolute imports
    replaceInFile(file, `from '@/components/${oldPath}'`, `from '@/components/${newPath}'`);
  }
}
```

### 7. Remove Original File

분할이 완료되면 원본 파일 삭제:

```bash
rm src/components/ToolWidgets.tsx
```

**확인 메시지**:
```
🗑️ Original file removed: ToolWidgets.tsx
```

---

## PROGRESS DISPLAY

각 단계마다 진행 상황 표시:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Step 2: Splitting Components
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Rollback point created

📁 Creating directory structure...
  ✅ src/components/widgets/
  ✅ src/components/widgets/shared/

📝 Extracting shared utilities...
  ✅ shared/types.ts (5 types)
  ✅ shared/utils.ts (3 functions)

🔨 Extracting components... (27 total)
  ✅ [1/27] ApiKeyWidget.tsx
  ✅ [2/27] PromptWidget.tsx
  ✅ [3/27] HistoryWidget.tsx
  ⏳ [4/27] Processing...
  ...

📦 Creating index.ts...
  ✅ Re-exporting 27 components

🔗 Updating import paths...
  ✅ [1/5] src/pages/Dashboard.tsx
  ✅ [2/5] src/components/ToolPanel.tsx
  ...

🗑️ Removing original file...
  ✅ src/components/ToolWidgets.tsx removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Split completed successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ERROR HANDLING

### 파일 생성 실패

```typescript
try {
  await createComponentFile(targetPath, content);
} catch (error) {
  console.error(`❌ Failed to create ${targetPath}: ${error.message}`);
  // Continue with next component
}
```

### Import 업데이트 실패

```typescript
try {
  await updateImportPaths(referencingFiles, oldPath, newPath);
} catch (error) {
  console.warn(`⚠️ Failed to update imports: ${error.message}`);
  console.warn(`   Manual update required for: ${referencingFiles.join(', ')}`);
}
```

---

## OUTPUT

다음 정보를 Step 3으로 전달:

```typescript
{
  targetDirectory: string,
  createdFiles: string[],
  updatedFiles: string[],
  deletedFiles: string[],
  summary: {
    componentsExtracted: number,
    sharedFilesCreated: number,
    importsUpdated: number,
  },
}
```

---

## FILE STRUCTURE EXAMPLE

### Before Split

```
src/components/
└── ToolWidgets.tsx (3,273 lines)
```

### After Split

```
src/components/
└── widgets/
    ├── index.ts
    ├── ApiKeyWidget.tsx
    ├── PromptWidget.tsx
    ├── HistoryWidget.tsx
    ├── ... (24 more widgets)
    └── shared/
        ├── types.ts
        └── utils.ts
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/split-component/steps/step-03-verify.md`
