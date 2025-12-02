# Startup Launchpad Workflow Instructions

<critical>The workflow execution engine is governed by: {project-root}/.anyon/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {project-root}/.anyon/anyon-method/workflows/startup-launchpad/workflow.yaml</critical>
<critical>Communicate in {communication_language} throughout the workflow process</critical>
<critical>⚠️ ABSOLUTELY NO TIME ESTIMATES - NEVER mention hours, days, weeks, months, or ANY time-based predictions.</critical>
<critical>Target audience: NON-TECHNICAL FOUNDERS - Use clear, accessible language during Q&A</critical>
<critical>Final documents: AI-READABLE - Technical and detailed for AI development agents</critical>

<workflow>

<step n="0" goal="Welcome and Setup">
<action>Welcome user to Startup Launchpad workflow</action>
<action>Explain what will be created:
- 📋 PRD (Product Requirements Document)
- 🎨 UX Design Specification
- 🖌️ Design Guide (with UI open-source recommendations)
- ⚙️ TRD (Technical Requirements Document with tech stack)
- 🏗️ Architecture Document
- 🗄️ ERD (Entity Relationship Diagram)
</action>

<action>Explain the process:
"저희가 대화를 나누면서 차근차근 만들어갈 거예요.
각 단계마다 질문을 드리고, 필요한 부분에서는 인터넷에서
실시간으로 오픈소스를 검색해서 여러 옵션을 보여드릴게요."
</action>

<ask>프로젝트 이름을 알려주세요:</ask>
<action>Store as {{project_name}}</action>
</step>

<step n="1" goal="Generate PRD">
<action>Load PRD template from {prd_template}</action>

<action>Explain: "먼저 제품 요구사항 문서(PRD)를 만들어볼게요.
어떤 서비스인지, 누가 사용하는지, 핵심 기능이 뭔지 정의하는 문서예요."</action>

<substep n="1a" title="Project Vision">
<action>Guide user to define:
- What problem does this solve?
- Who is the target user?
- What makes it unique?
</action>

<!-- 문제 정의 - 동적 객관식 -->
<action>프로젝트 맥락 분석:
- 프로젝트 이름: {{project_name}}에서 힌트 추출
- 프로젝트 유형 추정 (커머스, SNS, 도구, 교육, 헬스케어 등)
- 타겟 도메인 파악
</action>

<action>맥락 기반 동적 선택지 생성 (4-6개):

프로젝트 맥락을 분석해서 관련성 높은 문제 유형을 생성하세요.

생성 가이드라인:
- 프로젝트 이름/유형에 맞는 구체적인 문제
- 실제 사용자가 겪을 법한 현실적인 시나리오
- 각 선택지는 명확하고 서로 구별되어야 함
- 항상 마지막에 "기타 (직접 설명해주세요)" 포함

예시 패턴:
- 커머스: "원하는 상품을 찾기 어렵다", "가격 비교가 번거롭다" 등
- 협업 도구: "팀 커뮤니케이션이 분산되어 있다", "작업 진행상황 파악이 어렵다" 등
- 교육: "학습 자료가 체계적이지 않다", "학습 진도 관리가 어렵다" 등
</action>

<ask>어떤 문제를 해결하고 싶으세요?

[동적으로 생성된 선택지 1]
[동적으로 생성된 선택지 2]
[동적으로 생성된 선택지 3]
[동적으로 생성된 선택지 4]
[선택지 5 - 필요시]
[선택지 6 - 필요시]
기타 (직접 설명해주세요)

번호를 선택하거나 직접 설명해주세요:</ask>

<action>사용자 응답 처리 및 저장:
- 번호 선택 시: 해당 선택지 내용을 그대로 저장
- "기타" 또는 직접 입력 시: 사용자 입력 그대로 저장
- Store as {{problem_statement}}
</action>

<!-- 타겟 사용자 - 동적 객관식 -->
<action>문제 정의({{problem_statement}})를 바탕으로 타겟 사용자 선택지 생성 (4-8개):

생성 가이드라인:
- 해결하려는 문제와 직접 관련된 사용자 그룹
- 구체적인 페르소나 (직업, 역할, 상황 포함)
- 다양한 사용자 세그먼트 커버
- 항상 마지막에 "기타 (직접 설명해주세요)" 포함

예시 패턴:
- 문제가 "업무 효율"이면 → "직장인", "프리랜서", "팀 리더" 등
- 문제가 "학습"이면 → "대학생", "취준생", "직무 전환자" 등
- 문제가 "건강"이면 → "직장인", "중장년층", "운동 초보자" 등
</action>

<ask>주요 사용자는 누구인가요?

[동적으로 생성된 선택지 1]
[동적으로 생성된 선택지 2]
[동적으로 생성된 선택지 3]
[동적으로 생성된 선택지 4]
[선택지 5-8 - 필요시]
기타 (직접 설명해주세요)

번호를 선택하거나 직접 설명해주세요:</ask>

