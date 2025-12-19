# UI/UX 개선 계획: Claude Code 출력 완전 시각화

## 개요

Claude Code CLI가 출력하는 **모든 데이터**를 사용자 친화적인 UI로 표시하기 위한 종합 계획입니다.

### 목표
> Claude Code가 출력하는 모든 정보를 최대한 보기 좋은 UI로 표시

### 원래 문제 목록

| 문제 | 심각도 | 우선순위 |
|------|--------|----------|
| 스킬 실행 시 대용량 프롬프트 노출 | 높음 | P1 |
| 오토 컴팩트 시 프롬프트 노출 | 중간 | P2 |
| 다중 서브에이전트 실행 상태 가시성 부족 | 높음 | P1 |

---

## Claude CLI 전체 출력 구조 분석 (2024-12-15 검증)

### 1. 기본 출력 형식

Claude CLI `--output-format stream-json --verbose` 모드는 JSONL 형식으로 출력합니다.

### 2. 메시지 타입별 구조

#### 2.1 `system` 메시지 (초기화 정보)

세션 시작 시 한 번 출력되는 풍부한 메타데이터:

```json
{
  "type": "system",
  "subtype": "init",
  "cwd": "/path/to/project",
  "session_id": "uuid",
  "tools": ["Task", "Bash", "Read", "Edit", ...],
  "mcp_servers": [{"name": "serena", "status": "connected"}],
  "model": "claude-opus-4-5-20251101",
  "permissionMode": "default",
  "slash_commands": ["startup-ui", "review", ...],
  "apiKeySource": "none",
  "claude_code_version": "2.0.69",
  "agents": ["general-purpose", "Explore", "Plan", ...],
  "skills": ["frontend-design", "api-design-principles", ...],
  "plugins": [{"name": "frontend-design", "path": "..."}]
}
```

**UI 활용 가능 정보:**
- `tools` → 사용 가능한 도구 목록 표시
- `mcp_servers` → MCP 서버 연결 상태 표시
- `model` → 현재 사용 중인 모델 표시
- `agents` → 사용 가능한 에이전트 타입 표시
- `skills` → 사용 가능한 스킬 목록 표시
- `plugins` → 로드된 플러그인 표시

#### 2.2 `assistant` 메시지

Claude의 응답 (텍스트 + 도구 호출):

```json
{
  "type": "assistant",
  "message": {
    "model": "claude-opus-4-5-20251101",
    "id": "msg_xxx",
    "content": [
      {"type": "text", "text": "응답 텍스트..."},
      {"type": "tool_use", "id": "toolu_xxx", "name": "Task", "input": {...}}
    ],
    "usage": {
      "input_tokens": 2,
      "cache_creation_input_tokens": 38233,
      "cache_read_input_tokens": 0,
      "output_tokens": 1
    }
  },
  "parent_tool_use_id": null,  // 서브에이전트면 부모 ID
  "session_id": "uuid"
}
```

#### 2.3 `user` 메시지 (도구 결과)

```json
{
  "type": "user",
  "message": {
    "content": [
      {"type": "tool_result", "tool_use_id": "toolu_xxx", "content": "..."}
    ]
  },
  "parent_tool_use_id": "toolu_parent",  // 서브에이전트면 존재
  "tool_use_result": {  // ⭐ 백그라운드 Task일 때 추가 정보
    "isAsync": true,
    "status": "async_launched",
    "agentId": "a4e5369",
    "description": "Find all .ts files",
    "outputFile": "/tmp/claude/tasks/a4e5369.output"
  }
}
```

