# Workflow Execution Context Loss Analysis

## Key Findings

### Problem Summary
Claude loses the workflow context after user responses during workflow execution. The workflow prompt includes `WORKFLOW_ENGINE` which contains detailed instructions on how to execute workflows with multiple steps, but when a user responds to a question, Claude apparently forgets about the workflow context and treats it as a regular conversation.

### Critical Architecture Components

#### 1. WORKFLOW_ENGINE (src/constants/workflows/engine.ts)
- ~188 lines of embedded XML/structured instructions
- Contains detailed rules for:
  - Step-by-step execution (execute in exact order)
  - Mandatory skills handling
  - Optional steps (always ask)
  - Template output checkpoints
  - Consistency rules across documents
- Uses `<task>`, `<step>`, `<action>`, `<ask>` XML tags
- Critical mandate: "maintain conversation context between steps"

#### 2. Workflow Prompts (STARTUP_PRD_PROMPT, etc.)
- Loaded from `src/constants/workflows/planning/startup-prd.ts`
- Format: Natural language instructions with embedded workflow engine
- Include persona definitions, quality checks, and specific dialog patterns
- Often 1000+ lines of detailed instructions

#### 3. Frontend Flow for Workflow Execution

```
User clicks "Start Workflow" 
  → PlanningDocsPanel.handleStartWorkflow()
  → Gets workflow prompt via getWorkflowPrompt()
  → Calls onStartNewWorkflow(workflowPrompt, displayText)
  → PlanningDocsPanel passes to parent (MvpWorkspace/MaintenanceWorkspace)
  → Calls ClaudeCodeSession.startNewSession(backendPrompt, userMessage)
```

#### 4. ClaudeCodeSession.startNewSession() Flow

```
startNewSession(backendPrompt: string, userMessage?: string)
  ├─ Clear current messages and state
  ├─ Optionally display userMessage in UI (if provided)
  └─ Call handleSendPrompt(backendPrompt, "sonnet", ..., skipAddUserMessage=true)
```

#### 5. handleSendPrompt() Flow

```
handleSendPrompt(prompt, model, executionMode, hiddenContext, selectedElement, skipAddUserMessage)
  ├─ Validate input
  ├─ Queue if already loading
  ├─ Setup event listeners (createStreamMessageHandler)
  ├─ Add user message to UI (unless skipAddUserMessage=true)
  ├─ Track metrics
  ├─ Execute command via executePromptCommand()
  │   └─ Calls api.executeClaudeCode() or api.resumeClaudeCode()
  │       └─ Sends FULL prompt to backend (executeClaudeCode)
  └─ Backend streams responses back via Tauri event listeners
```

#### 6. Backend Integration

File: `src/lib/api.ts` (API wrapper)
- `executeClaudeCode(projectPath, prompt, model, executionMode)` - STARTS NEW SESSION
- `resumeClaudeCode(projectPath, sessionId, prompt, model, executionMode)` - RESUMES EXISTING

The `prompt` parameter here is the FULL PROMPT including WORKFLOW_ENGINE and all workflow instructions.

#### 7. Event Listener System

File: `src/components/claude-session/promptHandlers.ts`
- `setupEventListeners()` - Sets up Tauri listeners for:
  - `claude-output` - streams message chunks
  - `claude-error` - error messages  
  - `claude-complete` - session completion signal
- `createStreamMessageHandler()` - Processes streamed messages
- `createCompletionHandler()` - Handles when Claude completes response

## Context Loss Root Causes

### Root Cause #1: Prompt Not Re-sent to Backend
**Problem**: When user responds, `handleSendPrompt()` is called with ONLY the user's message, NOT the full workflow prompt+engine.

**Evidence**:
- Line 798 in ClaudeCodeSession.tsx: `prompt: fullPrompt` where `fullPrompt = hiddenContext ? ${prompt}${hiddenContext} : prompt`
- `hiddenContext` is optional parameter - NOT automatically populated with workflow engine
- When user sends a follow-up message via FloatingPromptInput, it's just their text

**Impact**: Backend receives only user message, not the workflow context. Even though Tauri keeps the session alive, Claude's conversation context doesn't include the original workflow instructions.

### Root Cause #2: Session-Based vs Prompt-Based Context
**Problem**: The system relies on "session context" (conversation history) but workflows are STATEFUL and require re-assertion of instructions at EACH turn.

**Evidence**:
- promptHandlers.ts line 108-112: Stream message handler processes messages but doesn't re-apply workflow rules
- No mechanism to inject workflow engine back into the conversation
- When resuming session, only loads session history, not original workflow instructions

**Timing**:
- User gets workflow instructions in first response
- Claude responds with workflow acknowledgment
- User sends response to first question
- Backend doesn't know what workflow rules to apply anymore

### Root Cause #3: Missing "Workflow Context Injection"
**Problem**: No mechanism exists to maintain workflow context across conversation turns.

**Comparison**:
- Normal chat: Context maintained via conversation history ✓
- Workflows: Context requires both:
  1. Conversation history ✓
  2. Workflow engine instructions ✗ NOT RE-ASSERTED

### Root Cause #4: Event-Driven Architecture Loses Initial Context
**Problem**: When streaming responses, metadata about workflow execution is lost.

In `createStreamMessageHandler()`:
- Only processes message content
- No reference back to original prompt
- No workflow state tracking
- When user responds, system can't reconstruct what workflow was being executed

## Evidence from Code

### Missing Workflow Context Re-injection
```typescript
// handleSendPrompt() line 793:
const fullPrompt = hiddenContext ? `${prompt}${hiddenContext}` : prompt;
await executePromptCommand({
  prompt: fullPrompt, // ← Only sends visible user prompt + optional hiddenContext
  // ← WORKFLOW_ENGINE NOT INCLUDED HERE
});
```

### No Workflow State Machine
- `promptHandlers.ts` has no tracking of "which workflow is active"
- `ClaudeCodeSession` has `workflowTracking` ref but only for step tracking, not instruction re-injection
- No "workflow context" stored in component state

### Session Manager Limitation
- `SessionPersistenceService` saves:
  - sessionId
  - projectId  
  - projectPath
  - message count
  - ✗ NOT the original workflow prompt/engine

## Recommended Fixes

### Short-term (Minimal Change)
1. Store original workflow prompt in ClaudeCodeSession component state
2. When user responds, automatically prepend workflow engine to new message
3. Send as hidden context (hiddenContext parameter already exists)

### Medium-term
1. Create WorkflowContext state management
2. Track current workflow ID, step number, instruction phase
3. Implement workflow state restoration on user response

### Long-term
1. Move workflow engine to backend (not embedded in every prompt)
2. Create workflow execution state machine on backend
3. Handle workflow logic server-side, not relying on Claude to remember

## Files to Modify

Priority Order:
1. **src/components/ClaudeCodeSession.tsx** - Store workflow context, re-inject on user response
2. **src/components/claude-session/promptHandlers.ts** - Modify handleSendPrompt to include workflow context
3. **src/components/planning/PlanningDocsPanel.tsx** - Pass workflow info to startNewSession
4. **src/services/sessionPersistence.ts** - Store workflow metadata in session
5. **src/lib/api.ts** - Consider backend-side workflow context preservation
