import { useState } from 'react';
import { Download, X, RefreshCw, Loader2 } from 'lucide-react';
import { useUpdater } from '@/hooks';

// 개발 환경에서 UI 테스트용 mock 모드
const DEV_MOCK_MODE = false; // true로 바꾸면 개발 서버에서 UI 볼 수 있음

export function UpdateNotification() {
  const updater = useUpdater(!DEV_MOCK_MODE);

  // Mock 데이터 (개발용)
  const {
    checking,
    available,
    downloading,
    version,
    notes,
    error,
    checkForUpdates,
    downloadAndInstall,
  } = DEV_MOCK_MODE
    ? {
        checking: false,
        available: true,
        downloading: false,
        version: '0.3.0',
        notes: 'New features and bug fixes',
        error: null,
        checkForUpdates: async () => true,
        downloadAndInstall: async () => {
          console.log('[Mock] Installing update...');
        },
      }
    : updater;

  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed or no update available
  if (dismissed || (!available && !error)) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-destructive">Update check failed</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={checkForUpdates}
            disabled={checking}
            className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show update available
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-primary/20 rounded-full p-2">
            <Download className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Update Available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Version {version} is ready to install
            </p>
            {notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {notes}
              </p>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={downloadAndInstall}
            disabled={downloading}
            className="flex-1 bg-primary text-primary-foreground text-sm py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Update Now
              </>
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-sm text-muted-foreground hover:text-foreground px-3"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