#### 2.4 `result` 메시지 (세션 완료)

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 11214,
  "duration_api_ms": 29035,
  "num_turns": 3,
  "result": "최종 응답 텍스트",
  "total_cost_usd": 0.332,
  "usage": {
    "input_tokens": 2,
    "cache_creation_input_tokens": 38907,
    "cache_read_input_tokens": 38233,
    "output_tokens": 350
  },
  "modelUsage": {
    "claude-haiku-4-5-20251001": {
      "inputTokens": 2283,
      "outputTokens": 368,
      "costUSD": 0.032
    },
    "claude-opus-4-5-20251101": {
      "inputTokens": 2409,
      "outputTokens": 1001,
      "costUSD": 0.299
    }
  }
}
```

---

## 새로 발견된 UI 개선 기회

### 문제 4: 세션 초기화 정보 미활용

**현재**: `system.init` 메시지의 풍부한 정보가 UI에 표시되지 않음

**개선안**: `SessionInfoWidget` 생성

```typescript
export const SessionInfoWidget: React.FC<{
  model: string;
  tools: string[];
  agents: string[];
  skills: string[];
  mcpServers: Array<{name: string; status: string}>;
  version: string;
}> = (props) => {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4" />
        <span className="font-medium">{props.model}</span>
        <Badge variant="outline">v{props.version}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>Tools: {props.tools.length}</div>
        <div>Agents: {props.agents.length}</div>
        <div>Skills: {props.skills.length}</div>
        <div>MCP: {props.mcpServers.filter(s => s.status === 'connected').length} connected</div>
      </div>
    </div>
  );
};
```

### 문제 5: 토큰 사용량/비용 정보 미표시

**현재**: `usage`, `total_cost_usd`, `modelUsage` 정보가 UI에 없음

**개선안**: `UsageStatsWidget` 생성

```typescript
export const UsageStatsWidget: React.FC<{
  totalCost: number;
  durationMs: number;
  numTurns: number;
  modelUsage: Record<string, {inputTokens: number; outputTokens: number; costUSD: number}>;
}> = (props) => {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span>${props.totalCost.toFixed(4)}</span>
      <span>{(props.durationMs / 1000).toFixed(1)}s</span>
      <span>{props.numTurns} turns</span>
      {/* 모델별 사용량 드롭다운 */}
    </div>
  );
};
```

### 문제 6: 백그라운드 에이전트 상태 미표시

**현재**: `run_in_background: true`로 실행된 Task의 상태를 추적하지 않음

**발견된 출력 구조**:
```json
{
  "tool_use_result": {
    "isAsync": true,
    "status": "async_launched",
    "agentId": "a4e5369",
    "description": "Find all .ts files",
    "outputFile": "/tmp/claude/tasks/a4e5369.output"
  }
}
```

**개선안**: `BackgroundAgentWidget` 생성

```typescript
export const BackgroundAgentWidget: React.FC<{
  agentId: string;
  description: string;
  status: 'launched' | 'running' | 'completed' | 'error';
}> = (props) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded border border-blue-500/20 bg-blue-500/5">
      <div className="relative">
        <Bot className="h-4 w-4 text-blue-500" />
        {props.status === 'running' && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-sm flex-1 truncate">{props.description}</span>
      <Badge variant="outline" className="text-xs">
        {props.status}
      </Badge>
    </div>
  );
};
```

---

## 핵심 필드 요약

| 필드 | 위치 | 용도 | UI 컴포넌트 |
|------|------|------|-------------|
| `type` | root | 메시지 분류 | 조건부 렌더링 |
| `subtype` | root | 세부 타입 (init, success 등) | - |
| `parent_tool_use_id` | root | 서브에이전트 연결 | 메시지 그룹화 |
| `tool_use.name` | message.content | 도구 이름 | ToolWidget 선택 |
| `tool_use.id` | message.content | 도구 호출 ID | 결과 매칭 |
| `tool_use_result.isAsync` | root | 백그라운드 실행 여부 | BackgroundAgentWidget |
| `tool_use_result.agentId` | root | 에이전트 ID | 상태 추적 |
| `usage` | message/result | 토큰 사용량 | UsageStatsWidget |
| `total_cost_usd` | result | 총 비용 | UsageStatsWidget |
| `modelUsage` | result | 모델별 사용량 | 상세 통계 |

---

## Skill/Task/SlashCommand 출력 패턴

### Skill 실행

```json
// 1. tool_use
{"type":"assistant","message":{"content":[{"type":"tool_use","id":"toolu_xxx","name":"Skill","input":{"skill":"frontend-design"}}]}}