<action>사용자 응답 처리 및 저장:
- Store as {{target_users}}
</action>

<!-- 차별점 - 동적 객관식 -->
<action>프로젝트 특성과 문제 영역을 분석해서 차별화 전략 선택지 생성 (5-7개):

생성 가이드라인:
- 프로젝트 유형에 맞는 실현 가능한 차별화 방식
- 구체적이고 측정 가능한 차별점
- 기술적/비즈니스적 다양한 접근
- 항상 마지막에 "기타 (직접 설명해주세요)" 포함

예시 패턴:
- 일반적: "더 저렴함", "더 쉽고 편함", "더 빠름", "AI 활용"
- 도메인별: "커뮤니티 중심", "개인화", "오프라인 연계", "데이터 분석"
</action>

<ask>비슷한 서비스와 비교해 차별점은 뭔가요?

[동적으로 생성된 선택지 1]
[동적으로 생성된 선택지 2]
[동적으로 생성된 선택지 3]
[동적으로 생성된 선택지 4]
[선택지 5-7 - 필요시]
기타 (직접 설명해주세요)

번호를 선택하거나 직접 설명해주세요:</ask>

<action>사용자 응답 처리 및 저장:
- Store as {{unique_value}}
</action>

<template-output>project_vision</template-output>
</substep>

<substep n="1b" title="Core Features">
<action>Help identify 3-7 core features through dynamic multiple choice</action>

<action>Explain: "핵심 기능들을 정의해볼게요. 처음 출시할 때 꼭 필요한 기능만 생각해주세요."</action>

<!-- 동적 기능 카테고리 선택지 생성 -->
<action>프로젝트 맥락 기반 기능 카테고리 선택지 생성 (8-12개):

분석 기반:
- 프로젝트 유형: {{project_name}}
- 해결 문제: {{problem_statement}}
- 타겟 사용자: {{target_users}}

생성 가이드라인:
- 프로젝트 유형에 맞는 일반적인 기능 패턴
- 사용자 문제 해결에 직접 관련된 기능
- 구체적인 기능명과 간단한 설명 포함
- 다중 선택 가능하도록 체크박스 형태
- 항상 마지막에 "기타 (직접 추가)" 포함

예시 패턴:
- 커머스: "상품 검색/필터", "장바구니", "결제", "리뷰", "위시리스트"
- SNS: "게시물 작성", "팔로우/팔로잉", "댓글", "좋아요", "알림"
- 협업: "프로젝트 생성", "작업 할당", "채팅", "파일 공유", "진행상황 추적"
- 교육: "강의 시청", "퀴즈", "진도 추적", "질문답변", "자격증"
</action>

<ask>어떤 기능들이 필요한가요? 해당하는 것을 **모두** 선택해주세요 (3-7개 권장):

☐ [동적 생성 기능 1 - 설명 포함]
☐ [동적 생성 기능 2 - 설명 포함]
☐ [동적 생성 기능 3 - 설명 포함]
☐ [동적 생성 기능 4 - 설명 포함]
☐ [동적 생성 기능 5 - 설명 포함]
☐ [동적 생성 기능 6 - 설명 포함]
☐ [동적 생성 기능 7-12 - 필요시]
☐ 기타 (직접 추가해주세요)

번호를 여러 개 선택하거나, 직접 기능을 추가해주세요:</ask>

<action>선택된 기능들 처리:
- 사용자가 선택한 각 기능에 대해
- 필요시 구체화 질문 (동적 생성):
  "{{selected_feature}}에 대해 더 구체적으로 설명해주세요. 어떤 방식으로 동작하나요?"
- 간단한 대화로 세부사항 확정
</action>

<action>For each selected feature:
1. Clarify what it does (if needed)
2. Ask why it's important (if ambiguous)
3. Understand user interaction (briefly)
4. Refine description together
</action>

<action>Ensure 3-7 features total, store as {{core_features}}</action>

<template-output>core_features</template-output>
</substep>

<substep n="1c" title="Success Metrics">
<action>Define measurable success criteria through dynamic choices</action>

<!-- 동적 성공 지표 선택지 생성 -->
<action>프로젝트 특성 기반 성공 지표 선택지 생성 (5-7개):

분석 기반:
- 프로젝트 유형
- 비즈니스 모델 (수익화 방식)
- 핵심 기능들

생성 가이드라인:
- 프로젝트에 적합한 측정 가능한 지표
- 단기(3개월)/중기(1년) 목표 구분 가능
- 구체적인 숫자 예시 포함
- 항상 마지막에 "기타 (직접 설명)" 포함

예시 패턴:
- 사용자 기반: "MAU (월간 활성 사용자) 1,000명", "DAU 100명"
- 참여도: "일 평균 게시물 50개", "댓글/공유율 10%"
- 비즈니스: "월 매출 500만원", "유료 전환율 5%"
- 만족도: "NPS 50점 이상", "평점 4.5/5.0"
- 리텐션: "7일 리텐션 40%", "월간 재방문율 60%"
</action>

