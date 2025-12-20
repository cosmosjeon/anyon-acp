/**
 * ToolWidgets - Re-exports for all widget components
 * 
 * This file has been refactored to split the monolithic ToolWidgets.tsx
 * into individual widget files located in src/components/widgets/
 * 
 * See: sdd-docs/audits/frontend/audit-report.md (frontend-bloat-001)
 */

// Re-export all widgets from the widgets directory
export {
  // Shared utilities
  CollapsibleToolWidget,
  getLanguage,
  
  // Widgets
  TodoWidget,
  LSWidget,
  LSResultWidget,
  ReadWidget,
  ReadResultWidget,
  GlobWidget,
  BashWidget,
  WriteWidget,
  GrepWidget,
  EditWidget,
  EditResultWidget,
  MCPWidget,
  CommandWidget,
  CommandOutputWidget,
  SummaryWidget,
  MultiEditWidget,
  MultiEditResultWidget,
  SystemReminderWidget,
  SystemInitializedWidget,
  TaskWidget,
  BackgroundAgentsPanel,
  SkillPromptWidget,
  SessionInfoWidget,
  UsageStatsWidget,
  WebSearchWidget,
  ThinkingWidget,
  WebFetchWidget,
  TodoReadWidget,
} from "./widgets";
