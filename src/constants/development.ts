/**
 * Development workflow constants
 * PM workflow sequence for MVP development
 */

import {
  PM_OPENSOURCE_PROMPT,
  PM_ORCHESTRATOR_PROMPT,
  PM_EXECUTOR_PROMPT,
  PM_REVIEWER_PROMPT,
} from './workflows/development';

export type DevWorkflowIconType = 'layout-list' | 'rocket' | 'check-circle' | 'git-branch';

export interface DevWorkflowStep {
  id: string;
  title: string;
  /** @deprecated 슬래시 커맨드 방식 - internalPrompt 사용 권장 */
  prompt: string;
  /** 내재화된 프롬프트 */
  internalPrompt?: string;
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
    title: 'Opensource Clone',
    prompt: '/anyon:anyon-method:workflows:pm-opensource',
    internalPrompt: PM_OPENSOURCE_PROMPT,
    displayText: 'PM Opensource - 오픈소스 레포 클론',
    icon: 'git-branch',
  },
  {
    id: 'pm-orchestrator',
    title: 'PM Orchestrator',
    prompt: '/anyon:anyon-method:workflows:pm-orchestrator',
    internalPrompt: PM_ORCHESTRATOR_PROMPT,
    displayText: 'PM Orchestrator - 실행 계획 생성',
    icon: 'layout-list',
  },
  {
    id: 'pm-executor',
    title: 'PM Executor',
    prompt: '/anyon:anyon-method:workflows:pm-executor',
    internalPrompt: PM_EXECUTOR_PROMPT,
    displayText: 'PM Executor - 티켓 실행',
    icon: 'rocket',
  },
  {
    id: 'pm-reviewer',
    title: 'PM Reviewer',
    prompt: '/anyon:anyon-method:workflows:pm-reviewer',
    internalPrompt: PM_REVIEWER_PROMPT,
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
export const getWorkflowStepById = (id: string): DevWorkflowStep | undefined => {
  return DEV_WORKFLOW_SEQUENCE.find((step) => step.id === id);
};

/**
 * Get display text for a dev workflow command
 */
export const getDevWorkflowDisplayText = (prompt: string): string | null => {
  const step = DEV_WORKFLOW_SEQUENCE.find((s) => s.prompt === prompt);
  return step?.displayText ?? null;
};

/**
 * 워크플로우 실행에 사용할 프롬프트 반환
 * internalPrompt가 있으면 내재화된 프롬프트 사용, 없으면 슬래시 커맨드 사용
 */
export const getDevWorkflowPrompt = (step: DevWorkflowStep): string => {
  return step.internalPrompt ?? step.prompt;
};
