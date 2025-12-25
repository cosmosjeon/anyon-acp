import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Zap,
  Sparkles,
  Lightbulb,
  Brain,
  Cpu,
  Rocket,
  FileText,
  Play,
  ChevronRight,
  File,
  Command,
  Check,
  Image as ImageIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

/**
 * Thinking mode type definition
 */
export type ThinkingMode = "auto" | "think" | "think_hard" | "think_harder" | "ultrathink";

/**
 * Execution mode type
 */
export type ExecutionMode = "execute" | "plan";

/**
 * Thinking mode configuration
 */
type ThinkingModeConfig = {
  id: ThinkingMode;
  name: string;
  description: string;
  level: number;
  phrase?: string;
  icon: React.ReactNode;
  color: string;
};

export const THINKING_MODES: ThinkingModeConfig[] = [
  {
    id: "auto",
    name: "자동",
    description: "알아서 판단",
    level: 0,
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-muted-foreground",
  },
  {
    id: "think",
    name: "생각",
    description: "한번 생각",
    level: 1,
    phrase: "think",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "text-amber-500",
  },
  {
    id: "think_hard",
    name: "꼼꼼히",
    description: "꼼꼼 분석",
    level: 2,
    phrase: "think hard",
    icon: <Brain className="h-4 w-4" />,
    color: "text-orange-500",
  },
  {
    id: "think_harder",
    name: "심층",
    description: "깊이 고민",
    level: 3,
    phrase: "think harder",
    icon: <Cpu className="h-4 w-4" />,
    color: "text-rose-500",
  },
  {
    id: "ultrathink",
    name: "최대",
    description: "최선 다함",
    level: 4,
    phrase: "ultrathink",
    icon: <Rocket className="h-4 w-4" />,
    color: "text-purple-500",
  },
];

type Model = {
  id: "haiku" | "sonnet" | "opus";
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

export const MODELS: Model[] = [
  {
    id: "haiku",
    name: "Haiku",
    description: "빠름",
    icon: <Zap className="h-4 w-4" />,
    color: "text-emerald-500",
  },
  {
    id: "sonnet",
    name: "Sonnet",
    description: "균형",
    icon: <Zap className="h-4 w-4" />,
    color: "text-blue-500",
  },
  {
    id: "opus",
    name: "Opus",
    description: "강력",
    icon: <Zap className="h-4 w-4" />,
    color: "text-violet-500",
  },
];

type ExecutionModeConfig = {
  id: ExecutionMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

export const EXECUTION_MODES: ExecutionModeConfig[] = [
  {
    id: "execute",
    name: "개발 모드",
    description: "바로 개발 시작",
    icon: <Play className="h-4 w-4" />,
    color: "text-emerald-500",
  },
  {
    id: "plan",
    name: "계획 세우기",
    description: "먼저 계획을 세워요",
    icon: <FileText className="h-4 w-4" />,
    color: "text-violet-500",
  },
];

/**
 * ThinkingModeIndicator component - Shows visual indicator bars for thinking level
 */
const ThinkingModeIndicator: React.FC<{ level: number; size?: "sm" | "md" }> = ({ level, size = "md" }) => {
  const barHeight = size === "sm" ? "h-2" : "h-3";
  const barWidth = size === "sm" ? "w-0.5" : "w-1";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            barWidth, barHeight, "rounded-full transition-all duration-200",
            i <= level ? "bg-current opacity-100" : "bg-current opacity-20"
          )}
        />
      ))}
    </div>
  );
};

