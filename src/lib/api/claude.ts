import { apiCall } from '../apiAdapter';
import type { ClaudeSettings, ClaudeVersionStatus, ClaudeMdFile, ClaudeInstallation, FileEntry, SlashCommand } from './types';

/**
 * Claude authentication status
 */
export interface ClaudeAuthStatus {
  /** Whether user is authenticated */
  is_authenticated: boolean;
  /** Auth method: "oauth" | "api_key" | "none" */
  auth_method: string;
  /** Subscription type: "free" | "pro" | "max" */
  subscription_type?: string;
  /** Token expiry timestamp (ms) */
  expires_at?: number;
  /** Whether token is expired */
  is_expired: boolean;
  /** Display info string */
  display_info?: string;
  /** Error message if any */
  error?: string;
  /** Platform-specific note */
  platform_note?: string;
}

/**
 * API key validation result
 */
export interface ApiKeyValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * API client for Claude Code related operations
 */
export const claudeApi = {
  /**
   * Gets the user's home directory path
   * @returns Promise resolving to the home directory path
   */
  async getHomeDirectory(): Promise<string> {
    try {
      return await apiCall<string>("get_home_directory");
    } catch (error) {
      console.error("Failed to get home directory:", error);
      return "/";
    }
  },

  /**
   * Reads the Claude settings file
   * @returns Promise resolving to the settings object
   */
  async getClaudeSettings(): Promise<ClaudeSettings> {
    try {
      const result = await apiCall<{ data: ClaudeSettings }>("get_claude_settings");
      console.log("Raw result from get_claude_settings:", result);

      // The Rust backend returns ClaudeSettings { data: ... }
      // We need to extract the data field
      if (result && typeof result === 'object' && 'data' in result) {
        return result.data;
      }

      // If the result is already the settings object, return it
      return result as ClaudeSettings;
    } catch (error) {
      console.error("Failed to get Claude settings:", error);
      throw error;
    }
  },

  /**
   * Saves the Claude settings file
   * @param settings - The settings object to save
   * @returns Promise resolving when the settings are saved
   */
  async saveClaudeSettings(settings: ClaudeSettings): Promise<string> {
    try {
      return await apiCall<string>("save_claude_settings", { settings });
    } catch (error) {
      console.error("Failed to save Claude settings:", error);
      throw error;
    }
  },

  /**
   * Reads the CLAUDE.md system prompt file
   * @returns Promise resolving to the system prompt content
   */
  async getSystemPrompt(): Promise<string> {
    try {
      return await apiCall<string>("get_system_prompt");
    } catch (error) {
      console.error("Failed to get system prompt:", error);
      throw error;
    }
  },

  /**
   * Saves the CLAUDE.md system prompt file
   * @param content - The new content for the system prompt
   * @returns Promise resolving when the file is saved
   */
  async saveSystemPrompt(content: string): Promise<string> {
    try {
      return await apiCall<string>("save_system_prompt", { content });
    } catch (error) {
      console.error("Failed to save system prompt:", error);
      throw error;
    }
  },

  /**
   * Checks if Claude Code is installed and gets its version
   * @returns Promise resolving to the version status
   */
  async checkClaudeVersion(): Promise<ClaudeVersionStatus> {
    try {
      return await apiCall<ClaudeVersionStatus>("check_claude_version");
    } catch (error) {
      console.error("Failed to check Claude version:", error);
      throw error;
    }
  },

  /**
   * Get the stored Claude binary path from settings
   * @returns Promise resolving to the path if set, null otherwise
   */
  async getClaudeBinaryPath(): Promise<string | null> {
    try {
      return await apiCall<string | null>("get_claude_binary_path");
    } catch (error) {
      console.error("Failed to get Claude binary path:", error);
      throw error;
    }
  },

  /**
   * Set the Claude binary path in settings
   * @param path - The absolute path to the Claude binary
   * @returns Promise resolving when the path is saved
   */
  async setClaudeBinaryPath(path: string): Promise<void> {
    try {
      return await apiCall<void>("set_claude_binary_path", { path });
    } catch (error) {
      console.error("Failed to set Claude binary path:", error);
      throw error;
    }
  },

  /**
   * List all available Claude installations on the system
   * @returns Promise resolving to an array of Claude installations
   */
  async listClaudeInstallations(): Promise<ClaudeInstallation[]> {
    try {
      return await apiCall<ClaudeInstallation[]>("list_claude_installations");
    } catch (error) {
      console.error("Failed to list Claude installations:", error);
      throw error;
    }
  },

  /**
   * Finds all CLAUDE.md files in a project directory
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to an array of CLAUDE.md files
   */
  async findClaudeMdFiles(projectPath: string): Promise<ClaudeMdFile[]> {
    try {
      return await apiCall<ClaudeMdFile[]>("find_claude_md_files", { projectPath });
    } catch (error) {
      console.error("Failed to find CLAUDE.md files:", error);
      throw error;
    }
  },

  /**
   * Reads a specific CLAUDE.md file
   * @param filePath - The absolute path to the file
   * @returns Promise resolving to the file content
   */
  async readClaudeMdFile(filePath: string): Promise<string> {
    try {
      return await apiCall<string>("read_claude_md_file", { filePath });
    } catch (error) {
      console.error("Failed to read CLAUDE.md file:", error);
      throw error;
    }
  },

  /**
   * Saves a specific CLAUDE.md file
   * @param filePath - The absolute path to the file
   * @param content - The new content for the file
   * @returns Promise resolving when the file is saved
   */
  async saveClaudeMdFile(filePath: string, content: string): Promise<string> {
    try {
      return await apiCall<string>("save_claude_md_file", { filePath, content });
    } catch (error) {
      console.error("Failed to save CLAUDE.md file:", error);
      throw error;
    }
  },

  /**
   * Checks if a file exists
   * @param path - The absolute path to the file
   * @returns Promise resolving to true if file exists
   */
  async checkFileExists(path: string): Promise<boolean> {
    try {
      return await apiCall<boolean>("check_file_exists", { path });
    } catch (error) {
      console.error("Failed to check file existence:", error);
      return false;
    }
  },

  /**
   * Lists files and directories in a given path
   * @param directoryPath - The path to list
   * @param projectRoot - Optional. If provided, validates that directoryPath is within this root (security)
   */
  async listDirectoryContents(directoryPath: string, projectRoot?: string): Promise<FileEntry[]> {
    return apiCall("list_directory_contents", { directoryPath, projectRoot });
  },

  /**
   * Searches for files and directories matching a pattern
   */
  async searchFiles(basePath: string, query: string): Promise<FileEntry[]> {
    return apiCall("search_files", { basePath, query });
  },

  /**
   * Reads the content of a file
   */
  async readFileContent(filePath: string): Promise<string> {
    return apiCall("read_file_content", { filePath });
  },


  /**
   * Lists all available slash commands
   * @param projectPath - Optional project path to include project-specific commands
   * @returns Promise resolving to array of slash commands
   */
  async slashCommandsList(projectPath?: string): Promise<SlashCommand[]> {
    try {
      return await apiCall<SlashCommand[]>("slash_commands_list", { projectPath });
    } catch (error) {
      console.error("Failed to list slash commands:", error);
      throw error;
    }
  },

  /**
   * Gets a single slash command by ID
   * @param commandId - Unique identifier of the command
   * @returns Promise resolving to the slash command
   */
  async slashCommandGet(commandId: string): Promise<SlashCommand> {
    try {
      return await apiCall<SlashCommand>("slash_command_get", { commandId });
    } catch (error) {
      console.error("Failed to get slash command:", error);
      throw error;
    }
  },

  /**
   * Creates or updates a slash command
   * @param scope - Command scope: "project" or "user"
   * @param name - Command name (without prefix)
   * @param namespace - Optional namespace for organization
   * @param content - Markdown content of the command
   * @param description - Optional description
   * @param allowedTools - List of allowed tools for this command
   * @param projectPath - Required for project scope commands
   * @returns Promise resolving to the saved command
   */
  async slashCommandSave(
    scope: string,
    name: string,
    namespace: string | undefined,
    content: string,
    description: string | undefined,
    allowedTools: string[],
    projectPath?: string
  ): Promise<SlashCommand> {
    try {
      return await apiCall<SlashCommand>("slash_command_save", {
        scope,
        name,
        namespace,
        content,
        description,
        allowedTools,
        projectPath
      });
    } catch (error) {
      console.error("Failed to save slash command:", error);
      throw error;
    }
  },

  /**
   * Deletes a slash command
   * @param commandId - Unique identifier of the command to delete
   * @param projectPath - Optional project path for deleting project commands
   * @returns Promise resolving to deletion message
   */
  async slashCommandDelete(commandId: string, projectPath?: string): Promise<string> {
    try {
      return await apiCall<string>("slash_command_delete", { commandId, projectPath });
    } catch (error) {
      console.error("Failed to delete slash command:", error);
      throw error;
    }
  },
};

