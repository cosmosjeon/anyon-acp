import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react';
import { PlayCircle, Square, AlertCircle, CheckCircle2, Code, Trash2, Loader2, RefreshCw, ChevronRight, File, Clock, Circle } from '@/lib/icons';
import { PanelHeader, StatusBadge } from '@/components/ui/panel-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEV_WORKFLOW_SEQUENCE, getDevWorkflowPrompt } from '@/constants/development';
import { ANYON_DOCS } from '@/constants/paths';
import { api } from '@/lib/api';
import { useDevWorkflowStore, type BlockedTicket, type ExecutionLogEntry } from '@/stores/devWorkflowStore';

interface DevDocsPanelProps {
  projectPath: string | undefined;
  isPlanningComplete: boolean;
  onStartWorkflow?: (workflowPrompt: string, displayText?: string) => void;
  isSessionLoading?: boolean;
}

/**
 * Ref methods exposed by DevDocsPanel
 */
export interface DevDocsPanelRef {
  stop: () => void;
}

/**
 * Workflow state values (unified across pm-executor and pm-reviewer)
 */
type WorkflowState =
  | 'idle'           // 초기 상태
  | 'executing'      // pm-executor 실행 중
  | 'awaiting_review' // Wave 완료, 리뷰 대기
  | 'reviewing'      // pm-reviewer 실행 중
  | 'reviewed'       // 리뷰 완료, 다음 Wave 준비
  | 'completed';     // 전체 완료

/**
 * Progress data from execution-progress.md
 */
interface ProgressData {
  workflowState: WorkflowState;
  currentWave: string | null;
  currentEpic: string | null;
  completedWaves: number;
  totalWaves: number;
  completedTickets: number;
  totalTickets: number;
  overallProgress: number;
  lastUpdate: string | null;
  blockedTickets: number;
}

/**
 * Individual ticket progress tracking
 */
interface TicketProgress {
  ticketId: string;           // TICKET-001
  title: string;
  status: 'pending' | 'running' | 'completed' | 'blocked';
  epic: string;              // E01
  wave: string;              // E01-Wave1
  startTime?: number;
  endTime?: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  workflowState: 'idle',
  currentWave: null,
  currentEpic: null,
  completedWaves: 0,
  totalWaves: 0,
  completedTickets: 0,
  totalTickets: 0,
  overallProgress: 0,
  lastUpdate: null,
  blockedTickets: 0,
};

/**
 * Parse execution-progress.md to extract progress data
 */
