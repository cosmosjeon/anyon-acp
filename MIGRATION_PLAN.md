# Phase 5 Batch 2C - Icon Migration Plan

## Current Status
- Total files with lucide-react: 91
- Unique icons to migrate: 82

## Icons Already Mapped (20)
✅ AlertCircle
✅ Book
✅ BookOpen
✅ Bot
✅ Check
✅ CheckCircle
✅ CheckCircle2
✅ CheckSquare
✅ ChevronDown
✅ ChevronLeft
✅ ChevronRight
✅ ChevronUp
✅ Circle
✅ Code
✅ FileCode
✅ FileEdit
✅ FilePlus
✅ FileText
✅ Folder
✅ FolderOpen
✅ FolderSearch
✅ GitBranch
✅ Globe
✅ Globe2
✅ Info
✅ List
✅ ListChecks
✅ ListPlus
✅ Loader2
✅ LogOut
✅ Package
✅ Package2
✅ Search
✅ Server
✅ Settings
✅ Sparkles
✅ Terminal
✅ X
✅ Zap

## Icons To Add (42)
- Activity
- AlertTriangle
- ArrowLeft
- ArrowRight
- ArrowUpDown
- BarChart
- BarChart3
- Calendar
- Clock
- Code2
- Copy
- Crown
- Download
- Edit
- Edit2
- Edit3 (already mapped)
- ExternalLink
- File
- FileJson
- FileQuestion
- Github
- HardDrive
- Hash
- History
- Import
- LayoutGrid
- LayoutList
- Lock
- Maximize2
- MessageSquare
- Minimize2
- Minus
- MoreVertical
- Network
- Play
- PlayCircle
- Plus
- RefreshCw
- RotateCcw
- Save
- Settings2
- Shield
- SortAsc
- Square
- StopCircle
- Trash2
- Upload
- User
- Volume2
- VolumeX
- XCircle

## Migration Batches

### Batch 1: Core Components (15 files)
- Settings.tsx
- CreateAgent.tsx
- HooksEditor.tsx
- MarkdownEditor.tsx
- PreviewPanel.tsx
- CCAgents.tsx
- LoginPage.tsx
- MCPImportExport.tsx
- TimelineNavigator.tsx
- ClaudeCodeSession.tsx
- TabContent.tsx
- ExecutionControlBar.tsx
- ProjectList.tsx
- SessionDropdown.tsx
- ProjectRoutes.tsx

### Batch 2: Project/Session Components (10 files)
- ProjectSettings.tsx
- SlashCommandPicker.tsx
- WorkspaceSelector.tsx
- Topbar.tsx
- SessionList.tsx
- MvpWorkspace.tsx
- UsageDashboard.tsx
- FileTree.tsx
- Agents.tsx
- AgentRunOutputViewer.tsx

### Batch 3: Stream/File Components (10 files)
- StreamMessage.tsx
- ClaudeFileEditor.tsx
- ProjectCard.tsx
- InlineToolBadge.tsx
- ClaudeVersionSelector.tsx
- GitHubAgentBrowser.tsx
- ClaudeAuthSettings.tsx
- CodeViewer.tsx
- AnalyticsConsent.tsx
- AppLayout.tsx

### Batch 4: UI Components (15 files)
- TemplateSelector.tsx
- Breadcrumb.tsx
- MinimalSidebar.tsx
- FloatingPromptInput.tsx
- ImagePreview.tsx
- IconPicker.tsx
- MCPManager.tsx
- UpdateNotification.tsx
- ClaudeMemoriesDropdown.tsx
- AgentsModal.tsx
- NFOCredits.tsx
- RunningClaudeSessions.tsx
- AppSidebar.tsx
- ClaudeBinaryDialog.tsx
- TokenCounter.tsx

### Batch 5: Feature Components (20 files)
- FilePicker.tsx
- preview/* (5 files)
- MaintenanceWorkspace.tsx
- MCPServerList.tsx
- AgentRunsList.tsx
- FileExplorer.tsx
- UserProfileDropdown.tsx
- PreviewPromptDialog.tsx
- AgentExecution.tsx
- StorageTab.tsx
- TabManager.tsx
- MCPAddServer.tsx
- SessionOutputViewer.tsx
- WorkspaceSidebar.tsx
- CustomTitlebar.tsx
- SlashCommandsManager.tsx

### Batch 6: Widgets & Final (17 files)
- widgets/* (8 files)
- AgentRunView.tsx
- ProjectListView.tsx
- WebviewPreview.tsx
- ErrorBoundary.tsx
- CheckpointSettings.tsx
- claude-code-session/* (3 files)
- development/DevDocsPanel.tsx
- planning/PlanningDocsPanel.tsx

## Hugeicons Mapping Strategy

For each lucide-react icon, find the closest hugeicons equivalent:

### Common Patterns
- `*Icon` → Most hugeicons end with "Icon"
- `*Circle` → `*CircleIcon` or `*Circle01Icon`
- `*2` → Usually indicates variant, map to `*02Icon` or closest variant
- `Arrow*` → `Arrow*01Icon` or specific direction
- `Chevron*` → Use Arrow icons (already mapped)

### Special Cases
- `Loader2` → `Loading03Icon` ✅
- `X` → `Cancel01Icon` ✅
- `Check` → `Tick02Icon` ✅
- `LogOut` → `Logout01Icon` ✅
- `Bot` → `ChatBotIcon` ✅
- `Server` → `CloudServerIcon` ✅
- `Package` → `PackageIcon` or `PackageAddIcon` ✅

## Next Steps
1. Update /src/lib/icons.ts with all new mappings
2. Migrate files in batches (1-6)
3. Verify each batch compiles
4. Final verification
5. Remove lucide-react dependency
