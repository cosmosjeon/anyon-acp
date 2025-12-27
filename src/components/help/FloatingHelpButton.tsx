import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { open } from '@tauri-apps/plugin-shell';
import { MessageCircle, Minus } from '@/lib/icons';
import { SUPPORT_CONFIG } from '@/constants/support';
import { cn } from '@/lib/utils';

interface FloatingHelpButtonProps {
  className?: string;
}

const STORAGE_KEY = 'helpButtonMinimized';

export function FloatingHelpButton({ className }: FloatingHelpButtonProps) {
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const toggleMinimized = useCallback((value: boolean) => {
    setIsMinimized(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  const handleClick = useCallback(async () => {
    await open(SUPPORT_CONFIG.KAKAO_CHANNEL_URL);
  }, []);

  return (
    <div
      className={cn('fixed z-50', className)}
      style={{
        bottom: SUPPORT_CONFIG.UI.FLOATING_BUTTON_OFFSET,
        right: SUPPORT_CONFIG.UI.FLOATING_BUTTON_OFFSET,
      }}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => toggleMinimized(false)}
            className="h-3 w-3 rounded-full bg-primary shadow-md focus:outline-none"
            whileHover={{ scale: 1.8, boxShadow: '0 2px 8px rgba(217, 119, 87, 0.5)' }}
            whileTap={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            aria-label="도움 요청 버튼 열기"
          />
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex items-center gap-1"
          >
            <motion.button
              onClick={() => toggleMinimized(true)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-sm hover:bg-muted focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="도움 요청 버튼 최소화"
            >
              <Minus size={12} />
            </motion.button>
            <motion.button
              onClick={handleClick}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 30px rgba(217, 119, 87, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17,
              }}
              aria-label="외주 신청 또는 도움 요청"
            >
              <MessageCircle size={18} />
              <span>외주 신청 or 도움 요청</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
