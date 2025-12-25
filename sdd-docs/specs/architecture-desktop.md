# Desktop Architecture

> Tauri v2 + Rust Backend

## Overview

| Property | Value |
|----------|-------|
| **Framework** | Tauri 2.x |
| **Language** | Rust 2021 Edition |
| **Async Runtime** | Tokio |
| **HTTP Framework** | Axum |
| **Database** | SQLite (rusqlite) |
| **Commands** | 173 IPC endpoints |

---

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Core** | Tauri 2 | Desktop framework |
| | Rust 2021 | Systems programming |
| | Tokio | Async runtime |
| **Web** | Axum 0.8 | HTTP server |
| | tower-http | Middleware |
| **Database** | rusqlite 0.32 | SQLite bindings |
| **Auth** | jsonwebtoken 9 | JWT handling |
| | yup-oauth2 11 | OAuth2 client |
| | keyring 2 | Credential storage |
| **Utilities** | serde/serde_json | Serialization |
| | chrono | Date/time |
| | regex | Pattern matching |
| | walkdir 2 | Directory walking |
| | glob 0.3 | Glob patterns |
| **Platform** | window-vibrancy | Window effects |
| | cocoa/objc | macOS APIs |

---

## Architecture Pattern

### Tauri Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     main.rs (Entry)                          │
│  - Tauri Builder                                             │
│  - Plugin Registration                                       │
│  - State Management                                          │
│  - Command Handler (173 commands)                            │
└─────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Auth Server   │   │ Command System  │   │  State Layer    │
│                 │   │                 │   │                 │
│  - OAuth        │   │  - agents.rs    │   │  - AgentDb      │
│  - JWT          │   │  - claude.rs    │   │  - Checkpoint   │
│  - Port 4000    │   │  - mcp.rs       │   │  - Process      │
└─────────────────┘   │  - storage.rs   │   │  - Proxy        │
                      │  - usage.rs     │   └─────────────────┘
                      │  - dev_server   │
                      │  - ...          │
                      └─────────────────┘
```

### Command System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Invoke Handler                      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Command Modules                           │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  agents/    │ │  claude/    │ │   mcp.rs    │            │
│  │  (6 files)  │ │  (7 files)  │ │  (726 LOC)  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │claude_auth.rs│ │ storage.rs  │ │  usage.rs   │            │
│  │  (720 LOC)  │ │  (530 LOC)  │ │  (714 LOC)  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │dev_server.rs│ │dev_workflow │ │slash_commands│            │
│  │  (817 LOC)  │ │  (373 LOC)  │ │  (471 LOC)  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Command Modules

### agents/ (Modular Architecture)

**Purpose**: Agent lifecycle management - complete system for creating, executing, and managing AI agents

**Module Split History**: Originally a single `agents.rs` file (~2070 LOC), refactored into 6 focused modules for better maintainability.

**Module Structure**:
```
src-tauri/src/commands/agents/
├── mod.rs           (~69 LOC)   - Re-exports
├── types.rs         (~173 LOC)  - Data structures
├── database.rs      (~630 LOC)  - Database operations
├── execution.rs     (~500 LOC)  - Agent execution
├── session.rs       (~500 LOC)  - Session management
└── import_export.rs (~270 LOC)  - Import/export
```

**Type Definitions** (types.rs):
```rust
// Core types
Agent {                          // Agent configuration
    id: Option<i64>,
    name: String,
    icon: String,
    system_prompt: String,
    default_task: Option<String>,
    model: String,
    enable_file_read: bool,
    enable_file_write: bool,
    enable_network: bool,
    hooks: Option<String>,       // JSON hooks config
    created_at: String,
    updated_at: String,
}

AgentRun {                       // Execution run record
    id: Option<i64>,
    agent_id: i64,
    agent_name: String,
    agent_icon: String,
    task: String,
    model: String,
    project_path: String,
    session_id: String,          // UUID from Claude Code
    status: String,              // pending/running/completed/failed/cancelled
    pid: Option<u32>,
    process_started_at: Option<String>,
    created_at: String,
    completed_at: Option<String>,
}

AgentRunMetrics {                // Runtime metrics from JSONL
    duration_ms: Option<i64>,
    total_tokens: Option<i64>,
    cost_usd: Option<f64>,
    message_count: Option<i64>,
}

AgentRunWithMetrics {            // Combined for frontend
    run: AgentRun,               // Flattened via serde
    metrics: Option<AgentRunMetrics>,
    output: Option<String>,      // Real-time JSONL
}

