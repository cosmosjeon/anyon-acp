import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { MousePointer2, RefreshCw } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { TooltipSimple } from '@/components/ui/tooltip-modern';
import { cn } from '@/lib/utils';
import { injectSelectorScript } from '@/lib/previewSelector';
import { usePreviewStore } from '@/stores/previewStore';
import { usePreviewMessages } from '@/hooks/usePreviewMessages';
import { SelectedComponentsDisplay } from '@/components/preview/SelectedComponentsDisplay';

interface UXPreviewPanelProps {
  /** HTML content to render in the preview */
  content: string;
  /** Optional project path */
  projectPath?: string;
  /** Optional class name */
  className?: string;
}

/**
 * UX Preview Panel with Element Selection
 * Used in PlanningDocsPanel for UX Design step only
 * Provides element selection capability for wireframe HTML content
 */
export const UXPreviewPanel: React.FC<UXPreviewPanelProps> = ({
  content,
  projectPath: _projectPath, // Reserved for future use
  className,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    setIframeRef,
    isSelectorActive,
    activateSelector,
    deactivateSelector,
    selectedComponents,
    clearSelectedComponents,
    setComponentSelectorInitialized,
  } = usePreviewStore();

  // Handle iframe messages (component selection, etc.)
  usePreviewMessages();

  // Inject selector script and create data URL
  const iframeSrc = useMemo(() => {
    if (!content) return '';
    const injectedHtml = injectSelectorScript(content);
    // Create data URL for iframe
    return `data:text/html;charset=utf-8,${encodeURIComponent(injectedHtml)}`;
  }, [content]);

  // Register iframe ref with store
  useEffect(() => {
    if (iframeRef.current) {
      setIframeRef(iframeRef.current);
    }
    return () => {
      setIframeRef(null);
      setComponentSelectorInitialized(false);
    };
  }, [setIframeRef, setComponentSelectorInitialized]);

  // Toggle selector mode
  const handleToggleSelector = useCallback(() => {
    if (isSelectorActive) {
      deactivateSelector();
    } else {
      activateSelector();
    }
  }, [isSelectorActive, activateSelector, deactivateSelector]);

  // Refresh preview
  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      // Force reload by resetting src
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 50);
    }
    // Clear selections on refresh
    clearSelectedComponents();
  }, [clearSelectedComponents]);

  // Keyboard shortcut for selector (Ctrl/Cmd + Shift + C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const hasCtrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      if (e.key.toLowerCase() === 'c' && e.shiftKey && hasCtrlOrMeta) {
        e.preventDefault();
        handleToggleSelector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleSelector]);

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Preview iframe area */}
      <div className="flex-1 relative overflow-hidden">
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full h-full border-0 bg-white"
            title="UX Wireframe Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No content to preview
          </div>
        )}
      </div>

      {/* Selected components display */}
      {selectedComponents.length > 0 && (
        <SelectedComponentsDisplay className="border-t" />
      )}

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
        <div className="flex items-center gap-1">
          {/* Selector toggle */}
          <TooltipSimple
            content={isSelectorActive ? '요소 선택 해제 (Ctrl+Shift+C)' : '요소 선택 (Ctrl+Shift+C)'}
            side="top"
          >
            <Button
              variant={isSelectorActive ? 'default' : 'ghost'}
              size="sm"
              onClick={handleToggleSelector}
              className={cn(
                'h-8 gap-2',
                isSelectorActive && 'bg-purple-600 hover:bg-purple-700 text-white'
              )}
            >
              <MousePointer2 className="h-4 w-4" />
              <span className="text-xs">요소 선택</span>
            </Button>
          </TooltipSimple>
        </div>

        <div className="flex items-center gap-1">
          {/* Refresh button */}
          <TooltipSimple content="새로고침" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipSimple>
        </div>
      </div>
    </div>
  );
};

export default UXPreviewPanel;
