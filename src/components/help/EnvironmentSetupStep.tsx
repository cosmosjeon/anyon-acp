import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks";
import { environmentApi, type EnvironmentStatus, type DependencyStatus } from "@/lib/api";
import { InstallGuide } from "./InstallGuide";

interface EnvironmentSetupStepProps {
  onComplete: () => void;
  onSkip: () => void;
  /** Mock status for testing - bypasses actual environment check */
  mockStatus?: EnvironmentStatus;
}

type CheckPhase = "checking" | "results" | "guide";

// Dependency icons using box drawing for simple representation
const DependencyIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    nodejs: (
      <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1.85c-.27 0-.55.07-.78.2L3.78 6.35C3.3 6.63 3 7.15 3 7.71v8.58c0 .56.3 1.08.78 1.36l7.44 4.3c.23.13.5.2.78.2.27 0 .55-.07.78-.2l7.44-4.3c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.78-.2z"/>
      </svg>
    ),
    git: (
      <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.62 11.1l-8.72-8.72a1.29 1.29 0 00-1.82 0L9.19 4.27l2.3 2.3a1.53 1.53 0 011.94 1.95l2.22 2.22a1.53 1.53 0 11-.92.86l-2.07-2.07v5.45a1.53 1.53 0 11-1.26-.03V9.4a1.53 1.53 0 01-.83-2.01L8.26 5.08l-5.88 5.88a1.29 1.29 0 000 1.82l8.72 8.72a1.29 1.29 0 001.82 0l8.7-8.7a1.29 1.29 0 000-1.7z"/>
      </svg>
    ),
    "claude-code": (
      <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// Status indicator component
const StatusIndicator = ({ status, isChecking }: { status: DependencyStatus; isChecking: boolean }) => {
  if (isChecking) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }
  if (status.is_installed && status.meets_minimum) {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  return <AlertCircle className="h-5 w-5 text-amber-500" />;
};

// Dependency card component
const DependencyCard = ({
  dep,
  isChecking,
  onClick,
}: {
  dep: DependencyStatus;
  isChecking: boolean;
  onClick?: () => void;
}) => {
  const { t } = useTranslation();
  const isReady = dep.is_installed && dep.meets_minimum;

  return (
    <button
      onClick={onClick}
      disabled={isReady || isChecking}
      className={cn(
        "w-full p-4 rounded-xl border text-left transition-all",
        isReady
          ? "border-green-500/30 bg-green-500/5 cursor-default"
          : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 cursor-pointer",
        isChecking && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            isReady ? "bg-green-500/10" : "bg-amber-500/10"
          )}
        >
          <DependencyIcon
            name={dep.name}
            className={isReady ? "text-green-500" : "text-amber-500"}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {dep.name === "nodejs" && "Node.js"}
              {dep.name === "git" && "Git"}
              {dep.name === "claude-code" && "Claude Code"}
            </h3>
            {dep.version && (
              <span className="text-xs text-muted-foreground truncate">
                {dep.version}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isReady
              ? t("onboarding.environment.installed")
              : t("onboarding.environment.notInstalled")}
            {dep.source && dep.source !== "not_found" && isReady && (
              <span className="ml-1 text-xs">({dep.source})</span>
            )}
          </p>
        </div>
        <StatusIndicator status={dep} isChecking={isChecking} />
      </div>
    </button>
  );
};

export function EnvironmentSetupStep({ onComplete, onSkip, mockStatus }: EnvironmentSetupStepProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<CheckPhase>(mockStatus ? "results" : "checking");
  const [status, setStatus] = useState<EnvironmentStatus | null>(mockStatus || null);
  const [selectedDep, setSelectedDep] = useState<"nodejs" | "git" | "claude-code" | null>(null);
  const [isChecking, setIsChecking] = useState(!mockStatus);

  const checkEnvironment = useCallback(async () => {
    // If using mock status, just use the mock data
    if (mockStatus) {
      setStatus(mockStatus);
      setPhase("results");
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    try {
      const result = await environmentApi.checkEnvironmentStatus();
      setStatus(result);

      if (result.all_ready) {
        // All dependencies installed, auto-proceed after short delay
        setPhase("results");
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setPhase("results");
      }
    } catch (error) {
      console.error("Failed to check environment:", error);
      // Show results anyway with error state
      setPhase("results");
    } finally {
      setIsChecking(false);
    }
  }, [onComplete, mockStatus]);

  useEffect(() => {
    checkEnvironment();
  }, [checkEnvironment]);

  const handleDependencyClick = (dep: "nodejs" | "git" | "claude-code") => {
    setSelectedDep(dep);
    setPhase("guide");
  };

  const handleBackFromGuide = () => {
    setSelectedDep(null);
    setPhase("results");
  };

  const handleCheckAgain = () => {
    setSelectedDep(null);
    setPhase("checking");
    checkEnvironment();
  };

  // Render guide for selected dependency
  if (phase === "guide" && selectedDep && status) {
    return (
      <InstallGuide
        dependency={selectedDep}
        platform={status.platform}
        onBack={handleBackFromGuide}
        onCheckAgain={handleCheckAgain}
      />
    );
  }

  // Render checking state
  if (phase === "checking") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-6 pt-10 flex flex-col items-center justify-center"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {t("onboarding.environment.checking")}
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          {t("onboarding.environment.checkingDesc")}
        </p>
      </motion.div>
    );
  }

  // Render results
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 pt-10"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {status?.all_ready
            ? t("onboarding.environment.allReady")
            : t("onboarding.environment.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {status?.all_ready
            ? t("onboarding.environment.allReadyDesc")
            : t("onboarding.environment.description")}
        </p>
      </div>

      {/* All ready animation */}
      {status?.all_ready && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-full bg-green-500/10">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </motion.div>
      )}

      {/* Dependency list */}
      {status && (
        <div className="space-y-3 mb-6">
          <DependencyCard
            dep={status.nodejs}
            isChecking={isChecking}
            onClick={
              !status.nodejs.is_installed || !status.nodejs.meets_minimum
                ? () => handleDependencyClick("nodejs")
                : undefined
            }
          />
          <DependencyCard
            dep={status.git}
            isChecking={isChecking}
            onClick={
              !status.git.is_installed || !status.git.meets_minimum
                ? () => handleDependencyClick("git")
                : undefined
            }
          />
          <DependencyCard
            dep={status.claude_code}
            isChecking={isChecking}
            onClick={
              !status.claude_code.is_installed
                ? () => handleDependencyClick("claude-code")
                : undefined
            }
          />
        </div>
      )}

      {/* Action buttons */}
      {!status?.all_ready && (
        <div className="space-y-3">
          <Button
            onClick={handleCheckAgain}
            disabled={isChecking}
            className="w-full"
            variant="default"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isChecking && "animate-spin")} />
            {t("onboarding.environment.checkAgain")}
          </Button>

          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            {t("onboarding.environment.skipForNow")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
