# P0 병렬 리팩토링 - 세션 핸드오프 문서

> 다음 세션에서 이 문서를 첨부하면 바로 구현 이어서 진행 가능

---

## 현재 상태

**완료된 작업:**
- [x] Code Audit 완료 (29 Critical, 159 Warning, 241 Info)
- [x] P0 이슈 3개 선정
- [x] 3개 Explore 에이전트로 코드베이스 분석 완료
- [x] 3개 Plan 에이전트로 상세 구현 계획 수립 완료
- [x] 최종 계획 승인됨

**다음 세션에서 할 일:**
- [ ] Task 1: agents.rs 모듈 분할 구현
- [ ] Task 2: Server SQLite 구현
- [ ] Task 3: 환경 설정 중복 제거 구현
- [ ] 각 Task 테스트
- [ ] 머지

---

## 3개 병렬 Task 요약

### Task 1: agents.rs 모듈 분할
**목표:** `src-tauri/src/commands/agents.rs` (2,036줄) → 5개 파일로 분할

**타겟 구조:**
```
src-tauri/src/commands/agents/
├── mod.rs           (~100줄) - Re-exports
├── types.rs         (~120줄) - Agent, AgentRun, AgentRunMetrics, AgentDb
├── database.rs      (~380줄) - init_database(), CRUD
├── execution.rs     (~550줄) - execute_agent(), 프로세스 스폰
├── session.rs       (~400줄) - 세션 관리, 스트리밍
└── import_export.rs (~520줄) - Import/export, GitHub
```

**구현 순서:**
1. `agents/` 디렉토리 생성
2. `types.rs` 생성
3. `database.rs` 생성
4. `execution.rs` 생성
5. `session.rs` 생성
6. `import_export.rs` 생성
7. `mod.rs` 생성
8. 기존 `agents.rs` 삭제
9. `cargo check`

---

### Task 2: Server SQLite 구현
**목표:** `server/index.js`의 In-memory Map → SQLite 영속 저장

**타겟 구조:**
```
server/
├── index.js                    (수정)
├── package.json                (better-sqlite3 추가)
├── db/
│   ├── index.js                (DB 초기화)
│   ├── schema.js               (스키마 정의)
│   └── repositories/
│       ├── userRepository.js   (User CRUD)
│       └── settingsRepository.js (Settings CRUD)
└── data/
    └── anyon.db                (SQLite 파일)
```

**스키마:**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  google_id TEXT UNIQUE,
  plan_type TEXT DEFAULT 'FREE',
  subscription_status TEXT DEFAULT 'ACTIVE',
  current_period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**구현 순서:**
1. `npm install better-sqlite3`
2. `server/data/` 디렉토리 생성
3. `server/db/schema.js` 생성
4. `server/db/index.js` 생성
5. `server/db/repositories/userRepository.js` 생성
6. `server/db/repositories/settingsRepository.js` 생성
7. `server/index.js` 수정
8. Graceful shutdown 추가

---

### Task 3: 환경 설정 중복 제거
**목표:** `src-tauri/src/claude_binary.rs`의 중복 코드 157줄 → 통합

**중복 함수:**
- `create_command_with_env()` (lines 622-694) - std::process::Command
- `create_tokio_command_with_env()` (lines 698-779) - tokio::process::Command

**추출할 헬퍼:**
```rust
const ENV_VARS_EXACT: &[&str] = &[
    "PATH", "HOME", "USER", "SHELL", "LANG", "LC_ALL",
    "NODE_PATH", "NVM_DIR", "NVM_BIN",
    "HOMEBREW_PREFIX", "HOMEBREW_CELLAR",
    "HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "ALL_PROXY",
];

fn should_inherit_env_var(key: &str) -> bool;
fn get_path_separator() -> &'static str;
fn get_inherited_env_vars() -> Vec<(String, String)>;
fn compute_modified_path(program: &str, current_path: &str) -> Option<String>;

struct CommandEnvConfig {
    env_vars: Vec<(String, String)>,
    modified_path: Option<String>,
}
fn prepare_command_env_config(program: &str) -> CommandEnvConfig;
```

**구현 순서:**
1. `ENV_VARS_EXACT` 상수 추가
2. 헬퍼 함수들 추가
3. `CommandEnvConfig` 구조체 추가
4. `prepare_command_env_config()` 함수 추가
5. 두 함수 리팩토링
6. `cargo check`

---

## 병렬 작업 전략

**머지 순서 (충돌 방지):**
1. Task 3 먼저 (가장 작은 변경)
2. Task 2 두 번째 (독립된 서버)
3. Task 1 마지막 (가장 큰 변경)

**충돌 가능성:**
- Task 1 & Task 3: `agents.rs`에서 `create_command_with_env` 호출
- 해결: Task 3 먼저 머지 후 Task 1 리베이스

---

## 핵심 파일 경로

### Task 1 (agents.rs 분할)
- `src-tauri/src/commands/agents.rs` - 분할 대상 (2,036줄)
- `src-tauri/src/commands/claude/mod.rs` - 패턴 참조
- `src-tauri/src/main.rs` - import 확인

### Task 2 (Server SQLite)
- `server/index.js` - 주요 수정 대상 (376줄)
- `server/models/userFactory.js` - 입력 형식 참조
- `server/package.json` - 의존성 추가

### Task 3 (중복 제거)
- `src-tauri/src/claude_binary.rs` - 리팩토링 대상
- `src-tauri/src/commands/mcp.rs` - 호출자 (sync)
- `src-tauri/src/commands/agents.rs` - 호출자 (async)

---

## 테스트 계획

### Task 1 테스트
```bash
cd src-tauri && cargo check
npm run tauri dev
# Agent CRUD, 실행, Import/Export, GitHub 테스트
```

### Task 2 테스트
```bash
cd server && npm start
curl -X POST http://localhost:4000/auth/dev/login
# Settings CRUD, 재시작 후 데이터 유지 확인
```

### Task 3 테스트
```bash
cd src-tauri && cargo check
npm run tauri dev
# MCP 서버, Agent 실행, NVM/Homebrew 경로 테스트
```

---

## 다음 세션 시작 프롬프트

```
이전 세션에서 P0 리팩토링 계획을 수립했습니다.
@sdd-docs/HANDOFF-P0-REFACTORING.md 를 참고해서 3개 Task를 병렬로 구현해주세요:

1. agents.rs 모듈 분할
2. Server SQLite 구현
3. 환경 설정 중복 제거

머지 순서: Task 3 → Task 2 → Task 1
```

---

## 상세 계획 파일

전체 상세 계획은 여기에 저장됨:
- `/Users/cosmos/.claude/plans/tidy-stirring-parasol.md`

Audit 결과:
- `sdd-docs/audits/code-audit-report.md`
- `sdd-docs/audits/audit-result.json`

---

**문서 생성일:** 2025-12-21
**상태:** 계획 승인됨, 구현 대기 중
