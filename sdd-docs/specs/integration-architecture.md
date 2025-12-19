# ANYON Integration Architecture

> How the three parts communicate

## Overview

ANYON is a multi-part application with three main components that communicate through different protocols:

```
┌─────────────────────────────────────────────────────────────────┐
│                         DESKTOP APP                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Tauri Shell (Rust)                       │  │
│  │                                                            │  │
│  │  ┌─────────────────┐    ┌─────────────────┐               │  │
│  │  │  Auth Server    │    │  Command System │               │  │
│  │  │  (Port 4000)    │    │  (IPC Bridge)   │               │  │
│  │  └────────▲────────┘    └────────▲────────┘               │  │
│  │           │                      │                         │  │
│  │           │ HTTP                 │ IPC (invoke)            │  │
│  │           │                      │                         │  │
│  │  ┌────────▼──────────────────────▼────────┐               │  │
│  │  │              Frontend (React)           │               │  │
│  │  │                                         │               │  │
│  │  │  - UI Components (81)                   │               │  │
│  │  │  - Zustand Stores (5)                   │               │  │
│  │  │  - API Adapter (Tauri/Web)              │               │  │
│  │  └─────────────────────────────────────────┘               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│                              ↕ (External)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               External Auth Server (Node.js)               │  │
│  │  - Google OAuth (production)                               │  │
│  │  - User Settings API                                       │  │
│  │  - Subscription Management                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Frontend ↔ Desktop (Tauri IPC)

**Protocol**: Tauri Inter-Process Communication (IPC)
**Pattern**: Request-Response + Event Streaming

#### Request-Response Commands

| Category | Commands | Description |
|----------|----------|-------------|
| **Projects** | `list_projects`, `create_project`, `get_project_sessions` | Project management |
| **Claude** | `execute_claude_code`, `continue_claude_code`, `cancel_claude_execution` | Chat execution |
| **Agents** | `list_agents`, `create_agent`, `execute_agent`, `kill_agent_session` | Agent CRUD + execution |
| **MCP** | `mcp_list`, `mcp_add`, `mcp_remove`, `mcp_test_connection` | Server management |
| **Storage** | `storage_list_tables`, `storage_execute_sql` | Database operations |
| **Auth** | `claude_auth_check`, `claude_auth_save_api_key` | Authentication |

#### Event Streaming

| Event | Direction | Data |
|-------|-----------|------|
| `agent-output:{run_id}` | Backend → Frontend | Streaming agent output |
| `agent-error:{run_id}` | Backend → Frontend | Agent error messages |
| `claude-output:{session_id}` | Backend → Frontend | Claude Code output |
| `checkpoint-created` | Backend → Frontend | Checkpoint notifications |

#### API Adapter Pattern

```typescript
// src/lib/apiAdapter.ts

// Detects environment
const isTauri = window.__TAURI__;

// Unified API calls
export const api = {
  listProjects: async () => {
    if (isTauri) {
      return invoke<Project[]>('list_projects');
    } else {
      // Web fallback (HTTP)
      return fetch('/api/projects').then(r => r.json());
    }
  }
};
```

---

### 2. Frontend ↔ Auth Server (HTTP REST)

**Protocol**: HTTP/REST
**Base URL**: `http://localhost:4000`

#### Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/auth/google/url` | No | Get OAuth URL |
| `GET` | `/auth/google/callback` | No | OAuth callback (returns HTML with deep link) |
| `GET` | `/auth/me` | Yes | Get current user + subscription |
| `GET` | `/auth/verify` | Yes | Validate token |
| `POST` | `/auth/subscription` | Yes | Update subscription |
| `GET` | `/api/settings` | Yes | Get user settings |
| `POST` | `/api/settings` | Yes | Save settings |
| `PATCH` | `/api/settings/:key` | Yes | Update single setting |
| `DELETE` | `/api/settings/:key` | Yes | Delete setting |

#### Authentication Flow

```
1. Frontend: GET /auth/google/url
   ↓
2. User: Redirected to Google OAuth
   ↓
3. Google: Callback to /auth/google/callback
   ↓
4. Server: Returns HTML with anyon://auth/callback?token={jwt}
   ↓
5. Desktop: Deep link handler captures token
   ↓
6. Frontend: Stores token in authStore
   ↓
7. Frontend: GET /auth/me with Bearer token
   ↓
8. Server: Returns user + subscription data
```

---

### 3. Desktop ↔ Auth Server (Internal)

**Protocol**: Embedded HTTP Server
**Implementation**: Axum (Rust)

The Tauri backend runs its own auth server for:
- Local development without external server
- Bundled deployment (single binary)

```rust
// src-tauri/src/auth_server.rs

pub async fn run_auth_server(app: AppHandle) {
    let app = Router::new()
        .route("/auth/google/url", get(google_url))
        .route("/auth/me", get(get_me))
        // ... more routes
        .with_state(state);

    axum::serve(listener, app).await;
}
```

---

### 4. Desktop ↔ External Processes

**Protocol**: Subprocess Spawning + Stdio
**Pattern**: Process Registry

#### Claude Code Execution

```
Frontend: invoke('execute_claude_code', { prompt, projectPath, model })
    ↓
Tauri: Spawns claude binary with args
    ↓
Stdio: Captures stdout/stderr line by line
    ↓
JSONL: Parses streaming output
    ↓
Events: Emits claude-output:{session_id}
    ↓
Frontend: Updates UI in real-time
```

