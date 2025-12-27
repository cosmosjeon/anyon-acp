import { useRef, useEffect, useCallback } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useEventListeners');

export interface EventListenerConfig<T = any> {
  /**
   * Event name to listen to
   */
  eventName: string;
  /**
   * Handler function for the event
   */
  handler: (payload: T) => void | Promise<void>;
}

/**
 * Custom hook for managing Tauri event listeners with automatic cleanup
 *
 * @param listeners - Array of event listener configurations
 * @param enabled - Whether listeners should be active (default: true)
 *
 * @example
 * const listeners = [
 *   {
 *     eventName: 'agent-output:123',
 *     handler: (payload) => setMessages(prev => [...prev, payload])
 *   },
 *   {
 *     eventName: 'agent-error:123',
 *     handler: (payload) => setError(payload)
 *   }
 * ];
 * useEventListeners(listeners);
 */
export function useEventListeners(
  listeners: EventListenerConfig[],
  enabled: boolean = true
): void {
  const unlistenRefs = useRef<UnlistenFn[]>([]);

  const setupListeners = useCallback(async () => {
    // Clean up existing listeners
    unlistenRefs.current.forEach(unlisten => unlisten());
    unlistenRefs.current = [];

    if (!enabled || listeners.length === 0) {
      return;
    }

    // Set up new listeners
    for (const config of listeners) {
      try {
        const unlisten = await listen(config.eventName, async (event: any) => {
          try {
            await config.handler(event.payload);
          } catch (err) {
            logger.error(`Error in event handler for ${config.eventName}:`, err);
          }
        });
        unlistenRefs.current.push(unlisten);
        logger.debug(`Registered listener for ${config.eventName}`);
      } catch (err) {
        logger.error(`Failed to register listener for ${config.eventName}:`, err);
      }
    }
  }, [listeners, enabled]);

  useEffect(() => {
    setupListeners();

    return () => {
      // Cleanup on unmount
      unlistenRefs.current.forEach(unlisten => unlisten());
      unlistenRefs.current = [];
    };
  }, [setupListeners]);
}

/**
 * Hook for managing event listeners with manual control
 * Returns setup and cleanup functions for manual control
 *
 * @example
 * const { setupListeners, cleanupListeners } = useManualEventListeners();
 *
 * const startListening = async () => {
 *   await setupListeners([
 *     { eventName: 'my-event', handler: handleEvent }
 *   ]);
 * };
 */
export function useManualEventListeners() {
  const unlistenRefs = useRef<UnlistenFn[]>([]);

  const setupListeners = useCallback(async (configs: EventListenerConfig[]) => {
    // Clean up existing listeners first
    unlistenRefs.current.forEach(unlisten => unlisten());
    unlistenRefs.current = [];

    // Set up new listeners
    for (const config of configs) {
      try {
        const unlisten = await listen(config.eventName, async (event: any) => {
          try {
            await config.handler(event.payload);
          } catch (err) {
            logger.error(`Error in event handler for ${config.eventName}:`, err);
          }
        });
        unlistenRefs.current.push(unlisten);
        logger.debug(`Registered listener for ${config.eventName}`);
      } catch (err) {
        logger.error(`Failed to register listener for ${config.eventName}:`, err);
      }
    }

    return unlistenRefs.current;
  }, []);

  const cleanupListeners = useCallback(() => {
    unlistenRefs.current.forEach(unlisten => unlisten());
    unlistenRefs.current = [];
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      cleanupListeners();
    };
  }, [cleanupListeners]);

  return {
    setupListeners,
    cleanupListeners,
    unlistenRefs
  };
}
