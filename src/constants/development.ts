/**
 * Development workflow constants
 * PM workflow sequence for MVP development
 */

import {
  PM_ORCHESTRATOR_PROMPT,
  PM_EXECUTOR_PROMPT,
  PM_REVIEWER_PROMPT,
} from './workflows/development';

export type DevWorkflowIconType = 'layout-list' | 'rocket' | 'check-circle';

export interface DevWorkflowStep {
  id: string;
  title: string;
  /** @deprecated 슬래시 커맨드 방식 - prompt 사용 권장 */
  workflow: string;
  /** 내재화된 프롬프트 (권장) */
  prompt?: string;
  displayText: string;
  icon: DevWorkflowIconType;
}

/**
 * PM Workflow Sequence
 * pm-orchestrator → pm-executor ↔ pm-reviewer (cycles until complete)
 */
export const DEV_WORKFLOW_SEQUENCE: DevWorkflowStep[] = [
  {
    id: 'pm-orchestrator',
    title: 'PM Orchestrator',
    workflow: '/anyon:anyon-method:workflows:pm-orchestrator',
    prompt: PM_ORCHESTRATOR_PROMPT,
    displayText: 'PM Orchestrator - 실행 계획 생성',
    icon: 'layout-list',
  },
  {
    id: 'pm-executor',
    title: 'PM Executor',
    workflow: '/anyon:anyon-method:workflows:pm-executor',
    prompt: PM_EXECUTOR_PROMPT,
    displayText: 'PM Executor - 티켓 실행',
    icon: 'rocket',
  },
  {
    id: 'pm-reviewer',
    title: 'PM Reviewer',
    workflow: '/anyon:anyon-method:workflows:pm-reviewer',
    prompt: PM_REVIEWER_PROMPT,
    displayText: 'PM Reviewer - 코드 리뷰',
    icon: 'check-circle',
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
export const getDevStepById = (id: string): DevWorkflowStep | undefined => {
  return DEV_WORKFLOW_SEQUENCE.find((step) => step.id === id);
};

/**
 * Get display text for a dev workflow command
 */
export const getDevWorkflowDisplayText = (workflow: string): string | null => {
  const step = DEV_WORKFLOW_SEQUENCE.find((s) => s.workflow === workflow);
  return step?.displayText ?? null;
};

/**
 * 워크플로우 실행에 사용할 프롬프트 반환
 * prompt가 있으면 내재화된 프롬프트 사용, 없으면 슬래시 커맨드 사용
 */
export const getDevWorkflowPrompt = (step: DevWorkflowStep): string => {
  return step.prompt ?? step.workflow;
};
