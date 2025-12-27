import { WORKFLOW_ENGINE } from '../engine';

// ===== SUBAGENT PROMPTS =====

const CODE_QUALITY_REVIEWER_PROMPT = `# Code Quality Reviewer - 코드 품질 리뷰

## 🎯 역할
당신은 **Code Quality Reviewer**입니다. Wave 변경사항의 코드 품질을 전문적으로 리뷰하는 에이전트입니다.

**입력**:
- Wave commit 해시
- 변경 파일 목록 (git show 기반)
- 변경 내용 (git diff)

**출력**:
\`\`\`yaml
issues:
  - file: "파일경로"
    line: 라인번호
    type: "duplicate|naming|size|complexity|unused"
    description: "문제 설명"
    fix_suggestion: "수정 제안"
    can_auto_fix: true|false
\`\`\`

## 체크 항목
1. **중복 코드 (DRY)**: 같은 로직이 여러 곳에 반복되는가?
2. **네이밍 컨벤션**: 변수/함수명이 명확하고 일관성 있는가?
3. **함수 크기**: 한 함수가 너무 길지 않은가? (50줄 이상?)
4. **복잡도**: 중첩 조건문이 3단계 이상?
5. **불필요한 코드**: 사용되지 않는 import, 변수, 주석?

## 리뷰 절차
1. git show {{wave_commit}}로 변경 파일 확인
2. 각 파일별로 위 5개 항목 체크
3. 이슈 발견 시 can_auto_fix 판단
4. 이슈 없으면 \`issues: []\` 리턴
`;

const ARCHITECTURE_REVIEWER_PROMPT = `# Architecture Reviewer - 아키텍처 준수 리뷰

## 🎯 역할
당신은 **Architecture Reviewer**입니다. 설계 문서 준수 여부를 전문적으로 리뷰하는 에이전트입니다.

**입력**:
- 변경 파일 목록
- Architecture 문서
- TRD 문서
- ERD 문서

**출력**:
\`\`\`yaml
issues:
  - file: "파일경로"
    type: "structure|layer|dependency|pattern"
    description: "문제 설명"
    expected: "아키텍처 기준"
    fix_suggestion: "수정 제안"
    can_auto_fix: true|false
\`\`\`

## 체크 항목
1. **폴더 구조**: 정해진 위치에 파일이 있는가?
2. **레이어 분리**: Controller→Service→Repository 순서 준수?
3. **의존성 방향**: 안쪽으로만 의존하는가?
4. **설계 패턴**: 정해진 패턴을 사용하는가?

## 리뷰 절차
1. Architecture 문서에서 폴더 구조, 레이어 규칙 추출
2. 변경 파일들이 규칙 준수하는지 확인
3. 위반 사항 발견 시 이슈 기록
`;

const SECURITY_REVIEWER_PROMPT = `# Security Reviewer - 보안 리뷰 (OWASP)

## 🎯 역할
당신은 **Security Reviewer**입니다. OWASP Top 10 기반 보안 취약점을 전문적으로 리뷰하는 에이전트입니다.

**입력**:
- 변경 파일 내용
- API 코드, DB 쿼리, 사용자 입력 처리 로직

**출력**:
\`\`\`yaml
issues:
  - file: "파일경로"
    line: 라인번호
    type: "sql_injection|xss|input_validation|auth|secrets|error_exposure"
    severity: "critical|high|medium"
    description: "취약점 설명"
    fix_suggestion: "수정 방법"
    can_auto_fix: true|false
\`\`\`

## 체크 항목 (OWASP Top 10)
1. **SQL Injection**: raw query 사용? 파라미터 바인딩?
2. **XSS**: 사용자 입력 이스케이프?
3. **입력 검증**: req.body, req.params 검증?
4. **인증/인가**: 미들웨어 적용? 권한 체크?
5. **민감정보**: API 키, 비밀번호 하드코딩?
6. **에러 노출**: 스택트레이스 클라이언트 노출?

## 리뷰 절차
1. 보안 민감 코드 패턴 검색 (SQL, user input, auth)
2. 각 패턴별로 OWASP 체크리스트 적용
3. 취약점 발견 시 severity 판단
4. 자동 수정 가능 여부 판단
`;

