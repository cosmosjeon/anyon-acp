import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Square,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider, TooltipSimple } from "@/components/ui/tooltip-modern";
import { FilePicker } from "./FilePicker";
import { SlashCommandPicker } from "./SlashCommandPicker";
import { ImagePreview } from "./ImagePreview";
import { SelectedComponentsDisplay } from "./preview/SelectedComponentsDisplay";
import { ToolsMenu, THINKING_MODES, type ThinkingMode, type ExecutionMode } from "./ToolsMenu";
import { type FileEntry, type SlashCommand } from "@/lib/api";

// Conditional import for Tauri webview window
let tauriGetCurrentWebviewWindow: any;
try {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    tauriGetCurrentWebviewWindow = require("@tauri-apps/api/webviewWindow").getCurrentWebviewWindow;
  }
} catch (e) {
  console.log('[FloatingPromptInput] Tauri webview API not available, using web mode');
}

// Web-compatible replacement
const getCurrentWebviewWindow = tauriGetCurrentWebviewWindow || (() => ({ listen: () => Promise.resolve(() => {}) }));

// Re-export ExecutionMode for external use
export type { ExecutionMode } from "./ToolsMenu";

interface FloatingPromptInputProps {
  /**
   * Callback when prompt is sent
   */
  onSend: (prompt: string, model: "haiku" | "sonnet" | "opus", executionMode?: ExecutionMode) => void;
  /**
   * Whether the input is loading
   */
  isLoading?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Selected model (controlled from parent)
   */
  selectedModel: "haiku" | "sonnet" | "opus";
  /**
   * Callback when model changes
   */
  onModelChange: (model: "haiku" | "sonnet" | "opus") => void;
  /**
   * Project path for file picker
   */
  projectPath?: string;
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Callback when cancel is clicked (only during loading)
   */
  onCancel?: () => void;
  /**
   * Extra menu items to display in the prompt bar
   */
  extraMenuItems?: React.ReactNode;
  /**
   * Whether to use embedded mode (not fixed position)
   * When true, the input will be positioned within its container instead of fixed at bottom
   */
  embedded?: boolean;
  /**
   * Whether to show the execution mode toggle (Plan/Execute)
   * Only shown in maintenance tab
   */
  showExecutionMode?: boolean;
  /**
   * Default execution mode
   */
  defaultExecutionMode?: ExecutionMode;
}

export interface FloatingPromptInputRef {
  addImage: (imagePath: string) => void;
}

/**
 * FloatingPromptInput component - ChatGPT-style prompt input
 */
