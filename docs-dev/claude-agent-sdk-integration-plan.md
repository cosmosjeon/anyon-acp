# Claude Agent SDK Integration Plan

## 1. 현재 시스템 분석

### 1.1 현재 아키텍처

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (React)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MvpWorkspace.tsx                                                            │
│       │                                                                      │
│       ├── handleStartNewWorkflow(workflowPrompt)                             │
│       │         │                                                            │
│       │         └── claudeSessionRef.startNewSession(workflowPrompt)         │
│       │                                                                      │
│       └── PlanningDocsPanel                                                  │
│                 │                                                            │
│                 └── onStartNewWorkflow(step.workflow)                        │
│                           │                                                  │
│                           └── "/anyon:anyon-method:workflows:startup-prd"    │
│                                                                              │
│  ClaudeCodeSession.tsx                                                       │
│       │                                                                      │
│       └── handleSendPrompt(prompt, model)                                    │
│                 │                                                            │
│                 └── api.executeClaudeCode() / api.continueClaudeCode()       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Backend (Tauri/Rust)                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  src-tauri/src/commands/claude.rs                                            │
│       │                                                                      │
│       ├── execute_claude_code()                                              │
│       │         │                                                            │
│       │         └── args: ["-p", prompt, "--model", model,                   │
│       │                    "--output-format", "stream-json",                 │
│       │                    "--verbose", "--dangerously-skip-permissions"]    │
│       │                                                                      │
│       ├── continue_claude_code()                                             │
│       │         │                                                            │
│       │         └── args: ["-c", "-p", prompt, ...]                          │
│       │                                                                      │
│       └── resume_claude_code()                                               │
│                 │                                                            │
│                 └── args: ["--resume", session_id, "-p", prompt, ...]        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Claude CLI                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  claude -p "/anyon:anyon-method:workflows:startup-prd" --model sonnet ...    │
│       │                                                                      │
│       └── 슬래시 커맨드 인식                                                  │
│                 │                                                            │
│                 └── .claude/commands/anyon/anyon-method/workflows/           │
│                           startup-prd.md 로드                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         슬래시 커맨드 실행                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  .claude/commands/anyon/anyon-method/workflows/startup-prd.md                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ---                                                                    │  │
│  │ description: 'Create PRD through conversational Q&A...'                │  │
│  │ ---                                                                    │  │
│  │                                                                        │  │
│  │ IT IS CRITICAL THAT YOU FOLLOW THESE STEPS:                            │  │
│  │                                                                        │  │
│  │ <steps CRITICAL="TRUE">                                                │  │
│  │ 1. Always LOAD the FULL @.anyon/core/tasks/workflow.xml                │  │
│  │ 2. READ its entire contents                                            │  │
│  │ 3. Pass the yaml path ... as 'workflow-config' parameter               │  │
│  │ 4. Follow workflow.xml instructions EXACTLY                            │  │
│  │ 5. Save outputs after EACH section                                     │  │
│  │ 6. Output folder: anyon-docs/planning/                                 │  │
│  │ </steps>                                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         워크플로우 엔진 실행                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. workflow.xml 로드 (워크플로우 실행 엔진)                                 │
│       │                                                                      │
│       └── .anyon/core/tasks/workflow.xml                                     │
│                                                                              │
│  2. workflow.yaml 로드 (워크플로우 설정)                                     │
│       │                                                                      │
│       └── .anyon/anyon-method/workflows/startup-prd/workflow.yaml            │
│           - config_source, template, instructions, validation                │
│           - input_files, output_folder, required_skills                      │
│                                                                              │
│  3. instructions.md 실행 (실제 워크플로우 단계)                              │
│       │                                                                      │
│       └── .anyon/anyon-method/workflows/startup-prd/instructions.md          │
│           - Step 0: Welcome                                                  │
│           - Step 1: License Type (객관식)                                    │
│           - Step 2: Problem & Target (주관식)                                │
│           - Step 3: Service Type & Platform (조건부 분기)                    │
│           - Step 4: Core Features (다중 선택)                                │
│           - Step 5: Find Open Source (WebSearch)                             │
│           - Step 6: Reference Service                                        │
│           - Step 7: Additional Requirements                                  │
│           - Step 8: Generate PRD (template.md로 출력)                        │
│                                                                              │
│  4. template.md 채우기                                                       │
│       │                                                                      │
│       └── .anyon/anyon-method/workflows/startup-prd/template.md              │
│                                                                              │
│  5. 출력 저장                                                                │
│       │                                                                      │
│       └── anyon-docs/planning/prd.md                                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 프론트엔드에서 사용하는 워크플로우 목록