#### Process Registry

```rust
// src-tauri/src/process/registry.rs

pub struct ProcessInfo {
    run_id: i64,
    process_type: ProcessType,
    pid: u32,
    started_at: DateTime<Utc>,
}

impl ProcessRegistry {
    pub fn register_process(&mut self, child: Child, info: ProcessInfo);
    pub fn kill_process(&mut self, run_id: i64) -> Result<()>;
    pub fn is_process_running(&self, run_id: i64) -> bool;
}
```

---

## Data Flow Diagrams

### Chat Session Flow

```
┌──────────┐   prompt    ┌────────────┐   invoke      ┌────────────┐
│ ChatInput│ ──────────→ │ SessionStore│ ───────────→ │ Tauri Cmd  │
└──────────┘             └────────────┘               └─────┬──────┘
                                                            │
                                                            │ spawn
                                                            ▼
                                                      ┌────────────┐
                                                      │ Claude CLI │
                                                      └─────┬──────┘
                                                            │
                                                            │ stdout JSONL
                                                            ▼
┌──────────┐   update    ┌────────────┐   event      ┌────────────┐
│MessageList│ ◀───────── │ SessionStore│ ◀────────── │ Event Emit │
└──────────┘             └────────────┘               └────────────┘
```

### Authentication Flow

```
┌──────────┐   click     ┌────────────┐   HTTP       ┌────────────┐
│LoginButton│ ──────────→ │ AuthStore  │ ───────────→ │ Auth Server│
└──────────┘             └────────────┘               └─────┬──────┘
                                                            │
                                                            │ Google OAuth
                                                            ▼
                                                      ┌────────────┐
                                                      │   Google   │
                                                      └─────┬──────┘
                                                            │
                                                            │ callback
                                                            ▼
┌──────────┐   navigate  ┌────────────┐   deep link  ┌────────────┐
│  App.tsx │ ◀───────── │ AuthStore  │ ◀────────── │ Deep Link  │
└──────────┘             └────────────┘               └────────────┘
```

### Agent Execution Flow

```
┌──────────┐   create    ┌────────────┐   invoke      ┌────────────┐
│AgentForm │ ──────────→ │ AgentStore │ ───────────→ │ agents.rs  │
└──────────┘             └────────────┘               └─────┬──────┘
                                                            │
                                                            │ SQLite
                                                            ▼
                                                      ┌────────────┐
                                                      │  Database  │
                                                      └────────────┘

┌──────────┐   execute   ┌────────────┐   spawn      ┌────────────┐
│RunButton │ ──────────→ │ AgentStore │ ───────────→ │ Claude CLI │
└──────────┘             └────────────┘               └─────┬──────┘
                                                            │
                                                            │ stdout
                                                            ▼
┌──────────┐   display   ┌────────────┐   event      ┌────────────┐
│OutputView│ ◀───────── │ AgentStore │ ◀────────── │ agent-output│
└──────────┘             └────────────┘               └────────────┘
```

---

## Shared Resources

### Database (SQLite)

| Table | Part | Description |
|-------|------|-------------|
| `agents` | Desktop | Agent definitions |
| `agent_runs` | Desktop | Execution history |
| `app_settings` | Desktop | Application settings |
| `checkpoints` | Desktop | Checkpoint metadata |
| `checkpoint_files` | Desktop | File snapshots |

### File System

| Path | Part | Description |
|------|------|-------------|
| `~/.claude/projects/` | Desktop | Claude Code projects |
| `~/.claude/projects/*/*.jsonl` | Desktop | Session logs |
| `anyon-docs/` | All | Project documentation |

### Environment Variables

| Variable | Used By |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Auth Server |
| `GOOGLE_CLIENT_SECRET` | Auth Server |
| `JWT_SECRET` | Auth Server |
| `VITE_PUBLIC_POSTHOG_*` | Frontend |

---

## Error Handling

### Cross-Boundary Errors

```typescript
// Frontend handling Tauri errors
try {
  const result = await invoke('command_name', params);
} catch (error) {
  // Tauri wraps errors as strings
  console.error('Tauri error:', error);
}
```

```rust
// Tauri command error handling
#[tauri::command]
async fn my_command() -> Result<Data, String> {
    operation().map_err(|e| e.to_string())?;
    Ok(data)
}
```

### HTTP Error Handling

```typescript
// Frontend handling HTTP errors
const response = await fetch('/api/endpoint');
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}
```

---

## Security Considerations

### Token Storage

| Location | Purpose | Security |
|----------|---------|----------|
| localStorage | JWT token | Frontend persistence |
| Keychain (macOS) | Claude OAuth | Secure credential storage |
| Credential Manager (Windows) | Claude OAuth | Secure credential storage |
| File (~/.claude/.credentials.json) | Fallback | Linux fallback |

### API Authentication

All authenticated endpoints require:
```
Authorization: Bearer {jwt_token}
```

### Deep Link Security

- Deep links use `anyon://` protocol
- Token is passed in URL query parameter
- Single-use tokens (expired after 7 days)

---

## Performance Considerations

### IPC Optimization

- Tauri commands are asynchronous (non-blocking)
- Large data transfers use streaming
- Event batching for high-frequency updates

### HTTP Optimization

- Keep-alive connections
- JWT validation cached in memory
- In-memory user/session storage (dev mode)

### Process Optimization

- Process registry tracks all spawned processes
- Automatic cleanup of finished processes
- SIGTERM with fallback to SIGKILL
