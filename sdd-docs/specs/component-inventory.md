# Component Inventory

> Complete catalog of React components, hooks, and stores

## Overview

| Category | Count |
|----------|-------|
| **React Components** | 70 |
| **UI Components** | 20 |
| **Widget Components** | 31 |
| **Preview Components** | 8 |
| **Claude Session Components** | 4 |
| **Zustand Stores** | 5 |
| **Custom Hooks** | 15 |
| **Context Providers** | 3 |

> Last synced: 2025-12-27
> Note: Checkpoint system restored (CheckpointSettings, TimelineNavigator exist; checkpoint/ Rust module restored)
> Note: Many components refactored/consolidated. git.rs added for Git operations.
> Note: RetryContext added as new context provider
> Note: Version control components added (SnapshotTimeline, VersionControlPanel)
> Note: New widgets added (AskUserQuestionWidget, TaskOutputWidget)

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
| `ClaudeCodeSession` | ~1383 | Main chat interface with streaming, queued prompts, preview |
| `MessageList` | ~200 | Message display (claude-code-session/) |
| `PromptQueue` | ~150 | Queue management (claude-code-session/) |
| `SessionHeader` | ~120 | Session header (claude-code-session/) |
| `StreamMessage` | ~774 | Stream message renderer with tool widgets |
| `StreamingText` | ~100 | Streaming text animation |
| `SessionList` | ~200 | Session list display |
| `SessionOutputViewer` | ~180 | Session output viewer |
| `FloatingPromptInput` | ~1057 | ChatGPT-style prompt input with file/slash pickers |
| `RunningClaudeSessions` | ~150 | Running sessions list |
| `ToolsMenu` | ~485 | Model/thinking/execution mode menu popover |
| `ExecutionControlBar` | ~85 | Floating execution control bar (stop, elapsed time) |

### Chat/Session Utilities (claude-session/)

| Module | Lines | Purpose |
|--------|-------|---------|
| `promptHandlers.ts` | ~744 | Extracted handlers for handleSendPrompt (validation, queue, stream, completion) |

### Preview

| Component | Lines | Purpose |
|-----------|-------|---------|
| `EnhancedPreviewPanel` | ~1041 | Multi-mode preview with dev server, routing, component selector |
| `WebviewPreview` | ~423 | Webview-based preview for native experience |
| `PreviewPromptDialog` | ~234 | Preview prompt dialog for URL entry |
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
| `AgentsModal` | ~200 | Agents modal dialog |
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

Located in `src/components/widgets/` (31 components):

Interactive widgets displayed inline in chat messages to visualize tool executions and results.

| Widget | Purpose |
|--------|---------|
| `AskUserQuestionWidget` | User question prompt display |
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
| `TaskOutputWidget` | Task output display |
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

### RetryContext

```typescript
// src/contexts/RetryContext.tsx

interface RetryContextValue {
  retryCount: number;
  maxRetries: number;
  retry(): void;
  reset(): void;
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
| `useChatHistory` | `src/hooks/useChatHistory.ts` | Chat history management |
| `useComponentSelectorShortcut` | `src/hooks/useComponentSelectorShortcut.ts` | Component selector shortcuts |
| `useWorkflowPreview` | `src/hooks/useWorkflowPreview.ts` | Preview detection (~148 lines) |
| `useDevServer` | `src/hooks/useDevServer.ts` | Dev server management (~392 lines) |
| `usePortVerification` | `src/hooks/usePortVerification.ts` | Port verification for dev server (~186 lines) |
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

### Settings Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| `ClaudeAuthSettings` | `src/components/ClaudeAuthSettings.tsx` | ~1031 | Claude authentication manager with 3 methods |

**ClaudeAuthSettings Features**:
- **3-Tab Interface**: ANYON API, OAuth, API Key
- **Mutual Exclusivity**: Auto-disables conflicting auth methods
- **OAuth Direct Login**: PKCE flow with browser callback
- **Terminal Login Fallback**: Polling-based login detection
- **ANYON API Mode**: Server proxy with usage tracking ($5 daily limit)
- **Platform Detection**: Web mode / Windows detection for conditional features
- **Event Listeners**: `claude-auth-success`, `claude-auth-timeout`
- **Auto-Cleanup**: Removes conflicting credentials on method switch

**State Management**:
```typescript
// Active auth detection (priority-based)
getActiveAuthMethod(): AuthMethod | null {
  // 1. OAuth (highest)
  // 2. ANYON API
  // 3. API Key
}

// Tab switch with conflict check
handleMethodSwitch(method: AuthMethod) {
  // Blocks if different method active
  // Shows warning toast
}
```

**ANYON API Integration**:
```typescript
interface AnyonApiUsage {
  userId: string;
  date: string;
  usedUSD: number;
  limitUSD: number;
  remainingUSD: number;
  percentUsed: number;
}
```

### Help Components

| Component | File | Purpose |
|-----------|------|---------|
| `AIChatModal` | `src/components/help/AIChatModal.tsx` | AI-powered help chat modal |
| `FloatingHelpButton` | `src/components/help/FloatingHelpButton.tsx` | Floating FAB with Kakao/AI chat options (~185 lines) |
| `OnboardingModal` | `src/components/help/OnboardingModal.tsx` | User onboarding modal |
| `PlanningCompleteModal` | `src/components/help/PlanningCompleteModal.tsx` | Planning completion modal |
| `PreviewWelcomeModal` | `src/components/help/PreviewWelcomeModal.tsx` | Preview welcome modal |

### Planning Components

| Component | File | Purpose |
|-----------|------|---------|
| `PlanningDocsPanel` | `src/components/planning/PlanningDocsPanel.tsx` | 6-step workflow progress panel (~412 lines) |
| `UXPreviewPanel` | `src/components/planning/UXPreviewPanel.tsx` | UX preview panel (~168 lines) |
| `PlanningDocViewer` | `src/components/planning/PlanningDocViewer.tsx` | Planning document viewer |

### Version Control Components

| Component | File | Purpose |
|-----------|------|---------|
| `CreateSnapshotDialog` | `src/components/version-control/CreateSnapshotDialog.tsx` | Create snapshot dialog |
| `RevertConfirmDialog` | `src/components/version-control/RevertConfirmDialog.tsx` | Revert confirmation dialog |
| `SnapshotItem` | `src/components/version-control/SnapshotItem.tsx` | Single snapshot item display |
| `SnapshotTimeline` | `src/components/version-control/SnapshotTimeline.tsx` | Snapshot timeline visualization |
| `VersionControlPanel` | `src/components/version-control/VersionControlPanel.tsx` | Version control main panel |

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
