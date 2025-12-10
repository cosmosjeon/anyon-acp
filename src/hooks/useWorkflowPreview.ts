import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

/**
 * 워크플로우별 프리뷰 파일 매핑
 * 워크플로우 ID -> 생성되는 프리뷰 파일 경로 (프로젝트 루트 기준)
 */
const WORKFLOW_PREVIEW_FILES: Record<string, string> = {
  'startup-ux': 'anyon-docs/planning/ui-ux.html',
  // 향후 다른 워크플로우 추가 가능
  // 'startup-ui': 'anyon-docs/planning/ui-design.html',
};

/**
 * 프리뷰 가능한 파일 확장자
 */
const PREVIEWABLE_EXTENSIONS = ['.html', '.htm'];

interface UseWorkflowPreviewOptions {
  /** 프로젝트 경로 */
  projectPath: string | undefined;
  /** 파일 감지 시 호출될 콜백 */
  onPreviewFileDetected?: (filePath: string) => void;
  /** 폴링 간격 (ms), 기본 1000ms */
  pollingInterval?: number;
}

interface UseWorkflowPreviewReturn {
  /** 현재 감지된 프리뷰 파일 경로 */
  previewFilePath: string | null;
  /** 새 파일이 감지되었는지 여부 (사용자가 확인 전) */
  hasNewPreview: boolean;
  /** 새 프리뷰 확인 완료 처리 */
  markPreviewSeen: () => void;
  /** 수동으로 파일 확인 */
  checkForPreview: () => Promise<void>;
  /** 감지된 워크플로우 ID */
  detectedWorkflowId: string | null;
}

/**
 * 워크플로우 결과 프리뷰 파일 감지 훅
 *
 * startup-ux 등의 워크플로우가 HTML 파일을 생성하면 감지하여
 * 자동으로 프리뷰 탭으로 전환할 수 있게 합니다.
 */
export function useWorkflowPreview({
  projectPath,
  onPreviewFileDetected,
  pollingInterval = 1000,
}: UseWorkflowPreviewOptions): UseWorkflowPreviewReturn {
  const [previewFilePath, setPreviewFilePath] = useState<string | null>(null);
  const [hasNewPreview, setHasNewPreview] = useState(false);
  const [detectedWorkflowId, setDetectedWorkflowId] = useState<string | null>(null);

  // 이미 감지된 파일들을 추적 (중복 알림 방지)
  const detectedFilesRef = useRef<Set<string>>(new Set());
  const callbackRef = useRef(onPreviewFileDetected);

  // 콜백 ref 업데이트
  useEffect(() => {
    callbackRef.current = onPreviewFileDetected;
  }, [onPreviewFileDetected]);

  const checkForPreview = useCallback(async () => {
    if (!projectPath) return;

    try {
      // 각 워크플로우의 프리뷰 파일 확인
      for (const [workflowId, relativePath] of Object.entries(WORKFLOW_PREVIEW_FILES)) {
        const fullPath = `${projectPath}/${relativePath}`;

        // 파일 존재 여부 확인
        const exists = await invoke<boolean>('check_file_exists', { filePath: fullPath });

        if (exists && !detectedFilesRef.current.has(fullPath)) {
          // 새로 생성된 파일 감지
          console.log('[useWorkflowPreview] New preview file detected:', fullPath);
          detectedFilesRef.current.add(fullPath);

          setPreviewFilePath(fullPath);
          setDetectedWorkflowId(workflowId);
          setHasNewPreview(true);

          // 콜백 호출
          callbackRef.current?.(fullPath);
          return; // 첫 번째 감지된 파일만 처리
        }
      }
    } catch (err) {
      console.error('[useWorkflowPreview] Error checking for preview files:', err);
    }
  }, [projectPath]);

  const markPreviewSeen = useCallback(() => {
    setHasNewPreview(false);
  }, []);

  // 폴링으로 파일 변경 감지
  useEffect(() => {
    if (!projectPath) {
      setPreviewFilePath(null);
      setHasNewPreview(false);
      setDetectedWorkflowId(null);
      detectedFilesRef.current = new Set();
      return;
    }

    // 초기 확인
    checkForPreview();

    // 폴링 설정
    const interval = setInterval(checkForPreview, pollingInterval);

    return () => clearInterval(interval);
  }, [projectPath, pollingInterval, checkForPreview]);

  return {
    previewFilePath,
    hasNewPreview,
    markPreviewSeen,
    checkForPreview,
    detectedWorkflowId,
  };
}

/**
 * 파일 경로가 프리뷰 가능한 확장자인지 확인
 */
export function isPreviewableFile(filePath: string): boolean {
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
  return PREVIEWABLE_EXTENSIONS.includes(ext);
}

/**
 * 워크플로우 ID로 프리뷰 파일 경로 가져오기
 */
export function getPreviewFileForWorkflow(workflowId: string): string | undefined {
  return WORKFLOW_PREVIEW_FILES[workflowId];
}
