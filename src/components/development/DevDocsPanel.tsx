import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, Square, AlertCircle, CheckCircle2, Code, Trash2 , Loader2 } from 'lucide-react';
import { PanelHeader, StatusBadge } from '@/components/ui/panel-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEV_WORKFLOW_SEQUENCE } from '@/constants/development';
import { api } from '@/lib/api';

const DEV_COMPLETE_FILE = 'anyon-docs/dev-plan/DEVELOPMENT_COMPLETE.md';

interface DevDocsPanelProps {
  projectPath: string | undefined;
  isPlanningComplete: boolean;
  onStartNewSession?: (prompt: string, displayText?: string) => void;
  isSessionLoading?: boolean;
}

/**
 * Get next workflow step based on current step
 * Opensource → Orchestrator → Executor → Reviewer → Executor → Reviewer ... (cycle)
 */
const getNextStep = (currentStepId: string): typeof DEV_WORKFLOW_SEQUENCE[0] | null => {
  // Opensource → Orchestrator
  if (currentStepId === 'pm-opensource') {
    return DEV_WORKFLOW_SEQUENCE[1]; // pm-orchestrator
  }
  // Orchestrator → Executor
  if (currentStepId === 'pm-orchestrator') {
    return DEV_WORKFLOW_SEQUENCE[2]; // pm-executor
  }
  // Executor → Reviewer
  if (currentStepId === 'pm-executor') {
    return DEV_WORKFLOW_SEQUENCE[3]; // pm-reviewer
  }
  // Reviewer → Executor (cycle back)
  if (currentStepId === 'pm-reviewer') {
    return DEV_WORKFLOW_SEQUENCE[2]; // pm-executor
  }
  return null;
};