// 2. tool_result (대용량 프롬프트)
{"type":"user","message":{"content":[{"type":"tool_result","tool_use_id":"toolu_xxx","content":"[스킬 프롬프트]"}]}}
```

### Task 동기 실행

```json
// 1. tool_use
{"type":"assistant","message":{"content":[{"type":"tool_use","id":"toolu_xxx","name":"Task","input":{"description":"...","subagent_type":"Explore"}}]}}

// 2. 서브에이전트 메시지들 (parent_tool_use_id 있음)
{"type":"user","message":{...},"parent_tool_use_id":"toolu_xxx"}
{"type":"assistant","message":{...},"parent_tool_use_id":"toolu_xxx"}

// 3. tool_result
{"type":"user","message":{"content":[{"type":"tool_result","tool_use_id":"toolu_xxx","content":[...]}]}}
```

### Task 비동기(백그라운드) 실행

```json
// 1. tool_use with run_in_background
{"type":"assistant","message":{"content":[{"type":"tool_use","id":"toolu_xxx","name":"Task","input":{"description":"...","run_in_background":true}}]}}

// 2. tool_result with async info
{
  "type":"user",
  "message":{"content":[{"type":"tool_result","tool_use_id":"toolu_xxx","content":[{"type":"text","text":"Async agent launched..."}]}]},
  "tool_use_result": {
    "isAsync": true,
    "status": "async_launched",
    "agentId": "a4e5369",
    "description": "...",
    "outputFile": "/tmp/claude/tasks/a4e5369.output"
  }
}
```

---

## 문제 1: 스킬 실행 시 프롬프트 노출

### 현재 상태

**파일:** `src/components/StreamMessage.tsx:280-296`

스킬이 실행되면 `tool_result` 메시지로 확장된 프롬프트가 전달되어 화면에 그대로 노출됩니다.

### Claude CLI 출력 기반 분석 (검증됨)

```json
// Skill tool_use (assistant 메시지)
{"type":"assistant","message":{"content":[{"type":"tool_use","id":"toolu_xxx","name":"Skill","input":{"skill":"frontend-design"}}]}}

// Skill tool_result (user 메시지) - 여기서 대용량 프롬프트 노출
{"type":"user","message":{"content":[{"type":"tool_result","tool_use_id":"toolu_xxx","content":"[대용량 스킬 프롬프트]"}]}}
```

### 문제점

1. 스킬 프롬프트가 수천 줄에 달할 수 있어 UI가 압도됨
2. 사용자에게 불필요한 내부 구현 세부사항 노출
3. 스크롤이 과도하게 길어져 대화 흐름 파악 어려움

### 개선 방안 (검증된 접근법)

#### 핵심: tool_use_id 추적으로 Skill 결과 식별

**구현:**

1. **Skill tool_use ID 추적**
   ```typescript
   // 전역 또는 컨텍스트에서 관리
   const skillToolUseIds = new Set<string>();

   // tool_use 처리 시
   if (content.type === 'tool_use' && content.name === 'Skill') {
     skillToolUseIds.add(content.id);
   }
   ```

2. **Skill 결과 감지 로직**
   ```typescript
   const isSkillResult = (content: any): boolean => {
     if (content.type === 'tool_result') {
       return skillToolUseIds.has(content.tool_use_id);
     }
     return false;
   };
   ```

2. `SkillPromptWidget` 컴포넌트 생성
   ```typescript
   // src/components/ToolWidgets.tsx에 추가
   export const SkillPromptWidget: React.FC<{
     skillName?: string;
     content: string;
   }> = ({ skillName, content }) => {
     const [isExpanded, setIsExpanded] = useState(false);

     return (
       <div className="rounded-lg border border-purple-500/20 bg-purple-500/5">
         <button
           onClick={() => setIsExpanded(!isExpanded)}
           className="w-full px-4 py-3 flex items-center justify-between"
         >
           <div className="flex items-center gap-2">
             <Sparkles className="h-4 w-4 text-purple-500" />
             <span className="text-sm font-medium">
               {skillName ? `Skill: ${skillName}` : 'Skill Executing...'}
             </span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-xs text-muted-foreground">
               {content.length.toLocaleString()} chars
             </span>
             <ChevronRight className={cn(
               "h-4 w-4 transition-transform",
               isExpanded && "rotate-90"
             )} />
           </div>
         </button>

         {isExpanded && (
           <div className="px-4 pb-4 max-h-96 overflow-y-auto">
             <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
               {content}
             </pre>
           </div>
         )}
       </div>
     );
   };
   ```

3. `StreamMessage.tsx` 수정
   ```typescript
   } else if (isSkillPrompt(contentStr)) {
     const skillName = extractSkillName(contentStr);
     contentParts.push(
       <SkillPromptWidget
         key="skill"
         skillName={skillName}
         content={contentStr}
       />
     );
   } else {
     // 기존 텍스트 렌더링
   }
   ```

#### 방안 B: 길이 기반 자동 접기

2000자 이상의 사용자 메시지는 자동으로 접어서 표시합니다.

```typescript
const MAX_VISIBLE_LENGTH = 500;

