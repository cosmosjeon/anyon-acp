/**
 * 하이브리드 워크플로우 실행기
 * SDK 모드와 레거시 슬래시 커맨드 모드를 기능 플래그에 따라 전환
 */

import { shouldUseSdkForWorkflow } from '@/config/featureFlags';
import { slashCommandToWorkflowId, getWorkflowPromptConfig } from '@/constants/workflowPrompts';
import { api } from './api';

export interface ClaudeCodeSessionRef {
  startNewSession: (prompt: string) => void;
  continueSession: (prompt: string) => void;
}

export interface WorkflowExecutionOptions {
  workflowPrompt: string;
  projectPath: string;
  claudeSessionRef: React.RefObject<ClaudeCodeSessionRef>;
  model?: 'sonnet' | 'opus';
  userPrompt?: string;
}

/**
 * 워크플로우 실행 (새 세션)
 * 기능 플래그에 따라 SDK 모드 또는 레거시 모드 선택
 */
export async function executeWorkflow(options: WorkflowExecutionOptions): Promise<void> {
  const { workflowPrompt, projectPath, claudeSessionRef, model = 'sonnet', userPrompt } = options;

  const workflowId = slashCommandToWorkflowId(workflowPrompt);

  if (workflowId && shouldUseSdkForWorkflow(workflowId)) {
    // SDK 모드
    console.log(`[Workflow] Executing via SDK: ${workflowId}`);
    await api.executeWorkflowSdk({
      workflowId,
      projectPath,
      model,
      userPrompt,
    });
  } else {
    // 레거시 모드 (슬래시 커맨드)
    console.log(`[Workflow] Executing via slash command: ${workflowPrompt}`);
    claudeSessionRef.current?.startNewSession(workflowPrompt);
  }
}

/**
 * 워크플로우 이어하기 (기존 세션 계속)
 */
export async function continueWorkflow(options: WorkflowExecutionOptions): Promise<void> {
  const { workflowPrompt, projectPath, claudeSessionRef, model = 'sonnet', userPrompt } = options;

  const workflowId = slashCommandToWorkflowId(workflowPrompt);

  if (workflowId && shouldUseSdkForWorkflow(workflowId)) {
    // SDK 모드
    console.log(`[Workflow] Continuing via SDK: ${workflowId}`);
    await api.continueWorkflowSdk({
      workflowId,
      projectPath,
      model,
      userPrompt,
    });
  } else {
    // 레거시 모드
    console.log(`[Workflow] Continuing via slash command: ${workflowPrompt}`);
    claudeSessionRef.current?.continueSession(workflowPrompt);
  }
}

/**
 * 워크플로우 ID로 직접 실행 (SDK 전용)
 */
export async function executeWorkflowById(
  workflowId: string,
  projectPath: string,
  model: 'sonnet' | 'opus' = 'sonnet',
  userPrompt?: string
): Promise<void> {
  const config = getWorkflowPromptConfig(workflowId);
  if (!config) {
    throw new Error(`Unknown workflow ID: ${workflowId}`);
  }

  console.log(`[Workflow] Executing by ID via SDK: ${workflowId}`);
  await api.executeWorkflowSdk({
    workflowId,
    projectPath,
    model,
    userPrompt,
  });
}

/**
 * 워크플로우 ID로 이어하기 (SDK 전용)
 */
export async function continueWorkflowById(
  workflowId: string,
  projectPath: string,
  model: 'sonnet' | 'opus' = 'sonnet',
  userPrompt?: string
): Promise<void> {
  const config = getWorkflowPromptConfig(workflowId);
  if (!config) {
    throw new Error(`Unknown workflow ID: ${workflowId}`);
  }

  console.log(`[Workflow] Continuing by ID via SDK: ${workflowId}`);
  await api.continueWorkflowSdk({
    workflowId,
    projectPath,
    model,
    userPrompt,
  });
}
