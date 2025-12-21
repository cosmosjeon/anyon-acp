# Split Module Workflow

> 대형 모듈/파일을 여러 개의 작은 모듈로 분할하는 워크플로우

---

## Overview

| 항목 | 내용 |
|------|------|
| **입력** | `sdd-docs/audits/audit-result.json` (action: "split_file") |
| **출력** | 분할된 모듈 파일들 + `sdd-docs/audits/split-report.md` |
| **실행 방식** | Semi-automatic (사용자 확인 후 진행) |
| **예상 시간** | 10-20분 (파일 크기에 따라 변동) |

---

## WORKFLOW ARCHITECTURE

- **Execution Mode**: Semi-automatic (requires user confirmation)
- **Language Support**: TypeScript, Rust, JavaScript
- **Safety First**: Git stash backup before changes
- **Verification**: Build + Test validation after split

---

## Prerequisites

1. `/code-audit` 실행 완료
2. `sdd-docs/audits/audit-result.json` 파일 존재
3. `audit-result.json`에 `action: "split_file"` 이슈 포함

---

## Typical Split Targets

코드 감사에서 자주 발견되는 분할 대상:

| 파일 | 크기 | 분할 계획 |
|------|------|----------|
| `src/api.ts` | 2,496줄 | → `api/projects.ts`, `api/sessions.ts`, `api/storage.ts` |
| `src-tauri/src/claude.rs` | 2,892줄 | → `claude/projects.rs`, `claude/sessions.rs` |
| `server/index.js` | 382줄 | → `routes/`, `services/`, `middleware/` |

---

## Workflow Steps

### Step 1: Analyze
- 대상 파일 읽기 및 언어 감지
- Export된 함수/구조체/클래스 식별
- 기능별 그룹핑 (예: projects 관련, sessions 관련)
- 분할 계획 생성 및 **사용자 확인**

### Step 2: Split
- Git stash로 백업
- 새 디렉토리 생성
- 언어별 분할 실행
- Import/use 문 업데이트
- 참조하는 다른 파일들 업데이트

### Step 3: Verify
- 언어별 빌드 검증 (tsc/cargo/node)
- 테스트 실행
- 성공 시 stash drop, 실패 시 stash pop
- 결과 보고서 생성

---

## Step Files

```
steps/
├── step-01-analyze.md  # 파일 분석 + 분할 계획 생성
├── step-02-split.md    # 실제 파일 분할 수행
└── step-03-verify.md   # 빌드/테스트 검증
```

---

## Language Support

### TypeScript (.ts, .tsx)
- ES6 모듈 시스템
- `index.ts`에서 re-export
- `tsc` 또는 `bun build`로 검증

### Rust (.rs)
- `mod.rs` 생성
- 서브모듈 분리
- `cargo build`로 검증

### JavaScript (.js)
- ES modules 또는 CommonJS
- `index.js`에서 re-export
- `node --check`로 검증

---

## Safety Measures

### 1. Backup
```bash
git stash push -m "split-module-backup-$(date +%Y%m%d-%H%M%S)"
```

### 2. Verification
- **TypeScript**: `bun test && npm run build`
- **Rust**: `cargo build --release && cargo test`
- **JavaScript**: `node --check && npm test`

### 3. Rollback on Failure
```bash
git stash pop  # 실패 시 자동 복구
```

---

## Output Files

| File | Purpose |
|------|---------|
| `{module}/index.{ext}` | Re-export hub |
| `{module}/{feature}.{ext}` | Feature-specific module |
| `sdd-docs/audits/split-report.md` | Split operation report |
| `sdd-docs/audits/audit-result.json` | Updated (split_file issues removed) |

---

## Start Workflow

→ LOAD: `_bmad/bmm/workflows/5-maintenance/split-module/steps/step-01-analyze.md`
