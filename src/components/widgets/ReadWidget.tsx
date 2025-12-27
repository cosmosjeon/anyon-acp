import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "@/lib/icons";
import { extractResultContent } from "@/lib/extractResultContent";
import type { FilePathWidgetProps } from "@/types/widgets";
import { ReadResultWidget } from "./ReadResultWidget";

export const ReadWidget: React.FC<FilePathWidgetProps> = ({ filePath, result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If we have a result, show it using the ReadResultWidget
  if (result) {
    const resultContent = extractResultContent(result);
    const fileName = filePath.split('/').pop() || filePath;

    return (
      <div className="space-y-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors w-full"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Read</span>
          <code className="text-sm font-mono bg-background px-2 py-0.5 rounded truncate">
            {fileName}
          </code>
        </button>
        {isExpanded && resultContent && (
          <div className="pl-10 pt-2">
            <ReadResultWidget content={resultContent} filePath={filePath} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
      <FileText className="h-4 w-4 text-primary" />
      <span className="text-sm">Reading file:</span>
      <code className="text-sm font-mono bg-background px-2 py-0.5 rounded flex-1 truncate">
        {filePath}
      </code>
      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        <span>Loading...</span>
      </div>
    </div>
  );
};

/**
 * Widget for Read tool result - shows file content with line numbers
 */
