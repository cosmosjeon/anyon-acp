import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  RefreshCw,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks";
import { environmentApi } from "@/lib/api";

interface InstallGuideProps {
  dependency: "nodejs" | "git" | "claude-code";
  platform: "macos" | "windows" | "linux";
  onBack: () => void;
  onCheckAgain: () => void;
}

// Copy button with feedback
const CopyButton = ({ text, className }: { text: string; className?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await environmentApi.copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-md hover:bg-muted transition-colors",
        className
      )}
      title="복사"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
};

// Command box component
const CommandBox = ({ command, label }: { command: string; label?: string }) => {
  return (
    <div className="relative">
      {label && (
        <span className="text-xs text-muted-foreground mb-1 block">{label}</span>
      )}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border font-mono text-sm">
        <code className="flex-1 break-all">{command}</code>
        <CopyButton text={command} />
      </div>
    </div>
  );
};

// Expandable troubleshooting section
const TroubleshootingSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-3 pb-3 text-sm text-muted-foreground space-y-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

// Step component
const Step = ({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
        {number}
      </div>
      <div className="flex-1 pt-0.5">{children}</div>
    </div>
  );
};

// Node.js Guide for macOS
const NodejsMacGuide = () => {
  const { t } = useTranslation();

  const handleOpenDownload = () => {
    environmentApi.openUrl("https://nodejs.org");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {t("installGuide.nodejs.mac.description")}
        </p>
      </div>

      {/* Main download button */}
      <Button onClick={handleOpenDownload} className="w-full" size="lg">
        <ExternalLink className="h-4 w-4 mr-2" />
        {t("installGuide.downloadPage")}
      </Button>

      {/* Method title */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary">{t("installGuide.nodejs.mac.methodTitle")}</p>
      </div>

      {/* Step by step */}
      <div className="space-y-4">
        <Step number={1}>
          <p>{t("installGuide.nodejs.mac.step1")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.nodejs.mac.step1detail")}
          </p>
        </Step>

        <Step number={2}>
          <p>{t("installGuide.nodejs.mac.step2")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.nodejs.mac.step2detail")}
          </p>
        </Step>

        <Step number={3}>
          <p>{t("installGuide.nodejs.mac.step3")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.nodejs.mac.step3detail")}
          </p>
        </Step>

        <Step number={4}>
          <p>{t("installGuide.nodejs.mac.step4")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.nodejs.mac.step4detail")}
          </p>
        </Step>

        <Step number={5}>
          <p>{t("installGuide.nodejs.mac.step5")}</p>
        </Step>
      </div>

      {/* Troubleshooting */}
      <div className="space-y-2">
        <h3 className="font-medium">{t("installGuide.troubleshooting")}</h3>

        <TroubleshootingSection title={t("installGuide.nodejs.mac.faq1q")}>
          <p>{t("installGuide.nodejs.mac.faq1a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.nodejs.mac.faq2q")}>
          <p>{t("installGuide.nodejs.mac.faq2a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.nodejs.mac.faq3q")}>
          <p>{t("installGuide.nodejs.mac.faq3a")}</p>
        </TroubleshootingSection>
      </div>
    </div>
  );
};

// Node.js Guide for Windows
const NodejsWindowsGuide = () => {
  const { t } = useTranslation();

  const handleOpenDownload = () => {
    environmentApi.openUrl("https://nodejs.org");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {t("installGuide.nodejs.windows.description")}
        </p>
      </div>

      <Button onClick={handleOpenDownload} className="w-full" size="lg">
        <ExternalLink className="h-4 w-4 mr-2" />
        {t("installGuide.downloadPage")}
      </Button>

      {/* Method title */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary">{t("installGuide.nodejs.windows.methodTitle")}</p>
      </div>

      <div className="space-y-4">
        <Step number={1}>
          <p>{t("installGuide.nodejs.windows.step1")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.nodejs.windows.step1detail")}
          </p>
        </Step>

        <Step number={2}>
          <p>{t("installGuide.nodejs.windows.step2")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.nodejs.windows.step2detail")}
          </p>
        </Step>

        <Step number={3}>
          <div>
            <p>{t("installGuide.nodejs.windows.step3")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("installGuide.nodejs.windows.step3detail")}
            </p>
          </div>
        </Step>

        <Step number={4}>
          <p>{t("installGuide.nodejs.windows.step4")}</p>
        </Step>

        <Step number={5}>
          <p>{t("installGuide.nodejs.windows.step5")}</p>
        </Step>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">{t("installGuide.troubleshooting")}</h3>

        <TroubleshootingSection title={t("installGuide.nodejs.windows.faq1q")}>
          <p>{t("installGuide.nodejs.windows.faq1a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.nodejs.windows.faq2q")}>
          <p>{t("installGuide.nodejs.windows.faq2a")}</p>
        </TroubleshootingSection>
      </div>
    </div>
  );
};

// Git Guide for macOS
const GitMacGuide = () => {
  const { t } = useTranslation();

  const handleOpenTerminal = async () => {
    await environmentApi.openTerminal();
    await environmentApi.copyToClipboard("git --version");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {t("installGuide.git.mac.description")}
        </p>
      </div>

      {/* Method title */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary">{t("installGuide.git.mac.methodTitle")}</p>
      </div>

      <div className="space-y-4">
        <Step number={1}>
          <p>{t("installGuide.git.mac.step1")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.git.mac.step1detail")}
          </p>
          <Button
            onClick={handleOpenTerminal}
            variant="outline"
            className="mt-2 w-full"
          >
            <Terminal className="h-4 w-4 mr-2" />
            {t("installGuide.openTerminal")}
          </Button>
        </Step>

        <Step number={2}>
          <p>{t("installGuide.git.mac.step2")}</p>
          <div className="mt-2">
            <CommandBox command="git --version" />
          </div>
        </Step>

        <Step number={3}>
          <div>
            <p>{t("installGuide.git.mac.step3")}</p>
            <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
              <p className="font-medium text-blue-600 dark:text-blue-400">
                {t("installGuide.git.mac.step3popup")}
              </p>
              <p className="text-muted-foreground mt-1">
                {t("installGuide.git.mac.step3detail")}
              </p>
            </div>
          </div>
        </Step>

        <Step number={4}>
          <p>{t("installGuide.git.mac.step4")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.git.mac.step4detail")}
          </p>
        </Step>

        <Step number={5}>
          <p>{t("installGuide.git.mac.step5")}</p>
        </Step>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">{t("installGuide.troubleshooting")}</h3>

        <TroubleshootingSection title={t("installGuide.git.mac.faq1q")}>
          <p>{t("installGuide.git.mac.faq1a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.git.mac.faq2q")}>
          <p>{t("installGuide.git.mac.faq2a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.git.mac.faq3q")}>
          <p>{t("installGuide.git.mac.faq3a")}</p>
        </TroubleshootingSection>
      </div>
    </div>
  );
};

// Git Guide for Windows
const GitWindowsGuide = () => {
  const { t } = useTranslation();

  const handleOpenDownload = () => {
    environmentApi.openUrl("https://git-scm.com/download/win");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {t("installGuide.git.windows.description")}
        </p>
      </div>

      <Button onClick={handleOpenDownload} className="w-full" size="lg">
        <ExternalLink className="h-4 w-4 mr-2" />
        {t("installGuide.downloadPage")}
      </Button>

      {/* Method title */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary">{t("installGuide.git.windows.methodTitle")}</p>
      </div>

      <div className="space-y-4">
        <Step number={1}>
          <p>{t("installGuide.git.windows.step1")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.git.windows.step1detail")}
          </p>
        </Step>

        <Step number={2}>
          <p>{t("installGuide.git.windows.step2")}</p>
        </Step>

        <Step number={3}>
          <div>
            <p>{t("installGuide.git.windows.step3")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("installGuide.git.windows.step3detail")}
            </p>
          </div>
        </Step>

        <Step number={4}>
          <p>{t("installGuide.git.windows.step4")}</p>
        </Step>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">{t("installGuide.troubleshooting")}</h3>

        <TroubleshootingSection title={t("installGuide.git.windows.faq1q")}>
          <p>{t("installGuide.git.windows.faq1a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.git.windows.faq2q")}>
          <p>{t("installGuide.git.windows.faq2a")}</p>
        </TroubleshootingSection>
      </div>
    </div>
  );
};

// Claude Code Guide (common for all platforms)
const ClaudeCodeGuide = ({ platform }: { platform: "macos" | "windows" | "linux" }) => {
  const { t } = useTranslation();

  const handleOpenTerminal = async () => {
    await environmentApi.openTerminal();
    await environmentApi.copyToClipboard("npm install -g @anthropic-ai/claude-code");
  };

  const isMac = platform === "macos";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {t("installGuide.claudeCode.description")}
        </p>
      </div>

      {/* Method title */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary">{t("installGuide.claudeCode.methodTitle")}</p>
      </div>

      <div className="space-y-4">
        <Step number={1}>
          <p>{t("installGuide.claudeCode.step1")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("installGuide.claudeCode.step1detail")}
          </p>
          <Button
            onClick={handleOpenTerminal}
            variant="outline"
            className="mt-2 w-full"
          >
            <Terminal className="h-4 w-4 mr-2" />
            {t("installGuide.openTerminal")}
          </Button>
        </Step>

        <Step number={2}>
          <p>{t("installGuide.claudeCode.step2")}</p>
          <div className="mt-2">
            <CommandBox command="npm install -g @anthropic-ai/claude-code" />
          </div>
        </Step>

        <Step number={3}>
          <div>
            <p>{t("installGuide.claudeCode.step3")}</p>
            <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm font-mono">
              <p className="text-green-600 dark:text-green-400">added 150 packages in 30s</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t("installGuide.claudeCode.step3detail")}
            </p>
          </div>
        </Step>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">{t("installGuide.troubleshooting")}</h3>

        <TroubleshootingSection title={t("installGuide.claudeCode.faq1q")}>
          <p>{t("installGuide.claudeCode.faq1a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.claudeCode.faq2q")}>
          <p className="mb-2">{t("installGuide.claudeCode.faq2a")}</p>
          {isMac && (
            <>
              <CommandBox command="sudo npm install -g @anthropic-ai/claude-code" />
              <p className="text-xs text-muted-foreground mt-1">
                {t("installGuide.claudeCode.faq2aDetail")}
              </p>
            </>
          )}
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.claudeCode.faq3q")}>
          <p>{t("installGuide.claudeCode.faq3a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.claudeCode.faq4q")}>
          <p>{t("installGuide.claudeCode.faq4a")}</p>
        </TroubleshootingSection>
      </div>
    </div>
  );
};

// Linux Guide (simplified - shows for all dependencies)
const LinuxGuide = ({ dependency }: { dependency: "nodejs" | "git" | "claude-code" }) => {
  const { t } = useTranslation();

  const commands: Record<string, Record<string, string>> = {
    nodejs: {
      ubuntu: "sudo apt install nodejs npm",
      fedora: "sudo dnf install nodejs npm",
      arch: "sudo pacman -S nodejs npm",
    },
    git: {
      ubuntu: "sudo apt install git",
      fedora: "sudo dnf install git",
      arch: "sudo pacman -S git",
    },
    "claude-code": {
      ubuntu: "npm install -g @anthropic-ai/claude-code",
      fedora: "npm install -g @anthropic-ai/claude-code",
      arch: "npm install -g @anthropic-ai/claude-code",
    },
  };

  const handleOpenTerminal = async () => {
    await environmentApi.openTerminal();
    await environmentApi.copyToClipboard(commands[dependency].ubuntu);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {t("installGuide.linux.description")}
        </p>
      </div>

      <div className="space-y-4">
        {dependency !== "claude-code" && (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2">{t("installGuide.linux.ubuntuDebian")}</h4>
              <CommandBox command={commands[dependency].ubuntu} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">{t("installGuide.linux.fedora")}</h4>
              <CommandBox command={commands[dependency].fedora} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">{t("installGuide.linux.arch")}</h4>
              <CommandBox command={commands[dependency].arch} />
            </div>
          </>
        )}

        {dependency === "claude-code" && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t("installGuide.linux.claudeCodeTitle")}</h4>
            <CommandBox command={commands[dependency].ubuntu} />
          </div>
        )}
      </div>

      <Button
        onClick={handleOpenTerminal}
        variant="outline"
        className="w-full"
      >
        <Terminal className="h-4 w-4 mr-2" />
        {t("installGuide.openTerminal")}
      </Button>

      <div className="space-y-2">
        <h3 className="font-medium">{t("installGuide.troubleshooting")}</h3>

        <TroubleshootingSection title={t("installGuide.linux.faq1q")}>
          <p>{t("installGuide.linux.faq1a")}</p>
        </TroubleshootingSection>

        <TroubleshootingSection title={t("installGuide.linux.faq2q")}>
          <p>{t("installGuide.linux.faq2a")}</p>
        </TroubleshootingSection>
      </div>
    </div>
  );
};

// Main InstallGuide component
export function InstallGuide({
  dependency,
  platform,
  onBack,
  onCheckAgain,
}: InstallGuideProps) {
  const { t } = useTranslation();

  // Get title based on dependency
  const getTitle = () => {
    switch (dependency) {
      case "nodejs":
        return platform === "macos"
          ? t("installGuide.nodejs.mac.title")
          : t("installGuide.nodejs.windows.title");
      case "git":
        return platform === "macos"
          ? t("installGuide.git.mac.title")
          : t("installGuide.git.windows.title");
      case "claude-code":
        return t("installGuide.claudeCode.title");
      default:
        return "";
    }
  };

  // Render appropriate guide based on dependency and platform
  const renderGuide = () => {
    if (platform === "linux") {
      return <LinuxGuide dependency={dependency} />;
    }

    switch (dependency) {
      case "nodejs":
        return platform === "macos" ? <NodejsMacGuide /> : <NodejsWindowsGuide />;
      case "git":
        return platform === "macos" ? <GitMacGuide /> : <GitWindowsGuide />;
      case "claude-code":
        return <ClaudeCodeGuide platform={platform} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 p-6 pt-10 overflow-y-auto max-h-[500px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold">
            {platform === "linux" ? t("installGuide.linux.title") : getTitle()}
          </h2>
        </div>
      </div>

      {/* Guide content */}
      {renderGuide()}

      {/* Check again button */}
      <div className="mt-6 pt-4 border-t">
        <Button onClick={onCheckAgain} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("installGuide.checkAgain")}
        </Button>
      </div>
    </motion.div>
  );
}
