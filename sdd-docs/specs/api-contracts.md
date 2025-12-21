# API Contracts

> Complete API documentation for all interfaces

## Overview

ANYON has three API layers:

| Layer | Protocol | Count | Purpose |
|-------|----------|-------|---------|
| **Tauri IPC** | invoke() | 165+ | Desktop backend commands |
| **Auth Server** | HTTP REST | 15 | Authentication & settings |
| **Event System** | Tauri Events | 6+ | Real-time streaming |

---

## Tauri IPC Commands

### Project Management

#### list_projects

Lists all Claude Code projects from `~/.claude/projects/`.

```typescript
// Request
invoke<Project[]>('list_projects')

// Response
interface Project {
  id: string;
  name: string;
  path: string;
  lastAccessed: string;
}
```

#### create_project

Creates a new Claude Code project.

```typescript
// Request
invoke<Project>('create_project', {
  name: string,
  path: string
})
```

#### get_project_sessions

Gets all sessions for a project.

```typescript
// Request
invoke<Session[]>('get_project_sessions', {
  projectId: string
})

// Response
interface Session {
  id: string;
  projectId: string;
  createdAt: string;
  messageCount: number;
}
```

---

### Claude Code Execution

#### execute_claude_code

Executes a Claude Code prompt.

```typescript
// Request
invoke<ExecutionResult>('execute_claude_code', {
  prompt: string,
  projectPath: string,
  model: string,           // e.g., "claude-sonnet-4-20250514"
  systemPrompt?: string
})

// Response
interface ExecutionResult {
  sessionId: string;
  status: 'started' | 'error';
  pid?: number;
}

// Streaming output via event
listen('claude-output:{sessionId}', (event: { payload: string }) => {
  // JSONL lines
})
```

#### continue_claude_code

Continues an existing conversation.

```typescript
invoke<ExecutionResult>('continue_claude_code', {
  sessionId: string,
  prompt: string,
  projectPath: string,
  model: string
})
```

#### resume_claude_code

Resumes from a checkpoint.

```typescript
invoke<ExecutionResult>('resume_claude_code', {
  checkpointId: number,
  prompt: string,
  projectPath: string,
  model: string
})
```

#### cancel_claude_execution

Cancels running execution.

```typescript
invoke<void>('cancel_claude_execution', {
  sessionId: string
})
```

---

### Session History

#### load_session_history

Loads parsed session history.

```typescript
invoke<Message[]>('load_session_history', {
  sessionId: string,
  projectPath: string
})

interface Message {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  usage?: TokenUsage;
}
```

---

### Checkpoint System

#### create_checkpoint

Creates a session checkpoint.

```typescript
invoke<Checkpoint>('create_checkpoint', {
  sessionId: string,
  name: string,
  projectPath: string
})

interface Checkpoint {
  id: number;
  sessionId: string;
  name: string;
  createdAt: string;
  messageIndex: number;
  parentId?: number;
}
```

#### list_checkpoints

Lists checkpoints for a session.

```typescript
invoke<Checkpoint[]>('list_checkpoints', {
  sessionId: string
})
```

#### restore_checkpoint

Restores to a checkpoint.

```typescript
invoke<void>('restore_checkpoint', {
  checkpointId: number,
  projectPath: string
})
```

---

### Agent Management

#### list_agents

Gets all agent definitions.

```typescript
invoke<Agent[]>('list_agents')

interface Agent {
  id: number;
  name: string;
  icon: string;
  systemPrompt: string;
  defaultTask: string;
  model: string;
  enableFileRead: boolean;
  enableFileWrite: boolean;
  enableNetwork: boolean;
  hooks?: string; // JSON
  createdAt: string;
  updatedAt: string;
}
```

#### create_agent

Creates a new agent.

```typescript
invoke<Agent>('create_agent', {
  name: string,
  icon: string,
  systemPrompt: string,
  defaultTask?: string,
  model?: string,
  enableFileRead?: boolean,
  enableFileWrite?: boolean,
  enableNetwork?: boolean,
  hooks?: string
})
```

#### update_agent

Updates an existing agent.

```typescript
invoke<Agent>('update_agent', {
  id: number,
  // ... same fields as create_agent
})
```

#### delete_agent

Deletes an agent.

