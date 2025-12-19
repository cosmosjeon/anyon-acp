# 워크플로우 내재화 계획

## 목표

슬래시 커맨드(`/anyon:...`) 기반 워크플로우를 앱 내부 코드로 이동하여:
1. 사용자 프로젝트 폴더를 깨끗하게 유지 (`.anyon`, `.claude` 폴더 제거)
2. 워크플로우 로직을 일반 사용자로부터 보호 (DevTools 차단)
3. 앱 버전과 워크플로우 버전 동기화

---

## 핵심 아이디어

**기존 방식:**
```
슬래시 커맨드 → Claude가 .anyon 폴더에서 파일들 읽음 → 실행
```

**새로운 방식:**
```
프롬프트에 모든 내용 포함 → Claude에 직접 전달 → 실행
```

워크플로우를 구성하는 4개 파일을 **하나의 프롬프트로 합쳐서** 직접 전달:
- `workflow.xml` (실행 엔진)
- `workflow.yaml` (설정)
- `instructions.md` (실행 단계)
- `template.md` (출력 형식)

---

## 현재 구조

```
사용자 프로젝트/
├── .anyon/
│   ├── core/
│   │   └── tasks/
│   │       └── workflow.xml        ← 실행 엔진
│   └── anyon-method/
│       ├── config.yaml             ← 글로벌 설정
│       └── workflows/
│           └── startup-prd/
│               ├── workflow.yaml   ← 워크플로우 설정
│               ├── instructions.md ← 실행 단계
│               └── template.md     ← 출력 템플릿
├── .claude/
│   └── commands/
│       └── anyon/.../startup-prd.md ← 슬래시 커맨드 진입점
└── CLAUDE.md
```

**현재 실행 흐름:**
```
/anyon:anyon-method:workflows:startup-prd
    ↓
.claude/commands/.../startup-prd.md 로드
    ↓
"workflow.xml 읽고, workflow.yaml 경로로 실행해라"
    ↓
Claude가 Read tool로 4개 파일 읽음
    ↓
workflow.xml 엔진 로직대로 실행
```

---

## 변경 후 구조

```
anyon-claude/
├── src/
│   └── constants/
│       └── workflows/
│           ├── index.ts
│           ├── types.ts
│           ├── engine.ts               ← workflow.xml 내용
│           ├── planning/
│           │   ├── index.ts
│           │   ├── startup-prd.ts      ← yaml + instructions + template 합본
│           │   ├── startup-ux.ts
│           │   ├── startup-ui.ts
│           │   ├── startup-trd.ts
│           │   ├── startup-architecture.ts
│           │   └── startup-erd.ts
│           └── development/
│               ├── index.ts
│               ├── pm-opensource.ts
│               ├── pm-orchestrator.ts
│               ├── pm-executor.ts
│               └── pm-reviewer.ts
└── src-tauri/
    └── tauri.conf.json                 ← DevTools 비활성화

사용자 프로젝트/
└── anyon-docs/planning/                ← 출력만 여기에 저장 (기존과 동일)
```

**새로운 실행 흐름:**
```
앱에서 "PRD 작성" 버튼 클릭
    ↓
STARTUP_PRD_PROMPT 상수 로드 (엔진 + 설정 + 지침 + 템플릿 합본)
    ↓
claude -p "${STARTUP_PRD_PROMPT}" --dangerously-skip-permissions
    ↓
Claude가 프롬프트 내용 그대로 실행 (파일 읽기 없음)
    ↓
workflow.xml 엔진 로직대로 실행 (프롬프트에 포함되어 있음)
```

---

## 사용 중인 워크플로우 (10개)

