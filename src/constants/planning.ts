/**
 * Planning workflow constants
 * 6-step document workflow sequence for MVP planning
 */

export interface WorkflowStep {
  id: string;
  title: string;
  filename: string;
  workflow: string;
  nextId: string | null;
}

export const WORKFLOW_SEQUENCE: WorkflowStep[] = [
  {
    id: 'prd',
    title: 'PRD',
    filename: 'prd.md',
    workflow: '/anyon:anyon-method:workflows:startup-prd',
    nextId: 'ux-design',
  },
  {
    id: 'ux-design',
    title: 'UX Design',
    filename: 'ux-design.md',
    workflow: '/anyon:anyon-method:workflows:startup-ux',
    nextId: 'design-guide',
  },
  {
    id: 'design-guide',
    title: 'Design Guide',
    filename: 'ui-design-guide.md',
    workflow: '/anyon:anyon-method:workflows:startup-ui',
    nextId: 'trd',
  },
  {
    id: 'trd',
    title: 'TRD',
    filename: 'trd.md',
    workflow: '/anyon:anyon-method:workflows:startup-trd',
    nextId: 'architecture',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    filename: 'architecture.md',
    workflow: '/anyon:anyon-method:workflows:startup-architecture',
    nextId: 'erd',
  },
  {
    id: 'erd',
    title: 'ERD',
    filename: 'erd.md',
    workflow: '/anyon:anyon-method:workflows:startup-erd',
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
