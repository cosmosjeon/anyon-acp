import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single string using clsx and tailwind-merge.
 * This utility function helps manage dynamic class names and prevents Tailwind CSS conflicts.
 * 
 * @param inputs - Array of class values that can be strings, objects, arrays, etc.
 * @returns A merged string of class names with Tailwind conflicts resolved
 * 
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500", { "text-white": isActive })
 * // Returns: "px-2 py-1 bg-blue-500 text-white" (when condition and isActive are true)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 


/**
 * Platform detection utilities for cross-platform UI rendering.
 * Uses navigator.platform and navigator.userAgent for browser-safe detection
 * that works in both Tauri and web preview environments.
 */
export const platform = {
  /**
   * Check if the current platform is macOS
   */
  isMac: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return (
      navigator.platform?.toLowerCase().includes('mac') ||
      navigator.userAgent?.toLowerCase().includes('mac os x') ||
      false
    );
  },

  /**
   * Check if the current platform is Windows
   */
  isWindows: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return (
      navigator.platform?.toLowerCase().includes('win') ||
      navigator.userAgent?.toLowerCase().includes('windows') ||
      false
    );
  },

  /**
   * Check if the current platform is Linux
   */
  isLinux: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent?.toLowerCase() || '';
    const pl = navigator.platform?.toLowerCase() || '';
    // Exclude Android from Linux detection
    return (
      (pl.includes('linux') || ua.includes('linux')) &&
      !ua.includes('android')
    );
  },

  /**
   * Get the current platform name
   */
  getName: (): 'mac' | 'windows' | 'linux' | 'unknown' => {
    if (platform.isMac()) return 'mac';
    if (platform.isWindows()) return 'windows';
    if (platform.isLinux()) return 'linux';
    return 'unknown';
  },
};
// test: 1766467207