| 카테고리 | ID | 슬래시 커맨드 |
|---------|-----|--------------|
| MVP Planning | prd | `/anyon:anyon-method:workflows:startup-prd` |
| MVP Planning | ux-design | `/anyon:anyon-method:workflows:startup-ux` |
| MVP Planning | design-guide | `/anyon:anyon-method:workflows:startup-ui` |
| MVP Planning | trd | `/anyon:anyon-method:workflows:startup-trd` |
| MVP Planning | architecture | `/anyon:anyon-method:workflows:startup-architecture` |
| MVP Planning | erd | `/anyon:anyon-method:workflows:startup-erd` |
| Development | pm-opensource | `/anyon:anyon-method:workflows:pm-opensource` |
| Development | pm-orchestrator | `/anyon:anyon-method:workflows:pm-orchestrator` |
| Development | pm-executor | `/anyon:anyon-method:workflows:pm-executor` |
| Development | pm-reviewer | `/anyon:anyon-method:workflows:pm-reviewer` |

---

## 구현 단계

### Phase 1: 워크플로우 엔진 및 프롬프트 추출

**1.1 workflow.xml 엔진 추출**
```typescript
// src/constants/workflows/engine.ts
export const WORKFLOW_ENGINE = `
<WORKFLOW-RULES>
  <rule n="1">Steps execute in exact numerical order</rule>
  <rule n="2">Optional steps: Always ask user</rule>
  <rule n="3">Template-output: Save → Show → Get approval</rule>
  <rule n="4">User must approve each major section</rule>
</WORKFLOW-RULES>

<EXECUTION-FLOW>
  1. Load & Initialize - 변수 해석
  2. Process Each Step - 각 step 순차 실행
  3. Handle Tags - <action>, <check>, <ask>, <template-output> 처리
  4. Completion - 체크리스트 검증, 문서 저장
</EXECUTION-FLOW>

... (workflow.xml 전체 내용)
`;
```

**1.2 각 워크플로우 합본 생성**
```typescript
// src/constants/workflows/planning/startup-prd.ts

import { WORKFLOW_ENGINE } from '../engine';

const WORKFLOW_CONFIG = `
name: startup-prd
output_folder: "{project-root}/anyon-docs/planning"
default_output_file: "{output_folder}/prd.md"
`;

const INSTRUCTIONS = `
<step n="0" goal="Welcome">
  <ask>만들고 싶은 서비스 이름이 무엇인가요?</ask>
  <action>Store as {{project_name}}</action>
</step>

<step n="1" goal="License Type">
  ...
</step>

... (instructions.md 전체 내용)
`;

const TEMPLATE = `
---
document_type: PRD
project_name: {{project_name}}
...
---

# {{project_name}} - PRD

## 프로젝트 개요
...

... (template.md 전체 내용)
`;

export const STARTUP_PRD_PROMPT = `
# Workflow Execution

## 1. Workflow Engine (MUST FOLLOW)
${WORKFLOW_ENGINE}

## 2. Workflow Configuration
${WORKFLOW_CONFIG}

## 3. Instructions (Execute step by step)
${INSTRUCTIONS}

## 4. Output Template
${TEMPLATE}

---
지금 바로 Step 0부터 시작하세요. 출력은 {project-root}/anyon-docs/planning/prd.md에 저장합니다.
`;

export const STARTUP_PRD_METADATA = {
  id: 'startup-prd',
  title: 'PRD',
  description: '제품 요구사항 정의서 작성',
  outputPath: 'anyon-docs/planning/prd.md',
};
```

**1.3 변환 작업 (10개 워크플로우)**
- [ ] `workflow.xml` → `engine.ts`로 추출 (1회, 공용)
- [ ] `startup-prd` 합본 생성
- [ ] `startup-ux` 합본 생성
- [ ] `startup-ui` 합본 생성
- [ ] `startup-trd` 합본 생성
- [ ] `startup-architecture` 합본 생성
- [ ] `startup-erd` 합본 생성
- [ ] `pm-opensource` 합본 생성
- [ ] `pm-orchestrator` 합본 생성
- [ ] `pm-executor` 합본 생성
- [ ] `pm-reviewer` 합본 생성

---

### Phase 2: 기존 코드 수정

