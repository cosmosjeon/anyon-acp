---
name: 'step-02-split'
description: 'Execute file splitting based on the confirmed plan'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/split-module/steps/step-02-split.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/split-module/steps/step-03-verify.md'
---

# Step 2: Split Execution

**Progress: Step 2 of 3**

---

## STEP GOAL

확정된 분할 계획에 따라 실제로 파일을 분할하고, import/use 문을 업데이트합니다.

---

## EXECUTION SEQUENCE

### 1. Create Backup

작업 시작 전 현재 상태를 백업합니다.

```bash
# Git stash로 백업
git stash push -m "split-module-backup-$(date +%Y%m%d-%H%M%S)" {targetFile}

# 백업 확인
git stash list | head -1
```

**백업 실패 시**:
- 워크플로우 중단
- 사용자에게 수동 백업 요청

### 2. Create Output Directory

분할된 모듈을 저장할 디렉토리를 생성합니다.

```bash
# 예: src/api.ts → src/api/
mkdir -p {targetDir}
```

**디렉토리가 이미 존재하는 경우**:
- 사용자에게 확인 요청
- 기존 파일 덮어쓰기 경고

### 3. Split by Language

언어별로 파일을 분할합니다.

---

#### TypeScript/JavaScript Split

##### 3.1. Extract Modules

각 모듈별로 파일을 생성합니다.

```typescript
// 예: src/api/projects.ts 생성
// 원본 파일에서 projects 관련 코드만 추출

// 1. Import 문 복사 (필요한 것만)
import { ProjectData, ProjectConfig } from './types';
import { validateId } from './utils';

// 2. 함수/클래스 복사
export async function createProject(data: ProjectData): Promise<Project> {
  // ... 원본 코드
}

export async function updateProject(id: string, data: Partial<ProjectData>): Promise<Project> {
  // ... 원본 코드
}

// 3. Type definitions (해당 모듈 전용)
interface ProjectInternal {
  // ...
}
```

**각 모듈 파일 생성 프로세스**:
1. 필요한 import 문 추출
2. 해당 그룹의 함수/클래스 복사
3. 내부 타입/인터페이스 포함
4. JSDoc 코멘트 유지

##### 3.2. Create Index File

`index.ts` 파일을 생성하여 모든 모듈을 re-export합니다.

```typescript
// src/api/index.ts

// Re-export all modules
export * from './projects';
export * from './sessions';
export * from './storage';
export * from './utils';

// Default export (선택적)
import * as projects from './projects';
import * as sessions from './sessions';
import * as storage from './storage';

export default {
  projects,
  sessions,
  storage,
};
```

##### 3.3. Create Shared Utils

공통 유틸리티 파일을 생성합니다.

```typescript
// src/api/utils.ts

export function validateId(id: string): boolean {
  // ... 원본 코드
}

export function formatResponse<T>(data: T): Response<T> {
  // ... 원본 코드
}
```

---

#### Rust Split

##### 3.1. Extract Modules

각 모듈별로 `.rs` 파일을 생성합니다.

```rust
// src-tauri/src/claude/projects.rs

use crate::types::{Project, ProjectData};
use super::utils::validate_id;

pub async fn create_project(data: ProjectData) -> Result<Project, Error> {
    // ... 원본 코드
}

pub async fn update_project(id: &str, data: ProjectData) -> Result<Project, Error> {
    // ... 원본 코드
}
```

##### 3.2. Create mod.rs

`mod.rs` 파일을 생성하여 서브모듈을 선언하고 re-export합니다.

```rust
// src-tauri/src/claude/mod.rs

// Declare submodules
pub mod projects;
pub mod sessions;
pub mod storage;
mod utils;  // private

// Re-export public items
pub use projects::*;
pub use sessions::*;
pub use storage::*;
```

##### 3.3. Create Shared Utils

공통 유틸리티 모듈을 생성합니다.

```rust
// src-tauri/src/claude/utils.rs

pub(crate) fn validate_id(id: &str) -> bool {
    // ... 원본 코드
}
```

**pub(crate)**: 같은 crate 내부에서만 사용 가능

---

### 4. Update Import Statements

분할된 파일을 참조하는 다른 파일들의 import/use 문을 업데이트합니다.

#### TypeScript/JavaScript

**변경 전**:
```typescript
import { createProject, getSession, saveData } from './api';
```

**변경 후**:
```typescript
// Option 1: 인덱스 파일 사용
import { createProject, getSession, saveData } from './api';

// Option 2: 직접 import
import { createProject } from './api/projects';
import { getSession } from './api/sessions';
import { saveData } from './api/storage';
```

