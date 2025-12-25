import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "@/lib/icons";
import { cn } from '@/lib/utils';
import { TooltipProvider, TooltipSimple } from '@/components/ui/tooltip-modern';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { useTheme } from '@/hooks/useTheme';
import logoAnyon from '@/assets/logo-anyon.png';
import logoText from '@/assets/anyon-logo-text.png';

interface WorkspaceSidebarProps {
  /** Current project path */
  projectPath: string;
  /** Tab type for session filtering */
  tabType: 'mvp' | 'maintenance';
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
 * WorkspaceSidebar - Minimal sidebar for workspace screens
 * Shows: Logo, Panel Toggle, Settings, Theme, User
 * Session is auto-restored per project via SessionPersistenceService
 */
export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  projectPath: _projectPath,
  tabType: _tabType,
  onLogoClick,
  onSettingsClick,
  collapsed = false,
  onCollapseToggle,
  className,
}) => {
  const { theme, toggleTheme } = useTheme();

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

        {/* Spacer */}
        <div className="flex-1" />

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
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-xs',
                  'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
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
