import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Folder,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  
  Sun,
  Moon,
} from 'lucide-react';
import { VideoLoader } from '@/components/VideoLoader';
import { cn } from '@/lib/utils';
import { TooltipProvider, TooltipSimple } from '@/components/ui/tooltip-modern';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { api, type Session, type Project } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import logoAnyon from '@/assets/logo-anyon.png';
import logoText from '@/assets/anyon-logo-text.png';

interface WorkspaceSidebarProps {
  /** Current project path */
  projectPath: string;
  /** Tab type for session filtering */
  tabType: 'mvp' | 'maintenance';
  /** Current session ID */
  currentSessionId?: string | null;
  /** Callback when new session is requested */
  onNewSession?: () => void;
  /** Callback when session is selected */
  onSessionSelect?: (session: Session | null) => void;
  /** Whether file panel is open */
  filePanelOpen?: boolean;
  /** Callback to toggle file panel */
  onFilePanelToggle?: () => void;
  /** Whether right panel is visible */
  rightPanelVisible?: boolean;
  /** Callback to toggle right panel */
  onRightPanelToggle?: () => void;
  /** Callback when logo is clicked (go to projects) */
  onLogoClick?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Callback when collapse toggle is clicked */
  onCollapseToggle?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * WorkspaceSidebar - Full-featured sidebar for workspace screens
 * Shows: Logo, New Session, Session List, Project Switcher, Files, Panel Toggle, Settings, User
 */
export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  projectPath,
  tabType: _tabType, // Reserved for future session filtering
  currentSessionId,
  onNewSession,
  onSessionSelect,
  filePanelOpen = false,
  onFilePanelToggle,
  rightPanelVisible = true,
  onRightPanelToggle,
  onLogoClick,
  onSettingsClick,
  collapsed = false,
  onCollapseToggle,
  className,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Load sessions for current project
  useEffect(() => {
    const loadSessions = async () => {
      if (!projectPath) return;
      setLoadingSessions(true);
      try {
        // Get project ID from path
        const projectList = await api.listRegisteredProjects();
        const currentProject = projectList.find(p => p.path === projectPath);
        if (currentProject) {
          const allSessions = await api.getProjectSessions(currentProject.id);
          setSessions(allSessions.slice(0, 20)); // Limit to recent 20
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, [projectPath]);

  // Load projects for switcher
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await api.listRegisteredProjects();
        setProjects(projectList);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  const handleSessionClick = (session: Session) => {
    onSessionSelect?.(session);
  };

  const collapsedWidth = 56;
  const expandedWidth = 256;

  return (
    <TooltipProvider>
      <motion.div
        animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
        transition={{ duration: 0.2 }}
        className={cn(
          'h-full flex flex-col bg-background border-r border-border/50 flex-shrink-0 overflow-hidden',
          className
        )}
      >
        {/* Header - Logo */}
        <div className="h-14 flex items-center gap-2 px-3 border-b border-border/30">
          <TooltipSimple content="Back to Projects" side="right">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-1.5 rounded-lg flex-shrink-0 cursor-pointer"
            >
              <img src={logoAnyon} alt="ANYON" className="w-8 h-8 object-contain" />
              {!collapsed && (
                <img src={logoText} alt="ANYON" className="h-5 object-contain" />
              )}
            </button>
          </TooltipSimple>
        </div>

        {/* Collapse Toggle */}
        <div className="px-2 py-2">
          {collapsed ? (
            <TooltipSimple content="펼치기" side="right">
              <motion.button
                onClick={onCollapseToggle}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-full h-9 flex items-center justify-center rounded-md transition-colors',
                  'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </TooltipSimple>
          ) : (
            <motion.button
              onClick={onCollapseToggle}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-full h-9 flex items-center gap-2 px-2 rounded-md transition-colors',
                'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs whitespace-nowrap">접기</span>
            </motion.button>
          )}
        </div>

        {/* New Session Button */}
        <div className="px-2 pb-2 border-b border-border/30">
          {collapsed ? (
            <TooltipSimple content="새 대화" side="right">
              <motion.button
                onClick={onNewSession}
                whileTap={{ scale: 0.95 }}
                className="w-full h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </TooltipSimple>
          ) : (
            <motion.button
              onClick={onNewSession}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">새 대화</span>
            </motion.button>
          )}
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {!collapsed && (
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                최근 대화
              </div>
            )}
            {loadingSessions ? (
              <div className="flex items-center justify-center py-4">
                <VideoLoader size="sm" />
              </div>
            ) : sessions.length === 0 ? (
              !collapsed && (
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                  아직 대화가 없습니다
                </div>
              )
            ) : (
              <div className="space-y-0.5">
                {sessions.map((session) => (
                  collapsed ? (
                    <TooltipSimple
                      key={session.id}
                      content={session.first_message?.substring(0, 50) || `Session ${session.id.slice(0, 8)}`}
                      side="right"
                    >
                      <motion.button
                        onClick={() => handleSessionClick(session)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'w-full h-9 flex items-center justify-center rounded-md transition-colors',
                          currentSessionId === session.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </motion.button>
                    </TooltipSimple>
                  ) : (
                    <motion.button
                      key={session.id}
                      onClick={() => handleSessionClick(session)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
                        currentSessionId === session.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs truncate">
                        {session.first_message?.substring(0, 30) || `Session ${session.id.slice(0, 8)}`}
                      </span>
                    </motion.button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Switcher */}
        {!collapsed && (
          <div className="border-t border-border/30">
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Folder className="w-4 h-4" />
                <span className="flex-1 text-left truncate text-xs">프로젝트 전환</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', showProjectDropdown && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {showProjectDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="max-h-48 overflow-y-auto">
                      {projects.map((project) => {
                        const name = project.path.split('/').pop() || project.path;
                        const isActive = project.path === projectPath;
                        return (
                          <button
                            key={project.id}
                            onClick={() => {
                              setShowProjectDropdown(false);
                              // Navigate to project - this would need to be handled by parent
                              if (!isActive && onLogoClick) {
                                // For now, go to projects list. Could be enhanced to switch directly
                                onLogoClick();
                              }
                            }}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className={cn(
          'flex border-t border-border/30 py-2',
          collapsed ? 'flex-col items-center gap-1 px-2' : 'items-center justify-between px-2'
        )}>
          {/* Files Toggle */}
          <TooltipSimple content="Files (Cmd+B)" side={collapsed ? 'right' : 'top'}>
            <motion.button
              onClick={onFilePanelToggle}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2 rounded-md transition-colors',
                filePanelOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Folder className="w-4 h-4" />
            </motion.button>
          </TooltipSimple>

          {/* Panel Toggle */}
          <TooltipSimple content={rightPanelVisible ? 'Hide Panel' : 'Show Panel'} side={collapsed ? 'right' : 'top'}>
            <motion.button
              onClick={onRightPanelToggle}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2 rounded-md transition-colors',
                rightPanelVisible
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {rightPanelVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </motion.button>
          </TooltipSimple>

          {/* Theme Toggle */}
          <TooltipSimple content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} side={collapsed ? 'right' : 'top'}>
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </TooltipSimple>

          {/* Settings */}
          <TooltipSimple content="Settings" side={collapsed ? 'right' : 'top'}>
            <motion.button
              onClick={onSettingsClick}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </TooltipSimple>

          {/* User Profile */}
          <UserProfileDropdown />
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default WorkspaceSidebar;
