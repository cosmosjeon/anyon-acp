# Component Inventory

> Complete catalog of React components, hooks, and stores

## Overview

| Category | Count |
|----------|-------|
| **React Components** | 75 |
| **UI Components** | 20 |
| **Widget Components** | 29 |
| **Preview Components** | 6 |
| **Claude Session Components** | 12 |
| **Zustand Stores** | 5 |
| **Custom Hooks** | 13 |
| **Context Providers** | 2 |

> Last synced: 2025-12-25
> Note: CheckpointSettings and TimelineNavigator components removed (checkpoint system deprecated)
> Added: ToolsMenu, ExecutionControlBar, promptHandlers.ts, support.ts constants

---

## Layout Components

| Component | Location | Purpose | Props |
|-----------|----------|---------|-------|
| `AppLayout` | `src/components/layout/` | Main 3-panel layout | children |
| `AppSidebar` | `src/components/layout/` | Left navigation sidebar | collapsed, onToggle |

---

## Page Components

| Component | Location | Purpose | Route |
|-----------|----------|---------|-------|
| `LoginPage` | `src/components/` | Authentication gate | Pre-auth |
| `ProjectList` | `src/components/projects/` | Project browser | /projects |
| `ProjectRoutes` | `src/components/projects/` | Project workspace | /project/:id |
| `Settings` | `src/components/` | App configuration | Tab |
| `Agents` | `src/components/agents/` | Agent browser | Tab |
| `UsageDashboard` | `src/components/usage/` | Usage analytics | Tab |

---

## Feature Components

### Chat/Session

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ClaudeCodeSession` | ~1330 | Main chat interface with streaming, queued prompts, preview |
| `MessageList` | ~200 | Message display (claude-code-session/) |
| `PromptQueue` | ~150 | Queue management (claude-code-session/) |
| `SessionHeader` | ~120 | Session header (claude-code-session/) |
| `StreamMessage` | ~720 | Stream message renderer with tool widgets |
| `StreamingText` | ~100 | Streaming text animation |
| `SessionList` | ~200 | Session list display |
| `SessionOutputViewer` | ~180 | Session output viewer |
| `FloatingPromptInput` | ~920 | ChatGPT-style prompt input with file/slash pickers |
| `RunningClaudeSessions` | ~150 | Running sessions list |
| `ToolsMenu` | ~485 | Model/thinking/execution mode menu popover |
| `ExecutionControlBar` | ~85 | Floating execution control bar (stop, elapsed time) |

### Chat/Session Utilities (claude-session/)

| Module | Lines | Purpose |
|--------|-------|---------|
| `promptHandlers.ts` | ~720 | Extracted handlers for handleSendPrompt (validation, queue, stream, completion) |

### Preview

| Component | Lines | Purpose |
|-----------|-------|---------|
| `EnhancedPreviewPanel` | ~500 | Multi-mode preview |
| `PreviewPanel` | ~150 | Basic preview panel |
| `ActionHeader` | ~100 | Preview action header |
| `Console` | ~120 | Console output display |
| `ErrorBanner` | ~80 | Error message banner |
| `Problems` | ~100 | Problems list display |
| `SelectedComponentsDisplay` | ~80 | Selected components info |

### Agents

| Component | Lines | Purpose |
|-----------|-------|---------|
| `Agents` | ~400 | Agent browser main view |
| `AgentExecution` | ~910 | Agent run view with virtualized output |
| `AgentRunsList` | ~200 | Agent runs list |
| `AgentRunView` | ~180 | Single agent run view |
| `AgentRunOutputViewer` | ~150 | Run output viewer |
| `CreateAgent` | ~250 | Agent creation form |
| `CCAgents` | ~200 | Claude Code agents |
| `GitHubAgentBrowser` | ~300 | GitHub agent browser |

### MCP

| Component | Lines | Purpose |
|-----------|-------|---------|
| `MCPManager` | ~300 | Server management |
| `MCPServerList` | ~200 | Server list display |
| `MCPAddServer` | ~200 | Add MCP server form |
| `MCPImportExport` | ~150 | Import/Export MCP config |

---

## UI Components (Radix-based)

Located in `src/components/ui/` (20 components):

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
| `ScrollArea` | Radix ScrollArea | Scrollable containers |
| `Select` | Radix Select | Dropdowns |
| `SelectionCard` | Custom | Selectable cards |
| `SplitPane` | Custom | Resizable panes |
| `Switch` | Radix Switch | Toggles |
| `Tabs` | Radix Tabs | Tab containers |
| `Textarea` | Native | Multi-line inputs |
| `Toast` | Radix Toast | Notifications |
| `Tooltip` | Radix Tooltip | Hover hints |

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

---

## Custom Hooks

Located in `src/hooks/` (12 hooks):

### Core Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAnalytics` | `src/hooks/useAnalytics.ts` | PostHog tracking |
| `useTabState` | `src/hooks/useTabState.ts` | Tab management |
| `useTheme` | `src/hooks/useTheme.ts` | Theme context |
| `useTranslation` | `src/hooks/useTranslation.ts` | i18n (ko/en) |
| `useUpdater` | `src/hooks/useUpdater.ts` | App updates |
| `useEventListeners` | `src/hooks/useEventListeners.ts` | Event listener management |

