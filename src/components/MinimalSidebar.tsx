import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  Folder,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, TooltipSimple } from '@/components/ui/tooltip-modern';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { api, type Project } from '@/lib/api';
import logoAnyon from '@/assets/logo-anyon.png';
import logoText from '@/assets/anyon-logo-text.png';

interface MinimalSidebarProps {
  /** Whether settings is active */
  settingsActive?: boolean;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when logo is clicked */
  onLogoClick?: () => void;
  /** Callback when project is selected */
  onProjectSelect?: (project: Project) => void;
  /** Custom className */
  className?: string;
}

/**
 * MinimalSidebar - Expandable sidebar for project list screen
 * Collapsed: Logo, Settings, User Profile
 * Expanded: + Recent Projects list
 */
export const MinimalSidebar: React.FC<MinimalSidebarProps> = ({
  settingsActive = false,
  onSettingsClick,
  onLogoClick,
  onProjectSelect,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Load recent projects when expanded
  useEffect(() => {
    if (expanded) {
      const loadProjects = async () => {
        try {
          const projectList = await api.listRegisteredProjects();
          setProjects(projectList.slice(0, 10)); // Recent 10 projects
        } catch (err) {
          console.error('Failed to load projects:', err);
        }
      };
      loadProjects();
    }
  }, [expanded]);

  const collapsedWidth = 56;
  const expandedWidth = 240;

  return (
    <TooltipProvider>
      <motion.div
        animate={{ width: expanded ? expandedWidth : collapsedWidth }}
        transition={{ duration: 0.2 }}
        className={cn(
          'h-full flex flex-col bg-background border-r border-border/50 flex-shrink-0 overflow-hidden',
          className
        )}
      >
        {/* Header - Logo */}
        <div className="h-14 flex items-center border-b border-border/30 px-3 gap-2">
          {expanded ? (
            <button
              onClick={onLogoClick}
              className="flex items-center gap-1.5 rounded-lg flex-shrink-0 cursor-pointer"
            >
              <img src={logoAnyon} alt="ANYON" className="w-8 h-8 object-contain" />
              <img src={logoText} alt="ANYON" className="h-5 object-contain" />
            </button>
          ) : (
            <TooltipSimple content="Home" side="right">
              <button
                onClick={onLogoClick}
                className="p-1 rounded-lg flex-shrink-0 cursor-pointer"
              >
                <img src={logoAnyon} alt="ANYON" className="w-8 h-8 object-contain" />
              </button>
            </TooltipSimple>
          )}
        </div>

        {/* Expand/Collapse Toggle */}
        <div className="px-2 py-2">
          {expanded ? (
            <motion.button
              onClick={() => setExpanded(!expanded)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-full h-9 flex items-center gap-2 px-2 rounded-md transition-colors',
                'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs whitespace-nowrap">접기</span>
            </motion.button>
          ) : (
            <TooltipSimple content="Expand" side="right">
              <motion.button
                onClick={() => setExpanded(!expanded)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-full h-9 flex items-center gap-2 px-2 rounded-md transition-colors',
                  'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <ChevronRight className="w-4 h-4 flex-shrink-0 mx-auto" />
              </motion.button>
            </TooltipSimple>
          )}
        </div>

        {/* Recent Projects - Only when expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 overflow-y-auto border-t border-border/30"
            >
              <div className="p-2">
                <button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left">최근 프로젝트</span>
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 transition-transform',
                    showAllProjects && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {showAllProjects && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 space-y-0.5"
                    >
                      {projects.length === 0 ? (
                        <div className="px-2 py-2 text-xs text-muted-foreground text-center">
                          프로젝트 없음
                        </div>
                      ) : (
                        projects.map((project) => {
                          const name = project.path.split('/').pop() || project.path;
                          return (
                            <motion.button
                              key={project.id}
                              onClick={() => onProjectSelect?.(project)}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                            >
                              <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate text-left">{name}</span>
                            </motion.button>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer when collapsed */}
        {!expanded && <div className="flex-1" />}

        {/* Bottom Actions */}
        <div className={cn(
          'flex flex-col py-2 border-t border-border/30',
          expanded ? 'px-2' : ''
        )}>
          {/* Settings */}
          {expanded ? (
            <motion.button
              onClick={onSettingsClick}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'h-10 flex items-center gap-2 transition-colors rounded-md px-2 w-full',
                settingsActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">설정</span>
            </motion.button>
          ) : (
            <TooltipSimple content="Settings" side="right">
              <motion.button
                onClick={onSettingsClick}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'h-10 flex items-center gap-2 transition-colors rounded-md w-full justify-center',
                  settingsActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
              </motion.button>
            </TooltipSimple>
          )}

          {/* User Profile */}
          <div className={cn(
            'h-10 flex items-center',
            expanded ? 'px-2' : 'justify-center'
          )}>
            <UserProfileDropdown showName={expanded} />
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default MinimalSidebar;
