# Component Inventory

> Complete catalog of React components, hooks, and stores

## Overview

| Category | Count |
|----------|-------|
| **React Components** | 145 |
| **UI Components** | 21 |
| **Widget Components** | 29 |
| **Zustand Stores** | 5 |
| **Custom Hooks** | 21 |
| **Context Providers** | 3 |

> Last synced: 2025-12-22

---

## Layout Components

| Component | Location | Purpose | Props |
|-----------|----------|---------|-------|
| `AppLayout` | `src/components/layout/` | Main 3-panel layout | children |
| `AppSidebar` | `src/components/layout/` | Left navigation sidebar | collapsed, onToggle |
| `Topbar` | `src/components/layout/` | Window controls, title | title |
| `TabManager` | `src/components/layout/` | Tab bar management | tabs, onSelect, onClose |
| `TabContent` | `src/components/layout/` | Dynamic tab content | tabId, type |

---

## Page Components

| Component | Location | Purpose | Route |
|-----------|----------|---------|-------|
| `LoginPage` | `src/components/` | Authentication gate | Pre-auth |
| `ProjectList` | `src/components/projects/` | Project browser | /projects |
| `ProjectRoutes` | `src/components/projects/` | Project workspace | /project/:id |
| `Settings` | `src/components/settings/` | App configuration | Tab |
| `Agents` | `src/components/agents/` | Agent browser | Tab |
| `UsageDashboard` | `src/components/usage/` | Usage analytics | Tab |

---

## Feature Components

### Chat/Session

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ClaudeCodeSession` | ~1000 | Main chat interface |
| `ClaudeCodeSession.refactored` | ~800 | Refactored chat interface |
| `MessageList` | ~200 | Message display |
| `ChatInput` | ~150 | Prompt input |
| `SessionHistory` | ~180 | History browser |
| `StreamingText` | ~100 | Streaming text animation |
| `PromptQueue` | ~150 | Queue management for prompts |
| `useClaudeMessages` | ~200 | Custom hook for messages |

### Preview

| Component | Lines | Purpose |
|-----------|-------|---------|
| `EnhancedPreviewPanel` | ~500 | Multi-mode preview |
| `PreviewIframe` | ~150 | Embedded preview |
| `CodePreview` | ~120 | Syntax highlighting |

### Agents

| Component | Lines | Purpose |
|-----------|-------|---------|
| `AgentExecution` | ~400 | Agent run view |
| `AgentForm` | ~250 | Agent CRUD form |
| `AgentCard` | ~100 | Agent list item |
| `AgentRunHistory` | ~180 | Run history |

### MCP

| Component | Lines | Purpose |
|-----------|-------|---------|
| `MCPManager` | ~300 | Server management |
| `MCPServerCard` | ~100 | Server list item |
| `MCPConfigEditor` | ~150 | Config editing |

---

## UI Components (Radix-based)

Located in `src/components/ui/` (21 components):

| Component | Base | Purpose |
|-----------|------|---------|
| `Badge` | Custom | Status badges |
| `Button` | Radix Slot | Action buttons |
| `Card` | Custom | Content cards |
| `Dialog` | Radix Dialog | Modal dialogs |
| `DropdownMenu` | Radix Dropdown | Context menus |
| `Input` | Native | Text inputs |
| `Label` | Radix Label | Form labels |
| `Pagination` | Radix/Custom | Page navigation |
| `PanelHeader` | Custom | Panel headers |
| `Popover` | Radix Popover | Popovers |
| `RadioGroup` | Radix Radio | Radio selections |
| `ScrollArea` | Radix ScrollArea | Scrollable containers |
| `Select` | Radix Select | Dropdowns |
| `SelectionCard` | Custom | Selectable cards |
| `SplitPane` | Custom | Resizable panes |
| `Switch` | Radix Switch | Toggles |
| `Tabs` | Radix Tabs | Tab containers |
| `Textarea` | Native | Multi-line inputs |
| `Toast` | Radix Toast | Notifications |
| `Tooltip` | Radix Tooltip | Hover hints |
| `TooltipModern` | Radix Tooltip | Modern tooltip variant |

---

## Widget Components

Located in `src/components/widgets/` (29 components):

Interactive widgets displayed inline in chat messages to visualize tool executions and results.

| Widget | Purpose |
|--------|---------|
| `BackgroundAgentsPanel` | Background agent status display |
| `BashWidget` | Bash command execution display |
| `CommandOutputWidget` | Command execution output |
| `CommandWidget` | Slash command display |
| `EditResultWidget` | File edit result display |
| `EditWidget` | File edit operation display |
| `GlobWidget` | Glob pattern search display |
| `GrepWidget` | Grep search results display |
| `LSResultWidget` | Directory listing results |
| `LSWidget` | Directory listing display |
| `MCPWidget` | MCP server interaction display |
| `MultiEditResultWidget` | Multiple file edits results |
| `MultiEditWidget` | Multiple file edits display |
| `ReadResultWidget` | File read results |
| `ReadWidget` | File read operation display |
| `SessionInfoWidget` | Session information display |
| `SkillPromptWidget` | Skill prompt display |
| `SummaryWidget` | Session summary display |
| `SystemInitializedWidget` | System initialization status |
| `SystemReminderWidget` | System reminder messages |
| `TaskWidget` | Task execution display |
| `ThinkingWidget` | AI thinking process display |
| `TodoReadWidget` | Todo list reader display |
| `TodoWidget` | Todo list display |
| `UsageStatsWidget` | Token usage statistics |
| `WebFetchWidget` | Web fetch operation display |
| `WebSearchWidget` | Web search results display |
| `WriteWidget` | File write operation display |
| `shared` | Shared widget utilities |

---

## Zustand Stores

### authStore

```typescript
// src/stores/authStore.ts

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

