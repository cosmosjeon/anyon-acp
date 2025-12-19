# ANYON Documentation Index

> AI-Powered Development Platform - Technical Reference

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Project Overview](specs/project-overview.md) | Executive summary, quick facts |
| [Development Guide](specs/development-guide.md) | Setup, build, run |
| [Source Tree](specs/source-tree-analysis.md) | Directory structure |

---

## Architecture Documentation

### By Part

| Part | Document | Technology |
|------|----------|------------|
| **Frontend** | [architecture-frontend.md](specs/architecture-frontend.md) | React + TypeScript |
| **Desktop** | [architecture-desktop.md](specs/architecture-desktop.md) | Tauri + Rust |
| **Server** | [architecture-server.md](specs/architecture-server.md) | Node.js + Express |

### Integration

| Document | Description |
|----------|-------------|
| [Integration Architecture](specs/integration-architecture.md) | How parts communicate |
| [project-parts.json](specs/project-parts.json) | Machine-readable part metadata |

---

## Technical Reference

### Components & Code

| Document | Description |
|----------|-------------|
| [Component Inventory](specs/component-inventory.md) | 81 React components, hooks, stores |
| [API Contracts](specs/api-contracts.md) | 120+ IPC commands, 15 REST endpoints |
| [Data Models](specs/data-models.md) | SQLite schemas, TypeScript interfaces |

---

## Development

| Document | Description |
|----------|-------------|
| [Development Guide](specs/development-guide.md) | Prerequisites, setup, scripts |

---

## Code Quality Audits

> 코드 품질 감사 및 리팩토링 계획

| Document | Description |
|----------|-------------|
| [Code Audit Report](audits/code-audit-report.md) | Consolidated audit with refactoring roadmap |
| [Frontend Audit (JSON)](audits/frontend-audit-report.json) | Detailed React/TypeScript findings |
| [Server Audit (JSON)](audits/server-audit-report.json) | Detailed Node.js findings |

### Audit Summary

| Part | Issues | Critical | Score |
|------|--------|----------|-------|
| Frontend | 87 | 12 | 5/10 |
| Desktop | 108 | 12 | 4.5/10 |
| Server | 47 | 8 | 2.5/10 |
| **Total** | **242** | **32** | **4/10** |

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
1. [Project Overview](specs/project-overview.md) - Understand the project
2. [Development Guide](specs/development-guide.md) - Set up environment
3. [Source Tree](specs/source-tree-analysis.md) - Navigate codebase

### For Frontend Work
1. [Architecture - Frontend](specs/architecture-frontend.md)
2. [Component Inventory](specs/component-inventory.md)
3. [API Contracts](specs/api-contracts.md) (IPC section)

### For Backend Work
1. [Architecture - Desktop](specs/architecture-desktop.md)
2. [Data Models](specs/data-models.md)
3. [API Contracts](specs/api-contracts.md) (Tauri section)

### For Full-Stack Understanding
1. [Integration Architecture](specs/integration-architecture.md)
2. All architecture documents
3. [project-parts.json](specs/project-parts.json)

---

## SDD Automation System

> Spec-Driven Development automation for AI-assisted refactoring

| File | Description |
|------|-------------|
| [sync-status.json](sync-status.json) | Document freshness tracking (CI/CD auto-managed) |

### Commands

| Command | Description |
|---------|-------------|
| `/sync-docs` | Synchronize documentation with code changes |

### Documentation Types

| Type | Auto-Update | Documents |
|------|-------------|-----------|
| **Auto-Generated** | Yes | component-inventory, api-contracts, data-models, source-tree |
| **Manual + Drift Detection** | Warning only | architecture-*, integration-architecture |
| **Hybrid** | Partial | project-overview, development-guide |

---

## Folder Structure

```
_bmad-output/
├── index.md                  # 마스터 인덱스 (이 파일)
├── sync-status.json          # 문서 동기화 상태 (CI/CD 자동 관리)
├── project-scan-report.json  # 워크플로우 상태
│
├── specs/                    # 기술 문서
│   ├── project-overview.md
│   ├── source-tree-analysis.md
│   ├── architecture-frontend.md
│   ├── architecture-desktop.md
│   ├── architecture-server.md
│   ├── integration-architecture.md
│   ├── component-inventory.md
│   ├── api-contracts.md
│   ├── data-models.md
│   ├── development-guide.md
│   └── project-parts.json
│
└── audits/                   # 코드 감사 보고서
    ├── code-audit-report.md
    ├── frontend-audit-report.json
    └── server-audit-report.json
```

---

## Generation Info

| Property | Value |
|----------|-------|
| Generated | 2025-12-19 |
| Scan Level | Exhaustive |
| Generator | bmad-document-project |

---

## Next Steps

1. **Refactoring** - Follow the [Code Audit Report](audits/code-audit-report.md) roadmap
2. **Brownfield PRD** - Define enhancement requirements
3. **Feature Implementation** - Use architecture docs as reference
4. **Onboarding** - Share with new team members
