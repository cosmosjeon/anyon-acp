# Data Models

> Database schemas, data structures, and type definitions

## Overview

| Storage Layer | Technology | Purpose |
|---------------|------------|---------|
| **SQLite** | rusqlite | Persistent local storage |
| **In-Memory** | Rust HashMap/Map | Runtime state |
| **LocalStorage** | Browser API | Frontend persistence |
| **Keychain** | Platform-specific | Secure credentials |

---

## SQLite Database

Location: App data directory (platform-specific)

### agents Table

Stores agent definitions.

```sql
CREATE TABLE agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    system_prompt TEXT NOT NULL,
    default_task TEXT,
    model TEXT DEFAULT 'claude-sonnet-4-20250514',
    enable_file_read BOOLEAN DEFAULT 1,
    enable_file_write BOOLEAN DEFAULT 1,
    enable_network BOOLEAN DEFAULT 0,
    hooks TEXT,  -- JSON string
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_created_at ON agents(created_at);
```

**Field Details:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Auto-incrementing primary key |
| `name` | TEXT | Display name |
| `icon` | TEXT | Emoji or icon identifier |
| `system_prompt` | TEXT | Claude system prompt |
| `default_task` | TEXT | Pre-filled task template |
| `model` | TEXT | Claude model ID |
| `enable_file_read` | BOOLEAN | Allow file reading |
| `enable_file_write` | BOOLEAN | Allow file writing |
| `enable_network` | BOOLEAN | Allow network access |
| `hooks` | TEXT | JSON-encoded hooks configuration |
| `created_at` | TEXT | ISO timestamp |
| `updated_at` | TEXT | ISO timestamp |

---

### agent_runs Table

Stores agent execution history.

```sql
CREATE TABLE agent_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    agent_name TEXT NOT NULL,
    agent_icon TEXT,
    task TEXT NOT NULL,
    model TEXT NOT NULL,
    project_path TEXT NOT NULL,
    session_id TEXT,
    status TEXT DEFAULT 'running',
    pid INTEGER,
    process_started_at TEXT,
    completed_at TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_session_id ON agent_runs(session_id);
CREATE INDEX idx_agent_runs_process_started_at ON agent_runs(process_started_at);
```

**Field Details:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Auto-incrementing primary key |
| `agent_id` | INTEGER | FK to agents table |
| `agent_name` | TEXT | Denormalized agent name |
| `agent_icon` | TEXT | Denormalized icon |
| `task` | TEXT | User-provided task |
| `model` | TEXT | Claude model used |
| `project_path` | TEXT | Project directory |
| `session_id` | TEXT | Claude session ID |
| `status` | TEXT | running, completed, failed |
| `pid` | INTEGER | Process ID |
| `process_started_at` | TEXT | ISO timestamp |
| `completed_at` | TEXT | ISO timestamp |

---

### app_settings Table

Key-value settings storage.

```sql
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

**Common Keys:**

| Key | Value Type | Description |
|-----|------------|-------------|
| `theme` | string | "light" or "dark" |
| `language` | string | "en" or "ko" |
| `default_model` | string | Claude model ID |
| `auto_checkpoint` | boolean | Auto-create checkpoints |

---

### checkpoints Table

Session checkpoint metadata.

```sql
CREATE TABLE checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    parent_id INTEGER,
    name TEXT NOT NULL,
    message_index INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES checkpoints(id)
);

-- Indexes
CREATE INDEX idx_checkpoints_session_id ON checkpoints(session_id);
CREATE INDEX idx_checkpoints_parent_id ON checkpoints(parent_id);
```

---

### checkpoint_files Table

File snapshots for checkpoints.

```sql
CREATE TABLE checkpoint_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checkpoint_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    content BLOB,  -- Compressed content
    metadata TEXT,  -- JSON
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_checkpoint_files_checkpoint_id ON checkpoint_files(checkpoint_id);
CREATE INDEX idx_checkpoint_files_path ON checkpoint_files(file_path);
```

---

## In-Memory Structures

### ProcessRegistry (Rust)

```rust
pub struct ProcessRegistry {
    processes: HashMap<i64, ProcessInfo>,
    live_outputs: HashMap<i64, Vec<String>>,
}

pub struct ProcessInfo {
    pub run_id: i64,
    pub process_type: ProcessType,
    pub pid: u32,
    pub started_at: DateTime<Utc>,
    pub project_path: String,
    pub task: String,
    pub model: String,
}

pub enum ProcessType {
    Agent,
    Claude,
    DevServer,
}
```

### Auth Server Storage (Node.js)

**SQLite Database** (better-sqlite3)

Location: `server/data/anyon.db`

```sql
-- 사용자 테이블
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  google_id TEXT UNIQUE,
  plan_type TEXT DEFAULT 'FREE' CHECK(plan_type IN ('FREE', 'PRO')),
  subscription_status TEXT DEFAULT 'ACTIVE',
  current_period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 설정 (Key-Value)
CREATE TABLE user_settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Repository Pattern:**
- `server/db/repositories/userRepository.js` - User CRUD
- `server/db/repositories/settingsRepository.js` - Settings CRUD

---

## TypeScript Interfaces