#### Planning 워크플로우 (6개) - `src/constants/planning.ts`

| ID | 슬래시 커맨드 | 설명 | 출력 파일 |
|---|---|---|---|
| `prd` | `/anyon:anyon-method:workflows:startup-prd` | PRD 작성 | `anyon-docs/planning/prd.md` |
| `ux-design` | `/anyon:anyon-method:workflows:startup-ux` | UX 와이어프레임 | `anyon-docs/planning/ui-ux.html` |
| `design-guide` | `/anyon:anyon-method:workflows:startup-ui` | UI 디자인 가이드 | `anyon-docs/planning/design-guide.md` |
| `trd` | `/anyon:anyon-method:workflows:startup-trd` | 기술 요구사항 | `anyon-docs/planning/trd.md` |
| `architecture` | `/anyon:anyon-method:workflows:startup-architecture` | 시스템 아키텍처 | `anyon-docs/planning/architecture.md` |
| `erd` | `/anyon:anyon-method:workflows:startup-erd` | ERD/DB 스키마 | `anyon-docs/planning/erd.md` |

#### Development 워크플로우 (4개) - `src/constants/development.ts`

| ID | 슬래시 커맨드 | 설명 |
|---|---|---|
| `pm-opensource` | `/anyon:anyon-method:workflows:pm-opensource` | 오픈소스 레포 clone **(신규 추가)** |
| `pm-orchestrator` | `/anyon:anyon-method:workflows:pm-orchestrator` | 티켓 생성 및 실행 계획 |
| `pm-executor` | `/anyon:anyon-method:workflows:pm-executor` | 티켓 실행 |
| `pm-reviewer` | `/anyon:anyon-method:workflows:pm-reviewer` | 코드 리뷰 |

> **워크플로우 순서**: `pm-opensource` → `pm-orchestrator` → `pm-executor` ↔ `pm-reviewer`

### 1.3 슬래시 커맨드 MD 파일 구조 (공통 패턴)

모든 10개 워크플로우가 **동일한 구조**를 사용:

```markdown
---
description: '워크플로우 설명'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS - while staying in character as the current agent persona you may have loaded:

<steps CRITICAL="TRUE">
1. Always LOAD the FULL @.anyon/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @.anyon/anyon-method/workflows/{workflow-name}/workflow.yaml
3. Pass the yaml path .anyon/anyon-method/workflows/{workflow-name}/workflow.yaml as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written to process and follow the specific workflow config and its instructions
5. Save outputs after EACH section when generating any documents from templates
6. Output folder: {output-folder}
</steps>
```

### 1.4 워크플로우 구성 요소 상세

#### workflow.xml (공통 실행 엔진)
- 위치: `.anyon/core/tasks/workflow.xml`
- 역할: 모든 워크플로우의 실행 로직 정의
- 주요 기능:
  - workflow.yaml 로드 및 변수 해석
  - instructions.md 단계별 실행
  - template-output 저장
  - 체크포인트/이어하기 지원
  - 스킬 자동 호출 (required_skills)
  - 문서 일관성 검사

#### workflow.yaml (워크플로우별 설정)

**startup-prd 예시:**
```yaml
name: startup-prd
description: "AI 개발에 필요한 PRD 작성..."

# 설정 소스
config_source: "{project-root}/.anyon/anyon-method/config.yaml"
communication_language: "{config_source}:communication_language"

# 경로
installed_path: "{project-root}/.anyon/anyon-method/workflows/startup-prd"
template: "{installed_path}/template.md"
instructions: "{installed_path}/instructions.md"
validation: "{installed_path}/checklist.md"

# 출력
output_folder: "{project-root}/anyon-docs/planning"
default_output_file: "{output_folder}/prd.md"
```

**pm-orchestrator 예시 (더 복잡):**
```yaml
name: pm-orchestrator
description: "설계 문서를 분석하여 실행 가능한 티켓 생성..."

# 입력 파일 패턴
input_file_patterns:
  prd:
    whole: "{project-root}/anyon-docs/planning/prd.md"
    load_strategy: FULL_LOAD
    required: true
  ux_wireframe:
    whole: "{project-root}/anyon-docs/planning/ui-ux.html"
    ...
  # ... 6개 설계 문서 모두 참조

# 출력 설정
output_configuration:
  execution_plan: "{project-root}/anyon-docs/dev-plan/execution-plan.md"
  epics_folder: "{project-root}/anyon-docs/dev-plan/epics"
  ...

# 에이전트 정의
available_agents:
  - name: "Database Architect"
    types: ["database", "schema"]
  - name: "Backend Developer"
    types: ["api", "backend"]
  ...
```

#### instructions.md (실제 워크플로우 단계)