#### Rust

**변경 전**:
```rust
use crate::claude::{create_project, get_session};
```

**변경 후**:
```rust
// mod.rs에서 re-export하므로 변경 불필요
use crate::claude::{create_project, get_session};

// 또는 명시적으로
use crate::claude::projects::create_project;
use crate::claude::sessions::get_session;
```

### 5. Find and Update All References

프로젝트 전체에서 import 문을 찾아 업데이트합니다.

```bash
# TypeScript/JavaScript
grep -r "from ['\"].*{originalFile}['\"]" src/

# Rust
grep -r "use.*{originalModule}" src-tauri/src/
```

**각 파일마다**:
1. 파일 읽기
2. import/use 문 찾기
3. 필요 시 업데이트
4. 파일 저장

### 6. Remove Original File

분할이 완료되면 원본 파일을 제거합니다.

```bash
# 백업은 git stash에 있으므로 안전하게 삭제
rm {originalFile}
```

**단, 다음 경우는 제거하지 않음**:
- 아직 남은 코드가 있는 경우
- 사용자가 보존 요청한 경우

### 7. Update Module Exports

#### TypeScript - package.json 또는 tsconfig.json

```json
// tsconfig.json - paths 업데이트
{
  "compilerOptions": {
    "paths": {
      "@/api": ["src/api/index.ts"],
      "@/api/*": ["src/api/*"]
    }
  }
}
```

#### Rust - Cargo.toml 및 lib.rs

```rust
// src-tauri/src/lib.rs
pub mod claude;  // 기존과 동일
```

**변경 불필요**: `mod.rs`가 자동으로 서브모듈 관리

---

## LANGUAGE-SPECIFIC STRATEGIES

### TypeScript Strategy

```typescript
// 1. 원본 파일 파싱
const ast = parseTypeScript(originalFile);

// 2. Export 심볼 추출
const exports = ast.filter(node => node.kind === 'ExportDeclaration');

// 3. 그룹별로 분리
const groups = groupByPlan(exports, splitPlan);

// 4. 각 그룹별 파일 생성
groups.forEach(group => {
  writeFile(`${targetDir}/${group.name}.ts`, generateModule(group));
});

// 5. index.ts 생성
writeFile(`${targetDir}/index.ts`, generateIndex(groups));
```

### Rust Strategy

```rust
// 1. 원본 파일 파싱
let ast = parse_rust_file(original_file);

// 2. Pub 아이템 추출
let pub_items = ast.items.filter(|item| item.vis == Visibility::Public);

// 3. 그룹별로 분리
let groups = group_by_plan(pub_items, split_plan);

// 4. 각 그룹별 파일 생성
for group in groups {
    write_file(format!("{}/{}.rs", target_dir, group.name), generate_module(group));
}

// 5. mod.rs 생성
write_file(format!("{}/mod.rs", target_dir), generate_mod_file(groups));
```

---

## ERROR HANDLING

### File Creation Errors

```bash
if [ ! -d {targetDir} ]; then
  echo "❌ Failed to create directory: {targetDir}"
  git stash pop
  exit 1
fi
```

### Parsing Errors

```typescript
try {
  const ast = parseFile(file);
} catch (error) {
  console.error(`❌ Failed to parse ${file}: ${error.message}`);
  // Rollback
  await rollback();
  process.exit(1);
}
```

### Circular Dependencies

```
⚠️ 순환 의존성 감지:
  - Module A → Module B → Module A

해결 방법:
  1. 공통 부분을 utils로 추출
  2. 의존성 방향 재설계
  3. 사용자에게 수동 수정 요청
```

---

## OUTPUT

다음 정보를 Step 3로 전달:

```typescript
{
  splitCompleted: true,
  targetFile: string,
  targetDir: string,
  createdFiles: string[],  // 생성된 파일 목록
  updatedFiles: string[],  // 업데이트된 파일 목록
  stashId: string,         // 백업 stash ID
}
```

---

## DISPLAY

```
✅ Step 2 완료

파일 분할 완료:
  - 원본: {originalFile} (삭제됨)
  - 출력 디렉토리: {targetDir}/

생성된 파일:
  ✓ {targetDir}/index.{ext}
  ✓ {targetDir}/module1.{ext}
  ✓ {targetDir}/module2.{ext}
  ✓ {targetDir}/utils.{ext}

업데이트된 파일:
  ✓ {file1} (import 업데이트)
  ✓ {file2} (use 업데이트)

💾 백업: git stash (ID: {stashId})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 3: 빌드 검증 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/split-module/steps/step-03-verify.md`