interface ToolsMenuProps {
  selectedModel: "haiku" | "sonnet" | "opus";
  onModelChange: (model: "haiku" | "sonnet" | "opus") => void;
  selectedThinkingMode: ThinkingMode;
  onThinkingModeChange: (mode: ThinkingMode) => void;
  selectedExecutionMode: ExecutionMode;
  onExecutionModeChange: (mode: ExecutionMode) => void;
  showExecutionMode?: boolean;
  disabled?: boolean;
  onFilePickerTrigger?: () => void;
  onSlashCommandTrigger?: () => void;
  onImageAttach?: () => void;
  extraMenuItems?: React.ReactNode;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({
  selectedModel,
  onModelChange,
  selectedThinkingMode,
  onThinkingModeChange,
  selectedExecutionMode,
  onExecutionModeChange,
  showExecutionMode = false,
  disabled = false,
  onFilePickerTrigger,
  onSlashCommandTrigger,
  onImageAttach,
  extraMenuItems,
}) => {
  const [open, setOpen] = React.useState(false);
  const [subMenu, setSubMenu] = React.useState<"model" | "thinking" | "execution" | null>(null);

  const selectedModelData = MODELS.find((m) => m.id === selectedModel) || MODELS[1];
  const selectedThinkingData = THINKING_MODES.find((m) => m.id === selectedThinkingMode) || THINKING_MODES[0];
  const selectedExecutionData = EXECUTION_MODES.find((m) => m.id === selectedExecutionMode) || EXECUTION_MODES[0];

  const handleClose = () => {
    setOpen(false);
    setSubMenu(null);
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setSubMenu(null);
    }}>
      <PopoverTrigger asChild>
        <motion.div
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className={cn(
              "h-10 w-10 rounded-xl",
              "bg-muted/50 hover:bg-muted",
              "border border-border/50 hover:border-border",
              "transition-all duration-200"
            )}
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={12}
        className="w-64 p-2 rounded-xl border-border/50 shadow-xl"
      >
        <AnimatePresence mode="wait">
          {subMenu === null ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex flex-col gap-1"
            >
              {/* Model Selector */}
              <button
                onClick={() => setSubMenu("model")}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "hover:bg-muted/80 transition-colors",
                  "group"
                )}
              >
                <span className={cn("p-1.5 rounded-lg bg-muted/80", selectedModelData.color)}>
                  {selectedModelData.icon}
                </span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{selectedModelData.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedModelData.description}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              </button>

              {/* Thinking Mode Selector */}
              <button
                onClick={() => setSubMenu("thinking")}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "hover:bg-muted/80 transition-colors",
                  "group"
                )}
              >
                <span className={cn("p-1.5 rounded-lg bg-muted/80", selectedThinkingData.color)}>
                  {selectedThinkingData.icon}
                </span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{selectedThinkingData.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedThinkingData.description}</div>
                </div>
                <span className={selectedThinkingData.color}>
                  <ThinkingModeIndicator level={selectedThinkingData.level} size="sm" />
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              </button>

              {/* Execution Mode Selector */}
              {showExecutionMode && (
                <button
                  onClick={() => setSubMenu("execution")}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "hover:bg-muted/80 transition-colors",
                    "group"
                  )}
                >
                  <span className={cn("p-1.5 rounded-lg bg-muted/80", selectedExecutionData.color)}>
                    {selectedExecutionData.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{selectedExecutionData.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedExecutionData.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </button>
              )}

              <div className="h-px bg-border/50 my-1.5" />

              {/* File Picker Trigger */}
              <button
                onClick={() => {
                  handleClose();
                  onFilePickerTrigger?.();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "hover:bg-muted/80 transition-colors"
                )}
              >
                <span className="p-1.5 rounded-lg bg-muted/80">
                  <File className="h-4 w-4 text-blue-500" />
                </span>
                <span className="flex-1 text-left text-sm">파일 첨부</span>
                <kbd className="px-2 py-0.5 bg-muted rounded-md text-[10px] text-muted-foreground font-mono">@</kbd>
              </button>

              {/* Image Attach Trigger */}
              <button
                onClick={() => {
                  handleClose();
                  onImageAttach?.();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "hover:bg-muted/80 transition-colors"
                )}
              >
                <span className="p-1.5 rounded-lg bg-muted/80">
                  <ImageIcon className="h-4 w-4 text-green-500" />
                </span>
                <span className="flex-1 text-left text-sm">사진 첨부</span>
              </button>

              {/* Slash Command Trigger */}
              <button
                onClick={() => {
                  handleClose();
                  onSlashCommandTrigger?.();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "hover:bg-muted/80 transition-colors"
                )}
              >
                <span className="p-1.5 rounded-lg bg-muted/80">
                  <Command className="h-4 w-4 text-amber-500" />
                </span>
                <span className="flex-1 text-left text-sm">명령어</span>
                <kbd className="px-2 py-0.5 bg-muted rounded-md text-[10px] text-muted-foreground font-mono">/</kbd>
              </button>

              {/* Extra Menu Items */}
              {extraMenuItems}
            </motion.div>
          ) : subMenu === "model" ? (
            <motion.div
              key="model"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex flex-col gap-1"
            >
              <button
                onClick={() => setSubMenu(null)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                <span className="font-medium">모델 선택</span>
              </button>
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    handleClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "hover:bg-muted/80 transition-colors",
                    selectedModel === model.id && "bg-muted"
                  )}
                >
                  <span className={cn("p-1.5 rounded-lg bg-muted/80", model.color)}>
                    {model.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.description}</div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          ) : subMenu === "thinking" ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex flex-col gap-1"
            >
              <button
                onClick={() => setSubMenu(null)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                <span className="font-medium">생각 모드</span>
              </button>
              {THINKING_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onThinkingModeChange(mode.id);
                    handleClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "hover:bg-muted/80 transition-colors",
                    selectedThinkingMode === mode.id && "bg-muted"
                  )}
                >
                  <span className={cn("p-1.5 rounded-lg bg-muted/80", mode.color)}>
                    {mode.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{mode.name}</div>
                    <div className="text-xs text-muted-foreground">{mode.description}</div>
                  </div>
                  <span className={mode.color}>
                    <ThinkingModeIndicator level={mode.level} size="sm" />
                  </span>
                  {selectedThinkingMode === mode.id && (
                    <Check className="h-4 w-4 text-primary ml-1" />
                  )}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="execution"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex flex-col gap-1"
            >
              <button
                onClick={() => setSubMenu(null)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                <span className="font-medium">실행 모드</span>
              </button>
              {EXECUTION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onExecutionModeChange(mode.id);
                    handleClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "hover:bg-muted/80 transition-colors",
                    selectedExecutionMode === mode.id && "bg-muted"
                  )}
                >
                  <span className={cn("p-1.5 rounded-lg bg-muted/80", mode.color)}>
                    {mode.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{mode.name}</div>
                    <div className="text-xs text-muted-foreground">{mode.description}</div>
                  </div>
                  {selectedExecutionMode === mode.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};
