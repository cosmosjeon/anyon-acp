import React from 'react';
import { PlayCircle, Square, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDevWorkflow } from '@/hooks/useDevWorkflow';
import { DEV_WORKFLOW_SEQUENCE } from '@/constants/development';

interface DevDocsPanelProps {
  projectPath: string | undefined;
  isPlanningComplete: boolean;
  onSendPrompt: (prompt: string) => void;
}

export const DevDocsPanel: React.FC<DevDocsPanelProps> = ({
  projectPath,
  isPlanningComplete,
  onSendPrompt,
}) => {
  const {
    status,
    currentStep,
    cycleCount,
    error,
    isLoading,
    start,
    stop,
  } = useDevWorkflow(projectPath);

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

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">개발 워크플로우</h3>
          {status === 'running' && (
            <span className="text-xs text-muted-foreground">Cycle {cycleCount}</span>
          )}
        </div>

        {status === 'idle' && (
          <Button
            onClick={() => {
              // Start dev workflow (calls start_dev_workflow Rust command)
              start();
              // Also send the first prompt to chat
              const firstStep = DEV_WORKFLOW_SEQUENCE[0];
              onSendPrompt(firstStep.prompt);
            }}
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {isLoading ? '시작 중...' : '개발 시작'}
          </Button>
        )}

        {status === 'running' && (
          <Button onClick={stop} variant="outline" size="sm" className="gap-2">
            <Square className="h-4 w-4" />
            중지
          </Button>
        )}

        {status === 'completed' && (
          <span className="text-sm text-primary font-medium flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            완료!
          </span>
        )}

        {status === 'error' && (
          <Button onClick={() => start()} size="sm" variant="destructive" className="gap-2">
            다시 시작
          </Button>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center gap-2 justify-center mb-4">
        {DEV_WORKFLOW_SEQUENCE.map((step, index) => {
          const isCurrent = currentStep?.id === step.id;
          const currentIndex = currentStep
            ? DEV_WORKFLOW_SEQUENCE.findIndex((s) => s.id === currentStep.id)
            : -1;
          const isPast = currentIndex > index;

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                  isCurrent && 'bg-primary/10'
                )}
              >
                {isPast || status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    (isPast || isCurrent) && 'text-primary',
                    !isPast && !isCurrent && 'text-muted-foreground/60'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < DEV_WORKFLOW_SEQUENCE.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-px',
                    isPast ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded mb-4">
          {error}
        </div>
      )}

      {/* Status Message */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        {status === 'idle' && <p>개발 시작 버튼을 눌러 워크플로우를 시작하세요</p>}
        {status === 'running' && currentStep && <p>{currentStep.title} 실행 중...</p>}
        {status === 'completed' && <p>모든 개발 워크플로우가 완료되었습니다! 🎉</p>}
      </div>
    </div>
  );
};

export default DevDocsPanel;