**startup-prd instructions.md 요약:**
```
Step 0: Welcome - 인사 및 프로젝트명 질문
Step 1: License Type - 상업용/내부용/오픈소스/학습용 선택
Step 2: Problem & Target - 문제 정의, 타겟 사용자
Step 3: Service Type & Platform - 웹/앱/데스크톱 + 상세 플랫폼
Step 4: Core Features - 핵심 기능 다중 선택
Step 5: Find Open Source - WebSearch로 오픈소스 검색
Step 6: Reference Service - 참고 서비스
Step 7: Additional Requirements - 추가 요구사항
Step 8: Generate PRD - template.md 채워서 저장
```

---

## 2. SDK 통합 설계

### 2.1 목표

슬래시 커맨드 파일 없이 **동일한 워크플로우를 SDK 프로그래밍 방식으로 실행**

### 2.2 핵심 아이디어

현재 슬래시 커맨드 MD 파일의 내용을 **시스템 프롬프트로 직접 주입**

```
현재: claude -p "/anyon:...:startup-prd"
         → Claude가 슬래시 커맨드 파일 읽음
         → workflow.xml 로드 지시

변경: claude -p "PRD 작성해주세요" --append-system-prompt "IT IS CRITICAL THAT..."
         → 시스템 프롬프트에 워크플로우 지시 포함
         → 동일하게 workflow.xml 로드
```

### 2.3 시스템 프롬프트 구조

```typescript
interface WorkflowSystemPrompt {
  // 워크플로우 메타데이터
  workflowId: string;
  description: string;

  // 핵심 지시사항 (슬래시 커맨드 MD 내용과 동일)
  criticalSteps: string;

  // 워크플로우 설정 경로
  workflowXmlPath: string;
  workflowYamlPath: string;

  // 출력 설정
  outputFolder: string;

  // 입력 파일 (이전 문서 참조)
  inputFiles?: string[];
}
```

---

## 3. 구현 계획

### Phase 1: 프롬프트 템플릿 정의

#### 3.1.1 워크플로우 프롬프트 상수 파일 생성

**파일: `src/constants/workflowPrompts.ts`**

```typescript
/**
 * 워크플로우 시스템 프롬프트 정의
 * 슬래시 커맨드 MD 파일의 내용을 코드로 변환
 */

export interface WorkflowPromptConfig {
  id: string;
  name: string;
  description: string;

  // 시스템 프롬프트 (슬래시 커맨드 MD 내용)
  systemPrompt: string;

  // 기본 사용자 프롬프트
  defaultUserPrompt: string;

  // 워크플로우 파일 경로
  workflowYamlPath: string;

  // 출력 설정
  outputFolder: string;
  outputFile: string;

  // 입력 파일 (의존성)
  inputFiles: string[];

  // 필요 스킬
  requiredSkills?: string[];

  // 필요 도구
  requiredTools?: string[];
}

// 공통 시스템 프롬프트 베이스
const WORKFLOW_SYSTEM_PROMPT_BASE = `
IT IS CRITICAL THAT YOU FOLLOW THESE STEPS - while staying in character as the current agent persona you may have loaded:

