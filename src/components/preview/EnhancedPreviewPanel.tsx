import React, { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import {
  RefreshCw,
  Maximize,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  FileCode,
  Server,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Play,
  Square,
  MoreVertical,
} from 'lucide-react';
import { VideoLoader } from '@/components/VideoLoader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePreviewStore } from '@/stores/previewStore';
import { usePreviewMessages } from '@/hooks/usePreviewMessages';
import { useComponentSelectorShortcut } from '@/hooks/useComponentSelectorShortcut';
import { useDevServer } from '@/hooks/useDevServer';
import { ActionHeader } from './ActionHeader';
import { ErrorBanner } from './ErrorBanner';
import { Problems } from './Problems';
import { Console } from './Console';
import type { PortInfo, DeviceSize, SelectedElement, ElementAction } from '@/types/preview';

// Tauri 환경 체크 - 여러 방법으로 확인
const isTauri = typeof window !== 'undefined' && (
  '__TAURI__' in window ||
  '__TAURI_INTERNALS__' in window ||
  window.location.protocol === 'tauri:'
);

const DEVICE_SIZES: DeviceSize[] = [
  { name: 'iPhone SE', width: 375, height: 667, frameType: 'mobile' },
  { name: 'iPhone 12/13', width: 390, height: 844, frameType: 'mobile' },
  { name: 'iPhone Pro Max', width: 428, height: 926, frameType: 'mobile' },
  { name: 'iPad Mini', width: 768, height: 1024, frameType: 'tablet' },
  { name: 'iPad Air', width: 820, height: 1180, frameType: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, frameType: 'tablet' },
  { name: 'Laptop', width: 1366, height: 768, frameType: 'laptop' },
  { name: 'Desktop', width: 1920, height: 1080, frameType: 'desktop' },
];

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4" />,
  tablet: <Tablet className="w-4 h-4" />,
  laptop: <Laptop className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
};

interface EnhancedPreviewPanelProps {
  /** HTML file path for file preview mode */
  htmlFilePath?: string;
  /** Project root path for resolving relative paths in HTML */
  projectPath?: string;
  /** Callback when element is selected in selector mode */
  onElementSelected?: (element: SelectedElement | null) => void;
  /** Callback when element action is triggered */
  onElementAction?: (action: ElementAction, element: SelectedElement) => void;
  /** Callback when AI fix is requested */
  onAIFix?: (prompt: string) => void;
}

/**
 * 향상된 프리뷰 패널
 * dyad-clone의 기능들을 통합한 버전
 */
