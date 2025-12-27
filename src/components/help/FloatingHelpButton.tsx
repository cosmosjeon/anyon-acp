import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { open } from '@tauri-apps/plugin-shell';
import { MessageCircle } from '@/lib/icons';
import { SUPPORT_CONFIG } from '@/constants/support';
import { cn } from '@/lib/utils';

interface FloatingHelpButtonProps {
  className?: string;
}

export function FloatingHelpButton({ className }: FloatingHelpButtonProps) {
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
    </div>
  );
}
