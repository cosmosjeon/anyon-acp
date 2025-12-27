import React, { useState } from "react";

import { Bot, Cpu, Server, Sparkles, Wrench } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const SessionInfoWidget: React.FC<{
  model: string;
  tools?: string[];
  agents?: string[];
  skills?: string[];
  mcpServers?: Array<{ name: string; status: string }>;
  version?: string;
}> = ({ model, tools = [], agents = [], skills = [], mcpServers = [], version }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const connectedMcp = mcpServers.filter(s => s.status === 'connected').length;

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{model}</span>
          {version && (
            <Badge variant="outline" className="text-xs">
              v{version}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Wrench className="h-3 w-3" />
          <span>{tools.length} tools</span>
        </div>
        <div className="flex items-center gap-1">
          <Bot className="h-3 w-3" />
          <span>{agents.length} agents</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>{skills.length} skills</span>
        </div>
        <div className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          <span>{connectedMcp} MCP</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-2 text-xs">
          {mcpServers.length > 0 && (
            <div>
              <span className="font-medium">MCP Servers:</span>
              <div className="ml-2 mt-1 space-y-1">
                {mcpServers.map(server => (
                  <div key={server.name} className="flex items-center gap-2">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      server.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span>{server.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Widget for displaying usage statistics
 */
