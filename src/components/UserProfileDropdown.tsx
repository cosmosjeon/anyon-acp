import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Crown, ChevronDown } from "@/lib/icons";
import { useAuthStore } from '@/stores/authStore';

interface UserProfileDropdownProps {
  onSettingsClick?: () => void;
  /** Show user name next to avatar */
  showName?: boolean;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onSettingsClick, showName = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // w-64 = 16rem = 256px
      const dropdownHeight = 200; // approximate height
      const padding = 8;

      let top = rect.top - padding;
      let left = rect.right + padding;

      // Check if dropdown goes beyond right edge
      if (left + dropdownWidth > window.innerWidth) {
        left = rect.left - dropdownWidth - padding;
      }

      // Check if dropdown goes beyond bottom edge
      if (top + dropdownHeight > window.innerHeight) {
        top = window.innerHeight - dropdownHeight - padding;
      }

      // Check if dropdown goes beyond top edge
      if (top < padding) {
        top = padding;
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleAccountSettings = () => {
    onSettingsClick?.();
    setIsOpen(false);
  };

  // Get user initials for avatar


  if (!user) return null;

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
          className="w-64 bg-popover border border-border rounded-lg shadow-lg z-[9999] overflow-hidden"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                <User className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">구독 플랜</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
                <Crown size={10} className="text-yellow-500" />
                <span className="text-xs font-medium">출시 예정</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleAccountSettings}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-3"
            >
              <User size={14} />
              <span>계정 설정</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive hover:text-destructive transition-colors flex items-center gap-3"
            >
              <LogOut size={14} />
              <span>로그아웃</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2 p-1.5 rounded-md hover:bg-accent transition-colors ${showName ? 'pr-2.5' : ''}`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-border flex-shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>

        {/* User Name - Only when showName is true */}
        {showName && user?.name && (
          <span className="text-sm truncate max-w-[120px]">{user.name}</span>
        )}

        {/* Chevron - Only when showName is true */}
        {showName && (
          <ChevronDown
            size={12}
            className={`text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </motion.button>

      {/* Dropdown Menu - Rendered via Portal */}
      {createPortal(dropdownMenu, document.body)}
    </div>
  );
};