**2.1 planning.ts 수정**
```typescript
// Before
export const WORKFLOW_SEQUENCE: WorkflowStep[] = [
  {
    id: 'prd',
    workflow: '/anyon:anyon-method:workflows:startup-prd',
    ...
  },
];

// After
import { STARTUP_PRD_PROMPT, STARTUP_PRD_METADATA } from './workflows/planning';

export const WORKFLOW_SEQUENCE: WorkflowStep[] = [
  {
    id: 'prd',
    prompt: STARTUP_PRD_PROMPT,  // 슬래시 커맨드 대신 프롬프트 직접 사용
    ...
  },
];
```

**2.2 development.ts 수정**
```typescript
// Before
prompt: '/anyon:anyon-method:workflows:pm-orchestrator',

// After
import { PM_ORCHESTRATOR_PROMPT } from './workflows/development';

prompt: PM_ORCHESTRATOR_PROMPT,
```

**2.3 WorkflowStep 타입 수정**
```typescript
// src/constants/workflows/types.ts
export interface WorkflowStep {
  id: string;
  title: string;
  filename: string;
  prompt: string;        // workflow → prompt로 변경
  displayText: string;
  icon: WorkflowIconType;
  nextId: string | null;
}
```

**2.4 promptDisplay.ts 수정**
```typescript
// 슬래시 커맨드 체크 대신 워크플로우 ID 기반으로 변경
import { WORKFLOW_IDS } from './workflows';

export function isAnyonWorkflowPrompt(prompt: string): boolean {
  // 프롬프트 시작 부분에 워크플로우 식별자 포함
  return prompt.startsWith('# Workflow Execution');
}
```

---

### Phase 3: Tauri 설정 변경

**3.1 프로덕션 빌드에서 DevTools 비활성화**

```json
// src-tauri/tauri.conf.json
{
  "app": {
    "security": {
      "devtools": false
    }
  }
}
```

**3.2 Rust 코드에서 조건부 DevTools**
```rust
// src-tauri/src/main.rs
#[cfg(debug_assertions)]
window.open_devtools();

#[cfg(not(debug_assertions))]
// DevTools 비활성화 상태 유지
```

---

### Phase 4: 프로젝트 초기화 로직 변경

**4.1 `.anyon`, `.claude` 폴더 생성 제거**
- [ ] 프로젝트 초기화 시 해당 폴더 생성 코드 제거
- [ ] `setupAnyonEnvironment()` 함수 수정/제거

**4.2 CLAUDE.md 간소화**
```markdown
# Project Configuration

이 프로젝트는 Anyon 앱에서 관리됩니다.
출력 문서는 anyon-docs/planning/ 폴더에 저장됩니다.
```

**4.3 출력 폴더만 생성**
```typescript
// 프로젝트 초기화 시
await fs.mkdir('anyon-docs/planning', { recursive: true });
// .anyon, .claude 폴더는 생성하지 않음
```

---

### Phase 5: 테스트 및 검증

**5.1 동작 동등성 테스트**
- [ ] 각 워크플로우가 기존과 동일하게 동작하는지 확인
- [ ] Step별 질문/응답 흐름 동일 여부
- [ ] 출력 파일 형식 동일 여부
- [ ] 변수 치환 정상 동작 여부

**5.2 기능 테스트**
- [ ] 10개 워크플로우 전체 실행 테스트
- [ ] 출력 파일이 `anyon-docs/planning/`에 정상 생성 확인

**5.3 보안 테스트**
- [ ] 프로덕션 빌드에서 DevTools 접근 불가 확인
- [ ] 사용자 프로젝트 폴더에 `.anyon`, `.claude` 없음 확인

**5.4 성능 테스트**
- [ ] 긴 프롬프트 전달 시 문제 없는지 확인
- [ ] 토큰 사용량 비교 (변경 전/후 동일해야 함)

---

## 워크플로우 합본 변환 가이드

### 기존 파일 구조
```
workflows/startup-prd/
├── workflow.yaml      # 설정, 경로
├── instructions.md    # 실행 단계 (핵심)
├── template.md        # 출력 템플릿
└── checklist.md       # 검증 기준 (선택)
```

