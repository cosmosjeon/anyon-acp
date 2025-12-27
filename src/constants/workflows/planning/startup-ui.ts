/**
 * Startup UI Design Guide Workflow - 합본 프롬프트
 * workflow.yaml + instructions.md + template.md + checklist.md 통합
 */

import { WORKFLOW_ENGINE } from '../engine';

const WORKFLOW_CONFIG = `
# Startup Design Guide Workflow Configuration
name: startup-design-guide
description: "디자인 가이드 정의 - 색상, 폰트, 스타일만. 기술 스택(React, MUI 등)은 TRD에서 처리."
author: "Anyon"

# Output configuration
output_folder: "{project-root}/anyon-docs/planning"
default_output_file: "{output_folder}/design-guide.md"

# Inputs
input_prd: "{output_folder}/prd.md"
input_ux: "{output_folder}/ui-ux.html"

# Communication settings
communication_language: "Korean"
document_output_language: "Korean"

standalone: true
`;

const INSTRUCTIONS = `
# Design Guide Workflow Instructions

<critical>Communicate in Korean</critical>
<critical>Target audience: NON-TECHNICAL FOUNDERS - 쉬운 말로, 전문 용어 피하기</critical>
<critical>이 워크플로우는 디자인만 다룸. React, MUI 등 기술 스택은 TRD에서 처리.</critical>
<critical>
이 프롬프트 자체가 Design Guide 워크플로우입니다.
절대로 Skill 도구를 사용하지 마세요.
지금 바로 Step 0부터 실행하세요.
</critical>

## 핵심 원칙

1. **색상/폰트는 AI가 자동 결정** - 사용자에게 하나하나 묻지 않음
2. **참고 서비스 분석** - 사용자가 참고 서비스를 알려주면 dembrandt로 분석
3. **최종 결과만 확인** - 스타일 선택 후 AI가 결정한 결과 보여주고 조정

## 참고 서비스 분석 방법

### dembrandt CLI 사용 (URL이 주어진 경우)
\`\`\`bash
npx dembrandt <url> --json-only
\`\`\`
- 색상 팔레트, 타이포그래피, 간격 등 추출
- JSON 결과에서 주요 색상/폰트 파싱

### 잘 알려진 서비스 (내부 지식 fallback)
| 서비스 | Primary | Secondary | 스타일 |
|--------|---------|-----------|--------|
| 토스 | #3182F6 | #4E5968 | 전문적, 미니멀 |
| 당근마켓 | #FF6F0F | #FFA64D | 친근함, 따뜻함 |
| 배민 | #2AC1BC | #35C5F0 | 친근함, 재치 |
| 노션 | #000000 | #37352F | 미니멀 |
| 카카오 | #FEE500 | #3C1E1E | 친근함 |
| 네이버 | #03C75A | #00C73C | 전문적 |
| 리니어 | #5E6AD2 | #8B5CF6 | 트렌디 |
| 피그마 | #F24E1E | #A259FF | 트렌디 |

<workflow>

<step n="0" goal="문서 로드">
<action>PRD 문서 로드 from {input_prd}</action>
<action>UX Design HTML 로드 from {input_ux}</action>
<action>추출: project_name, service_type, platform, target_users</action>
</step>

<step n="1" goal="스타일 + 참고 서비스 질문">
<ask>
"{{project_name}}의 디자인 가이드를 만들어볼게요!

어떤 느낌이 좋을까요?

1. **미니멀** - 깔끔, 여백, 심플 (예: 애플, 노션)
2. **화려함** - 대담한 색상, 에너지 (예: 인스타, 스포티파이)
3. **전문적** - 비즈니스, 신뢰감 (예: 토스, 링크드인)
4. **친근함** - 따뜻함, 부드러움 (예: 당근마켓, 슬랙)
5. **트렌디** - 그라데이션, 유리효과 (예: 피그마, 리니어)

그리고 **참고하고 싶은 서비스**가 있으면 같이 알려주세요!
(예: '3번, 토스 참고했으면 좋겠어요' 또는 그냥 '4번이요')
"
</ask>

<action>Parse response:
- Extract design_style (1-5)
- Extract reference_service (서비스명 또는 URL, 없으면 null)
</action>

<action>{{design_style}} 및 {{design_references}}에 저장</action>
</step>

<step n="2" goal="참고 서비스 분석 + AI 자동 결정">

<action>If reference_service is URL:
1. Run: npx dembrandt {{reference_url}} --json-only
2. Parse JSON result for:
   - colors.palette (상위 3개 색상)
   - typography.styles (주요 폰트)
3. Store extracted values
</action>

<action>If reference_service is known service name:
1. Use internal knowledge table above
2. Get Primary, Secondary colors
3. Determine appropriate font (Pretendard for Korean services)
</action>

<action>If no reference_service:
1. Based on {{design_style}}, determine colors:
   - 미니멀 → Primary: #000000, Secondary: #6B7280
   - 화려함 → Primary: #7C3AED, Secondary: #EC4899
   - 전문적 → Primary: #3B82F6, Secondary: #1E40AF
   - 친근함 → Primary: #F97316, Secondary: #FBBF24
   - 트렌디 → Primary: #8B5CF6, Secondary: #06B6D4
2. Font: Pretendard (한글), Inter (영문)
</action>

<action>Auto-generate:
- Accent Color: 보색 또는 강조색
- Semantic Colors: Success #10B981, Error #EF4444, Warning #F59E0B, Info #3B82F6
- Heading Font / Body Font
</action>

<action>Show result to user:
"
{{#if design_references}}
참고하신 '{{design_references}}' 디자인을 분석했어요.
{{else}}
{{design_style}} 스타일에 맞게 디자인을 결정했어요.
{{/if}}

**AI가 결정한 디자인:**

| 항목 | 값 | 이유 |
|-----|-----|-----|
| Primary | {{primary_color}} | {{primary_reason}} |
| Secondary | {{secondary_color}} | {{secondary_reason}} |
| Accent | {{accent_color}} | 강조/액션용 |
| Heading Font | {{heading_font}} | {{font_reason}} |
| Body Font | {{body_font}} | 가독성 |

조정하고 싶은 부분 있으세요?
(없으면 '좋아요'라고 해주세요)
"
</action>

<action>Handle user feedback:
- If user wants adjustment: modify the requested value and show again
- If user says "좋아요" or similar: proceed to next step
</action>
</step>

<step n="3" goal="다크모드 질문">
<ask>
"다크모드 지원할까요?

1. 네 (다크모드 색상도 자동 생성)
2. 아니오 (라이트 모드만)
3. 나중에 결정
"
</ask>

<action>If yes:
- Generate dark mode colors automatically:
  - Background: #0F0F0F
  - Surface: #1A1A1A
  - Text: #F3F4F6
  - Primary: {{primary_color}} (밝기 조정)
</action>

<action>{{dark_mode}}에 저장</action>
</step>

<step n="4" goal="문서 생성 + 완료">
<action>수집한 모든 값으로 design-guide.md 생성</action>
<action>{default_output_file}에 저장</action>

<action>요약 출력:
"
디자인 가이드가 완성됐어요!

**저장 위치**: {default_output_file}

**요약:**
- 스타일: {{design_style}} {{#if design_references}}({{design_references}} 참고){{/if}}
- Primary: {{primary_color}}
- Secondary: {{secondary_color}}
- Accent: {{accent_color}}
- 폰트: {{heading_font}} / {{body_font}}
- 다크모드: {{dark_mode}}

**다음**: TRD (기술 스택) 워크플로우
"
</action>
</step>

</workflow>
`;