if (contentStr.length > 2000) {
  contentParts.push(
    <CollapsibleContent
      key="text"
      preview={contentStr.slice(0, MAX_VISIBLE_LENGTH) + '...'}
      fullContent={contentStr}
      label={`${contentStr.length.toLocaleString()} characters`}
    />
  );
}
```

### 작업 항목

- [ ] `isSkillPrompt()` 감지 함수 구현
- [ ] `SkillPromptWidget` 컴포넌트 생성
- [ ] `StreamMessage.tsx`에 스킬 프롬프트 처리 로직 추가
- [ ] 스킬 이름 추출 유틸리티 함수 구현
- [ ] 테스트 케이스 작성

---

## 문제 2: 오토 컴팩트 시 프롬프트 노출

### 현재 상태

**파일:** `src/components/StreamMessage.tsx:103-111`

컨텍스트 컴팩션(요약) 과정에서 발생하는 중간 메시지들이 필터링되지 않고 노출됩니다.

```typescript
// 현재 코드 - isMeta가 아닌 메시지는 모두 통과
if (message.isMeta && !message.leafUuid && !message.summary) {
  return null;
}
```

### 문제점

1. 컴팩션 진행 중 시스템 메시지가 사용자에게 혼란을 줌
2. "Summarizing conversation..." 같은 내부 메시지 노출
3. 컴팩션 완료 후에도 중간 단계 메시지가 남아있음

### 개선 방안

#### 방안 A: 컴팩션 메시지 타입 필터링 (권장)

컴팩션 관련 메시지를 별도 타입으로 분류하여 처리합니다.

**구현:**

1. 컴팩션 메시지 감지 로직 추가
   ```typescript
   const isCompactionMessage = (message: ClaudeStreamMessage): boolean => {
     // 서버에서 보내는 컴팩션 관련 메시지 패턴 감지
     if (message.type === 'system' && message.subtype === 'compaction') {
       return true;
     }

     // 텍스트 기반 감지 (백업)
     const content = getMessageContent(message);
     return content.includes('context window') ||
            content.includes('summarizing') ||
            content.includes('compacting');
   };
   ```

2. `CompactionProgressWidget` 컴포넌트 생성
   ```typescript
   export const CompactionProgressWidget: React.FC<{
     status: 'in_progress' | 'completed';
     summary?: string;
   }> = ({ status, summary }) => {
     return (
       <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
         {status === 'in_progress' ? (
           <>
             <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
             <span className="text-sm text-blue-600">
               Optimizing context...
             </span>
           </>
         ) : (
           <>
             <CheckCircle2 className="h-4 w-4 text-green-500" />
             <span className="text-sm text-green-600">
               Context optimized
             </span>
           </>
         )}
       </div>
     );
   };
   ```

3. 메시지 필터링 적용
   ```typescript
   // StreamMessage.tsx 상단에 추가
   if (isCompactionMessage(message)) {
     // 진행 중인 컴팩션만 표시, 완료된 것은 숨김
     if (message.subtype === 'compaction_progress') {
       return <CompactionProgressWidget status="in_progress" />;
     }
     return null; // 다른 컴팩션 메시지는 숨김
   }
   ```

#### 방안 B: 완전 숨김 처리

컴팩션 관련 모든 메시지를 숨기고, SummaryWidget만 표시합니다.

```typescript
if (isCompactionMessage(message) && !message.summary) {
  return null;
}
```

### 작업 항목

- [ ] `isCompactionMessage()` 감지 함수 구현
- [ ] `CompactionProgressWidget` 컴포넌트 생성 (선택적)
- [ ] 메시지 필터링 로직 추가
- [ ] 서버 측에서 컴팩션 메시지 타입 명확화 검토

---

## 문제 3: 다중 서브에이전트 실행 상태 가시성 부족

### 현재 상태

**파일:** `src/components/ToolWidgets.tsx:2054-2106`

`TaskWidget`이 서브에이전트 정보를 표시하지만, 실행 상태나 진행률을 보여주지 않습니다.

```typescript
// 현재 코드 - result를 받지만 사용하지 않음
export const TaskWidget: React.FC<{
  description?: string;
  prompt?: string;
  result?: any;  // _result로 무시됨
}> = ({ description, prompt, result: _result }) => {
  // 실행 상태 표시 없음
};
```

### Claude CLI 출력 기반 분석 (검증됨)

**핵심 발견: `parent_tool_use_id` 필드로 서브에이전트 메시지 그룹화 가능**

```json
// 1. Task tool_use 시작
{"type":"assistant","message":{"content":[{"type":"tool_use","id":"toolu_parent","name":"Task","input":{"description":"Find files...","subagent_type":"Explore"}}]}}

