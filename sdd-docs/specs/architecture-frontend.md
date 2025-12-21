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
┌─────────────────────────────────────────────────────────────────────┐
│                            App.tsx                                  │
│  - Auth gate                                                        │
│  - Provider wrapping (Tab, Theme, OutputCache)                      │
│  - Global modals (StartupIntro, Update, Credits)                    │
└─────────────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    LoginPage    │   │   AppLayout     │   │  Global Modals  │
│                 │   │  (3-panel)      │   │                 │
│  - OAuth        │   │                 │   │  - StartupIntro │
│  - Dev login    │   └─────────────────┘   │  - Update       │
└─────────────────┘            │            │  - Credits      │
                               │            └─────────────────┘
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   AppSidebar    │   │   TabManager    │   │  TabContent     │
│                 │   │                 │   │  (Dynamic)      │
│  - Navigation   │   │  - Tab bar      │   │                 │
│  - Status       │   │  - Reordering   │   └─────────────────┘
│  - Projects     │   │  - 20 tab max   │            │
└─────────────────┘   └─────────────────┘            │
                                             ┌───────┴────────┐
                                             ▼                ▼
                               ┌─────────────────┐  ┌──────────────────┐
                               │ ClaudeCodeSess. │  │  EnhancedPreview │
                               │                 │  │                  │
                               │  - Chat UI      │  │  - Preview mode  │
                               │  - Tool render  │  │  - Console       │
                               │  - Streaming    │  │  - Problems      │
                               └─────────────────┘  │  - Component sel.│
                                        │           └──────────────────┘
                                        ▼
                               ┌─────────────────┐
                               │  Widget Layer   │
                               │  (29 widgets)   │
                               │                 │
                               │  - File ops     │
                               │  - Commands     │
                               │  - Tasks        │
                               │  - MCP/Web      │
                               │  - System       │
                               └─────────────────┘
```

**Component Directories:**
- `src/components/widgets/` - 29 tool execution widgets
- `src/components/ui/` - 23 Radix UI components
- `src/components/claude-code-session/` - Chat interface
- `src/components/preview/` - Preview panel components
- `src/components/planning/` - Planning workflow components
- `src/components/development/` - Development workflow components

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

### Widget Components

Total: 29 widgets (~3400 lines) for displaying Claude tool executions and outputs.

#### File Operation Widgets

| Widget | Lines | Purpose |
|--------|-------|---------|
| `ReadWidget` | ~50 | Shows Read tool execution with file path |
| `ReadResultWidget` | ~180 | File content with syntax highlighting and line numbers |
| `WriteWidget` | ~170 | Write tool execution with file path and content preview |
| `EditWidget` | ~90 | Edit tool with unified diff view |
| `EditResultWidget` | ~90 | Edit result confirmation with statistics |
| `MultiEditWidget` | ~150 | Batch edit operations with file list |
| `MultiEditResultWidget` | ~95 | Multi-edit results summary |
| `LSWidget` | ~50 | List directory tool execution |
| `LSResultWidget` | ~165 | Directory listing with file/folder icons |
| `GlobWidget` | ~50 | File pattern search tool |
| `GrepWidget` | ~190 | Text search with matches display and syntax highlighting |

#### Command & System Widgets

| Widget | Lines | Purpose |
|--------|-------|---------|
| `BashWidget` | ~55 | Terminal command execution with loading state |
| `CommandWidget` | ~35 | User command display (e.g., /model, /clear) |
| `CommandOutputWidget` | ~75 | Command output with ANSI parsing and link detection |
| `SystemInitializedWidget` | ~250 | System initialization summary with context files |
| `SystemReminderWidget` | ~35 | System reminder messages |

#### Task & Agent Widgets

| Widget | Lines | Purpose |
|--------|-------|---------|
| `TodoWidget` | ~65 | TodoWrite tool display with task list |
| `TodoReadWidget` | ~565 | Interactive todo list with progress tracking |
| `TaskWidget` | ~145 | Task execution widget with status |
| `BackgroundAgentsPanel` | ~65 | Background agents progress panel |
| `SkillPromptWidget` | ~50 | Skill tool execution display |

#### MCP & Web Widgets

| Widget | Lines | Purpose |
|--------|-------|---------|
| `MCPWidget` | ~175 | MCP tool execution with namespace/method display |
| `WebSearchWidget` | ~200 | Web search results with collapsible links |
| `WebFetchWidget` | ~205 | Web page fetch with content preview |

#### Utility Widgets

| Widget | Lines | Purpose |
|--------|-------|---------|
| `SessionInfoWidget` | ~85 | Session information display |
| `UsageStatsWidget` | ~80 | Usage statistics widget |
| `ThinkingWidget` | ~50 | AI thinking/reasoning display (collapsible) |
| `SummaryWidget` | ~35 | AI-generated summary display |

#### Shared Components

| Component | Purpose |
|-----------|---------|
| `CollapsibleToolWidget` | Reusable collapsible tool container |
| `getLanguage()` | File extension to syntax language mapper |

### UI Components (Radix-based)

- `Button`, `Dialog`, `DropdownMenu`
- `Select`, `Switch`, `Tabs`
- `Toast`, `Tooltip`, `Popover`
- `ScrollArea`, `Label`, `Input`

---

## State Management

### Zustand Stores

The application uses 5 Zustand stores with subscribeWithSelector middleware for granular updates.

#### 1. authStore (Persisted)

Authentication and user management with dev mode support.

```typescript
interface AuthState {
  // State
  user: User | null;
  subscription: Subscription | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login(token: string): Promise<void>
  logout(): void
  checkAuth(): Promise<boolean>
  canCreateProject(): boolean
  refreshUserData(): Promise<void>
  getUserSettings(): Promise<any>
  saveUserSettings(settings: any): Promise<void>
  updateUserSetting(key: string, value: any): Promise<void>
}
```

**Features:**
- Automatic dev user in development mode
- Token persistence via localStorage
- Server communication via Tauri HTTP
- Project creation permission check

#### 2. sessionStore (subscribeWithSelector)

Claude Code session and project management.

```typescript
interface SessionState {
  // State
  projects: Project[];
  sessions: Record<string, Session[]>; // Keyed by projectId
  currentSessionId: string | null;
  currentSession: Session | null;
  sessionOutputs: Record<string, string>; // Keyed by sessionId
  isLoadingProjects: boolean;
  isLoadingSessions: boolean;
  isLoadingOutputs: boolean;
  error: string | null;

