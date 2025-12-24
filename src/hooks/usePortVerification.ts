import { useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

/**
 * Result from the check_port_alive Tauri command
 */
interface PortCheckResult {
  port: number;
  alive: boolean;
  attempts: number;
  elapsed_ms: number;
}

/**
 * State of port verification
 */
export type PortVerificationState =
  | { status: 'idle' }
  | { status: 'checking'; port: number; currentAttempt: number }
  | { status: 'success'; port: number; attempts: number; elapsedMs: number }
  | { status: 'failed'; port: number; attempts: number; elapsedMs: number; error?: string };

/**
 * Options for port verification
 */
interface VerifyPortOptions {
  /** Interval between polling attempts in ms (default: 500) */
  pollIntervalMs?: number;
  /** Maximum number of attempts (default: 10) */
  maxAttempts?: number;
}

/**
 * Extract port number from a localhost URL
 * Returns null if not a localhost URL or port can't be extracted
 */
export function extractPortFromUrl(url: string): number | null {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    // Only handle localhost variants
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '[::1]') {
      if (urlObj.port) {
        return parseInt(urlObj.port, 10);
      }
      // Default ports if not specified
      return urlObj.protocol === 'https:' ? 443 : 80;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is a localhost URL
 */
export function isLocalhostUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '[::1]';
  } catch {
    return false;
  }
}

/**
 * Hook for verifying if a localhost port is reachable
 *
 * @example
 * ```tsx
 * const { state, verifyPort, cancel, reset } = usePortVerification();
 *
 * // Check if a server is running
 * const isAlive = await verifyPort('http://localhost:3000');
 *
 * // Check state during verification
 * if (state.status === 'checking') {
 *   console.log(`Attempt ${state.currentAttempt}...`);
 * }
 * ```
 */
export function usePortVerification() {
  const [state, setState] = useState<PortVerificationState>({ status: 'idle' });
  const cancelledRef = useRef(false);
  const currentVerificationRef = useRef<number>(0);

  /**
   * Verify if a localhost port is reachable
   * Polls the port until it's alive or max attempts are reached
   *
   * @param url - The localhost URL to verify
   * @param options - Polling options
   * @returns true if the port is reachable, false otherwise
   */
  const verifyPort = useCallback(async (
    url: string,
    options?: VerifyPortOptions
  ): Promise<boolean> => {
    const port = extractPortFromUrl(url);

    if (port === null) {
      setState({
        status: 'failed',
        port: 0,
        attempts: 0,
        elapsedMs: 0,
        error: 'Could not extract port from URL'
      });
      return false;
    }

    // Track this verification to handle cancellation
    const verificationId = ++currentVerificationRef.current;
    cancelledRef.current = false;

    setState({ status: 'checking', port, currentAttempt: 1 });

    try {
      const result = await invoke<PortCheckResult>('check_port_alive', {
        port,
        pollIntervalMs: options?.pollIntervalMs ?? 500,
        maxAttempts: options?.maxAttempts ?? 10,
      });

      // Check if this verification was cancelled or superseded
      if (cancelledRef.current || verificationId !== currentVerificationRef.current) {
        return false;
      }

      if (result.alive) {
        setState({
          status: 'success',
          port,
          attempts: result.attempts,
          elapsedMs: result.elapsed_ms
        });
        return true;
      } else {
        setState({
          status: 'failed',
          port,
          attempts: result.attempts,
          elapsedMs: result.elapsed_ms,
          error: 'Server not responding'
        });
        return false;
      }
    } catch (err) {
      // Check if this verification was cancelled or superseded
      if (cancelledRef.current || verificationId !== currentVerificationRef.current) {
        return false;
      }

      setState({
        status: 'failed',
        port,
        attempts: 0,
        elapsedMs: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      return false;
    }
  }, []);

  /**
   * Cancel the current verification
   */
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setState({ status: 'idle' });
  }, []);

  /**
   * Reset the verification state to idle
   */
  const reset = useCallback(() => {
    cancelledRef.current = true;
    setState({ status: 'idle' });
  }, []);

  return { state, verifyPort, cancel, reset };
}