### User & Auth

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  googleId?: string;
}

interface Subscription {
  planType: 'FREE' | 'PRO';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  currentPeriodEnd?: string;
}

interface AuthState {
  user: User | null;
  subscription: Subscription;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Project & Session

```typescript
interface Project {
  id: string;
  name: string;
  path: string;
  lastAccessed: string;
}

interface Session {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt?: string;
  messageCount: number;
}

interface Message {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  usage?: TokenUsage;
}

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}
```

### Agent

```typescript
interface Agent {
  id: number;
  name: string;
  icon: string;
  systemPrompt: string;
  defaultTask?: string;
  model: string;
  enableFileRead: boolean;
  enableFileWrite: boolean;
  enableNetwork: boolean;
  hooks?: HooksConfig;
  createdAt: string;
  updatedAt: string;
}

interface AgentRun {
  id: number;
  agentId: number;
  agentName: string;
  agentIcon?: string;
  task: string;
  model: string;
  projectPath: string;
  sessionId?: string;
  status: 'running' | 'completed' | 'failed';
  pid?: number;
  processStartedAt?: string;
  completedAt?: string;
}

interface AgentRunWithMetrics extends AgentRun {
  metrics: RunMetrics;
}

interface RunMetrics {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  durationSeconds: number;
  messageCount: number;
}
```

### Checkpoint

```typescript
interface Checkpoint {
  id: number;
  sessionId: string;
  parentId?: number;
  name: string;
  messageIndex: number;
  createdAt: string;
}

interface FileSnapshot {
  path: string;
  contentHash: string;
  metadata: FileMetadata;
}

interface FileMetadata {
  size: number;
  modified: string;
  permissions?: number;
}
```

### MCP

```typescript
interface McpServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface McpConfig {
  mcpServers: Record<string, McpServer>;
}
```

### Settings

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ko';
  notifications: boolean;
  autoCheckpoint: boolean;
  defaultModel: string;
}

interface ClaudeSettings {
  model: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface HooksConfig {
  preMessage?: Hook[];
  postMessage?: Hook[];
  onError?: Hook[];
}

interface Hook {
  type: 'script' | 'command';
  value: string;
  enabled: boolean;
}
```

### Tab System

```typescript
interface Tab {
  id: string;
  type: TabType;
  title: string;
  data?: TabData;
  closable: boolean;
}

type TabType =
  | 'chat'
  | 'agent'
  | 'agents'
  | 'projects'
  | 'settings'
  | 'mcp'
  | 'usage';

interface TabData {
  sessionId?: string;
  runId?: number;
  projectPath?: string;
}
```

### File Operations

```typescript
interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: string;
}

interface DirectoryListing {
  path: string;
  entries: FileEntry[];
}
```

### Usage Analytics

```typescript
interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  sessionCount: number;
  averageCostPerSession: number;
}

interface DailyUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  sessions: number;
}

interface SessionStats {
  sessionId: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  duration: number;
  messageCount: number;
}
```

---

## Rust Structures

### Core Types

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: i64,
    pub name: String,
    pub icon: Option<String>,
    pub system_prompt: String,
    pub default_task: Option<String>,
    pub model: String,
    pub enable_file_read: bool,
    pub enable_file_write: bool,
    pub enable_network: bool,
    pub hooks: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentRun {
    pub id: i64,
    pub agent_id: i64,
    pub agent_name: String,
    pub agent_icon: Option<String>,
    pub task: String,
    pub model: String,
    pub project_path: String,
    pub session_id: Option<String>,
    pub status: String,
    pub pid: Option<u32>,
    pub process_started_at: Option<String>,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    pub id: i64,
    pub session_id: String,
    pub parent_id: Option<i64>,
    pub name: String,
    pub message_index: i64,
    pub created_at: String,
}
```

### JWT Claims

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub user_id: String,
    pub exp: usize,
    pub iat: usize,
}
```

---

## JSON Schemas

### Agent Export Format

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "systemPrompt"],
  "properties": {
    "name": { "type": "string" },
    "icon": { "type": "string" },
    "systemPrompt": { "type": "string" },
    "defaultTask": { "type": "string" },
    "model": { "type": "string" },
    "enableFileRead": { "type": "boolean" },
    "enableFileWrite": { "type": "boolean" },
    "enableNetwork": { "type": "boolean" },
    "hooks": { "type": "object" }
  }
}
```

### MCP Configuration (.mcp.json)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "mcpServers": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["command"],
        "properties": {
          "command": { "type": "string" },
          "args": {
            "type": "array",
            "items": { "type": "string" }
          },
          "env": {
            "type": "object",
            "additionalProperties": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

## Data Migration

### Version Tracking

The database uses a `schema_version` setting to track migrations.

```sql
INSERT INTO app_settings (key, value, created_at, updated_at)
VALUES ('schema_version', '1', datetime('now'), datetime('now'));
```

### Migration Pattern

```rust
pub fn run_migrations(conn: &Connection) -> Result<()> {
    let version = get_schema_version(conn)?;

    if version < 1 {
        // Create initial tables
    }

    if version < 2 {
        // Add new columns
    }

    set_schema_version(conn, CURRENT_VERSION)?;
    Ok(())
}
```