<ask>어떻게 되면 성공이라고 볼 수 있을까요?

**주요 성공 지표를 선택해주세요:**

[동적 생성 지표 1]
[동적 생성 지표 2]
[동적 생성 지표 3]
[동적 생성 지표 4]
[동적 생성 지표 5]
[선택지 6-7 - 필요시]
기타 (직접 설명해주세요)

번호를 선택하거나 직접 설명해주세요:</ask>

<action>사용자 응답 처리:
- 선택된 지표를 구체적인 숫자 목표로 상세화
- "선택한 {{selected_metric}}의 구체적인 목표 수치를 알려주세요"
- Store as {{success_metrics}}
</action>

<template-output>success_metrics</template-output>
</substep>

<substep n="1d" title="Generate PRD Document">
<action>Compile all information into PRD template</action>
<action>Generate AI-readable, technical PRD with:
- Clear feature specifications
- User stories for each feature
- Acceptance criteria
- Technical considerations
</action>

<action>Save to {prd_output}</action>
<action>Show summary to user</action>

<ask>PRD를 확인하셨나요? 수정할 부분이 있으면 말씀해주세요. [계속/수정]</ask>

<template-output>prd_complete</template-output>
</substep>
</step>

<step n="2" goal="Generate UX Design">
<action>Load UX Design template from {ux_design_template}</action>
<action>Load PRD from {prd_output}</action>

<action>Explain: "이제 사용자 경험 설계를 해볼게요.
화면이 어떻게 구성되고, 사용자가 어떻게 사용하는지 정의해요."</action>

<action>Reference PRD: "PRD에서 정의한 기능들:
{{core_features}}
이 기능들을 화면으로 어떻게 구성하면 좋을지 같이 만들어볼게요."</action>

<substep n="2a" title="Screen Structure">
<action>Identify main screens based on features through dynamic choices</action>

<action>Explain: "각 기능마다 필요한 화면을 생각해볼게요."</action>

<!-- 동적 화면 구조 패턴 선택지 생성 -->
<action>핵심 기능 기반 화면 구조 패턴 선택지 생성 (5-8개):

분석 기반:
- 핵심 기능: {{core_features}}
- 프로젝트 유형
- 사용자 인터랙션 특성

생성 가이드라인:
- 프로젝트에 맞는 화면 구조 패턴
- 각 패턴의 대표 화면 목록 포함
- 구체적인 예시 서비스 언급
- 항상 마지막에 "기타 (직접 설명)" 포함

예시 패턴:
- "피드/타임라인 중심 (인스타그램, 트위터) - 메인 피드, 게시물 작성, 프로필"
- "대시보드 중심 (노션, 슬랙) - 대시보드, 프로젝트별 뷰, 설정"
- "목록→상세 (쇼핑몰, 검색) - 검색/목록, 상세보기, 장바구니"
- "단계별 플로우 (예약, 결제) - Step 1, Step 2, 완료"
- "탭 네비게이션 (모바일 앱) - 홈, 검색, 작성, 알림, 프로필"
</action>

<ask>주요 화면 구조 패턴은 어떤 게 좋을까요?

[동적 생성 패턴 1 - 대표 화면 포함]
[동적 생성 패턴 2 - 대표 화면 포함]
[동적 생성 패턴 3 - 대표 화면 포함]
[동적 생성 패턴 4 - 대표 화면 포함]
[패턴 5-8 - 필요시]
기타 (직접 설명해주세요)

번호를 선택하거나 직접 설명해주세요:</ask>

<action>선택된 패턴 기반 화면 목록 구체화:

For each core feature from PRD:
- What screens are needed?
- What's the primary action?
- What information is displayed?

Generate comprehensive screen list with:
- 화면명
- 주요 기능/액션
- 표시 정보
</action>

<action>Store as {{screen_structure}}</action>
<template-output>screen_structure</template-output>
</substep>

<substep n="2b" title="User Flows">
<action>Map user journeys for key features - AI-assisted with dynamic suggestions</action>

<action>Explain: "사용자가 어떤 순서로 화면을 이동하는지 정의해볼게요."</action>

<!-- AI가 자동으로 플로우 생성 후 선택 -->
<action>화면 구조와 핵심 기능 기반 사용자 플로우 자동 생성:

분석 기반:
- 화면 구조: {{screen_structure}}
- 핵심 기능: {{core_features}}
- 일반적인 사용자 행동 패턴

생성할 플로우:
- 각 핵심 기능마다 1개 플로우 (총 3-5개)
- 화면 전환 순서와 주요 액션 포함
- 시작점과 종료점 명확히

예시:
- "신규 사용자 온보딩: 회원가입 → 프로필 설정 → 튜토리얼 → 메인"
- "핵심 기능 사용: 메인 → 검색 → 상세보기 → 액션 실행 → 결과 확인"
- "콘텐츠 생성: 메인 → 작성 화면 → 미리보기 → 발행 → 피드"
</action>

