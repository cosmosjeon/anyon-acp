import React, { useState } from "react";

import { Activity, Hash } from "@/lib/icons";

export const UsageStatsWidget: React.FC<{
  totalCost?: number;
  durationMs?: number;
  numTurns?: number;
  inputTokens?: number;
  outputTokens?: number;
  modelUsage?: Record<string, {
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
  }>;
}> = ({ totalCost, durationMs, numTurns, inputTokens, outputTokens, modelUsage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Session Stats</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {totalCost !== undefined && (
          <span className="flex items-center gap-1">
            <span className="font-mono">${totalCost.toFixed(4)}</span>
          </span>
        )}
        {durationMs !== undefined && (
          <span>{(durationMs / 1000).toFixed(1)}s</span>
        )}
        {numTurns !== undefined && (
          <span>{numTurns} turns</span>
        )}
        {(inputTokens !== undefined || outputTokens !== undefined) && (
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {inputTokens?.toLocaleString() || 0} in / {outputTokens?.toLocaleString() || 0} out
          </span>
        )}
      </div>

      {modelUsage && Object.keys(modelUsage).length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Hide model breakdown' : 'Show model breakdown'}
          </button>

          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-border/50 space-y-1 text-xs">
              {Object.entries(modelUsage).map(([model, usage]) => (
                <div key={model} className="flex items-center justify-between">
                  <span className="font-mono text-muted-foreground">{model.split('-').slice(-2).join('-')}</span>
                  <span className="text-muted-foreground">
                    ${usage.costUSD.toFixed(4)} ({usage.inputTokens + usage.outputTokens} tokens)
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Widget for WebSearch tool - displays web search query and results
 */
