---
description: 'BMAD 스타일 긴 함수 리팩토링 워크플로우 (다중 언어 지원)'
---

# Refactor Function Workflow

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/5-maintenance/refactor-function/workflow.md, READ its entire contents and follow its directions exactly!

## Quick Reference

**전제 조건**: `/sdd:code-audit` 실행 완료
**입력**: `sdd-docs/audits/audit-result.json` (action: "refactor_function")
**실행 방식**: Semi-automatic (사용자 확인 후 진행)
**지원 언어**: TypeScript/JavaScript, Rust
**예상 시간**: 20-60분 (함수 복잡도에 따라)

## 대상 이슈 예시

| 함수 | 파일 | 현재 줄 수 | 추출 결과 |
|------|------|-----------|----------|
| handleSendPrompt | ClaudeCodeSession.tsx | 505 | 8-10개 서브 함수 |
| main() | main.rs | 402 | 6-8개 setup 함수 |
| spawn_agent_system() | agents.rs | 322 | 5-6개 헬퍼 함수 |
| list_directory_contents() | claude.rs | - | 보안 수정 포함 |

## 워크플로우 단계

1. **Analyze** - 함수 책임 식별 및 추출 계획
2. **Extract** - 서브 함수 추출 실행
3. **Verify** - 빌드/테스트 검증

## 리팩토링 전략

### TypeScript (handleSendPrompt)
```typescript
// Before: 505줄 단일 함수
async function handleSendPrompt() {
  // 입력 검증
  // 큐 관리
  // 세션 재개
  // 이벤트 리스너 설정
  // 명령 실행
  // 스트림 처리
  // 분석 추적
  // 에러 처리
}

// After: 책임별 분리
async function handleSendPrompt() {
  if (!validateInput()) return;
  await manageQueue();
  const session = await resumeOrCreateSession();
  setupEventListeners(session);
  await executeCommand(session);
}

function validateInput(): boolean { ... }
async function manageQueue(): Promise<void> { ... }
async function resumeOrCreateSession(): Promise<Session> { ... }
function setupEventListeners(session: Session): void { ... }
async function executeCommand(session: Session): Promise<void> { ... }
```

### Rust (main)
```rust
// Before: 402줄 main 함수
fn main() {
  // 로깅 설정
  // IME 설정
  // 플러그인 초기화
  // 프록시 설정
  // 데이터베이스 설정
  // 체크포인트 설정
  // 딥링크 설정
  // 윈도우 설정
}

// After: 책임별 분리
fn main() {
  init_logging();
  setup_linux_ime();

  tauri::Builder::default()
    .plugin(init_tauri_plugins())
    .setup(setup_application)
    .invoke_handler(create_command_handlers())
    .run(tauri::generate_context!())
    .expect("error running app");
}

fn setup_application(app: &mut App) -> Result<()> {
  setup_proxy_settings(app)?;
  setup_database(app)?;
  setup_checkpoint_system(app)?;
  setup_deep_links(app)?;
  setup_window_effects(app)?;
  Ok(())
}
```

## 보안 수정 포함

- `list_directory_contents()`: Path traversal 취약점 수정
- 경로 검증 로직 추가
- canonicalize() 사용

## 안전장치

- 작업 전 `git stash`로 롤백 포인트 생성
- 언어별 빌드 검증
- 리팩토링 전후 동작 동일성 확인
- 실패 시 `git stash pop`으로 자동 롤백

## 워크플로우 시작

→ LOAD: @_bmad/bmm/workflows/5-maintenance/refactor-function/workflow.md
