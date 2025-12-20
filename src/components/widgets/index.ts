/**
 * Widget Components - Organized exports for all tool widgets
 *
 * Split widgets are exported from their individual files.
 * Remaining widgets are re-exported from ToolWidgets.tsx for backward compatibility.
 *
 * Usage:
 *   import { TodoWidget, BashWidget } from '@/components/widgets';
 */

// ============================================
// Split widgets (from individual files)
// ============================================
export { TodoWidget } from './TodoWidget';
export { LSWidget, LSResultWidget } from './LSWidget';
export { BashWidget } from './BashWidget';

// ============================================
// Shared utilities
// ============================================
export { getLanguage, getDomain, getFileIconColor } from './shared/utils';

// ============================================
// Remaining widgets (from ToolWidgets.tsx)
// These will be gradually migrated to individual files
// ============================================
export {
  // Core wrapper
  CollapsibleToolWidget,

  // File operation widgets
  ReadWidget,
  ReadResultWidget,
  GlobWidget,
  WriteWidget,

  // Edit widgets
  EditWidget,
  EditResultWidget,
  MultiEditWidget,
  MultiEditResultWidget,

  // Search widgets
  GrepWidget,

  // Terminal widgets
  CommandWidget,
  CommandOutputWidget,

  // Web widgets
  WebSearchWidget,
  WebFetchWidget,
  ThinkingWidget,

  // System widgets
  SystemReminderWidget,
  SystemInitializedWidget,
  TaskWidget,
  BackgroundAgentsPanel,

  // Session widgets
  SkillPromptWidget,
  SessionInfoWidget,
  UsageStatsWidget,

  // MCP widgets
  MCPWidget,
  SummaryWidget,

  // Todo widgets (extended version)
  TodoReadWidget,
} from '../ToolWidgets';