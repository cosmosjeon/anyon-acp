import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Terminal,
  FolderOpen,
  GitBranch,
  Settings,
  Hash,
  Command
} from "@/lib/icons";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SessionHeaderProps {
  projectPath: string;
  claudeSessionId: string | null;
  showTimeline: boolean;
  onBack: () => void;
  onSelectPath: () => void;
  onToggleTimeline: () => void;
  onProjectSettings?: () => void;
  onSlashCommandsSettings?: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = React.memo(({
  projectPath,
  claudeSessionId,
  showTimeline,
  onBack,
  onSelectPath,
  onToggleTimeline,
  onProjectSettings,
  onSlashCommandsSettings
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background/95 backdrop-blur-sm border-b px-4 py-3 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-semibold">Claude Code Session</span>
          </div>

          
          {!projectPath && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectPath}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Select Project
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {claudeSessionId && (
            <Badge variant="outline" className="text-xs">
              <Hash className="h-3 w-3 mr-1" />
              {claudeSessionId.slice(0, 8)}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTimeline}
            className={cn(
              "h-8 w-8 transition-colors",
              showTimeline && "bg-accent text-accent-foreground"
            )}
          >
            <GitBranch className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onProjectSettings && projectPath && (
                <DropdownMenuItem onClick={onProjectSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Project Settings
                </DropdownMenuItem>
              )}
              {onSlashCommandsSettings && projectPath && (
                <DropdownMenuItem onClick={onSlashCommandsSettings}>
                  <Command className="h-4 w-4 mr-2" />
                  Slash Commands
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
});