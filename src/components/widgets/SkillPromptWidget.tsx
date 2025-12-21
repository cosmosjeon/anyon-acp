import React, { useState } from "react";

import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const SkillPromptWidget: React.FC<{
  skillName?: string;
  content: string;
}> = ({ skillName, content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/10 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">
            {skillName ? `Skill: ${skillName}` : 'Skill Loaded'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {content.length.toLocaleString()} chars
          </span>
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform text-muted-foreground",
            isExpanded && "rotate-90"
          )} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-purple-500/10">
          <div className="mt-3 max-h-96 overflow-y-auto rounded-lg bg-muted/30 p-3">
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Widget for displaying session initialization info
 */