<steps CRITICAL="TRUE">
1. Always LOAD the FULL @.anyon/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config
3. Pass the yaml path as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written to process and follow the specific workflow config and its instructions
5. Save outputs after EACH section when generating any documents from templates
</steps>
`;

// 워크플로우별 시스템 프롬프트 생성 함수
function createWorkflowSystemPrompt(
  workflowYamlPath: string,
  outputFolder: string,
  inputDescription?: string
): string {
  let prompt = WORKFLOW_SYSTEM_PROMPT_BASE;

  prompt += `\n<workflow-config>${workflowYamlPath}</workflow-config>`;
  prompt += `\n<output-folder>${outputFolder}</output-folder>`;

  if (inputDescription) {
    prompt += `\n<inputs>${inputDescription}</inputs>`;
  }

  return prompt;
}

// ============================================================
// Planning 워크플로우 (6개)
// ============================================================

export const PLANNING_WORKFLOW_PROMPTS: Record<string, WorkflowPromptConfig> = {

  // 1. PRD
  'startup-prd': {
    id: 'startup-prd',
    name: 'PRD',
    description: 'Create PRD through conversational Q&A for non-technical founders with real-time open-source discovery.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/startup-prd/workflow.yaml',
      'anyon-docs/planning/'
    ),

    defaultUserPrompt: 'PRD 문서를 작성해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/startup-prd/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'prd.md',
    inputFiles: [],
    requiredSkills: ['opensource-finder'],
    requiredTools: ['WebSearch', 'WebFetch'],
  },

  // 2. UX Design
  'startup-ux': {
    id: 'startup-ux',
    name: 'UX Design',
    description: 'Create interactive HTML mockup (ui-ux.html) with user flows and clickable wireframes.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/startup-ux/workflow.yaml',
      'anyon-docs/planning/',
      'Reads PRD from anyon-docs/planning/prd.md'
    ),

    defaultUserPrompt: 'UX 디자인 문서를 작성해주세요. PRD 문서를 참조하세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/startup-ux/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'ui-ux.html',
    inputFiles: ['anyon-docs/planning/prd.md'],
    requiredSkills: ['frontend-design', 'document-consistency'],
  },

  // 3. UI Design Guide
  'startup-ui': {
    id: 'startup-ui',
    name: 'Design Guide',
    description: 'Create UI Design Guide with open-source component library recommendations.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/startup-ui/workflow.yaml',
      'anyon-docs/planning/',
      'Reads PRD and UX Design from anyon-docs/planning/'
    ),

    defaultUserPrompt: 'UI 디자인 가이드를 작성해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/startup-ui/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'design-guide.md',
    inputFiles: [
      'anyon-docs/planning/prd.md',
      'anyon-docs/planning/ui-ux.html'
    ],
    requiredTools: ['WebSearch', 'WebFetch'],
  },

  // 4. TRD
  'startup-trd': {
    id: 'startup-trd',
    name: 'TRD',
    description: 'Create Technical Requirements Document with technology stack recommendations.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/startup-trd/workflow.yaml',
      'anyon-docs/planning/',
      'Reads PRD, UX Design, and UI Design Guide from anyon-docs/planning/'
    ),

    defaultUserPrompt: '기술 요구사항 문서(TRD)를 작성해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/startup-trd/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'trd.md',
    inputFiles: [
      'anyon-docs/planning/prd.md',
      'anyon-docs/planning/ui-ux.html',
      'anyon-docs/planning/design-guide.md'
    ],
    requiredTools: ['WebSearch', 'WebFetch'],
  },

  // 5. Architecture
  'startup-architecture': {
    id: 'startup-architecture',
    name: 'Architecture',
    description: 'Create System Architecture document with infrastructure and deployment decisions.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/startup-architecture/workflow.yaml',
      'anyon-docs/planning/',
      'Reads PRD, UX Design, UI Design Guide, and TRD from anyon-docs/planning/'
    ),

    defaultUserPrompt: '시스템 아키텍처 문서를 작성해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/startup-architecture/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'architecture.md',
    inputFiles: [
      'anyon-docs/planning/prd.md',
      'anyon-docs/planning/ui-ux.html',
      'anyon-docs/planning/design-guide.md',
      'anyon-docs/planning/trd.md'
    ],
  },

  // 6. ERD
  'startup-erd': {
    id: 'startup-erd',
    name: 'ERD',
    description: 'Create Entity Relationship Diagram with database schema design.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/startup-erd/workflow.yaml',
      'anyon-docs/planning/',
      'Reads all previous documents (PRD, UX, UI, TRD, Architecture) from anyon-docs/planning/'
    ),

    defaultUserPrompt: 'ERD 데이터베이스 설계 문서를 작성해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/startup-erd/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'erd.md',
    inputFiles: [
      'anyon-docs/planning/prd.md',
      'anyon-docs/planning/ui-ux.html',
      'anyon-docs/planning/design-guide.md',
      'anyon-docs/planning/trd.md',
      'anyon-docs/planning/architecture.md'
    ],
    requiredSkills: ['document-consistency'],
  },
};

// ============================================================
// Development 워크플로우 (4개)
// ============================================================

export const DEV_WORKFLOW_PROMPTS: Record<string, WorkflowPromptConfig> = {

  // 1. PM Opensource (신규 - Orchestrator 전에 실행)
  'pm-opensource': {
    id: 'pm-opensource',
    name: 'PM Opensource',
    description: 'open-source.md 문서를 읽고 필요한 오픈소스 레포지토리들을 clone합니다. PM Orchestrator 실행 전에 수행합니다.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/pm-opensource/workflow.yaml',
      'anyon-docs/planning/',
      'Reads open-source.md from anyon-docs/planning/'
    ),

    defaultUserPrompt: '오픈소스 레포지토리를 clone해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/pm-opensource/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'open-source.md',  // 기존 파일 업데이트
    inputFiles: [
      'anyon-docs/planning/open-source.md'
    ],
  },

  // 2. PM Orchestrator
  'pm-orchestrator': {
    id: 'pm-orchestrator',
    name: 'PM Orchestrator',
    description: '설계 문서를 분석하여 실행 가능한 티켓들과 실행 계획을 생성합니다.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/pm-orchestrator/workflow.yaml',
      'anyon-docs/dev-plan/',
      'Reads all 6 planning documents from anyon-docs/planning/'
    ),

    defaultUserPrompt: '설계 문서를 분석하여 개발 계획을 생성해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/pm-orchestrator/workflow.yaml',
    outputFolder: 'anyon-docs/dev-plan',
    outputFile: 'execution-plan.md',
    inputFiles: [
      'anyon-docs/planning/prd.md',
      'anyon-docs/planning/ui-ux.html',
      'anyon-docs/planning/design-guide.md',
      'anyon-docs/planning/trd.md',
      'anyon-docs/planning/architecture.md',
      'anyon-docs/planning/erd.md'
    ],
  },

  // 3. PM Executor
  'pm-executor': {
    id: 'pm-executor',
    name: 'PM Executor',
    description: 'PM Orchestrator가 생성한 티켓들을 Wave 순서대로 실행합니다.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/pm-executor/workflow.yaml',
      'anyon-docs/dev-plan/'
    ),

    defaultUserPrompt: '개발 계획에 따라 티켓을 실행해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/pm-executor/workflow.yaml',
    outputFolder: 'anyon-docs/dev-plan',
    outputFile: 'execution-progress.md',
    inputFiles: [
      'anyon-docs/dev-plan/execution-plan.md',
      'anyon-docs/dev-plan/epics/'
    ],
  },

  // 4. PM Reviewer
  'pm-reviewer': {
    id: 'pm-reviewer',
    name: 'PM Reviewer',
    description: 'PM Executor가 완료한 Epic을 리뷰하고, 문제 발견 시 즉시 수정합니다.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/pm-reviewer/workflow.yaml',
      'anyon-docs/dev-plan/'
    ),

    defaultUserPrompt: '완료된 작업을 리뷰해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/pm-reviewer/workflow.yaml',
    outputFolder: 'anyon-docs/dev-plan',
    outputFile: 'execution-progress.md',
    inputFiles: [
      'anyon-docs/dev-plan/execution-progress.md',
      'anyon-docs/dev-plan/epics/'
    ],
  },
};

// ============================================================
// 전체 워크플로우 맵
// ============================================================

export const ALL_WORKFLOW_PROMPTS: Record<string, WorkflowPromptConfig> = {
  ...PLANNING_WORKFLOW_PROMPTS,
  ...DEV_WORKFLOW_PROMPTS,
};

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 워크플로우 ID로 프롬프트 설정 가져오기
 */
export function getWorkflowPromptConfig(workflowId: string): WorkflowPromptConfig | undefined {
  return ALL_WORKFLOW_PROMPTS[workflowId];
}

/**
 * 슬래시 커맨드를 워크플로우 ID로 변환
 * "/anyon:anyon-method:workflows:startup-prd" → "startup-prd"
 */
export function slashCommandToWorkflowId(slashCommand: string): string | undefined {
  const match = slashCommand.match(/\/anyon:anyon-method:workflows:(.+)$/);
  return match ? match[1] : undefined;
}

/**
 * 워크플로우 ID를 슬래시 커맨드로 변환 (하위 호환용)
 */
export function workflowIdToSlashCommand(workflowId: string): string {
  return `/anyon:anyon-method:workflows:${workflowId}`;
}
```