```typescript
invoke<void>('delete_agent', {
  id: number
})
```

#### execute_agent

Executes an agent.

```typescript
invoke<AgentRun>('execute_agent', {
  agentId: number,
  task: string,
  projectPath: string,
  model?: string
})

interface AgentRun {
  id: number;
  agentId: number;
  agentName: string;
  status: 'running' | 'completed' | 'failed';
  sessionId?: string;
  pid?: number;
  processStartedAt?: string;
}
```

#### list_agent_runs

Gets agent run history.

```typescript
invoke<AgentRun[]>('list_agent_runs', {
  agentId?: number,  // Optional filter
  limit?: number
})
```

#### get_agent_run_with_real_time_metrics

Gets run with live metrics.

```typescript
invoke<AgentRunWithMetrics>('get_agent_run_with_real_time_metrics', {
  runId: number
})

interface AgentRunWithMetrics extends AgentRun {
  metrics: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalCost: number;
    durationSeconds: number;
    messageCount: number;
  };
}
```

#### kill_agent_session

Stops a running agent.

```typescript
invoke<void>('kill_agent_session', {
  runId: number
})
```

#### export_agent / import_agent

Agent portability.

```typescript
// Export
invoke<string>('export_agent', { id: number })
// Returns: JSON string

// Import
invoke<Agent>('import_agent', { json: string })
```

#### fetch_github_agents

Fetches agents from GitHub.

```typescript
invoke<Agent[]>('fetch_github_agents', {
  repoUrl: string
})
```

---

### MCP Server Management

#### mcp_list

Lists configured MCP servers.

```typescript
invoke<McpServer[]>('mcp_list')

interface McpServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}
```

#### mcp_add

Adds an MCP server.

```typescript
invoke<void>('mcp_add', {
  name: string,
  command: string,
  args: string[],
  env?: Record<string, string>
})
```

#### mcp_remove

Removes an MCP server.

```typescript
invoke<void>('mcp_remove', {
  name: string
})
```

#### mcp_get

Gets server details.

```typescript
invoke<McpServer>('mcp_get', {
  name: string
})
```

#### mcp_test_connection

Tests server connectivity.

```typescript
invoke<{ success: boolean; error?: string }>('mcp_test_connection', {
  name: string
})
```

#### mcp_read_project_config / mcp_save_project_config

Project-level MCP configuration.

```typescript
// Read
invoke<McpConfig>('mcp_read_project_config', {
  projectPath: string
})

// Save
invoke<void>('mcp_save_project_config', {
  projectPath: string,
  config: McpConfig
})
```

---

### Claude Authentication

#### claude_auth_check

Checks authentication status.

```typescript
invoke<AuthStatus>('claude_auth_check')

interface AuthStatus {
  isAuthenticated: boolean;
  authType: 'oauth' | 'api_key' | 'none';
  email?: string;
}
```

#### claude_auth_open_terminal

Opens terminal for OAuth login.

```typescript
invoke<void>('claude_auth_open_terminal')
```

#### claude_auth_save_api_key

Saves API key to secure storage.

```typescript
invoke<void>('claude_auth_save_api_key', {
  apiKey: string
})
```

#### claude_auth_validate_api_key

Validates an API key.

```typescript
invoke<{ valid: boolean; error?: string }>('claude_auth_validate_api_key', {
  apiKey: string
})
```

#### claude_auth_delete_api_key

Removes stored API key.

```typescript
invoke<void>('claude_auth_delete_api_key')
```

#### claude_auth_logout

Logs out of Claude.

```typescript
invoke<void>('claude_auth_logout')
```

---

### Storage Operations

#### storage_list_tables

Lists database tables.

```typescript
invoke<string[]>('storage_list_tables')
```

#### storage_read_table

Reads table with pagination.

```typescript
invoke<TableData>('storage_read_table', {
  table: string,
  limit?: number,
  offset?: number
})

interface TableData {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
}
```

#### storage_execute_sql

Executes raw SQL.

```typescript
invoke<unknown[]>('storage_execute_sql', {
  query: string
})
```

#### storage_insert_row / storage_update_row / storage_delete_row

CRUD operations.

