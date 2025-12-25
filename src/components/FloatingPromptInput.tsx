import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Send,
  Square,
  Image as ImageIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider, TooltipSimple } from "@/components/ui/tooltip-modern";
import { FilePicker } from "./FilePicker";
import { SlashCommandPicker } from "./SlashCommandPicker";
import { ImagePreview } from "./ImagePreview";
import { SelectedComponentsDisplay } from "./preview/SelectedComponentsDisplay";
import { usePreviewStore } from "@/stores/previewStore";
import { ToolsMenu, THINKING_MODES, type ThinkingMode, type ExecutionMode } from "./ToolsMenu";
import { type FileEntry, type SlashCommand } from "@/lib/api";
import type { SelectedElement } from "@/types/preview";

// Conditional import for Tauri APIs
let tauriGetCurrentWindow: any;
let tauriReadFile: any;
try {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    tauriGetCurrentWindow = require("@tauri-apps/api/window").getCurrentWindow;
    tauriReadFile = require("@tauri-apps/plugin-fs").readFile;
  }
} catch (e) {
  console.log('[FloatingPromptInput] Tauri API not available, using web mode');
}

// Re-export ExecutionMode for external use
export type { ExecutionMode } from "./ToolsMenu";

interface FloatingPromptInputProps {
  /**
   * Callback when prompt is sent
   */
  onSend: (
    prompt: string,
    model: "haiku" | "sonnet" | "opus",
    executionMode?: ExecutionMode,
    hiddenContext?: string,
    selectedElement?: SelectedElement | null
  ) => void;
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

  // Preview store - 선택된 요소 연동
  const {
    selectedElement,
    clearSelectedComponents,
    setSelectedElement,
    currentRoute,
    appUrl,
  } = usePreviewStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const unlistenDragDropRef = useRef<(() => void) | null>(null);
  const [textareaHeight, setTextareaHeight] = useState<number>(44);
  const isIMEComposingRef = useRef(false);

  // Convert file to base64 data URL
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle dropped/pasted image files
  const handleImageFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    for (const file of imageFiles) {
      try {
        const base64 = await fileToBase64(file);

        // Add to embeddedImages for preview only (don't add to prompt text)
        setEmbeddedImages(prev => [...prev, base64]);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  }, [fileToBase64]);