### Phase 2: Rust Backend 수정

#### 3.2.1 새로운 Tauri 커맨드 추가

**파일: `src-tauri/src/commands/claude.rs`**

```rust
/// Execute workflow with SDK-style system prompt injection
#[tauri::command]
pub async fn execute_workflow_sdk(
    app: AppHandle,
    project_path: String,
    workflow_id: String,
    user_prompt: String,
    system_prompt: String,
    model: String,
) -> Result<(), String> {
    log::info!(
        "Starting workflow via SDK: {} in: {} with model: {}",
        workflow_id,
        project_path,
        model
    );

    let claude_path = find_claude_binary(&app)?;

    let args = vec![
        "-p".to_string(),
        user_prompt.clone(),
        "--append-system-prompt".to_string(),  // 핵심: 시스템 프롬프트 주입
        system_prompt.clone(),
        "--model".to_string(),
        model.clone(),
        "--output-format".to_string(),
        "stream-json".to_string(),
        "--verbose".to_string(),
        "--dangerously-skip-permissions".to_string(),
    ];

    let cmd = create_system_command(&claude_path, args, &project_path);
    spawn_claude_process(app, cmd, user_prompt, model, project_path).await
}

/// Continue workflow with system prompt
#[tauri::command]
pub async fn continue_workflow_sdk(
    app: AppHandle,
    project_path: String,
    workflow_id: String,
    user_prompt: String,
    system_prompt: String,
    model: String,
) -> Result<(), String> {
    log::info!(
        "Continuing workflow via SDK: {} in: {}",
        workflow_id,
        project_path
    );

    let claude_path = find_claude_binary(&app)?;

    let args = vec![
        "-c".to_string(),  // Continue flag
        "-p".to_string(),
        user_prompt.clone(),
        "--append-system-prompt".to_string(),
        system_prompt.clone(),
        "--model".to_string(),
        model.clone(),
        "--output-format".to_string(),
        "stream-json".to_string(),
        "--verbose".to_string(),
        "--dangerously-skip-permissions".to_string(),
    ];

    let cmd = create_system_command(&claude_path, args, &project_path);
    spawn_claude_process(app, cmd, user_prompt, model, project_path).await
}
```

