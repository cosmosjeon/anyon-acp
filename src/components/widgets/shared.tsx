import React from "react";
import { ChevronRight } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/**
 * Collapsible wrapper for tool widgets - displays tools in a collapsed state by default
 */
export const CollapsibleToolWidget: React.FC<{
  icon: React.ReactNode;
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}> = ({ icon, title, summary, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg border bg-muted/20 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors text-left"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0",
            isExpanded && "rotate-90"
          )}
        />
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-sm font-medium truncate">{title}</span>
        {summary && !isExpanded && (
          <span className="text-xs text-muted-foreground truncate ml-auto">{summary}</span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Helper function to detect language from file extension
 */
export const getLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'tsx',
    'js': 'javascript',
    'jsx': 'jsx',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'sh': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
  };
  return languageMap[ext || ''] || 'text';
};