const FloatingPromptInputInner = (
  {
    onSend,
    isLoading = false,
    disabled = false,
    selectedModel,
    onModelChange,
    projectPath,
    className,
    onCancel,
    extraMenuItems,
    embedded = false,
    showExecutionMode = false,
    defaultExecutionMode = "execute",
  }: FloatingPromptInputProps,
  ref: React.Ref<FloatingPromptInputRef>,
) => {
  const [prompt, setPrompt] = useState("");
  const [selectedThinkingMode, setSelectedThinkingMode] = useState<ThinkingMode>("auto");
  const [selectedExecutionMode, setSelectedExecutionMode] = useState<ExecutionMode>(defaultExecutionMode);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerQuery, setFilePickerQuery] = useState("");
  const [showSlashCommandPicker, setShowSlashCommandPicker] = useState(false);
  const [slashCommandQuery, setSlashCommandQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [embeddedImages, setEmbeddedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const unlistenDragDropRef = useRef<(() => void) | null>(null);
  const [textareaHeight, setTextareaHeight] = useState<number>(44);
  const isIMEComposingRef = useRef(false);

  // Expose a method to add images programmatically
  React.useImperativeHandle(
    ref,
    () => ({
      addImage: (imagePath: string) => {
        setPrompt(currentPrompt => {
          const existingPaths = extractImagePaths(currentPrompt);
          if (existingPaths.includes(imagePath)) {
            return currentPrompt;
          }

          const mention = imagePath.includes(' ') ? `@"${imagePath}"` : `@${imagePath}`;
          const newPrompt = currentPrompt + (currentPrompt.endsWith(' ') || currentPrompt === '' ? '' : ' ') + mention + ' ';

          setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(newPrompt.length, newPrompt.length);
          }, 0);

          return newPrompt;
        });
      }
    }),
    []
  );

  // Helper function to check if a file is an image
  const isImageFile = (path: string): boolean => {
    if (path.startsWith('data:image/')) {
      return true;
    }
    const ext = path.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || '');
  };

  // Extract image paths from prompt text
  const extractImagePaths = (text: string): string[] => {
    const quotedRegex = /@"([^"]+)"/g;
    const unquotedRegex = /@([^@\n\s]+)/g;

    const pathsSet = new Set<string>();

    let matches = Array.from(text.matchAll(quotedRegex));

    for (const match of matches) {
      const path = match[1];
      const fullPath = path.startsWith('data:')
        ? path
        : (path.startsWith('/') ? path : (projectPath ? `${projectPath}/${path}` : path));

      if (isImageFile(fullPath)) {
        pathsSet.add(fullPath);
      }
    }

    let textWithoutQuoted = text.replace(quotedRegex, '');

    matches = Array.from(textWithoutQuoted.matchAll(unquotedRegex));

    for (const match of matches) {
      const path = match[1].trim();
      if (path.includes('data:')) continue;

      const fullPath = path.startsWith('/') ? path : (projectPath ? `${projectPath}/${path}` : path);

      if (isImageFile(fullPath)) {
        pathsSet.add(fullPath);
      }
    }

    return Array.from(pathsSet);
  };

  // Update embedded images when prompt changes
  useEffect(() => {
    const imagePaths = extractImagePaths(prompt);
    setEmbeddedImages(imagePaths);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 44), 240);
      setTextareaHeight(newHeight);
    }
  }, [prompt, projectPath]);

  // Set up Tauri drag-drop event listener
  useEffect(() => {
    let lastDropTime = 0;

    const setupListener = async () => {
      try {
        if (unlistenDragDropRef.current) {
          unlistenDragDropRef.current();
        }

        const webview = getCurrentWebviewWindow();
        unlistenDragDropRef.current = await webview.onDragDropEvent((event: any) => {
          if (event.payload.type === 'enter' || event.payload.type === 'over') {
            setDragActive(true);
          } else if (event.payload.type === 'leave') {
            setDragActive(false);
          } else if (event.payload.type === 'drop' && event.payload.paths) {
            setDragActive(false);

            const currentTime = Date.now();
            if (currentTime - lastDropTime < 200) {
              return;
            }
            lastDropTime = currentTime;

            const droppedPaths = event.payload.paths as string[];
            const imagePaths = droppedPaths.filter(isImageFile);

            if (imagePaths.length > 0) {
              setPrompt(currentPrompt => {
                const existingPaths = extractImagePaths(currentPrompt);
                const newPaths = imagePaths.filter(p => !existingPaths.includes(p));

                if (newPaths.length === 0) {
                  return currentPrompt;
                }

                const mentionsToAdd = newPaths.map(p => {
                  if (p.includes(' ')) {
                    return `@"${p}"`;
                  }
                  return `@${p}`;
                }).join(' ');
                const newPrompt = currentPrompt + (currentPrompt.endsWith(' ') || currentPrompt === '' ? '' : ' ') + mentionsToAdd + ' ';

                setTimeout(() => {
                  textareaRef.current?.focus();
                  textareaRef.current?.setSelectionRange(newPrompt.length, newPrompt.length);
                }, 0);

                return newPrompt;
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to set up Tauri drag-drop listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlistenDragDropRef.current) {
        unlistenDragDropRef.current();
        unlistenDragDropRef.current = null;
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 44), 240);
      setTextareaHeight(newHeight);
    }

    // Check if / was just typed at the beginning of input or after whitespace
    if (newValue.length > prompt.length && newValue[newCursorPosition - 1] === '/') {
      const isStartOfCommand = newCursorPosition === 1 ||
        (newCursorPosition > 1 && /\s/.test(newValue[newCursorPosition - 2]));

      if (isStartOfCommand) {
        setShowSlashCommandPicker(true);
        setSlashCommandQuery("");
        setCursorPosition(newCursorPosition);
      }
    }

    // Check if @ was just typed
    if (projectPath?.trim() && newValue.length > prompt.length && newValue[newCursorPosition - 1] === '@') {
      setShowFilePicker(true);
      setFilePickerQuery("");
      setCursorPosition(newCursorPosition);
    }

    // Check if we're typing after / (for slash command search)
    if (showSlashCommandPicker && newCursorPosition >= cursorPosition) {
      let slashPosition = -1;
      for (let i = newCursorPosition - 1; i >= 0; i--) {
        if (newValue[i] === '/') {
          slashPosition = i;
          break;
        }
        if (newValue[i] === ' ' || newValue[i] === '\n') {
          break;
        }
      }

      if (slashPosition !== -1) {
        const query = newValue.substring(slashPosition + 1, newCursorPosition);
        setSlashCommandQuery(query);
      } else {
        setShowSlashCommandPicker(false);
        setSlashCommandQuery("");
      }
    }

    // Check if we're typing after @ (for search query)
    if (showFilePicker && newCursorPosition >= cursorPosition) {
      let atPosition = -1;
      for (let i = newCursorPosition - 1; i >= 0; i--) {
        if (newValue[i] === '@') {
          atPosition = i;
          break;
        }
        if (newValue[i] === ' ' || newValue[i] === '\n') {
          break;
        }
      }

      if (atPosition !== -1) {
        const query = newValue.substring(atPosition + 1, newCursorPosition);
        setFilePickerQuery(query);
      } else {
        setShowFilePicker(false);
        setFilePickerQuery("");
      }
    }

    setPrompt(newValue);
    setCursorPosition(newCursorPosition);
  };

  const handleFileSelect = (entry: FileEntry) => {
    if (!entry?.path) {
      setShowFilePicker(false);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      setShowFilePicker(false);
      return;
    }

    let atPosition = -1;
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (prompt[i] === '@') {
        atPosition = i;
        break;
      }
      if (prompt[i] === ' ' || prompt[i] === '\n') {
        break;
      }
    }

    if (atPosition === -1) {
      setShowFilePicker(false);
      return;
    }

    const beforeAt = prompt.substring(0, atPosition);
    const afterCursor = prompt.substring(cursorPosition);
    const relativePath = entry.path.startsWith(projectPath || '')
      ? entry.path.slice((projectPath || '').length + 1)
      : entry.path;

    const newPrompt = `${beforeAt}@${relativePath} ${afterCursor}`;
    setPrompt(newPrompt);
    setShowFilePicker(false);
    setFilePickerQuery("");

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newCursorPos = beforeAt.length + relativePath.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleFilePickerClose = () => {
    setShowFilePicker(false);
    setFilePickerQuery("");
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSlashCommandSelect = (command: SlashCommand) => {
    if (!command?.full_command) {
      setShowSlashCommandPicker(false);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      setShowSlashCommandPicker(false);
      return;
    }

    let slashPosition = -1;
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (prompt[i] === '/') {
        slashPosition = i;
        break;
      }
      if (prompt[i] === ' ' || prompt[i] === '\n') {
        break;
      }
    }

    if (slashPosition === -1) {
      setShowSlashCommandPicker(false);
      return;
    }

    const beforeSlash = prompt.substring(0, slashPosition);
    const afterCursor = prompt.substring(cursorPosition);

    if (command.accepts_arguments) {
      const newPrompt = `${beforeSlash}${command.full_command} `;
      setPrompt(newPrompt);
      setShowSlashCommandPicker(false);
      setSlashCommandQuery("");

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = beforeSlash.length + command.full_command.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      const newPrompt = `${beforeSlash}${command.full_command} ${afterCursor}`;
      setPrompt(newPrompt);
      setShowSlashCommandPicker(false);
      setSlashCommandQuery("");

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = beforeSlash.length + command.full_command.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleSlashCommandPickerClose = () => {
    setShowSlashCommandPicker(false);
    setSlashCommandQuery("");
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleCompositionStart = () => {
    isIMEComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    setTimeout(() => {
      isIMEComposingRef.current = false;
    }, 0);
  };

  const isIMEInteraction = (event?: React.KeyboardEvent) => {
    if (isIMEComposingRef.current) {
      return true;
    }

    if (!event) {
      return false;
    }

    const nativeEvent = event.nativeEvent;

    if (nativeEvent.isComposing) {
      return true;
    }

    const key = nativeEvent.key;
    if (key === 'Process' || key === 'Unidentified') {
      return true;
    }

    const keyboardEvent = nativeEvent as unknown as KeyboardEvent;
    const keyCode = keyboardEvent.keyCode ?? (keyboardEvent as unknown as { which?: number }).which;
    if (keyCode === 229) {
      return true;
    }

    return false;
  };

  const handleSend = () => {
    if (isIMEInteraction()) {
      return;
    }

    const trimmedPrompt = prompt?.trim();
    if (!trimmedPrompt || disabled) {
      return;
    }

    let finalPrompt = trimmedPrompt;

    // Check for @plan prefix to override execution mode
    let effectiveExecutionMode = selectedExecutionMode;
    if (finalPrompt.toLowerCase().startsWith('@plan ')) {
      effectiveExecutionMode = 'plan';
      finalPrompt = finalPrompt.substring(6).trim();
    }

    if (!finalPrompt) {
      return;
    }

    // Append thinking phrase if not auto mode
    const thinkingMode = THINKING_MODES.find(m => m.id === selectedThinkingMode);
    if (thinkingMode?.phrase) {
      finalPrompt = `${finalPrompt}.\n\n${thinkingMode.phrase}.`;
    }

    try {
      onSend(finalPrompt, selectedModel, showExecutionMode ? effectiveExecutionMode : undefined);
      setPrompt("");
      setEmbeddedImages([]);
      setTextareaHeight(44);
    } catch (err) {
      console.error('[FloatingPromptInput] Failed to send prompt:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showFilePicker && e.key === 'Escape') {
      e.preventDefault();
      setShowFilePicker(false);
      setFilePickerQuery("");
      return;
    }

    if (showSlashCommandPicker && e.key === 'Escape') {
      e.preventDefault();
      setShowSlashCommandPicker(false);
      setSlashCommandQuery("");
      return;
    }

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !showFilePicker &&
      !showSlashCommandPicker
    ) {
      if (isIMEInteraction(e)) {
        return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();

        const blob = item.getAsFile();
        if (!blob) continue;

        try {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result as string;

            setPrompt(currentPrompt => {
              const mention = `@"${base64Data}"`;
              const newPrompt = currentPrompt + (currentPrompt.endsWith(' ') || currentPrompt === '' ? '' : ' ') + mention + ' ';

              setTimeout(() => {
                textareaRef.current?.focus();
                textareaRef.current?.setSelectionRange(newPrompt.length, newPrompt.length);
              }, 0);

              return newPrompt;
            });
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Failed to paste image:', error);
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = (index: number) => {
    const imagePath = embeddedImages[index];

    if (imagePath.startsWith('data:')) {
      const quotedPath = `@"${imagePath}"`;
      const newPrompt = prompt.replace(quotedPath, '').trim();
      setPrompt(newPrompt);
      return;
    }

    const escapedPath = imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedRelativePath = imagePath.replace(projectPath + '/', '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const patterns = [
      new RegExp(`@"${escapedPath}"\\s?`, 'g'),
      new RegExp(`@${escapedPath}\\s?`, 'g'),
      new RegExp(`@"${escapedRelativePath}"\\s?`, 'g'),
      new RegExp(`@${escapedRelativePath}\\s?`, 'g')
    ];

    let newPrompt = prompt;
    for (const pattern of patterns) {
      newPrompt = newPrompt.replace(pattern, '');
    }

    setPrompt(newPrompt.trim());
  };

  // Trigger file picker from Tools menu
  const handleFilePickerTrigger = () => {
    if (!projectPath?.trim()) return;

    // Insert @ at cursor position and show picker
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const before = prompt.substring(0, start);
      const after = prompt.substring(start);
      const newPrompt = `${before}@${after}`;
      setPrompt(newPrompt);
      setCursorPosition(start + 1);
      setShowFilePicker(true);
      setFilePickerQuery("");

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
  };

  // Trigger slash command picker from Tools menu
  const handleSlashCommandTrigger = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const before = prompt.substring(0, start);
      const after = prompt.substring(start);

      // Check if we need to add space before /
      const needsSpace = before.length > 0 && !/\s$/.test(before);
      const newPrompt = `${before}${needsSpace ? ' ' : ''}/`;
      const newCursorPos = newPrompt.length;

      setPrompt(newPrompt + after);
      setCursorPosition(newCursorPos);
      setShowSlashCommandPicker(true);
      setSlashCommandQuery("");

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const selectedThinkingData = THINKING_MODES.find(m => m.id === selectedThinkingMode) || THINKING_MODES[0];

  return (
    <TooltipProvider>
      <div
        className={cn(
          embedded
            ? "w-full px-4 pb-4"
            : "fixed bottom-0 left-0 right-0 z-40 px-4 pb-4",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div
          className={cn(
            "mx-auto max-w-3xl",
            // Background with theme support
            "bg-card",
            // Smooth rounded corners
            "rounded-2xl",
            // Border with theme support
            "border-2 border-border",
            // Outer ring for more definition
            "ring-1 ring-border/50",
            // Plan mode: violet glow
            showExecutionMode && selectedExecutionMode === "plan" && "border-violet-500/70 ring-violet-500/30",
            // Focus state: primary glow
            isFocused && "border-primary/50 ring-primary/20",
            // Drag active
            dragActive && "ring-2 ring-primary/50 border-primary",
            // Smooth transition
            "transition-all duration-300 ease-out",
            // Drop shadow classes for theme support
            "drop-shadow-lg",
            isFocused && "drop-shadow-xl"
          )}
          style={{
            // Inset effects via box-shadow
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.05)"
          }}
        >
          {/* Selected Components Display */}
          <SelectedComponentsDisplay />

          {/* Image previews */}
          {embeddedImages.length > 0 && (
            <ImagePreview
              images={embeddedImages}
              onRemove={handleRemoveImage}
              className="border-b border-border/30 px-4 pt-3"
            />
          )}

          {/* Main Input Area */}
          <div className="p-3">
            {/* Textarea with inline buttons */}
            <div className="flex items-end gap-3">
              {/* + Button (Tools Menu) */}
              <ToolsMenu
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                selectedThinkingMode={selectedThinkingMode}
                onThinkingModeChange={setSelectedThinkingMode}
                selectedExecutionMode={selectedExecutionMode}
                onExecutionModeChange={setSelectedExecutionMode}
                showExecutionMode={showExecutionMode}
                disabled={disabled}
                onFilePickerTrigger={handleFilePickerTrigger}
                onSlashCommandTrigger={handleSlashCommandTrigger}
              />

              {/* Textarea Container */}
              <div className="flex-1 relative min-h-[44px]">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  onPaste={handlePaste}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={
                    dragActive
                      ? "이미지를 여기에 놓으세요..."
                      : "무엇이든 물어보세요..."
                  }
                  disabled={disabled}
                  className={cn(
                    "resize-none px-1 py-2",
                    "bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "placeholder:text-muted-foreground/40",
                    "text-[15px] leading-relaxed",
                    textareaHeight >= 240 && "overflow-y-auto scrollbar-thin"
                  )}
                  style={{
                    height: `${textareaHeight}px`,
                    overflowY: textareaHeight >= 240 ? 'auto' : 'hidden',
                    transition: 'height 150ms ease-out'
                  }}
                />

                {/* File Picker */}
                <AnimatePresence>
                  {showFilePicker && projectPath && projectPath.trim() && (
                    <FilePicker
                      basePath={projectPath.trim()}
                      onSelect={handleFileSelect}
                      onClose={handleFilePickerClose}
                      initialQuery={filePickerQuery}
                    />
                  )}
                </AnimatePresence>

                {/* Slash Command Picker */}
                <AnimatePresence>
                  {showSlashCommandPicker && (
                    <SlashCommandPicker
                      projectPath={projectPath}
                      onSelect={handleSlashCommandSelect}
                      onClose={handleSlashCommandPickerClose}
                      initialQuery={slashCommandQuery}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Send Button */}
              <TooltipSimple content={isLoading ? "중지" : "전송 (Enter)"} side="top">
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={isLoading ? onCancel : handleSend}
                    disabled={isLoading ? false : (!prompt.trim() || disabled)}
                    variant={isLoading ? "destructive" : "default"}
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all duration-200",
                      !prompt.trim() && !isLoading && "bg-muted/80 text-muted-foreground/60 hover:bg-muted/90 hover:text-muted-foreground",
                      prompt.trim() && !isLoading && "bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40",
                      isLoading && "bg-destructive shadow-lg shadow-destructive/25"
                    )}
                  >
                    {isLoading ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </TooltipSimple>
            </div>

            {/* Bottom Bar - Mode badges only (if any selected) */}
            {(selectedThinkingMode !== "auto" || (showExecutionMode && selectedExecutionMode === "plan") || extraMenuItems) && (
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-1.5">
                  {/* Thinking Mode Badge */}
                  {selectedThinkingMode !== "auto" && (
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                      "bg-primary/10 text-primary"
                    )}>
                      {selectedThinkingData.icon}
                      {selectedThinkingData.name}
                    </span>
                  )}

                  {/* Plan Mode Badge */}
                  {showExecutionMode && selectedExecutionMode === "plan" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/10 text-violet-500">
                      Plan
                    </span>
                  )}
                </div>

                {/* Extra menu items */}
                {extraMenuItems && (
                  <div className="flex items-center gap-1">
                    {extraMenuItems}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export const FloatingPromptInput = React.forwardRef<
  FloatingPromptInputRef,
  FloatingPromptInputProps
>(FloatingPromptInputInner);

FloatingPromptInput.displayName = 'FloatingPromptInput';