#### 3.2.2 lib.rs에 새 커맨드 등록

```rust
// src-tauri/src/lib.rs

.invoke_handler(tauri::generate_handler![
    // 기존 커맨드들...
    commands::claude::execute_claude_code,
    commands::claude::continue_claude_code,
    commands::claude::resume_claude_code,

    // 새 SDK 스타일 커맨드
    commands::claude::execute_workflow_sdk,
    commands::claude::continue_workflow_sdk,
])
```

### Phase 3: Frontend API 및 컴포넌트 수정

#### 3.3.1 API 함수 추가

**파일: `src/lib/api.ts`**

```typescript
import { invoke } from '@tauri-apps/api/core';
import { getWorkflowPromptConfig } from '@/constants/workflowPrompts';

export interface WorkflowSdkRequest {
  workflowId: string;
  projectPath: string;
  userPrompt?: string;  // 기본값 사용 시 생략 가능
  model?: 'sonnet' | 'opus';
}

export const api = {
  // 기존 함수들 유지...

  /**
   * SDK 스타일로 워크플로우 실행
   * 시스템 프롬프트를 코드에서 직접 주입
   */
  async executeWorkflowSdk(request: WorkflowSdkRequest): Promise<void> {
    const config = getWorkflowPromptConfig(request.workflowId);
    if (!config) {
      throw new Error(`Unknown workflow: ${request.workflowId}`);
    }

    return invoke('execute_workflow_sdk', {
      projectPath: request.projectPath,
      workflowId: request.workflowId,
      userPrompt: request.userPrompt || config.defaultUserPrompt,
      systemPrompt: config.systemPrompt,
      model: request.model || 'sonnet',
    });
  },

  /**
   * SDK 스타일로 워크플로우 이어하기
   */
  async continueWorkflowSdk(request: WorkflowSdkRequest): Promise<void> {
    const config = getWorkflowPromptConfig(request.workflowId);
    if (!config) {
      throw new Error(`Unknown workflow: ${request.workflowId}`);
    }

    return invoke('continue_workflow_sdk', {
      projectPath: request.projectPath,
      workflowId: request.workflowId,
      userPrompt: request.userPrompt || config.defaultUserPrompt,
      systemPrompt: config.systemPrompt,
      model: request.model || 'sonnet',
    });
  },
};
```

#### 3.3.2 상수 파일 수정

**파일: `src/constants/planning.ts` 수정**

```typescript
import { PLANNING_WORKFLOW_PROMPTS } from './workflowPrompts';

export interface WorkflowStep {
  id: string;
  title: string;
  filename: string;

  // 기존: 슬래시 커맨드
  workflow: string;  // 하위 호환용 유지

  // 신규: SDK 워크플로우 ID
  workflowId: string;

  displayText: string;
  icon: WorkflowIconType;
  nextId: string | null;
}

export const WORKFLOW_SEQUENCE: WorkflowStep[] = [
  {
    id: 'prd',
    title: 'PRD',
    filename: 'prd.md',
    workflow: '/anyon:anyon-method:workflows:startup-prd',  // 레거시
    workflowId: 'startup-prd',  // SDK용
    displayText: 'PRD 문서 작성 시작',
    icon: 'file-text',
    nextId: 'ux-design',
  },
  // ... 나머지 동일하게 workflowId 추가
];
```

**파일: `src/constants/development.ts` 수정**