### Feature Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useComponentSelectorShortcut` | `src/hooks/useComponentSelectorShortcut.ts` | Component selector shortcuts |
| `useWorkflowPreview` | `src/hooks/useWorkflowPreview.ts` | Preview detection |
| `useDevServer` | `src/hooks/useDevServer.ts` | Dev server management |
| `usePlanningDocs` | `src/hooks/usePlanningDocs.ts` | Planning docs integration |
| `usePreviewMessages` | `src/hooks/usePreviewMessages.ts` | Preview message handling |

### Utility Hooks

| Hook | File | Purpose |
|------|------|---------|
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
| `ProjectSettings` | `src/components/ProjectSettings.tsx` | Project-specific settings (Slash Commands) |
| `SlashCommandsManager` | `src/components/SlashCommandsManager.tsx` | Slash command CRUD interface |
| `IconPicker` | `src/components/IconPicker.tsx` | Icon selection component |
| `SlashCommandPicker` | `src/components/SlashCommandPicker.tsx` | Slash command selection picker |
| `UserProfileDropdown` | `src/components/UserProfileDropdown.tsx` | User profile dropdown menu |
| `MaintenanceWorkspace` | `src/components/MaintenanceWorkspace.tsx` | Maintenance mode workspace |
| `MvpWorkspace` | `src/components/MvpWorkspace.tsx` | MVP development workspace |

### Help Components

| Component | File | Purpose |
|-----------|------|---------|
| `AIChatModal` | `src/components/help/AIChatModal.tsx` | AI-powered help chat modal |
| `FloatingHelpButton` | `src/components/help/FloatingHelpButton.tsx` | Floating FAB with Kakao/AI chat options (~185 lines) |
| `PlanningCompleteModal` | `src/components/help/PlanningCompleteModal.tsx` | Planning completion modal |
| `PreviewWelcomeModal` | `src/components/help/PreviewWelcomeModal.tsx` | Preview welcome modal |

### Planning Components

| Component | File | Purpose |
|-----------|------|---------|
| `PlanningDocsPanel` | `src/components/planning/PlanningDocsPanel.tsx` | 6-step workflow progress panel (~380 lines) |
| `PlanningDocViewer` | `src/components/planning/PlanningDocViewer.tsx` | Planning document viewer |

### Constants

| Module | File | Purpose |
|--------|------|---------|
| `support.ts` | `src/constants/support.ts` | Beta support system config (Kakao URL, AI chat, UI settings) |

---

## Component Hierarchy

```
App
├── LoginPage (unauthenticated)
└── AppLayout (authenticated)
    ├── AppSidebar
    │   ├── Navigation
    │   ├── ProjectList (mini)
    │   └── StatusIndicator
    └── MainContent
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
        │   └── FloatingPromptInput
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
