# API Contracts

> Complete API documentation for all interfaces

## Overview

ANYON has three API layers:

| Layer | Protocol | Count | Purpose |
|-------|----------|-------|---------|
| **Tauri IPC** | invoke() | 120+ | Desktop backend commands |
| **Auth Server** | HTTP REST | 15 | Authentication & settings |
| **Event System** | Tauri Events | 4+ | Real-time streaming |

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

### Git Operations

#### git_status

Gets repository status.

```typescript
invoke<GitStatus>('git_status', {
  projectPath: string
})
```

#### git_diff

Gets file diff.

```typescript
invoke<string>('git_diff', {
  projectPath: string,
  file?: string
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