export const EnhancedPreviewPanel: React.FC<EnhancedPreviewPanelProps> = ({
  htmlFilePath,
  projectPath,
  onElementSelected,
  onElementAction: _onElementAction,
  onAIFix,
}) => {
  // Preview store 상태
  const {
    previewMode,
    isPreviewOpen: _isPreviewOpen,
    previewError,
    clearPreviewError,
    problemReport,
    setIframeRef,
    addAppOutput,
    currentRoute: _currentRoute,
    setCurrentRoute: _setCurrentRoute,
    devServerRunning,
    devServerProxyUrl,
    devServerPort,
    packageManager,
    isLoading,
    setSelectorActive,
  } = usePreviewStore();

  // 메시지 훅
  usePreviewMessages();
  const { isSelectorActive, isComponentSelectorInitialized } = useComponentSelectorShortcut();
  const { startDevServer, stopDevServer } = useDevServer(projectPath);

  // 로컬 상태
  const [sourceMode, setSourceMode] = useState<'port' | 'file'>(htmlFilePath ? 'file' : 'port');
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [urlPath, setUrlPath] = useState('/');
  const [currentFilePath, setCurrentFilePath] = useState<string>(htmlFilePath || '');
  const [currentUrl, setCurrentUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 디바이스 모드 상태
  const [isDeviceMode, setIsDeviceMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceSize>(DEVICE_SIZES[0]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(1);

  // 요소 선택 상태
  const [_selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

  // 툴바 확장 상태
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

  // 소스 모드 변경 핸들러
  const handleSourceModeChange = (mode: 'port' | 'file') => {
    if (mode === sourceMode) return;
    setSourceMode(mode);
    // 모드 변경 시 적절한 URL 설정
    if (mode === 'port') {
      // 서버 모드: 서버 URL 사용
      if (devServerProxyUrl) {
        setCurrentUrl(devServerProxyUrl + urlPath);
      }
    } else {
      // 파일 모드: 현재 파일이 있으면 유지, 없으면 초기화
      setSelectedPort(null);
      if (!currentFilePath) {
        setCurrentUrl('');
      }
    }
  };

  // iframe ref 등록
  useEffect(() => {
    if (iframeRef.current) {
      setIframeRef(iframeRef.current);
    }
    return () => setIframeRef(null);
  }, [setIframeRef]);

  // HTML 파일 로드
  useEffect(() => {
    if (htmlFilePath && htmlFilePath !== currentFilePath) {
      setCurrentFilePath(htmlFilePath);
      setSourceMode('file');
      loadHtmlFile(htmlFilePath);
    }
  }, [htmlFilePath]);

  const loadHtmlFile = async (filePath: string) => {
    console.log('[Preview] loadHtmlFile called:', { filePath, isTauri, projectPath });

    if (!isTauri) {
      console.warn('[Preview] Not in Tauri environment, cannot load HTML file directly');
      addAppOutput({
        type: 'info',
        message: `[preview] Tauri 앱에서만 HTML 파일 미리보기가 가능합니다: ${filePath.split(/[/\\]/).pop()}`,
        timestamp: Date.now(),
        projectPath: projectPath || '',
      });
      return;
    }

    try {
      const resolvedProjectPath = projectPath || filePath.substring(0, filePath.lastIndexOf('/')) || filePath.substring(0, filePath.lastIndexOf('\\'));
      console.log('[Preview] Starting preview server for:', resolvedProjectPath);

      const serverInfo = await invoke('start_file_preview_server', { projectPath: resolvedProjectPath });
      console.log('[Preview] Server started:', serverInfo);

      const previewUrl = await invoke<string>('get_file_preview_url', { filePath, projectPath: resolvedProjectPath });
      console.log('[Preview] Got preview URL:', previewUrl);

      setCurrentUrl(previewUrl);
      addAppOutput({
        type: 'info',
        message: `[preview] Loading ${filePath.split(/[/\\]/).pop()} at ${previewUrl}`,
        timestamp: Date.now(),
        projectPath: resolvedProjectPath,
      });
    } catch (err) {
      console.error('[Preview] Failed to load HTML file:', err);
      addAppOutput({
        type: 'stderr',
        message: `[preview] Failed to load HTML file: ${err}`,
        timestamp: Date.now(),
        projectPath: projectPath || '',
      });
    }
  };

  // Dev server 프록시 URL 사용
  useEffect(() => {
    if (devServerProxyUrl && sourceMode === 'port') {
      setCurrentUrl(devServerProxyUrl + urlPath);
    }
  }, [devServerProxyUrl, sourceMode, urlPath]);

  // 프로젝트 열면 자동으로 프리뷰 시작
  useEffect(() => {
    console.log('[Preview] Auto-detect useEffect triggered:', {
      projectPath,
      isTauri,
      hasTauriGlobal: typeof window !== 'undefined' && '__TAURI__' in window,
      hasTauriInternals: typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window,
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
      htmlFilePath,
      currentUrl,
      sourceMode
    });

    if (!projectPath) {
      console.log('[Preview] Skipping auto-detect: no projectPath');
      return;
    }

    if (!isTauri) {
      console.log('[Preview] Skipping auto-detect: not Tauri environment');
      return;
    }

    const autoDetectAndStart = async () => {
      try {
        const hasPackageJson = await invoke<boolean>('check_file_exists', {
          filePath: `${projectPath}/package.json`
        });

        if (hasPackageJson) {
          if (!devServerRunning) {
            setSourceMode('port');
            startDevServer();
          }
          return;
        }

        const htmlFiles = ['index.html', 'main.html', 'home.html'];
        for (const htmlFile of htmlFiles) {
          const htmlPath = `${projectPath}/${htmlFile}`;
          const exists = await invoke<boolean>('check_file_exists', { filePath: htmlPath });
          if (exists) {
            console.log('[Preview] Auto-detected HTML file:', htmlPath);
            setSourceMode('file');
            setCurrentFilePath(htmlPath);
            loadHtmlFile(htmlPath);
            return;
          }
        }

        for (const htmlFile of htmlFiles) {
          const htmlPath = `${projectPath}/src/${htmlFile}`;
          const exists = await invoke<boolean>('check_file_exists', { filePath: htmlPath });
          if (exists) {
            console.log('[Preview] Auto-detected HTML file in src/:', htmlPath);
            setSourceMode('file');
            setCurrentFilePath(htmlPath);
            loadHtmlFile(htmlPath);
            return;
          }
        }

        console.log('[Preview] No package.json or HTML files found in project');
      } catch (err) {
        console.error('[Preview] Auto-detect failed:', err);
      }
    };

    if (!htmlFilePath && !currentUrl) {
      autoDetectAndStart();
    }
  }, [projectPath, htmlFilePath, devServerRunning, startDevServer, currentUrl]);

  // 포트 스캔
  useEffect(() => {
    if (sourceMode === 'port' && !devServerProxyUrl) {
      scanPorts();
      const interval = setInterval(scanPorts, 10000);
      return () => clearInterval(interval);
    }
  }, [sourceMode, devServerProxyUrl]);

  const scanPorts = async () => {
    try {
      const result = await invoke<PortInfo[]>('scan_ports');
      setPorts(result);

      if (!selectedPort && result.length > 0) {
        const alive = result.find((p) => p.alive);
        if (alive) {
          setSelectedPort(alive.port);
          setCurrentUrl(alive.url);
        }
      }
    } catch (err) {
      console.error('Port scan failed:', err);
    }
  };

  const handlePortChange = (port: number) => {
    setSelectedPort(port);
    const portInfo = ports.find((p) => p.port === port);
    if (portInfo) {
      setCurrentUrl(portInfo.url + urlPath);
    }
  };

  const handleNavigate = () => {
    if (selectedPort) {
      setCurrentUrl(`http://localhost:${selectedPort}${urlPath}`);
    }
  };

  const handleBack = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'navigate', payload: { direction: 'backward' } }, '*');
  };

  const handleForward = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'navigate', payload: { direction: 'forward' } }, '*');
  };

  const handleRefresh = () => {
    if (sourceMode === 'file' && currentFilePath) {
      loadHtmlFile(currentFilePath);
    } else if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    addAppOutput({
      type: 'info',
      message: '[preview] Refreshing...',
      timestamp: Date.now(),
      projectPath: '',
    });
  };

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen();
  };

  const handleOpenExternal = async () => {
    if (sourceMode === 'file' && currentFilePath) {
      await open(currentFilePath);
    } else if (currentUrl && !currentUrl.startsWith('data:')) {
      await open(currentUrl);
    }
  };

  const handleToggleSelector = () => {
    console.log('[Preview] Toggle selector clicked:', {
      isSelectorActive,
      isComponentSelectorInitialized,
      hasIframeRef: !!iframeRef.current,
      currentUrl
    });

    if (iframeRef.current?.contentWindow) {
      if (isSelectorActive) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'deactivate-anyon-component-selector' },
          '*'
        );
        setSelectedElement(null);
        onElementSelected?.(null);
        setSelectorActive(false);
      } else {
        iframeRef.current.contentWindow.postMessage(
          { type: 'activate-anyon-component-selector' },
          '*'
        );
        setSelectorActive(true);
      }
    } else {
      console.warn('[Preview] No iframe contentWindow available');
    }
  };

  const toggleOrientation = () => setIsLandscape(!isLandscape);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.25));
  const handleResetZoom = () => setScale(1);

  const getDeviceDimensions = () => {
    const width = isLandscape ? selectedDevice.height : selectedDevice.width;
    const height = isLandscape ? selectedDevice.width : selectedDevice.height;
    return { width, height };
  };

  const handleAIFix = useCallback((prompt: string) => {
    onAIFix?.(prompt);
    clearPreviewError();
  }, [onAIFix, clearPreviewError]);

  const { width, height } = getDeviceDimensions();
  const hasContent = currentUrl || (sourceMode === 'port' && ports.some((p) => p.alive));
  const problemCount = problemReport?.problems?.length || 0;

  // 서버 상태 텍스트
  const getServerStatusText = () => {
    if (isLoading) return '시작 중...';
    if (devServerRunning && devServerPort) return `localhost:${devServerPort}`;
    if (sourceMode === 'file' && currentFilePath) return currentFilePath.split(/[/\\]/).pop() || '';
    return '연결 안됨';
  };

  const getServerStatusColor = () => {
    if (isLoading) return 'text-amber-500';
    if (devServerRunning) return 'text-green-500';
    if (previewError) return 'text-red-500';
    return 'text-gray-400';
  };

  // 현재 활성 컨텐츠 렌더링
  const renderContent = () => {
    switch (previewMode) {
      case 'problems':
        return (
          <Problems
            projectPath={projectPath || currentFilePath}
            onAIFix={handleAIFix}
          />
        );
      case 'console':
        return <Console />;
      case 'code':
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Code view coming soon...
          </div>
        );
      case 'preview':
      default:
        return renderPreview();
    }
  };

  // 프리뷰 iframe 렌더링
  const renderPreview = () => {
    if (!currentUrl) {
      return (
        <div className="relative flex items-center justify-center h-full text-gray-500">
          <ErrorBanner
            error={previewError}
            onDismiss={clearPreviewError}
            onAIFix={handleAIFix}
          />

          <div className="text-center space-y-4">
            <Monitor className="w-12 h-12 mx-auto opacity-50" />
            <p className="text-sm">
              {sourceMode === 'port'
                ? isLoading
                  ? '개발 서버 시작 중...'
                  : devServerRunning
                    ? '포트 감지 중...'
                    : previewError
                      ? '개발 서버 에러 발생'
                      : '개발 서버가 실행되지 않았습니다'
                : 'HTML 파일을 선택하세요'}
            </p>
            {sourceMode === 'port' && !devServerRunning && !isLoading && !previewError && (
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={startDevServer}
                  disabled={!projectPath}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  개발 서버 시작
                </Button>
                <span className="text-xs text-gray-400">
                  {projectPath ? '패키지 매니저 자동 감지' : '프로젝트를 선택하세요'}
                </span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center gap-2">
                <VideoLoader size="sm" />
                <span className="text-sm">{packageManager || '패키지 매니저 감지 중...'}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isDeviceMode) {
      return (
        <div className="flex items-center justify-center h-full p-8 bg-gray-100 dark:bg-gray-900">
          <div
            className="relative"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <div className="absolute -top-8 left-0 right-0 text-center text-sm text-gray-500">
              {selectedDevice.name} {isLandscape ? '(Landscape)' : '(Portrait)'}
              <span className="ml-2 text-xs">{width}x{height}</span>
            </div>
            <div
              className="relative shadow-2xl"
              style={{
                borderRadius: selectedDevice.frameType === 'mobile' ? '36px' : '20px',
                background: '#111',
                padding: selectedDevice.frameType === 'mobile' ? '40px 20px' : '30px',
              }}
            >
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="border-0 bg-white rounded-lg"
                style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full">
        <ErrorBanner
          error={previewError}
          onDismiss={clearPreviewError}
          onAIFix={handleAIFix}
        />

        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* 상단 서버 상태 바 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          {/* 서버 상태 인디케이터 */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isLoading && "bg-amber-500 animate-pulse",
              devServerRunning && !isLoading && "bg-green-500",
              !devServerRunning && !isLoading && previewError && "bg-red-500",
              !devServerRunning && !isLoading && !previewError && "bg-gray-400"
            )} />
            <span className={cn("text-sm font-medium", getServerStatusColor())}>
              {getServerStatusText()}
            </span>
          </div>

          {/* 서버 시작/중지 버튼 */}
          {sourceMode === 'port' && (
            devServerRunning ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopDevServer}
                disabled={isLoading}
                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Square className="w-3.5 h-3.5 mr-1" />
                중지
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={startDevServer}
                disabled={isLoading || !projectPath}
                className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                시작
              </Button>
            )
          )}
        </div>

        {/* 소스 모드 토글 */}
        <div className="flex items-center gap-1 border rounded-md p-0.5 bg-white dark:bg-gray-800">
          <button
            onClick={() => handleSourceModeChange('port')}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              sourceMode === 'port'
                ? "bg-gray-100 dark:bg-gray-700 font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Server className="w-3.5 h-3.5 inline mr-1" />
            서버
          </button>
          <button
            onClick={() => handleSourceModeChange('file')}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              sourceMode === 'file'
                ? "bg-gray-100 dark:bg-gray-700 font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <FileCode className="w-3.5 h-3.5 inline mr-1" />
            파일
          </button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div ref={containerRef} className="flex-1 relative overflow-auto">
        {renderContent()}
      </div>

      {/* 하단 툴바 - 모든 모드에서 표시 */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {/* 확장 가능한 고급 옵션 - preview 모드에서만 */}
        {previewMode === 'preview' && isToolbarExpanded && (
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
              {sourceMode === 'port' ? (
                <>
                  {/* URL 입력 */}
                  <div className="flex-1 flex items-center gap-1 border rounded-md px-2 bg-white dark:bg-gray-800 min-w-[150px]">
                    <span className="text-xs text-gray-500">
                      localhost:{devServerPort || selectedPort || '----'}
                    </span>
                    <input
                      type="text"
                      value={urlPath}
                      onChange={(e) => setUrlPath(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                      placeholder="/path"
                      className="flex-1 px-2 py-1 text-sm bg-transparent outline-none"
                      disabled={!devServerPort && !selectedPort}
                    />
                  </div>

                  {/* 포트 선택 (dev server가 없을 때만) */}
                  {!devServerRunning && ports.length > 0 && (
                    <select
                      value={selectedPort || ''}
                      onChange={(e) => handlePortChange(Number(e.target.value))}
                      className="px-2 py-1 rounded-md border bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="" disabled>포트 선택</option>
                      {ports.map((p) => (
                        <option key={p.port} value={p.port}>
                          {p.alive ? '[ON]' : '[OFF]'} Port {p.port}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              ) : (
                <>
                  {/* 파일 경로 표시 */}
                  <div className="flex-1 flex items-center gap-1 border rounded-md px-2 bg-white dark:bg-gray-800 min-w-[150px]">
                    <FileCode className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate">
                      {currentFilePath ? currentFilePath.split(/[/\\]/).pop() : '파일 없음'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!isTauri) return;
                      try {
                        const { open } = await import('@tauri-apps/plugin-dialog');
                        const selected = await open({
                          multiple: false,
                          filters: [{ name: 'HTML Files', extensions: ['html', 'htm'] }],
                          directory: false,
                        });
                        if (selected && typeof selected === 'string') {
                          setCurrentFilePath(selected);
                          loadHtmlFile(selected);
                        }
                      } catch (err) {
                        console.error('Failed to open file dialog:', err);
                      }
                    }}
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    열기
                  </Button>
                </>
              )}

              {/* 디바이스 모드 컨트롤 */}
              {isDeviceMode && (
                <>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {DEVICE_ICONS[selectedDevice.frameType]}
                        <span className="ml-1 text-xs">{selectedDevice.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {DEVICE_SIZES.map((device) => (
                        <DropdownMenuItem
                          key={device.name}
                          onClick={() => setSelectedDevice(device)}
                          className={selectedDevice.name === device.name ? 'bg-gray-100 dark:bg-gray-800' : ''}
                        >
                          <span className="mr-2">{DEVICE_ICONS[device.frameType]}</span>
                          <span className="flex-1">{device.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {device.width}x{device.height}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={toggleOrientation} className="h-8 w-8">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= 0.25} className="h-8 w-8">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <button onClick={handleResetZoom} className="text-xs px-2 min-w-[50px]">
                      {Math.round(scale * 100)}%
                    </button>
                    <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= 2} className="h-8 w-8">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
        )}

        {/* 메인 툴바 */}
          <div className="flex items-center justify-between px-3 py-1.5">
            {/* 왼쪽: 탭 */}
            <ActionHeader
              problemCount={problemCount}
              onCleanRestart={() => console.log('Clean restart')}
              onClearCache={() => console.log('Clear cache')}
            />

            {/* 오른쪽: 액션 버튼들 */}
            <div className="flex items-center gap-1">
              {/* 네비게이션 */}
              <Button variant="ghost" size="icon" onClick={handleBack} disabled={!hasContent} className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleForward} disabled={!hasContent} className="h-8 w-8">
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* 새로고침 */}
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={!hasContent} className="h-8 w-8">
                <RefreshCw className="w-4 h-4" />
              </Button>

              {/* 요소 선택기 */}
              <Button
                variant={isSelectorActive ? 'default' : 'ghost'}
                size="icon"
                onClick={handleToggleSelector}
                disabled={!hasContent}
                title="요소 선택 모드 (Cmd+Shift+C)"
                className={cn("h-8 w-8", isSelectorActive && 'bg-purple-500 hover:bg-purple-600')}
              >
                <MousePointer2 className="w-4 h-4" />
              </Button>

              {/* 디바이스 모드 토글 */}
              <Button
                variant={isDeviceMode ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setIsDeviceMode(!isDeviceMode)}
                disabled={!hasContent}
                className="h-8 w-8"
              >
                <Smartphone className="w-4 h-4" />
              </Button>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* 고급 옵션 토글 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
                className={cn("h-8 w-8", isToolbarExpanded && "bg-gray-100 dark:bg-gray-700")}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {/* 외부 열기 */}
              <Button variant="ghost" size="icon" onClick={handleOpenExternal} disabled={!hasContent} className="h-8 w-8">
                <ExternalLink className="w-4 h-4" />
              </Button>

              {/* 풀스크린 */}
              <Button variant="ghost" size="icon" onClick={handleFullscreen} disabled={!hasContent} className="h-8 w-8">
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPreviewPanel;
