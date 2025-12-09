import { useEffect, useState, useCallback } from 'react';

// Tauri 환경인지 체크
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// 동적 import를 위한 타입
type Update = {
  version: string;
  body?: string;
  downloadAndInstall: (onProgress?: (event: DownloadEvent) => void) => Promise<void>;
};

type DownloadEvent = {
  event: 'Started' | 'Progress' | 'Finished';
  data: {
    contentLength?: number;
    chunkLength?: number;
  };
};

interface UpdateState {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  progress: number;
  version: string | null;
  notes: string | null;
  error: string | null;
}

export function useUpdater(checkOnMount = true) {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    downloading: false,
    progress: 0,
    version: null,
    notes: null,
    error: null,
  });

  const [update, setUpdate] = useState<Update | null>(null);

  const checkForUpdates = useCallback(async () => {
    // 개발 환경에서는 스킵
    if (!isTauri()) {
      console.log('[Updater] Skipping - not in Tauri environment');
      return false;
    }

    setState(prev => ({ ...prev, checking: true, error: null }));

    try {
      // 동적 import로 Tauri 플러그인 로드
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();

      if (result) {
        setUpdate(result as Update);
        setState(prev => ({
          ...prev,
          checking: false,
          available: true,
          version: result.version,
          notes: result.body ?? null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          checking: false,
          available: false,
        }));
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update check failed';
      console.error('[Updater] Error:', message);
      setState(prev => ({
        ...prev,
        checking: false,
        error: message,
      }));
      return false;
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!update || !isTauri()) return;

    setState(prev => ({ ...prev, downloading: true, progress: 0 }));

    try {
      await update.downloadAndInstall((event: DownloadEvent) => {
        if (event.event === 'Started' && event.data.contentLength) {
          console.log(`[Updater] Download started, size: ${event.data.contentLength}`);
        } else if (event.event === 'Progress') {
          const progress = event.data.chunkLength ?? 0;
          setState(prev => ({ ...prev, progress }));
        } else if (event.event === 'Finished') {
          console.log('[Updater] Download finished');
        }
      });

      // 동적 import로 relaunch 로드
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      console.error('[Updater] Install error:', message);
      setState(prev => ({
        ...prev,
        downloading: false,
        error: message,
      }));
    }
  }, [update]);

  // Check for updates on mount if enabled
  useEffect(() => {
    if (checkOnMount && isTauri()) {
      // Small delay to not block app startup
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkOnMount, checkForUpdates]);

  return {
    ...state,
    checkForUpdates,
    downloadAndInstall,
  };
}
