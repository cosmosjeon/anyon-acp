# ANYON Documentation Index

> AI-Powered Development Platform - Technical Reference

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Project Overview](project-overview.md) | Executive summary, quick facts |
| [Development Guide](development-guide.md) | Setup, build, run |
| [Source Tree](source-tree-analysis.md) | Directory structure |

---

## Architecture Documentation

### By Part

| Part | Document | Technology |
|------|----------|------------|
| **Frontend** | [architecture-frontend.md](architecture-frontend.md) | React + TypeScript |
| **Desktop** | [architecture-desktop.md](architecture-desktop.md) | Tauri + Rust |
| **Server** | [architecture-server.md](architecture-server.md) | Node.js + Express |

### Integration

| Document | Description |
|----------|-------------|
| [Integration Architecture](integration-architecture.md) | How parts communicate |
| [project-parts.json](project-parts.json) | Machine-readable part metadata |

---

## Technical Reference

### Components & Code

| Document | Description |
|----------|-------------|
| [Component Inventory](component-inventory.md) | 81 React components, hooks, stores |
| [API Contracts](api-contracts.md) | 120+ IPC commands, 15 REST endpoints |
| [Data Models](data-models.md) | SQLite schemas, TypeScript interfaces |

---

## Development

| Document | Description |
|----------|-------------|
| [Development Guide](development-guide.md) | Prerequisites, setup, scripts |

---

## Document Status

| Document | Status | Completeness |
|----------|--------|--------------|
| project-overview.md | Complete | 100% |
| source-tree-analysis.md | Complete | 100% |
| architecture-frontend.md | Complete | 100% |
| architecture-desktop.md | Complete | 100% |
| architecture-server.md | Complete | 100% |
| integration-architecture.md | Complete | 100% |
| development-guide.md | Complete | 100% |
| component-inventory.md | Complete | 100% |
| api-contracts.md | Complete | 100% |
| data-models.md | Complete | 100% |
| project-parts.json | Complete | 100% |

---

## Project Statistics

| Metric | Value |
|--------|-------|
| **Project Type** | Multi-Part Desktop Application |
| **Parts** | 3 (Frontend, Desktop, Server) |
| **React Components** | 81 |
| **Zustand Stores** | 5 |
| **Custom Hooks** | 17 |
| **Tauri Commands** | 120+ |
| **REST Endpoints** | 15 |
| **Database Tables** | 4 |

---

## Technology Stack Summary

### Frontend (src/)
- React 18.3.1 + TypeScript 5.6.2
- Vite 6.0.3 + Tailwind CSS 4.1.8
- Zustand 5.0.6 + React Router 7.10.1
- Radix UI Components

### Desktop Backend (src-tauri/)
- Tauri 2.x + Rust 2021 Edition
- Tokio + Axum 0.8
- rusqlite 0.32 + jsonwebtoken 9

### Auth Server (server/)
- Node.js 18+ + Express 4.18.2
- google-auth-library 10.5.0
- jsonwebtoken 9.0.2

---

## Navigation by Role

### For New Developers
1. [Project Overview](project-overview.md) - Understand the project
2. [Development Guide](development-guide.md) - Set up environment
3. [Source Tree](source-tree-analysis.md) - Navigate codebase

### For Frontend Work
1. [Architecture - Frontend](architecture-frontend.md)
2. [Component Inventory](component-inventory.md)
3. [API Contracts](api-contracts.md) (IPC section)

### For Backend Work
1. [Architecture - Desktop](architecture-desktop.md)
2. [Data Models](data-models.md)
3. [API Contracts](api-contracts.md) (Tauri section)

### For Full-Stack Understanding
1. [Integration Architecture](integration-architecture.md)
2. All architecture documents
3. [project-parts.json](project-parts.json)

---

## Generation Info

| Property | Value |
|----------|-------|
| Generated | 2024-01-12 |
| Scan Level | Exhaustive |
| Generator | bmad-document-project |

---

## Next Steps

After reviewing this documentation:

1. **Brownfield PRD** - Define enhancement requirements
2. **Feature Implementation** - Use architecture docs as reference
3. **Onboarding** - Share with new team members
