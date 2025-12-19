# ANYON Source Tree Analysis

> AI-Powered Development Platform - Multi-part Project Structure

## Project Overview

| Property | Value |
|----------|-------|
| **Repository Type** | Multi-part (3 parts) |
| **Primary Languages** | TypeScript, Rust |
| **Architecture** | Desktop + Web + Backend |
| **Entry Points** | `src/main.tsx`, `src-tauri/src/main.rs`, `server/index.js` |

---

## Multi-Part Structure

```
anyon-claude/                         # Project Root
├── src/                              # Part: Frontend (React/TypeScript)
├── src-tauri/                        # Part: Desktop (Tauri/Rust)
└── server/                           # Part: Auth Server (Node.js)
```

### Part Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Desktop App                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Tauri (Rust)                         │ │
│  │  - IPC Commands (120+)                                  │ │
│  │  - Process Management                                   │ │
│  │  - SQLite Database                                      │ │
│  │  - Checkpoint System                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Frontend (React)                     │ │
│  │  - 81 Components                                        │ │
│  │  - 5 Zustand Stores                                     │ │
│  │  - 17 Custom Hooks                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Auth Server (Node.js)                     │
│  - Google OAuth                                              │
│  - JWT Authentication                                        │
│  - User Settings API                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Directory Structure

