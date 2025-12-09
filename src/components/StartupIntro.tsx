import { AnimatePresence, motion } from "framer-motion";
import logoSpiral from "../assets/logo-anyon.png";
import logoText from "../../ANYON.png";
import type { CSSProperties } from "react";


/**
 * StartupIntro - a lightweight startup overlay shown on app launch.
 * - Non-interactive; auto-fades after parent hides it via the `visible` prop.
 * - Uses existing shimmer/rotating-symbol styles from shimmer.css.
 */
export function StartupIntro({ visible }: { visible: boolean }) {

  // Simple entrance animations only
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background"
          aria-hidden="true"
        >
          {/* Ambient radial glow */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              background:
                "radial-gradient(800px circle at 50% 55%, var(--color-primary)/8, transparent 65%)",
              pointerEvents: "none",
            } as CSSProperties}
          />

          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(1200px circle at 50% 40%, transparent 60%, rgba(0,0,0,0.25))",
            }}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="relative flex flex-col items-center justify-center gap-1"
          >

            {/* ANYON logos - spiral left, text right */}
            <motion.div
              className="relative z-10 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
            >
              <img
                src={logoSpiral}
                alt="ANYON"
                className="h-20 w-20"
              />
              <img
                src={logoText}
                alt="ANYON"
                className="h-12"
              />
            </motion.div>


          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StartupIntro;
