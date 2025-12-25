import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StopCircle, Clock, Loader2 } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExecutionControlBarProps {
  isExecuting: boolean;
  onStop: () => void;
  elapsedTime?: number; // in seconds
  className?: string;
}

/**
 * Floating control bar shown during agent execution
 * Provides stop functionality and elapsed time
 */
export const ExecutionControlBar: React.FC<ExecutionControlBarProps> = ({
  isExecuting,
  onStop,
  elapsedTime = 0,
  className
}) => {
  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs.toFixed(0)}s`;
    }
    return `${secs.toFixed(1)}s`;
  };

  return (
    <AnimatePresence>
      {isExecuting && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "bg-background/95 backdrop-blur-md border rounded-full shadow-lg",
            "px-6 py-3 flex items-center gap-4",
            className
          )}
        >
          {/* Loading indicator */}
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>

          {/* Status text */}
          <span className="text-sm font-medium">Executing...</span>

          {/* Divider */}
          <div className="h-4 w-px bg-border" />

          {/* Elapsed time */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(elapsedTime)}</span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-border" />

          {/* Stop button */}
          <Button
            size="sm"
            variant="destructive"
            onClick={onStop}
            className="gap-2"
          >
            <StopCircle className="h-3.5 w-3.5" />
            Stop
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 