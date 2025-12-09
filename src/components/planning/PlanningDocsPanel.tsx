import React, { useState, useCallback } from 'react';
import { CheckCircle2, ArrowRight, FileText, PlayCircle } from 'lucide-react';
import { VideoLoader } from '@/components/VideoLoader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlanningDocs } from '@/hooks/usePlanningDocs';
import { WORKFLOW_SEQUENCE, type WorkflowStep } from '@/constants/planning';
import { PlanningDocViewer } from './PlanningDocViewer';

interface PlanningDocsPanelProps {
  projectPath: string | undefined;
  onStartNewWorkflow: (workflowPrompt: string) => void;
  isSessionLoading?: boolean;
}

/**
 * Planning Documents Panel
 * Displays the 6-step workflow progress and document viewer
 */
export const PlanningDocsPanel: React.FC<PlanningDocsPanelProps> = ({
  projectPath,
  onStartNewWorkflow,
  isSessionLoading = false,
}) => {
  const { documents, isLoading, progress } = usePlanningDocs(projectPath);
  const [activeDocId, setActiveDocId] = useState<string>('prd');
  const [activeWorkflows, setActiveWorkflows] = useState<Set<string>>(new Set());

  // Clear active workflows when documents are created
  React.useEffect(() => {
    setActiveWorkflows(prev => {
      const updated = new Set(prev);
      documents.forEach(doc => {
        if (doc.exists) {
          updated.delete(doc.id);
        }
      });
      return updated;
    });
  }, [documents]);

  const activeDoc = documents.find(d => d.id === activeDocId);
  const activeStep = WORKFLOW_SEQUENCE.find(s => s.id === activeDocId);
  const activeStepIndex = WORKFLOW_SEQUENCE.findIndex(s => s.id === activeDocId);

  // Check if a tab is enabled (previous doc must exist)
  const isTabEnabled = useCallback((index: number): boolean => {
    if (index === 0) return true;
    const prevStep = WORKFLOW_SEQUENCE[index - 1];
    return documents.some(d => d.id === prevStep.id && d.exists);
  }, [documents]);

  // Handle tab click with lock check
  const handleTabClick = useCallback((stepId: string) => {
    const stepIndex = WORKFLOW_SEQUENCE.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    if (!isTabEnabled(stepIndex)) {
      return;
    }

    setActiveDocId(stepId);
  }, [isTabEnabled]);

  // Start workflow for a step
  const handleStartWorkflow = useCallback((step: WorkflowStep) => {
    setActiveWorkflows(prev => new Set(prev).add(step.id));
    onStartNewWorkflow(step.workflowId);
    setActiveDocId(step.id);
  }, [onStartNewWorkflow]);

  // Navigate to next/prev document
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = WORKFLOW_SEQUENCE.findIndex(s => s.id === activeDocId);
    if (direction === 'prev' && currentIndex > 0) {
      const prevStep = WORKFLOW_SEQUENCE[currentIndex - 1];
      if (isTabEnabled(currentIndex - 1)) {
        setActiveDocId(prevStep.id);
      }
    } else if (direction === 'next' && currentIndex < WORKFLOW_SEQUENCE.length - 1) {
      const nextStep = WORKFLOW_SEQUENCE[currentIndex + 1];
      if (isTabEnabled(currentIndex + 1)) {
        setActiveDocId(nextStep.id);
      }
    }
  }, [activeDocId, isTabEnabled]);

  if (!projectPath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>프로젝트를 선택해주세요</p>
      </div>
    );
  }

  if (isLoading && documents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <VideoLoader size="md" />
      </div>
    );
  }

  const canGoPrev = activeStepIndex > 0 && isTabEnabled(activeStepIndex - 1);
  const canGoNext = activeStepIndex < WORKFLOW_SEQUENCE.length - 1 && isTabEnabled(activeStepIndex + 1);

  return (
    <div className="h-full flex flex-col">
      {/* 상단 진행률 헤더 */}
      <div className="flex-shrink-0 border-b px-4 py-3 bg-muted/30">
        {/* 현재 문서 제목 + 진행률 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('prev')}
              disabled={!canGoPrev}
              className={cn(
                "p-1 rounded hover:bg-muted transition-colors",
                !canGoPrev && "opacity-30 cursor-not-allowed"
              )}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <span className="font-medium">
              {activeStep?.title || 'PRD'}
            </span>
            <span className="text-sm text-muted-foreground">
              ({activeStepIndex + 1}/{WORKFLOW_SEQUENCE.length})
            </span>
            <button
              onClick={() => handleNavigate('next')}
              disabled={!canGoNext}
              className={cn(
                "p-1 rounded hover:bg-muted transition-colors",
                !canGoNext && "opacity-30 cursor-not-allowed"
              )}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 완료 상태 */}
          {activeDoc?.exists && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>완료</span>
            </div>
          )}
        </div>

        {/* 프로그레스 바 */}
        <div className="relative">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>

          {/* 단계 인디케이터 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0">
            {WORKFLOW_SEQUENCE.map((step, index) => {
              const doc = documents.find(d => d.id === step.id);
              const isCompleted = doc?.exists;
              const isActive = activeDocId === step.id;
              const isEnabled = isTabEnabled(index);

              return (
                <button
                  key={step.id}
                  onClick={() => handleTabClick(step.id)}
                  disabled={!isEnabled}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-all",
                    isCompleted && "bg-primary border-primary",
                    !isCompleted && isEnabled && "bg-background border-muted-foreground/40",
                    !isCompleted && !isEnabled && "bg-muted border-muted-foreground/20",
                    isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isEnabled && "cursor-pointer hover:scale-110",
                    !isEnabled && "cursor-not-allowed"
                  )}
                  title={step.title}
                />
              );
            })}
          </div>
        </div>

        {/* 단계 레이블 (간소화) */}
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {WORKFLOW_SEQUENCE.map((step) => (
            <span key={step.id} className="w-8 text-center truncate">
              {step.title.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* 문서 콘텐츠 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeDoc?.exists && activeDoc.content ? (
          // 문서 내용 표시
          <PlanningDocViewer content={activeDoc.content} />
        ) : (
          // 작성 시작 프롬프트
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>

              {activeStep && (
                isTabEnabled(activeStepIndex) ? (
                  <>
                    <p className="text-lg font-medium mb-2">
                      {activeStep.title}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {progress.nextStep?.id === activeDocId
                        ? '버튼을 클릭하면 AI가 자동으로 문서 작성을 시작합니다'
                        : '이 문서를 다시 작성하려면 아래 버튼을 클릭하세요'}
                    </p>
                    <Button
                      onClick={() => handleStartWorkflow(activeStep)}
                      disabled={isSessionLoading || activeWorkflows.has(activeStep.id)}
                      size="lg"
                      className="gap-2 w-full max-w-xs"
                    >
                      {activeWorkflows.has(activeStep.id) ? (
                        <>
                          <VideoLoader size="sm" />
                          작성 중...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-5 w-5" />
                          {activeStep.title} 작성 시작
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">
                      {activeStep.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      이전 문서를 먼저 작성해주세요
                    </p>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 CTA 영역 */}
      {activeDoc?.exists && progress.nextStep && (
        <div className="flex-shrink-0 border-t p-4 bg-gradient-to-r from-primary/5 to-primary/10">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => {
              setActiveDocId(progress.nextStep!.id);
              handleStartWorkflow(progress.nextStep!);
            }}
            disabled={isSessionLoading || activeWorkflows.has(progress.nextStep.id)}
          >
            {activeWorkflows.has(progress.nextStep.id) ? (
              <>
                <VideoLoader size="sm" />
                작성 중...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                다음: {progress.nextStep.title} 작성하기
              </>
            )}
          </Button>
        </div>
      )}

      {/* 모든 문서 완료 메시지 */}
      {progress.isAllComplete && (
        <div className="flex-shrink-0 border-t p-4 bg-primary/5">
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">
              모든 기획 문서가 완료되었습니다
            </p>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            개발문서 탭에서 개발을 시작할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanningDocsPanel;