/**
 * Claude Auth API for managing Claude Code CLI authentication
 */
export const claudeAuthApi = {
  /**
   * Check Claude Code authentication status
   * @returns Promise resolving to auth status
   */
  async check(): Promise<ClaudeAuthStatus> {
    try {
      return await apiCall<ClaudeAuthStatus>('claude_auth_check');
    } catch (error) {
      console.error('Failed to check Claude auth:', error);
      return {
        is_authenticated: false,
        auth_method: 'none',
        is_expired: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Open terminal to run claude login
   * @returns Promise resolving when terminal is opened
   */
  async openTerminal(): Promise<void> {
    try {
      return await apiCall<void>('claude_auth_open_terminal');
    } catch (error) {
      console.error('Failed to open terminal:', error);
      throw error;
    }
  },

  /**
   * Save API key to system keychain
   * @param apiKey - The Anthropic API key
   * @returns Promise resolving when key is saved
   */
  async saveApiKey(apiKey: string): Promise<void> {
    try {
      return await apiCall<void>('claude_auth_save_api_key', { apiKey });
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  },

  /**
   * Delete stored API key
   * @returns Promise resolving when key is deleted
   */
  async deleteApiKey(): Promise<void> {
    try {
      return await apiCall<void>('claude_auth_delete_api_key');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      throw error;
    }
  },

  /**
   * Validate an API key against Anthropic API
   * @param apiKey - The API key to validate
   * @returns Promise resolving to validation result
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      return await apiCall<ApiKeyValidationResult>('claude_auth_validate_api_key', { apiKey });
    } catch (error) {
      console.error('Failed to validate API key:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Logout from Claude OAuth
   * @returns Promise resolving when logout is complete
   */
  async logout(): Promise<void> {
    try {
      return await apiCall<void>('claude_auth_logout');
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  },
};

/**
 * Planning Documents API
 * For managing planning workflow documents in anyon-docs directory
 */
export const planningApi = {
  /**
   * Check if a file exists at the given path
   * @param path - The absolute path to check
   * @returns Promise resolving to true if file exists
   */
  async checkFileExists(path: string): Promise<boolean> {
    try {
      return await apiCall<boolean>('check_file_exists', { path });
    } catch (error) {
      console.error('Failed to check file exists:', error);
      return false;
    }
  },

  /**
   * Read the content of a file
   * @param filePath - The absolute path to the file
   * @returns Promise resolving to the file content
   */
  async readFileContent(filePath: string): Promise<string> {
    try {
      return await apiCall<string>('read_file_content', { filePath });
    } catch (error) {
      console.error('Failed to read file content:', error);
      throw error;
    }
  },

  /**
   * List all files in the anyon-docs directory of a project
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to array of filenames
   */
  async listAnyonDocs(projectPath: string): Promise<string[]> {
    try {
      console.log('[planningApi.listAnyonDocs] Calling with projectPath:', projectPath);
      const result = await apiCall<string[]>('list_anyon_docs', { projectPath });
      console.log('[planningApi.listAnyonDocs] Result:', result);
      return result;
    } catch (error) {
      console.error('Failed to list anyon docs:', error);
      return [];
    }
  },
};
