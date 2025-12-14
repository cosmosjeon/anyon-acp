import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  X,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, TooltipSimple } from '@/components/ui/tooltip-modern';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { api, type Session } from '@/lib/api';
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
 * Shows: Logo, New Session, Session List, Panel Toggle, Settings, User
 */
export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  projectPath,
  tabType: _tabType, // Reserved for future session filtering
  currentSessionId,
  onNewSession,
  onSessionSelect,
  onLogoClick,
  onSettingsClick,
  collapsed = false,
  onCollapseToggle,
  className,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSessions, setShowAllSessions] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const INITIAL_SESSION_COUNT = 5;

  // Helper function to format session display text
  const getSessionDisplayText = (session: Session, maxLength: number = 35): string => {
    if (!session) return 'Unknown Session';
    
    if (session.first_message) {
      // Clean up the message - remove newlines and extra spaces
      const cleaned = session.first_message.replace(/\s+/g, ' ').trim();
      return cleaned.substring(0, maxLength) || 'New Session';
    }
    
    // Fallback to date/time if no message
    try {
      const timestamp = session.created_at;
      if (!timestamp || isNaN(timestamp)) {
        return 'New Session';
      }
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) {
        return 'New Session';
      }
      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'New Session';
    }
  };

  // Helper function to group sessions by date
  const groupSessionsByDate = (sessions: Session[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { label: string; sessions: Session[] }[] = [
      { label: '오늘', sessions: [] },
      { label: '어제', sessions: [] },
      { label: '지난 7일', sessions: [] },
      { label: '이전', sessions: [] },
    ];

    sessions.forEach((session) => {
      const sessionDate = new Date(session.created_at * 1000);
      if (sessionDate >= today) {
        groups[0].sessions.push(session);
      } else if (sessionDate >= yesterday) {
        groups[1].sessions.push(session);
      } else if (sessionDate >= lastWeek) {
        groups[2].sessions.push(session);
      } else {
        groups[3].sessions.push(session);
      }
    });

    return groups.filter((group) => group.sessions.length > 0);
  };

  // Filter and group sessions
  const filteredAndGroupedSessions = useMemo(() => {
    let filtered = sessions;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = sessions.filter(
        (session) =>
          session.first_message?.toLowerCase().includes(query) ||
          session.id.toLowerCase().includes(query)
      );
    }
    return groupSessionsByDate(filtered);
  }, [sessions, searchQuery]);

  // Load sessions for current project
  useEffect(() => {
    const loadSessions = async () => {
      if (!projectPath?.trim()) {
        setSessions([]);
        setLoadingSessions(false);
        return;
      }
      
      setLoadingSessions(true);
      try {
        // Get project ID from path
        const projectList = await api.listRegisteredProjects();
        
        if (!projectList || !Array.isArray(projectList)) {
          console.warn('[WorkspaceSidebar] Invalid project list received');
          setSessions([]);
          return;
        }
        
        const currentProject = projectList.find(p => p?.path === projectPath);
        if (currentProject?.id) {
          const allSessions = await api.getProjectSessions(currentProject.id);
          
          if (allSessions && Array.isArray(allSessions)) {
            setSessions(allSessions.slice(0, 20)); // Limit to recent 20
          } else {
            setSessions([]);
          }
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error('[WorkspaceSidebar] Failed to load sessions:', err);
        setSessions([]); // Reset to empty on error
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, [projectPath]);

  const handleSessionClick = (session: Session) => {
    if (!session?.id) {
      console.warn('[WorkspaceSidebar] handleSessionClick called with invalid session');
      return;
    }
    onSessionSelect?.(session);
  };

  const collapsedWidth = 56;
  const expandedWidth = 220;

  return (
    <TooltipProvider>
      <motion.div
        animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
        transition={{ duration: 0.2 }}
        className={cn(
          'h-full flex flex-col bg-background border-r border-border/30 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)] flex-shrink-0 overflow-hidden z-10',
          className
        )}
      >
        {/* Header - Logo */}
        <div className="h-14 flex items-center justify-center px-3 border-b border-border/30">
          <TooltipSimple content="Back to Projects" side="right">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-1.5 rounded-lg cursor-pointer"
            >
              <img src={logoAnyon} alt="ANYON" className="w-9 h-9 object-contain logo-invert" />
              {!collapsed && (
                <img src={logoText} alt="ANYON" className="h-6 object-contain" />
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
        <div className="px-2 pb-2">
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

        {/* Search Bar - Only when expanded */}
        {!collapsed && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="대화 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full h-8 pl-8 pr-8 text-xs rounded-md border transition-colors',
                  'bg-muted/30 border-border/50 placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/50"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              !collapsed && (
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                  아직 대화가 없습니다
                </div>
              )
            ) : collapsed ? (
              // Collapsed mode - just show icons
              <div className="space-y-0.5">
                {sessions.slice(0, 10).map((session) => (
                  <TooltipSimple
                    key={session.id}
                    content={getSessionDisplayText(session, 50)}
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
                ))}
              </div>
            ) : filteredAndGroupedSessions.length === 0 ? (
              // No search results
              <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                '{searchQuery}' 검색 결과 없음
              </div>
            ) : (
              // Expanded mode - show sessions with "show more" button
              <div className="space-y-0.5">
                {(() => {
                  // Flatten all sessions for display
                  const allFilteredSessions = filteredAndGroupedSessions.flatMap(g => g.sessions);
                  const displaySessions = showAllSessions
                    ? allFilteredSessions
                    : allFilteredSessions.slice(0, INITIAL_SESSION_COUNT);
                  const hasMore = allFilteredSessions.length > INITIAL_SESSION_COUNT;
                  const remainingCount = allFilteredSessions.length - INITIAL_SESSION_COUNT;

                  return (
                    <>
                      {displaySessions.map((session) => (
                        <motion.button
                          key={session.id}
                          onClick={() => handleSessionClick(session)}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors group',
                            currentSessionId === session.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs truncate block">
                              {getSessionDisplayText(session)}
                            </span>
                          </div>
                        </motion.button>
                      ))}

                      {/* Show More / Show Less Button */}
                      {hasMore && (
                        <motion.button
                          onClick={() => setShowAllSessions(!showAllSessions)}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 mt-1 rounded-md text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                        >
                          {showAllSessions ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              <span>접기</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              <span>더보기 ({remainingCount})</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={cn(
          'border-t border-border/30 py-2',
          collapsed ? 'flex flex-col items-center gap-1 px-2' : 'px-2 space-y-1'
        )}>
          {collapsed ? (
            // Collapsed mode - icon only with tooltips
            <>
              <TooltipSimple content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} side="right">
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>
              </TooltipSimple>

              <TooltipSimple content="Settings" side="right">
                <motion.button
                  onClick={onSettingsClick}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              </TooltipSimple>

              <UserProfileDropdown />
            </>
          ) : (
            // Expanded mode - icon + text labels
            <>
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-xs"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
                <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
              </motion.button>

              <motion.button
                onClick={onSettingsClick}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-xs"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>설정</span>
              </motion.button>

              <div className="pt-1 border-t border-border/30 mt-1">
                <UserProfileDropdown showName={true} />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default WorkspaceSidebar;
