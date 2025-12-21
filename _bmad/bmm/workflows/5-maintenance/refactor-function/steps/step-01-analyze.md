---
name: 'step-01-analyze'
description: 'Analyze target function and create refactoring plan'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-01-analyze.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-02-extract.md'
---

# Step 1: Analyze Function

**Progress: Step 1 of 3**

---

## STEP GOAL

대상 함수를 분석하고 서브 함수 추출 계획을 수립한 후 사용자에게 확인받습니다.

---

## EXECUTION SEQUENCE

### 1. Load Target Issue

`sdd-docs/audits/audit-result.json`에서 `action: "refactor_function"` 이슈를 찾습니다.

```typescript
interface RefactorIssue {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  area: 'frontend' | 'desktop' | 'server';
  type: 'bloater' | 'complexity';
  title: string;
  file: string;
  line: number | null;
  action: 'refactor_function';
  description: string;
  metadata: {
    functionName: string;
    lines: number;
    complexity?: number;
    language: 'typescript' | 'javascript' | 'rust';
  };
}
```

**이슈가 여러 개인 경우**:
```
🔍 발견된 refactor_function 이슈:

1. handleSendPrompt (505줄) - Frontend
2. main() (402줄) - Desktop/Rust
3. spawn_agent_system() (322줄) - Desktop/Rust

어느 함수를 리팩토링할까요? (1-3)
```

### 2. Read Target Function

대상 함수의 전체 코드를 읽습니다.

```bash
# 함수 위치 찾기
rg --line-number "function {functionName}" {file}
rg --line-number "fn {functionName}" {file}  # Rust

# 함수 전체 읽기 (line 범위 추정)
```

**TypeScript 예시**:
```typescript
// Read entire function body
const functionCode = readFile(file, startLine, estimatedEndLine);
```

**Rust 예시**:
```rust
// Find function boundaries using braces
fn main() { ... }
```

### 3. Identify Responsibilities

함수가 하는 일들을 목록화합니다.

**분석 기준**:
- 논리적으로 구분 가능한 코드 블록
- 독립적으로 실행 가능한 작업
- 명확한 입력/출력을 가진 블록

**예시 (handleSendPrompt)**:
```
책임 목록:
1. Input Validation (50줄)
   - prompt 길이 검증
   - 특수문자 검사
   - 권한 확인

2. Event Listener Setup (100줄)
   - IPC 리스너 등록
   - Cleanup 핸들러 설정
   - 에러 핸들러 등록

3. Command Execution (200줄)
   - 명령어 파싱
   - API 호출
   - 진행 상태 업데이트

4. Response Handling (150줄)
   - 결과 파싱
   - UI 업데이트
   - 로깅

5. Cleanup (5줄)
   - 리스너 제거
   - 임시 파일 삭제
```

### 4. Plan Sub-functions

각 책임별로 추출할 함수를 계획합니다.

```typescript
interface SubFunctionPlan {
  name: string;
  responsibility: string;
  parameters: Parameter[];
  returnType: string;
  async: boolean;
  extractedLines: [number, number]; // [start, end]
  dependencies: string[]; // 필요한 외부 변수/상태
}

interface Parameter {
  name: string;
  type: string;
  description: string;
}
```

**예시 계획**:

```typescript
// 1. validateInput
{
  name: 'validateInput',
  responsibility: 'prompt 입력값 검증 및 정제',
  parameters: [
    { name: 'rawPrompt', type: 'string', description: '사용자 입력 prompt' },
    { name: 'config', type: 'ValidationConfig', description: '검증 설정' }
  ],
  returnType: 'ValidatedPrompt',
  async: false,
  extractedLines: [50, 100],
  dependencies: ['MAX_PROMPT_LENGTH', 'ALLOWED_CHARS']
}

// 2. setupEventListeners
{
  name: 'setupEventListeners',
  responsibility: 'IPC 이벤트 리스너 설정 및 cleanup 핸들러 등록',
  parameters: [
    { name: 'sessionId', type: 'string', description: '현재 세션 ID' }
  ],
  returnType: 'EventCleanup',
  async: false,
  extractedLines: [101, 200],
  dependencies: ['ipcRenderer']
}

// 3. executeCommand
{
  name: 'executeCommand',
  responsibility: '명령어 실행 및 진행 상태 관리',
  parameters: [
    { name: 'validatedPrompt', type: 'ValidatedPrompt', description: '검증된 prompt' },
    { name: 'sessionId', type: 'string', description: '세션 ID' }
  ],
  returnType: 'Promise<CommandResult>',
  async: true,
  extractedLines: [201, 400],
  dependencies: ['apiClient', 'progressManager']
}

// ... 나머지 함수들
```

### 5. Analyze Dependencies

각 서브 함수가 필요로 하는 의존성을 분석합니다.