```typescript
// Insert
invoke<number>('storage_insert_row', {
  table: string,
  data: Record<string, unknown>
})

// Update
invoke<void>('storage_update_row', {
  table: string,
  id: number,
  data: Record<string, unknown>
})

// Delete
invoke<void>('storage_delete_row', {
  table: string,
  id: number
})
```

#### storage_reset_database

Truncates all tables.

```typescript
invoke<void>('storage_reset_database')
```

---

### Usage Analytics

#### get_usage_stats

Gets aggregate statistics.

```typescript
invoke<UsageStats>('get_usage_stats')

interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  sessionCount: number;
  averageCostPerSession: number;
}
```

#### get_usage_by_date_range

Gets usage within date range.

```typescript
invoke<DailyUsage[]>('get_usage_by_date_range', {
  startDate: string,  // ISO format
  endDate: string
})

interface DailyUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  sessions: number;
}
```

#### get_usage_details

Gets detailed line items.

```typescript
invoke<UsageDetail[]>('get_usage_details', {
  limit?: number,
  offset?: number
})
```

#### get_session_stats

Gets per-session statistics.

```typescript
invoke<SessionStats>('get_session_stats', {
  sessionId: string
})
```

---

### File Operations

#### read_file_content

Reads file content.

```typescript
invoke<string>('read_file_content', {
  path: string
})
```

#### list_directory_contents

Lists directory contents.

```typescript
invoke<FileEntry[]>('list_directory_contents', {
  path: string
})

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: string;
}
```

#### search_files

Searches for files by pattern.

```typescript
invoke<string[]>('search_files', {
  directory: string,
  pattern: string,
  recursive?: boolean
})
```

---

### Settings

#### get_claude_settings / save_claude_settings

Claude Code settings.

```typescript
invoke<ClaudeSettings>('get_claude_settings')

invoke<void>('save_claude_settings', {
  settings: ClaudeSettings
})
```

#### get_hooks_config

Gets hook configuration.

```typescript
invoke<HooksConfig>('get_hooks_config', {
  projectPath: string
})
```

---

### Session Management

#### open_new_session

Opens a new Claude Code session (debug mode only).

```typescript
invoke<string>('open_new_session', {
  path?: string
})
```

#### get_session_timeline

Gets timeline with checkpoints for a session.

```typescript
invoke<SessionTimeline>('get_session_timeline', {
  sessionId: string,
  projectId: string,
  projectPath: string
})

interface SessionTimeline {
  auto_checkpoint_enabled: boolean;
  checkpoint_strategy: string;
  total_checkpoints: number;
  current_checkpoint_id?: string;
}
```

#### track_session_messages

Tracks messages for checkpoint system.

```typescript
invoke<void>('track_session_messages', {
  sessionId: string,
  projectId: string,
  projectPath: string,
  messages: string[]
})
```

---

### Checkpoint Management (Extended)

#### fork_from_checkpoint

Creates a new session from a checkpoint.

```typescript
invoke<CheckpointResult>('fork_from_checkpoint', {
  checkpointId: string,
  sessionId: string,
  projectId: string,
  projectPath: string,
  newSessionId: string,
  description?: string
})
```

#### update_checkpoint_settings

Updates checkpoint auto-creation settings.

```typescript
invoke<void>('update_checkpoint_settings', {
  sessionId: string,
  projectId: string,
  projectPath: string,
  autoCheckpointEnabled: boolean,
  checkpointStrategy: 'manual' | 'per_prompt' | 'per_tool_use' | 'smart'
})
```

#### get_checkpoint_diff

Gets differences between two checkpoints.

```typescript
invoke<CheckpointDiff>('get_checkpoint_diff', {
  fromCheckpointId: string,
  toCheckpointId: string,
  sessionId: string,
  projectId: string
})

interface CheckpointDiff {
  from_checkpoint_id: string;
  to_checkpoint_id: string;
  modified_files: FileDiff[];
  added_files: PathBuf[];
  deleted_files: PathBuf[];
  token_delta: number;
}
```

#### track_checkpoint_message

Tracks a single message for checkpointing.

```typescript
invoke<void>('track_checkpoint_message', {
  sessionId: string,
  projectId: string,
  projectPath: string,
  message: string
})
```

#### check_auto_checkpoint

Checks if auto-checkpoint should trigger.

