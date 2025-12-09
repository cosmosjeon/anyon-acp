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
    description:
      'Create PRD through conversational Q&A for non-technical founders with real-time open-source discovery.',

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
    inputFiles: ['anyon-docs/planning/prd.md', 'anyon-docs/planning/ui-ux.html'],
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
      'anyon-docs/planning/design-guide.md',
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
      'anyon-docs/planning/trd.md',
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
      'anyon-docs/planning/architecture.md',
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
    description:
      'open-source.md 문서를 읽고 필요한 오픈소스 레포지토리들을 clone합니다. PM Orchestrator 실행 전에 수행합니다.',

    systemPrompt: createWorkflowSystemPrompt(
      '.anyon/anyon-method/workflows/pm-opensource/workflow.yaml',
      'anyon-docs/planning/',
      'Reads open-source.md from anyon-docs/planning/'
    ),

    defaultUserPrompt: '오픈소스 레포지토리를 clone해주세요.',

    workflowYamlPath: '.anyon/anyon-method/workflows/pm-opensource/workflow.yaml',
    outputFolder: 'anyon-docs/planning',
    outputFile: 'open-source.md', // 기존 파일 업데이트
    inputFiles: ['anyon-docs/planning/open-source.md'],
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
      'anyon-docs/planning/erd.md',
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
    inputFiles: ['anyon-docs/dev-plan/execution-plan.md', 'anyon-docs/dev-plan/epics/'],
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
    inputFiles: ['anyon-docs/dev-plan/execution-progress.md', 'anyon-docs/dev-plan/epics/'],
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

