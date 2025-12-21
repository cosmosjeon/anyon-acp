---
name: 'step-01-analyze'
description: 'Analyze target file and create split plan with user confirmation'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/split-module/steps/step-01-analyze.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/split-module/steps/step-02-split.md'
---

# Step 1: Analyze & Plan

**Progress: Step 1 of 3**

---

## STEP GOAL

대상 파일을 분석하고 분할 계획을 생성한 후 사용자에게 확인받습니다.

---

## EXECUTION SEQUENCE

### 1. Load Split Target from Audit Results

`sdd-docs/audits/audit-result.json`에서 `action: "split_file"` 이슈를 찾습니다.

```typescript
interface SplitFileIssue {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  area: 'frontend' | 'desktop' | 'server';
  type: string;
  title: string;
  file: string;  // 분할 대상 파일 경로
  line: null;
  action: 'split_file';
  description: string;
  metadata?: {
    lines: number;
    complexity?: number;
  };
}
```

**이슈가 없는 경우**:
```
⚠️ audit-result.json에 split_file 액션 이슈가 없습니다.
   분할이 필요한 파일이 없거나, /code-audit를 다시 실행해주세요.
```

**이슈가 여러 개인 경우**:
```yaml
질문: "어떤 파일을 분할할까요?"
옵션:
  - 파일 1: "src/api.ts (2,496줄)"
  - 파일 2: "src-tauri/src/claude.rs (2,892줄)"
  - 파일 3: "server/index.js (382줄)"
  - ALL: "모두 순차 실행"
```

### 2. Detect Language

파일 확장자로 언어를 감지합니다:

```typescript
const langDetect = (file: string) => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) return 'typescript';
  if (file.endsWith('.rs')) return 'rust';
  if (file.endsWith('.js') || file.endsWith('.jsx')) return 'javascript';
  throw new Error(`Unsupported file type: ${file}`);
};
```

### 3. Read Target File

대상 파일의 전체 내용을 읽습니다.

```bash
# 파일 정보 수집
wc -l {target_file}        # 라인 수
file {target_file}         # 파일 타입
```

### 4. Extract Exported Symbols

언어별로 export된 심볼을 추출합니다.

#### TypeScript/JavaScript
```bash
# export된 함수/클래스 찾기
grep -n "^export " {file}
grep -n "^export {" {file}
grep -n "^export default" {file}
```

추출할 정보:
- `export function functionName(...)`
- `export class ClassName { ... }`
- `export const constantName = ...`
- `export { name1, name2 }`

#### Rust
```bash
# pub fn, pub struct 찾기
grep -n "^pub fn " {file}
grep -n "^pub struct " {file}
grep -n "^pub enum " {file}
```

추출할 정보:
- `pub fn function_name(...)`
- `pub struct StructName { ... }`
- `pub enum EnumName { ... }`

### 5. Group by Functionality

Export된 심볼들을 기능별로 그룹화합니다.

#### 그룹핑 휴리스틱

**이름 패턴 기반**:
```typescript
const groups = {
  projects: symbols.filter(s => s.name.includes('project') || s.name.includes('Project')),
  sessions: symbols.filter(s => s.name.includes('session') || s.name.includes('Session')),
  storage: symbols.filter(s => s.name.includes('storage') || s.name.includes('Storage')),
  // ... 기타 패턴
};
```

**코멘트/섹션 기반**:
```typescript
// 파일 내 섹션 구분 코멘트 찾기
// === Projects ===
// === Sessions ===
// --- Storage ---
```

### 6. Analyze Dependencies

각 그룹 간 의존성을 분석합니다.

```typescript
// 각 함수가 다른 어떤 함수를 호출하는지 파악
const dependencies = analyzeDependencies(symbols);

// 예시:
// createProject() → validateProjectName()
// deleteProject() → getProject(), validateProjectId()
```

**의존성 순환 체크**:
- 순환 의존성이 있으면 경고 표시
- 공통 유틸리티는 별도 파일로 분리 제안

### 7. Create Split Plan

분할 계획을 생성합니다.

```typescript
interface SplitPlan {
  language: 'typescript' | 'rust' | 'javascript';
  targetFile: string;
  targetDir: string;  // 예: "src/api", "src-tauri/src/claude"
  modules: Module[];
  sharedUtilities: string[];  // 공통 유틸리티
  circularDependencies: string[];  // 순환 의존성 경고
}

interface Module {
  name: string;  // 예: "projects", "sessions"
  filename: string;  // 예: "projects.ts", "sessions.rs"
  symbols: string[];  // export될 심볼 목록
  estimatedLines: number;
}
```

#### 예시 계획 (TypeScript)

```
src/api.ts (2,496줄) → src/api/

생성될 파일:
  ✓ src/api/index.ts (re-export hub)
  ✓ src/api/projects.ts (~800줄)
    - createProject()
    - updateProject()
    - deleteProject()
    - listProjects()
  ✓ src/api/sessions.ts (~600줄)
    - createSession()
    - getSession()
    - deleteSession()
  ✓ src/api/storage.ts (~400줄)
    - saveData()
    - loadData()
    - clearStorage()
  ✓ src/api/utils.ts (~200줄) [공통 유틸리티]
    - validateId()
    - formatResponse()
```

### 8. Display Plan & Ask User

사용자에게 분할 계획을 보여주고 확인을 받습니다.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Split Module Plan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Target: {file} ({lines}줄)
🗂️ Language: {language}
📁 Output Directory: {targetDir}/

생성될 모듈:

┌─────────────────────────────────────────┐
│ Module: {module1.name}                  │
│ File: {module1.filename}                │
│ Symbols: {count}개 (~{lines}줄)         │
├─────────────────────────────────────────┤
│ - symbol1                               │
│ - symbol2                               │
│ - ...                                   │
└─────────────────────────────────────────┘

[... 다른 모듈들 ...]

⚙️ 공통 유틸리티: {sharedCount}개
⚠️ 순환 의존성: {circularCount}개

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AskUserQuestion 사용**:

```yaml
질문: "이 계획대로 파일을 분할할까요?"
옵션:
  - yes: "예, 진행합니다"
  - edit: "아니오, 계획 수정"
  - cancel: "취소"
```

**edit 선택 시**:
- 사용자에게 수정 요청 받기
- 계획 재조정 후 다시 확인

**cancel 선택 시**:
- 워크플로우 종료

---

## OUTPUT

다음 정보를 Step 2로 전달:

```typescript
{
  splitPlan: SplitPlan,
  userConfirmed: true,
  targetFile: string,
}
```

---

## DISPLAY

```
✅ Step 1 완료

분할 계획 확정:
  - 대상 파일: {file}
  - 생성할 모듈: {count}개
  - 언어: {language}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 2: 파일 분할 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/split-module/steps/step-02-split.md`