### sessionStore

```typescript
// src/stores/sessionStore.ts

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

### agentStore

```typescript
// src/stores/agentStore.ts

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

### previewStore

```typescript
// src/stores/previewStore.ts

interface PreviewState {
  previewUrl: string | null;
  previewMode: 'iframe' | 'code' | 'markdown';
  selectedFile: string | null;
}

// Actions
setPreviewUrl(url: string): void
setPreviewMode(mode: string): void
setSelectedFile(file: string): void
```

### languageStore

```typescript
// src/stores/languageStore.ts

interface LanguageState {
  language: 'ko' | 'en';
  translations: Record<string, string>;
}

// Actions
setLanguage(lang: string): void
t(key: string): string
```

---

## Context Providers

### TabContext

```typescript
// src/contexts/TabContext.tsx

interface TabContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  addTab(tab: Tab): void;
  removeTab(id: string): void;
  setActiveTab(id: string): void;
  reorderTabs(from: number, to: number): void;
}
```

### ThemeContext

```typescript
// src/contexts/ThemeContext.tsx

interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  setTheme(theme: string): void;
  resolvedTheme: 'light' | 'dark';
}
```

### OutputCacheProvider

```typescript
// src/contexts/OutputCacheContext.tsx

interface OutputCacheValue {
  cache: Map<string, string>;
  getOutput(sessionId: string): string | undefined;
  setOutput(sessionId: string, output: string): void;
  clearCache(): void;
}
```

---

## Custom Hooks

Located in `src/hooks/` (17 hooks):

### Core Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAnalytics` | `src/hooks/useAnalytics.ts` | PostHog tracking |
| `useTabState` | `src/hooks/useTabState.ts` | Tab management |
| `useTheme` | `src/hooks/useTheme.ts` | Theme context |
| `useTranslation` | `src/hooks/useTranslation.ts` | i18n (ko/en) |
| `useUpdater` | `src/hooks/useUpdater.ts` | App updates |

### Feature Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useComponentSelectorShortcut` | `src/hooks/useComponentSelectorShortcut.ts` | Component selector shortcuts |
| `useDevServer` | `src/hooks/useDevServer.ts` | Dev server lifecycle |
| `useDevWorkflow` | `src/hooks/useDevWorkflow.ts` | PM workflow |
| `useEventListeners` | `src/hooks/useEventListeners.ts` | Global event listeners |
| `usePlanningDocs` | `src/hooks/usePlanningDocs.ts` | Planning docs |
| `usePreviewMessages` | `src/hooks/usePreviewMessages.ts` | Preview iframe |
| `useWorkflowPreview` | `src/hooks/useWorkflowPreview.ts` | Preview detection |

