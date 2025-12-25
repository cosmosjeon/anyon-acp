import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * Represents a message that can be retried
 */
export interface RetryableMessage {
  /** Unique identifier for this message/process */
  processId: string;
  /** The original prompt text */
  prompt: string;
  /** Index of this message in the conversation */
  messageIndex: number;
  /** Timestamp when this message was sent */
  timestamp: string;
}

/**
 * Context state for managing prompt retry/fork functionality
 */
interface RetryContextState {
  /** ID of the message currently being edited for retry */
  activeRetryProcessId: string | null;
  /** Set the active retry process ID */
  setActiveRetryProcessId: (processId: string | null) => void;
  /** Check if a process is "greyed out" (comes after the active retry point) */
  isProcessGreyed: (processId: string, messageIndex: number) => boolean;
  /** The message index where retry is being initiated */
  retryFromIndex: number | null;
  /** Set the retry starting point */
  setRetryFromIndex: (index: number | null) => void;
  /** Clear all retry state */
  clearRetryState: () => void;
  /** Check if currently in retry mode */
  isRetryMode: boolean;
}

const RetryContext = createContext<RetryContextState | null>(null);

interface RetryProviderProps {
  children: ReactNode;
}

/**
 * Provider component for retry/fork functionality.
 * Manages the state for editing and retrying previous prompts.
 */
export function RetryProvider({ children }: RetryProviderProps) {
  const [activeRetryProcessId, setActiveRetryProcessId] = useState<string | null>(null);
  const [retryFromIndex, setRetryFromIndex] = useState<number | null>(null);

  const isRetryMode = activeRetryProcessId !== null;

  const isProcessGreyed = useCallback((_processId: string, messageIndex: number): boolean => {
    // If not in retry mode, nothing is greyed
    if (retryFromIndex === null) return false;
    // Grey out messages that come after the retry point
    return messageIndex > retryFromIndex;
  }, [retryFromIndex]);

  const clearRetryState = useCallback(() => {
    setActiveRetryProcessId(null);
    setRetryFromIndex(null);
  }, []);

  const handleSetActiveRetryProcessId = useCallback((processId: string | null) => {
    setActiveRetryProcessId(processId);
    if (processId === null) {
      setRetryFromIndex(null);
    }
  }, []);

  const value = useMemo((): RetryContextState => ({
    activeRetryProcessId,
    setActiveRetryProcessId: handleSetActiveRetryProcessId,
    isProcessGreyed,
    retryFromIndex,
    setRetryFromIndex,
    clearRetryState,
    isRetryMode,
  }), [
    activeRetryProcessId,
    handleSetActiveRetryProcessId,
    isProcessGreyed,
    retryFromIndex,
    setRetryFromIndex,
    clearRetryState,
    isRetryMode,
  ]);

  return (
    <RetryContext.Provider value={value}>
      {children}
    </RetryContext.Provider>
  );
}

/**
 * Hook to access retry context
 * @throws Error if used outside RetryProvider
 */
export function useRetry(): RetryContextState {
  const context = useContext(RetryContext);
  if (!context) {
    throw new Error('useRetry must be used within a RetryProvider');
  }
  return context;
}

/**
 * Hook to access retry context with safe fallback (returns null if not in provider)
 */
export function useRetryOptional(): RetryContextState | null {
  return useContext(RetryContext);
}