export const DevDocsPanel: React.FC<DevDocsPanelProps> = ({
  projectPath,
  isPlanningComplete,
  onStartNewSession,
  isSessionLoading = false,
}) => {
  const [currentRunningStep, setCurrentRunningStep] = useState<string | null>(null);
  const prevLoadingRef = useRef(isSessionLoading);
  const isStoppedRef = useRef(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isDevComplete, setIsDevComplete] = useState(false);
  const [executionLog, setExecutionLog] = useState<Array<{
    stepId: string;
    stepTitle: string;
    status: 'running' | 'completed' | 'error';
    timestamp: number;
  }>>([]);

  const addLogEntry = (stepId: string, status: 'running' | 'completed' | 'error') => {
    const step = DEV_WORKFLOW_SEQUENCE.find(s => s.id === stepId);
    if (step) {
      setExecutionLog(prev => [
        ...prev,
        {
          stepId,
          stepTitle: step.title,
          status,
          timestamp: Date.now()
        }
      ]);
    }
  };

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const isNowDone = wasLoading && !isSessionLoading;
    prevLoadingRef.current = isSessionLoading;

    if (isNowDone && currentRunningStep && !isStoppedRef.current) {
      addLogEntry(currentRunningStep, 'completed');

      const checkAndContinue = async () => {
        if (!projectPath) return;

        const completeFilePath = `${projectPath}/${DEV_COMPLETE_FILE}`;
        const isComplete = await api.checkFileExists(completeFilePath);

        if (isComplete) {
          setIsDevComplete(true);
          setCurrentRunningStep(null);
          return;
        }

        const nextStep = getNextStep(currentRunningStep);
        if (nextStep) {
          setTimeout(() => {
            // Check again in case stop was pressed during the delay
            if (!isStoppedRef.current) {
              setCurrentRunningStep(nextStep.id);
              onStartNewSession?.(nextStep.prompt, nextStep.displayText);
            }
          }, 500);
        }
      };

      checkAndContinue();
    }
  }, [isSessionLoading, currentRunningStep, onStartNewSession, projectPath]);

  // Start a step (clicking any step starts and continues from there)
  const handleStart = (stepId: string, prompt: string, displayText?: string) => {
    isStoppedRef.current = false;
    setIsStopped(false);
    setIsDevComplete(false);
    setCurrentRunningStep(stepId);
    onStartNewSession?.(prompt, displayText);
  };

  // Stop - prevents next step from running
  const handleStop = () => {
    isStoppedRef.current = true;
    setIsStopped(true);
    if (currentRunningStep) {
      addLogEntry(currentRunningStep, 'error');
    }
    setCurrentRunningStep(null);
  };

  const handleClearLog = () => {
    setExecutionLog([]);
  };

  if (!projectPath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>프로젝트를 선택해주세요</p>
      </div>
    );
  }

  if (!isPlanningComplete) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">기획문서를 먼저 완료해주세요</p>
          <p className="text-sm text-muted-foreground">
            PRD, UX Design, Design Guide, TRD, Architecture, ERD 문서가 모두 완료되어야 개발을 시작할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  const isRunningWorkflow = currentRunningStep !== null && isSessionLoading;

  const getStepStatus = (stepId: string): 'idle' | 'running' | 'completed' => {
    if (currentRunningStep === stepId && isSessionLoading) return 'running';
    const completedLogs = executionLog.filter(log => log.stepId === stepId && log.status === 'completed');
    if (completedLogs.length > 0) return 'completed';
    return 'idle';
  };

  return (
    <div className="h-full flex flex-col">
      {/* 통일 헤더 */}
      <PanelHeader
        icon={<Code className="w-4 h-4" />}
        title="개발 워크플로우"
        badge={
          isDevComplete ? (
            <StatusBadge variant="success">완료</StatusBadge>
          ) : isRunningWorkflow ? (
            <StatusBadge variant="info" pulse>실행중</StatusBadge>
          ) : isStopped ? (
            <StatusBadge variant="warning">중지됨</StatusBadge>
          ) : (
            <StatusBadge variant="muted">대기</StatusBadge>
          )
        }
        actions={
          isRunningWorkflow ? (
            <Button onClick={handleStop} variant="outline" size="sm" className="gap-1.5 h-7">
              <Square className="h-3 w-3" />
              중지
            </Button>
          ) : null
        }
      />

      {/* 워크플로우 시각화 */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-center gap-2">
          {DEV_WORKFLOW_SEQUENCE.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStart(step.id, step.prompt, step.displayText)}
                  disabled={!onStartNewSession || isRunningWorkflow}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg transition-all',
                    'border hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                    status === 'running' && 'bg-primary/10 border-primary shadow-md',
                    status === 'completed' && 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
                    status === 'idle' && 'bg-background border-border hover:border-primary/50'
                  )}
                >
                  <div className="relative">
                    {status === 'running' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <PlayCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    status === 'running' && 'text-primary',
                    status === 'completed' && 'text-green-600 dark:text-green-400',
                    status === 'idle' && 'text-muted-foreground'
                  )}>
                    {step.title}
                  </span>
                </button>
                {index < DEV_WORKFLOW_SEQUENCE.length - 1 && (
                  <div className="flex items-center text-muted-foreground/50">
                    <div className="w-4 h-px bg-current" />
                    <div className="text-xs mx-1">→</div>
                    <div className="w-4 h-px bg-current" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 간단한 설명 */}
        <p className="text-xs text-center text-muted-foreground mt-3">
          각 단계를 클릭하여 시작 / 완료 후 자동으로 다음 단계 진행
        </p>
      </div>

      {/* 실행 로그 영역 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
          <span className="text-xs font-medium text-muted-foreground">
            실행 로그 {executionLog.length > 0 && `(${executionLog.length})`}
          </span>
          {executionLog.length > 0 && (
            <button
              onClick={handleClearLog}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="로그 지우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {executionLog.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {isDevComplete ? (
                <div className="text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 dark:text-green-400 font-medium">개발이 완료되었습니다</p>
                </div>
              ) : !currentRunningStep && !isStopped ? (
                <p>워크플로우 단계를 클릭하여 시작하세요</p>
              ) : !currentRunningStep && isStopped ? (
                <p>중지됨 - 다시 시작하려면 단계를 클릭하세요</p>
              ) : null}
            </div>
          ) : (
            executionLog.map((log) => (
              <div
                key={`${log.stepId}-${log.timestamp}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                  log.status === 'running' && "bg-primary/10",
                  log.status === 'completed' && "bg-green-50 dark:bg-green-900/20",
                  log.status === 'error' && "bg-red-50 dark:bg-red-900/20"
                )}
              >
                {log.status === 'running' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {log.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                {log.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <span className="flex-1 truncate">{log.stepTitle}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 개발 완료 시 하단 메시지 */}
      {isDevComplete && (
        <div className="flex-shrink-0 border-t p-4 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">모든 개발 작업이 완료되었습니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevDocsPanel;
