---
name: 'step-02-extract'
description: 'Extract sub-functions from original function'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-02-extract.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-03-verify.md'
---

# Step 2: Extract Sub-functions

**Progress: Step 2 of 3**

---

## STEP GOAL

계획에 따라 서브 함수를 추출하고 원본 함수를 리팩토링합니다.

---

## EXECUTION SEQUENCE

### 1. Create Rollback Point

작업 시작 전 현재 상태를 백업합니다.

```bash
# 현재 변경사항을 stash에 저장
git stash push -m "refactor-backup-{functionName}-$(date +%Y%m%d-%H%M%S)" -- {file}
```

**확인 메시지**:
```
💾 Rollback point created
   Stash ID: stash@{0}
   File: {file}
```

### 2. Extract Sub-functions (Language-Specific)

#### TypeScript/JavaScript Extraction

```typescript
// 원본 함수 구조
async function handleSendPrompt(rawPrompt: string) {
  // [50-100] Input validation block
  if (!rawPrompt || rawPrompt.length === 0) {
    throw new Error('Empty prompt');
  }
  // ... 50줄의 검증 로직

  // [101-200] Event listener setup block
  const cleanup = () => { ... };
  ipcRenderer.on('progress', ...);
  // ... 100줄의 리스너 설정

  // [201-400] Command execution block
  const result = await apiClient.execute(...);
  // ... 200줄의 실행 로직

  // ... 나머지
}
```

**추출 후**:
```typescript
// 1. 추출된 서브 함수들 (원본 함수 위에 배치)
function validateInput(
  rawPrompt: string,
  config: ValidationConfig
): ValidatedPrompt {
  if (!rawPrompt || rawPrompt.length === 0) {
    throw new Error('Empty prompt');
  }
  // ... [50-100] 블록의 코드 그대로 이동
  return { prompt: sanitized, metadata };
}

function setupEventListeners(sessionId: string): EventCleanup {
  const cleanup = () => { ... };
  ipcRenderer.on('progress', ...);
  // ... [101-200] 블록의 코드 그대로 이동
  return { dispose: cleanup };
}

async function executeCommand(
  validatedPrompt: ValidatedPrompt,
  sessionId: string
): Promise<CommandResult> {
  const result = await apiClient.execute(...);
  // ... [201-400] 블록의 코드 그대로 이동
  return result;
}

// ... 나머지 서브 함수들

// 2. 리팩토링된 원본 함수
async function handleSendPrompt(rawPrompt: string) {
  const config = loadValidationConfig();
  const sessionId = generateSessionId();

  const validatedInput = validateInput(rawPrompt, config);
  const cleanup = setupEventListeners(sessionId);

  try {
    const result = await executeCommand(validatedInput, sessionId);
    handleCommandResponse(result, cleanup);
  } finally {
    cleanup.dispose();
  }
}
```

**타입 처리**:
```typescript
// 필요한 경우 새 타입 정의 추가
interface ValidatedPrompt {
  prompt: string;
  metadata: PromptMetadata;
}

interface EventCleanup {
  dispose: () => void;
}
```

#### Rust Extraction

```rust
// 원본 함수 구조
async fn spawn_agent_system() -> Result<AgentHandle, Error> {
    // [50-100] Process creation block
    let mut cmd = Command::new("agent");
    cmd.arg("--mode").arg("standalone");
    // ... 50줄의 프로세스 설정

    // [101-200] IO handlers setup block
    let (stdin_tx, stdin_rx) = mpsc::channel();
    let (stdout_tx, stdout_rx) = mpsc::channel();
    // ... 100줄의 IO 설정

    // [201-322] Monitor spawn block
    let monitor = tokio::spawn(async move { ... });
    // ... 122줄의 모니터링 로직
}
```

**추출 후**:
```rust
// 1. 추출된 서브 함수들
fn create_process(config: &ProcessConfig) -> Command {
    let mut cmd = Command::new("agent");
    cmd.arg("--mode").arg("standalone");
    // ... [50-100] 블록의 코드 그대로 이동
    cmd
}

fn setup_io_handlers() -> (Sender<String>, Receiver<String>) {
    let (stdin_tx, stdin_rx) = mpsc::channel();
    let (stdout_tx, stdout_rx) = mpsc::channel();
    // ... [101-200] 블록의 코드 그대로 이동
    (stdin_tx, stdout_rx)
}

async fn spawn_monitor(
    process: Child,
    stdin_rx: Receiver<String>,
) -> JoinHandle<Result<(), Error>> {
    tokio::spawn(async move {
        // ... [201-322] 블록의 코드 그대로 이동
    })
}

// 2. 리팩토링된 원본 함수
async fn spawn_agent_system() -> Result<AgentHandle, Error> {
    let config = load_process_config();
    let mut cmd = create_process(&config);
    let (stdin_tx, stdout_rx) = setup_io_handlers();

    let child = cmd.spawn()?;
    let monitor = spawn_monitor(child, stdout_rx).await;

    Ok(AgentHandle { stdin: stdin_tx, monitor })
}
```

**소유권 처리**:
```rust
// 참조가 필요한 경우 &
fn create_process(config: &ProcessConfig) -> Command

// 소유권 이전이 필요한 경우 T
async fn spawn_monitor(process: Child, ...) -> ...

// 가변 참조가 필요한 경우 &mut
fn setup_process(cmd: &mut Command) -> ()
```

### 3. Handle Dependencies

#### Constants
```typescript
// 원본 함수 내부 상수 → 모듈 레벨로 이동
const MAX_PROMPT_LENGTH = 5000; // 함수 외부로 이동

function validateInput(rawPrompt: string, config: ValidationConfig) {
  if (rawPrompt.length > MAX_PROMPT_LENGTH) { // 그대로 사용 가능
    throw new Error('Prompt too long');
  }
}
```

