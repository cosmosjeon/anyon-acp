import { apiCall } from '../apiAdapter';
import type { DevSession } from './types';

/**
 * Sessions API
 * For managing Claude Code sessions and development workflows
 */
export const sessionsApi = {
  /**
   * Opens a new Claude Code session
   * @param path - Optional path to open the session in
   * @returns Promise resolving when the session is opened
   */
  async openNewSession(path?: string): Promise<string> {
    try {
      return await apiCall<string>("open_new_session", { path });
    } catch (error) {
      console.error("Failed to open new session:", error);
      throw error;
    }
  },

  /**
   * Loads the JSONL history for a specific session
   */
  async loadSessionHistory(sessionId: string, projectId: string): Promise<any[]> {
    return apiCall("load_session_history", { sessionId, projectId });
  },

  /**
   * Executes a new interactive Claude Code session with streaming output
   * @param executionMode - Optional execution mode: "execute" (default, bypass permissions) or "plan" (allows questions)
   */
  async executeClaudeCode(projectPath: string, prompt: string, model: string, executionMode?: string): Promise<void> {
    return apiCall("execute_claude_code", { projectPath, prompt, model, executionMode });
  },

  /**
   * Continues an existing Claude Code conversation with streaming output
   * @param executionMode - Optional execution mode: "execute" (default, bypass permissions) or "plan" (allows questions)
   */
  async continueClaudeCode(projectPath: string, prompt: string, model: string, executionMode?: string): Promise<void> {
    return apiCall("continue_claude_code", { projectPath, prompt, model, executionMode });
  },

  /**
   * Resumes an existing Claude Code session by ID with streaming output
   * @param executionMode - Optional execution mode: "execute" (default, bypass permissions) or "plan" (allows questions)
   */
  async resumeClaudeCode(projectPath: string, sessionId: string, prompt: string, model: string, executionMode?: string): Promise<void> {
    return apiCall("resume_claude_code", { projectPath, sessionId, prompt, model, executionMode });
  },

  /**
   * Cancels the currently running Claude Code execution
   * @param sessionId - Optional session ID to cancel a specific session
   */
  async cancelClaudeExecution(sessionId?: string): Promise<void> {
    return apiCall("cancel_claude_execution", { sessionId });
  },

  /**
   * Lists all currently running Claude sessions
   * @returns Promise resolving to list of running Claude sessions
   */
  async listRunningClaudeSessions(): Promise<any[]> {
    return apiCall("list_running_claude_sessions");
  },

  /**
   * Gets live output from a Claude session
   * @param sessionId - The session ID to get output for
   * @returns Promise resolving to the current live output
   */
  async getClaudeSessionOutput(sessionId: string): Promise<string> {
    return apiCall("get_claude_session_output", { sessionId });
  },

  /**
   * Start development workflow
   */
  async startDevWorkflow(projectPath: string, model: string): Promise<void> {
    return apiCall("start_dev_workflow", { projectPath, model });
  },

  /**
   * Stop development workflow
   */
  async stopDevWorkflow(projectPath: string): Promise<void> {
    return apiCall("stop_dev_workflow", { projectPath });
  },

  /**
   * Get development workflow status
   */
  async getDevWorkflowStatus(projectPath: string): Promise<DevSession> {
    return apiCall("get_dev_workflow_status", { projectPath });
  },
};
