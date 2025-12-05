/**
 * Development workflow constants
 * PM workflow sequence for MVP development
 */

export interface DevWorkflowStep {
  id: string;
  title: string;
  prompt: string;
}

/**
 * PM Workflow Sequence
 * pm-orchestrator → pm-executor ↔ pm-reviewer (cycles until complete)
 */
export const DEV_WORKFLOW_SEQUENCE: DevWorkflowStep[] = [
  {
    id: 'pm-orchestrator',
    title: 'PM Orchestrator',
    prompt: '/anyon:anyon-method:workflows:pm-orchestrator',
  },
  {
    id: 'pm-executor',
    title: 'PM Executor',
    prompt: '/anyon:anyon-method:workflows:pm-executor',
  },
  {
    id: 'pm-reviewer',
    title: 'PM Reviewer',
    prompt: '/anyon:anyon-method:workflows:pm-reviewer',
  },
];

/**
 * Check if prompt is a dev workflow prompt
 */
export const isDevWorkflowPrompt = (prompt: string): boolean => {
  return DEV_WORKFLOW_SEQUENCE.some((step) => prompt.includes(step.id));
};

/**
 * Get current workflow step from prompt
 */
export const getCurrentStepFromPrompt = (prompt: string): DevWorkflowStep | null => {
  return DEV_WORKFLOW_SEQUENCE.find((step) => prompt.includes(step.id)) ?? null;
};

/**
 * Get workflow step by ID
 */
export const getWorkflowStepById = (id: string): DevWorkflowStep | undefined => {
  return DEV_WORKFLOW_SEQUENCE.find((step) => step.id === id);
};