### Utility Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useApiCall` | `src/hooks/useApiCall.ts` | API wrapper |
| `useDebounce` | `src/hooks/useDebounce.ts` | Value debouncing |
| `useLoadingState` | `src/hooks/useLoadingState.ts` | Loading state |
| `usePagination` | `src/hooks/usePagination.ts` | Pagination |
| `usePerformanceMonitor` | `src/hooks/usePerformanceMonitor.ts` | Performance monitoring |

### Additional Components

| Component | File | Purpose |
|-----------|------|---------|
| `MinimalSidebar` | `src/components/MinimalSidebar.tsx` | Minimal sidebar variant |
| `WorkspaceSidebar` | `src/components/WorkspaceSidebar.tsx` | Workspace navigation sidebar |
| `VideoLoader` | `src/components/VideoLoader.tsx` | Video loading component |
| `FilePicker.optimized` | `src/components/FilePicker.optimized.tsx` | Optimized file picker |
| `SessionList.optimized` | `src/components/SessionList.optimized.tsx` | Optimized session list |
| `ToolWidgets.new` | `src/components/ToolWidgets.new.tsx` | New tool widgets implementation |
| `PlanningDocViewer` | `src/components/planning/PlanningDocViewer.tsx` | Planning document viewer |

---

## Component Hierarchy

```
App
├── LoginPage (unauthenticated)
└── AppLayout (authenticated)
    ├── Topbar
    ├── AppSidebar
    │   ├── Navigation
    │   ├── ProjectList (mini)
    │   └── StatusIndicator
    ├── TabManager
    │   └── Tab[]
    └── TabContent
        ├── ClaudeCodeSession
        │   ├── MessageList
        │   │   └── StreamMessage
        │   │       └── ToolWidgets (29 widget types)
        │   │           ├── BashWidget
        │   │           ├── ReadWidget
        │   │           ├── WriteWidget
        │   │           ├── EditWidget
        │   │           ├── GrepWidget
        │   │           ├── TodoWidget
        │   │           └── ... (23 more)
        │   └── ChatInput
        ├── AgentExecution
        │   ├── AgentCard
        │   └── OutputView
        ├── Agents
        │   └── AgentForm
        ├── MCPManager
        │   └── MCPServerCard
        ├── Settings
        │   └── SettingsForm
        └── UsageDashboard
            └── UsageChart
```

---

## Dependencies Between Components

```
┌─────────────────────────────────────────────────────────────┐
│                       App.tsx                                │
│  Uses: authStore, TabContext, ThemeContext                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AppLayout                               │
│  Uses: useTabState, useTheme                                 │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  AppSidebar │      │  TabManager │      │  TabContent │
│  Uses:      │      │  Uses:      │      │  Uses:      │
│  - sessionStore    │  - TabContext      │  - All stores
│  - agentStore      │                    │  - Feature hooks
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## Component File Size Distribution

| Size Range | Count | Examples |
|------------|-------|----------|
| < 100 LOC | ~75 | UI primitives, widgets, cards |
| 100-300 LOC | ~45 | Forms, lists, feature widgets |
| 300-500 LOC | ~15 | Feature components, complex widgets |
| > 500 LOC | ~5 | ClaudeCodeSession, EnhancedPreviewPanel, complex features |

**Note**: Distribution is approximate based on 140 total components.

---

## Testing Coverage

| Component | Test File | Status |
|-----------|-----------|--------|
| EnhancedPreviewPanel | `EnhancedPreviewPanel.test.tsx` | Exists |
| Others | - | Not tested |

---

## Component Patterns

### Container/Presentational
- Containers: `ClaudeCodeSession`, `AgentExecution`
- Presentational: `MessageList`, `AgentCard`

### Compound Components
- `Tabs`, `Dialog`, `DropdownMenu`

### Render Props / Hooks
- Custom hooks for shared logic
- Zustand selectors for state slicing
