import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCode, FolderOpen } from "@/lib/icons";
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface CodeViewerProps {
  /**
   * File path to display in header
   */
  filePath?: string;
  /**
   * Code content to display
   */
  code?: string;
  /**
   * Programming language for syntax highlighting
   */
  language?: string;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * Detects language from file extension
 */
const getLanguageFromPath = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    kt: 'kotlin',
    swift: 'swift',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    dockerfile: 'dockerfile',
    xml: 'xml',
    toml: 'toml',
  };
  return langMap[ext] || 'text';
};

/**
 * CodeViewer - Read-only code display with syntax highlighting
 *
 * Uses react-syntax-highlighter for code display.
 * Shows empty state when no file is selected.
 */
export const CodeViewer: React.FC<CodeViewerProps> = ({
  filePath,
  code,
  language,
  className,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const detectedLanguage = language || (filePath ? getLanguageFromPath(filePath) : 'text');

  // Empty state - no file selected
  if (!filePath || !code) {
    return (
      <div className={cn("h-full p-3", className)}>
        <div className="h-full flex flex-col rounded-lg border border-border bg-muted/30 shadow-sm">
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium mb-1">No file selected</p>
            <p className="text-xs text-center max-w-[200px]">
              Select a file from the chat or file tree to view its contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full p-3", className)}>
      <div className={cn(
        "h-full flex flex-col rounded-lg border border-border shadow-sm overflow-hidden",
        isDark ? "bg-[#282c34]" : "bg-background"
      )}>
        {/* File header */}
        <div className={cn(
          "flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b",
          isDark ? "bg-[#21252b] border-[#181a1f]" : "bg-muted/50 border-border"
        )}>
          <FileCode className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate" title={filePath}>
            {filePath}
          </span>
        </div>

        {/* Code content */}
        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            language={detectedLanguage}
            style={isDark ? oneDark : oneLight}
            showLineNumbers
            wrapLines
            customStyle={{
              margin: 0,
              padding: '12px',
              fontSize: '13px',
              lineHeight: '1.5',
              background: 'transparent',
              minHeight: '100%',
            }}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: isDark ? '#636d83' : '#999999',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
