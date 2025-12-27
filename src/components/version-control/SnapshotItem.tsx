import React from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import type { GitLogEntry } from '@/lib/api/git';

interface SnapshotItemProps {
  commit: GitLogEntry;
  isHead: boolean;
  onRevert: (sha: string) => void;
  isReverting: boolean;
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
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}개월 전`;
  if (weeks > 0) return `${weeks}주 전`;
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

/**
 * 개별 스냅샷 항목 컴포넌트
 */
export const SnapshotItem: React.FC<SnapshotItemProps> = ({
  commit,
  isHead,
  onRevert,
  isReverting,
}) => {
  return (
    <div className="group relative pl-6">
      {/* 타임라인 점 */}
      <div
        className={cn(
          'absolute left-0 top-1.5 w-3 h-3 rounded-full border-2',
          isHead
            ? 'bg-primary border-primary'
            : 'bg-background border-muted-foreground/40 group-hover:border-muted-foreground'
        )}
      />

      {/* 내용 */}
      <div className="pb-4">
        {/* 시간 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(commit.timestamp)}
          </span>
          {isHead && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              현재
            </span>
          )}
        </div>

        {/* 메시지 */}
        <p className="text-sm text-foreground line-clamp-2 mb-1">
          {commit.message || '(설명 없음)'}
        </p>

        {/* 되돌리기 버튼 - hover 시 표시 */}
        {!isHead && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity',
              'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onRevert(commit.fullSha)}
            disabled={isReverting}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            이 시점으로 되돌리기
          </Button>
        )}
      </div>
    </div>
  );
};

export default SnapshotItem;