  // Actions
  fetchProjects(): Promise<void>
  fetchProjectSessions(projectId: string): Promise<void>
  setCurrentSession(sessionId: string | null): void
  fetchSessionOutput(sessionId: string): Promise<void>
  deleteSession(sessionId: string, projectId: string): Promise<void>
  clearError(): void

  // Real-time updates
  handleSessionUpdate(session: Session): void
  handleOutputUpdate(sessionId: string, output: string): void
}
```

**Features:**
- Multi-project session management
- Session output caching
- Real-time session updates
- Error state management

#### 3. agentStore (subscribeWithSelector)

Agent execution and monitoring.

```typescript
interface AgentState {
  // State
  agentRuns: AgentRunWithMetrics[];
  runningAgents: Set<string>;
  sessionOutputs: Record<string, string>;
  isLoadingRuns: boolean;
  isLoadingOutput: boolean;
  error: string | null;
  lastFetchTime: number;
  pollingInterval: NodeJS.Timeout | null;

  // Actions
  fetchAgentRuns(forceRefresh?: boolean): Promise<void>
  fetchSessionOutput(runId: number): Promise<void>
  createAgentRun(data): Promise<AgentRunWithMetrics>
  cancelAgentRun(runId: number): Promise<void>
  deleteAgentRun(runId: number): Promise<void>
  clearError(): void

  // Real-time updates
  handleAgentRunUpdate(run: AgentRunWithMetrics): void

  // Polling management
  startPolling(interval?: number): void
  stopPolling(): void
}
```

**Features:**
- 5-second cache for agent runs
- Automatic polling for running agents
- Agent lifecycle management (create, cancel, delete)
- Real-time status updates

#### 4. previewStore (subscribeWithSelector)

Preview panel state and dev server management.

```typescript
interface PreviewState {
  // Preview mode
  previewMode: PreviewMode; // 'preview' | 'console' | 'problems'
  isPreviewOpen: boolean;

  // Console outputs
  appOutputs: AppOutput[];