```typescript
invoke<boolean>('check_auto_checkpoint', {
  sessionId: string,
  projectId: string,
  projectPath: string,
  message: string
})
```

#### cleanup_old_checkpoints

Removes old checkpoints, keeping specified count.

```typescript
invoke<number>('cleanup_old_checkpoints', {
  sessionId: string,
  projectId: string,
  projectPath: string,
  keepCount: number
})
```

#### get_checkpoint_settings

Gets current checkpoint settings.

```typescript
invoke<CheckpointSettings>('get_checkpoint_settings', {
  sessionId: string,
  projectId: string,
  projectPath: string
})
```

#### clear_checkpoint_manager

Clears checkpoint manager for session.

```typescript
invoke<void>('clear_checkpoint_manager', {
  sessionId: string
})
```

#### get_checkpoint_state_stats

Gets checkpoint system statistics.

```typescript
invoke<CheckpointStateStats>('get_checkpoint_state_stats')

interface CheckpointStateStats {
  active_managers: number;
  active_sessions: string[];
}
```

---

### Claude Settings (Extended)

#### get_home_directory

Gets user home directory path.

```typescript
invoke<string>('get_home_directory')
```

#### check_claude_version

Checks Claude Code installation and version.

```typescript
invoke<ClaudeVersionStatus>('check_claude_version')

interface ClaudeVersionStatus {
  is_installed: boolean;
  version?: string;
  output: string;
}
```

#### find_claude_md_files

Finds all CLAUDE.md files in project.

```typescript
invoke<ClaudeMdFile[]>('find_claude_md_files', {
  projectPath: string
})

interface ClaudeMdFile {
  relative_path: string;
  absolute_path: string;
  size: number;
  modified: number;
}
```

#### read_claude_md_file

Reads a specific CLAUDE.md file.

```typescript
invoke<string>('read_claude_md_file', {
  filePath: string
})
```

#### save_claude_md_file

Saves a CLAUDE.md file.

```typescript
invoke<string>('save_claude_md_file', {
  filePath: string,
  content: string
})
```

#### get_recently_modified_files

Gets files modified within time window.

```typescript
invoke<string[]>('get_recently_modified_files', {
  sessionId: string,
  projectId: string,
  projectPath: string,
  minutes: number
})
```

#### update_hooks_config

Updates hook configuration.

```typescript
invoke<string>('update_hooks_config', {
  scope: 'user' | 'project' | 'local',
  hooks: JsonValue,
  projectPath?: string
})
```

#### validate_hook_command

Validates hook command syntax.

```typescript
invoke<ValidationResult>('validate_hook_command', {
  command: string
})

interface ValidationResult {
  valid: boolean;
  message: string;
}
```

#### check_anyon_installed

Checks ANYON installation status.

```typescript
invoke<AnyonInstallationStatus>('check_anyon_installed', {
  projectPath: string
})

interface AnyonInstallationStatus {
  is_installed: boolean;
  has_claude_dir: boolean;
  missing_dirs: string[];
}
```

#### run_npx_anyon_agents

Runs npx anyon-agents installer.

```typescript
invoke<NpxRunResult>('run_npx_anyon_agents', {
  projectPath: string
})
```

#### check_is_git_repo

Checks if directory is a git repository.

```typescript
invoke<boolean>('check_is_git_repo', {
  projectPath: string
})
```

#### init_git_repo

Initializes a git repository.

```typescript
invoke<NpxRunResult>('init_git_repo', {
  projectPath: string
})
```

#### git_add_all

Stages all files for commit.

```typescript
invoke<NpxRunResult>('git_add_all', {
  projectPath: string
})
```

#### git_commit

Creates a git commit.

```typescript
invoke<NpxRunResult>('git_commit', {
  projectPath: string,
  message: string
})
```

#### git_set_remote

Sets git remote URL.

```typescript
invoke<NpxRunResult>('git_set_remote', {
  projectPath: string,
  remoteUrl: string
})
```

#### git_push

Pushes to remote repository.

```typescript
invoke<NpxRunResult>('git_push', {
  projectPath: string,
  remoteUrl: string,
  token: string,
  branch?: string
})
```

#### git_status

Gets repository status.

```typescript
invoke<NpxRunResult>('git_status', {
  projectPath: string
})
```

#### git_current_branch

