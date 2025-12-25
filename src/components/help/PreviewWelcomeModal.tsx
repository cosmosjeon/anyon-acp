import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Eye, MessageCircle, Sparkles, Tag, BookOpen } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface PreviewWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPreview: () => void;
  onContactSupport: () => void;
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

export function PreviewWelcomeModal({
  isOpen,
  onClose,
  onViewPreview,
  onContactSupport,
}: PreviewWelcomeModalProps) {
  const handleViewPreview = () => {
    onViewPreview();
    onClose();
  };

  const handleContact = () => {
    onContactSupport();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-6 pt-8">
              {/* Success Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              {/* Title */}
              <h2 className="text-center text-xl font-semibold text-foreground mb-2">
                개발이 완료되었습니다!
              </h2>

              {/* Description */}
              <p className="text-center text-muted-foreground text-sm mb-6">
                프리뷰에서 결과물을 확인해보세요.
              </p>

              {/* Primary Action */}
              <Button
                onClick={handleViewPreview}
                className="w-full mb-3 h-12 text-base font-medium"
                size="lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                프리뷰 확인하기
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    또는
                  </span>
                </div>
              </div>

              {/* Secondary Action - Outsourcing */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      전문 개발팀의 도움이 필요하신가요?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      현재 Anyon은 <span className="font-medium text-foreground">베타 서비스</span>로 운영 중이에요.<br />
                      베타 기간 동안 특별 혜택을 드리고 있어요.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>Anyon 앱 문의 고객 <span className="font-medium text-foreground">시중가 50% 할인</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>유지보수를 위한 <span className="font-medium text-foreground">Anyon 활용 교육</span> 제공</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleContact}
                      className="w-full border-primary/30 hover:bg-primary/10"
                    >
                      카카오톡으로 상담하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
