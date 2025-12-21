import React from "react";
import { FileText } from "@/lib/icons";
import { extractResultContent } from "@/lib/extractResultContent";
import type { FilePathWidgetProps } from "@/types/widgets";
import { ReadResultWidget } from "./ReadResultWidget";

export const ReadWidget: React.FC<FilePathWidgetProps> = ({ filePath, result }) => {
  // If we have a result, show it using the ReadResultWidget
  if (result) {
    const resultContent = extractResultContent(result);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm">File content:</span>
          <code className="text-sm font-mono bg-background px-2 py-0.5 rounded flex-1 truncate">
            {filePath}
          </code>
        </div>
        {resultContent && <ReadResultWidget content={resultContent} filePath={filePath} />}
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
      {!result && (
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Widget for Read tool result - shows file content with line numbers
 */
