import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RefreshCw, Maximize, ExternalLink, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortInfo {
  port: number;
  url: string;
  alive: boolean;
}

export const PreviewPanel: React.FC = () => {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlPath, setUrlPath] = useState('/');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 포트 스캔
  useEffect(() => {
    scanPorts();
    const interval = setInterval(scanPorts, 10000); // 10초마다
    return () => clearInterval(interval);
  }, []);

  const scanPorts = async () => {
    try {
      const result = await invoke<PortInfo[]>('scan_ports');
      setPorts(result);

      // 자동 선택
      if (!selectedPort && result.length > 0) {
        const alive = result.find((p: PortInfo) => p.alive);
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
    const portInfo = ports.find((p: PortInfo) => p.port === port);
    if (portInfo) {
      setCurrentUrl(portInfo.url + urlPath);
    }
  };

  const handleNavigate = () => {
    if (selectedPort) {
      setCurrentUrl(`http://localhost:${selectedPort}${urlPath}`);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen();
  };

  const handleOpenExternal = () => {
    if (currentUrl) window.open(currentUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 툴바 */}
      <div className="flex items-center gap-2 p-2 border-b">
        {/* 포트 선택 */}
        <select
          value={selectedPort || ''}
          onChange={(e) => handlePortChange(Number(e.target.value))}
          className="px-3 py-1.5 rounded-md border bg-background text-sm"
          disabled={ports.length === 0}
        >
          <option value="" disabled>Select Port</option>
          {ports.map(p => (
            <option key={p.port} value={p.port}>
              {p.alive ? '🟢' : '🔴'} Port {p.port}
            </option>
          ))}
        </select>

        {/* URL 입력 */}
        <div className="flex-1 flex items-center gap-1 border rounded-md px-2 bg-background">
          <span className="text-xs text-muted-foreground">
            localhost:{selectedPort || '----'}
          </span>
          <input
            type="text"
            value={urlPath}
            onChange={(e) => setUrlPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="/path"
            className="flex-1 px-2 py-1 text-sm bg-transparent outline-none"
            disabled={!selectedPort}
          />
        </div>

        {/* 버튼들 */}
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={!currentUrl}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFullscreen} disabled={!currentUrl}>
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleOpenExternal} disabled={!currentUrl}>
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* iframe */}
      <div className="flex-1 relative">
        {currentUrl ? (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <Monitor className="w-12 h-12 mx-auto opacity-50" />
              <p className="text-sm">
                {ports.length === 0
                  ? 'No dev server detected'
                  : 'Select a port to preview'}
              </p>
              <Button onClick={scanPorts} variant="outline" size="sm">
                Scan Ports
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
