import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  X,
  Command,
  Search,
  Globe,
  FolderOpen,
  Zap,
  FileCode,
  Terminal,
  AlertCircle,
  User,
  Building2
} from "@/lib/icons";
import type { SlashCommand } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTrackEvent, useFeatureAdoptionTracking } from "@/hooks";

interface SlashCommandPickerProps {
  /**
   * The project path for loading project-specific commands
   */
  projectPath?: string;
  /**
   * Callback when a command is selected
   */
  onSelect: (command: SlashCommand) => void;
  /**
   * Callback to close the picker
   */
  onClose: () => void;
  /**
   * Initial search query (text after /)
   */
  initialQuery?: string;
  /**
   * Optional className for styling
   */
  className?: string;
}

// Get icon for command based on its properties
const getCommandIcon = (command: SlashCommand) => {
  // If it has bash commands, show terminal icon
  if (command.has_bash_commands) return Terminal;

  // If it has file references, show file icon
  if (command.has_file_references) return FileCode;

  // If it accepts arguments, show zap icon
  if (command.accepts_arguments) return Zap;

  // Based on scope
  if (command.scope === "project") return FolderOpen;
  if (command.scope === "user") return Globe;

  // Default
  return Command;
};

// Get Korean label for scope
const getScopeLabel = (scope: string): string => {
  switch (scope) {
    case "default": return "시스템";
    case "user": return "내 명령어";
    case "project": return "프로젝트 명령어";
    default: return "명령어";
  }
};

// Get icon for scope
const getScopeIcon = (scope: string) => {
  switch (scope) {
    case "default": return Command;
    case "user": return User;
    case "project": return Building2;
    default: return Command;
  }
};

/**
 * SlashCommandPicker component - Autocomplete UI for slash commands
 *
 * @example
 * <SlashCommandPicker
 *   projectPath="/Users/example/project"
 *   onSelect={(command) => console.log('Selected:', command)}
 *   onClose={() => setShowPicker(false)}
 * />
 */
export const SlashCommandPicker: React.FC<SlashCommandPickerProps> = ({
  projectPath,
  onSelect,
  onClose,
  initialQuery = "",
  className,
}) => {
  const [commands, setCommands] = useState<SlashCommand[]>([]);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const commandListRef = useRef<HTMLDivElement>(null);

  // Analytics tracking
  const trackEvent = useTrackEvent();
  const slashCommandFeatureTracking = useFeatureAdoptionTracking('slash_commands');

  // Load commands on mount or when project path changes
  useEffect(() => {
    loadCommands();
  }, [projectPath]);

  // Filter commands based on search query (no tab filtering)
  useEffect(() => {
    if (!commands.length) {
      setFilteredCommands([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Filter by search query
    let filtered: SlashCommand[];
    if (!query) {
      filtered = [...commands];
    } else {
      filtered = commands.filter(cmd => {
        // Match against command name
        if (cmd.name.toLowerCase().includes(query)) return true;

        // Match against full command
        if (cmd.full_command.toLowerCase().includes(query)) return true;

        // Match against namespace
        if (cmd.namespace && cmd.namespace.toLowerCase().includes(query)) return true;

        // Match against description
        if (cmd.description && cmd.description.toLowerCase().includes(query)) return true;

        return false;
      });

      // Sort by relevance
      filtered.sort((a, b) => {
        // Exact name match first
        const aExact = a.name.toLowerCase() === query;
        const bExact = b.name.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by name starts with
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then alphabetically
        return a.name.localeCompare(b.name);
      });
    }

    setFilteredCommands(filtered);

    // Reset selected index when filtered list changes
    setSelectedIndex(0);
  }, [searchQuery, commands]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case 'Enter':
          e.preventDefault();
          if (filteredCommands.length > 0 && selectedIndex < filteredCommands.length) {
            const command = filteredCommands[selectedIndex];
            trackEvent.slashCommandSelected({
              command_name: command.name,
              selection_method: 'keyboard'
            });
            slashCommandFeatureTracking.trackUsage();
            onSelect(command);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (commandListRef.current) {
      const selectedElement = commandListRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const loadCommands = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always load fresh commands from filesystem
      const loadedCommands = await api.slashCommandsList(projectPath);
      setCommands(loadedCommands);
    } catch (err) {
      console.error("Failed to load slash commands:", err);
      setError(err instanceof Error ? err.message : 'Failed to load commands');
      setCommands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommandClick = (command: SlashCommand) => {
    trackEvent.slashCommandSelected({
      command_name: command.name,
      selection_method: 'click'
    });
    slashCommandFeatureTracking.trackUsage();
    onSelect(command);
  };

  // Group commands by scope
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const key = cmd.scope;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(cmd);
    return acc;
  }, {} as Record<string, SlashCommand[]>);

  // Define scope order for display
  const scopeOrder = ["default", "user", "project"];
  const sortedScopes = Object.keys(groupedCommands).sort(
    (a, b) => scopeOrder.indexOf(a) - scopeOrder.indexOf(b)
  );

  // Update search query from parent
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "absolute bottom-full mb-2 left-0 z-50",
        "w-[500px] h-[400px]",
        "bg-background border border-border rounded-lg shadow-lg",
        "flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">명령어</span>
            {searchQuery && (
              <span className="text-xs text-muted-foreground">
                "{searchQuery}"
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Command List */}
      <div className="flex-1 overflow-y-auto relative" ref={commandListRef}>
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-muted-foreground">불러오는 중...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <span className="text-sm text-destructive text-center">{error}</span>
          </div>
        )}

        {!isLoading && !error && filteredCommands.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {searchQuery ? '명령어를 찾을 수 없습니다' : '사용 가능한 명령어가 없습니다'}
            </span>
          </div>
        )}

        {!isLoading && !error && filteredCommands.length > 0 && (
          <div className="p-2">
            {sortedScopes.map((scope) => {
              const scopeCommands = groupedCommands[scope];
              if (!scopeCommands || scopeCommands.length === 0) return null;

              const ScopeIcon = getScopeIcon(scope);
              const scopeLabel = getScopeLabel(scope);

              return (
                <div key={scope} className="mb-3 last:mb-0">
                  {/* Group Header */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground">
                    <ScopeIcon className="h-3 w-3" />
                    <span>{scopeLabel}</span>
                  </div>

                  {/* Commands in this group */}
                  <div className="space-y-0.5">
                    {scopeCommands.map((command) => {
                      const Icon = getCommandIcon(command);
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={command.id}
                          data-index={globalIndex}
                          onClick={() => handleCommandClick(command)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            "w-full flex items-start gap-3 px-3 py-2 rounded-md",
                            "hover:bg-accent transition-colors",
                            "text-left",
                            isSelected && "bg-accent"
                          )}
                        >
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium">
                                {command.full_command}
                              </span>
                            </div>

                            {command.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {command.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <p className="text-xs text-muted-foreground text-center">
          ↑↓ 이동 • Enter 선택 • Esc 닫기
        </p>
      </div>
    </motion.div>
  );
};