```
anyon-claude/
│
├── 📦 src/                           # FRONTEND - React Application
│   ├── main.tsx                      # ⭐ Entry point - analytics, providers
│   ├── App.tsx                       # ⭐ Root component - auth gate, layout
│   ├── router.tsx                    # Route definitions (Hash-based)
│   ├── index.css                     # Global styles
│   │
│   ├── 📁 components/                # React Components (81 total)
│   │   ├── 📁 ui/                    # Radix UI primitives (21)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (16 more)
│   │   │
│   │   ├── 📁 claude-code-session/   # Chat session components
│   │   │   ├── MessageList.tsx
│   │   │   ├── PromptQueue.tsx
│   │   │   ├── SessionHeader.tsx
│   │   │   ├── useClaudeMessages.ts
│   │   │   └── useCheckpoints.ts
│   │   │
│   │   ├── 📁 preview/               # Preview panel system
│   │   │   ├── EnhancedPreviewPanel.tsx
│   │   │   ├── ActionHeader.tsx
│   │   │   ├── Console.tsx
│   │   │   ├── Problems.tsx
│   │   │   └── ErrorBanner.tsx
│   │   │
│   │   ├── 📁 planning/              # Planning documents
│   │   │   ├── PlanningDocViewer.tsx
│   │   │   └── PlanningDocsPanel.tsx
│   │   │
│   │   ├── 📁 development/           # Dev workflow
│   │   │   └── DevDocsPanel.tsx
│   │   │
│   │   ├── 📁 widgets/               # Inline widgets
│   │   │   ├── BashWidget.tsx
│   │   │   ├── LSWidget.tsx
│   │   │   └── TodoWidget.tsx
│   │   │
│   │   ├── AppLayout.tsx             # ⭐ Main 3-panel layout
│   │   ├── AppSidebar.tsx            # Left sidebar navigation
│   │   ├── Topbar.tsx                # Top bar with window controls
│   │   ├── TabManager.tsx            # Tab bar management
│   │   ├── ClaudeCodeSession.tsx     # ⭐ Main chat interface (1000+ LOC)
│   │   ├── LoginPage.tsx             # Authentication page
│   │   ├── ProjectList.tsx           # Project listing
│   │   ├── Settings.tsx              # App settings
│   │   ├── Agents.tsx                # Agent listing
│   │   ├── AgentExecution.tsx        # Agent run view
│   │   ├── MCPManager.tsx            # MCP server management
│   │   └── ... (50+ more)
│   │
│   ├── 📁 stores/                    # Zustand State Management (5)
│   │   ├── authStore.ts              # Authentication state
│   │   ├── sessionStore.ts           # Sessions and projects
│   │   ├── agentStore.ts             # Agent execution
│   │   ├── previewStore.ts           # Preview panel state
│   │   └── languageStore.ts          # i18n preferences
│   │
│   ├── 📁 hooks/                     # Custom React Hooks (17)
│   │   ├── useAnalytics.ts           # Event tracking
│   │   ├── useTabState.ts            # Tab management
│   │   ├── useDevServer.ts           # Dev server control
│   │   ├── useTranslation.ts         # i18n
│   │   ├── useUpdater.ts             # App updates
│   │   ├── useDebounce.ts            # Debouncing
│   │   └── ... (11 more)
│   │
│   ├── 📁 contexts/                  # React Contexts
│   │   ├── TabContext.tsx            # Tab state provider
│   │   └── ThemeContext.tsx          # Theme (dark/light)
│   │
│   ├── 📁 services/                  # Persistence Services
│   │   ├── sessionPersistence.ts     # Session restore
│   │   └── tabPersistence.ts         # Tab state
│   │
│   ├── 📁 lib/                       # Utilities
│   │   ├── api.ts                    # ⭐ API client + types
│   │   ├── apiAdapter.ts             # Tauri/Web adapter
│   │   ├── utils.ts                  # Common utilities
│   │   ├── 📁 analytics/             # PostHog integration
│   │   │   ├── index.ts
│   │   │   ├── events.ts
│   │   │   └── consent.ts
│   │   └── 📁 i18n/                  # Translations
│   │       ├── en.ts
│   │       └── ko.ts
│   │
│   ├── 📁 types/                     # TypeScript Definitions
│   │   ├── preview.ts                # Preview types
│   │   ├── hooks.ts                  # Hook config types
│   │   └── template.ts               # Template types
│   │
│   ├── 📁 constants/                 # Application Constants
│   │   ├── planning.ts               # Planning workflow steps
│   │   └── 📁 workflows/
│   │       ├── 📁 planning/          # Planning step definitions
│   │       └── 📁 development/       # Dev workflow definitions
│   │
│   └── 📁 assets/                    # Static Assets
│       ├── 📁 fonts/inter/           # Font files
│       └── 📁 nfo/                   # NFO content
│
├── 📦 src-tauri/                     # DESKTOP - Tauri/Rust Backend
│   ├── Cargo.toml                    # ⭐ Rust dependencies
│   ├── tauri.conf.json               # ⭐ Tauri configuration
│   ├── build.rs                      # Build script
│   │
│   ├── 📁 src/
│   │   ├── main.rs                   # ⭐ App entry, command handlers
│   │   ├── lib.rs                    # Library exports
│   │   ├── web_main.rs               # Web server mode entry
│   │   ├── auth_server.rs            # ⭐ Internal auth server (port 4000)
│   │   ├── web_server.rs             # ⭐ Web mode server
│   │   ├── claude_binary.rs          # Claude binary detection
│   │   ├── portable_deps.rs          # Portable dependency handling
│   │   │
│   │   ├── 📁 commands/              # Tauri IPC Commands (120+)
│   │   │   ├── mod.rs                # Module exports
│   │   │   ├── agents.rs             # ⭐ Agent CRUD + execution (2000 LOC)
│   │   │   ├── claude.rs             # ⭐ Claude Code integration (3000 LOC)
│   │   │   ├── mcp.rs                # MCP server management
│   │   │   ├── claude_auth.rs        # Claude authentication
│   │   │   ├── storage.rs            # Database operations
│   │   │   ├── usage.rs              # Usage analytics
│   │   │   ├── proxy.rs              # Proxy settings
│   │   │   ├── dev_server.rs         # Dev server + proxy
│   │   │   ├── dev_workflow.rs       # PM auto-routing
│   │   │   ├── slash_commands.rs     # Custom commands
│   │   │   └── preview.rs            # Port scanning
│   │   │
│   │   ├── 📁 checkpoint/            # Checkpoint System
│   │   │   ├── mod.rs                # Data structures
│   │   │   ├── manager.rs            # ⭐ Checkpoint lifecycle
│   │   │   ├── state.rs              # Async state
│   │   │   └── storage.rs            # File-based storage
│   │   │
│   │   └── 📁 process/               # Process Management
│   │       ├── mod.rs
│   │       └── registry.rs           # ⭐ Process tracking
│   │
│   ├── 📁 capabilities/              # Tauri permission config
│   ├── 📁 icons/                     # App icons (all sizes)
│   ├── 📁 resources/                 # Bundled resources
│   └── 📁 tests/                     # Rust tests
│
├── 📦 server/                        # AUTH SERVER - Node.js
│   ├── package.json                  # Dependencies
│   ├── index.js                      # ⭐ Express server (15 endpoints)
│   └── README.md                     # Server documentation
│
├── 📄 Configuration Files
│   ├── package.json                  # ⭐ Frontend dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── vite.config.ts                # Vite build config
│   ├── tailwind.config.ts            # Tailwind CSS
│   ├── .env                          # Environment variables
│   └── .env.development              # Dev environment
│
├── 📄 Documentation
│   ├── 📁 docs/                      # User documentation
│   │   └── 📁 cc/                    # Claude Code docs
│   │       ├── hooks.md
│   │       ├── slash-commands.md
│   │       └── sub-agent.md
│   │
│   └── 📁 docs-dev/                  # Development docs
│       ├── IMPLEMENTATION_STATUS.md
│       ├── supabase-migration-plan.md
│       └── ... (5 more)
│
├── 📄 Build & Setup
│   ├── BUILD_INSTALLER.md
│   ├── QUICK_START.md
│   ├── BUN_QUICK_START.md
│   ├── DEV_SERVER_GUIDE.md
│   └── 📁 scripts/                   # Build scripts
│
└── 📁 cc_agents/                     # Claude Code Agents
    └── README.md
```