Gets current branch name.

```typescript
invoke<NpxRunResult>('git_current_branch', {
  projectPath: string
})

interface NpxRunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code?: number;
}
```

---

### Claude Execution (Extended)

#### list_running_claude_sessions

Lists all running Claude sessions.

```typescript
invoke<ProcessInfo[]>('list_running_claude_sessions')

interface ProcessInfo {
  run_id: number;
  pid: number;
  project_path: string;
  prompt: string;
  model: string;
  started_at: string;
}
```

#### get_claude_session_output

Gets live output for a session.

```typescript
invoke<string>('get_claude_session_output', {
  sessionId: string
})
```

---

### Dev Server Management

#### detect_package_manager

Detects package manager in project.

```typescript
invoke<string>('detect_package_manager', {
  projectPath: string
})
// Returns: "npm" | "yarn" | "pnpm" | "bun"
```

#### start_dev_server

Starts development server with proxy.

```typescript
invoke<void>('start_dev_server', {
  projectPath: string,
  projectId?: string
})

// Emits events:
// - dev-server-output
// - port-detected (when server starts)
```

#### stop_dev_server

Stops development server.

```typescript
invoke<void>('stop_dev_server', {
  projectPath: string
})
```

#### get_dev_server_info

Gets dev server status and URLs.

```typescript
invoke<DevServerInfo | null>('get_dev_server_info', {
  projectPath: string
})

interface DevServerInfo {
  project_path: string;
  pid: number;
  detected_port?: number;
  original_url?: string;
  proxy_port?: number;
  proxy_url?: string;
}
```

---

### Slash Commands

#### slash_commands_list

Lists all available slash commands.

```typescript
invoke<SlashCommand[]>('slash_commands_list', {
  projectPath?: string
})

interface SlashCommand {
  id: string;
  name: string;
  full_command: string;
  scope: 'default' | 'project' | 'user';
  namespace?: string;
  file_path: string;
  content: string;
  description?: string;
  allowed_tools: string[];
  has_bash_commands: boolean;
  has_file_references: boolean;
  accepts_arguments: boolean;
}
```

#### slash_command_get

Gets a specific slash command.

```typescript
invoke<SlashCommand>('slash_command_get', {
  commandId: string
})
```

#### slash_command_save

Creates or updates a slash command.

```typescript
invoke<SlashCommand>('slash_command_save', {
  scope: 'project' | 'user',
  name: string,
  namespace?: string,
  content: string,
  description?: string,
  allowedTools: string[],
  projectPath?: string
})
```

#### slash_command_delete

Deletes a slash command.

```typescript
invoke<string>('slash_command_delete', {
  commandId: string,
  projectPath?: string
})
```

---

### Dev Workflow Automation

#### start_dev_workflow

Starts automated PM workflow.

```typescript
invoke<void>('start_dev_workflow', {
  projectPath: string,
  model: string
})
```

#### stop_dev_workflow

Stops dev workflow automation.

```typescript
invoke<void>('stop_dev_workflow', {
  projectPath: string
})
```

#### get_dev_workflow_status

Gets current workflow status.

```typescript
invoke<DevSession>('get_dev_workflow_status', {
  projectPath: string
})

interface DevSession {
  id: number;
  project_path: string;
  last_prompt: string;
  cycle_count: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}
```

---

### Preview & Port Scanning

#### scan_ports

Scans common development ports.

```typescript
invoke<PortInfo[]>('scan_ports')

interface PortInfo {
  port: number;
  url: string;
  alive: boolean;
}
```

---

### Agent Management (Extended)

#### get_agent

Gets a single agent by ID.

```typescript
invoke<Agent>('get_agent', {
  id: number
})
```

#### cleanup_finished_processes

Cleans up completed agent processes.

```typescript
invoke<number[]>('cleanup_finished_processes')
// Returns: Array of cleaned up run IDs
```

#### get_claude_binary_path

Gets stored Claude binary path.

```typescript
invoke<string | null>('get_claude_binary_path')
```

#### set_claude_binary_path

Sets Claude binary path.

```typescript
invoke<void>('set_claude_binary_path', {
  path: string
})
```

#### list_claude_installations

Lists all Claude installations found.