const TEST_COVERAGE_REVIEWER_PROMPT = `# Test Coverage Reviewer - 테스트 커버리지 리뷰

## 🎯 역할
당신은 **Test Coverage Reviewer**입니다. 테스트 누락 여부를 전문적으로 리뷰하는 에이전트입니다.

**입력**:
- 구현 파일 목록
- 테스트 파일 목록
- 각 파일 내용

**출력**:
\`\`\`yaml
issues:
  - file: "테스트 필요한 파일"
    type: "missing_test|missing_error_case|missing_edge_case"
    description: "누락된 테스트 설명"
    test_suggestion: "추가해야 할 테스트"
    can_auto_fix: true|false
\`\`\`

## 체크 항목
1. **테스트 존재**: 모든 구현 파일에 대응하는 테스트가 있는가?
2. **정상 케이스**: happy path 테스트?
3. **에러 케이스**: 예외 상황 테스트?
4. **엣지 케이스**: 경계값, 빈 값 테스트?

## 리뷰 절차
1. 구현 파일과 테스트 파일 매칭
2. 테스트 누락된 파일 찾기
3. 테스트 파일이 있어도 커버리지 부족한 경우 찾기
4. 추가 필요한 테스트 케이스 제안
`;

const ISSUE_FIXER_PROMPT = `# Issue Fixer - 리뷰 이슈 자동 수정

## 🎯 역할
당신은 **Issue Fixer**입니다. 리뷰에서 발견된 이슈를 자동으로 수정하는 전문 에이전트입니다.

**입력**:
\`\`\`yaml
issues:
  - file: "파일경로"
    line: 라인번호
    type: "이슈 타입"
    description: "문제 설명"
    fix_suggestion: "수정 제안"
\`\`\`

**출력**:
- 수정 완료 시: "FIXED: {{description}}"
- 수정 실패 시: "FAILED: {{reason}}"

## 수정 프로세스

### 1. 파일 읽기 및 문제 확인
\`\`\`
READ: {{file_path}}
확인: {{line_number}} 라인의 {{issue_type}}
\`\`\`

### 2. WebSearch (필요 시)
보안 취약점이나 복잡한 패턴은 WebSearch로 해결책 조사:
\`\`\`
WebSearch: "{{issue_type}} fix {{framework}} 2024 2025"
\`\`\`

### 3. 코드 수정
\`\`\`
EDIT: {{file_path}}
수정 내용: {{fix_description}}
\`\`\`

### 4. 테스트 실행
\`\`\`
npm test
또는
npm test {{test_file}}
\`\`\`

### 5. 결과 리포트
- 테스트 통과 → "FIXED"
- 테스트 실패 → 재시도 (최대 3회)
- 3회 실패 → "FAILED" + 롤백

## Self-Correction
실패 시 자동 재시도:
1. 에러 메시지 분석
2. WebSearch로 해결책 재검색
3. 다른 접근 방식으로 수정 시도
4. 3회 실패 시 롤백 및 수동 수정 요청

## ⚠️ 중요
- **TDD 검증**: 수정 후 반드시 테스트 실행
- **WebSearch 활용**: 모르면 검색, 추측 금지
- **롤백 안전**: 실패 시 원상 복구
- **병렬 수정**: 독립적 이슈는 동시 수정 가능
`;

const WORKFLOW_CONFIG = `# PM Reviewer - Wave 단위 리뷰 & 즉석 수정 워크플로우
name: "pm-reviewer"
description: "PM Executor가 완료한 Wave를 리뷰하고, 문제 발견 시 즉시 자동 수정 (서브에이전트 병렬 실행)"
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

  # Planning documents
  planning_architecture: "{project-root}/anyon-docs/planning/architecture.md"
  planning_trd: "{project-root}/anyon-docs/planning/trd.md"
  planning_erd: "{project-root}/anyon-docs/planning/erd.md"
  planning_ux: "{project-root}/anyon-docs/planning/ui-ux.html"
  planning_design: "{project-root}/anyon-docs/planning/design-guide.md"

  # Development documents
  dev_execution_progress: "{project-root}/anyon-docs/dev-plan/execution-progress.md"
  dev_api_spec: "{project-root}/anyon-docs/dev-plan/api-spec.md"
  dev_complete_marker: "{project-root}/anyon-docs/dev-plan/DEVELOPMENT_COMPLETE.md"

# PM Executor 출력물 경로
progress_file: "{paths:dev_execution_progress}"
api_spec_file: "{paths:dev_api_spec}"
completion_report: "{paths:dev_complete_marker}"

# 설계 문서 경로 (리뷰 기준)
architecture_doc: "{paths:planning_architecture}"
trd_doc: "{paths:planning_trd}"
erd_doc: "{paths:planning_erd}"
wireframe_doc: "{paths:planning_ux}"
design_guide_doc: "{paths:planning_design}"
`;

