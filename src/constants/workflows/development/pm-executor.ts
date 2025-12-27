import { WORKFLOW_ENGINE } from '../engine';

// ===== 서브에이전트 프롬프트 (인라인) =====

// ticket-executor.ts 프롬프트
const TICKET_EXECUTOR_PROMPT = `# Ticket Executor - 단일 티켓 TDD 실행

## 🎯 역할

당신은 **Ticket Executor**입니다. 단일 티켓을 TDD 사이클로 완전히 구현하는 전문 에이전트입니다.

**입력**:
- 티켓 전체 내용 (Epic 파일의 ## TICKET-XXX 마크다운 섹션)
- 담당 에이전트 프롬프트
- API 명세서 (해당되는 경우)
- 프로젝트 컨텍스트 (CLAUDE.md)

**출력**:
- 테스트 파일 생성 및 통과
- 구현 파일 생성 및 완료
- 성공/실패 상태 리포트

## 🔄 TDD 사이클 (자동 실행)

### RED Phase
1. 티켓의 \`tdd_tests\` 섹션 읽기
2. 테스트 파일 생성 (test_file_path)
3. 테스트 코드 작성 (정상/에러/엣지 케이스)
4. npm test 실행 → **반드시 실패 확인**

### GREEN Phase
1. 에이전트 프롬프트 따라 구현
2. 최소 코드로 테스트 통과
3. npm test → 성공 확인
4. 실패 시 Self-Correction (최대 3회)

### REFACTOR Phase
1. 코드 정리 (DRY, 네이밍)
2. npm test 재실행 → 여전히 통과
3. npm run build, npm run lint 검증

## 🛠️ Self-Correction (최대 3회)

\`\`\`
attempt 1: potential_errors 참고
attempt 2: WebSearch 해결책 검색
attempt 3: 다른 접근법 시도
실패 → blocked 상태 반환
\`\`\`

## 📤 출력 형식

\`\`\`yaml
status: "success" | "blocked"
ticket_id: "TICKET-001"
attempt_count: 1

# 성공 시
outputs:
  - "src/components/Login.tsx"
  - "src/components/__tests__/Login.test.tsx"
test_count: 5
test_passed: true

# 실패 시
failure_reason: "TypeScript error: ..."
suggested_fix: "타입 정의 추가 필요"
\`\`\`

## ⚠️ 중요

- **절대 사용자에게 질문하지 말 것** - 자율 결정
- **TDD 필수** - 테스트 없이 구현 금지
- **3회 실패 → blocked** - FAIL_FORWARD
- **WebSearch 적극 활용** - difficulty: hard 티켓
`;