#### Shared State (Closure Variables)
```typescript
// 클로저 변수 → 파라미터로 전환
// Before
function handleSendPrompt() {
  const sessionId = generateSessionId();

  // ... 200줄 후
  function someInternalLogic() {
    console.log(sessionId); // 클로저 사용
  }
}

// After
function handleSendPrompt() {
  const sessionId = generateSessionId();
  const result = someInternalLogic(sessionId); // 파라미터로 전달
}

function someInternalLogic(sessionId: string) {
  console.log(sessionId); // 파라미터 사용
}
```

#### External Modules
```typescript
// import 위치 유지 (파일 최상단)
import { apiClient } from './api-client';

// 서브 함수에서 그대로 사용
async function executeCommand(...) {
  return await apiClient.execute(...); // OK
}
```

### 4. Preserve Async/Await Patterns

#### TypeScript
```typescript
// async 함수는 async 유지
async function executeCommand(...): Promise<CommandResult> {
  const result = await apiClient.execute(...);
  return result;
}

// 동기 함수는 동기 유지
function validateInput(...): ValidatedPrompt {
  // no await
  return validated;
}
```

#### Rust
```rust
// async 함수는 async 유지
async fn execute_command(...) -> Result<CommandResult, Error> {
    let result = api_client.execute(...).await?;
    Ok(result)
}

// 동기 함수는 동기 유지
fn validate_input(...) -> Result<ValidatedInput, Error> {
    // no .await
    Ok(validated)
}
```

### 5. Fix Security Issues During Refactoring

리팩토링 중 발견된 보안 이슈를 함께 수정합니다.

#### Path Traversal
```typescript
// Before (취약)
function loadFile(userPath: string) {
  const content = fs.readFileSync(userPath); // 위험!
}

// After (안전)
function loadFile(userPath: string) {
  const safePath = path.resolve(SAFE_DIR, path.normalize(userPath));

  if (!safePath.startsWith(SAFE_DIR)) {
    throw new Error('Path traversal detected');
  }

  const content = fs.readFileSync(safePath);
}
```

#### SQL Injection
```typescript
// Before (취약)
function queryUser(username: string) {
  const sql = `SELECT * FROM users WHERE name = '${username}'`; // 위험!
}

// After (안전)
function queryUser(username: string) {
  const sql = 'SELECT * FROM users WHERE name = ?';
  return db.query(sql, [username]); // Parameterized query
}
```

#### Hardcoded Secrets
```typescript
// Before (취약)
const JWT_SECRET = 'hardcoded-secret-123'; // 위험!

// After (안전)
const JWT_SECRET = process.env.JWT_SECRET || throwEnvError('JWT_SECRET');
```

### 6. Add JSDoc/Comments

추출된 함수에 문서 추가:

```typescript
/**
 * Validates and sanitizes user prompt input
 *
 * @param rawPrompt - Raw user input string
 * @param config - Validation configuration
 * @returns Validated and sanitized prompt with metadata
 * @throws Error if prompt is empty or exceeds max length
 */
function validateInput(
  rawPrompt: string,
  config: ValidationConfig
): ValidatedPrompt {
  // ...
}
```

```rust
/// Creates a configured process command for agent spawning
///
/// # Arguments
/// * `config` - Process configuration reference
///
/// # Returns
/// Configured `Command` ready to spawn
fn create_process(config: &ProcessConfig) -> Command {
    // ...
}
```

### 7. Format Code

언어별 포매터 실행:

```bash
# TypeScript/JavaScript
npx prettier --write {file}

# Rust
cargo fmt --manifest-path src-tauri/Cargo.toml
```

---

## OUTPUT

```typescript
{
  extractedFunctions: {
    name: string,
    startLine: number,
    endLine: number,
    code: string,
  }[],
  refactoredOriginal: {
    name: string,
    startLine: number,
    endLine: number,
    code: string,
  },
  securityFixes: {
    type: 'path_traversal' | 'sql_injection' | 'hardcoded_secret',
    description: string,
    location: string,
  }[],
  rollbackStashId: string,
}
```

---

## DISPLAY

```
✅ Step 2 완료

📦 추출 완료:
  - 추출된 함수: {count}개
  - 원본 함수 크기: {originalLines}줄 → {newLines}줄 (감소율: {reduction}%)
  - 보안 이슈 수정: {securityFixCount}개

🔍 추출된 함수 목록:
  1. validateInput ({lines}줄)
  2. setupEventListeners ({lines}줄)
  3. executeCommand ({lines}줄)
  ...

🛡️ 보안 수정:
  - Path traversal prevention in loadFile()
  - SQL injection fix in queryUser()

💾 Rollback available: {stashId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 3: 검증 시작...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## SAFETY CHECKS

### 1. Syntax Errors
```bash
# TypeScript
npx tsc --noEmit {file}

# Rust
cargo check --manifest-path src-tauri/Cargo.toml
```

**실패 시**:
```
❌ Syntax error detected:
   {error message}

   Rolling back...
```

### 2. Duplicate Function Names
```
❌ Function name conflict: validateInput already exists
   Choose a different name or modify existing function.
```

### 3. Missing Dependencies
```
❌ Undefined variable: apiClient
   Ensure all dependencies are properly imported or passed as parameters.
```

---

## ERROR HANDLING

### Rollback on Failure

```bash
# Step 2 실패 시 자동 rollback
git stash pop  # stash@{0} 복원
```

```
⚠️ Step 2 실패 - 변경사항 롤백됨

   실패 이유: {reason}

   다음 중 선택:
   1. 계획 수정 후 재시도 (Step 1로)
   2. 수동 리팩토링
   3. 취소
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/refactor-function/steps/step-03-verify.md`
