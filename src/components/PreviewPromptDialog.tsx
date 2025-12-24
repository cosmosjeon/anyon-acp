import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "@/lib/icons";
import { usePortVerification, isLocalhostUrl, extractPortFromUrl } from "@/hooks/usePortVerification";

interface PreviewPromptDialogProps {
  url: string;
  isOpen: boolean;
  onOpenPreview: () => void;
  onDismiss: () => void;
  onOpenExternal?: () => void;
}

/**
 * Dialog that appears when a localhost URL is detected.
 * Verifies the server is running before allowing the user to open the preview.
 */
export const PreviewPromptDialog: React.FC<PreviewPromptDialogProps> = ({
  url,
  isOpen,
  onOpenPreview,
  onDismiss,
  onOpenExternal,
}) => {
  const { state, verifyPort, reset } = usePortVerification();
  const isLocalhost = isLocalhostUrl(url);
  const port = extractPortFromUrl(url);

  // Start verification when dialog opens with a localhost URL
  useEffect(() => {
    if (isOpen && isLocalhost && url) {
      verifyPort(url);
    }
  }, [isOpen, url, isLocalhost, verifyPort]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Handle retry
  const handleRetry = () => {
    verifyPort(url);
  };

  // Handle dismiss and cleanup
  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  // Handle open preview
  const handleOpenPreview = () => {
    reset();
    onOpenPreview();
  };

  // Handle open anyway (even if server not verified)
  const handleOpenAnyway = () => {
    reset();
    onOpenPreview();
  };

  // Render content based on verification state
  const renderContent = () => {
    // For non-localhost URLs, skip verification
    if (!isLocalhost) {
      return (
        <>
          <div className="flex items-center gap-3 py-4">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">Open external URL?</p>
              <p className="text-sm text-muted-foreground break-all">{url}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              Cancel
            </Button>
            <Button onClick={handleOpenPreview}>
              Open Preview
            </Button>
          </DialogFooter>
        </>
      );
    }

    // Localhost URL verification states
    switch (state.status) {
      case 'idle':
      case 'checking':
        return (
          <>
            <div className="flex flex-col items-center gap-4 py-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-10 w-10 text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium">Waiting for server...</p>
                <p className="text-sm text-muted-foreground">
                  Checking localhost:{port}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDismiss}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        );

      case 'success':
        return (
          <>
            <div className="flex items-center gap-3 py-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Server is ready!</p>
                <p className="text-sm text-muted-foreground">
                  localhost:{port} is responding
                  {state.attempts > 1 && (
                    <span className="text-xs ml-1">
                      (took {Math.round(state.elapsedMs / 1000)}s)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDismiss}>
                Dismiss
              </Button>
              {onOpenExternal && (
                <Button variant="outline" onClick={onOpenExternal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Browser
                </Button>
              )}
              <Button onClick={handleOpenPreview}>
                Open Preview
              </Button>
            </DialogFooter>
          </>
        );

      case 'failed':
        return (
          <>
            <div className="flex items-center gap-3 py-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm font-medium">Server not responding</p>
                <p className="text-sm text-muted-foreground">
                  Could not connect to localhost:{port}
                  {state.elapsedMs > 0 && (
                    <span className="text-xs ml-1">
                      (tried for {Math.round(state.elapsedMs / 1000)}s)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="ghost" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDismiss}>
                  Dismiss
                </Button>
                <Button variant="secondary" onClick={handleOpenAnyway}>
                  Open Anyway
                </Button>
              </div>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {isLocalhost ? "Local Server Preview" : "Open URL"}
          </DialogTitle>
          <DialogDescription className="break-all">
            {url}
          </DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