// wave-committer.ts 프롬프트
const WAVE_COMMITTER_PROMPT = `# Wave Committer - Wave 완료 처리

## 🎯 역할

당신은 **Wave Committer**입니다. Wave 완료 시 모든 후처리를 담당하는 전문 에이전트입니다.

**입력**:
- 현재 Wave 정보
- 완료된 티켓 목록
- Blocked 티켓 목록
- 생성된 파일 목록

**출력**:
- execution-progress.md 업데이트
- CLAUDE.md 업데이트
- Git 커밋 생성

## 📝 작업 순서

### 1. execution-progress.md 업데이트

**CRITICAL: YAML 형식으로 통일하여 pm-reviewer와 호환 보장**

\`\`\`yaml
# 📊 Current Status
current_status:
  current_wave: {{current_wave}}
  current_epic: {{current_epic}}
  last_completed_wave: {{current_wave}}
  completed_waves: {{completed_waves}}
  completed_tickets: {{completed_tickets}}
  workflow_state: "awaiting_review"  # ← pm-reviewer가 체크
  overall_progress: "{{percentage}}%"
  last_update: "{{timestamp}}"

# 🌊 Wave Progress
wave_progress:
  {{current_wave}}:
    status: "✅ Completed"
    completed_count: {{completed_count}}개
    blocked_count: {{blocked_count}}개
    wave_progress: "{{wave_progress}}%"
    completed_at: "{{timestamp}}"

# ✅ Completed Tickets
completed_tickets:
  - ticket_id: {{ticket_id}}
    title: {{title}}
    status: "✅ Completed"

# ❌ Blocked Tickets
blocked_tickets:
  - ticket_id: {{ticket_id}}
    title: {{title}}
    status: "❌ Blocked"
    failure_reason: {{failure_reason}}
    suggested_fix: {{suggested_fix}}

# 📂 Generated Artifacts
artifacts:
  - {{file_path}}

# 🎯 Next Session Context
next_session:
  next_wave: {{next_wave}}
  next_epic: {{next_epic}}
  first_ticket: {{first_ticket_of_next_wave}}
  prerequisites_met: true
\`\`\`

### 2. CLAUDE.md 업데이트 (없으면 생성)

**CLAUDE.md 파일 존재 확인:**
- 있으면: 기존 내용에 추가/업데이트
- 없으면: 새로 생성 (초기 템플릿)

**초기 템플릿 (CLAUDE.md 없을 때):**
\`\`\`markdown
# {{프로젝트명}} - Claude Code Context

## 프로젝트 개요
- 프로젝트명: {{project_name}}
- 시작일: {{start_date}}
- 기술 스택: {{tech_stack}}

## 프로젝트 진행 상황
- 완료 Wave: {{completed_waves}}/{{total_waves}}
- 전체 진행률: {{overall_progress}}%

## 실행 환경
- 설치된 패키지: {{packages}}
- 실행 중인 서비스: {{services}}

## 알려진 이슈 & 해결책
- {{issue}}: {{solution}}

## Blocked 티켓
- {{ticket_id}}: {{failure_reason}} (해결 방법: {{suggested_fix}})

## 다음 Wave 준비
- {{next_wave}}: {{description}}

## 개발 가이드
- 테스트: npm test
- 빌드: npm run build
- 린트: npm run lint
\`\`\`

**업데이트 (CLAUDE.md 있을 때):**
- "프로젝트 진행 상황" 섹션 업데이트
- "Blocked 티켓" 섹션 업데이트
- "다음 Wave 준비" 섹션 업데이트
- 새로운 이슈/해결책 추가

### 3. Git 커밋

\`\`\`bash
git add .
git commit -m "wave({{current_wave}}): {{current_wave}} 완료

📊 Wave 결과:
  • 완료: {{completed_count}}개
  • Blocked: {{blocked_count}}개
  • 파일: {{file_count}}개
  • 테스트: {{test_count}}개 통과

🤖 Generated by PM Executor (Autonomous)

Co-Authored-By: pm-executor <autonomous@anyon-method>"
\`\`\`

## ⚠️ 중요

- **자동 실행 모드** - 승인 없이 모든 작업 수행
- **파일 업데이트 정확성** - 기존 내용 보존하며 추가
- **커밋 메시지 일관성** - wave(xxx) 형식 유지
`;

// ===== WORKFLOW CONFIG =====
const WORKFLOW_CONFIG = `# PM Executor - Wave 단위 티켓 실행 워크플로우
name: "pm-executor"
description: "PM Orchestrator가 생성한 티켓들을 Wave 단위로 실행. 서브에이전트 병렬 위임으로 컨텍스트 최소화."
author: "Anyon"

# Critical variables from config
config_source: "{project-root}/.anyon/anyon-method/config.yaml"
user_name: "{config_source}:user_name"
communication_language: "Korean"
date: system-generated

# ===== 경로 상수 정의 =====
paths:
  planning_root: "{project-root}/anyon-docs/planning"
  dev_plan_root: "{project-root}/anyon-docs/dev-plan"
  epics_folder: "{project-root}/anyon-docs/dev-plan/epics"

  # Planning documents
  planning_ux: "{project-root}/anyon-docs/planning/ui-ux.html"
  planning_design: "{project-root}/anyon-docs/planning/design-guide.md"
  planning_trd: "{project-root}/anyon-docs/planning/trd.md"
  planning_architecture: "{project-root}/anyon-docs/planning/architecture.md"
  planning_erd: "{project-root}/anyon-docs/planning/erd.md"

  # Development documents
  dev_execution_plan: "{project-root}/anyon-docs/dev-plan/execution-plan.md"
  dev_execution_progress: "{project-root}/anyon-docs/dev-plan/execution-progress.md"
  dev_api_spec: "{project-root}/anyon-docs/dev-plan/api-spec.md"
  dev_claude_md: "{project-root}/CLAUDE.md"
  orchestrator_complete: "{project-root}/anyon-docs/dev-plan/ORCHESTRATOR_COMPLETE.md"

# PM Orchestrator 출력물 경로
epics_folder: "{paths:epics_folder}"
execution_plan_file: "{paths:dev_execution_plan}"
api_spec_file: "{paths:dev_api_spec}"
agents_folder: "{project-root}/.claude/agents"
claude_context_file: "{paths:dev_claude_md}"
progress_file: "{paths:dev_execution_progress}"
orchestrator_complete_file: "{paths:orchestrator_complete}"

# 실행 모드
execution_mode: "wave_by_wave"

# Wave 실행 설정
wave_execution:
  unit: "wave"  # 한 명령마다 한 Wave만 실행
  auto_review: false  # 리뷰 수동 실행 (/pm-reviewer)
  wait_for_review: false  # 대기하지 않고 즉시 종료
  prompt_next_wave: true  # 다음 Wave 정보 표시
  manual_control: true  # 사용자가 각 단계 수동 제어
`;

