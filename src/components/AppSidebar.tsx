import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Folder,
  Clock,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, TooltipSimple } from '@/components/ui/tooltip-modern';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { useTheme } from '@/hooks/useTheme';
import logoAnyon from '@/assets/logo-anyon.png';

type NavItem = 'chat' | 'files' | 'history' | 'settings';

interface AppSidebarProps {
  /** Current active navigation item */
  activeNav?: NavItem;
  /** Callback when nav item is clicked */
  onNavClick?: (item: NavItem) => void;
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
  /** Callback when back button is clicked */
  onBackClick?: () => void;
  /** Whether to show back button */
  showBackButton?: boolean;
  /** Whether navigation items are disabled (e.g., no project selected) */
  navDisabled?: boolean;
  /** Whether to show right panel toggle */
  showRightPanelToggle?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * AppSidebar - Reusable sidebar component for all screens
 *
 * Features:
 * - Logo that navigates to project list
 * - Navigation items (Chat, Files, History)
 * - Right panel toggle
 * - Back button
 * - User profile dropdown
 */
export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeNav,
  onNavClick,
  filePanelOpen = false,
  onFilePanelToggle,
  rightPanelVisible = true,
  onRightPanelToggle,
  onLogoClick,
  onBackClick,
  showBackButton = false,
  navDisabled = false,
  showRightPanelToggle = true,
  className,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (item: NavItem) => {
    if (navDisabled) return;
    if (item === 'files' && onFilePanelToggle) {
      onFilePanelToggle();
    } else if (onNavClick) {
      onNavClick(item);
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'h-full w-14 flex flex-col bg-background border-r border-border/30 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)] flex-shrink-0 overflow-hidden z-10',
          className
        )}
      >
        {/* Logo - Back to Projects */}
        <div className="h-14 flex items-center justify-center px-3 border-b border-border/30">
          <TooltipSimple content="Projects" side="right">
            <button
              onClick={onLogoClick}
              className="rounded-lg cursor-pointer"
            >
              <img src={logoAnyon} alt="ANYON" className="w-9 h-9 object-contain logo-invert" />
            </button>
          </TooltipSimple>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col py-2">
          <TooltipSimple content={navDisabled ? "Chat (Select a project)" : "Chat"} side="right">
            <motion.button
              onClick={() => handleNavClick('chat')}
              whileTap={navDisabled ? undefined : { scale: 0.95 }}
              className={cn(
                'w-full h-11 flex items-center justify-center transition-colors',
                navDisabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : activeNav === 'chat'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
              )}
              disabled={navDisabled}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>
          </TooltipSimple>

          <TooltipSimple content={navDisabled ? "Files (Select a project)" : "Files (Cmd+B)"} side="right">
            <motion.button
              onClick={() => handleNavClick('files')}
              whileTap={navDisabled ? undefined : { scale: 0.95 }}
              className={cn(
                'w-full h-11 flex items-center justify-center transition-colors',
                navDisabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : filePanelOpen
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
              )}
              disabled={navDisabled}
            >
              <Folder className="w-5 h-5" />
            </motion.button>
          </TooltipSimple>

          <TooltipSimple content={navDisabled ? "History (Select a project)" : "History"} side="right">
            <motion.button
              onClick={() => handleNavClick('history')}
              whileTap={navDisabled ? undefined : { scale: 0.95 }}
              className={cn(
                'w-full h-11 flex items-center justify-center transition-colors',
                navDisabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : activeNav === 'history'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
              )}
              disabled={navDisabled}
            >
              <Clock className="w-5 h-5" />
            </motion.button>
          </TooltipSimple>
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col py-2 border-t border-border/30">
          {/* Right Panel Toggle */}
          {showRightPanelToggle && onRightPanelToggle && (
            <TooltipSimple
              content={rightPanelVisible ? 'Hide Panel (Cmd+\\)' : 'Show Panel (Cmd+\\)'}
              side="right"
            >
              <motion.button
                onClick={onRightPanelToggle}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-full h-11 flex items-center justify-center transition-colors',
                  rightPanelVisible
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {rightPanelVisible ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </motion.button>
            </TooltipSimple>
          )}

          {/* Back Button */}
          {showBackButton && onBackClick && (
            <TooltipSimple content="Back" side="right">
              <motion.button
                onClick={onBackClick}
                whileTap={{ scale: 0.95 }}
                className="w-full h-11 flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </TooltipSimple>
          )}

          {/* Theme Toggle */}
          <TooltipSimple content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} side="right">
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.95 }}
              className="w-full h-11 flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </TooltipSimple>

          {/* Settings */}
          <TooltipSimple content="Settings" side="right">
            <motion.button
              onClick={() => onNavClick?.('settings')}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-full h-11 flex items-center justify-center transition-colors',
                activeNav === 'settings'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent'
              )}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </TooltipSimple>

          {/* User Profile */}
          <div className="flex items-center justify-center h-11">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AppSidebar;