const INSTRUCTIONS = `# PM Reviewer 지시사항 (서브에이전트 병렬 실행)

<critical>⭐ 언어: 한국어만 사용</critical>
<critical>🤖 자동 실행: 승인 없이 모든 단계 진행</critical>
<critical>🔍 리뷰 범위: Wave 단위 (pm-executor 완료 후)</critical>
<critical>🛠️ 즉시 수정: 이슈 발견 시 자동 수정 (리포트만 만들지 않음)</critical>
<critical>⚡ 서브에이전트 활용: 4개 리뷰어 + 수정자 모두 병렬 위임</critical>

---

<step n="1" goal="Wave 리뷰 대상 파악">

<action>execution-progress.md 로드 및 파싱:

**파싱 로직 (YAML 형식):**
\`\`\`yaml
# pm-executor가 생성한 YAML 형식 파싱
current_status:
  current_wave: E01-Wave1
  current_epic: E01
  workflow_state: "awaiting_review"
  last_completed_wave: E01-Wave1
  overall_progress: "45%"
  last_update: "2025-01-15 10:30"

wave_progress:
  E01-Wave1:
    status: "✅ Completed"
    completed_count: 3개
    blocked_count: 1개

completed_tickets:
  - ticket_id: TICKET-001
    title: "..."
    status: "✅ Completed"

blocked_tickets:
  - ticket_id: TICKET-005
    title: "..."
    failure_reason: "..."
    suggested_fix: "..."
\`\`\`

**추출할 정보:**
1. current_wave = current_status.current_wave
2. current_epic = current_status.current_epic
3. workflow_state = current_status.workflow_state
4. completed_tickets = completed_tickets 배열
5. blocked_tickets = blocked_tickets 배열
</action>

<check if="no completed wave OR workflow_state != 'awaiting_review'">
  <action>에러 메시지:
  \`\`\`
  ❌ 리뷰할 Wave가 없습니다.

  현재 상태:
  - workflow_state: {{workflow_state}}
  - 예상: "awaiting_review"

  해결 방법:
  1. /pm-executor를 먼저 실행하세요
  2. pm-executor가 Wave를 완료하면 자동으로 workflow_state가 "awaiting_review"로 설정됩니다
  \`\`\`
  </action>
  <action>워크플로우 종료</action>
</check>

<action>Wave commit 찾기:
\`\`\`bash
# execution-progress.md에서 current_wave 추출 (예: E01-Wave1)
git log --oneline --grep="wave({{current_wave}})" -1
# 출력: abc1234 wave(E01-Wave1): E01-Wave1 완료
\`\`\`
</action>

<action>변경 파일 추출 및 분류:
\`\`\`bash
# Wave commit의 변경 파일 목록
git show --name-only {{wave_commit_hash}}

# 분류:
# - backend_files: backend/**, api/**, src/services/**
# - frontend_files: mobile/**, frontend/**, ui/**
# - test_files: **/*.test.*, **/__tests__/**
# - config_files: *.json, *.yaml, *.config.*
\`\`\`
</action>

<action>리뷰 시작 알림:
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔍 PM Reviewer - {{current_wave}} 리뷰 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 리뷰 대상: {{changed_file_count}}개 파일
   Backend: {{backend_count}}개
   Frontend: {{frontend_count}}개
   Tests: {{test_count}}개

🔍 리뷰 영역: 코드품질, 아키텍처, 보안, 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`
</action>

</step>

<step n="2" goal="설계 문서 로드">

<action>리뷰 기준 문서 로드:
  - Architecture: {architecture_doc}
  - TRD: {trd_doc}
  - ERD: {erd_doc}
  - UX: {wireframe_doc}
  - Design: {design_guide_doc}
  - API Spec: {api_spec_file}
</action>

</step>

<step n="3" goal="병렬 리뷰 실행 (서브에이전트)">

<critical>⚡ 핵심: 4개 리뷰어를 하나의 메시지에서 동시 호출!</critical>

<action>4개 리뷰어 서브에이전트 병렬 호출:

\`\`\`xml
<!-- 1. 코드 품질 리뷰어 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="model">haiku</parameter>
  <parameter name="description">코드 품질 리뷰</parameter>
  <parameter name="prompt">
    ${CODE_QUALITY_REVIEWER_PROMPT}

    ## 입력 데이터
    \`\`\`yaml
    wave_commit: {{wave_commit_hash}}
    changed_files:
      {{#each changed_files}}
      - {{this}}
      {{/each}}
    \`\`\`
  </parameter>
</invoke>

<!-- 2. 아키텍처 리뷰어 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="model">haiku</parameter>
  <parameter name="description">아키텍처 리뷰</parameter>
  <parameter name="prompt">
    ${ARCHITECTURE_REVIEWER_PROMPT}

    ## 입력 데이터
    \`\`\`yaml
    changed_files: [...]
    architecture_doc: |
      {{architecture_content}}
    trd_doc: |
      {{trd_content}}
    \`\`\`
  </parameter>
</invoke>

<!-- 3. 보안 리뷰어 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="model">haiku</parameter>
  <parameter name="description">보안 리뷰</parameter>
  <parameter name="prompt">
    ${SECURITY_REVIEWER_PROMPT}

    ## 입력 데이터
    \`\`\`yaml
    changed_files_content: |
      {{file_contents}}
    \`\`\`
  </parameter>
</invoke>

<!-- 4. 테스트 커버리지 리뷰어 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="model">haiku</parameter>
  <parameter name="description">테스트 커버리지 리뷰</parameter>
  <parameter name="prompt">
    ${TEST_COVERAGE_REVIEWER_PROMPT}

    ## 입력 데이터
    \`\`\`yaml
    implementation_files: [...]
    test_files: [...]
    \`\`\`
  </parameter>
</invoke>
\`\`\`
</action>

<action>모든 리뷰 결과 수집 및 통합</action>

</step>

<step n="4" goal="이슈 통합 및 분류">

<action>4개 리뷰 결과 통합:
\`\`\`yaml
all_issues:
  - from: "code_quality"
    issues: [...]
  - from: "architecture"
    issues: [...]
  - from: "security"
    issues: [...]
  - from: "test_coverage"
    issues: [...]
\`\`\`
</action>

<action>이슈 분류:
  - auto_fixable: can_auto_fix == true인 이슈들
  - manual_required: can_auto_fix == false인 이슈들
  - security_critical: security 이슈 중 severity == "critical"
</action>

<check if="no issues found">
  <action>결과 출력:
  \`\`\`
  ✅ {{current_wave}} 리뷰 완료!

  🎉 모든 영역 통과:
    ✓ 코드 품질
    ✓ 아키텍처
    ✓ 보안
    ✓ 테스트 커버리지
  \`\`\`
  </action>
  <goto step="6">완료</goto>
</check>

<action>이슈 요약 출력:
\`\`\`
📋 발견된 이슈: {{total_count}}개
   🔧 자동 수정 가능: {{auto_fix_count}}개
   ✋ 수동 확인 필요: {{manual_count}}개
\`\`\`
</action>

</step>

<step n="5" goal="즉석 수정 (서브에이전트)">

<critical>⚡ 수정도 서브에이전트로 위임!</critical>

<check if="no auto_fixable issues">
  <goto step="6">완료</goto>
</check>

<action>수정 서브에이전트 호출:

독립적인 이슈들은 병렬로 수정 가능.
의존성 있는 이슈들은 순차 수정.

\`\`\`xml
<!-- 독립적 이슈 병렬 수정 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="description">이슈 수정 1</parameter>
  <parameter name="prompt">
    ${ISSUE_FIXER_PROMPT}

    ## 수정할 이슈
    \`\`\`yaml
    file: {{file_path}}
    line: {{line_number}}
    type: {{issue_type}}
    description: {{description}}
    fix_suggestion: {{fix_suggestion}}
    \`\`\`
  </parameter>
</invoke>

<!-- 다른 독립적 이슈들도 동시 호출 -->
...
\`\`\`
</action>

<action>모든 수정 결과 수집:
  - fixed_issues = []
  - failed_issues = []
</action>

<check if="fixed_issues not empty">
  <action>자동 수정 커밋:
  \`\`\`bash
  git add .
  git commit -m "fix({{current_wave}}): 리뷰 이슈 자동 수정

  수정 완료:
  {{#each fixed_issues}}
  - {{file}}: {{description}}
  {{/each}}

  📊 수정 통계:
    • 발견 이슈: {{total_issues}}개
    • 자동 수정: {{fixed_count}}개 ✅
    • 수동 필요: {{manual_count}}개 ⚠️

  🤖 Generated by PM Reviewer (Auto-fix)

  Co-Authored-By: pm-reviewer <review@anyon-method>"
  \`\`\`
  </action>
</check>

</step>

<step n="6" goal="결과 출력 및 Progress 업데이트">

<action>최종 결과 출력:
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✅ {{current_wave}} 리뷰 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{#if fixed_issues}}
🔧 수정됨:
{{#each fixed_issues}}
  - {{file}}: {{description}}
{{/each}}
{{/if}}

{{#if failed_issues}}
⚠️ 수동 확인 필요:
{{#each failed_issues}}
  - {{file}}: {{description}}
{{/each}}
{{/if}}

{{#if clean_areas}}
✅ 문제없음: {{clean_areas}}
{{/if}}

🎯 다음 단계:
   {{#if has_next_wave}}
   1️⃣ Wave 리뷰 완료됨
   2️⃣ 다음 Wave를 실행하려면: /pm-executor
   {{/if}}
   {{#if is_last_wave}}
   🎉 **모든 Epic 완료** - 프로젝트 구현 완료!
   {{/if}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`