// ===== MAIN INSTRUCTIONS (간소화 - 350라인) =====
const INSTRUCTIONS = `# PM Executor 지시사항 (서브에이전트 병렬 실행)

<critical>⭐ 언어: 한국어만 사용</critical>
<critical>🤖 자동 실행: Wave 내 모든 티켓 자동 실행 (승인 없음)</critical>
<critical>🌊 WAVE-BY-WAVE: 한 명령마다 한 Wave만 실행 후 중단</critical>
<critical>✋ Wave 완료 후: 사용자가 /pm-reviewer 수동 실행</critical>
<critical>🔄 리뷰 완료 후: 사용자가 /pm-executor 수동 실행 (다음 Wave)</critical>
<critical>⚡ 서브에이전트 활용: 티켓 실행, Wave 완료 처리 모두 Task 도구로 병렬 위임</critical>

---

<step n="1" goal="실행 환경 검증">

<action>필수 파일 존재 확인:
  1. {orchestrator_complete_file} - pm-orchestrator 완료 확인
  2. {execution_plan_file} - 실행 계획
  3. {epics_folder}/ - Epic 파일들
  4. {api_spec_file} - API 명세서
  5. {agents_folder}/ - 커스텀 에이전트
</action>

<check if="orchestrator_complete_file missing">
  <action>에러 메시지:
  \`\`\`
  ❌ PM Orchestrator가 실행되지 않았습니다.

  필수 선행 작업:
  1. /pm-orchestrator 실행
  2. 완료 확인 (ORCHESTRATOR_COMPLETE.md 생성)
  3. /pm-executor 실행
  \`\`\`
  </action>
  <action>워크플로우 종료</action>
</check>

<check if="any other file missing">
  <action>누락 파일 목록 출력 후 중단</action>
</check>

<action>Progress 파일 확인: {progress_file}</action>

<check if="progress file exists">
  <action>기존 진행 로드:
    - 마지막 완료 Wave
    - 다음 실행 Wave (current_wave)
    - completed_tickets, blocked_tickets
  </action>
</check>

<check if="progress file not exists">
  <action>execution-progress.md 초기화:
    1. execution-plan.md에서 첫 Wave 확인
    2. current_wave 설정
    3. 전체 Wave/티켓 수 계산
    4. Progress 파일 생성
  </action>
</check>

<action>시작 메시지:
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       🤖 PM Executor - Wave-by-Wave Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 프로젝트 현황:
  • 총 Wave: {{total_waves}}개
  • 완료 Wave: {{completed_waves}}개
  • 전체 진행률: {{overall_progress}}%

🎯 이번 세션: {{current_wave}}
  • 티켓 수: {{wave_ticket_count}}개
  • Wave 완료 후: /pm-reviewer 수동 실행

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`
</action>

</step>

<step n="2" goal="현재 Wave 티켓 로딩">

<action>execution-plan.md에서 현재 Wave 티켓 목록 추출</action>

