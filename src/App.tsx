import { useState, useEffect } from "react";
import { HashRouter } from "react-router-dom";
import logoAnyon from "@/assets/logo-anyon.png";
import { useAuthStore } from "@/stores/authStore";
import { LoginPage } from "@/components/LoginPage";
import { api } from "@/lib/api";
import { initializeWebMode } from "@/lib/apiAdapter";
import { OutputCacheProvider } from "@/lib/outputCache";
import { TabProvider } from "@/contexts/TabContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CustomTitlebar } from "@/components/CustomTitlebar";
import { AppLayout } from "@/components/AppLayout";
import { NFOCredits } from "@/components/NFOCredits";
import { ClaudeBinaryDialog } from "@/components/ClaudeBinaryDialog";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { StartupIntro } from "@/components/StartupIntro";
import { UpdateNotification } from "@/components/UpdateNotification";
import { useAppLifecycle } from "@/hooks";

/**
 * AppContent component - Contains the main app logic with 3-panel layout
 */
function AppContent() {
  const [showNFO, setShowNFO] = useState(false);
  const [showClaudeBinaryDialog, setShowClaudeBinaryDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Initialize analytics lifecycle tracking
  useAppLifecycle();

  // Initialize web mode compatibility on mount
  useEffect(() => {
    initializeWebMode();
  }, []);

  // Listen for Claude not found events
  useEffect(() => {
    const handleClaudeNotFound = () => {
      setShowClaudeBinaryDialog(true);
    };

    window.addEventListener('claude-not-found', handleClaudeNotFound as EventListener);
    return () => {
      window.removeEventListener('claude-not-found', handleClaudeNotFound as EventListener);
    };
  }, []);

  // Listen for info/about click from sidebar
  useEffect(() => {
    const handleShowNFO = () => {
      setShowNFO(true);
    };

    window.addEventListener('show-nfo', handleShowNFO);
    return () => {
      window.removeEventListener('show-nfo', handleShowNFO);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Custom Titlebar - simplified, just traffic lights */}
      <CustomTitlebar />

      {/* Main Content - 3 Panel Layout (Sidebar | Chat | Preview) */}
      <div className="flex-1 overflow-hidden">
        <AppLayout />
      </div>

      {/* NFO Credits Modal */}
      {showNFO && <NFOCredits onClose={() => setShowNFO(false)} />}

      {/* Claude Binary Dialog */}
      <ClaudeBinaryDialog
        open={showClaudeBinaryDialog}
        onOpenChange={setShowClaudeBinaryDialog}
        onSuccess={() => {
          setToast({ message: "Claude binary path saved successfully", type: "success" });
          window.location.reload();
        }}
        onError={(message) => setToast({ message, type: "error" })}
      />

      {/* Toast Container */}
      <ToastContainer>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </ToastContainer>
    </div>
  );
}

/**
 * Main App component - Wraps the app with providers and auth gate
 */
function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      const cached = typeof window !== 'undefined'
        ? window.localStorage.getItem('app_setting:startup_intro_enabled')
        : null;
      if (cached === 'true') return true;
      if (cached === 'false') return false;
    } catch (_ignore) { }
    return true;
  });

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkAuth();
        console.log('Auth check result:', result);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    let timer: number | undefined;
    (async () => {
      try {
        const pref = await api.getSetting('startup_intro_enabled');
        const enabled = pref === null ? true : pref === 'true';
        if (enabled) {
          timer = window.setTimeout(() => setShowIntro(false), 2000);
        } else {
          setShowIntro(false);
        }
      } catch (err) {
        timer = window.setTimeout(() => setShowIntro(false), 2000);
      }
    })();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logoAnyon} alt="Anyon Logo" className="w-16 h-16" />
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <HashRouter>
        <ThemeProvider>
          <LoginPage />
        </ThemeProvider>
      </HashRouter>
    );
  }

  // Show main app with new 3-panel layout
  return (
    <HashRouter>
      <ThemeProvider>
        <OutputCacheProvider>
          <TabProvider>
            <AppContent />
            <StartupIntro visible={showIntro} />
            <UpdateNotification />
          </TabProvider>
        </OutputCacheProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