const TEMPLATE = `
# {{project_name}} - Design Guide

## 디자인 스타일

**스타일**: {{design_style}}

**참고 서비스**: {{design_references}}

---

## 색상 시스템

### Primary Color
{{primary_color}}
- 용도: 버튼, 링크, 주요 강조

### Secondary Color
{{secondary_color}}
- 용도: 보조 버튼, 배지

### Accent Color
{{accent_color}}
- 용도: 특별 강조, CTA

### Semantic Colors
| 용도 | 색상 |
|-----|------|
| Success | #10B981 |
| Error | #EF4444 |
| Warning | #F59E0B |
| Info | #3B82F6 |

---

## 타이포그래피

| 용도 | 폰트 |
|-----|------|
| Heading | {{heading_font}} |
| Body | {{body_font}} |

---

## 다크모드

{{dark_mode_specs}}
`;

const CHECKLIST = `
# UI Design Guide Validation Checklist

## 문서 구조

- [ ] YAML frontmatter가 완전함
- [ ] service_type, platform 정보가 포함됨
- [ ] 선택된 라이브러리 목록이 메타데이터에 있음
- [ ] 색상 팔레트와 폰트 정보가 메타데이터에 있음
- [ ] 모든 섹션이 존재하고 placeholder가 없음

## 이전 문서 일관성

- [ ] PRD의 service_type, platform과 일치함
- [ ] UX Design의 모든 컴포넌트가 UI 스펙에 반영됨
- [ ] UX Design의 인터랙션 패턴이 UI에 정의됨
- [ ] PRD의 타겟 사용자에 맞는 디자인 스타일임

## 디자인 방향성

- [ ] 디자인 스타일이 명확히 정의됨
- [ ] 3-5개의 디자인 원칙이 있음
- [ ] 레퍼런스 서비스가 명시됨 (있다면)
- [ ] 스타일이 타겟 사용자와 서비스 유형에 적합함

## 색상 시스템

### Primary/Secondary/Accent Colors
- [ ] Primary color가 hex code로 명시됨
- [ ] Secondary color가 정의됨
- [ ] Accent color가 정의됨
- [ ] 색상들이 서로 조화로움
- [ ] 디자인 스타일에 부합함

### Semantic Colors
- [ ] Success color (초록 계열)
- [ ] Error color (빨강 계열)
- [ ] Warning color (주황/노랑 계열)
- [ ] Info color (파랑 계열)

### Neutral Colors
- [ ] White, Black 정의됨
- [ ] Gray scale (최소 5단계) 정의됨
- [ ] 모든 neutral color가 hex code로 명시됨

### Color Usage Guidelines
- [ ] 각 색상을 언제 사용하는지 명시됨
- [ ] 버튼, 링크, 배경 등의 색상 적용 규칙이 있음

## 타이포그래피

### 폰트 선택
- [ ] Heading font가 명시됨
- [ ] Body font가 명시됨
- [ ] 폰트 라이선스가 확인됨 (무료/상업적 사용 가능)
- [ ] 한글 지원 여부가 확인됨 (한글 서비스의 경우)

### Type Scale
- [ ] 최소 6개 크기가 정의됨 (Display, H1-H4, Body, Caption)
- [ ] 각 크기가 px 또는 rem으로 명시됨
- [ ] Line height가 정의됨
- [ ] Font weight가 정의됨 (Regular, Medium, Bold 등)

## 다크 모드 (해당시)

- [ ] 다크 모드 지원 여부 결정됨
- [ ] 다크 모드 색상 팔레트 정의됨 (지원 시)
- [ ] 배경, 텍스트, 카드 색상 정의됨
- [ ] 전환 방법 정의됨 (토글, 시스템 설정 등)

## 접근성

- [ ] 색상 대비율 기준 명시 (WCAG AA 이상)
- [ ] 키보드 네비게이션 가이드라인
- [ ] 터치 영역 최소 크기 명시 (44px 이상)

## 다음 단계 준비

- [ ] TRD에 필요한 모든 UI 라이브러리 정보 포함됨
- [ ] 기술 스택 선정에 필요한 플랫폼 정보 명확함
- [ ] 문서가 {default_output_file}에 저장됨

---

## 최종 품질 검증

### 비개발자 이해도 테스트
- [ ] 비개발자가 디자인 방향성을 이해할 수 있는가?
- [ ] 색상과 폰트 선택의 이유가 설명되었는가?

### 개발자 구현 가능성 테스트
- [ ] 개발자가 이 문서만으로 디자인 시스템 구현이 가능한가?
- [ ] 모든 색상 hex code가 명시되었는가?

---

## 검증 완료 후

모든 체크박스가 완료되면:
1. UI Design Guide가 완성됨
2. TRD 워크플로우로 넘어갈 준비 완료
`;