<action>AI가 생성한 2-5개 플로우를 사용자에게 제시:

"화면 구조를 바탕으로 주요 사용자 플로우를 생성했어요:

1. [생성된 플로우 1]
2. [생성된 플로우 2]
3. [생성된 플로우 3]
4. [생성된 플로우 4 - 선택적]
5. [생성된 플로우 5 - 선택적]"
</action>

<ask>생성된 플로우들이 적절한가요?

1. 모두 좋음 - 그대로 사용
2. 일부 수정 필요 - 수정할 플로우 번호 알려주세요
3. 추가 플로우 필요 - 추가할 플로우 설명해주세요

선택해주세요:</ask>

<action>사용자 응답에 따라:
- "모두 좋음": 그대로 저장
- "일부 수정": 해당 플로우만 대화로 수정
- "추가 필요": 새 플로우 추가

Final user flows (2-5개) stored as {{user_flows}}
</action>

<template-output>user_flows</template-output>
</substep>

<substep n="2c" title="Interaction Patterns">
<action>Define how users interact with features through dynamic choices</action>

<!-- 동적 인터랙션 패턴 선택지 생성 -->
<action>프로젝트 특성 기반 인터랙션 패턴 선택지 생성 (5-8개):

분석 기반:
- 플랫폼 (웹/모바일 추정)
- 핵심 기능 특성
- 타겟 사용자의 기술 친숙도

생성 가이드라인:
- 프로젝트에 적합한 인터랙션 방식
- 구체적인 사용 예시 포함
- 다중 선택 가능
- 항상 마지막에 "기타" 포함

예시 패턴:
- "버튼 클릭 중심 - 명확한 액션 버튼 (전통적, 직관적)"
- "드래그앤드롭 - 직관적인 이동/정렬 (칸반 보드, 파일 관리)"
- "스와이프 제스처 - 빠른 탐색/액션 (모바일 앱)"
- "키보드 단축키 - 파워유저용 (생산성 도구)"
- "실시간 입력/자동완성 - 검색, 채팅"
- "롱프레스/컨텍스트 메뉴 - 추가 옵션"
</action>

<ask>주요 인터랙션 방식을 정해볼게요 (여러 개 선택 가능):

☐ [동적 생성 패턴 1]
☐ [동적 생성 패턴 2]
☐ [동적 생성 패턴 3]
☐ [동적 생성 패턴 4]
☐ [패턴 5-8 - 필요시]
☐ 기타 (직접 설명해주세요)

번호를 여러 개 선택하거나 직접 설명해주세요:</ask>

<action>선택된 인터랙션 패턴들을 구체화하고 저장:
- Store as {{interaction_patterns}}
</action>

<template-output>interaction_patterns</template-output>
</substep>

<substep n="2d" title="Generate UX Design Document">
<action>Compile into UX Design template</action>
<action>Ensure alignment with PRD features</action>
<action>Generate technical UX spec for AI development</action>

<action>Save to {ux_design_output}</action>
<action>Show summary to user</action>

<ask>UX Design을 확인하셨나요? [계속/수정]</ask>

<template-output>ux_design_complete</template-output>
</substep>
</step>

<step n="3" goal="Generate Design Guide with UI Open-Source Recommendations">
<action>Load Design Guide template from {design_guide_template}</action>
<action>Load PRD from {prd_output}</action>
<action>Load UX Design from {ux_design_output}</action>

<action>Explain: "이제 디자인 가이드를 만들어볼게요.
색상, 폰트, UI 컴포넌트를 정하고, 실제 사용할 수 있는
오픈소스 UI 라이브러리를 찾아드릴게요."</action>

<action>Reference previous documents:
"지금까지 정의한 내용:
- PRD 핵심 기능: {{core_features}}
- UX 주요 화면: {{screen_structure}}

이것을 바탕으로 디자인을 정의할게요."
</action>

<substep n="3a" title="Design Style">
<action>Define visual direction through enhanced dynamic choices</action>

<!-- 디자인 스타일 - 기존 선택지 유지하되 동적 확장 -->
<action>프로젝트 특성 기반 디자인 스타일 선택지 생성 (6-8개):

분석 기반:
- 프로젝트 유형
- 타겟 사용자
- 브랜드 느낌

기본 선택지에 프로젝트 맞춤 스타일 추가:
- 미니멀하고 깔끔한
- 화려하고 역동적인
- 전문적이고 신뢰감 있는
- 친근하고 편안한
+ [프로젝트 특성 맞춤 스타일 2-4개]
- 기타 (설명해주세요)

예시 추가 스타일:
- 커머스 → "럭셔리하고 고급스러운", "귀엽고 캐주얼한"
- 금융 → "안정적이고 보수적인", "혁신적이고 모던한"
- 교육 → "활기차고 밝은", "집중력 있는 차분한"
</action>

