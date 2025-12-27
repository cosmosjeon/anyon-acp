import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Target
} from "@/lib/icons";
import { TooltipSimple } from "@/components/ui/tooltip-modern";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { getClaudeSyntaxTheme } from "@/lib/claudeSyntaxTheme";
import { useTheme } from "@/hooks";
import type { ClaudeStreamMessage } from "./AgentExecution";
import {
  TodoWidget,
  TodoReadWidget,
  LSWidget,
  ReadWidget,
  GlobWidget,
  BashWidget,
  WriteWidget,
  GrepWidget,
  EditWidget,
  MCPWidget,
  CommandWidget,
  CommandOutputWidget,
  SummaryWidget,
  MultiEditWidget,
  SystemReminderWidget,
  TaskWidget,
  TaskOutputWidget,
  ThinkingWidget,
  WebSearchWidget,
  WebFetchWidget,
  AskUserQuestionWidget,
} from "./ToolWidgets";
import { getPromptDisplayInfo, isAnyonWorkflowCommand, type PromptIconType } from "@/lib/promptDisplay";
import {
  FileText as FileTextIcon,
  Palette,
  Paintbrush,
  Settings,
  Boxes,
  Database,
  LayoutList,
  Rocket,
  CheckCircle
} from "@/lib/icons";

// Icon mapping for workflow prompts
const WorkflowIcon: React.FC<{ icon: PromptIconType | null; className?: string }> = ({ icon, className = "h-4 w-4" }) => {
  switch (icon) {
    case 'file-text': return <FileTextIcon className={className} />;
    case 'palette': return <Palette className={className} />;
    case 'paintbrush': return <Paintbrush className={className} />;
    case 'settings': return <Settings className={className} />;
    case 'boxes': return <Boxes className={className} />;
    case 'database': return <Database className={className} />;
    case 'layout-list': return <LayoutList className={className} />;
    case 'rocket': return <Rocket className={className} />;
    case 'check-circle': return <CheckCircle className={className} />;
    default: return null;
  }
};

interface StreamMessageProps {
  message: ClaudeStreamMessage;
  className?: string;
  streamMessages: ClaudeStreamMessage[];
  onLinkDetected?: (url: string) => void;
  /** Index of this message in the conversation */
  messageIndex?: number;
  /** Session ID */
  sessionId?: string;
  /** Whether the session is currently loading */
  isSessionLoading?: boolean;
}

/**
 * GPT-style Stream Message Component
 * - No card/box wrapping
 * - Natural flowing conversation
 * - Inline tool badges with slide-over details
 */
