/**
 * Git API Module
 * Provides git operations for the retry/rollback functionality
 */

import { invoke } from '@tauri-apps/api/core';

export interface GitDiffSummary {
  commits_to_rollback: number;
  files_changed: number;
  changed_files: string[];
  stat_summary: string;
}

export const gitApi = {
  /**
   * Get the current HEAD commit SHA
   */
  async getHeadSha(projectPath: string): Promise<string> {
    return invoke<string>('get_git_head_sha', { projectPath });
  },

  /**
   * Check if the repository has uncommitted changes
   */
  async hasUncommittedChanges(projectPath: string): Promise<boolean> {
    return invoke<boolean>('has_git_uncommitted_changes', { projectPath });
  },

  /**
   * Reset the repository to a specific commit (WARNING: destructive!)
   */
  async resetHard(projectPath: string, commitSha: string): Promise<void> {
    return invoke<void>('git_reset_hard', { projectPath, commitSha });
  },

  /**
   * Get a summary of changes between current HEAD and target commit
   */
  async getDiffSummary(projectPath: string, targetCommitSha: string): Promise<GitDiffSummary> {
    return invoke<GitDiffSummary>('get_git_diff_summary', { projectPath, targetCommitSha });
  },
};

export default gitApi;
