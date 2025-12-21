/**
 * Type definitions for Tool Widgets
 *
 * This file contains type definitions for tool result widgets and their data structures.
 */

/**
 * Status of a todo item
 */
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Priority level of a todo item
 */
export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * Todo item structure
 */
export interface TodoItem {
  id?: string;
  content: string;
  activeForm: string;
  status: TodoStatus | 'cancelled';
  priority?: TodoPriority;
  dependencies?: string[];
}

/**
 * Content object that may contain text or other properties
 */
export interface ContentObject {
  text?: string;
  [key: string]: unknown;
}

/**
 * Result content that can be a string, object, or array
 */
export type ResultContent = string | ContentObject | ContentObject[] | unknown;

/**
 * Tool result structure
 */
export interface ToolResult {
  content?: ResultContent;
  is_error?: boolean;
  [key: string]: unknown;
}

/**
 * Extended tool result with todos
 */
export interface TodoToolResult extends ToolResult {
  todos?: TodoItem[];
}

/**
 * File system entry type
 */
export type FileSystemEntryType = 'file' | 'directory';

/**
 * File system entry structure
 */
export interface FileSystemEntry {
  path: string;
  type: FileSystemEntryType;
  children?: FileSystemEntry[];
}

/**
 * Diff change type
 */
export type DiffChangeType = 'added' | 'removed' | 'unchanged';

/**
 * Diff change structure
 */
export interface DiffChange {
  type: DiffChangeType;
  value: string;
  count?: number;
}

/**
 * Common widget props
 */
export interface WidgetProps {
  result?: ToolResult;
}

/**
 * Todo widget props
 */
export interface TodoWidgetProps extends WidgetProps {
  todos: TodoItem[];
}

/**
 * File path widget props
 */
export interface FilePathWidgetProps extends WidgetProps {
  filePath: string;
}

/**
 * Pattern widget props
 */
export interface PatternWidgetProps extends WidgetProps {
  pattern: string;
}

/**
 * Content widget props
 */
export interface ContentWidgetProps {
  content: string;
  filePath?: string;
}

/**
 * Bash widget props
 */
export interface BashWidgetProps extends WidgetProps {
  command: string;
  description?: string;
}

/**
 * Edit widget props
 */
export interface EditWidgetProps extends WidgetProps {
  file_path: string;
  old_string: string;
  new_string: string;
}

/**
 * Grep widget props
 */
export interface GrepWidgetProps extends WidgetProps {
  pattern: string;
  path?: string;
  include?: string;
  exclude?: string;
  outputMode?: 'content' | 'files_with_matches' | 'count';
}

/**
 * MCP widget props
 */
export interface MCPWidgetProps extends WidgetProps {
  toolName: string;
  server?: string;
  tool?: string;
  input?: unknown;
}

/**
 * Multi-edit operation
 */
export interface MultiEditOperation {
  old_string: string;
  new_string: string;
}

/**
 * Multi-edit widget props
 */
export interface MultiEditWidgetProps extends WidgetProps {
  file_path: string;
  edits: MultiEditOperation[];
}
