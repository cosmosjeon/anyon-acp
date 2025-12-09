/**
 * SDK 모드 기능 플래그
 * 점진적 마이그레이션을 위한 워크플로우별 SDK 전환 제어
 */

export const FEATURE_FLAGS = {
  // SDK 모드 전역 활성화
  // ClaudeCodeSession을 통해 시스템 프롬프트 주입 지원
  USE_SDK_WORKFLOW: import.meta.env.VITE_USE_SDK_WORKFLOW === 'true' || true,

  // 개별 워크플로우 SDK 전환
  SDK_WORKFLOWS: {
    // Planning 워크플로우 (6개)
    'startup-prd': true,
    'startup-ux': true,
    'startup-ui': true,
    'startup-trd': true,
    'startup-architecture': true,
    'startup-erd': true,

    // Development 워크플로우 (4개)
    'pm-opensource': true,
    'pm-orchestrator': true,
    'pm-executor': true,
    'pm-reviewer': true,
  } as Record<string, boolean>,
};

/**
 * 특정 워크플로우에 SDK 모드를 사용해야 하는지 확인
 */
export function shouldUseSdkForWorkflow(workflowId: string): boolean {
  if (!FEATURE_FLAGS.USE_SDK_WORKFLOW) return false;
  return FEATURE_FLAGS.SDK_WORKFLOWS[workflowId] ?? false;
}

/**
 * 모든 워크플로우에 대해 SDK 모드 활성화 (테스트용)
 */
export function enableAllSdkWorkflows(): void {
  Object.keys(FEATURE_FLAGS.SDK_WORKFLOWS).forEach((key) => {
    FEATURE_FLAGS.SDK_WORKFLOWS[key] = true;
  });
}

/**
 * 모든 워크플로우에 대해 SDK 모드 비활성화 (레거시 모드로 폴백)
 */
export function disableAllSdkWorkflows(): void {
  Object.keys(FEATURE_FLAGS.SDK_WORKFLOWS).forEach((key) => {
    FEATURE_FLAGS.SDK_WORKFLOWS[key] = false;
  });
}

/**
 * 특정 워크플로우의 SDK 모드 토글
 */
export function toggleSdkWorkflow(workflowId: string, enabled: boolean): void {
  if (workflowId in FEATURE_FLAGS.SDK_WORKFLOWS) {
    FEATURE_FLAGS.SDK_WORKFLOWS[workflowId] = enabled;
  }
}