  // Setup react-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    onDrop: handleImageFiles,
    accept: { 'image/*': [] },
    disabled: disabled || isLoading,
    noClick: true,
    noKeyboard: true,
  });

  // Update dragActive state based on dropzone
  useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);

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

  // Set up Tauri drag-drop event listener using Tauri 2.x official API
  useEffect(() => {
    let lastDropTime = 0;

    console.log('[DragDrop] useEffect triggered, tauriGetCurrentWindow available:', !!tauriGetCurrentWindow);

    const setupListener = async () => {
      if (!tauriGetCurrentWindow) {
        console.log('[DragDrop] Tauri window API not available - skipping');
        return;
      }

      try {
        if (unlistenDragDropRef.current) {
          unlistenDragDropRef.current();
        }

        console.log('[DragDrop] Getting current window...');
        const currentWindow = tauriGetCurrentWindow();
        console.log('[DragDrop] Got window instance:', currentWindow);
        console.log('[DragDrop] onDragDropEvent method exists:', typeof currentWindow.onDragDropEvent);

        if (typeof currentWindow.onDragDropEvent !== 'function') {
          console.error('[DragDrop] onDragDropEvent is not a function!');
          return;
        }

        console.log('[DragDrop] Registering onDragDropEvent listener...');

        // Use Tauri 2.x official onDragDropEvent API
        unlistenDragDropRef.current = await currentWindow.onDragDropEvent(async (event: any) => {
          console.log('[DragDrop] *** EVENT RECEIVED ***:', event);

          const payload = event.payload;
          if (!payload) return;

          // Handle different event types
          const eventType = payload.type;
          const paths = payload.paths;

          if (eventType === 'enter' || eventType === 'over' || eventType === 'hover') {
            setDragActive(true);
          } else if (eventType === 'leave' || eventType === 'cancel') {
            setDragActive(false);
          } else if (eventType === 'drop' && paths && paths.length > 0) {
            setDragActive(false);

            const currentTime = Date.now();
            if (currentTime - lastDropTime < 200) {
              return;
            }
            lastDropTime = currentTime;

            const droppedPaths = paths as string[];
            const imagePaths = droppedPaths.filter(isImageFile);

            console.log('[DragDrop] Dropped paths:', droppedPaths, 'Image paths:', imagePaths);

            if (imagePaths.length > 0 && tauriReadFile) {
              // Read image files and convert to base64
              for (const imagePath of imagePaths) {
                try {
                  const fileData = await tauriReadFile(imagePath);
                  const ext = imagePath.split('.').pop()?.toLowerCase() || 'png';
                  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
                  const base64 = btoa(
                    new Uint8Array(fileData).reduce((data, byte) => data + String.fromCharCode(byte), '')
                  );
                  const dataUrl = `data:${mimeType};base64,${base64}`;

                  // Add to embeddedImages for preview only (don't add to prompt text)
                  setEmbeddedImages(prev => [...prev, dataUrl]);
                  console.log('[DragDrop] Image added successfully');
                } catch (err) {
                  console.error('Failed to read image file:', imagePath, err);
                }
              }

              setTimeout(() => {
                textareaRef.current?.focus();
              }, 0);
            }
          }
        });

        console.log('[DragDrop] Listener setup complete with onDragDropEvent');
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

    let visiblePrompt = trimmedPrompt;

    // Check for @plan prefix to override execution mode
    let effectiveExecutionMode = selectedExecutionMode;
    if (visiblePrompt.toLowerCase().startsWith('@plan ')) {
      effectiveExecutionMode = 'plan';
      visiblePrompt = visiblePrompt.substring(6).trim(); // Remove @plan prefix
    }

    // Final validation after prefix removal
    if (!visiblePrompt) {
      console.warn('[FloatingPromptInput] Empty prompt after processing');
      return;
    }

    // Build hidden context for AI (not shown in chat)
    let hiddenContext: string | undefined;
    if (selectedElement) {
      hiddenContext = `\n\n---\n**[Hidden Context - Selected UI Element]**\n`;
      hiddenContext += `- Tag: \`<${selectedElement.tag}>\`\n`;
      if (selectedElement.id) {
        hiddenContext += `- ID: \`${selectedElement.id}\`\n`;
      }
      if (selectedElement.classes) {
        hiddenContext += `- Classes: \`${selectedElement.classes}\`\n`;
      }
      if (selectedElement.selector) {
        hiddenContext += `- CSS Selector: \`${selectedElement.selector}\`\n`;
      }
      if (selectedElement.text) {
        const truncatedText = selectedElement.text.length > 100
          ? selectedElement.text.substring(0, 100) + '...'
          : selectedElement.text;
        hiddenContext += `- Text: "${truncatedText}"\n`;
      }
      if (selectedElement.html) {
        const truncatedHtml = selectedElement.html.length > 500
          ? selectedElement.html.substring(0, 500) + '...'
          : selectedElement.html;
        hiddenContext += `- HTML:\n\`\`\`html\n${truncatedHtml}\n\`\`\`\n`;
      }
      // Add route context to help AI find the file
      if (currentRoute) {
        hiddenContext += `- Current Route: \`${currentRoute}\`\n`;
      }
      if (appUrl) {
        hiddenContext += `- App URL: \`${appUrl}\`\n`;
      }
    }

    // Append thinking phrase to visible prompt only
    const thinkingMode = THINKING_MODES.find(m => m.id === selectedThinkingMode);
    if (thinkingMode?.phrase) {
      visiblePrompt = `${visiblePrompt}.\n\n${thinkingMode.phrase}.`;
    }

    try {
      onSend(
        visiblePrompt,
        selectedModel,
        showExecutionMode ? effectiveExecutionMode : undefined,
        hiddenContext,
        selectedElement
      );
      setPrompt("");
      setEmbeddedImages([]);
      setTextareaHeight(44); // Reset height after sending

      // 전송 후 선택된 요소 초기화
      if (selectedElement) {
        clearSelectedComponents();
        setSelectedElement(null);
      }
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

    // Shift+Tab: Toggle Plan/Execute mode
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      setSelectedExecutionMode(prev => prev === "execute" ? "plan" : "execute");
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

    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      await handleImageFiles(imageFiles);
      textareaRef.current?.focus();
    }
  };

  const handleRemoveImage = (index: number) => {
    const imagePath = embeddedImages[index];

    // For base64 images (pasted/dropped), just remove from embeddedImages
    if (imagePath.startsWith('data:')) {
      setEmbeddedImages(prev => prev.filter((_, i) => i !== index));
      return;
    }

    // For file path images, also remove from prompt text
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
      >
        <div
          {...getRootProps()}
          className={cn(
            "mx-auto max-w-3xl relative",
            // Background with theme support
            "bg-card",
            // Smooth rounded corners
            "rounded-2xl",
            // Border - changes based on mode
            "border-2",
            selectedExecutionMode === "plan"
              ? "border-violet-500 ring-2 ring-violet-500/40"
              : "border-border ring-1 ring-border/50",
            // Focus state
            isFocused && selectedExecutionMode !== "plan" && "border-primary/50 ring-primary/20",
            // Drag active
            dragActive && "ring-2 ring-primary/50 border-primary",
            // Smooth transition
            "transition-all duration-300 ease-out",
            // Drop shadow
            "drop-shadow-lg",
            isFocused && "drop-shadow-xl"
          )}
          style={{
            // Inset effects via box-shadow
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.05)"
          }}
        >
          <input {...getInputProps()} />

          {/* Drag overlay */}
          {isDragActive && (
            <div className="absolute inset-0 z-50 bg-primary/90 border-2 border-dashed border-primary-foreground/50 rounded-2xl flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-primary-foreground" />
                <p className="text-lg font-medium text-primary-foreground">
                  이미지를 여기에 놓으세요
                </p>
              </div>
            </div>
          )}

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
                onImageAttach={openFilePicker}
                extraMenuItems={extraMenuItems}
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
                      prompt.trim() && !isLoading && "bg-primary",
                      isLoading && "bg-destructive"
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

            {/* Bottom Bar - Execution mode toggle & badges */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2">
                {/* Execution Mode Badge - Always visible, clickable to toggle */}
                <button
                  onClick={() => setSelectedExecutionMode(prev => prev === "execute" ? "plan" : "execute")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                    selectedExecutionMode === "plan"
                      ? "bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 ring-1 ring-violet-500/30"
                      : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    selectedExecutionMode === "plan" ? "bg-violet-400" : "bg-emerald-500"
                  )} />
                  {selectedExecutionMode === "plan" ? "계획 세우기" : "개발 모드"}
                </button>

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
              </div>

              {/* Shortcut hint */}
              <span className="text-[10px] text-muted-foreground/50">
                Shift+Tab 모드 전환
              </span>
            </div>
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