const StreamMessageComponent: React.FC<StreamMessageProps> = ({
  message,
  className,
  streamMessages,
  onLinkDetected,
}) => {
  const [toolResults, setToolResults] = useState<Map<string, any>>(new Map());
  
  const { theme } = useTheme();
  const syntaxTheme = getClaudeSyntaxTheme(theme);
  
  // Extract all tool results from stream messages
  useEffect(() => {
    const results = new Map<string, any>();
    streamMessages.forEach(msg => {
      if (msg.type === "user" && msg.message?.content && Array.isArray(msg.message.content)) {
        msg.message.content.forEach((content: any) => {
          if (content.type === "tool_result" && content.tool_use_id) {
            results.set(content.tool_use_id, content);
          }
        });
      }
    });
    setToolResults(results);
  }, [streamMessages]);
  
  const getToolResult = (toolId: string | undefined): any => {
    if (!toolId) return null;
    return toolResults.get(toolId) || null;
  };
  
  try {
    // Skip meta messages
    if (message.isMeta && !message.leafUuid && !message.summary) {
      return null;
    }

    // Summary messages
    if (message.leafUuid && message.summary && (message as any).type === "summary") {
      return <SummaryWidget summary={message.summary} leafUuid={message.leafUuid} />;
    }

    // System initialization - hide completely
    if (message.type === "system" && message.subtype === "init") {
      return null;
    }

    // Assistant message - GPT style (no card)
    if (message.type === "assistant" && message.message) {
      const msg = message.message;
      const contentParts: React.ReactNode[] = [];
      const toolBadges: React.ReactNode[] = [];
      let hasContent = false;
      
      if (msg.content && Array.isArray(msg.content)) {
        msg.content.forEach((content: any, idx: number) => {
          // Text content - render as markdown
          if (content.type === "text") {
            const textContent = typeof content.text === 'string' 
              ? content.text 
              : (content.text?.text || JSON.stringify(content.text || content));
            
            if (textContent.trim()) {
              hasContent = true;
              contentParts.push(
                <div key={`text-${idx}`} className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={syntaxTheme}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={cn("px-1.5 py-0.5 rounded bg-muted font-mono text-sm", className)} {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Better link styling
                      a({ href, children, ...props }) {
                        return (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      }
                    }}
                  >
                    {textContent}
                  </ReactMarkdown>
                </div>
              );
            }
          }
          
          // Thinking content
          if (content.type === "thinking") {
            hasContent = true;
            contentParts.push(
              <div key={`thinking-${idx}`}>
                <ThinkingWidget 
                  thinking={content.thinking || ''} 
                  signature={content.signature}
                />
              </div>
            );
          }
          
          // Tool use - render as inline badge
          if (content.type === "tool_use") {
            hasContent = true;
            const toolName = content.name?.toLowerCase();
            const input = content.input;
            const toolId = content.id;
            const toolResult = getToolResult(toolId);
            
            const badge = renderToolBadge(toolName, content.name, input, toolResult, toolId, idx);
            if (badge) {
              toolBadges.push(badge);
            }
          }
        });
      }
      
      if (!hasContent) return null;
      
      // If only tools (no text), render minimal tool list
      const hasTextContent = contentParts.length > 0;
      
      if (!hasTextContent && toolBadges.length > 0) {
        // Tool-only message - minimal style like screenshot
        return (
          <div className={cn("py-2", className)}>
            <div className="space-y-0.5">
              {toolBadges}
            </div>
          </div>
        );
      }

      // Has text content - show with prose styling, no avatar
      return (
        <div className={cn("py-4", className)}>
          <div className="space-y-3">
            {/* Text content */}
            {contentParts}

            {/* Tool badges */}
            {toolBadges.length > 0 && (
              <div className="space-y-0.5">
                {toolBadges}
              </div>
            )}
          </div>
        </div>
      );
    }

    // User message - GPT style (right-aligned feel but left-aligned text)
    if (message.type === "user") {
      if (message.isMeta) return null;

      const msg = message.message || message;
      let hasContent = false;
      const contentParts: React.ReactNode[] = [];
      let isSimpleTextPrompt = false;
      let simpleTextContent = '';

      // displayText가 있으면 우선 사용 (워크플로우 짧은 표시 텍스트)
      if (message.displayText) {
        const { icon } = getPromptDisplayInfo(message.displayText);
        return (
          <div className={cn("py-3 px-4 bg-muted/30 rounded-lg", className)}>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <WorkflowIcon icon={icon} className="h-4 w-4" />
              <span>{message.displayText}</span>
            </div>
          </div>
        );
      }

      // Handle string content
      if (typeof msg.content === 'string' || (msg.content && !Array.isArray(msg.content))) {
        const contentStr = typeof msg.content === 'string' ? msg.content : String(msg.content);
        if (contentStr.trim()) {
          hasContent = true;

          // Command message
          const commandMatch = contentStr.match(/<command-name>(.+?)<\/command-name>[\s\S]*?<command-message>(.+?)<\/command-message>[\s\S]*?<command-args>(.*?)<\/command-args>/);
          if (commandMatch) {
            const [, commandName, commandMessage, commandArgs] = commandMatch;
            contentParts.push(
              <CommandWidget
                key="cmd"
                commandName={commandName.trim()}
                commandMessage={commandMessage.trim()}
                commandArgs={commandArgs?.trim()}
              />
            );
          } else if (contentStr.match(/<local-command-stdout>/)) {
            const stdoutMatch = contentStr.match(/<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/);
            if (stdoutMatch) {
              contentParts.push(
                <CommandOutputWidget key="stdout" output={stdoutMatch[1]} onLinkDetected={onLinkDetected} />
              );
            }
          } else if (isAnyonWorkflowCommand(contentStr.trim())) {
            // Workflow command
            const { text, icon } = getPromptDisplayInfo(contentStr.trim());
            return (
              <div className={cn("py-3 px-4 bg-muted/30 rounded-lg", className)}>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <WorkflowIcon icon={icon} className="h-4 w-4" />
                  <span>{text}</span>
                </div>
              </div>
            );
          } else {
            // Simple text prompt
            isSimpleTextPrompt = true;
            simpleTextContent = contentStr;
          }
        }
      }

      // Handle array content
      if (Array.isArray(msg.content)) {
        msg.content.forEach((content: any, idx: number) => {
          if (content.type === "tool_result") {
            // Skip tool results that have widgets
            let hasWidget = false;
            if (content.tool_use_id && streamMessages) {
              for (let i = streamMessages.length - 1; i >= 0; i--) {
                const prevMsg = streamMessages[i];
                if (prevMsg.type === 'assistant' && prevMsg.message?.content && Array.isArray(prevMsg.message.content)) {
                  const toolUse = prevMsg.message.content.find((c: any) => c.type === 'tool_use' && c.id === content.tool_use_id);
                  if (toolUse) {
                    const tn = toolUse.name?.toLowerCase();
                    const toolsWithWidgets = ['task','taskoutput','edit','multiedit','todowrite','todoread','ls','read','glob','bash','write','grep','websearch','webfetch','askuserquestion'];
                    if (toolsWithWidgets.includes(tn) || toolUse.name?.startsWith('mcp__')) {
                      hasWidget = true;
                    }
                    break;
                  }
                }
              }
            }
            if (hasWidget) return;

            // Render tool result
            let contentText = '';
            if (typeof content.content === 'string') {
              contentText = content.content;
            } else if (content.content?.text) {
              contentText = content.content.text;
            } else if (Array.isArray(content.content)) {
              contentText = content.content.map((c: any) => (typeof c === 'string' ? c : c.text || JSON.stringify(c))).join('\n');
            } else if (content.content) {
              contentText = JSON.stringify(content.content, null, 2);
            }

            // System reminder
            const reminderMatch = contentText.match(/<system-reminder>(.*?)<\/system-reminder>/s);
            if (reminderMatch) {
              hasContent = true;
              contentParts.push(
                <div key={`reminder-${idx}`}>
                  <SystemReminderWidget message={reminderMatch[1].trim()} />
                </div>
              );
              return;
            }

            if (contentText.trim()) {
              hasContent = true;
              contentParts.push(
                <div key={`result-${idx}`} className="text-xs font-mono bg-muted/30 rounded p-2 overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{contentText}</pre>
                </div>
              );
            }
          }

          if (content.type === "text") {
            const textContent = typeof content.text === 'string' ? content.text : (content.text?.text || JSON.stringify(content.text));
            if (textContent.trim()) {
              hasContent = true;

              if (isAnyonWorkflowCommand(textContent.trim())) {
                const { text, icon } = getPromptDisplayInfo(textContent.trim());
                contentParts.push(
                  <div key={`wf-${idx}`} className="flex items-center gap-2 text-sm font-medium text-primary">
                    <WorkflowIcon icon={icon} className="h-4 w-4" />
                    <span>{text}</span>
                  </div>
                );
              } else {
                // Check if this is a simple text user prompt (first text content)
                if (contentParts.length === 0 && !isSimpleTextPrompt) {
                  isSimpleTextPrompt = true;
                  simpleTextContent = textContent;
                } else {
                  contentParts.push(
                    <div key={`txt-${idx}`} className="text-sm whitespace-pre-wrap">
                      {textContent}
                    </div>
                  );
                }
              }
            }
          }
        });
      }

      if (!hasContent && !isSimpleTextPrompt) return null;

      // Check for selected element metadata
      const selectedElement = message.selectedElement;

      // If this is a simple text prompt with no other content
      if (isSimpleTextPrompt && contentParts.length === 0) {
        return (
          <div className={cn("py-3 px-4 bg-muted/30 rounded-lg", className)}>
            <div className="text-sm whitespace-pre-wrap">
              {simpleTextContent}
            </div>
          </div>
        );
      }

      return (
        <div className={cn("py-3 px-4 bg-muted/30 rounded-lg", className)}>
          <div className="space-y-2">
            {isSimpleTextPrompt && (
              <div key="simple-text" className="text-sm whitespace-pre-wrap">
                {simpleTextContent}
              </div>
            )}
            {contentParts}
          </div>
          {/* Selected element badge */}
          {selectedElement && (
            <div className="mt-2 flex items-center">
              <TooltipSimple
                content={`선택: <${selectedElement.tag}>${selectedElement.id ? ` #${selectedElement.id}` : ''}${selectedElement.classes ? ` .${selectedElement.classes.split(' ')[0]}` : ''}`}
                side="top"
              >
                <Badge variant="outline" className="text-xs gap-1 cursor-default">
                  <Target className="h-3 w-3" />
                  요소 선택됨
                </Badge>
              </TooltipSimple>
            </div>
          )}
        </div>
      );
    }

    // Result message - compact metadata bar (only show errors and duration)
    if (message.type === "result") {
      const isError = message.is_error || message.subtype?.includes("error");
      const hasMetadata = message.duration_ms !== undefined || message.error;

      if (!hasMetadata && !isError) return null;

      return (
        <div className={cn(
          "flex items-center gap-4 px-4 py-2 text-xs border-t border-border/30",
          isError ? "bg-destructive/5 text-destructive" : "text-muted-foreground",
          className
        )}>
          {isError ? (
            <AlertCircle className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          )}

          {message.error && <span className="text-destructive">{message.error}</span>}
        </div>
      );
    }

    return null;
  } catch (error) {
    console.error("Error rendering stream message:", error, message);
    return (
      <div className={cn("py-4 px-4 bg-destructive/5 text-destructive text-sm", className)}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Error rendering message</span>
        </div>
        <p className="text-xs mt-1 text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
  
  // Helper function to render tool badges
  function renderToolBadge(
    toolName: string | undefined, 
    originalName: string | undefined,
    input: any, 
    toolResult: any, 
    _toolId: string,
    idx: number
  ): React.ReactNode {
    if (!toolName) return null;
    
    // Format tool output
    const formatOutput = (result: any): string | undefined => {
      if (!result) return undefined;
      if (typeof result.content === 'string') return result.content;
      try {
        return JSON.stringify(result.content, null, 2);
      } catch {
        return String(result.content);
      }
    };
    
    const output = formatOutput(toolResult);
    
    // Task tool
    if (toolName === "task" && input) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <TaskWidget description={input.description} prompt={input.prompt} result={toolResult} />
        </div>
      );
    }

    // TaskOutput tool
    if (toolName === "taskoutput") {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <TaskOutputWidget {...input} result={toolResult} />
        </div>
      );
    }

    // Edit tool
    if (toolName === "edit" && input?.file_path) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <EditWidget {...input} result={toolResult} />
        </div>
      );
    }

    // MultiEdit tool
    if (toolName === "multiedit" && input?.file_path) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <MultiEditWidget {...input} result={toolResult} />
        </div>
      );
    }

    // MCP tools
    if (originalName?.startsWith("mcp__")) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <MCPWidget toolName={originalName} input={input} result={toolResult} />
        </div>
      );
    }
    
    // TodoWrite
    if (toolName === "todowrite" && input?.todos) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <TodoWidget todos={input.todos} result={toolResult} />
        </div>
      );
    }
    
    // TodoRead
    if (toolName === "todoread") {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <TodoReadWidget todos={input?.todos} result={toolResult} />
        </div>
      );
    }

    // LS
    if (toolName === "ls" && input?.path) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <LSWidget path={input.path} result={toolResult} />
        </div>
      );
    }

    // Read
    if (toolName === "read" && input?.file_path) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <ReadWidget filePath={input.file_path} result={toolResult} />
        </div>
      );
    }

    // Glob
    if (toolName === "glob" && input?.pattern) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <GlobWidget pattern={input.pattern} result={toolResult} />
        </div>
      );
    }

    // Bash
    if (toolName === "bash" && input?.command) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <BashWidget command={input.command} description={input.description} result={toolResult} />
        </div>
      );
    }

    // Write
    if (toolName === "write" && input?.file_path) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <WriteWidget filePath={input.file_path} content={input.content} result={toolResult} />
        </div>
      );
    }

    // Grep
    if (toolName === "grep" && input?.pattern) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <GrepWidget pattern={input.pattern} include={input.include} path={input.path} exclude={input.exclude} result={toolResult} />
        </div>
      );
    }
    
    // WebSearch
    if (toolName === "websearch" && input?.query) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <WebSearchWidget query={input.query} result={toolResult} />
        </div>
      );
    }
    
    // WebFetch
    if (toolName === "webfetch" && input?.url) {
      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <WebFetchWidget url={input.url} prompt={input.prompt} result={toolResult} />
        </div>
      );
    }

    // AskUserQuestion
    if (toolName === "askuserquestion" && input?.questions) {
      console.log('[StreamMessage] AskUserQuestion data:', {
        input,
        output,
        toolResult,
        'input.answers': input.answers,
        'toolResult?.answers': toolResult?.answers
      });

      return (
        <div key={`tool-${idx}`} className="space-y-2">
          <AskUserQuestionWidget
            questions={input.questions}
            answers={input.answers}
            result={toolResult}
          />
        </div>
      );
    }

    // Fallback - generic tool
    return (
      <div key={`tool-${idx}`} className="space-y-2 rounded-lg border border-muted bg-muted/20 p-3">
        <div className="text-sm font-medium text-primary">{originalName || toolName}</div>
        {toolResult && (
          <pre className="text-xs font-mono bg-background/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
            {typeof toolResult.content === 'string'
              ? toolResult.content
              : JSON.stringify(toolResult.content, null, 2)}
          </pre>
        )}
      </div>
    );
  }
};

export const StreamMessage = React.memo(StreamMessageComponent);