```typescript
invoke<ClaudeInstallation[]>('list_claude_installations')

interface ClaudeInstallation {
  path: string;
  version?: string;
  type: 'npm' | 'homebrew' | 'binary';
}
```

---

### File Operations (Extended)

#### check_file_exists

Checks if file exists.

```typescript
invoke<boolean>('check_file_exists', {
  filePath: string
})
```

#### list_anyon_docs

Lists documents in anyon-docs/planning.

```typescript
invoke<string[]>('list_anyon_docs', {
  projectPath: string
})
```

---

### Proxy Settings

#### get_proxy_settings

Gets proxy configuration.

```typescript
invoke<ProxySettings>('get_proxy_settings')

interface ProxySettings {
  enabled: boolean;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}
```

#### save_proxy_settings

Saves proxy configuration.

```typescript
invoke<void>('save_proxy_settings', {
  settings: ProxySettings
})
```

---

## Auth Server REST API

Base URL: `http://localhost:4000`

### Authentication Endpoints

#### GET /auth/google/url

Gets Google OAuth URL.

```http
GET /auth/google/url

Response:
{
  "url": "https://accounts.google.com/o/oauth2/..."
}
```

#### GET /auth/google/callback

OAuth callback handler.

```http
GET /auth/google/callback?code={code}

Response:
HTML page with deep link:
<script>
  window.location.href = 'anyon://auth/callback?token={jwt}';
</script>
```

#### GET /auth/me

Gets current user.

```http
GET /auth/me
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "profilePicture": "https://..."
  },
  "subscription": {
    "planType": "FREE" | "PRO",
    "status": "ACTIVE",
    "currentPeriodEnd": "2024-01-19T00:00:00.000Z"
  }
}
```

#### GET /auth/verify

Validates token.

```http
GET /auth/verify
Authorization: Bearer {token}

Response:
{
  "valid": true,
  "userId": "uuid"
}
```

#### POST /auth/subscription

Updates subscription.

```http
POST /auth/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "planType": "PRO",
  "status": "ACTIVE"
}
```

#### POST /auth/dev/login

Development quick login.

```http
POST /auth/dev/login

Response:
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "dev@example.com",
    "name": "Dev User"
  },
  "subscription": {
    "planType": "PRO",
    "status": "ACTIVE"
  }
}
```

---

### Settings Endpoints

#### GET /api/settings

Gets all user settings.

```http
GET /api/settings
Authorization: Bearer {token}

Response:
{
  "theme": "dark",
  "language": "ko",
  "notifications": true
}
```

#### POST /api/settings

Saves all settings.

```http
POST /api/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "theme": "dark",
  "language": "en"
}
```

#### PATCH /api/settings/:key

Updates single setting.

```http
PATCH /api/settings/theme
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "light"
}
```

#### DELETE /api/settings/:key

Deletes a setting.

```http
DELETE /api/settings/notifications
Authorization: Bearer {token}
```

---

### Development Endpoints

#### POST /dev/create-user

Creates test user.

```http
POST /dev/create-user
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User",
  "planType": "PRO"
}
```

#### GET /dev/users

Lists all users.

```http
GET /dev/users

Response:
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
]
```

#### GET /health

Health check.

```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-12T00:00:00.000Z"
}
```

---

## Event System

### Agent Events

```typescript
// Agent output streaming
listen('agent-output:{runId}', (event) => {
  const line: string = event.payload;
  // JSONL format
});

// Agent errors
listen('agent-error:{runId}', (event) => {
  const error: string = event.payload;
});
```

### Claude Events

```typescript
// Claude output streaming
listen('claude-output:{sessionId}', (event) => {
  const line: string = event.payload;
});
```

### Checkpoint Events

```typescript
// Checkpoint created
listen('checkpoint-created', (event) => {
  const checkpoint: Checkpoint = event.payload;
});
```

---

## Error Handling

### Tauri Commands

All commands return `Result<T, String>`:

```typescript
try {
  const result = await invoke('command_name', params);
} catch (error) {
  // error is a string
  console.error('Command failed:', error);
}
```

### HTTP Endpoints

```json
// Error response format
{
  "error": "Error message"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `500` - Server error

---

## Type Definitions

Full TypeScript definitions are available in:
- `src/types/` - Frontend types
- `src/lib/apiAdapter.ts` - API types
