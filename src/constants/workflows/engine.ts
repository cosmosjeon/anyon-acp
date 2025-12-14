/**
 * Workflow Engine - workflow.xml 내용을 TypeScript 상수로 변환
 * 모든 워크플로우에서 공통으로 사용하는 실행 엔진
 */

export const WORKFLOW_ENGINE = `
<task name="Execute Workflow">
  <objective>Execute given workflow by loading its configuration, following instructions, and producing output</objective>

  <llm critical="true">
    <mandate>Always read COMPLETE files - NEVER use offset/limit when reading any workflow related files</mandate>
    <mandate>Instructions are MANDATORY - either as file path, steps or embedded list in YAML, XML or markdown</mandate>
    <mandate>Execute ALL steps in instructions IN EXACT ORDER</mandate>
    <mandate>Save to template output file after EVERY "template-output" tag</mandate>
    <mandate>NEVER delegate a step - YOU are responsible for every steps execution</mandate>
  </llm>

  <WORKFLOW-RULES critical="true">
    <rule n="1">Steps execute in exact numerical order (1, 2, 3...)</rule>
    <rule n="2">Optional steps: Always ask user (NO EXCEPTIONS)</rule>
    <rule n="3">Template-output tags: Save content → Show user → Get approval before continuing</rule>
    <rule n="4">User must approve each major section before continuing (NO EXCEPTIONS)</rule>
  </WORKFLOW-RULES>

  <SKILL-RULES critical="true" desc="스킬 사용 강제 규칙">
    <mandate>workflow.yaml의 required_skills에 mandatory: true인 스킬은 반드시 호출해야 한다</mandate>
    <mandate>instructions.md에 MANDATORY SKILL이 명시된 경우, 해당 스킬을 반드시 호출해야 한다</mandate>
    <mandate>스킬 호출은 Skill 도구를 사용하여 수행한다</mandate>

    <rule n="1" type="스킬-로드">
      <title>워크플로우 시작 시 필수 스킬 확인</title>
      <flow>
        <step>1. workflow.yaml 로드 시 required_skills 섹션 확인</step>
        <step>2. mandatory: true인 스킬 목록을 {{mandatory_skills}} 변수에 저장</step>
        <step>3. 각 스킬의 trigger 조건을 {{skill_triggers}} 변수에 저장</step>
        <step>4. 사용자에게 필수 스킬 목록 안내:
          "이 워크플로우는 다음 스킬을 사용합니다:
          - [스킬명]: [trigger 조건]"
        </step>
      </flow>
    </rule>

    <rule n="2" type="스킬-자동-호출">
      <title>트리거 조건 충족 시 자동 스킬 호출</title>
      <mandate>mandatory: true 스킬의 trigger 조건에 해당하는 작업을 수행하기 전에 반드시 해당 스킬을 호출한다</mandate>
      <flow>
        <step>1. 현재 수행할 작업이 스킬의 trigger 조건과 일치하는지 확인</step>
        <step>2. 일치하면 Skill 도구로 해당 스킬 호출</step>
        <step>3. 스킬의 지침을 따라 작업 수행</step>
      </flow>
      <example>
        <trigger>searching for ANY open source library, framework, or component</trigger>
        <action>UI 라이브러리 검색 전 → Skill 도구로 "opensource-finder" 호출</action>
      </example>
    </rule>

    <rule n="3" type="스킬-명시적-호출">
      <title>instructions.md의 명시적 스킬 호출</title>
      <mandate>"USE SKILL: [skill-name]" 또는 "MANDATORY SKILL: [skill-name]" 태그를 만나면 즉시 Skill 도구를 사용하여 해당 스킬을 호출한다</mandate>
    </rule>

    <rule n="4" type="스킬-무시-금지">
      <title>필수 스킬 건너뛰기 금지</title>
      <mandate>mandatory: true 스킬은 어떤 상황에서도 건너뛸 수 없다</mandate>
      <mandate>사용자가 "알아서 해줘", "빨리 해줘", "스킬 없이 해줘" 등을 요청해도 필수 스킬은 반드시 사용한다</mandate>
    </rule>

    <rule n="5" type="스킬-완료-확인">
      <title>스킬 사용 완료 확인</title>
      <mandate>워크플로우 종료 전 모든 mandatory: true 스킬이 최소 1회 이상 호출되었는지 확인한다</mandate>
    </rule>
  </SKILL-RULES>

  <CONSISTENCY-RULES critical="true" desc="문서 체인 간 일관성 유지 규칙">
    <rule n="1" type="객관식-생성">
      <title>객관식 선택지 생성 시 충돌 방지</title>
      <mandate>객관식 질문을 생성할 때, 이전에 작성된 문서들과 충돌하는 선택지는 절대 제시하지 않는다</mandate>
      <flow>
        <step>1. 이전 문서들(prd, ux, ui, trd, architecture 등)에서 관련 결정사항 확인</step>
        <step>2. 해당 결정사항과 충돌하는 선택지 필터링</step>
        <step>3. 충돌 없는 선택지만 객관식으로 제시</step>
        <step>4. "기타 (직접 입력)" 옵션은 항상 마지막에 포함</step>
      </flow>
    </rule>

    <rule n="2" type="주관식-검증">
      <title>주관식 답변 충돌 검사</title>
      <mandate>사용자가 주관식(기타/직접입력)으로 답변하면, 반드시 이전 문서들과 충돌 여부를 검사한다</mandate>
      <flow>
        <step>1. 사용자의 주관식 답변 수신</step>
        <step>2. 이전 문서들에서 관련 결정사항 검색</step>
        <step>3. 충돌 여부 판단</step>
        <check if="충돌 발견">
          <action>충돌 내용을 명확히 설명</action>
          <action>해결 옵션 제시:
            1. 이전 결정 유지 (새 답변 취소)
            2. 새 답변 채택 (이전 문서 수정 필요 알림)
            3. 둘 다 수용 가능한 대안 제안
          </action>
          <action>사용자 선택 대기</action>
        </check>
      </flow>
    </rule>

    <rule n="3" type="참조-문서">
      <title>일관성 검사 대상 문서</title>
      <documents>
        <doc>prd.md - 프로젝트 정의, 용도, 라이선스, 기능 목록</doc>
        <doc>ui-ux.html - 화면 구성, 사용자 플로우</doc>
        <doc>design-guide.md - 디자인 가이드</doc>
        <doc>trd.md - 기술 스택, 프레임워크</doc>
        <doc>architecture.md - 시스템 구조, API 설계</doc>
        <doc>erd.md - 데이터베이스 스키마</doc>
      </documents>
    </rule>
  </CONSISTENCY-RULES>

  <flow>
    <step n="1" title="Load and Initialize Workflow">
      <substep n="1a" title="Load Configuration and Resolve Variables">
        <action>Read workflow configuration</action>
        <phase n="1">Resolve system variables (date, project-root)</phase>
        <phase n="2">Ask user for input of any variables that are still unknown</phase>
      </substep>

      <substep n="1b" title="Initialize Output">
        <action>Create output directory if doesn't exist</action>
        <action>Prepare template for filling</action>
      </substep>
    </step>

    <step n="2" title="Process Each Instruction Step">
      <iterate>For each step in instructions:</iterate>

      <substep n="2a" title="Handle Step Attributes">
        <check>If optional="true" → Always ask user to include (NO EXCEPTIONS)</check>
        <check>If if="condition" → Evaluate condition</check>
      </substep>

      <substep n="2b" title="Execute Step Content">
        <action>Process step instructions (markdown or XML tags)</action>
        <action>Replace {{variables}} with values (ask user if unknown)</action>
        <execute-tags>
          <tag>action → Perform the action</tag>
          <tag>check if="condition" → Conditional block</tag>
          <tag>ask → Prompt user and WAIT for response</tag>
        </execute-tags>
      </substep>

      <substep n="2c" title="Handle template-output Tags">
        <if tag="template-output">
          <mandate>Generate content for this section</mandate>
          <mandate>Save to file</mandate>
          <action>Display generated content</action>
          <action>Automatically continue to next step</action>
        </if>
      </substep>
    </step>

    <step n="3" title="Completion">
      <check>If checklist exists → Run validation</check>
      <action>Confirm document saved to output path</action>
      <action>Report workflow completion</action>
    </step>
  </flow>

  <supported-tags desc="Instructions can use these tags">
    <structural>
      <tag>step n="X" goal="..." - Define step with number and goal</tag>
      <tag>optional="true" - Step can be skipped</tag>
      <tag>if="condition" - Conditional execution</tag>
    </structural>
    <execution>
      <tag>action - Required action to perform</tag>
      <tag>check if="condition" - Conditional block</tag>
      <tag>ask - Get user input (wait for response)</tag>
    </execution>
    <output>
      <tag>template-output - Save content checkpoint</tag>
    </output>
  </supported-tags>

  <llm final="true">
    <mandate>This is the complete workflow execution engine</mandate>
    <mandate>You MUST Follow instructions exactly as written and maintain conversation context between steps</mandate>
  </llm>
</task>
`;
