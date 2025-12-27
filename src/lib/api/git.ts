/**
 * Git API Module
 * Provides git operations for version control and retry/rollback functionality
 */

import { invoke } from '@tauri-apps/api/core';

export interface GitDiffSummary {
  commits_to_rollback: number;
  files_changed: number;
  changed_files: string[];
  stat_summary: string;
}

export interface GitLogEntry {
  sha: string;        // Short SHA (7 chars)
  fullSha: string;    // Full SHA (mapped from full_sha)
  message: string;    // First line of commit message
  author: string;     // Author name
  timestamp: number;  // Unix timestamp
}

// Raw response from Rust (snake_case)
interface GitLogEntryRaw {
  sha: string;
  full_sha: string;
  message: string;
  author: string;
  timestamp: number;
}

export interface NpxRunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number | null;
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

  /**
   * Get git commit history (저장 시점 기록)
   */
  async getLog(projectPath: string, limit = 50): Promise<GitLogEntry[]> {
    const raw = await invoke<GitLogEntryRaw[]>('get_git_log', { projectPath, limit });
    return raw.map(entry => ({
      sha: entry.sha,
      fullSha: entry.full_sha,
      message: entry.message,
      author: entry.author,
      timestamp: entry.timestamp,
    }));
  },

  /**
   * Get count of changed files (저장되지 않은 변경 개수)
   */
  async getChangesCount(projectPath: string): Promise<number> {
    return invoke<number>('get_git_changes_count', { projectPath });
  },

  /**
   * Stage all changes (git add -A)
   */
  async addAll(projectPath: string): Promise<NpxRunResult> {
    return invoke<NpxRunResult>('git_add_all', { projectPath });
  },

  /**
   * Create a commit with message (저장 시점 생성)
   */
  async commit(projectPath: string, message: string): Promise<NpxRunResult> {
    return invoke<NpxRunResult>('git_commit', { projectPath, message });
  },

  /**
   * Get current branch name (현재 버전)
   */
  async getCurrentBranch(projectPath: string): Promise<string> {
    const result = await invoke<NpxRunResult>('git_current_branch', { projectPath });
    return result.stdout.trim();
  },
};

export default gitApi;