---

## Critical Directories

### Frontend (`src/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `components/` | React UI components | 81 components, organized by feature |
| `components/ui/` | Radix UI primitives | Reusable button, dialog, tabs, etc. |
| `stores/` | Zustand state | authStore, sessionStore, agentStore, previewStore |
| `hooks/` | Custom hooks | 17 hooks for analytics, tabs, dev server, etc. |
| `lib/` | Utilities | api.ts (main API client), analytics/ |
| `contexts/` | React contexts | TabContext, ThemeContext |

### Desktop (`src-tauri/src/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `commands/` | Tauri IPC | 120+ commands (agents.rs, claude.rs, mcp.rs) |
| `checkpoint/` | Checkpoint system | manager.rs (file tracking, snapshots) |
| `process/` | Process management | registry.rs (PID tracking, kill) |

### Server (`server/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| (root) | Auth API | index.js (15 REST endpoints) |

---

## Entry Points

### Primary Entry Points

| Part | Entry Point | Purpose |
|------|-------------|---------|
| **Frontend** | `src/main.tsx` | React app initialization, analytics, providers |
| **Desktop** | `src-tauri/src/main.rs` | Tauri app, plugin registration, 120+ commands |
| **Server** | `server/index.js` | Express server, OAuth, JWT |

### Secondary Entry Points

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root React component, auth gate |
| `src-tauri/src/web_main.rs` | Alternative web server mode |
| `src-tauri/src/auth_server.rs` | Internal auth server (port 4000) |

---

## Integration Points

### Frontend ↔ Desktop (Tauri IPC)

```typescript
// Frontend calls:
import { invoke } from '@tauri-apps/api/tauri';
await invoke('list_projects');
await invoke('execute_claude_code', { prompt, projectPath, model });
await invoke('create_agent', { name, systemPrompt, model });

// Desktop exposes:
#[tauri::command]
async fn list_projects() -> Result<Vec<Project>, String>
```

### Frontend ↔ Server (HTTP)

```typescript
// Frontend calls:
const response = await fetch('http://localhost:4000/auth/google/url');
const data = await fetch('http://localhost:4000/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});

// Server provides:
GET  /auth/google/url     - OAuth initiation
GET  /auth/me             - Current user
POST /auth/subscription   - Update plan
GET  /api/settings        - User settings
```

### Desktop ↔ Server (Internal)

```rust
// Desktop runs auth server on startup:
auth_server::run_auth_server(app_handle);  // Port 4000
```

---

## Key File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| `src-tauri/src/commands/claude.rs` | ~3,000 | Claude Code integration |
| `src-tauri/src/commands/agents.rs` | ~2,000 | Agent management |
| `src/components/ClaudeCodeSession.tsx` | ~1,000 | Main chat UI |
| `src-tauri/src/auth_server.rs` | ~800 | Internal auth |
| `src-tauri/src/commands/dev_server.rs` | ~800 | Dev server proxy |

---

## File Organization Patterns

### Component Organization

```
src/components/
├── {Feature}.tsx          # Main feature component
├── {Feature}/             # Feature subdirectory (if complex)
│   ├── index.tsx          # Re-export
│   └── SubComponent.tsx   # Child components
├── ui/                    # Reusable primitives
└── widgets/               # Inline interactive widgets
```

### Store Organization

```
src/stores/
└── {domain}Store.ts       # Zustand store per domain
                           # Pattern: use{Domain}Store
```

### Command Organization

```
src-tauri/src/commands/
└── {feature}.rs           # Commands grouped by feature
                           # Pattern: #[tauri::command] functions
```

---

## Asset Locations

| Asset Type | Location | Description |
|------------|----------|-------------|
| Fonts | `src/assets/fonts/inter/` | Inter font family |
| Icons | `src-tauri/icons/` | App icons (all sizes) |
| NFO | `src/assets/nfo/` | NFO content |
| Bundled | `src-tauri/resources/` | Runtime resources |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies, scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build, code splitting |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `src-tauri/Cargo.toml` | Rust dependencies |
| `src-tauri/tauri.conf.json` | Tauri app configuration |
| `.env` | Environment variables |

---

## Development Notes

### Running Development

```bash
# Full stack (frontend + backend + Tauri)
npm run dev

# Or with Bun
bun run dev:bun

# Server only
cd server && npm start
```

### Build

```bash
# Frontend build
npm run build

# Desktop app build
npm run tauri build
```

### TypeScript Compilation

- Target: ES2020
- Module: ESNext
- JSX: react-jsx (automatic)
- Path alias: `@/` → `src/`
