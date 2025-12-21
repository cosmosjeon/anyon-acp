# Frontend Architecture

> React + TypeScript + Vite Application

## Overview

| Property | Value |
|----------|-------|
| **Framework** | React 18.3.1 |
| **Language** | TypeScript 5.6 |
| **Build Tool** | Vite 6.0.3 |
| **Styling** | Tailwind CSS 4.1.8 |
| **State Management** | Zustand 5.0.6 |
| **Routing** | React Router 7 |
| **UI Library** | Radix UI |

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Core** | React | 18.3.1 | UI framework |
| | TypeScript | 5.6.2 | Type safety |
| | Vite | 6.0.3 | Build tool, HMR |
| **UI** | Tailwind CSS | 4.1.8 | Utility-first CSS |
| | Radix UI | Various | Accessible components |
| | Lucide React | 0.468.0 | Icons |
| | Framer Motion | 12.0.0-alpha | Animations |
| **State** | Zustand | 5.0.6 | Global state |
| | React Hook Form | 7.54.2 | Form state |
| | Zod | 3.24.1 | Validation |
| **Routing** | React Router DOM | 7.10.1 | Client routing |
| **Tauri** | @tauri-apps/api | 2.9.1 | IPC bridge |
| | Various plugins | 2.x | Shell, dialog, http |
| **Markdown** | @uiw/react-md-editor | 4.0.7 | Markdown editing |
| | react-markdown | 9.0.3 | Markdown rendering |
| | react-syntax-highlighter | 15.6.1 | Code highlighting |
| **Analytics** | PostHog | 1.258.3 | User analytics |
| **Utilities** | date-fns | 3.6.0 | Date formatting |
| | clsx | 2.1.1 | Class names |
| | tailwind-merge | 2.6.0 | Tailwind merging |

---

## Architecture Pattern

### Component-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  - Auth gate                                                 │
│  - Provider wrapping                                         │
│  - Global modals                                             │
└─────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    LoginPage    │   │   AppLayout     │   │     Modals      │
│                 │   │                 │   │                 │
│  - OAuth        │   │  - 3-panel      │   │  - StartupIntro │
│  - Dev login    │   │  - Responsive   │   │  - Update       │
└─────────────────┘   └─────────────────┘   │  - Credits      │
                               │            └─────────────────┘
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   AppSidebar    │   │   TabManager    │   │    Content      │
│                 │   │                 │   │                 │
│  - Navigation   │   │  - Tab bar      │   │  - TabContent   │
│  - Status       │   │  - Ordering     │   │  - Dynamic      │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### State Management Layer

```
┌─────────────────────────────────────────────────────────────┐
│                      React Contexts                          │
│  - TabContext (tab management)                               │
│  - ThemeContext (dark/light)                                 │
│  - OutputCacheProvider (message caching)                     │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     Zustand Stores                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │ authStore │ │sessionStore│ │agentStore │ │previewStore│   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘    │
│                                           ┌───────────┐      │
│                                           │languageStore│    │
│                                           └───────────┘      │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Component State                           │
│  - useState for local UI state                               │
│  - useRef for DOM references                                 │
│  - useEffect for side effects                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Overview

### Layout Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `AppLayout` | Main layout | 3-panel, responsive |
| `AppSidebar` | Left navigation | Collapsible, status |
| `Topbar` | Top bar | Window controls |
| `TabManager` | Tab bar | Drag-drop reorder |
| `TabContent` | Tab content | Lazy loading |

### Page Components

| Component | Purpose | Route |
|-----------|---------|-------|
| `LoginPage` | Authentication | (pre-auth) |
| `ProjectList` | Project listing | `/projects` |
| `ProjectRoutes` | Project workspace | `/project/:id` |
| `Settings` | App settings | (tab) |
| `Agents` | Agent listing | (tab) |
| `UsageDashboard` | Usage stats | (tab) |

### Feature Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ClaudeCodeSession` | ~1000 | Main chat interface |
| `EnhancedPreviewPanel` | ~500 | Preview with modes |
| `AgentExecution` | ~400 | Agent run view |
| `MCPManager` | ~300 | MCP server management |

### UI Components (Radix-based)

- `Button`, `Dialog`, `DropdownMenu`
- `Select`, `Switch`, `Tabs`
- `Toast`, `Tooltip`, `Popover`
- `ScrollArea`, `Label`, `Input`

---

## State Management

### Zustand Stores

#### authStore
```typescript
interface AuthState {
  user: User | null;
  subscription: Subscription;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions
login(token: string): Promise<void>
logout(): void
checkAuth(): Promise<void>
refreshUserData(): Promise<void>
getUserSettings(): Promise<Settings>
saveUserSettings(settings: Settings): Promise<void>
```