```typescript
import { DEV_WORKFLOW_PROMPTS } from './workflowPrompts';

export type DevWorkflowIconType = 'package' | 'layout-list' | 'rocket' | 'check-circle';

export interface DevWorkflowStep {
  id: string;
  title: string;
  prompt: string;          // 레거시 슬래시 커맨드
  workflowId: string;      // 신규 SDK용 ID
  displayText: string;
  icon: DevWorkflowIconType;
}

/**
 * PM Workflow Sequence (업데이트)
 * pm-opensource → pm-orchestrator → pm-executor ↔ pm-reviewer
 */
export const DEV_WORKFLOW_SEQUENCE: DevWorkflowStep[] = [
  {
    id: 'pm-opensource',
    title: 'PM Opensource',
    prompt: '/anyon:anyon-method:workflows:pm-opensource',
    workflowId: 'pm-opensource',
    displayText: 'PM Opensource - 오픈소스 Clone',
    icon: 'package',  // 새 아이콘 추가 필요
  },
  {
    id: 'pm-orchestrator',
    title: 'PM Orchestrator',
    prompt: '/anyon:anyon-method:workflows:pm-orchestrator',
    workflowId: 'pm-orchestrator',
    displayText: 'PM Orchestrator - 실행 계획 생성',
    icon: 'layout-list',
  },
  {
    id: 'pm-executor',
    title: 'PM Executor',
    prompt: '/anyon:anyon-method:workflows:pm-executor',
    workflowId: 'pm-executor',
    displayText: 'PM Executor - 티켓 실행',
    icon: 'rocket',
  },
  {
    id: 'pm-reviewer',
    title: 'PM Reviewer',
    prompt: '/anyon:anyon-method:workflows:pm-reviewer',
    workflowId: 'pm-reviewer',
    displayText: 'PM Reviewer - 코드 리뷰',
    icon: 'check-circle',
  },
];
```

#### 3.3.3 MvpWorkspace 수정

**파일: `src/components/MvpWorkspace.tsx` 수정**

```typescript
import { api } from '@/lib/api';
import { slashCommandToWorkflowId, getWorkflowPromptConfig } from '@/constants/workflowPrompts';

// SDK 모드 활성화 플래그 (환경변수 또는 설정으로 제어)
const USE_SDK_MODE = true;

// Start a new workflow from PlanningDocsPanel
const handleStartNewWorkflow = useCallback((workflowPrompt: string) => {
  if (!project?.path) return;

  if (USE_SDK_MODE) {
    // 신규: SDK 스타일
    const workflowId = slashCommandToWorkflowId(workflowPrompt);
    if (workflowId) {
      api.executeWorkflowSdk({
        workflowId,
        projectPath: project.path,
        model: 'sonnet',
      });
    }
  } else {
    // 레거시: 슬래시 커맨드
    if (claudeSessionRef.current) {
      claudeSessionRef.current.startNewSession(workflowPrompt);
    }
  }
}, [project?.path]);
```

### Phase 4: 점진적 마이그레이션

#### 3.4.1 기능 플래그 시스템

```typescript
// src/config/featureFlags.ts

export const FEATURE_FLAGS = {
  // SDK 모드 활성화
  USE_SDK_WORKFLOW: process.env.VITE_USE_SDK_WORKFLOW === 'true' || false,

  // 개별 워크플로우 SDK 전환
  SDK_WORKFLOWS: {
    'startup-prd': true,      // PRD부터 시작
    'startup-ux': false,      // 점진적 활성화
    'startup-ui': false,
    'startup-trd': false,
    'startup-architecture': false,
    'startup-erd': false,
    'pm-opensource': false,   // Development 첫 단계
    'pm-orchestrator': false,
    'pm-executor': false,
    'pm-reviewer': false,
  },
};

export function shouldUseSdkForWorkflow(workflowId: string): boolean {
  if (!FEATURE_FLAGS.USE_SDK_WORKFLOW) return false;
  return FEATURE_FLAGS.SDK_WORKFLOWS[workflowId] ?? false;
}
```

#### 3.4.2 하이브리드 실행 함수

```typescript
// src/lib/workflowExecutor.ts

import { api } from './api';
import { shouldUseSdkForWorkflow, slashCommandToWorkflowId } from '@/config/featureFlags';

export async function executeWorkflow(
  workflowPrompt: string,
  projectPath: string,
  claudeSessionRef: React.RefObject<ClaudeCodeSessionRef>,
  model: 'sonnet' | 'opus' = 'sonnet'
) {
  const workflowId = slashCommandToWorkflowId(workflowPrompt);

  if (workflowId && shouldUseSdkForWorkflow(workflowId)) {
    // SDK 모드
    console.log(`[Workflow] Executing via SDK: ${workflowId}`);
    await api.executeWorkflowSdk({
      workflowId,
      projectPath,
      model,
    });
  } else {
    // 레거시 모드
    console.log(`[Workflow] Executing via slash command: ${workflowPrompt}`);
    claudeSessionRef.current?.startNewSession(workflowPrompt);
  }
}
```