/**
 * 완성된 UI Design Guide 워크플로우 프롬프트
 */
export const STARTUP_UI_PROMPT = `
# Workflow Execution

## 1. Workflow Engine (MUST FOLLOW)
${WORKFLOW_ENGINE}

## 2. Workflow Configuration
${WORKFLOW_CONFIG}

## 3. Instructions (Execute step by step)
${INSTRUCTIONS}

## 4. Output Template
${TEMPLATE}

## 5. Validation Checklist
${CHECKLIST}

---

**중요**:
- {project-root}는 현재 작업 디렉토리입니다.
- 출력 파일은 {project-root}/anyon-docs/planning/design-guide.md에 저장하세요.
- 먼저 PRD와 UX Design 문서를 읽어서 프로젝트 정보를 파악하세요.

<session_awareness>
이 워크플로우가 처음 시작되면 Step 0부터 진행하세요.
이미 대화가 진행 중이라면 (이전 assistant 응답이 있다면) 현재 진행 중인 Step을 이어서 계속하세요.
절대로 처음부터 다시 시작하지 마세요.
</session_awareness>
`;

/**
 * UI Design Guide 워크플로우 메타데이터
 */
export const STARTUP_UI_METADATA = {
  id: 'startup-ui',
  title: 'Design Guide',
  description: '디자인 가이드 정의 (색상, 폰트, 스타일)',
  outputPath: 'anyon-docs/planning/design-guide.md',
  filename: 'design-guide.md',
};