#### sessionStore
```typescript
interface SessionState {
  projects: Project[];
  sessions: Record<string, Session[]>;
  currentSessionId: string | null;
  currentSession: Session | null;
  sessionOutputs: Record<string, string>;
  isLoadingProjects: boolean;
}

// Actions
fetchProjects(): Promise<void>
fetchProjectSessions(projectId: string): Promise<void>
setCurrentSession(sessionId: string): void
fetchSessionOutput(sessionId: string): Promise<void>
```

#### agentStore
```typescript
interface AgentState {
  agentRuns: AgentRunWithMetrics[];
  runningAgents: Set<string>;
  sessionOutputs: Record<string, string>;
  isLoadingRuns: boolean;
}

// Actions
fetchAgentRuns(forceRefresh?: boolean): Promise<void>
createAgentRun(data: CreateAgentRunParams): Promise<void>
cancelAgentRun(runId: string): Promise<void>
deleteAgentRun(runId: string): Promise<void>
```

### Context Providers

#### TabContext
- Tab CRUD operations
- Tab reordering
- Persistence via localStorage
- Max 20 tabs limit

#### ThemeContext
- Dark/light mode toggle
- System preference detection
- Persistence via API

---

## Custom Hooks

### Core Hooks

| Hook | Purpose |
|------|---------|
| `useTabState` | High-level tab management |
| `useAnalytics` | Event tracking (PostHog) |
| `useTranslation` | i18n (ko/en) |
| `useTheme` | Theme context consumer |
| `useUpdater` | App update checking |

### Feature Hooks

| Hook | Purpose |
|------|---------|
| `useDevServer` | Dev server lifecycle |
| `useDevWorkflow` | PM workflow tracking |
| `usePlanningDocs` | Planning doc management |
| `usePreviewMessages` | Preview iframe messaging |
| `useWorkflowPreview` | Preview file detection |

### Utility Hooks

| Hook | Purpose |
|------|---------|
| `useDebounce` | Value debouncing |
| `useDebouncedCallback` | Callback debouncing |
| `useLoadingState` | Loading state management |
| `usePagination` | Pagination state |
| `useApiCall` | Generic API wrapper |

---

## API Layer

### API Adapter Pattern

```typescript
// src/lib/apiAdapter.ts

const isTauri = !!window.__TAURI__;

export const api = {
  // Tauri mode: use IPC
  // Web mode: use HTTP

  async listProjects() {
    if (isTauri) {
      return invoke<Project[]>('list_projects');
    }
    return fetch('/api/projects').then(r => r.json());
  }
};
```

### Key API Types

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
  messageCount: number;
}

interface AgentRunWithMetrics {
  id: number;
  agentId: number;
  agentName: string;
  status: 'running' | 'completed' | 'failed';
  metrics: RunMetrics;
}
```

---

## Routing

### Route Structure

```typescript
// Hash-based routing for Tauri compatibility
const ROUTES = {
  PROJECTS: '/projects',
  PROJECT: '/project/:projectId',
  MVP_WORKSPACE: '/project/:projectId/mvp',
  MAINTENANCE_WORKSPACE: '/project/:projectId/maintenance',
};
```

### Tab-Based Navigation

Most navigation happens via tabs, not URL routing:
- `chat` - Claude Code session
- `agent` - Agent run
- `agents` - Agent browser
- `projects` - Project list
- `settings` - App settings
- `mcp` - MCP manager

---

## Performance Optimizations

### Code Splitting

```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'ui-vendor': ['@radix-ui/*'],
  'editor-vendor': ['@uiw/react-md-editor'],
  'syntax-vendor': ['react-syntax-highlighter'],
  'tauri': ['@tauri-apps/*'],
  'utils': ['date-fns', 'clsx', 'tailwind-merge'],
}
```

### Lazy Loading

```typescript
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### Zustand Optimization

```typescript
// subscribeWithSelector for granular updates
const count = useStore((state) => state.count);
// Only re-renders when count changes
```

### Virtual Scrolling

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
// For long lists (messages, logs)
```

---

## Error Handling

### Error Boundaries

```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    analytics.trackError(error, info);
  }
}
```

### API Error Handling

```typescript
try {
  const result = await invoke('command');
} catch (error) {
  // Tauri wraps errors as strings
  console.error(error);
  showToast({ type: 'error', message: error });
}
```

---

## Testing Strategy

### Test Files

```
src/
├── components/
│   └── preview/
│       └── EnhancedPreviewPanel.test.tsx
```

### Testing Tools

- Jest / Vitest for unit tests
- React Testing Library for component tests

---

## Entry Points

### main.tsx

```typescript
// 1. PostHog analytics setup
// 2. Platform detection (macOS/Windows/Linux)
// 3. Error boundary wrapping
// 4. React root creation
```

### App.tsx

```typescript
// 1. Auth check on mount
// 2. Loading spinner during auth
// 3. LoginPage if not authenticated
// 4. AppLayout with providers if authenticated
// 5. Global modals
```