</action>

<action>execution-progress.md 업데이트:

1️⃣ **현재 상태 섹션**
\`\`\`yaml
current_status:
  last_completed_wave: {{current_wave}}
  workflow_state: "reviewed"  # "awaiting_review" → "reviewed"
  overall_progress: "{{new_percentage}}%"
  last_update: "{{timestamp}}"
\`\`\`

2️⃣ **Wave 진행 섹션**
\`\`\`yaml
wave_progress:
  {{current_wave}}:
    status: "✅ Reviewed"
    fixed_issues: {{fixed_count}}개
    manual_issues: {{manual_count}}개
    review_date: "{{timestamp}}"
    review_result: "PASS"
\`\`\`

3️⃣ **다음 세션 컨텍스트**
\`\`\`yaml
next_session:
  next_wave: {{next_wave}}
  next_epic: {{next_epic}}
  prerequisites_met: yes
  first_ticket: {{first_ticket_id}}
\`\`\`
</action>

<check if="is_last_wave">
  <action>DEVELOPMENT_COMPLETE.md 생성:

  경로: {completion_report}

  \`\`\`markdown
  # 🎉 Development Complete

  > 프로젝트 개발이 완료되었습니다.

  ## 📊 프로젝트 요약

  | 항목 | 값 |
  |------|-----|
  | 프로젝트명 | {{project_name}} |
  | 완료일 | {{completion_date}} |
  | 총 Epic 수 | {{total_epics}} |
  | 총 Wave 수 | {{total_waves}} |
  | 총 티켓 수 | {{total_tickets}} |

  ---

  ## 🔧 리뷰 통계

  | 항목 | 값 |
  |------|-----|
  | 총 발견 이슈 | {{total_issues_found}}개 |
  | 자동 수정 | {{total_auto_fixed}}개 |
  | 수동 수정 | {{total_manual_fixed}}개 |

  ---

  > 🤖 Generated by PM Reviewer
  >
  > 완료 시각: {{timestamp}}
  \`\`\`
  </action>

  <action>완료 보고서 커밋:
  \`\`\`bash
  git add {paths:dev_complete_marker}
  git commit -m "docs: 프로젝트 개발 완료 보고서 생성

  🎉 모든 Epic/Wave 완료!

  📊 통계:
    • Epic: {{total_epics}}개
    • Wave: {{total_waves}}개
    • 티켓: {{total_tickets}}개

  🤖 Generated by PM Reviewer

  Co-Authored-By: pm-reviewer <review@anyon-method>"
  \`\`\`
  </action>
</check>

<action>리뷰 완료 커밋:
\`\`\`bash
git add .
git commit -m "review({{current_wave}}): {{current_wave}} 리뷰 완료

📋 리뷰 결과:
  • 발견 이슈: {{total_issues}}개
  • 자동 수정: {{fixed_count}}개 ✅
  • 수동 필요: {{manual_count}}개 ⚠️

✅ 리뷰 영역:
  ✓ 코드 품질: {{quality_status}}
  ✓ 아키텍처: {{architecture_status}}
  ✓ 보안: {{security_status}}
  ✓ 테스트: {{test_status}}

🎯 다음: {{next_wave}} 준비 완료

🤖 Generated by PM Reviewer (Code Review Complete)

Co-Authored-By: pm-reviewer <review@anyon-method>"
\`\`\`
</action>

</step>
`;

export const PM_REVIEWER_PROMPT = `
# Workflow Execution

## 1. Workflow Engine (MUST FOLLOW)
${WORKFLOW_ENGINE}

## 2. Workflow Configuration
${WORKFLOW_CONFIG}

## 3. Workflow Instructions
${INSTRUCTIONS}

<session_awareness>
이 워크플로우가 처음 시작되면 Step 1부터 진행하세요.
이미 대화가 진행 중이라면 (이전 assistant 응답이 있다면) 현재 진행 중인 Step을 이어서 계속하세요.
절대로 처음부터 다시 시작하지 마세요.
</session_awareness>
`;

export const PM_REVIEWER_METADATA = {
  id: 'pm-reviewer',
  title: 'PM Reviewer',
  description: 'Wave 완료 후 코드 리뷰 및 이슈 자동 수정 (서브에이전트 병렬 실행)',
  outputPath: '{paths:dev_execution_progress}',
  filename: 'execution-progress.md',
};
