/**
 * Development workflow constants
 * PM workflow sequence for MVP development
 */

export type DevWorkflowIconType = 'package' | 'layout-list' | 'rocket' | 'check-circle';

export interface DevWorkflowStep {
  id: string;
  title: string;
  workflowId: string;
  displayText: string;
  icon: DevWorkflowIconType;
}

/**
 * PM Workflow Sequence
 * pm-opensource → pm-orchestrator → pm-executor ↔ pm-reviewer (cycles until complete)
 */
export const DEV_WORKFLOW_SEQUENCE: DevWorkflowStep[] = [
  {
    id: 'pm-opensource',
    title: 'PM Opensource',
    workflowId: 'pm-opensource',
    displayText: 'PM Opensource - 오픈소스 Clone',
    icon: 'package',
  },
  {
    id: 'pm-orchestrator',
    title: 'PM Orchestrator',
    workflowId: 'pm-orchestrator',
    displayText: 'PM Orchestrator - 실행 계획 생성',
    icon: 'layout-list',
  },
  {
    id: 'pm-executor',
    title: 'PM Executor',
    workflowId: 'pm-executor',
    displayText: 'PM Executor - 티켓 실행',
    icon: 'rocket',
  },
  {
    id: 'pm-reviewer',
    title: 'PM Reviewer',
    workflowId: 'pm-reviewer',
    displayText: 'PM Reviewer - 코드 리뷰',
    icon: 'check-circle',
  },
];

/**
 * Get workflow step by ID
 */
export const getWorkflowStepById = (id: string): DevWorkflowStep | undefined => {
  return DEV_WORKFLOW_SEQUENCE.find((step) => step.id === id);
};