  // Error state
  previewError: PreviewError | undefined;

  // Component selection
  selectedComponents: ComponentSelection[];
  selectedElement: SelectedElement | null;

  // iframe management
  iframeRef: HTMLIFrameElement | null;
  isComponentSelectorInitialized: boolean;
  isSelectorActive: boolean;

  // Problems tab
  problemReport: ProblemReport | null;
  isCheckingProblems: boolean;

  // Routing
  routes: ParsedRoute[];
  currentRoute: string;

  // App URL
  appUrl: string | null;
  originalUrl: string | null;
  isLoading: boolean;

  // Dev server
  devServerRunning: boolean;
  devServerPort: number | null;
  devServerProxyUrl: string | null;
  packageManager: string | null;

  // Actions (30+ setter methods)
  // iframe messaging
  postMessageToIframe(message): void
  activateSelector(): void
  deactivateSelector(): void
}
```

**Features:**
- 500 output limit for console
- Component selector integration
- Dev server lifecycle tracking
- Route parsing and navigation
- iframe postMessage communication

#### 5. languageStore (Persisted)

Simple i18n language preference.

```typescript
interface LanguageState {
  language: Language; // 'en' | 'ko'
  setLanguage(language: Language): void
}
```

**Features:**
- Default: Korean ('ko')
- localStorage persistence

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

Total: 18 custom hooks for state management, performance, and feature integration.

### Core Hooks

| Hook | Purpose | Returns | Usage |
|------|---------|---------|-------|
| `useTabState` | High-level tab management | `{ tabs, activeTab, createChatTab(), switchToTab(), ... }` | All tab operations (20+ methods) |
| `useTheme` | Theme context consumer | `{ theme, setTheme }` | Dark/light mode |
| `useTranslation` | i18n (ko/en) | `{ t, language, setLanguage }` | Translate UI strings |
| `useUpdater` | App update checking | `{ checkForUpdates(), installUpdate(), ... }` | Tauri updater integration |

### Analytics Hooks

| Hook | Purpose | Returns | Usage |
|------|---------|---------|-------|
| `useAnalytics` | PostHog analytics client | `{ analytics }` | Direct analytics access |
| `useTrackEvent` | Event tracking | `trackEvent(name, props)` | Custom event tracking |
| `usePageView` | Page view tracking | `void` | Auto-track on mount |
| `useAppLifecycle` | App lifecycle events | `void` | Track launch/close |
| `useComponentMetrics` | Component render metrics | `void` | Performance tracking |
| `useInteractionTracking` | UI interaction tracking | `trackClick(target)` | Button/link clicks |
| `useScreenTracking` | Screen analytics | `void` | Track screen views |
| `useFeatureExperiment` | A/B testing | `{ variant }` | Feature flags |
| `usePathTracking` | Route tracking | `void` | URL change tracking |
| `useFeatureAdoptionTracking` | Feature usage | `trackAdoption(feature)` | Adoption metrics |
| `useWorkflowTracking` | Workflow metrics | `trackWorkflowStep(step)` | Multi-step flows |
| `useAIInteractionTracking` | AI usage metrics | `trackAIInteraction(type)` | Claude interactions |
| `useNetworkPerformanceTracking` | Network metrics | `void` | API call tracking |

### Feature Hooks

| Hook | Purpose | Returns | Usage |
|------|---------|---------|-------|
| `useDevServer` | Dev server lifecycle | `{ startDevServer(), stopDevServer(), getDevServerInfo() }` | Project dev server |
| `useDevWorkflow` | PM workflow tracking | `{ currentPhase, updatePhase() }` | Planning/dev/testing phases |
| `usePlanningDocs` | Planning doc management | `{ docs, createDoc(), updateDoc() }` | SDD docs CRUD |
| `usePreviewMessages` | Preview iframe messaging | `{ sendMessage(), messages[] }` | iframe communication |
| `useWorkflowPreview` | Preview file detection | `{ isPreviewable, getPreviewFile() }` | Workflow file matching |
| `usePerformanceMonitor` | React performance monitoring | `{ metrics, reset() }` | Component render time |
| `useAsyncPerformanceTracker` | Async operation tracking | `{ trackAsync() }` | Track promise timing |
| `useComponentSelectorShortcut` | Component selector shortcut | `void` | Keyboard shortcut (Cmd/Ctrl+Shift+C) |
| `useEventListeners` | Window event management | `void` | Global event setup |

### Utility Hooks

| Hook | Purpose | Returns | Usage |
|------|---------|---------|-------|
| `useLoadingState` | Loading state management | `{ isLoading, startLoading(), stopLoading() }` | Boolean loading state |
| `useDebounce` | Value debouncing | `debouncedValue` | Debounce input changes |
| `useDebouncedCallback` | Callback debouncing | `debouncedCallback` | Debounce function calls |
| `usePagination` | Pagination state | `{ currentPage, totalPages, goToPage(), ... }` | Client-side pagination |
| `useApiCall` | Generic API wrapper | `{ data, isLoading, error, call(), reset() }` | API call with state

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

---

## Frontend Architecture Summary

### Key Metrics

| Category | Count | Details |
|----------|-------|---------|
| **Components** | 100+ | Layout, pages, features, widgets, UI |
| **Widgets** | 29 | Tool execution displays (~3400 lines) |
| **Custom Hooks** | 18 | Core, analytics, feature, utility |
| **Zustand Stores** | 5 | Auth, session, agent, preview, language |
| **Context Providers** | 3 | Tab, theme, output cache |
| **UI Components** | 23 | Radix-based primitives |
| **Dependencies** | 50+ | React ecosystem + Tauri |

### Architecture Highlights

**Component Organization:**
- **Modular structure**: 6 component directories (widgets, ui, claude-code-session, preview, planning, development)
- **Widget system**: 29 specialized widgets for Claude tool rendering
- **3-panel layout**: Sidebar, tabs, content with responsive design
- **Tab-based navigation**: Up to 20 concurrent tabs with localStorage persistence

**State Management:**
- **Zustand stores**: 5 stores with subscribeWithSelector for performance
- **Persistence**: authStore and languageStore use localStorage
- **Real-time updates**: Session and agent stores support live updates
- **Context providers**: Tab, theme, and output cache contexts

**Performance:**
- **Code splitting**: Manual chunks for vendors (React, Radix, Tauri, etc.)
- **Lazy loading**: Suspense-based component loading
- **Virtual scrolling**: For long message/log lists
- **Granular subscriptions**: Zustand subscribeWithSelector

**Developer Experience:**
- **TypeScript**: Full type safety across codebase
- **Hot Module Replacement**: Vite HMR for fast iteration
- **Dev mode**: Automatic dev user for local development
- **Analytics**: Comprehensive PostHog integration (13 analytics hooks)

**Key Features:**
- **Claude Code integration**: Full chat interface with tool execution widgets
- **Agent execution**: Create, monitor, cancel agent runs
- **Preview panel**: Live preview with console, problems, component selector
- **Dev server management**: Auto-start, proxy, port detection
- **MCP support**: Dynamic MCP tool rendering
- **Multi-language**: Korean/English i18n support

### File Structure

```
src/
├── components/          # UI components
│   ├── widgets/        # 29 tool execution widgets
│   ├── ui/             # 23 Radix UI components
│   ├── claude-code-session/  # Chat interface
│   ├── preview/        # Preview panel
│   ├── planning/       # Planning workflow
│   └── development/    # Development workflow
├── hooks/              # 18 custom hooks
├── stores/             # 5 Zustand stores
├── contexts/           # 3 context providers
├── lib/                # Utilities and helpers
├── types/              # TypeScript types
└── pages/              # Route components
```

### Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Framework** | React 18.3.1 + TypeScript 5.6 |
| **Build** | Vite 6.0.3 with HMR |
| **Styling** | Tailwind CSS 4.1.8 |
| **UI Library** | Radix UI primitives |
| **State** | Zustand 5.0.6 + Context API |
| **Routing** | React Router 7.10.1 (hash-based) |
| **Desktop** | Tauri 2.x (IPC, HTTP, Shell, Dialog) |
| **Analytics** | PostHog 1.258.3 |
| **Forms** | React Hook Form 7.54.2 + Zod 3.24.1 |
| **Markdown** | @uiw/react-md-editor 4.0.7 |
| **Syntax** | react-syntax-highlighter 15.6.1 |
| **Animation** | Framer Motion 12.0.0-alpha |
