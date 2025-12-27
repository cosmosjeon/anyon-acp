import React, { useState, useCallback } from 'react';
import { History, X, RefreshCw, GitBranch, Save, AlertCircle } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { PanelHeader, StatusBadge } from '@/components/ui/panel-header';
import { useVersionControl } from '@/hooks/useVersionControl';
import { SnapshotTimeline } from './SnapshotTimeline';
import { CreateSnapshotDialog } from './CreateSnapshotDialog';
import { RevertConfirmDialog } from './RevertConfirmDialog';
import type { GitLogEntry } from '@/lib/api/git';

interface VersionControlPanelProps {
  projectPath: string | undefined;
  onClose: () => void;
}

/**
 * 버전 관리 패널 - 비개발자 친화적인 Git 인터페이스
 *
 * 용어:
 * - commit → 저장 시점
 * - branch → 버전
 * - uncommitted changes → 저장되지 않은 변경
 * - revert → 되돌리기
 */
export const VersionControlPanel: React.FC<VersionControlPanelProps> = ({
  projectPath,
  onClose,
}) => {
  const {
    commits,
    currentBranch,
    currentSha,
    hasChanges,
    changedFilesCount,
    isLoading,
    isCreatingSnapshot,
    isReverting,
    error,
    isGitRepo,
    refresh,
    createSnapshot,
    revertTo,
    getDiffSummary,
  } = useVersionControl(projectPath);

  // 다이얼로그 상태
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [targetCommit, setTargetCommit] = useState<GitLogEntry | null>(null);

  // 스냅샷 생성
  const handleCreateSnapshot = useCallback(async (message: string) => {
    await createSnapshot(message);
  }, [createSnapshot]);

  // 되돌리기 시작
  const handleRevertClick = useCallback((sha: string) => {
    const commit = commits.find(c => c.fullSha === sha);
    if (commit) {
      setTargetCommit(commit);
      setRevertDialogOpen(true);
    }
  }, [commits]);

  // 되돌리기 확인
  const handleRevertConfirm = useCallback(async () => {
    if (targetCommit) {
      await revertTo(targetCommit.fullSha);
      setTargetCommit(null);
    }
  }, [targetCommit, revertTo]);

  // Git 저장소가 아닌 경우
  if (!isGitRepo && !isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PanelHeader
          icon={<History className="w-4 h-4" />}
          title="버전 관리"
          actions={
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          }
        />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-2">버전 관리 사용 불가</h3>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            이 프로젝트에서는 버전 관리를 사용할 수 없습니다.
            프로젝트를 초기화해야 합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <PanelHeader
        icon={<History className="w-4 h-4" />}
        title="버전 관리"
        badge={
          hasChanges && (
            <StatusBadge variant="warning" pulse>
              저장 필요
            </StatusBadge>
          )
        }
        actions={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* 현재 상태 섹션 */}
      <div className="p-4 border-b border-border space-y-3">
        {/* 현재 버전 */}
        <div className="flex items-center gap-2 text-sm">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">현재 버전:</span>
          <span className="font-medium">{currentBranch || '-'}</span>
        </div>

        {/* 변경사항 알림 */}
        {hasChanges && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-400">
              저장되지 않은 변경 {changedFilesCount}개
            </span>
          </div>
        )}

        {/* 저장 버튼 */}
        <Button
          className="w-full"
          onClick={() => setCreateDialogOpen(true)}
          disabled={isCreatingSnapshot}
        >
          <Save className="w-4 h-4 mr-2" />
          현재 상태 저장하기
        </Button>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* 저장 시점 기록 헤더 */}
      <div className="px-4 py-2 border-b border-border">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          저장 시점 기록
        </h4>
      </div>

      {/* 타임라인 */}
      <SnapshotTimeline
        commits={commits}
        currentSha={currentSha}
        onRevert={handleRevertClick}
        isReverting={isReverting}
        isLoading={isLoading}
      />

      {/* 스냅샷 생성 다이얼로그 */}
      <CreateSnapshotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateSnapshot}
        changedFilesCount={changedFilesCount}
        isLoading={isCreatingSnapshot}
      />

      {/* 되돌리기 확인 다이얼로그 */}
      <RevertConfirmDialog
        open={revertDialogOpen}
        onOpenChange={setRevertDialogOpen}
        onConfirm={handleRevertConfirm}
        targetCommit={targetCommit}
        getDiffSummary={getDiffSummary}
        isLoading={isReverting}
      />
    </div>
  );
};

export default VersionControlPanel;
