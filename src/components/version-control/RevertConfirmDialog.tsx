import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Loader2 } from '@/lib/icons';
import type { GitLogEntry, GitDiffSummary } from '@/lib/api/git';

interface RevertConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  targetCommit: GitLogEntry | null;
  getDiffSummary: (sha: string) => Promise<GitDiffSummary | null>;
  isLoading: boolean;
}

/**
 * 상대적 시간 포맷팅 (한글)
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

/**
 * 되돌리기 확인 다이얼로그
 */
export const RevertConfirmDialog: React.FC<RevertConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  targetCommit,
  getDiffSummary,
  isLoading,
}) => {
  const [diffSummary, setDiffSummary] = useState<GitDiffSummary | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // 다이얼로그 열릴 때 diff 정보 가져오기
  useEffect(() => {
    if (open && targetCommit) {
      setLoadingDiff(true);
      getDiffSummary(targetCommit.fullSha)
        .then(setDiffSummary)
        .finally(() => setLoadingDiff(false));
    } else {
      setDiffSummary(null);
    }
  }, [open, targetCommit, getDiffSummary]);

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  if (!targetCommit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            이 시점으로 되돌리기
          </DialogTitle>
          <DialogDescription>
            <strong>{formatRelativeTime(targetCommit.timestamp)}</strong>의 상태로 되돌립니다
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 대상 커밋 정보 */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">
              "{targetCommit.message || '(설명 없음)'}"
            </p>
            <p className="text-xs text-muted-foreground">
              {targetCommit.sha} · {targetCommit.author}
            </p>
          </div>

          {/* 경고 메시지 */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                {loadingDiff ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    변경 내용 확인 중...
                  </span>
                ) : diffSummary ? (
                  <>
                    <strong>{diffSummary.commits_to_rollback}개의 저장 시점</strong>이 삭제되고,{' '}
                    <strong>{diffSummary.files_changed}개의 파일</strong>이 변경됩니다.
                    <p className="mt-1 text-amber-600/80 dark:text-amber-500/80">
                      이 작업은 되돌릴 수 없습니다.
                    </p>
                  </>
                ) : (
                  <>
                    현재 변경사항이 모두 삭제됩니다.
                    <p className="mt-1 text-amber-600/80 dark:text-amber-500/80">
                      이 작업은 되돌릴 수 없습니다.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || loadingDiff}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                되돌리는 중...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                되돌리기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevertConfirmDialog;
