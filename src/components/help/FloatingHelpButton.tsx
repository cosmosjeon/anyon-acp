import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, MessageCircle, Bot } from '@/lib/icons';
import { SUPPORT_CONFIG } from '@/constants/support';
import { cn } from '@/lib/utils';

interface FloatingHelpButtonProps {
  onOpenAIChat: () => void;
  className?: string;
}

const menuVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0 },
};

export function FloatingHelpButton({
  onOpenAIChat,
  className,
}: FloatingHelpButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
      // Cmd+Shift+H로 열기/닫기
      if (e.key === 'h' && e.metaKey && e.shiftKey) {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleKakaoClick = useCallback(() => {
    window.open(SUPPORT_CONFIG.KAKAO_CHANNEL_URL, '_blank');
    setIsExpanded(false);
  }, []);

  const handleAIChatClick = useCallback(() => {
    onOpenAIChat();
    setIsExpanded(false);
  }, [onOpenAIChat]);

  return (
    <div
      className={cn(
        'fixed z-50',
        className
      )}
      style={{
        bottom: SUPPORT_CONFIG.UI.FLOATING_BUTTON_OFFSET,
        right: SUPPORT_CONFIG.UI.FLOATING_BUTTON_OFFSET,
      }}
    >
      {/* 확장 메뉴 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-16 right-0 mb-2 w-48 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
          >
            <motion.button
              variants={itemVariants}
              onClick={handleKakaoClick}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <MessageCircle size={18} />
              <span>카카오톡 문의</span>
            </motion.button>
            <motion.button
              variants={itemVariants}
              onClick={handleAIChatClick}
              className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <Bot size={18} />
              <span>AI에게 질문</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 호버 툴팁 */}
      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-popover border border-border px-3 py-2 shadow-lg"
          >
            <div className="text-sm font-medium text-foreground">도움이 필요하세요?</div>
            <div className="text-xs text-muted-foreground">클릭해서 문의하기</div>
            {/* 말풍선 꼬리 */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-border" />
              <div className="absolute top-0 left-0 -ml-[1px] border-8 border-transparent border-l-popover" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 FAB 버튼 */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        )}
        style={{
          width: SUPPORT_CONFIG.UI.FLOATING_BUTTON_SIZE,
          height: SUPPORT_CONFIG.UI.FLOATING_BUTTON_SIZE,
        }}
        initial={false}
        animate={{
          rotate: isExpanded ? 45 : 0,
          scale: 1,
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: '0 8px 30px rgba(217, 119, 87, 0.4)',
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        aria-label="도움말 메뉴"
        aria-expanded={isExpanded}
      >
        <motion.div
          animate={isExpanded ? {} : {
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          {isExpanded ? <X size={24} /> : <Headphones size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
}
