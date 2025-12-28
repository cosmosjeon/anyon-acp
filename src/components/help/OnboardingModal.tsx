import { useState, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Zap,
  Key,
  FileEdit,
  Code,
  Eye,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { claudeAuthApi } from "@/lib/api";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import logoAnyon from "@/assets/logo-anyon.png";
import { EnvironmentSetupStep } from "./EnvironmentSetupStep";

const ONBOARDING_STORAGE_KEY = "anyon-onboarding-completed";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

type AuthMethod = "oauth" | "anyon-api" | "api-key" | null;

// Check if onboarding has been completed
export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Mark onboarding as completed
function markOnboardingComplete() {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
  } catch {
    // Ignore storage errors
  }
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { t } = useTranslation();
  const { accessToken, isAuthenticated } = useAuthStore();

  // Step management (0: environment, 1: auth, 2-5: workflow slides)
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const totalSteps = 6;

  // Auth state
  const [selectedAuth, setSelectedAuth] = useState<AuthMethod>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const unlistenRef = useRef<UnlistenFn[]>([]);
  const ANYON_SERVER_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.any-on.com';

  // Set up OAuth event listeners
  useEffect(() => {
    if (!open) return;

    const setupListeners = async () => {
      try {
        const unlistenSuccess = await listen('claude-auth-success', () => {
          console.log('[OnboardingModal] OAuth success');
          setAuthenticating(false);
          setAuthSuccess(true);
          // Move to next step after a brief delay
          setTimeout(() => {
            goToNext();
          }, 1000);
        });
        unlistenRef.current.push(unlistenSuccess);

        const unlistenTimeout = await listen('claude-auth-timeout', () => {
          console.log('[OnboardingModal] OAuth timeout');
          setAuthenticating(false);
          setAuthError(t('onboarding.authFailed'));
        });
        unlistenRef.current.push(unlistenTimeout);
      } catch (err) {
        console.error('Failed to set up event listeners:', err);
      }
    };

    setupListeners();

    return () => {
      unlistenRef.current.forEach(unlisten => unlisten());
      unlistenRef.current = [];
      claudeAuthApi.stopLoginPolling().catch(() => {});
    };
  }, [open, t]);

  const goToNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      // Reset auth state when moving from auth step
      if (currentStep === 1) {
        setAuthSuccess(false);
        setAuthError(null);
      }
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    markOnboardingComplete();
    onComplete();
  };

  const handleSkip = () => {
    markOnboardingComplete();
    onComplete();
  };

  // Auth handlers
  const handleOAuthSelect = async () => {
    setSelectedAuth("oauth");
    setAuthError(null);
    setAuthenticating(true);

    try {
      await claudeAuthApi.startOAuth();
    } catch (err) {
      console.error('OAuth start failed:', err);
      setAuthenticating(false);
      setAuthError(t('onboarding.authFailed'));
    }
  };

  const handleAnyonApiSelect = async () => {
    if (!accessToken) {
      setAuthError('ANYON 계정 로그인이 필요합니다');
      return;
    }

    setSelectedAuth("anyon-api");
    setAuthError(null);
    setAuthenticating(true);

    try {
      await claudeAuthApi.enableAnyonApi(ANYON_SERVER_URL, accessToken);
      setAuthSuccess(true);
      setTimeout(() => {
        goToNext();
      }, 1000);
    } catch (err) {
      console.error('ANYON API enable failed:', err);
      setAuthError(t('onboarding.authFailed'));
    } finally {
      setAuthenticating(false);
    }
  };

  const handleApiKeySelect = () => {
    setSelectedAuth("api-key");
    setShowApiKeyInput(true);
    setAuthError(null);
  };

  const handleApiKeySubmit = async () => {
    if (!apiKeyInput.trim()) return;

    setAuthenticating(true);
    setAuthError(null);

    try {
      const validationResult = await claudeAuthApi.validateApiKey(apiKeyInput.trim());
      if (!validationResult.valid) {
        setAuthError(validationResult.error || t('onboarding.authFailed'));
        setAuthenticating(false);
        return;
      }

      await claudeAuthApi.saveApiKey(apiKeyInput.trim());
      setAuthSuccess(true);
      setTimeout(() => {
        goToNext();
      }, 1000);
    } catch (err) {
      console.error('API key save failed:', err);
      setAuthError(t('onboarding.authFailed'));
    } finally {
      setAuthenticating(false);
    }
  };

  const handleAuthSkip = () => {
    goToNext();
  };

  // Workflow slides content
  const workflowSlides = [
    {
      icon: <img src={logoAnyon} alt="ANYON" className="w-16 h-16 logo-invert" />,
      titleKey: 'onboarding.welcome.title' as const,
      descKey: 'onboarding.welcome.description' as const,
    },
    {
      icon: <FileEdit className="w-12 h-12 text-blue-500" />,
      titleKey: 'onboarding.planning.title' as const,
      descKey: 'onboarding.planning.description' as const,
    },
    {
      icon: <Code className="w-12 h-12 text-violet-500" />,
      titleKey: 'onboarding.development.title' as const,
      descKey: 'onboarding.development.description' as const,
    },
    {
      icon: <Eye className="w-12 h-12 text-green-500" />,
      titleKey: 'onboarding.preview.title' as const,
      descKey: 'onboarding.preview.description' as const,
    },
  ];

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="min-h-[420px] flex flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 0 ? (
                // Environment Setup Step
                <motion.div
                  key="environment"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <EnvironmentSetupStep
                    onComplete={goToNext}
                    onSkip={goToNext}
                  />
                </motion.div>
              ) : currentStep === 1 ? (
                // Auth Selection Step
                <motion.div
                  key="auth"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="flex-1 p-6 pt-10"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                      {t('onboarding.auth.title')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('onboarding.auth.description')}
                    </p>
                  </div>

                  {/* Auth success message */}
                  {authSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {t('onboarding.authSuccess')}
                      </span>
                    </motion.div>
                  )}

                  {/* Auth error message */}
                  {authError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                    </div>
                  )}

                  {/* API Key Input (shown when selected) */}
                  {showApiKeyInput ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder={t('onboarding.auth.apiKey.placeholder')}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          className="font-mono"
                          disabled={authenticating}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowApiKeyInput(false);
                            setSelectedAuth(null);
                            setApiKeyInput("");
                          }}
                          disabled={authenticating}
                          className="flex-1"
                        >
                          {t('onboarding.back')}
                        </Button>
                        <Button
                          onClick={handleApiKeySubmit}
                          disabled={!apiKeyInput.trim() || authenticating}
                          className="flex-1"
                        >
                          {authenticating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              {t('onboarding.authenticating')}
                            </>
                          ) : (
                            t('onboarding.auth.apiKey.submit')
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Auth options
                    <div className="space-y-3">
                      {/* ANYON API (Recommended) */}
                      <button
                        onClick={handleAnyonApiSelect}
                        disabled={authenticating || !isAuthenticated}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all",
                          "hover:border-violet-500/50 hover:bg-violet-500/5",
                          selectedAuth === "anyon-api" && authenticating
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-border",
                          !isAuthenticated && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-violet-500/10">
                            <Zap className="h-5 w-5 text-violet-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{t('onboarding.auth.anyonApi.title')}</h3>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                {t('onboarding.auth.anyonApi.badge')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {t('onboarding.auth.anyonApi.description')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('onboarding.auth.anyonApi.detail')}
                            </p>
                          </div>
                          {selectedAuth === "anyon-api" && authenticating && (
                            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                          )}
                        </div>
                      </button>

                      {/* OAuth */}
                      <button
                        onClick={handleOAuthSelect}
                        disabled={authenticating}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all",
                          "hover:border-blue-500/50 hover:bg-blue-500/5",
                          selectedAuth === "oauth" && authenticating
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-border"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <User className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{t('onboarding.auth.oauth.title')}</h3>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {t('onboarding.auth.oauth.badge')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {t('onboarding.auth.oauth.description')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('onboarding.auth.oauth.detail')}
                            </p>
                          </div>
                          {selectedAuth === "oauth" && authenticating && (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          )}
                        </div>
                      </button>

                      {/* API Key */}
                      <button
                        onClick={handleApiKeySelect}
                        disabled={authenticating}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all",
                          "hover:border-amber-500/50 hover:bg-amber-500/5",
                          "border-border"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/10">
                            <Key className="h-5 w-5 text-amber-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{t('onboarding.auth.apiKey.title')}</h3>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {t('onboarding.auth.apiKey.badge')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {t('onboarding.auth.apiKey.description')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('onboarding.auth.apiKey.detail')}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Skip auth */}
                      <button
                        onClick={handleAuthSkip}
                        disabled={authenticating}
                        className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                      >
                        {t('onboarding.auth.skipForNow')}
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                // Workflow Slides (currentStep 2-5 -> index 0-3)
                <motion.div
                  key={`slide-${currentStep}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="flex-1 p-6 pt-10 flex flex-col items-center justify-center text-center"
                >
                  <div className="mb-6">
                    {workflowSlides[currentStep - 2].icon}
                  </div>
                  <h2 className="text-xl font-semibold mb-3">
                    {t(workflowSlides[currentStep - 2].titleKey)}
                  </h2>
                  <p className="text-muted-foreground">
                    {t(workflowSlides[currentStep - 2].descKey)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="p-6 pt-0">
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mb-4">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      idx === currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Navigation buttons - hide on environment step (0) */}
              {currentStep > 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrev}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('onboarding.back')}
                  </Button>

                  {currentStep === totalSteps - 1 ? (
                    <Button onClick={handleComplete} className="flex-1">
                      {t('onboarding.getStarted')}
                    </Button>
                  ) : (
                    <Button onClick={goToNext} className="flex-1">
                      {t('onboarding.next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
