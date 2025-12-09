/**
 * Planning workflow constants
 * 6-step document workflow sequence for MVP planning
 */

export type WorkflowIconType = 'file-text' | 'palette' | 'paintbrush' | 'settings' | 'boxes' | 'database';

export interface WorkflowStep {
  id: string;
  title: string;
  filename: string;
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
    workflowId: 'startup-prd',
    displayText: 'PRD 문서 작성 시작',
    icon: 'file-text',
    nextId: 'ux-design',
  },
  {
    id: 'ux-design',
    title: 'UX Design',
    filename: 'ux-design.md',
    workflowId: 'startup-ux',
    displayText: 'UX 디자인 문서 작성',
    icon: 'palette',
    nextId: 'design-guide',
  },
  {
    id: 'design-guide',
    title: 'Design Guide',
    filename: 'ui-design-guide.md',
    workflowId: 'startup-ui',
    displayText: 'UI 디자인 가이드 작성',
    icon: 'paintbrush',
    nextId: 'trd',
  },
  {
    id: 'trd',
    title: 'TRD',
    filename: 'trd.md',
    workflowId: 'startup-trd',
    displayText: '기술 요구사항 문서 작성',
    icon: 'settings',
    nextId: 'architecture',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    filename: 'architecture.md',
    workflowId: 'startup-architecture',
    displayText: '시스템 아키텍처 설계',
    icon: 'boxes',
    nextId: 'erd',
  },
  {
    id: 'erd',
    title: 'ERD',
    filename: 'erd.md',
    workflowId: 'startup-erd',
    displayText: 'ERD 데이터베이스 설계',
    icon: 'database',
    nextId: null,
  },
];

export const ANYON_DOCS_DIR = 'anyon-docs/conversation';

/**
 * Get the next workflow step after the given filename
 */
export const getNextWorkflowStep = (currentFilename: string): WorkflowStep | null => {
  const currentIndex = WORKFLOW_SEQUENCE.findIndex(
    (step) => step.filename === currentFilename
  );
  if (currentIndex === -1 || currentIndex === WORKFLOW_SEQUENCE.length - 1) {
    return null;
  }
  return WORKFLOW_SEQUENCE[currentIndex + 1];
};

/**
 * Get workflow step by ID
 */
export const getWorkflowStepById = (id: string): WorkflowStep | undefined => {
  return WORKFLOW_SEQUENCE.find((step) => step.id === id);
};