**의존성 유형**:
- **상수**: 함수 외부의 const 값
- **공유 상태**: 클로저 변수, 클래스 멤버
- **외부 모듈**: import된 함수/객체
- **파라미터로 전환 필요**: 현재 함수의 지역 변수

**예시**:
```typescript
// 현재 함수 내부
function handleSendPrompt() {
  const sessionId = generateSessionId(); // 여러 서브함수에서 사용
  const config = loadConfig(); // 여러 서브함수에서 사용

  // validateInput에서 sessionId는 불필요, config는 필요
  // executeCommand에서 sessionId, config 둘 다 필요
}

// 분석 결과:
// - sessionId: executeCommand, handleResponse 파라미터로 전달
// - config: validateInput, executeCommand 파라미터로 전달
```

### 6. Language-Specific Considerations

#### TypeScript/JavaScript
```typescript
// async/await 패턴 확인
const isAsync = functionCode.includes('async') || functionCode.includes('await');

// 타입 정의 확인
const hasTypeAnnotations = functionCode.includes(': ');

// 클로저 변수 확인
const closureVars = findClosureVariables(functionCode);
```

#### Rust
```rust
// async 확인
async fn function_name() -> Result<T, E>

// 소유권 분석
// - 참조(&) vs 소유(T)
// - 가변 참조(&mut)
// - 수명 파라미터('a)

// Result/Option 타입 확인
```

### 7. Create Visual Plan

사용자에게 보여줄 시각적 계획을 생성합니다.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Refactoring Plan: {functionName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 현재 상태:
- 파일: {file}
- 라인: {totalLines}줄
- 복잡도: {complexity}
- 언어: {language}

🎯 추출할 함수: {subFunctionCount}개

┌─────────────────────────────────────────
│ 1. validateInput
├─────────────────────────────────────────
│ 책임: prompt 입력값 검증 및 정제
│ 파라미터:
│   - rawPrompt: string
│   - config: ValidationConfig
│ 반환: ValidatedPrompt
│ 라인: 50-100 (50줄)
│ async: No
│ 의존성: MAX_PROMPT_LENGTH, ALLOWED_CHARS
└─────────────────────────────────────────

┌─────────────────────────────────────────
│ 2. setupEventListeners
├─────────────────────────────────────────
│ 책임: IPC 이벤트 리스너 설정
│ 파라미터:
│   - sessionId: string
│ 반환: EventCleanup
│ 라인: 101-200 (100줄)
│ async: No
│ 의존성: ipcRenderer
└─────────────────────────────────────────

... (나머지 함수들)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 리팩토링 후 구조:

{functionName}() {
  const validatedInput = validateInput(rawPrompt, config);
  const cleanup = setupEventListeners(sessionId);
  const result = await executeCommand(validatedInput, sessionId);
  handleCommandResponse(result, cleanup);
  cleanup.dispose();
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 8. Ask User Confirmation

사용자에게 계획을 확인받습니다.

**AskUserQuestion 사용**:
```yaml
질문: "이 계획대로 리팩토링을 진행할까요?"
옵션:
  - yes: "진행 (Step 2로 이동)"
  - modify: "계획 수정 필요"
  - cancel: "취소"
```

**modify 선택 시**:
```
어느 부분을 수정할까요?

1. 함수명 변경
2. 파라미터 조정
3. 책임 재분류
4. 취소

선택: ___
```

---

## OUTPUT

다음 정보를 다음 단계로 전달:

```typescript
{
  targetIssue: RefactorIssue,
  originalFunction: {
    name: string,
    file: string,
    startLine: number,
    endLine: number,
    code: string,
    language: 'typescript' | 'javascript' | 'rust',
  },
  refactoringPlan: {
    subFunctions: SubFunctionPlan[],
    dependencies: {
      constants: string[],
      sharedState: string[],
      externalModules: string[],
    },
    estimatedComplexityReduction: number, // %
  },
  userApproved: boolean,
}
```

---

## DISPLAY

```
✅ Step 1 완료

📋 분석 결과:
  - 대상 함수: {functionName}
  - 추출 함수 수: {count}개
  - 예상 복잡도 감소: {reduction}%
  - 예상 최대 함수 길이: {maxLines}줄

👤 사용자 승인: {approved}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 2: 서브 함수 추출 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## SAFETY CHECKS

### 1. Function Not Found
```
❌ 함수를 찾을 수 없습니다: {functionName} in {file}
   audit-result.json의 메타데이터를 확인해주세요.
```

### 2. Too Complex
```
⚠️ 이 함수는 매우 복잡합니다 (CC: {complexity})
   단계별 리팩토링을 권장합니다.

   계속 진행할까요? (yes/no)
```

### 3. No Clear Boundaries
```
⚠️ 명확한 책임 경계를 찾기 어렵습니다.
   수동 리팩토링이 더 안전할 수 있습니다.

   계속 진행할까요? (yes/no)
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-02-extract.md`