<ask>어떤 느낌의 디자인을 원하시나요?

1. 미니멀하고 깔끔한
2. 화려하고 역동적인
3. 전문적이고 신뢰감 있는
4. 친근하고 편안한
5. [동적 생성 스타일 1]
6. [동적 생성 스타일 2]
7. [추가 스타일 - 필요시]
8. 기타 (설명해주세요)

번호를 선택하거나 직접 설명해주세요:</ask>

<action>Store as {{design_style}}</action>

<!-- 디자인 레퍼런스 - 동적 선택지 생성 -->
<action>선택된 디자인 스타일과 프로젝트 유형 기반 레퍼런스 생성 (6-10개):

분석 기반:
- 디자인 스타일: {{design_style}}
- 프로젝트 유형
- 인기 있는 유사 서비스

생성 가이드라인:
- 스타일과 유형에 맞는 대표 서비스
- 구체적인 디자인 특징 설명
- 국내외 다양한 레퍼런스
- 항상 "레퍼런스 없음" 및 "기타" 포함

예시 패턴:
- 미니멀 스타일 → "노션 - 깔끔한 레이아웃", "애플 - 여백과 타이포"
- 화려한 스타일 → "인스타그램 - 비주얼 중심", "스포티파이 - 대담한 색상"
- 전문적 → "링크드인 - 비즈니스 느낌", "구글 워크스페이스 - 신뢰감"
</action>

<ask>참고하고 싶은 서비스나 디자인이 있나요?

[동적 생성 레퍼런스 1 - 디자인 특징 설명]
[동적 생성 레퍼런스 2 - 디자인 특징 설명]
[동적 생성 레퍼런스 3 - 디자인 특징 설명]
[동적 생성 레퍼런스 4 - 디자인 특징 설명]
[레퍼런스 5-10 - 필요시]
레퍼런스 없음 - 처음부터 새로 디자인
기타 (URL이나 서비스명 알려주세요)

번호를 선택하거나 직접 알려주세요:</ask>

<action>Store as {{design_references}}</action>

<template-output>design_style</template-output>
</substep>

<substep n="3b" title="Search UI Component Libraries">
<critical>Real-time web search for UI/design open-source libraries</critical>

<action>Explain: "이제 실제 사용할 UI 컴포넌트 라이브러리를 찾아볼게요.
버튼, 입력창, 모달 등 기본 UI 요소를 제공하는 오픈소스예요."</action>

<action>Perform web searches:
- "React UI component library 2024"
- "headless UI components"
- "design system React"
- "{{design_style}} UI library"
</action>

<action>Analyze search results:
- GitHub repositories
- npm trends
- Official documentation
- Community popularity
</action>

<action>Present 4-8 options with:
━━━━━━━━━━━━━━━━━
For each library:
**[번호]. [Library Name]**
🔗 Website: [URL]
📦 GitHub: [URL]
⭐ Stars: [number]
📥 Downloads: [weekly]

💡 비개발자 설명:
[Easy explanation in Korean]

✅ 장점:
- [Benefit 1]
- [Benefit 2]

⚠️ 고려사항:
- [Consideration 1]

📝 개발자용 상세:
- Package: [npm package name]
- Version: [version]
- Integration: [how to use]
- Documentation: [docs URL]

🎯 이런 경우 추천:
- [Use case 1]
- [Use case 2]
━━━━━━━━━━━━━━━━━
</action>

<ask>어떤 UI 라이브러리가 좋을 것 같으세요?
번호로 선택하거나, 궁금한 점을 물어보세요.</ask>

<action>Store selection as {{ui_library}}</action>
<action>Store detailed info as {{ui_library_details}}</action>

<template-output>ui_library_selection</template-output>
</substep>

<substep n="3c" title="Search Specialized UI Components">
<action>Based on PRD features, search for specialized components</action>

<action>For each special feature (e.g., editor, drag-drop, charts):
Identify need from PRD</action>

<action>For each identified need:

1. Explain to user:
"[기능명]을 구현하려면 특별한 컴포넌트가 필요해요.
관련 오픈소스를 찾아볼게요."

2. Perform targeted web search:
- "[feature] React component"
- "[feature] open source library"
- "[similar app] [feature] implementation"

3. Present 4-8 detailed options:
━━━━━━━━━━━━━━━━━
[Same detailed format as 3b]
Include:
- Code examples
- Implementation complexity
- Customization capability
- Performance characteristics
━━━━━━━━━━━━━━━━━

4. User selects

5. Store selection and details
</action>

<template-output>specialized_components</template-output>
</substep>

<substep n="3d" title="Generate Design Guide Document">
<action>Compile into Design Guide template including:
- Design style and principles
- Color palette (propose based on style)
- Typography (propose based on style)
- Selected UI library with full details
- Selected specialized components with full details
- All GitHub links and documentation URLs
- Integration instructions for developers
</action>