// 2. 서브에이전트 내부 메시지들 (parent_tool_use_id로 연결)
{"type":"user","message":{...},"parent_tool_use_id":"toolu_parent"}
{"type":"assistant","message":{...},"parent_tool_use_id":"toolu_parent"}

// 3. Task 완료 (tool_result)
{"type":"user","message":{"content":[{"type":"tool_result","tool_use_id":"toolu_parent","content":[...]}]},"parent_tool_use_id":"toolu_parent"}
```

### 문제점

1. 서브에이전트가 실행 중인지, 완료됐는지 알 수 없음
2. 다중 서브에이전트 병렬 실행 시 어떤 것이 완료됐는지 파악 불가
3. 에러 발생 시 어떤 서브에이전트에서 문제가 생겼는지 불명확
4. **서브에이전트 내부 대화가 메인 대화와 섞여서 표시됨**

### 개선 방안 (검증된 접근법)

#### 핵심: parent_tool_use_id로 메시지 그룹화 및 상태 추적

**구현 전략:**

1. **Task 상태 추적 Map 관리**
   ```typescript
   interface TaskState {
     id: string;
     description: string;
     subagentType: string;
     status: 'running' | 'completed' | 'error';
     childMessages: ClaudeStreamMessage[];
     result?: any;
   }

   // 전역 또는 컨텍스트에서 관리
   const taskStates = new Map<string, TaskState>();
   ```

2. **메시지 라우팅 로직**
   ```typescript
   const processMessage = (msg: ClaudeStreamMessage) => {
     // Task tool_use 감지 → 새 Task 상태 생성
     if (msg.type === 'assistant') {
       const taskToolUse = msg.message?.content?.find(
         c => c.type === 'tool_use' && c.name === 'Task'
       );
       if (taskToolUse) {
         taskStates.set(taskToolUse.id, {
           id: taskToolUse.id,
           description: taskToolUse.input.description,
           subagentType: taskToolUse.input.subagent_type,
           status: 'running',
           childMessages: []
         });
       }
     }

     // parent_tool_use_id가 있는 메시지 → 해당 Task의 자식으로 라우팅
     if (msg.parent_tool_use_id) {
       const task = taskStates.get(msg.parent_tool_use_id);
       if (task) {
         task.childMessages.push(msg);

         // tool_result면 완료 처리
         const toolResult = msg.message?.content?.find(
           c => c.type === 'tool_result' && c.tool_use_id === task.id
         );
         if (toolResult) {
           task.status = toolResult.is_error ? 'error' : 'completed';
           task.result = toolResult.content;
         }
       }
       return null; // 메인 스트림에서 제외
     }

     return msg; // 메인 스트림에 표시
   };
   ```

3. **TaskWidget 개선**
   ```typescript
   export const TaskWidget: React.FC<{
     description?: string;
     prompt?: string;
     result?: any;
     agentId?: string;
   }> = ({ description, prompt, result, agentId }) => {
     const [isExpanded, setIsExpanded] = useState(false);

     // 상태 결정
     const getStatus = () => {
       if (!result) return 'running';
       if (result.is_error) return 'error';
       return 'completed';
     };

     const status = getStatus();

     const statusConfig = {
       running: {
         icon: <Loader2 className="h-4 w-4 animate-spin text-purple-500" />,
         text: 'Running...',
         bgClass: 'bg-purple-500/5 border-purple-500/20',
       },
       completed: {
         icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
         text: 'Completed',
         bgClass: 'bg-green-500/5 border-green-500/20',
       },
       error: {
         icon: <AlertCircle className="h-4 w-4 text-red-500" />,
         text: 'Failed',
         bgClass: 'bg-red-500/5 border-red-500/20',
       },
     };

     const config = statusConfig[status];

     return (
       <div className={cn("rounded-lg border", config.bgClass)}>
         {/* 헤더 */}
         <div className="px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Bot className="h-4 w-4 text-purple-500" />
             <span className="text-sm font-medium">Sub-Agent Task</span>
           </div>
           <div className="flex items-center gap-2">
             {config.icon}
             <span className="text-xs text-muted-foreground">{config.text}</span>
           </div>
         </div>

         {/* 설명 */}
         {description && (
           <div className="px-4 pb-3">
             <p className="text-sm text-foreground">{description}</p>
           </div>
         )}

         {/* 결과 (완료/에러 시) */}
         {result && (
           <div className="px-4 pb-3 border-t border-border/50 pt-3">
             <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
             >
               <ChevronRight className={cn(
                 "h-3 w-3 transition-transform",
                 isExpanded && "rotate-90"
               )} />
               View Result
             </button>

             {isExpanded && (
               <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                 {typeof result.content === 'string'
                   ? result.content.slice(0, 500) + (result.content.length > 500 ? '...' : '')
                   : JSON.stringify(result, null, 2).slice(0, 500)
                 }
               </div>
             )}
           </div>
         )}

         {/* Agent ID (디버깅용) */}
         {agentId && (
           <div className="px-4 pb-2 text-xs text-muted-foreground/60">
             ID: {agentId.slice(0, 8)}...
           </div>
         )}
       </div>
     );
   };
   ```

#### 방안 B: 다중 Task 상태 대시보드

여러 서브에이전트가 병렬 실행될 때를 위한 통합 대시보드를 추가합니다.

```typescript
export const ParallelTasksWidget: React.FC<{
  tasks: Array<{
    id: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'error';
  }>;
}> = ({ tasks }) => {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;

  return (
    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
      {/* 진행률 바 */}
      <div className="flex items-center gap-3 mb-3">
        <Users className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-medium">Parallel Tasks</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {completed}/{total} completed
        </span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      {/* 개별 Task 상태 */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 text-xs">
            {task.status === 'running' && (
              <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
            )}
            {task.status === 'completed' && (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            )}
            {task.status === 'pending' && (
              <Circle className="h-3 w-3 text-muted-foreground" />
            )}
            {task.status === 'error' && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
            <span className="truncate">{task.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 작업 항목

- [ ] `TaskWidget` 상태 표시 로직 추가
- [ ] 결과 미리보기 UI 구현
- [ ] `ParallelTasksWidget` 컴포넌트 생성 (다중 Task용)
- [ ] Task 상태 추적 로직 구현 (agentId 기반)
- [ ] 에러 상태 표시 스타일링

---

## 구현 로드맵

### Phase 1: 즉시 개선 (1-2일)

1. **스킬 프롬프트 접기**
   - `SkillPromptWidget` 컴포넌트 생성
   - 길이 기반 자동 접기 구현

2. **TaskWidget 상태 표시**
   - running/completed/error 상태 아이콘 추가
   - 결과 미리보기 토글 추가

### Phase 2: 안정화 (3-5일)

3. **컴팩션 메시지 필터링**
   - 감지 로직 구현
   - 진행 상태 위젯 (선택적)

4. **다중 Task 대시보드**
   - `ParallelTasksWidget` 구현
   - Task 상태 통합 관리

### Phase 3: 고도화 (1주+)

5. **서버 측 개선 협의**
   - 메시지 타입 명확화
   - 스킬/컴팩션 전용 이벤트 추가

6. **사용자 설정 추가**
   - "상세 모드" 토글 (모든 메시지 표시)
   - 자동 접기 임계값 설정

---

## 파일 변경 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/components/ToolWidgets.tsx` | `SkillPromptWidget`, `CompactionProgressWidget`, `ParallelTasksWidget` 추가, `TaskWidget` 개선 |
| `src/components/StreamMessage.tsx` | 스킬/컴팩션 메시지 감지 및 분기 처리 |
| `src/lib/messageUtils.ts` (신규) | `isSkillPrompt()`, `isCompactionMessage()`, `extractSkillName()` 유틸리티 |

---

## 테스트 시나리오

1. **스킬 프롬프트 테스트**
   - 긴 스킬 프롬프트 실행 → 접힌 상태로 표시 확인
   - 확장 버튼 클릭 → 전체 내용 표시 확인

2. **컴팩션 테스트**
   - 긴 대화 후 컴팩션 발생 → 중간 메시지 숨김 확인
   - SummaryWidget 정상 표시 확인

3. **서브에이전트 테스트**
   - Task 실행 → running 상태 표시 확인
   - Task 완료 → completed 상태 + 결과 미리보기 확인
   - 다중 Task → 진행률 및 개별 상태 표시 확인

---

## 검증 결과 요약 (2024-12-15)

### ✅ 전체 실현 가능성 확인됨

Claude CLI 실행 테스트를 통해 다음 사항이 확인되었습니다:

| 기능 | 식별 방법 | 가능 여부 |
|------|----------|----------|
| **세션 초기화 정보** | `type === "system" && subtype === "init"` | ✅ 가능 |
| **사용 가능한 도구/에이전트/스킬** | `system.init.tools/agents/skills` | ✅ 가능 |
| **MCP 서버 상태** | `system.init.mcp_servers` | ✅ 가능 |
| **Skill 실행 감지** | `tool_use.name === "Skill"` | ✅ 가능 |
| **Skill 결과 필터링** | `tool_result.tool_use_id` 매칭 | ✅ 가능 |
| **Task 시작 감지** | `tool_use.name === "Task"` | ✅ 가능 |
| **서브에이전트 메시지 그룹화** | `parent_tool_use_id` 필드 | ✅ 가능 |
| **Task 완료 감지** | `tool_result.tool_use_id` 매칭 | ✅ 가능 |
| **다중 Task 병렬 추적** | 각 Task의 `id`로 분리 관리 | ✅ 가능 |
| **백그라운드 에이전트 감지** | `tool_use_result.isAsync === true` | ✅ 가능 |
| **백그라운드 에이전트 ID** | `tool_use_result.agentId` | ✅ 가능 |
| **토큰 사용량** | `message.usage` / `result.usage` | ✅ 가능 |
| **총 비용** | `result.total_cost_usd` | ✅ 가능 |
| **모델별 사용량** | `result.modelUsage` | ✅ 가능 |
| **세션 완료 통계** | `result.duration_ms/num_turns` | ✅ 가능 |

### 완전한 데이터 구조 (업데이트)

```typescript
interface ClaudeStreamMessage {
  type: "system" | "assistant" | "user" | "result";
  subtype?: string;  // "init", "success", etc.

  // system.init 전용
  cwd?: string;
  session_id?: string;
  tools?: string[];
  mcp_servers?: Array<{name: string; status: string}>;
  model?: string;
  claude_code_version?: string;
  agents?: string[];
  skills?: string[];
  plugins?: Array<{name: string; path: string}>;

  // assistant/user 메시지
  message?: {
    model?: string;
    id?: string;
    content?: Array<{
      type: "text" | "tool_use" | "tool_result";
      text?: string;
      id?: string;           // tool_use의 고유 ID
      name?: string;         // tool 이름 (Skill, Task 등)
      input?: any;           // tool 입력
      tool_use_id?: string;  // tool_result에서 참조하는 tool_use ID
      content?: any;         // tool_result 내용
      is_error?: boolean;    // 에러 여부
    }>;
    usage?: {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };

  parent_tool_use_id?: string; // ⭐ 서브에이전트 메시지 연결 키

  // 백그라운드 Task 전용
  tool_use_result?: {
    isAsync: boolean;
    status: string;  // "async_launched"
    agentId: string;
    description: string;
    prompt?: string;
    outputFile: string;
  };

  // result 메시지 전용
  is_error?: boolean;
  duration_ms?: number;
  duration_api_ms?: number;
  num_turns?: number;
  result?: string;
  total_cost_usd?: number;
  modelUsage?: Record<string, {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens?: number;
    cacheCreationInputTokens?: number;
    costUSD: number;
  }>;
}
```

### 구현 우선순위 (업데이트)

1. **P0 (핵심)**
   - `parent_tool_use_id` 기반 메시지 라우팅 로직 구현
   - `tool_use_result.isAsync` 기반 백그라운드 에이전트 추적

2. **P1 (필수 UI)**
   - TaskWidget 상태 표시 개선 (running/completed/error)
   - BackgroundAgentWidget 생성 (다중 백그라운드 에이전트 표시)
   - Skill 결과 접기 (SkillPromptWidget)

3. **P2 (향상된 UX)**
   - ParallelTasksWidget (다중 Task 진행률 대시보드)
   - 서브에이전트 내부 대화 토글
   - SessionInfoWidget (세션 시작 시 모델/도구 정보)

4. **P3 (고급 기능)**
   - UsageStatsWidget (토큰/비용 실시간 표시)
   - 모델별 사용량 상세 분석
   - 세션 완료 통계 요약

---

## 새로 필요한 UI 컴포넌트 목록

| 컴포넌트 | 용도 | 우선순위 |
|----------|------|----------|
| `SessionInfoWidget` | 세션 시작 시 모델/도구/에이전트 정보 표시 | P2 |
| `BackgroundAgentWidget` | 백그라운드 실행 중인 에이전트 표시 | P1 |
| `BackgroundAgentsPanel` | 다중 백그라운드 에이전트 대시보드 | P1 |
| `UsageStatsWidget` | 토큰 사용량/비용 표시 | P3 |
| `SessionSummaryWidget` | 세션 완료 시 통계 요약 | P3 |
| `SkillPromptWidget` | 스킬 프롬프트 접기 | P1 |
| `TaskWidget` (개선) | 상태 표시 + 결과 미리보기 | P1 |
| `ParallelTasksWidget` | 다중 Task 진행률 | P2 |
| `McpServerStatusWidget` | MCP 서버 연결 상태 | P2 |

---

## 관련 이슈/참조

- Claude Code 서브에이전트 문서: https://code.claude.com/docs/en/sub-agents.md
- 기존 `StreamMessage.tsx` 코드 분석 결과
- `ToolWidgets.tsx` 컴포넌트 패턴 참조
- **CLI 테스트 명령어**: `claude -p --output-format stream-json --verbose "..."`

---

## 테스트 명령어 모음

```bash
# 기본 출력 테스트
claude -p --output-format stream-json --verbose "say hello"

# Skill 실행 테스트
claude -p --output-format stream-json --verbose "use the frontend-design skill"

# Task 동기 실행 테스트
claude -p --output-format stream-json --verbose "Use the Task tool with Explore agent to find files"

# Task 백그라운드 실행 테스트
claude -p --output-format stream-json --verbose "Launch 2 parallel background agents with run_in_background:true"
```
