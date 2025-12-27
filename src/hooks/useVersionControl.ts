import { useState, useEffect, useCallback, useRef } from 'react';
import { gitApi, type GitLogEntry, type GitDiffSummary } from '@/lib/api/git';

export interface VersionControlState {
  // 데이터
  commits: GitLogEntry[];
  currentBranch: string;
  currentSha: string;
  hasChanges: boolean;
  changedFilesCount: number;

  // 로딩 상태
  isLoading: boolean;
  isCreatingSnapshot: boolean;
  isReverting: boolean;

  // 에러 상태
  error: string | null;
  isGitRepo: boolean;
}

export interface VersionControlActions {
  refresh: () => Promise<void>;
  createSnapshot: (message: string) => Promise<boolean>;
  revertTo: (sha: string) => Promise<boolean>;
  getDiffSummary: (targetSha: string) => Promise<GitDiffSummary | null>;
}

const INITIAL_STATE: VersionControlState = {
  commits: [],
  currentBranch: '',
  currentSha: '',
  hasChanges: false,
  changedFilesCount: 0,
  isLoading: true,
  isCreatingSnapshot: false,
  isReverting: false,
  error: null,
  isGitRepo: true,
};

/**
 * 버전 관리 훅 - 비개발자 친화적인 Git 인터페이스
 *
 * 용어 매핑:
 * - commits → 저장 시점
 * - branch → 버전
 * - uncommitted changes → 저장되지 않은 변경
 * - revert → 되돌리기
 */
export function useVersionControl(
  projectPath: string | undefined
): VersionControlState & VersionControlActions {
  const [state, setState] = useState<VersionControlState>(INITIAL_STATE);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 전체 상태 새로고침
  const refresh = useCallback(async () => {
    if (!projectPath) {
      setState(prev => ({ ...prev, isLoading: false, isGitRepo: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 병렬로 모든 정보 가져오기
      const [commits, branch, headSha, hasChanges, changesCount] = await Promise.all([
        gitApi.getLog(projectPath, 50).catch(() => []),
        gitApi.getCurrentBranch(projectPath).catch(() => ''),
        gitApi.getHeadSha(projectPath).catch(() => ''),
        gitApi.hasUncommittedChanges(projectPath).catch(() => false),
        gitApi.getChangesCount(projectPath).catch(() => 0),
      ]);

      // Git 저장소인지 확인 (branch가 비어있으면 git repo가 아님)
      const isGitRepo = branch !== '' || commits.length > 0;

      setState({
        commits,
        currentBranch: branch,
        currentSha: headSha,
        hasChanges,
        changedFilesCount: changesCount,
        isLoading: false,
        isCreatingSnapshot: false,
        isReverting: false,
        error: null,
        isGitRepo,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '버전 정보를 불러오는데 실패했습니다';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isGitRepo: false,
      }));
    }
  }, [projectPath]);

  // 스냅샷 생성 (git add + commit)
  const createSnapshot = useCallback(async (message: string): Promise<boolean> => {
    if (!projectPath) return false;

    setState(prev => ({ ...prev, isCreatingSnapshot: true, error: null }));

    try {
      // 모든 변경사항 스테이징
      const addResult = await gitApi.addAll(projectPath);
      if (!addResult.success) {
        throw new Error(addResult.stderr || '파일 스테이징에 실패했습니다');
      }

      // 커밋 생성
      const commitResult = await gitApi.commit(projectPath, message);
      if (!commitResult.success) {
        throw new Error(commitResult.stderr || '저장에 실패했습니다');
      }

      // 상태 새로고침
      await refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '저장에 실패했습니다';
      setState(prev => ({
        ...prev,
        isCreatingSnapshot: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [projectPath, refresh]);

  // 특정 시점으로 되돌리기 (git reset --hard)
  const revertTo = useCallback(async (sha: string): Promise<boolean> => {
    if (!projectPath) return false;

    setState(prev => ({ ...prev, isReverting: true, error: null }));

    try {
      await gitApi.resetHard(projectPath, sha);
      await refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '되돌리기에 실패했습니다';
      setState(prev => ({
        ...prev,
        isReverting: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [projectPath, refresh]);

  // 되돌리기 전 diff 요약 가져오기
  const getDiffSummary = useCallback(async (targetSha: string): Promise<GitDiffSummary | null> => {
    if (!projectPath) return null;

    try {
      return await gitApi.getDiffSummary(projectPath, targetSha);
    } catch {
      return null;
    }
  }, [projectPath]);

  // 마운트 시 초기 로드 및 주기적 새로고침
  useEffect(() => {
    refresh();

    // 30초마다 변경사항 확인 (패널이 열려있을 때만)
    refreshIntervalRef.current = setInterval(() => {
      if (projectPath) {
        // 간단히 변경사항 개수만 확인 (전체 refresh보다 가벼움)
        gitApi.getChangesCount(projectPath)
          .then(count => {
            setState(prev => ({
              ...prev,
              changedFilesCount: count,
              hasChanges: count > 0,
            }));
          })
          .catch(() => {/* ignore */});
      }
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [projectPath, refresh]);

  return {
    ...state,
    refresh,
    createSnapshot,
    revertTo,
    getDiffSummary,
  };
}