// Import/Export types
AgentExport {                    // Export wrapper
    version: u32,
    exported_at: String,
    agent: AgentData,
}

AgentData {                      // Portable agent data
    name: String,
    icon: String,
    system_prompt: String,
    default_task: Option<String>,
    model: String,
    hooks: Option<String>,
}

// GitHub integration
GitHubAgentFile {                // GitHub API file
    name: String,
    path: String,
    download_url: String,
    size: i64,
    sha: String,
}

GitHubApiResponse {              // GitHub API response
    name: String,
    path: String,
    sha: String,
    size: i64,
    download_url: Option<String>,
    file_type: String,           // "file" or "dir"
}

// State management
AgentDb(Mutex<Connection>)       // Thread-safe SQLite
```

**Database Tables**:
- `agents` - Agent definitions
- `agent_runs` - Execution history
- `app_settings` - Settings storage

**Key Commands** (30 total):

**Database Operations** (database.rs):
| Command | Description |
|---------|-------------|
| `list_agents` | Get all agents |
| `create_agent` | Create new agent |
| `update_agent` | Modify agent |
| `delete_agent` | Remove agent |
| `get_agent` | Get single agent |
| `list_agent_runs` | Get run history |
| `get_agent_run` | Get single run |
| `cleanup_finished_processes` | Clean up completed runs |
| `get_claude_binary_path` | Get Claude binary path |
| `set_claude_binary_path` | Set Claude binary path |
| `list_claude_installations` | List available Claude binaries |

**Execution** (execution.rs):
| Command | Description |
|---------|-------------|
| `execute_agent` | Run agent (spawn Claude) |

**Session Management** (session.rs):
| Command | Description |
|---------|-------------|
| `get_agent_run_with_real_time_metrics` | Get run with live metrics |
| `list_agent_runs_with_metrics` | List runs with metrics |
| `list_running_sessions` | Get active sessions |
| `kill_agent_session` | Stop running agent |
| `get_session_status` | Get session status |
| `get_live_session_output` | Get live output |
| `get_session_output` | Get session output |
| `stream_session_output` | Stream output |
| `load_agent_session_history` | Load session history |

**Import/Export** (import_export.rs):
| Command | Description |
|---------|-------------|
| `export_agent` | Export agent to JSON |
| `export_agent_to_file` | Export agent to file |
| `import_agent` | Import agent from JSON |
| `import_agent_from_file` | Import agent from file |
| `fetch_github_agents` | List GitHub agents |
| `fetch_github_agent_content` | Get GitHub agent content |
| `import_agent_from_github` | Import from GitHub |

### claude/ (Modular Architecture)

**Purpose**: Claude Code integration - modular system for project, session, execution, and settings management

**Module Structure**:
```
src-tauri/src/commands/claude/
├── mod.rs           - Re-exports & module documentation
├── shared.rs        - Common types (Project, Session, ClaudeSettings, etc.)
├── helpers.rs       - Internal helper functions
├── projects.rs      - Project management
├── sessions.rs      - Session management
├── execution.rs     - Claude process execution
├── filesystem.rs    - File operations
├── checkpoints.rs   - Checkpoint management
└── settings.rs      - Settings and git operations
```

**Key Commands**:
| Command | Module | Description |
|---------|--------|-------------|
| `list_projects` | projects | Scan ~/.claude/projects |
| `create_project` | projects | Create new project |
| `get_project_sessions` | projects | Get session list |
| `open_new_session` | sessions | Open new session |
| `load_session_history` | sessions | Parse JSONL logs |
| `get_session_timeline` | sessions | Get session timeline |
| `execute_claude_code` | execution | Run Claude prompt |
| `continue_claude_code` | execution | Continue conversation |
| `resume_claude_code` | execution | Resume from checkpoint |
| `cancel_claude_execution` | execution | Stop execution |
| `list_running_claude_sessions` | execution | List running sessions |
| `list_directory_contents` | filesystem | List directory |
| `search_files` | filesystem | Search in files |
| `read_file_content` | filesystem | Read file |
| `check_file_exists` | filesystem | Check file existence |
| `create_checkpoint` | checkpoints | Snapshot state |
| `restore_checkpoint` | checkpoints | Revert to checkpoint |
| `list_checkpoints` | checkpoints | Get checkpoint timeline |
| `get_claude_settings` | settings | Get settings |
| `save_claude_settings` | settings | Save settings |
| `get_system_prompt` | settings | Get CLAUDE.md |
| `save_system_prompt` | settings | Save CLAUDE.md |
| `check_claude_version` | settings | Check Claude CLI version |
| `find_claude_md_files` | settings | Find CLAUDE.md files |
| `check_anyon_installed` | settings | Check .anyon installation |
| `run_npx_anyon_agents` | settings | Run npx anyon-agents |
| `git_*` | settings | Git operations (init, add, commit, push, status, etc.) |

### mcp.rs (~726 LOC)

**Purpose**: Model Context Protocol server management

**Key Commands**:
| Command | Description |
|---------|-------------|
| `mcp_list` | List MCP servers |
| `mcp_add` | Add server |
| `mcp_remove` | Remove server |
| `mcp_get` | Get server details |
| `mcp_serve` | Start as MCP server |
| `mcp_test_connection` | Test connectivity |
| `mcp_read_project_config` | Read .mcp.json |
| `mcp_save_project_config` | Save .mcp.json |

### claude_auth.rs (~720 LOC)

**Purpose**: Claude authentication

**Credential Storage**:
- macOS: Keychain
- Windows: Credential Manager
- Linux: secret-tool / fallback file

**Key Commands**:
| Command | Description |
|---------|-------------|
| `claude_auth_check` | Check auth status |
| `claude_auth_open_terminal` | Open login terminal |
| `claude_auth_save_api_key` | Store API key |
| `claude_auth_validate_api_key` | Verify key |
| `claude_auth_delete_api_key` | Remove key |
| `claude_auth_logout` | Logout |

### storage.rs (~530 LOC)

**Purpose**: Database operations

**Key Commands**:
| Command | Description |
|---------|-------------|
| `storage_list_tables` | List all tables |
| `storage_read_table` | Read with pagination |
| `storage_execute_sql` | Raw SQL |
| `storage_insert_row` | Insert record |
| `storage_update_row` | Update record |
| `storage_delete_row` | Delete record |
| `storage_reset_database` | Truncate all |

### usage.rs (~714 LOC)

**Purpose**: Usage analytics

**Key Commands**:
| Command | Description |
|---------|-------------|
| `get_usage_stats` | Aggregate stats |
| `get_usage_by_date_range` | Time-windowed |
| `get_usage_details` | Line-item details |
| `get_session_stats` | Per-session stats |

### dev_server.rs (~817 LOC)

**Purpose**: Development server proxy

**Features**:
- Port detection
- Package manager detection
- HTTP proxy with script injection
- Element selector JavaScript

### dev_workflow.rs (~373 LOC)

**Purpose**: PM auto-routing workflow

**State Machine**:
```
pm-orchestrator → pm-executor → pm-reviewer → (cycle)
```

---

## State Management

### Application State

```rust
// main.rs