### 합본 순서
```typescript
export const WORKFLOW_PROMPT = `
# Workflow Execution

## 1. Workflow Engine
${WORKFLOW_ENGINE}           // workflow.xml 공용 엔진

## 2. Configuration
${WORKFLOW_YAML_CONTENT}     // workflow.yaml 내용

## 3. Instructions
${INSTRUCTIONS_MD_CONTENT}   // instructions.md 내용

## 4. Output Template
${TEMPLATE_MD_CONTENT}       // template.md 내용

## 5. Checklist (Optional)
${CHECKLIST_MD_CONTENT}      // checklist.md 내용

---
지금 바로 실행을 시작하세요.
`;
```

### 경로 변수 처리
```yaml
# Before (파일 경로 참조)
config_source: "{project-root}/.anyon/anyon-method/config.yaml"
installed_path: "{project-root}/.anyon/anyon-method/workflows/startup-prd"

# After (출력 경로만 유지)
output_folder: "{project-root}/anyon-docs/planning"
default_output_file: "{output_folder}/prd.md"
```

---

## 마이그레이션 전략

### 기존 사용자 대응

**권장: 옵션 C (공존 후 정리)**
1. 새 버전에서는 내재화된 프롬프트 사용
2. 기존 `.anyon`, `.claude` 폴더는 무시 (삭제 안 함)
3. 사용자에게 "이 폴더들은 더 이상 사용되지 않습니다" 알림
4. 다음 메이저 버전에서 자동 정리 옵션 제공

---

## 예상 작업량

| 단계 | 작업 | 예상 파일 수 |
|-----|------|------------|
| Phase 1 | 워크플로우 합본 변환 | 11개 (엔진 1 + 워크플로우 10) |
| Phase 2 | 기존 코드 수정 | 4-5개 |
| Phase 3 | Tauri 설정 | 2개 |
| Phase 4 | 초기화 로직 | 2-3개 |
| Phase 5 | 테스트 | - |

---

## 체크리스트

### 준비
- [ ] 모든 워크플로우 파일 백업
- [ ] 현재 동작 녹화/기록 (비교용)

### Phase 1
- [ ] `src/constants/workflows/` 디렉토리 생성
- [ ] `types.ts` 작성
- [ ] `engine.ts` 작성 (workflow.xml 추출)
- [ ] Planning 워크플로우 6개 합본 생성
- [ ] Development 워크플로우 4개 합본 생성
- [ ] 인덱스 파일 작성

### Phase 2
- [ ] `WorkflowStep` 타입 수정 (workflow → prompt)
- [ ] `planning.ts` 수정
- [ ] `development.ts` 수정
- [ ] `promptDisplay.ts` 수정
- [ ] 관련 컴포넌트 수정

### Phase 3
- [ ] `tauri.conf.json` DevTools 설정
- [ ] Rust 코드 조건부 DevTools

### Phase 4
- [ ] 프로젝트 초기화 코드 수정
- [ ] CLAUDE.md 템플릿 간소화

### Phase 5
- [ ] 10개 워크플로우 동등성 테스트
- [ ] 프로덕션 빌드 테스트
- [ ] 보안 검증

---

## 롤백 계획

문제 발생 시:
1. 이전 버전으로 다운그레이드
2. `.anyon`, `.claude` 폴더 복원 (백업에서)
3. 슬래시 커맨드 방식으로 즉시 복귀 가능

---

## 핵심 차이점 요약

| 항목 | Before | After |
|-----|--------|-------|
| 프롬프트 전달 | 슬래시 커맨드 | 전체 내용 직접 전달 |
| 파일 읽기 | Claude가 `.anyon/`에서 읽음 | 읽기 없음 (프롬프트에 포함) |
| 워크플로우 로직 | 사용자 폴더에 노출 | 앱 코드에 내장 |
| 실행 엔진 | workflow.xml 파일 | 프롬프트 내 포함 |
| 동작 | 동일 | 동일 |
| 토큰 사용량 | 동일 | 동일 |
