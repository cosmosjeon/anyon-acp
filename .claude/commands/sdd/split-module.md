---
description: 'BMAD 스타일 모듈/파일 분할 워크플로우 (다중 언어 지원)'
---

# Split Module Workflow

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/5-maintenance/split-module/workflow.md, READ its entire contents and follow its directions exactly!

## Quick Reference

**전제 조건**: `/sdd:code-audit` 실행 완료
**입력**: `sdd-docs/audits/audit-result.json` (action: "split_file")
**실행 방식**: Semi-automatic (사용자 확인 후 진행)
**지원 언어**: TypeScript, Rust, JavaScript
**예상 시간**: 15-45분 (모듈 크기에 따라)

## 대상 이슈 예시

| 파일 | 언어 | 현재 줄 수 | 분할 결과 |
|------|------|-----------|----------|
| api.ts | TypeScript | 2,496 | api/ 폴더 (6-8개 파일) |
| claude.rs | Rust | 2,892 | claude/ 모듈 (6개 파일) |
| index.js | JavaScript | 382 | routes/, services/, middleware/ |

## 워크플로우 단계

1. **Analyze** - 모듈 구조 분석 및 기능별 그룹핑
2. **Split** - 파일 분할 및 import/export 정리
3. **Verify** - 빌드 검증 및 테스트

## 분할 전략

### TypeScript (api.ts)
```
Before:
src/lib/api.ts (2,496 lines)

After:
src/lib/api/
├── index.ts        (re-exports)
├── projects.ts     (프로젝트 관련)
├── sessions.ts     (세션 관련)
├── storage.ts      (스토리지 관련)
├── agents.ts       (에이전트 관련)
├── settings.ts     (설정 관련)
└── types.ts        (공통 타입)
```

### Rust (claude.rs)
```
Before:
src-tauri/src/commands/claude.rs (2,892 lines)

After:
src-tauri/src/commands/claude/
├── mod.rs          (pub use exports)
├── projects.rs     (list_projects, create_project 등)
├── sessions.rs     (세션 관리)
├── execution.rs    (spawn_claude_process 등)
├── filesystem.rs   (파일 작업)
├── checkpoints.rs  (체크포인트)
└── settings.rs     (설정)
```

### JavaScript (index.js)
```
Before:
server/index.js (382 lines)

After:
server/
├── index.js        (app setup only)
├── routes/
│   ├── auth.js
│   ├── settings.js
│   └── dev.js
├── services/
│   ├── jwt.js
│   └── oauth.js
└── middleware/
    ├── auth.js
    └── rateLimit.js
```

## 안전장치

- 작업 전 `git stash`로 롤백 포인트 생성
- 언어별 빌드 검증 (tsc, cargo build, node --check)
- 실패 시 `git stash pop`으로 자동 롤백

## 워크플로우 시작

→ LOAD: @_bmad/bmm/workflows/5-maintenance/split-module/workflow.md
