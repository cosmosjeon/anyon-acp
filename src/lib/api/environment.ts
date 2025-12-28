/**
 * Environment API Module
 * Provides environment checking and setup utilities for development tools
 */

import { invoke } from '@tauri-apps/api/core';

export interface DependencyStatus {
  name: string;
  is_installed: boolean;
  version: string | null;
  path: string | null;
  source: string; // "system", "bundled", "homebrew", "nvm", etc.
  meets_minimum: boolean;
  minimum_version: string;
}

export interface EnvironmentStatus {
  nodejs: DependencyStatus;
  git: DependencyStatus;
  claude_code: DependencyStatus;
  all_ready: boolean;
  platform: 'macos' | 'windows' | 'linux';
  package_manager: string | null;
}

export const environmentApi = {
  /**
   * Check the status of all required development dependencies
   */
  async checkEnvironmentStatus(): Promise<EnvironmentStatus> {
    return invoke<EnvironmentStatus>('check_environment_status');
  },

  /**
   * Open the system's default terminal application
   */
  async openTerminal(): Promise<void> {
    return invoke<void>('open_terminal');
  },

  /**
   * Open a URL in the default browser
   */
  async openUrl(url: string): Promise<void> {
    return invoke<void>('open_url', { url });
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  },
};

export default environmentApi;
