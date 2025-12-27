import { apiCall } from '../apiAdapter';
import type { Project, Session, AnyonInstallationStatus, NpxRunResult } from './types';

/**
 * Projects API for managing Claude Code projects
 */
export const projectsApi = {
  /**
   * Lists all projects in the ~/.claude/projects directory
   * @returns Promise resolving to an array of projects
   */
  async listProjects(): Promise<Project[]> {
    try {
      return await apiCall<Project[]>("list_projects");
    } catch (error) {
      console.error("Failed to list projects:", error);
      throw error;
    }
  },

  /**
   * Creates a new project for the given directory path
   * @param path - The directory path to create a project for
   * @returns Promise resolving to the created project
   */
  async createProject(path: string): Promise<Project> {
    try {
      return await apiCall<Project>('create_project', { path });
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  },

  /**
   * Retrieves sessions for a specific project
   * @param projectId - The ID of the project to retrieve sessions for
   * @returns Promise resolving to an array of sessions
   */
  async getProjectSessions(projectId: string): Promise<Session[]> {
    try {
      return await apiCall<Session[]>('get_project_sessions', { projectId });
    } catch (error) {
      console.error("Failed to get project sessions:", error);
      throw error;
    }
  },

  /**
   * Check if anyon-agents is installed in the project
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to installation status
   */
  async checkAnyonInstalled(projectPath: string): Promise<AnyonInstallationStatus> {
    try {
      return await apiCall<AnyonInstallationStatus>('check_anyon_installed', { projectPath });
    } catch (error) {
      console.error('Failed to check anyon installation:', error);
      return {
        is_installed: false,
        has_claude_dir: false,
        missing_dirs: ['.anyon', '.claude'],
      };
    }
  },

  /**
   * Check if a directory is a git repository
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to true if it's a git repo
   */
  async checkIsGitRepo(projectPath: string): Promise<boolean> {
    try {
      return await apiCall<boolean>('check_is_git_repo', { projectPath });
    } catch (error) {
      console.error('Failed to check git repo:', error);
      return false;
    }
  },

  /**
   * Initialize a git repository in the specified directory
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to the command result
   */
  async initGitRepo(projectPath: string): Promise<NpxRunResult> {
    try {
      return await apiCall<NpxRunResult>('init_git_repo', { projectPath });
    } catch (error) {
      console.error('Failed to init git repo:', error);
      throw error;
    }
  },

  /**
   * Git add all files
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to the command result
   */
  async gitAddAll(projectPath: string): Promise<NpxRunResult> {
    return apiCall<NpxRunResult>('git_add_all', { projectPath });
  },

  /**
   * Git commit with message
   * @param projectPath - The absolute path to the project
   * @param message - Commit message
   * @returns Promise resolving to the command result
   */
  async gitCommit(projectPath: string, message: string): Promise<NpxRunResult> {
    return apiCall<NpxRunResult>('git_commit', { projectPath, message });
  },

  /**
   * Git set remote origin
   * @param projectPath - The absolute path to the project
   * @param remoteUrl - Remote repository URL
   * @returns Promise resolving to the command result
   */
  async gitSetRemote(projectPath: string, remoteUrl: string): Promise<NpxRunResult> {
    return apiCall<NpxRunResult>('git_set_remote', { projectPath, remoteUrl });
  },

  /**
   * Git push to remote
   * @param projectPath - The absolute path to the project
   * @param remoteUrl - Remote repository URL
   * @param token - GitHub Personal Access Token
   * @param branch - Branch name (defaults to 'main')
   * @returns Promise resolving to the command result
   */
  async gitPush(projectPath: string, remoteUrl: string, token: string, branch?: string): Promise<NpxRunResult> {
    return apiCall<NpxRunResult>('git_push', { projectPath, remoteUrl, token, branch });
  },

  /**
   * Git status (porcelain format)
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to the command result
   */
  async gitStatus(projectPath: string): Promise<NpxRunResult> {
    return apiCall<NpxRunResult>('git_status', { projectPath });
  },

  /**
   * Get current git branch
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to the command result
   */
  async gitCurrentBranch(projectPath: string): Promise<NpxRunResult> {
    return apiCall<NpxRunResult>('git_current_branch', { projectPath });
  },
};