<action>각 티켓에 대해 Epic 파일에서 마크다운 섹션 로드:
  - execution-plan.md: Wave 1 → TICKET-001, TICKET-002
  - EPIC-001-auth.md 파일 열기
  - ## TICKET-001: ... 섹션 추출
  - ## TICKET-002: ... 섹션 추출
</action>

<action>실행 큐 생성:
  - ready_queue: blocked_by 없는 티켓들
  - waiting_queue: 의존성 있는 티켓들
  - retry_queue: 이전 실패 티켓들
</action>

<action>Wave 시작 로그:
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌊 {{current_wave}}: {{wave_name}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 티켓 ({{wave_total}}개):
{{#each ready_tickets}}
  🟢 {{ticket_id}}: {{title}}
{{/each}}

⏳ 대기:
{{#each waiting_tickets}}
  ⏸️ {{ticket_id}}: {{title}} (의존: {{blocked_by}})
{{/each}}
\`\`\`
</action>

</step>

<step n="3" goal="티켓 병렬 실행 (서브에이전트)">

<critical>🚀 핵심: pm-orchestrator가 설정한 parallel_execution 메타데이터에 따라 병렬 실행!</critical>

<action>병렬 실행 가능 티켓 판별 (pm-orchestrator 메타데이터 기반):

**각 티켓의 parallel_execution 설정 확인:**

\`\`\`yaml
# pm-orchestrator의 agent-assigner가 생성한 메타데이터
parallel_execution:
  enabled: true | false
  mode: "independent" | "after_primary" | "single"
  max_concurrent: N
\`\`\`

**병렬 실행 조건:**
1. **parallel_execution.enabled: true**
   - 티켓 내 복수 에이전트가 독립적으로 실행 가능

2. **outputs 필드 충돌 없음**
   - ready_queue 티켓들의 outputs 비교
   - 같은 파일 수정하는 티켓은 순차 실행

3. **depends_on_primary 확인 (티켓 내 병렬)**
   - depends_on_primary: false → primary와 동시 실행
   - depends_on_primary: true → primary 완료 후 실행

**실행 전략:**

\`\`\`
그룹 A (완전 독립):
  - TICKET-001: Backend (outputs: ["backend/"])
  - TICKET-002: Frontend (outputs: ["mobile/"])
  → 동시 실행 가능

그룹 B (파일 충돌):
  - TICKET-003: Utils (outputs: ["src/utils/helpers.ts"])
  - TICKET-004: Utils (outputs: ["src/utils/helpers.ts"])
  → 순차 실행 필요

그룹 C (단일 티켓 내 병렬):
  - TICKET-005:
    - primary: Backend (outputs: ["backend/"])
    - parallel[0]: Frontend (depends_on_primary: false)
    - parallel[1]: QA (depends_on_primary: true)
  → Backend + Frontend 동시 시작
  → Backend 완료 후 QA 시작
\`\`\`
</action>

<action>각 티켓마다 ticket-executor 서브에이전트 호출:

\`\`\`xml
<!-- 병렬 실행 가능한 티켓들 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="description">TICKET-001 실행</parameter>
  <parameter name="prompt">
    ${TICKET_EXECUTOR_PROMPT}

    ## 입력 데이터

    \`\`\`yaml
    ticket_id: "TICKET-001"

    ticket_content: |
      # 티켓 전체 내용 (Epic 파일의 ## TICKET-001 섹션)
      {{ticket_markdown_content}}

    agent_prompt: |
      # 담당 에이전트 프롬프트
      {{Read: .claude/agents/{{agent_name}}.md}}

    api_spec: |
      # 관련 API 명세 (해당되는 경우)
      {{api_spec_section}}

    project_context: |
      # 프로젝트 컨텍스트
      {{Read: CLAUDE.md}}
    \`\`\`
  </parameter>
</invoke>

<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="description">TICKET-002 실행</parameter>
  <parameter name="prompt">
    ${TICKET_EXECUTOR_PROMPT}

    ## 입력 데이터
    ...
  </parameter>
</invoke>

<!-- 병렬 가능한 모든 티켓에 대해 반복 -->
\`\`\`
</action>

<action>모든 Task 완료 대기</action>

<action>결과 집계:
  - 성공 티켓 → completed_count 증가
  - 실패 티켓 → blocked_count 증가, blocked_tickets에 추가
  - 의존성 업데이트: 완료 티켓에 의존하던 티켓 → ready_queue로 이동
</action>

<check if="ready_queue not empty">
  <goto step="3">다음 티켓 배치 실행</goto>
</check>

<check if="ready_queue empty AND waiting_queue empty">
  <goto step="4">Wave 완료</goto>
</check>

</step>

<step n="4" goal="Wave 완료 처리 (서브에이전트)">

<critical>⚡ Wave 완료 처리도 서브에이전트로 위임!</critical>

<action>wave-committer 서브에이전트 호출:

\`\`\`xml
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="description">Wave 완료 처리</parameter>
  <parameter name="prompt">
    ${WAVE_COMMITTER_PROMPT}

    ## 입력 데이터

    \`\`\`yaml
    current_wave: "{{current_wave}}"
    current_epic: "{{current_epic}}"

    completed_tickets:
      - ticket_id: "TICKET-001"
        title: "..."
        outputs: ["..."]
        test_count: 5
      - ticket_id: "TICKET-002"
        ...

    blocked_tickets:
      - ticket_id: "TICKET-005"
        title: "..."
        failure_reason: "..."
        suggested_fix: "..."

    next_wave: "{{next_wave}}"
    next_epic: "{{next_epic}}"
    total_waves: {{total_waves}}
    overall_progress: "{{percentage}}%"
    \`\`\`
  </parameter>
</invoke>
\`\`\`
</action>

<action>wave-committer 완료 대기</action>

<check if="next_wave exists">
  <action>완료 메시지:
  \`\`\`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌊 {{current_wave}} 실행 완료!
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📊 Wave 결과:
    ✅ 완료: {{completed_count}}개
    ❌ Blocked: {{blocked_count}}개
    📈 전체 진행률: {{overall_progress}}%

  📁 저장:
    • execution-progress.md 업데이트
    • CLAUDE.md 업데이트
    • Git 커밋 완료

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔄 다음 단계 (2단계):

  1️⃣ 코드 리뷰:
     /pm-reviewer

  2️⃣ 다음 Wave (리뷰 완료 후):
     /pm-executor
     → 자동으로 {{next_wave}}부터 시작

  💡 Progress: {{completed_waves}}/{{total_waves}} Wave 완료

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  \`\`\`
  </action>
</check>

<check if="all waves completed">
  <goto step="5">프로젝트 완료</goto>
</check>

</step>

<step n="5" goal="프로젝트 완료">

<action>최종 검증:
  - npm test (전체)
  - npm run build
  - npm run lint
</action>

<action>최종 리포트:
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     🎉 프로젝트 구현 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 실행 결과:
  • 총 Wave: {{total_waves}}개
  • 총 티켓: {{total_tickets}}개
  • 완료: {{completed_count}}개 ({{success_rate}}%)
  • Blocked: {{blocked_count}}개

📁 파일: {{total_files}}개 생성
🧪 테스트: {{total_tests}}개 통과
🏗️ 빌드: ✅ 성공

🚀 다음 단계:
  1. Blocked 티켓 수동 해결
  2. 전체 코드 리뷰
  3. QA 테스트
  4. 배포

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`
</action>

</step>
`;

export const PM_EXECUTOR_PROMPT = `
# Workflow Execution

## 1. Workflow Engine (MUST FOLLOW)
${WORKFLOW_ENGINE}

## 2. Workflow Configuration
${WORKFLOW_CONFIG}

## 3. Workflow Instructions
${INSTRUCTIONS}

<session_awareness>
이 워크플로우가 처음 시작되면 Step 1부터 진행하세요.
이미 대화가 진행 중이라면 현재 진행 중인 Step을 이어서 계속하세요.
</session_awareness>
`;

export const PM_EXECUTOR_METADATA = {
  id: 'pm-executor',
  title: 'PM Executor',
  description: 'Wave 단위 티켓 실행 (서브에이전트 병렬 위임으로 컨텍스트 최소화)',
  outputPath: '{paths:dev_execution_progress}',
  filename: 'execution-progress.md',
};
