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

<critical>You MUST have already loaded: {project-root}/.anyon/anyon-method/workflows/startup-ui/workflow.yaml</critical>
<critical>Communicate in Korean</critical>
<critical>이 워크플로우는 디자인만 다룸. React, MUI 등 기술 스택은 TRD에서 처리.</critical>

<workflow>

<step n="0" goal="Load Documents">
<action>Load PRD from {input_prd}</action>
<action>Load UX Design HTML from {input_ux}</action>
<action>Extract: project_name, service_type, platform, target_users</action>

<action>Read and analyze UX HTML mockup:
- Identify current visual style (layout, spacing, colors used)
- Note screen structure and components
- This will inform design recommendations
</action>

<action>Welcome:
"안녕하세요! {{project_name}}의 디자인 가이드를 만들어볼게요.

UX 목업을 확인했어요. 이제 디자인을 결정해봐요!

**정할 것:**
- 디자인 스타일 (느낌)
- 색상 (Primary, Secondary 등)
- 폰트"
</action>
</step>

<step n="1" goal="Design Style">
<ask>{{project_name}}은 어떤 느낌이 좋을까요?

1. **미니멀** - 깔끔, 여백, 심플 (예: 애플, 노션)
2. **화려함** - 대담한 색상, 에너지 (예: 인스타그램, 스포티파이)
3. **전문적** - 비즈니스, 신뢰감 (예: 링크드인, 세일즈포스)
4. **친근함** - 따뜻함, 부드러움 (예: 당근마켓, 슬랙)
5. **트렌디** - 그라데이션, 유리효과 (예: 피그마, 디스코드)
6. 기타 (직접 설명)

번호로 선택:</ask>

<action>Store as {{design_style}}</action>

<ask>참고하고 싶은 디자인이 있나요? (서비스명 또는 URL)
없으면 "없음":</ask>

<action>Store as {{design_references}}</action>
</step>

<step n="2" goal="Color Palette">
<action>Explain:
"색상을 정해볼게요.

**Primary Color**: 가장 많이 쓰이는 메인 색상 (버튼, 링크)
**Secondary Color**: 보조 색상
**Accent Color**: 특별 강조용"
</action>

<action>Based on {{design_style}}, suggest colors:
- 미니멀 → 차분한 블루, 그레이 계열
- 화려함 → 선명한 컬러, 그라데이션
- 전문적 → 네이비, 블루 계열
- 친근함 → 파스텔, 따뜻한 색상
- 트렌디 → 퍼플, 그라데이션
</action>

<ask>Primary Color 추천:
[디자인 스타일에 맞는 3-4개 색상 + hex code]

번호로 선택하거나 직접 hex code 입력:</ask>

<action>Store as {{primary_color}}</action>

<ask>Secondary Color는요?
[Primary와 어울리는 3-4개 추천]</ask>

<action>Store as {{secondary_color}}</action>

<ask>Accent Color는요?
[눈에 띄는 강조색 2-3개 추천]</ask>

<action>Store as {{accent_color}}</action>

<action>Auto-generate semantic colors:
- Success: #10B981
- Error: #EF4444
- Warning: #F59E0B
- Info: #3B82F6
</action>
</step>

<step n="3" goal="Typography">
<action>Explain:
"폰트를 정해볼게요.

**Heading Font**: 제목용
**Body Font**: 본문용

한글 서비스면 한글 폰트가 중요해요."
</action>

<ask>폰트 추천:

**한글:**
1. Pretendard - 깔끔, 모던 (무료)
2. Spoqa Han Sans - 가독성 좋음 (무료)
3. Noto Sans KR - 구글 (무료)

**영문:**
1. Inter - 모던
2. Poppins - 부드러움

번호로 선택하거나 직접 입력:</ask>

<action>Store as {{heading_font}} and {{body_font}}</action>
</step>

<step n="4" goal="Dark Mode">
<ask>다크모드를 지원할 건가요?

1. 네 - 다크모드 색상도 정의
2. 아니오 - 라이트 모드만
3. 나중에 - 일단 스킵

번호로 선택:</ask>

<action>If yes, generate dark mode colors:
- Background: #1A1A1A
- Text: #F3F4F6
- Primary: {{primary_color}} (약간 밝게)
</action>

<action>Store as {{dark_mode}}</action>
</step>

<step n="5" goal="Generate Design Guide">
<action>Load template from {template}</action>
<action>Fill template with collected variables</action>
<action>Save to {default_output_file}</action>

<action>Show summary:
"
디자인 가이드 완료!

**저장 위치**: {default_output_file}

**요약:**
- 스타일: {{design_style}}
- Primary: {{primary_color}}
- Secondary: {{secondary_color}}
- 폰트: {{heading_font}} / {{body_font}}
- 다크모드: {{dark_mode}}

**다음**: TRD (기술 스택) 워크플로우
"
</action>
</step>

</workflow>
`;

const TEMPLATE = `
---
document_type: Design Guide
project_name: {{project_name}}
created_date: {{date}}
design_style: {{design_style}}
colors:
  primary: {{primary_color}}
  secondary: {{secondary_color}}
  accent: {{accent_color}}
fonts:
  heading: {{heading_font}}
  body: {{body_font}}
dark_mode: {{dark_mode}}
---

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

지금 바로 Step 0부터 시작하세요.
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