app.manage(AgentDb::new());
app.manage(CheckpointState::default());
app.manage(ProcessRegistryState::default());
app.manage(ClaudeProcessState::default());
app.manage(ProxySettings::default());
```

### Process Registry

```rust
pub struct ProcessRegistry {
    processes: HashMap<i64, ProcessInfo>,
    live_outputs: HashMap<i64, Vec<String>>,
}

pub struct ProcessInfo {
    run_id: i64,
    process_type: ProcessType,
    pid: u32,
    started_at: DateTime<Utc>,
    project_path: String,
    task: String,
    model: String,
}
```

### Checkpoint System

```rust
// checkpoint/mod.rs

pub struct Checkpoint {
    id: i64,
    session_id: String,
    parent_id: Option<i64>,
    name: String,
    created_at: DateTime<Utc>,
    message_index: i64,
    file_snapshots: Vec<FileSnapshot>,
}

pub struct FileSnapshot {
    path: String,
    content_hash: String,
    metadata: FileMetadata,
}
```

---

## Database Schema

### agents table
```sql
CREATE TABLE agents (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    system_prompt TEXT NOT NULL,
    default_task TEXT,
    model TEXT DEFAULT 'claude-sonnet-4-20250514',
    enable_file_read BOOLEAN DEFAULT 1,
    enable_file_write BOOLEAN DEFAULT 1,
    enable_network BOOLEAN DEFAULT 0,
    hooks TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### agent_runs table
```sql
CREATE TABLE agent_runs (
    id INTEGER PRIMARY KEY,
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
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### app_settings table
```sql
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## Auth Server (Embedded)

### Axum Router

```rust
// auth_server.rs

let app = Router::new()
    .route("/auth/google/url", get(google_url))
    .route("/auth/google/callback", get(google_callback))
    .route("/auth/me", get(get_me))
    .route("/auth/verify", get(verify_token))
    .route("/auth/subscription", post(update_subscription))
    .route("/api/settings", get(get_settings))
    .route("/api/settings", post(save_settings))
    .route("/api/settings/:key", patch(update_setting))
    .route("/api/settings/:key", delete(delete_setting))
    .route("/auth/dev/login", post(dev_login))
    .route("/dev/create-user", post(create_user))
    .route("/dev/users", get(list_users))
    .route("/health", get(health))
    .with_state(state);
```

### JWT Handling

```rust
pub fn generate_token(user_id: &str) -> Result<String, String> {
    let claims = Claims {
        user_id: user_id.to_string(),
        exp: (Utc::now() + Duration::days(7)).timestamp() as usize,
        iat: Utc::now().timestamp() as usize,
    };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}
```

---

## Process Execution

### Agent Execution Flow

```rust
#[tauri::command]
async fn execute_agent(
    state: State<'_, ProcessRegistryState>,
    name: String,
    system_prompt: String,
    task: String,
    model: String,
    project_path: String,
) -> Result<AgentRun, String> {
    // 1. Create DB record
    let run_id = db.insert_agent_run(...)?;

    // 2. Build Claude command
    let mut cmd = Command::new("claude");
    cmd.args(["--print", "--output-format", "stream-json"]);
    cmd.args(["--model", &model]);
    cmd.args(["--system-prompt", &system_prompt]);
    cmd.arg(&task);

    // 3. Spawn with piped stdio
    let child = cmd
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    // 4. Register in ProcessRegistry
    state.register_process(run_id, child);

    // 5. Spawn stdout reader task
    tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            app.emit(&format!("agent-output:{}", run_id), line)?;
        }
    });

    // 6. Return run info
    Ok(run)
}
```

### JSONL Metrics Parsing

```rust
pub struct AgentRunMetrics {
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub cache_creation_tokens: i64,
    pub cache_read_tokens: i64,
    pub total_cost: f64,
    pub duration_seconds: f64,
    pub message_count: i64,
}

impl AgentRunMetrics {
    pub fn from_jsonl(content: &str) -> Self {
        // Parse each line as JSON
        // Extract usage from "result" messages
        // Calculate costs based on model pricing
    }
}
```

---

## Web Server Mode

### Alternative Entry Point

```rust
// web_main.rs

#[tokio::main]
async fn main() {
    let app = web_server::create_app().await;
    axum::serve(listener, app).await;
}
```

### WebSocket for Claude

```rust
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    // Receive: { command_type, project_path, prompt, model }
    // Stream: { type: "output", content: "..." }
    // Complete: { type: "completion", status: "success" }
}
```

---

## Plugin Registration

```rust
// main.rs

tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_updater::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_global_shortcut::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
        // Handle second instance
    }))
```

---

## Platform-Specific Code

### Window Vibrancy

```rust
#[cfg(target_os = "macos")]
{
    use window_vibrancy::apply_vibrancy;
    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None);
}

#[cfg(target_os = "windows")]
{
    use window_vibrancy::apply_mica;
    apply_mica(&window, None);
}
```

### Credential Storage

```rust
#[cfg(target_os = "macos")]
fn get_keychain_credential(service: &str, account: &str) -> Option<String> {
    // security find-generic-password
}

#[cfg(target_os = "linux")]
fn get_secret_tool_credential(service: &str) -> Option<String> {
    // secret-tool lookup
}

#[cfg(target_os = "windows")]
fn get_credential_manager(target: &str) -> Option<String> {
    // Windows Credential Manager
}
```

---

## Error Handling

### Command Error Pattern

```rust
#[tauri::command]
async fn my_command() -> Result<Data, String> {
    // Operations that can fail
    let result = operation().map_err(|e| e.to_string())?;

    Ok(result)
}
```

### Logging

```rust
use log::{info, warn, error, debug};

info!("Starting agent execution: {}", agent_name);
warn!("Process {} not responding", pid);
error!("Failed to spawn Claude: {}", e);
debug!("Parsed JSONL line: {:?}", line);
```

---

## Build Configuration

### Cargo.toml Features

```toml
[features]
custom-protocol = ["tauri/custom-protocol"]

[profile.release]
strip = true
opt-level = "z"
lto = true
codegen-units = 1
```

### Bundle Targets

```json
// tauri.conf.json
"targets": [
  "deb",
  "rpm",
  "appimage",
  "app",
  "dmg",
  "msi",
  "nsis"
]
```