const parseProgressFile = (content: string): ProgressData => {
  const data: ProgressData = { ...DEFAULT_PROGRESS };

  try {
    // workflow_state 추출
    const stateMatch = content.match(/workflow_state:\s*["']?(\w+)["']?/i);
    if (stateMatch) {
      data.workflowState = stateMatch[1] as WorkflowState;
    }

    // current_wave 추출
    const waveMatch = content.match(/current_wave:\s*["']?([^"'\n]+)["']?/i);
    if (waveMatch) {
      data.currentWave = waveMatch[1].trim();
    }

    // current_epic 추출
    const epicMatch = content.match(/current_epic:\s*["']?([^"'\n]+)["']?/i);
    if (epicMatch) {
      data.currentEpic = epicMatch[1].trim();
    }

    // completed_waves 추출
    const completedWavesMatch = content.match(/completed_waves:\s*(\d+)/i);
    if (completedWavesMatch) {
      data.completedWaves = parseInt(completedWavesMatch[1], 10);
    }

    // total_waves 추출 (여러 패턴 시도)
    const totalWavesMatch = content.match(/total_waves:\s*(\d+)/i) ||
                           content.match(/총 Wave:\s*(\d+)/i);
    if (totalWavesMatch) {
      data.totalWaves = parseInt(totalWavesMatch[1], 10);
    }

    // completed_tickets 추출
    const completedTicketsMatch = content.match(/completed_tickets:\s*(\d+)/i) ||
                                  content.match(/완료된 티켓:\s*(\d+)/i);
    if (completedTicketsMatch) {
      data.completedTickets = parseInt(completedTicketsMatch[1], 10);
    }

    // total_tickets 추출
    const totalTicketsMatch = content.match(/total_tickets:\s*(\d+)/i) ||
                              content.match(/총 티켓:\s*(\d+)/i);
    if (totalTicketsMatch) {
      data.totalTickets = parseInt(totalTicketsMatch[1], 10);
    }

    // overall_progress 추출
    const progressMatch = content.match(/overall_progress:\s*["']?(\d+)%?["']?/i);
    if (progressMatch) {
      data.overallProgress = parseInt(progressMatch[1], 10);
    }

    // last_update 추출
    const updateMatch = content.match(/last_update:\s*["']?([^"'\n]+)["']?/i);
    if (updateMatch) {
      data.lastUpdate = updateMatch[1].trim();
    }

    // blocked 티켓 수 추출
    const blockedMatch = content.match(/blocked:\s*(\d+)/i) ||
                         content.match(/Blocked:\s*(\d+)/i);
    if (blockedMatch) {
      data.blockedTickets = parseInt(blockedMatch[1], 10);
    }
  } catch (error) {
    console.error('[DevDocsPanel] Error parsing progress file:', error);
  }

  return data;
};

/**
 * Extract ticket progress from execution-progress.md content
 */
const extractTicketsFromProgress = (content: string): TicketProgress[] => {
  const tickets: TicketProgress[] = [];

  try {
    // 티켓 상태 섹션 찾기 (여러 패턴 시도)
    const ticketSectionPattern = /##?\s*(?:티켓|Ticket)\s*(?:상태|Status|Progress)[\s\S]*?(?=##|$)/i;
    const ticketSection = content.match(ticketSectionPattern);

    if (ticketSection) {
      // TICKET-XXX: 제목 [상태] 형식 파싱
      const ticketPattern = /(TICKET-\d+):\s*([^\[\n]+)\s*\[([^\]]+)\]/g;
      let match;

      while ((match = ticketPattern.exec(ticketSection[0])) !== null) {
        const [, ticketId, title, statusText] = match;
        let status: TicketProgress['status'] = 'pending';

        if (statusText.includes('완료') || statusText.includes('completed')) {
          status = 'completed';
        } else if (statusText.includes('실행') || statusText.includes('running')) {
          status = 'running';
        } else if (statusText.includes('blocked') || statusText.includes('차단')) {
          status = 'blocked';
        }

        tickets.push({
          ticketId,
          title: title.trim(),
          status,
          epic: '',  // Epic은 별도로 추출 가능하면 설정
          wave: '',  // Wave는 currentWave에서 가져올 수 있음
        });
      }
    }
  } catch (error) {
    console.error('[DevDocsPanel] Error extracting tickets:', error);
  }

  return tickets;
};

/**
 * Extract generated files from execution-progress.md content
 */
const extractGeneratedFiles = (content: string): string[] => {
  const files: string[] = [];

  try {
    // 생성된 파일 섹션 찾기
    const filesPattern = /(?:📂|##)\s*(?:Generated|생성된)\s*(?:Artifacts|Files|파일)[\s\S]*?(?=##|$)/i;
    const filesSection = content.match(filesPattern);

    if (filesSection) {
      // - 또는 * 로 시작하는 파일 경로 추출
      const fileLinePattern = /[-*]\s+([^\n]+)/g;
      let match;

      while ((match = fileLinePattern.exec(filesSection[0])) !== null) {
        const filePath = match[1].trim();
        // 파일 경로로 보이는 것만 추가 (/ 또는 . 포함)
        if (filePath.includes('/') || filePath.includes('.')) {
          files.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error('[DevDocsPanel] Error extracting files:', error);
  }

  return files;
};

/**
 * Extract blocked tickets from execution-progress.md content
 */
const extractBlockedTickets = (content: string): BlockedTicket[] => {
  const blockedTickets: BlockedTicket[] = [];

  try {
    // Blocked 티켓 섹션 찾기
    const blockedPattern = /##?\s*Blocked\s*(?:티켓|Tickets)[\s\S]*?(?=##|$)/i;
    const blockedSection = content.match(blockedPattern);

    if (blockedSection) {
      // TICKET-XXX: 제목 - 원인: ... 형식 파싱
      const ticketPattern = /(TICKET-\d+):\s*([^\n-]+)(?:-\s*(?:원인|Reason):\s*([^\n]+))?/g;
      let match;

      while ((match = ticketPattern.exec(blockedSection[0])) !== null) {
        const [, id, title, reason] = match;
        blockedTickets.push({
          id,
          title: title.trim(),
          reason: reason ? reason.trim() : '알 수 없음',
        });
      }
    }
  } catch (error) {
    console.error('[DevDocsPanel] Error extracting blocked tickets:', error);
  }

  return blockedTickets;
};

/**
 * Get next workflow step based on current step
 * Orchestrator는 수동, Executor ↔ Reviewer만 자동 반복
 */
const getNextStep = (currentStepId: string): typeof DEV_WORKFLOW_SEQUENCE[0] | null => {
  // Orchestrator → 수동 (자동 전환 안 함)
  if (currentStepId === 'pm-orchestrator') {
    return null; // 사용자가 Executor 버튼을 직접 눌러야 함
  }
  // Executor → Reviewer (자동)
  if (currentStepId === 'pm-executor') {
    return DEV_WORKFLOW_SEQUENCE[2]; // pm-reviewer
  }
  // Reviewer → Executor (자동, cycle back)
  if (currentStepId === 'pm-reviewer') {
    return DEV_WORKFLOW_SEQUENCE[1]; // pm-executor
  }
  return null;
};

export const DevDocsPanel = forwardRef<DevDocsPanelRef, DevDocsPanelProps>(({
  projectPath,
  isPlanningComplete,
  onStartWorkflow,
  isSessionLoading = false,
}, ref) => {
  const projectKey = projectPath ?? '__unknown__';
  const prevLoadingRef = useRef(isSessionLoading);
  const isStoppedRef = useRef(false);
  const emptyLogsRef = useRef<ExecutionLogEntry[]>([]);
  const emptyExpandedLogsRef = useRef<Set<number>>(new Set());
  const [, forceUpdate] = useState(0);
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [currentWaveTickets, setCurrentWaveTickets] = useState<TicketProgress[]>([]);

  const executionLog = useDevWorkflowStore(
    (state) => state.executionLogs[projectKey] ?? emptyLogsRef.current
  );
  const currentRunningStep = useDevWorkflowStore(
    (state) => state.currentRunningSteps[projectKey] ?? null
  );
  const expandedLogs = useDevWorkflowStore(
    (state) => state.expandedLogs[projectKey] ?? emptyExpandedLogsRef.current
  );
  const isDevComplete = useDevWorkflowStore(
    (state) => state.isDevComplete[projectKey] ?? false
  );
  const isOrchestratorComplete = useDevWorkflowStore(
    (state) => state.isOrchestratorComplete[projectKey] ?? false
  );

  const appendLogEntry = useDevWorkflowStore((state) => state.appendLogEntry);
  const clearLogs = useDevWorkflowStore((state) => state.clearLogs);
  const setCurrentRunningStep = useDevWorkflowStore((state) => state.setCurrentRunningStep);
  const toggleExpandedLog = useDevWorkflowStore((state) => state.toggleExpandedLog);
  const setIsDevComplete = useDevWorkflowStore((state) => state.setIsDevComplete);
  const setIsOrchestratorComplete = useDevWorkflowStore((state) => state.setIsOrchestratorComplete);

  // execution-progress.md 파일 읽기
  const loadProgressData = useCallback(async () => {
    if (!projectPath) return;

    try {
      const progressFilePath = `${projectPath}/${ANYON_DOCS.DEV_PLAN}/${ANYON_DOCS.DEV_FILES.EXECUTION_PROGRESS}`;
      const content = await api.readFileContent(progressFilePath);
      if (content) {
        const parsed = parseProgressFile(content);
        setProgressData(parsed);

        // 티켓 진행 상황 추출
        const tickets = extractTicketsFromProgress(content);
        if (tickets.length > 0) {
          // currentWave 정보 추가
          const ticketsWithWave = tickets.map(t => ({
            ...t,
            wave: parsed.currentWave || '',
            epic: parsed.currentEpic || '',
          }));
          setCurrentWaveTickets(ticketsWithWave);
        }

        // 완료 상태 체크
        if (parsed.workflowState === 'completed') {
          setIsDevComplete(projectKey, true);
        }
      }
    } catch (error) {
      // 파일이 없으면 초기 상태 유지
      console.debug('[DevDocsPanel] Progress file not found or error:', error);
    }
  }, [projectPath]);

  // 컴포넌트 마운트 시 및 주기적으로 progress 로드
  useEffect(() => {
    loadProgressData();

    // 워크플로우 실행 중일 때는 5초마다 업데이트
    const interval = currentRunningStep ? setInterval(loadProgressData, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadProgressData, currentRunningStep]);

  const addLogEntry = async (
    stepId: string,
    status: ExecutionLogEntry['status'],
    waveInfo?: string,
    additionalData?: {
      ticketsCompleted?: number;
      ticketsTotal?: number;
      ticketsBlocked?: number;
      generatedFiles?: string[];
      blockedTickets?: BlockedTicket[];
    }
  ) => {
    const step = DEV_WORKFLOW_SEQUENCE.find(s => s.id === stepId);
    if (step) {
      const timestamp = Date.now();

      // 완료 상태일 때 duration 계산
      let duration: number | undefined;
      if (status === 'completed') {
        const runningLog = executionLog.find(
          log => log.stepId === stepId && log.status === 'running' && !log.duration
        );
        if (runningLog && runningLog.startTime) {
          duration = timestamp - runningLog.startTime;
        }
      }

      // 실행 중일 때는 파일에서 추가 데이터 로드
      let files: string[] | undefined;
      let blocked: BlockedTicket[] | undefined;

      if (status === 'completed' && projectPath) {
        try {
          const progressFilePath = `${projectPath}/${ANYON_DOCS.DEV_PLAN}/${ANYON_DOCS.DEV_FILES.EXECUTION_PROGRESS}`;
          const content = await api.readFileContent(progressFilePath);
          if (content) {
            files = extractGeneratedFiles(content);
            blocked = extractBlockedTickets(content);
          }
        } catch (error) {
          // 파일 읽기 실패는 무시
        }
      }

      appendLogEntry(projectKey, {
        stepId,
        stepTitle: step.title,
        status,
        timestamp,
        waveInfo,
        duration,
        startTime: status === 'running' ? timestamp : undefined,
        ticketsCompleted: additionalData?.ticketsCompleted,
        ticketsTotal: additionalData?.ticketsTotal,
        ticketsBlocked: additionalData?.ticketsBlocked,
        generatedFiles: files || additionalData?.generatedFiles,
        blockedTickets: blocked || additionalData?.blockedTickets,
      });
    }
  };

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const isNowDone = wasLoading && !isSessionLoading;
    prevLoadingRef.current = isSessionLoading;

    // 🛑 중지 상태 체크 - 중지되었으면 자동 진행 안 함
    if (isStoppedRef.current) {
      return;
    }

    if (isNowDone && currentRunningStep) {
      const checkAndContinue = async () => {
        // 🛑 중지 상태 체크
        if (isStoppedRef.current || !projectPath) return;

        try {
          // 1. Progress 데이터 새로고침 (await으로 완료 대기)
          await loadProgressData();

          // 2. 로그 기록 (업데이트된 progressData 사용)
          addLogEntry(currentRunningStep, 'completed', progressData.currentWave || undefined);

          // 3. 전체 개발 완료 체크
          const completeFilePath = `${projectPath}/${ANYON_DOCS.DEV_PLAN}/${ANYON_DOCS.DEV_FILES.COMPLETE_MARKER}`;
          const isComplete = await api.checkFileExists(completeFilePath);

          if (isComplete) {
            setIsDevComplete(projectKey, true);
            setCurrentRunningStep(projectKey, null);
            setProgressData(prev => ({ ...prev, workflowState: 'completed' }));
            return;
          }

          // 4. Orchestrator 완료 체크 (UI 표시용)
          const orchestratorCompleteFile = `${projectPath}/${ANYON_DOCS.DEV_PLAN}/ORCHESTRATOR_COMPLETE.md`;
          const isOrchComplete = await api.checkFileExists(orchestratorCompleteFile);
          if (isOrchComplete) {
            setIsOrchestratorComplete(projectKey, true);
          }

          // 🛑 중지 상태 재확인 (async 작업 중 중지 눌렀을 수 있음)
          if (isStoppedRef.current) return;

          // 5. 다음 단계 결정 및 자동 실행
          const nextStep = getNextStep(currentRunningStep);
          
          // Executor → Reviewer 전환 시 workflow_state 검증
          if (currentRunningStep === 'pm-executor' && nextStep?.id === 'pm-reviewer') {
            // execution-progress.md에서 workflow_state 확인
            const progressPath = `${projectPath}/${ANYON_DOCS.DEV_PLAN}/execution-progress.md`;
            const progressContent = await api.readFileContent(progressPath);
            const stateMatch = progressContent.match(/workflow_state:\s*["']?(\w+)["']?/i);
            const workflowState = stateMatch ? stateMatch[1] : null;

            if (workflowState !== 'awaiting_review') {
              console.warn('[DevDocsPanel] Executor finished but workflow_state is not "awaiting_review". Skipping auto-transition to Reviewer.');
              setCurrentRunningStep(projectKey, null);
              return;
            }
          }

          if (nextStep) {
            setTimeout(() => {
              // 🛑 중지 상태 마지막 확인 (setTimeout 대기 중 중지 눌렀을 수 있음)
              if (!isStoppedRef.current) {
                setCurrentRunningStep(projectKey, nextStep.id);
                addLogEntry(nextStep.id, 'running', progressData.currentWave || undefined);
                onStartWorkflow?.(getDevWorkflowPrompt(nextStep), nextStep.displayText);
              }
            }, 500);
          } else {
            // 다음 단계가 없으면 (Orchestrator 완료 등) currentRunningStep 초기화
            setCurrentRunningStep(projectKey, null);
          }
        } catch (error) {
          console.error('[DevDocsPanel] Error checking workflow completion:', error);
          setCurrentRunningStep(projectKey, null);
        }
      };

      checkAndContinue();
    }
  }, [isSessionLoading, currentRunningStep, onStartWorkflow, projectPath, loadProgressData, progressData.currentWave]);

  const handleStart = (stepId: string, workflowPrompt: string, displayText?: string) => {
    isStoppedRef.current = false;
    forceUpdate(n => n + 1);
    setIsDevComplete(projectKey, false);
    setCurrentRunningStep(projectKey, stepId);
    addLogEntry(stepId, 'running', progressData.currentWave || undefined);
    onStartWorkflow?.(workflowPrompt, displayText);
  };

  const handleStop = () => {
    isStoppedRef.current = true;
    forceUpdate(n => n + 1);
    if (currentRunningStep) {
      addLogEntry(currentRunningStep, 'error');
    }
    setCurrentRunningStep(projectKey, null);
  };

  // Expose stop method to parent via ref
  useImperativeHandle(ref, () => ({
    stop: handleStop,
  }), [handleStop]);

  const handleClearLog = () => {
    clearLogs(projectKey);
  };

  const handleRefreshProgress = () => {
    loadProgressData();
  };

  const toggleLogExpanded = (timestamp: number) => {
    toggleExpandedLog(projectKey, timestamp);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    }
    return `${seconds}초`;
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
    // pm-orchestrator is completed if marker file exists
    if (stepId === 'pm-orchestrator' && isOrchestratorComplete) {
      return 'completed';
    }

    if (currentRunningStep === stepId && isSessionLoading) return 'running';
    const completedLogs = executionLog.filter(log => log.stepId === stepId && log.status === 'completed');
    if (completedLogs.length > 0) return 'completed';
    return 'idle';
  };

  // 진행률 계산
  const progressPercent = progressData.totalTickets > 0
    ? Math.round((progressData.completedTickets / progressData.totalTickets) * 100)
    : progressData.overallProgress;

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <PanelHeader
        icon={<Code className="w-4 h-4" />}
        title="개발 워크플로우"
        badge={
          isDevComplete ? (
            <StatusBadge variant="success">완료</StatusBadge>
          ) : isOrchestratorComplete && !isRunningWorkflow ? (
            <StatusBadge variant="success">기획 완료</StatusBadge>
          ) : isRunningWorkflow ? (
            <StatusBadge variant="info" pulse>실행중</StatusBadge>
          ) : isStoppedRef.current ? (
            <StatusBadge variant="warning">중지됨</StatusBadge>
          ) : progressData.workflowState === 'awaiting_review' ? (
            <StatusBadge variant="info">리뷰 대기</StatusBadge>
          ) : progressData.workflowState === 'reviewed' ? (
            <StatusBadge variant="success">리뷰 완료</StatusBadge>
          ) : (
            <StatusBadge variant="muted">대기</StatusBadge>
          )
        }
        actions={
          <div className="flex items-center gap-1">
            <Button
              onClick={handleRefreshProgress}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="진행상황 새로고침"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            {isRunningWorkflow && (
              <Button onClick={handleStop} variant="outline" size="sm" className="gap-1.5 h-7">
                <Square className="h-3 w-3" />
                중지
              </Button>
            )}
          </div>
        }
      />

      {/* Wave 진행률 표시 */}
      {(progressData.totalWaves > 0 || progressData.currentWave) && (
        <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
          <div className="space-y-2">
            {/* 현재 Wave 정보 */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">현재:</span>
                <span className="font-medium">
                  {progressData.currentWave || '대기 중'}
                </span>
                {progressData.currentEpic && (
                  <span className="text-xs text-muted-foreground">
                    ({progressData.currentEpic})
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {progressData.lastUpdate && (
                  <span>마지막 업데이트: {new Date(progressData.lastUpdate).toLocaleTimeString('ko-KR')}</span>
                )}
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  전체 진행률
                </span>
                <span className="font-medium">
                  {progressPercent}%
                  {progressData.totalTickets > 0 && (
                    <span className="text-muted-foreground ml-1">
                      ({progressData.completedTickets}/{progressData.totalTickets} 티켓)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Wave 통계 */}
            {progressData.totalWaves > 0 && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Wave: {progressData.completedWaves}/{progressData.totalWaves}
                </span>
                {progressData.blockedTickets > 0 && (
                  <span className="text-amber-500">
                    ⚠️ Blocked: {progressData.blockedTickets}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 워크플로우 시각화 */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-center gap-2">
          {DEV_WORKFLOW_SEQUENCE.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStart(step.id, getDevWorkflowPrompt(step), step.displayText)}
                  disabled={!onStartWorkflow || isRunningWorkflow}
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

        {/* Orchestrator 완료 시 Executor 버튼 클릭 유도 */}
        {isOrchestratorComplete && !currentRunningStep && !isDevComplete && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  기획 문서 생성 완료!
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  개발을 시작하려면 <span className="font-semibold">PM Executor</span> 버튼을 클릭하세요
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-3">
          {isOrchestratorComplete 
            ? "Executor ↔ Reviewer는 자동 반복 / Orchestrator는 수동"
            : "각 단계를 클릭하여 시작 / Executor ↔ Reviewer는 자동 반복"
          }
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

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* 현재 Wave 티켓 진행 상황 */}
          {currentWaveTickets.length > 0 && (
            <div className="border border-border bg-muted/30 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  현재 Wave: {progressData.currentWave || '대기 중'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentWaveTickets.filter(t => t.status === 'completed').length}/{currentWaveTickets.length} 완료
                </span>
              </div>
              <div className="space-y-1.5">
                {currentWaveTickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className="flex items-center gap-2 text-xs"
                  >
                    {ticket.status === 'completed' && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                    {ticket.status === 'running' && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600 flex-shrink-0" />
                    )}
                    {ticket.status === 'blocked' && (
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    )}
                    {ticket.status === 'pending' && (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">
                      {ticket.ticketId}: {ticket.title}
                    </span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      ticket.status === 'completed' && "bg-green-500/10 text-green-600",
                      ticket.status === 'running' && "bg-purple-500/10 text-purple-600",
                      ticket.status === 'blocked' && "bg-amber-500/10 text-amber-600",
                      ticket.status === 'pending' && "bg-muted text-muted-foreground"
                    )}>
                      {ticket.status === 'completed' && '완료'}
                      {ticket.status === 'running' && '실행중'}
                      {ticket.status === 'blocked' && 'Blocked'}
                      {ticket.status === 'pending' && '대기'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 로그 항목 */}
          {executionLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-4">
              {isDevComplete ? (
                <div className="text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 dark:text-green-400 font-medium">개발이 완료되었습니다</p>
                </div>
              ) : (
                <div className="text-center space-y-2 px-4">
                  <p className="font-medium">워크플로우 단계를 클릭하여 시작하세요</p>
                  <p className="text-xs text-muted-foreground">
                    중간에 멈추면 이어서 해달라고 말하거나<br />
                    같은 버튼을 한번 더 눌러주세요
                  </p>
                </div>
              )}
            </div>
          ) : (
            executionLog.map((log) => {
              const isExpanded = expandedLogs.has(log.timestamp);
              const hasDetails = log.generatedFiles || log.blockedTickets || log.ticketsCompleted;

              return (
                <div
                  key={`${log.stepId}-${log.timestamp}`}
                  className={cn(
                    "border rounded-lg transition-all",
                    log.status === 'running' && "border-purple-500/20 bg-purple-500/5",
                    log.status === 'completed' && "border-green-500/20 bg-green-500/5",
                    log.status === 'error' && "border-red-500/20 bg-red-500/5"
                  )}
                >
                  {/* 카드 기본 정보 */}
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      {/* 상태 아이콘 */}
                      <div className="flex-shrink-0 mt-0.5">
                        {log.status === 'running' && (
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        )}
                        {log.status === 'completed' && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                        {log.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>

                      {/* 제목 및 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {log.stepTitle}
                          </span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full flex-shrink-0",
                            log.status === 'running' && "bg-purple-500/10 text-purple-600",
                            log.status === 'completed' && "bg-green-500/10 text-green-600",
                            log.status === 'error' && "bg-red-500/10 text-red-600"
                          )}>
                            {log.status === 'running' && '실행중'}
                            {log.status === 'completed' && '완료'}
                            {log.status === 'error' && '에러'}
                          </span>
                        </div>

                        {/* Wave 정보 및 통계 */}
                        {log.waveInfo && (
                          <div className="text-xs text-muted-foreground mb-1">
                            Wave: {log.waveInfo}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {/* 티켓 진행률 */}
                          {log.ticketsTotal && log.ticketsTotal > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {log.ticketsCompleted || 0}/{log.ticketsTotal} 완료
                            </span>
                          )}

                          {/* Blocked 티켓 수 */}
                          {log.ticketsBlocked && log.ticketsBlocked > 0 && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              {log.ticketsBlocked} Blocked
                            </span>
                          )}

                          {/* 소요 시간 */}
                          {log.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(log.duration)}
                            </span>
                          )}

                          {/* 시간 */}
                          <span className="ml-auto">
                            {new Date(log.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* 펼침/접힘 버튼 */}
                      {hasDetails && (
                        <button
                          onClick={() => toggleLogExpanded(log.timestamp)}
                          className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {/* 상세 정보 (펼침 시) */}
                    {isExpanded && hasDetails && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {/* 생성된 파일 */}
                        {log.generatedFiles && log.generatedFiles.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium mb-1">
                              <File className="h-3 w-3" />
                              생성된 파일 ({log.generatedFiles.length}개)
                            </div>
                            <div className="space-y-0.5 ml-4">
                              {log.generatedFiles.slice(0, 5).map((file, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground font-mono">
                                  {file}
                                </div>
                              ))}
                              {log.generatedFiles.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  + {log.generatedFiles.length - 5}개 더보기
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Blocked 티켓 상세 */}
                        {log.blockedTickets && log.blockedTickets.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium mb-1 text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              Blocked 티켓 ({log.blockedTickets.length}개)
                            </div>
                            <div className="space-y-1.5 ml-4">
                              {log.blockedTickets.map((ticket) => (
                                <div key={ticket.id} className="text-xs">
                                  <div className="font-medium">{ticket.id}: {ticket.title}</div>
                                  <div className="text-muted-foreground">원인: {ticket.reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {/* 로그가 있을 때 하단 안내 메시지 */}
          {executionLog.length > 0 && !isDevComplete && (
            <div className="mt-4 p-3 border border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-xs text-center text-muted-foreground">
                💡 중간에 멈추면 이어서 해달라고 말하거나 같은 버튼을 한번 더 눌러주세요
              </p>
            </div>
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
});

export default DevDocsPanel;
