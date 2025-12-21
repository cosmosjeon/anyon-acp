import React from "react";

import { AlertCircle, CheckCircle2, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const BackgroundAgentsPanel: React.FC<{
  agents: Array<{
    agentId: string;
    description: string;
    status: 'launched' | 'running' | 'completed' | 'error';
    subagentType?: string;
  }>;
}> = ({ agents }) => {
  if (agents.length === 0) return null;

  const completed = agents.filter(a => a.status === 'completed').length;
  const total = agents.length;

  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
      {/* Header with progress */}
      <div className="flex items-center gap-3">
        <Users className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">Background Agents</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {completed}/{total} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      {/* Individual agents */}
      <div className="space-y-2">
        {agents.map(agent => (
          <div key={agent.agentId} className="flex items-center gap-2 text-xs">
            {(agent.status === 'running' || agent.status === 'launched') && (
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
            )}
            {agent.status === 'completed' && (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            )}
            {agent.status === 'error' && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
            <span className="truncate flex-1">{agent.description}</span>
            {agent.subagentType && (
              <Badge variant="outline" className="text-[10px] px-1">
                {agent.subagentType}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Widget for Skill tool - displays skill name with collapsible prompt
 */