<action>Ensure alignment with:
- PRD features
- UX interaction patterns
</action>

<action>Save to {design_guide_output}</action>
<action>Show summary to user</action>

<ask>Design Guide를 확인하셨나요? [계속/수정]</ask>

<template-output>design_guide_complete</template-output>
</substep>
</step>

<step n="4" goal="Generate TRD with Technical Open-Source Recommendations">
<action>Load TRD template from {trd_template}</action>
<action>Load PRD from {prd_output}</action>
<action>Load UX Design from {ux_design_output}</action>
<action>Load Design Guide from {design_guide_output}</action>

<action>Explain: "이제 기술 요구사항 문서(TRD)를 만들어볼게요.
어떤 기술로 구현할지, 어떤 오픈소스를 쓸지 정하는 문서예요."</action>

<action>Reference all previous documents:
━━━━━━━━━━━━━━━━━
지금까지 정의한 내용:

📋 PRD 핵심 기능:
{{core_features}}

🎨 UX 주요 화면:
{{screen_structure}}

🖌️ Design Guide:
- UI Library: {{ui_library}}
- Special Components: {{specialized_components}}
━━━━━━━━━━━━━━━━━

"이제 이것들을 구현할 기술 스택을 정할게요."
</action>

<substep n="4a" title="Basic Framework Selection">
<action>Recommend and quickly decide on basic framework</action>

<action>Explain: "기본 프레임워크는 Next.js + React를 추천해요.
가장 인기 있고 자료도 많아요. 이걸로 진행할까요?"</action>

<ask>Next.js + React로 진행할까요? [예/다른 거 추천해주세요]</ask>

<action if="user wants alternatives">
Present 2-3 alternatives briefly:
- Next.js (recommended)
- Remix
- Vite + React
</action>

<action>Store selection as {{frontend_framework}}</action>
<template-output>frontend_framework</template-output>
</substep>

<substep n="4b" title="Feature-by-Feature Technical Stack">
<critical>For EACH core feature from PRD, search for implementation open-source</critical>

<action>For each feature in {{core_features}}:

1. Analyze feature requirements

2. Explain to user:
"[기능명]을 구현하는 방법을 찾아볼게요."

3. Perform web searches:
- "[feature description] implementation"
- "[feature] React library"
- "[similar feature] open source"
- "[feature] best practices 2024"

4. Present 4-8 detailed options:
━━━━━━━━━━━━━━━━━
**[번호]. [Library/Service Name]**
🔗 Website: [URL]
📦 GitHub: [URL]
⭐ Stars: [number]
📥 Downloads: [weekly]
🔄 Activity: [recent commits, issues]

💡 비개발자 설명:
[Clear explanation with analogy if helpful]

🎯 어떤 역할:
[What it does in context of feature]

✅ 장점:
- [Pro 1]
- [Pro 2]

⚠️ 고려사항:
- [Con 1]

📊 구현 난이도: ⭐⭐⭐☆☆ (5점 만점)
🎨 커스터마이징: ⭐⭐⭐⭐☆ (5점 만점)

📝 개발자용 상세:
```
Package: [package-name]
Version: [version]
Installation: [install command]
Basic Usage:
[code example]
```

Integration with current stack:
- Works with: {{frontend_framework}}
- Compatible with: {{ui_library}}
- Dependencies: [list]

Documentation: [URL]
Examples: [URL]
━━━━━━━━━━━━━━━━━

5. User selects

6. Store selection as {{feature_[n]_tech}}
</action>

<template-output>feature_implementations</template-output>
</substep>

<substep n="4c" title="Database and Backend">
<action>Determine data storage needs from PRD features</action>

<action>Explain: "어떤 데이터를 저장해야 하는지 보고 데이터베이스를 선택할게요."</action>

<action>Search and present database options (3-5):
- PostgreSQL
- MongoDB
- Supabase
- Firebase
- PlanetScale
</action>

<action>Present with same detailed format</action>

<ask>어떤 데이터베이스가 좋을까요?</ask>
<action>Store as {{database}}</action>

<action>Search and present backend framework options (3-4):
- Next.js API Routes (if Next.js chosen)
- Express.js
- Fastify
- tRPC
</action>

<ask>백엔드는 어떻게 할까요?</ask>
<action>Store as {{backend_framework}}</action>

<template-output>backend_stack</template-output>
</substep>

<substep n="4d" title="Infrastructure and Services">
<action>Determine needs for:
- Authentication
- File storage
- Email/notifications
- Payment (if applicable)
- Analytics
- Deployment
</action>

<action>For each needed service:
1. Search for options (3-5 each)
2. Present detailed comparison
3. User selects
4. Store selection
</action>

<template-output>infrastructure_services</template-output>
</substep>

<substep n="4e" title="Generate TRD Document">
<action>Compile comprehensive TRD including:

## Technology Stack Overview
- Frontend: {{frontend_framework}}
- UI Library: {{ui_library}} (from Design Guide)
- Backend: {{backend_framework}}
- Database: {{database}}

## Feature Implementations
For each PRD feature:
- Feature name
- Selected technology/library
- Full details (GitHub, docs, version)
- Integration approach
- Code structure recommendations

## Infrastructure
- Authentication: {{auth_service}}
- File Storage: {{storage_service}}
- Deployment: {{deployment_platform}}
- etc.

## All Open-Source Links
Consolidated list of:
- Every library/service chosen
- GitHub URLs
- Documentation URLs
- Version numbers
- Installation commands

## Technical Architecture Notes
- How components integrate
- Data flow
- API structure
- State management
</action>

<action>Ensure perfect alignment:
- Every PRD feature has technical solution
- Chosen tech matches Design Guide selections
- No contradictions between documents
</action>

<action>Save to {trd_output}</action>
<action>Show summary to user</action>

<ask>TRD를 확인하셨나요? [계속/수정]</ask>

<template-output>trd_complete</template-output>
</substep>
</step>

<step n="5" goal="Generate Architecture Document">
<action>Load Architecture template from {architecture_template}</action>
<action>Load ALL previous documents:
- PRD: {prd_output}
- UX Design: {ux_design_output}
- Design Guide: {design_guide_output}
- TRD: {trd_output}
</action>

<action>Explain: "마지막으로 전체 시스템 아키텍처를 설계할게요.
모든 부분이 어떻게 연결되는지 정의하는 문서예요."</action>

<action>Present comprehensive summary:
━━━━━━━━━━━━━━━━━
전체 프로젝트 요약:

📋 PRD:
- 핵심 기능: {{core_features}}
- 타겟 사용자: {{target_users}}

🎨 UX Design:
- 주요 화면: {{screen_structure}}
- 사용자 플로우: {{user_flows}}

🖌️ Design Guide:
- UI Library: {{ui_library}}
- 특수 컴포넌트: {{specialized_components}}

⚙️ TRD:
- Frontend: {{frontend_framework}}
- Backend: {{backend_framework}}
- Database: {{database}}
- 기능별 기술: {{feature_implementations}}
━━━━━━━━━━━━━━━━━

"이제 이 모든 것을 하나의 시스템으로 통합할게요."
</action>

<substep n="5a" title="System Structure">
<action>Define high-level architecture</action>

<ask>시스템 구조를 정해볼게요:
- 모놀리식 (한 서버에 모든 기능)
- 마이크로서비스 (기능별 서버 분리)
- 서버리스 (서버 관리 없이)

추천: 처음에는 모놀리식이 간단해요. 어떤 게 좋을까요?</ask>

<action>Store as {{system_structure}}</action>
<template-output>system_structure</template-output>
</substep>

<substep n="5b" title="Search Architecture Patterns and References">
<critical>Real-time web search for relevant architecture patterns and references</critical>

<action>Analyze project characteristics:
- Features from PRD
- Scale expectations
- Technical stack from TRD
</action>

<action>Perform web searches:
- "[project type] architecture pattern"
- "[similar service] architecture"
- "[key feature] system design"
- "best practices [tech stack] architecture"

Examples:
- "real-time collaborative editor architecture"
- "e-commerce platform architecture pattern"
- "social media feed system design"
</action>

<action>Search for relevant open-source projects:
- "[similar project] architecture GitHub"
- "[project type] reference implementation"
</action>

<action>Present findings (4-6 references):
━━━━━━━━━━━━━━━━━
**[번호]. [Reference Name]**
🔗 URL: [link]
📝 Type: [blog post/documentation/open-source]

💡 핵심 내용:
[Key architectural concepts explained]

🎯 참고할 만한 부분:
- [Relevant pattern 1]
- [Relevant pattern 2]

📊 당신 프로젝트와 유사도: ⭐⭐⭐⭐☆

📝 개발자용 상세:
- Architecture pattern: [pattern name]
- Key components: [list]
- Technology choices: [relevant to your stack]
- Scalability approach: [method]

적용 방안:
[How to adapt this to your project]
━━━━━━━━━━━━━━━━━
</action>

<ask>어떤 아키텍처 패턴을 참고하면 좋을까요?
궁금한 점이 있으면 물어보세요.</ask>

<action>Store selected references as {{architecture_references}}</action>

<template-output>architecture_references</template-output>
</substep>

<substep n="5c" title="Component Design">
<action>Design major system components based on TRD and references</action>

<action>Define:
- Frontend components and structure
- Backend services and APIs
- Database schema overview
- External service integrations
- Data flow between components
</action>

<action>Ensure alignment with:
- Every PRD feature
- TRD technical choices
- Selected architecture patterns
</action>

<action>Store as {{component_design}}</action>
<template-output>component_design</template-output>
</substep>

<substep n="5d" title="Scalability and Deployment">
<action>Define scaling strategy</action>

