# ANYON - Project Overview

> AI-Powered Development Platform

## Executive Summary

ANYON is a desktop application that provides a visual interface for AI-assisted development using Claude Code. It enables developers to manage projects, execute AI agents, and track usage through an intuitive React-based interface powered by Tauri (Rust) backend.

The platform supports Google OAuth authentication, multi-project management, and real-time streaming of Claude Code outputs with checkpoint-based session recovery.

---

## Quick Facts

| Property | Value |
|----------|-------|
| **Project Type** | Multi-Part Desktop Application |
| **Primary Language** | TypeScript (Frontend), Rust (Backend) |
| **Architecture** | Tauri v2 + React 18 |
| **Database** | SQLite (local) |
| **Authentication** | Google OAuth + JWT |
| **Target Platforms** | macOS, Windows, Linux |

---

## Technology Stack

### Frontend (src/)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.6.2 |
| Build Tool | Vite | 6.0.3 |
| Styling | Tailwind CSS | 4.1.8 |
| State | Zustand | 5.0.6 |
| Routing | React Router | 7.10.1 |
| UI Library | Radix UI | Various |

### Desktop Backend (src-tauri/)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Tauri | 2.x |
| Language | Rust | 2021 Edition |
| Async Runtime | Tokio | Latest |
| HTTP | Axum | 0.8 |
| Database | rusqlite | 0.32 |
| Auth | jsonwebtoken | 9 |

### Auth Server (server/)

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express | 4.18.2 |
| Auth | google-auth-library | 10.5.0 |
| Tokens | jsonwebtoken | 9.0.2 |

---

## Architecture Type

**Multi-Part Desktop Application**

```
┌────────────────────────────────────────────────────┐
│                    ANYON Desktop                    │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │           Frontend (React + TS)               │  │
│  │  - 81 Components                              │  │
│  │  - 5 Zustand Stores                           │  │
│  │  - 17 Custom Hooks                            │  │
│  └──────────────────────────────────────────────┘  │
│                        ↕ IPC                        │
│  ┌──────────────────────────────────────────────┐  │
│  │           Desktop Backend (Rust)              │  │
│  │  - 120+ Tauri Commands                        │  │
│  │  - SQLite Database                            │  │
│  │  - Process Registry                           │  │
│  └──────────────────────────────────────────────┘  │
│                        ↕ HTTP                       │
│  ┌──────────────────────────────────────────────┐  │
│  │           Auth Server (Node.js)               │  │
│  │  - 15 REST Endpoints                          │  │
│  │  - Google OAuth                               │  │
│  │  - JWT Tokens                                 │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
anyon-claude/
├── src/                    # React Frontend
│   ├── components/         # 81 React components
│   ├── stores/             # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & API adapter
│   └── styles/             # Tailwind configuration
│
├── src-tauri/              # Tauri Desktop Backend
│   ├── src/
│   │   ├── commands/       # 120+ IPC commands
│   │   ├── checkpoint/     # Session checkpointing
│   │   ├── process/        # Process management
│   │   └── main.rs         # Application entry
│   └── Cargo.toml          # Rust dependencies
│
├── server/                 # Node.js Auth Server
│   └── index.js            # Express application
│
└── _bmad-output/           # Generated documentation
```

---

## Core Features

### 1. Project Management
- Scan and display Claude Code projects
- Create new projects
- Session history browsing

### 2. Claude Code Integration
- Execute prompts via Claude CLI
- Real-time streaming output
- Session continuation and resume
- Checkpoint creation/restoration

### 3. Agent System
- Custom AI agent definitions
- Configurable system prompts
- Execution history tracking
- Import/Export capabilities
- GitHub agent marketplace

### 4. MCP (Model Context Protocol)
- Server management
- Configuration editor
- Connection testing

### 5. Usage Analytics
- Token usage tracking
- Cost calculation
- Per-session statistics

---

## Key Integrations

| Integration | Purpose | Protocol |
|-------------|---------|----------|
| Claude Code CLI | AI execution | Subprocess + JSONL |
| Google OAuth | User authentication | OAuth 2.0 |
| ~/.claude/projects | Project discovery | File system |
| SQLite | Local data storage | Direct SQL |
| PostHog | Analytics | HTTP |

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture - Frontend](architecture-frontend.md) | React component architecture |
| [Architecture - Desktop](architecture-desktop.md) | Tauri/Rust backend architecture |
| [Architecture - Server](architecture-server.md) | Node.js auth server |
| [Integration Architecture](integration-architecture.md) | Multi-part communication |
| [Source Tree Analysis](source-tree-analysis.md) | Directory structure |
| [Development Guide](development-guide.md) | Setup and workflow |
| [Component Inventory](component-inventory.md) | Component catalog |
| [API Contracts](api-contracts.md) | API documentation |
| [Data Models](data-models.md) | Database schemas |

---

## Getting Started

```bash
# Clone repository
git clone https://github.com/SL-IT-AMAZING/anyon-claude.git
cd anyon-claude

# Install dependencies
npm install
cd server && npm install && cd ..

# Start development
npm run dev
```

See [Development Guide](development-guide.md) for detailed setup instructions.

---

## Build & Deploy

```bash
# Production frontend
npm run build

# Desktop app (all platforms)
npm run tauri build

# macOS DMG only
npm run build:dmg
```

---

## License

Private / Proprietary
