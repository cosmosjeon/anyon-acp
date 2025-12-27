import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SnapshotItem } from './SnapshotItem';
import type { GitLogEntry } from '@/lib/api/git';

interface SnapshotTimelineProps {
  commits: GitLogEntry[];
  currentSha: string;
  onRevert: (sha: string) => void;
  isReverting: boolean;
  isLoading: boolean;
}

/**
 * 저장 시점 타임라인 컴포넌트
 */
export const SnapshotTimeline: React.FC<SnapshotTimelineProps> = ({
  commits,
  currentSha,
  onRevert,
  isReverting,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          아직 저장된 시점이 없습니다
        </p>
        <p className="text-xs text-muted-foreground/70">
          첫 스냅샷을 만들어보세요!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        {/* 타임라인 선 */}
        <div className="relative">
          <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />

          {/* 커밋 목록 */}
          {commits.map((commit) => (
            <SnapshotItem
              key={commit.fullSha}
              commit={commit}
              isHead={commit.fullSha === currentSha}
              onRevert={onRevert}
              isReverting={isReverting}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default SnapshotTimeline;