---

## 4. 파일 변경 목록

### 신규 파일

| 파일 | 설명 |
|---|---|
| `src/constants/workflowPrompts.ts` | 워크플로우 시스템 프롬프트 정의 |
| `src/config/featureFlags.ts` | SDK 모드 기능 플래그 |
| `src/lib/workflowExecutor.ts` | 하이브리드 워크플로우 실행기 |

### 수정 파일

| 파일 | 변경 내용 |
|---|---|
| `src-tauri/src/commands/claude.rs` | `execute_workflow_sdk`, `continue_workflow_sdk` 추가 |
| `src-tauri/src/lib.rs` | 새 커맨드 등록 |
| `src/lib/api.ts` | SDK API 함수 추가 |
| `src/constants/planning.ts` | `workflowId` 필드 추가 |
| `src/constants/development.ts` | `workflowId` 필드 추가, `pm-opensource` 워크플로우 추가 |
| `src/components/MvpWorkspace.tsx` | 하이브리드 실행 로직 |

### 유지 파일 (삭제하지 않음)

| 파일 | 이유 |
|---|---|
| `.claude/commands/anyon/**/*.md` | 하위 호환성, 점진적 마이그레이션 |
| `.anyon/**/*` | 워크플로우 로직 파일 (yaml, instructions, template) |

---

## 5. 마이그레이션 일정

```
Week 1: 기반 구축
├── Day 1-2: workflowPrompts.ts 작성
├── Day 3-4: Rust backend 수정
└── Day 5: 기본 테스트

Week 2: Planning 워크플로우 전환
├── Day 1: startup-prd SDK 전환 및 테스트
├── Day 2: startup-ux SDK 전환 및 테스트
├── Day 3: startup-ui, startup-trd 전환
├── Day 4: startup-architecture, startup-erd 전환
└── Day 5: 전체 Planning 플로우 E2E 테스트

Week 3: Development 워크플로우 전환
├── Day 1: pm-opensource SDK 전환 및 테스트
├── Day 2: pm-orchestrator SDK 전환 및 테스트
├── Day 3-4: pm-executor, pm-reviewer 전환
└── Day 5: 전체 E2E 테스트

Week 4: 안정화 및 정리
├── Day 1-3: 버그 수정, 엣지 케이스 처리
├── Day 4: 문서화
└── Day 5: 레거시 코드 deprecation 표시
```

---

## 6. 테스트 체크리스트

### 6.1 단위 테스트

- [ ] `getWorkflowPromptConfig()` - 모든 워크플로우 ID에 대해 올바른 설정 반환
- [ ] `slashCommandToWorkflowId()` - 슬래시 커맨드 → ID 변환
- [ ] `shouldUseSdkForWorkflow()` - 기능 플래그 정상 작동

### 6.2 통합 테스트

- [ ] SDK 모드로 startup-prd 실행 → prd.md 생성 확인
- [ ] SDK 모드로 startup-ux 실행 → ui-ux.html 생성 확인
- [ ] SDK 모드로 pm-opensource 실행 → 레포 clone 및 open-source.md 업데이트 확인
- [ ] 레거시 모드 폴백 정상 작동

### 6.3 E2E 테스트

- [ ] Planning 전체 플로우 (PRD → UX → UI → TRD → Architecture → ERD)
- [ ] Development 전체 플로우 (Opensource → Orchestrator → Executor → Reviewer)
- [ ] 세션 이어하기 (continue) 정상 작동
- [ ] 세션 재개 (resume) 정상 작동

---

## 7. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| `--append-system-prompt` 동작 차이 | 워크플로우 실패 | 슬래시 커맨드 폴백, 프롬프트 튜닝 |
| 시스템 프롬프트 길이 제한 | 잘림 현상 | 프롬프트 최적화, 핵심만 포함 |
| workflow.xml 로딩 실패 | 전체 워크플로우 실패 | 명시적 경로 지정, 에러 핸들링 |
| 기존 사용자 혼란 | UX 저하 | 점진적 전환, 문서화 |

---

## 8. 비용 영향

**변화 없음**

- SDK는 Claude Code CLI를 내부적으로 호출
- 사용자의 기존 Claude Code 구독 사용
- 토큰 사용량: 약간 감소 (슬래시 커맨드 파일 읽기 오버헤드 제거)

---

## 9. 결론

이 계획을 통해:

1. **슬래시 커맨드 없이** 동일한 워크플로우 실행 가능
2. **코드에서 직접 프롬프트 제어** - 더 유연한 커스터마이징
3. **점진적 마이그레이션** - 리스크 최소화
4. **하위 호환성 유지** - 기존 사용자 영향 없음
