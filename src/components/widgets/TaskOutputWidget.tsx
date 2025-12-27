import React, { useState } from "react";

import { AlertCircle, CheckCircle2, ChevronRight, Clock, Loader2, ExternalLink } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolResult } from "@/types/widgets";
import { extractResultContent } from "@/lib/extractResultContent";

interface TaskOutputWidgetProps {
  task_id?: string;
  task_type?: string;
  status?: string;
  retrieval_status?: string;
  output?: string;
  block?: boolean;
  timeout?: number;
  result?: ToolResult;
}

export const TaskOutputWidget: React.FC<TaskOutputWidgetProps> = ({
  task_id,
  task_type,
  status,
  retrieval_status,
  output,
  result,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract data from result if available
  const resultContent = result ? extractResultContent(result) : null;

  // Parse result content to extract fields
  const parseResultContent = (content: string) => {
    const parsed: Record<string, string> = {};

    // Match XML-like tags
    const tagMatches = content.matchAll(/<(\w+)>([^<]*)<\/\1>/g);
    for (const match of tagMatches) {
      parsed[match[1]] = match[2].trim();
    }

    return parsed;
  };

  const parsedResult = resultContent ? parseResultContent(resultContent) : {};

  // Use parsed values or fall back to props
  const effectiveTaskId = parsedResult.task_id || task_id;
  const effectiveTaskType = parsedResult.task_type || task_type;
  const effectiveStatus = parsedResult.status || status;
  const effectiveRetrievalStatus = parsedResult.retrieval_status || retrieval_status;
  const effectiveOutput = parsedResult.output || output;

  // Determine display status based on retrieval_status and status
  const displayStatus = effectiveRetrievalStatus || effectiveStatus || (result ? "completed" : "running");

  const statusConfig: Record<string, {
    icon: React.ReactNode;
    text: string;
    bgClass: string;
    textClass: string;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
  }> = {
    running: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />,
      text: "Running...",
      bgClass: "border-purple-500/20 bg-purple-500/5",
      textClass: "text-purple-600 dark:text-purple-400",
      badgeVariant: "secondary",
    },
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
      text: "Completed",
      bgClass: "border-green-500/20 bg-green-500/5",
      textClass: "text-green-600 dark:text-green-400",
      badgeVariant: "default",
    },
    timeout: {
      icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
      text: "Timeout",
      bgClass: "border-amber-500/20 bg-amber-500/5",
      textClass: "text-amber-600 dark:text-amber-400",
      badgeVariant: "outline",
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
      text: "Error",
      bgClass: "border-red-500/20 bg-red-500/5",
      textClass: "text-red-600 dark:text-red-400",
      badgeVariant: "destructive",
    },
  };

  const config = statusConfig[displayStatus] || statusConfig.running;

  // Parse output to extract tool calls
  const parseToolCalls = (outputStr: string): Array<{ tool: string; params: string }> => {
    if (!outputStr) return [];

    const toolCalls: Array<{ tool: string; params: string }> = [];
    const lines = outputStr.split("\n");

    for (const line of lines) {
      const match = line.match(/\[Tool:\s*(\w+)\]\s*(.+)/);
      if (match) {
        toolCalls.push({
          tool: match[1],
          params: match[2],
        });
      }
    }

    return toolCalls;
  };

  const toolCalls = effectiveOutput ? parseToolCalls(effectiveOutput) : [];
  const hasOutput = effectiveOutput && effectiveOutput.trim().length > 0;

  return (
    <div className={cn("rounded-lg border p-3 space-y-2", config.bgClass)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Task Output</span>
          {effectiveTaskType && (
            <Badge variant="outline" className="text-xs">
              {effectiveTaskType}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {config.icon}
          <span className={cn("text-xs font-medium", config.textClass)}>
            {config.text}
          </span>
        </div>
      </div>

      {/* Task ID */}
      {effectiveTaskId && (
        <div className="ml-6 text-xs text-muted-foreground/60">
          Task ID: <code className="bg-muted px-1 rounded">{effectiveTaskId}</code>
        </div>
      )}

      {/* Output Section (collapsible) */}
      {hasOutput && (
        <div className="ml-6 space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
            <span>Output</span>
            {toolCalls.length > 0 && (
              <Badge variant="secondary" className="text-xs h-4 px-1">
                {toolCalls.length} tool calls
              </Badge>
            )}
          </button>

          {isExpanded && (
            <div className="rounded-lg border bg-muted/30 p-3 max-h-80 overflow-y-auto space-y-2">
              {toolCalls.length > 0 ? (
                toolCalls.map((call, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                      {call.tool}
                    </Badge>
                    <code className="text-muted-foreground font-mono break-all">
                      {call.params}
                    </code>
                  </div>
                ))
              ) : (
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {effectiveOutput}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status-specific messages */}
      {displayStatus === "timeout" && !hasOutput && (
        <div className="ml-6 text-xs text-amber-600 dark:text-amber-400">
          Task is still running. Output will be available when completed.
        </div>
      )}
    </div>
  );
};
