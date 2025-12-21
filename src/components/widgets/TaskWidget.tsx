import React, { useState } from "react";

import { AlertCircle, Bot, CheckCircle2, ChevronRight, Loader2 } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolResult } from "@/types/widgets";

export const TaskWidget: React.FC<{
  description?: string;
  prompt?: string;
  result?: ToolResult;
  agentId?: string;
  subagentType?: string;
  isAsync?: boolean;
  status?: 'running' | 'completed' | 'error';
}> = ({ description, prompt, result, agentId, subagentType, isAsync, status: propStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResultExpanded, setIsResultExpanded] = useState(false);

  // Determine status based on result
  const status = propStatus || (result ? (result.is_error ? 'error' : 'completed') : 'running');

  const statusConfig = {
    running: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />,
      text: 'Running...',
      bgClass: 'border-purple-500/20 bg-purple-500/5',
      textClass: 'text-purple-600 dark:text-purple-400',
    },
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
      text: 'Completed',
      bgClass: 'border-green-500/20 bg-green-500/5',
      textClass: 'text-green-600 dark:text-green-400',
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
      text: 'Failed',
      bgClass: 'border-red-500/20 bg-red-500/5',
      textClass: 'text-red-600 dark:text-red-400',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("rounded-lg border p-3 space-y-2", config.bgClass)}>
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-4 w-4 text-purple-500" />
            {isAsync && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <span className="text-sm font-medium">
            {isAsync ? 'Background Agent' : 'Sub-Agent Task'}
          </span>
          {subagentType && (
            <Badge variant="outline" className="text-xs">
              {subagentType}
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

      {/* Description */}
      {description && (
        <div className="ml-6">
          <p className="text-sm text-foreground">{description}</p>
        </div>
      )}

      {/* Agent ID for async tasks */}
      {agentId && (
        <div className="ml-6 text-xs text-muted-foreground/60">
          Agent ID: {agentId}
        </div>
      )}

      {/* Task Instructions (collapsible) */}
      {prompt && (
        <div className="ml-6 space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
            <span>Task Instructions</span>
          </button>

          {isExpanded && (
            <div className="rounded-lg border bg-muted/30 p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {prompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Result (when completed) */}
      {result && status !== 'running' && (
        <div className="ml-6 space-y-2 border-t border-border/50 pt-2 mt-2">
          <button
            onClick={() => setIsResultExpanded(!isResultExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", isResultExpanded && "rotate-90")} />
            <span>View Result</span>
          </button>

          {isResultExpanded && result && (
            <div className="rounded-lg border bg-muted/30 p-3 max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {typeof result.content === 'string'
                  ? result.content.slice(0, 1000) + (result.content.length > 1000 ? '...' : '')
                  : JSON.stringify(result, null, 2).slice(0, 1000)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Widget for displaying multiple background agents running in parallel
 */
