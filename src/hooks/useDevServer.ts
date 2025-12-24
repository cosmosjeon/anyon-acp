import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { usePreviewStore } from '@/stores/previewStore';

// Tauri 환경 체크 - 여러 방법으로 확인
const isTauri = typeof window !== 'undefined' && (
  '__TAURI__' in window ||
  '__TAURI_INTERNALS__' in window ||
  window.location.protocol === 'tauri:'
);

interface DevServerOutput {
  project_path: string;
  output_type: 'stdout' | 'stderr' | 'info' | 'port-detected' | 'error';
  message: string;
  port?: number;
  proxy_url?: string;
}

interface DevServerInfo {
  project_path: string;
  pid: number;
  detected_port?: number;
  original_url?: string;
  proxy_port?: number;
  proxy_url?: string;
}

/**
 * Dev server 관리 훅
 * 프로젝트 열 때 자동으로 dev server 시작하고 프록시 URL 연결
 */
export function useDevServer(
  projectPath: string | undefined,
  projectId?: string | undefined
) {
  const {
    setDevServerRunning,
    setDevServerPort,
    setDevServerProxyUrl,
    setPackageManager,
    setIsLoading,
    addAppOutput,
    setPreviewError,
  } = usePreviewStore();

  // 이미 실행 중인 서버에 연결
  const connectToExistingServer = useCallback(async (port: number) => {
    if (!projectPath || !isTauri) return false;

    try {
      setIsLoading(true);

      let proxyUrl: string | null = null;

      // 프록시 서버 시작 (Element Selector 스크립트 주입용)
      try {
        console.log('[DevServer] Attempting to start proxy for port:', port);
        proxyUrl = await invoke<string>('connect_to_existing_server', {
          projectPath,
          port,
        });
        console.log('[DevServer] Proxy server started successfully:', proxyUrl);
      } catch (proxyErr) {
        console.error('[DevServer] Proxy setup failed:', proxyErr);
        console.error('[DevServer] Error details:', JSON.stringify(proxyErr));
        // 프록시 실패 시 직접 연결 (요소 선택 기능 불가)
        proxyUrl = `http://localhost:${port}`;

        addAppOutput({
          type: 'stderr',
          message: `[anyon] Proxy setup failed: ${proxyErr}. Element selector will not work.`,
          timestamp: Date.now(),
          projectPath: projectPath || '',
        });
      }

      // 프록시 URL 또는 직접 URL로 연결 설정
      setDevServerRunning(true);
      setDevServerPort(port);
      setDevServerProxyUrl(proxyUrl);

      addAppOutput({
        type: 'info',
        message: proxyUrl.includes(`:${port}`)
          ? `[anyon] Connected to existing server at localhost:${port} (direct)`
          : `[anyon] Connected to existing server at localhost:${port} via proxy`,
        timestamp: Date.now(),
        projectPath,
      });
      return true;
    } catch (err) {
      console.error('Failed to connect to existing server:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projectPath, setDevServerRunning, setDevServerPort, setDevServerProxyUrl, setIsLoading, addAppOutput]);

  // Dev server 시작 (먼저 기존 서버 확인)
  const startDevServer = useCallback(async () => {
    if (!projectPath || !isTauri) return;

    try {
      setIsLoading(true);

      // 먼저 이미 실행 중인 dev 서버가 있는지 확인 (포트 스캔)
      const ports = await invoke<Array<{ port: number; alive: boolean; url: string }>>('scan_ports');
      const runningServer = ports.find(p => p.alive && p.port >= 3000 && p.port <= 9000);

      if (runningServer) {
        // 이미 실행 중인 서버에 연결
        addAppOutput({
          type: 'info',
          message: `[anyon] Found existing server at localhost:${runningServer.port}, connecting...`,
          timestamp: Date.now(),
          projectPath,
        });

        const connected = await connectToExistingServer(runningServer.port);
        if (connected) {
          return;
        }
      }

      // 기존 서버가 없으면 새로 시작
      const pm = await invoke<string>('detect_package_manager', { projectPath });
      setPackageManager(pm);

      // Dev server 시작 (projectId 전달하여 고정 포트 사용)
      await invoke('start_dev_server', {
        projectPath,
        projectId: projectId || null,
      });

      setDevServerRunning(true);
      addAppOutput({
        type: 'info',
        message: projectId
          ? `[anyon] Starting dev server with ${pm} (fixed port mode)...`
          : `[anyon] Starting dev server with ${pm}...`,
        timestamp: Date.now(),
        projectPath,
      });
    } catch (err) {
      console.error('Failed to start dev server:', err);
      addAppOutput({
        type: 'stderr',
        message: `[anyon] Failed to start dev server: ${err}`,
        timestamp: Date.now(),
        projectPath,
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectPath, projectId, connectToExistingServer, setDevServerRunning, setPackageManager, setIsLoading, addAppOutput]);

  // Dev server 중지
  const stopDevServer = useCallback(async () => {
    if (!projectPath || !isTauri) return;

    try {
      await invoke('stop_dev_server', { projectPath });
      setDevServerRunning(false);
      setDevServerPort(null);
      setDevServerProxyUrl(null);
    } catch (err) {
      console.error('Failed to stop dev server:', err);
    }
  }, [projectPath, setDevServerRunning, setDevServerPort, setDevServerProxyUrl]);

  // Dev server 정보 가져오기
  const getDevServerInfo = useCallback(async (): Promise<DevServerInfo | null> => {
    if (!projectPath || !isTauri) return null;

    try {
      return await invoke<DevServerInfo | null>('get_dev_server_info', { projectPath });
    } catch {
      return null;
    }
  }, [projectPath]);

  // 경로 정규화 함수 (Windows 경로 호환)
  const normalizePath = (path: string) => path.replace(/\\/g, '/').toLowerCase();

  // Dev server output 이벤트 리스너
  useEffect(() => {
    if (!projectPath || !isTauri) return;

    const setupListener = async () => {
      const unlisten = await listen<DevServerOutput>('dev-server-output', (event) => {
        const data = event.payload;

        // 현재 프로젝트의 이벤트만 처리 (경로 정규화하여 비교)
        if (normalizePath(data.project_path) !== normalizePath(projectPath)) return;

        // 콘솔에 출력 추가
        addAppOutput({
          type: data.output_type === 'stderr' ? 'stderr' :
                data.output_type === 'error' ? 'stderr' :
                data.output_type === 'port-detected' ? 'info' : 'stdout',
          message: data.message,
          timestamp: Date.now(),
          projectPath: data.project_path,
        });

        // 에러 감지 - stderr에서 에러 패턴 확인
        if (data.output_type === 'stderr' || data.output_type === 'error') {
          const errorPatterns = [
            /error/i,
            /ERR_MODULE_NOT_FOUND/i,
            /Cannot find/i,
            /failed to/i,
            /ENOENT/i,
            /SyntaxError/i,
            /TypeError/i,
            /ReferenceError/i,
          ];

          const isError = errorPatterns.some(pattern => pattern.test(data.message));
          if (isError) {
            console.log('[DevServer] Error detected:', data.message);
            setPreviewError({
              message: data.message,
              source: 'dev-server',
            });
          }
        }

        // 포트 감지됨
        if (data.output_type === 'port-detected' && data.port && data.proxy_url) {
          console.log('[DevServer] Port detected:', data.port, 'Proxy:', data.proxy_url);
          setDevServerPort(data.port);
          setDevServerProxyUrl(data.proxy_url);
          setIsLoading(false);
        }
      });

      return unlisten;
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [projectPath, addAppOutput, setDevServerPort, setDevServerProxyUrl, setIsLoading, setPreviewError]);

  // 프로젝트 변경 시 자동으로 dev server 상태 확인
  useEffect(() => {
    if (!projectPath || !isTauri) return;

    const checkExistingServer = async () => {
      const info = await getDevServerInfo();
      if (info && info.proxy_url) {
        setDevServerRunning(true);
        setDevServerPort(info.detected_port || null);
        setDevServerProxyUrl(info.proxy_url);
      }
    };

    checkExistingServer();
  }, [projectPath, getDevServerInfo, setDevServerRunning, setDevServerPort, setDevServerProxyUrl]);

  return {
    startDevServer,
    stopDevServer,
    getDevServerInfo,
    connectToExistingServer,
  };
}

export default useDevServer;