<ask>예상 사용자 규모:
- 처음: 약 몇 명?
- 1년 후: 목표 몇 명?</ask>

<action>Based on scale, recommend:
- Caching strategy
- Load balancing approach
- Database scaling
- CDN usage
</action>

<action>Store as {{scalability_plan}}</action>

<action>Recommend deployment platform based on TRD</action>
<action>Store as {{deployment_strategy}}</action>

<template-output>scalability_deployment</template-output>
</substep>

<substep n="5e" title="Generate Architecture Document">
<action>Compile comprehensive Architecture document:

## System Overview
- Architecture pattern: {{system_structure}}
- Reference architectures: {{architecture_references}}

## Component Architecture
- Detailed component diagram
- Component descriptions
- Interaction patterns
- {{component_design}}

## Technology Stack (from TRD)
- Frontend: {{frontend_framework}} + {{ui_library}}
- Backend: {{backend_framework}}
- Database: {{database}}
- Infrastructure: {{infrastructure_services}}

## Data Flow
- Request/response patterns
- State management
- Caching strategy
- Real-time communication (if applicable)

## API Design
- RESTful endpoints
- GraphQL schema (if applicable)
- Authentication flow
- Error handling

## Scalability
- {{scalability_plan}}
- Performance considerations
- Monitoring and logging

## Deployment
- {{deployment_strategy}}
- CI/CD pipeline
- Environment configuration

## Security
- Authentication/Authorization
- Data encryption
- API security
- CORS and CSP
</action>

<action>Cross-check alignment:
- All PRD features covered
- All TRD technologies integrated
- Design Guide components considered
- UX flows supported by architecture
</action>

<action>Save to {architecture_output}</action>
<action>Show summary to user</action>

<ask>Architecture 문서를 확인하셨나요? [계속/수정]</ask>

<template-output>architecture_complete</template-output>
</substep>
</step>

<step n="6" goal="Generate ERD (Automatic)">
<action>Load ERD template from {erd_template}</action>
<action>Load ALL previous documents</action>

<action>Explain: "이제 데이터베이스 구조(ERD)를 자동으로 생성할게요.
모든 문서를 분석해서 어떤 데이터를 저장해야 하는지 파악할게요."</action>

<action>Analyze all documents:
1. From PRD: Extract entities from features and user stories
2. From UX Design: Identify data needed for screens
3. From Design Guide: Note any data-dependent UI components
4. From TRD: Use selected database type
5. From Architecture: Consider data flow and relationships
</action>

<action>Generate ERD including:

## Entities
For each identified entity:
- Entity name
- Attributes (fields)
- Data types
- Constraints
- Indexes

## Relationships
- One-to-many
- Many-to-many
- Foreign keys
- Junction tables

## ERD Diagram
[Generate visual representation or structured description]

## Database Schema (SQL)
[Generate actual DDL statements for selected database]

## Migrations
[Provide migration script structure]

## Indexes and Optimization
[Recommend indexes based on expected queries]

## Sample Queries
[Provide example queries for main features]
</action>

<action>Ensure alignment:
- Supports all PRD features
- Matches TRD database choice
- Optimized for Architecture data flow
</action>

<action>Save to {erd_output}</action>
<action>Show summary to user</action>

<template-output>erd_complete</template-output>
</step>

<step n="7" goal="Final Validation and Completion">
<action>Perform final consistency check across all documents:

Check that:
- Every PRD feature has UX design
- Every UX element has design guide reference
- Every feature has technical implementation in TRD
- Every technical choice appears in Architecture
- Every data need is in ERD

If inconsistencies found:
- List them
- Ask user if corrections needed
- Update documents if requested
</action>

<action>Confirm all 6 documents are saved to {output_folder}:
- {prd_output}
- {ux_design_output}
- {design_guide_output}
- {trd_output}
- {architecture_output}
- {erd_output}
</action>

<action>Generate project summary:
━━━━━━━━━━━━━━━━━
🎉 Startup Launchpad 완료!

📦 생성된 문서 (6개):
1. PRD - 제품 요구사항
2. UX Design - 사용자 경험 설계
3. Design Guide - 디자인 가이드 + UI 오픈소스
4. TRD - 기술 요구사항 + 기술 스택
5. Architecture - 시스템 아키텍처
6. ERD - 데이터베이스 구조

📁 위치: {output_folder}/
   - prd.md
   - ux-design.md
   - design-guide.md
   - trd.md
   - architecture.md
   - erd.md

🔗 사용된 오픈소스:
[List all selected open-source with links]

✨ 다음 단계:
1. 개발자 또는 AI 에이전트에게 문서들을 공유하세요
2. 각 문서는 AI가 읽고 개발할 수 있도록 상세하게 작성되었습니다
3. 궁금한 점이 있으면 각 문서의 오픈소스 링크를 참고하세요
━━━━━━━━━━━━━━━━━
</action>

<template-output>project_complete</template-output>
</step>

</workflow>
