import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Shield, Check } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks";
import { analytics } from "@/lib/analytics";
import logoAnyon from "@/assets/logo-anyon.png";

const CONSENT_KEY = "anyon-analytics-consent";

interface AnalyticsConsentModalProps {
  open: boolean;
  onAccept: () => void;
}

export function AnalyticsConsentModal({ open, onAccept }: AnalyticsConsentModalProps) {
  const { t } = useTranslation();

  const handleAccept = async () => {
    try {
      // Save consent to localStorage
      localStorage.setItem(CONSENT_KEY, "true");

      // Enable analytics
      await analytics.enable();

      // Track consent event
      analytics.track("auth_consent_granted", {
        timestamp: new Date().toISOString(),
      });

      onAccept();
    } catch (error) {
      console.error("Failed to grant consent:", error);
      // Still allow user to proceed
      onAccept();
    }
  };

  const privacyPoints = [
    t("analyticsConsent.privacyPoints.anonymous"),
    t("analyticsConsent.privacyPoints.noPII"),
    t("analyticsConsent.privacyPoints.aggregated"),
  ];

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Header with logo */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <img
                src={logoAnyon}
                alt="Anyon"
                className="w-12 h-12 mb-4 logo-invert"
              />
              <h2 className="text-xl font-semibold text-center">
                {t("analyticsConsent.title")}
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {t("analyticsConsent.description")}
              </p>
            </div>

            {/* Privacy points */}
            <div className="px-6 py-4">
              <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {t("analyticsConsent.privacyTitle")}
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1.5">
                      {privacyPoints.map((point, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Accept button */}
            <div className="px-6 pb-6 pt-2">
              <Button
                onClick={handleAccept}
                className="w-full h-11 text-base font-medium"
              >
                {t("analyticsConsent.continueButton")}
              </Button>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Helper function to check if user has consented
export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}
