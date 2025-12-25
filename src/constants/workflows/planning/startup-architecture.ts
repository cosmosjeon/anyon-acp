/**
 * Startup Architecture Workflow - 합본 프롬프트
 * workflow.yaml + instructions.md + template.md + checklist.md 통합
 */

import { WORKFLOW_ENGINE } from '../engine';

const WORKFLOW_CONFIG = `
# Startup Architecture Workflow Configuration
name: startup-architecture
description: "시스템 아키텍처. 구조, 데이터 흐름, 확장성, 보안. 기술스택/API는 제외."
author: "Anyon"

# Output configuration
output_folder: "{project-root}/anyon-docs/planning"
default_output_file: "{output_folder}/architecture.md"

# Inputs
input_prd: "{output_folder}/prd.md"
input_ux: "{output_folder}/ui-ux.html"
input_trd: "{output_folder}/trd.md"

# Communication settings
communication_language: "Korean"
document_output_language: "Korean"

standalone: true
`;

const INSTRUCTIONS = `
# Architecture Workflow Instructions

<critical>You MUST have already loaded: {project-root}/.anyon/anyon-method/workflows/startup-architecture/workflow.yaml</critical>
<critical>Communicate in Korean</critical>
<critical>기술 스택은 TRD에서 이미 정함. 여기서는 시스템 구조만.</critical>
<critical>API 상세 설계는 개발 단계에서 함. 여기서는 개요만.</critical>

<workflow>

<step n="0" goal="Load Documents">
<action>Load PRD from {input_prd}</action>
<action>Load UX Design from {input_ux}</action>
<action>Load TRD from {input_trd}</action>
<action>Extract: project_name, service_type, platform, core_features, tech_stack</action>
<action>Extract opensource info: opensource.decision, opensource.base_project, opensource.base_repo, opensource.base_template, opensource.feature_map</action>

<action>Check opensource.decision:
If "완성형 활용":
  → Set {{has_base_opensource}} = true, {{opensource_mode}} = "complete"
If "조합해서 개발":
  → Set {{has_base_opensource}} = true, {{opensource_mode}} = "combine"
If "템플릿으로 시작":
  → Set {{has_base_opensource}} = true, {{opensource_mode}} = "template"
Else:
  → Set {{has_base_opensource}} = false
</action>

<action>Welcome:

**If {{opensource_mode}} == "complete":**
"안녕하세요! {{project_name}}의 시스템 아키텍처를 설계할게요.

**기반 오픈소스:** {{opensource.base_project}}

기반 오픈소스의 기존 아키텍처를 분석하고,
{{project_name}}에 맞게 확장/수정할 부분을 정리할 거예요."

**If {{opensource_mode}} == "combine":**
"안녕하세요! {{project_name}}의 시스템 아키텍처를 설계할게요.

**기능별 라이브러리 조합:**
{{opensource.feature_map}}

여러 라이브러리를 통합하는 아키텍처를 설계할게요.
각 라이브러리가 어떻게 연결되는지 정리할 거예요."

**If {{opensource_mode}} == "template":**
"안녕하세요! {{project_name}}의 시스템 아키텍처를 설계할게요.

**기반 템플릿:** {{opensource.base_template}}
**기능별 라이브러리:**
{{opensource.feature_map}}

템플릿의 기본 구조에 기능별 라이브러리를 통합할게요."

**Else:**
"안녕하세요! {{project_name}}의 시스템 아키텍처를 설계할게요.

**여기서 다루는 것:**
- 아키텍처 패턴 (시스템 구조 방식)
- 시스템 컴포넌트 (구성 요소)
- 데이터 흐름 (정보 이동 경로)
- 배포 구조 (어떻게 서비스에 올릴지)
- 확장성 (사용자 증가 대응)
- 보안 (데이터 보호)
- 모니터링 (서비스 상태 감시)

**여기서 안 다루는 것:**
- 기술 스택 선정 → TRD에서 이미 결정
- API 상세 설계 → 개발 단계에서
- DB 스키마 상세 → ERD에서"
</action>
</step>

<step n="1" goal="Analyze Base Open Source Architecture" if="{{has_base_opensource}} == true">

**Case 1: {{opensource_mode}} == "complete"**
<action>Fetch and analyze base open source project architecture:

WebFetch: {{opensource.base_repo}} - README, docs/architecture, docker-compose
WebSearch: "{{opensource.base_project}} architecture", "{{opensource.base_project}} deployment"
</action>

<action>Present base project architecture:
"{{opensource.base_project}}의 기존 아키텍처를 분석했어요!

**아키텍처 패턴:** [분석 결과]

**시스템 구성:**
\`\`\`
[기존 아키텍처 다이어그램]
\`\`\`

**데이터 흐름:** [분석 결과]

**배포 방식:** [Docker/K8s/Serverless 등]
"
</action>

<ask>기존 아키텍처를 어떻게 할까요?

1. **그대로 사용** - 기존 아키텍처 유지 (추천)
2. **일부 수정** - 배포 환경 등 일부 변경
3. **새로 설계** - 완전히 새로운 아키텍처

번호로 선택:</ask>

<action>
If 1: Auto-fill architecture from base project, skip to step 5 (Scalability)
If 2: Ask which parts to change
If 3: Proceed with normal flow (step 1~4)
</action>

**Case 2: {{opensource_mode}} == "combine"**
<action>Analyze each library's architecture requirements:

For each library in {{opensource.feature_map}}:
- WebFetch: [library docs] - architecture, integration guide
- Check: how it integrates, required infrastructure
</action>

<action>Present integration architecture:
"기능별 라이브러리 통합 아키텍처를 설계했어요!

**라이브러리 통합 구조:**
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     {{project_name}}                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend ({{frontend_framework}})                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ {{기능1}}    │  │ {{기능2}}    │  │ {{기능3}}    │         │
│  │ ({{lib1}})  │  │ ({{lib2}})  │  │ ({{lib3}})  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Backend ({{backend_framework}})                            │
│  - {{lib1}} integration: [연동 방식]                        │
│  - {{lib2}} integration: [연동 방식]                        │
├─────────────────────────────────────────────────────────────┤
│  Database ({{database}})                                    │
└─────────────────────────────────────────────────────────────┘
\`\`\`

**통합 시 고려사항:**
- {{lib1}}: [초기화/설정 방법]
- {{lib2}}: [데이터 연동 방법]
- {{lib3}}: [API 연동 방법]
"
</action>

<ask>이 통합 구조로 진행할까요?

1. **네, 이대로** - 위 구조로 진행 (추천)
2. **수정 필요** - 일부 통합 방식 변경
3. **새로 설계** - 처음부터 설계

번호로 선택:</ask>

**Case 3: {{opensource_mode}} == "template"**
<action>Fetch template architecture and plan library integration:

WebFetch: {{opensource.base_template}} repo - architecture docs
For each library in {{opensource.feature_map}}: check integration points
</action>

<action>Present template + libraries architecture:
"템플릿 기반 + 라이브러리 통합 아키텍처예요!

**템플릿 기본 구조:** {{opensource.base_template}}
\`\`\`
[템플릿 아키텍처 다이어그램]
\`\`\`

**라이브러리 통합 위치:**
| 기능 | 라이브러리 | 통합 위치 | 방법 |
|------|-----------|----------|------|
| {{기능1}} | {{lib1}} | [위치] | [방법] |
| {{기능2}} | {{lib2}} | [위치] | [방법] |

**수정 필요 부분:** [템플릿에서 수정할 부분]
"
</action>

<ask>템플릿 + 라이브러리 통합 구조로 진행할까요?

1. **네, 이대로** - 위 구조로 진행
2. **수정 필요** - 일부 변경
3. **새로 설계** - 처음부터 설계

번호로 선택:</ask>
</step>

<step n="2" goal="Architecture Pattern">
<action>Based on TRD tech stack, analyze and recommend pattern</action>

<ask>아키텍처 패턴 확인:

TRD에서 선택한 스택:
- Frontend: {{frontend_framework}}
- Backend: {{backend_framework}}
- Database: {{database}}
- Hosting: {{hosting_platform}}

**추천 패턴:**

1. **모놀리식 (Monolithic)**
   - 하나의 코드베이스에 모든 기능
   - 장점: 단순함, 빠른 개발, 디버깅 쉬움
   - 단점: 확장성 제한, 배포 전체 필요
   - 적합: MVP, 소규모 팀, 단순한 서비스

2. **JAMstack / BFF 패턴**
   - Frontend + API Backend 분리
   - 장점: 프론트/백 독립 배포, CDN 활용
   - 단점: 복잡도 증가
   - 적합: Next.js + 별도 API, 콘텐츠 중심

3. **서버리스 (Serverless)**
   - 함수 단위로 실행, 사용한 만큼 과금
   - 장점: 자동 확장, 비용 효율
   - 단점: 콜드 스타트, 복잡한 로직 제한
   - 적합: Supabase/Firebase 사용 시, 이벤트 기반

**{{project_name}}에 추천**: [TRD 기반 분석]

번호 선택:</ask>

<action>Store as {{architecture_pattern}}</action>
</step>

<step n="3" goal="System Components">
<action>Define main components based on TRD selections</action>

<action>Generate component diagram:
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        사용자                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  {{frontend}}   │  │  {{ui_library}} │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  {{backend}}    │  │  {{auth}}       │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  {{database}}   │  │  {{storage}}    │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
\`\`\`
</action>

<action>For each component, explain:
- 역할 (무엇을 하는지)
- 기술 (TRD에서 선택한 것)
- 다른 컴포넌트와의 연결
</action>
</step>

<step n="4" goal="Data Flow">
<action>Based on UX user flows, define data flow patterns</action>

<action>For each major user flow from UX:

**예시: 회원가입 플로우**
\`\`\`
1. 사용자 → Frontend: 가입 폼 작성
2. Frontend → Backend: POST /api/auth/signup
3. Backend → Database: INSERT user
4. Backend → Email Service: 인증 이메일 발송
5. Backend → Frontend: 성공 응답
6. Frontend → 사용자: 성공 화면
\`\`\`

**예시: 데이터 조회 플로우**
\`\`\`
1. 사용자 → Frontend: 페이지 요청
2. Frontend → Backend: GET /api/data
3. Backend → Database: SELECT query
4. Database → Backend: 데이터 반환
5. Backend → Frontend: JSON 응답
6. Frontend → 사용자: 화면 렌더링
\`\`\`
</action>

<action>Create data flow for:
- 인증 (로그인/로그아웃)
- 핵심 기능 1 (PRD에서)
- 핵심 기능 2 (PRD에서)
- 파일 업로드 (해당 시)
</action>
</step>

<step n="5" goal="Deployment Structure">
<action>Based on TRD hosting, define deployment structure</action>

<action>Generate deployment diagram:
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Production                               │
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   Vercel    │     │  Supabase   │     │     CDN     │   │
│  │  Frontend   │────▶│   Backend   │     │   Assets    │   │
│  │  + API      │     │   + DB      │     │             │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
\`\`\`
</action>

<action>Define environments:

**Development (로컬)**
- Frontend: localhost:3000
- Backend: localhost:3000/api (또는 로컬 Supabase)
- Database: 로컬 또는 개발용 Supabase

**Staging (선택적)**
- Preview 배포 (Vercel Preview)
- 테스트용 DB

**Production**
- 실제 서비스 URL
- 프로덕션 DB
- 모니터링 활성화
</action>

<action>Define CI/CD:
\`\`\`
GitHub Push → Vercel Build → Deploy
                  │
                  ├── Lint/Type Check
                  ├── Unit Tests
                  └── Preview Deploy (PR) / Production Deploy (main)
\`\`\`
</action>
</step>

<step n="6" goal="Scalability">
<ask>확장성 계획:

예상 사용자 규모는?

1. **소규모 (100명 이하)**
   - 기본 설정으로 충분
   - 단일 인스턴스
   - 비용: 무료 tier

2. **중규모 (1,000명)**
   - CDN 활용
   - DB 인덱스 최적화
   - 캐싱 고려
   - 비용: $20-50/월

3. **대규모 (10,000명+)**
   - 로드밸런싱
   - DB 읽기 복제본
   - Redis 캐시
   - 비용: $100+/월

번호 선택:</ask>

<action>Store as {{scale_plan}}</action>

<action>Generate scaling strategy:

**Phase 1 (MVP):**
- 단일 인스턴스
- 무료 tier 활용
- 기본 인덱스

**Phase 2 (Growth):**
- CDN으로 정적 자산 배포
- DB 쿼리 최적화
- 이미지 최적화 (Cloudinary 등)

**Phase 3 (Scale):**
- 서버리스 함수 확장
- DB 연결 풀링
- 백그라운드 작업 큐
</action>
</step>

<step n="7" goal="Security">
<action>Define security measures:

**인증/인가:**
- 인증 서비스: {{auth_service}} (TRD에서)
- JWT/Session 관리
- Role-based access (필요 시)

**네트워크 보안:**
- HTTPS 필수 (자동 - 호스팅)
- CORS 설정
- Rate limiting

**데이터 보안:**
- 비밀번호 해싱 (bcrypt/argon2)
- 환경변수로 민감 정보 관리
- SQL Injection 방지 (ORM/파라미터화)
- XSS 방지 (React 기본 제공)

**인프라 보안:**
- 환경변수 암호화
- 최소 권한 원칙
- 정기적 의존성 업데이트
</action>
</step>

<step n="8" goal="Monitoring">
<action>Define monitoring strategy:

**에러 모니터링:**
- Sentry (무료 tier: 5K 이벤트/월)
- 또는 Vercel 기본 에러 로그

**성능 모니터링:**
- Vercel Analytics (무료 tier 있음)
- 또는 Web Vitals 직접 수집

**로깅:**
- 개발: console.log
- 프로덕션: 구조화된 로그 (Vercel Logs)

**알림:**
- 에러 발생 시 Slack/Email 알림 (Sentry)
- 다운타임 알림 (Better Stack 무료)

**권장 설정:**
\`\`\`
MVP: Vercel 기본 로그 + Sentry 무료
Growth: + Vercel Analytics + Better Stack
Scale: + DataDog/New Relic (유료)
\`\`\`
</action>
</step>

<step n="9" goal="Generate Architecture">
<action>Load template from {template}</action>
<action>Fill template with collected variables</action>
<action>Save to {default_output_file}</action>

<action>Show summary:
"
Architecture 완료!

**저장 위치**: {default_output_file}

**요약:**
- 패턴: {{architecture_pattern}}
- 컴포넌트: Frontend + Backend + Database + [추가 서비스]
- 배포: {{hosting_platform}} (자동 CI/CD)
- 확장성: {{scale_plan}}
- 보안: HTTPS, 인증, 데이터 암호화
- 모니터링: Sentry + Vercel 기본

**다음**: ERD 워크플로우
"
</action>
</step>

</workflow>
`;

const TEMPLATE = `
---
document_type: Architecture
project_name: {{project_name}}
created_date: {{date}}
architecture_pattern: {{architecture_pattern}}
scale_plan: {{scale_plan}}
tech_stack:
  frontend: {{frontend_framework}}
  backend: {{backend_framework}}
  database: {{database}}
  hosting: {{hosting_platform}}
---

# {{project_name}} - System Architecture

## 아키텍처 패턴

**패턴**: {{architecture_pattern}}

**선택 이유**: {{pattern_reason}}

---

## 시스템 구성도

\`\`\`
{{system_diagram}}
\`\`\`

### 컴포넌트 설명

{{component_descriptions}}

---

## 데이터 흐름

### 인증 플로우
{{auth_flow}}

### 핵심 기능 플로우
{{main_feature_flow}}

---

## 배포 구조

### 환경 구성
| 환경 | URL | 용도 |
|-----|-----|------|
| Development | localhost:3000 | 로컬 개발 |
| Staging | preview.xxx.vercel.app | PR 테스트 |
| Production | xxx.com | 실서비스 |

### CI/CD 파이프라인
\`\`\`
{{cicd_diagram}}
\`\`\`

---

## 확장성 전략

**현재 규모**: {{scale_plan}}

### Phase 1 (MVP)
{{phase1_strategy}}

### Phase 2 (Growth)
{{phase2_strategy}}

### Phase 3 (Scale)
{{phase3_strategy}}

---

## 보안

### 인증/인가
{{auth_security}}

### 데이터 보안
{{data_security}}

### 인프라 보안
{{infra_security}}

---

## 모니터링

| 항목 | 도구 | 비용 |
|-----|-----|------|
| 에러 | {{error_monitoring}} | {{error_cost}} |
| 성능 | {{perf_monitoring}} | {{perf_cost}} |
| 로그 | {{logging}} | {{log_cost}} |
| 알림 | {{alerting}} | {{alert_cost}} |
`;

const CHECKLIST = `
# Architecture Validation Checklist

## 문서 구조

- [ ] YAML frontmatter가 완전함
- [ ] architecture_pattern이 명시됨
- [ ] tech_stack 정보가 포함됨
- [ ] key_components_list가 메타데이터에 있음
- [ ] data_flow_paths_list가 메타데이터에 있음
- [ ] 모든 섹션이 존재하고 placeholder가 없음

## 이전 문서 일관성

- [ ] PRD의 service_type, platform, core_features가 반영됨
- [ ] UX Design의 모든 user flows가 data flows에 매핑됨
- [ ] UI Design Guide의 선택된 라이브러리가 아키텍처에 통합됨
- [ ] TRD의 **모든** 선택된 기술이 정확히 사용됨
- [ ] TRD의 기술과 **다른** 기술을 제안하지 않음

## Web Search 실행 확인 (매우 중요!)

### Similar Services Architecture
- [ ] **Web Search 수행됨**
- [ ] **4-8개 유사 서비스의 아키텍처 검색됨**
- [ ] 각 서비스의 아키텍처 패턴 분석됨
- [ ] 실제 링크 (블로그 포스트, 케이스 스터디) 포함
- [ ] 우리 프로젝트에 적용 가능한 점 명시
- [ ] 각 서비스의 규모 정보 포함

### Architecture Patterns Research
- [ ] 선택된 아키텍처 패턴의 장단점 검색됨
- [ ] 실제 사용 사례 포함
- [ ] 최신 정보 (2024년 기준)

## 아키텍처 패턴

- [ ] 명확한 아키텍처 패턴 선택됨 (Monolithic/Microservices/Serverless/etc)
- [ ] 선택 이유가 PRD success_metrics 기반으로 설명됨
- [ ] 선택 이유가 팀 규모 기반으로 설명됨
- [ ] 선택 이유가 비용 기반으로 설명됨
- [ ] 비개발자를 위한 쉬운 설명 포함 (비유/스토리텔링)

## 시스템 컴포넌트 정의

### Frontend Layer
- [ ] Frontend 컴포넌트들이 명확히 정의됨
- [ ] 각 컴포넌트의 책임(responsibilities)이 명시됨
- [ ] TRD의 frontend_framework 사용됨
- [ ] TRD의 UI 라이브러리 통합 설명됨
- [ ] 비개발자 설명 포함

### Backend Layer
- [ ] Backend 컴포넌트들이 명확히 정의됨
- [ ] API Server 역할 명시
- [ ] Authentication Service 명시 (TRD 기반)
- [ ] Background Jobs (필요시) 명시
- [ ] 각 컴포넌트의 책임 명시
- [ ] TRD의 backend_framework 사용됨
- [ ] 비개발자 설명 포함

### Database Layer
- [ ] Database 컴포넌트 정의됨
- [ ] TRD의 database 선택 사용됨
- [ ] Cache layer (필요시) 정의됨
- [ ] File storage 정의됨 (TRD 기반)
- [ ] 비개발자 설명 포함

### Infrastructure Layer
- [ ] Hosting platform 명시 (TRD 기반)
- [ ] CDN 전략 명시 (필요시)
- [ ] Monitoring 도구 명시 (TRD 기반)
- [ ] CI/CD 도구 명시
- [ ] 비개발자 설명 포함

## 데이터 흐름

### 비개발자 설명
- [ ] 전체 데이터 흐름을 쉬운 언어로 설명
- [ ] 스토리텔링 또는 비유 사용
- [ ] 그림/다이어그램 포함 (Mermaid 또는 ASCII)

### 주요 User Flow 매핑
- [ ] **UX Design의 모든 주요 user flows가 technical data flows로 변환됨**
- [ ] User authentication flow (signup, login, logout)
- [ ] PRD의 모든 핵심 기능 flows
- [ ] File upload flow (필요시)
- [ ] Payment flow (필요시)
- [ ] Real-time flow (필요시)

### 각 Data Flow마다
- [ ] Frontend 단계 명시
- [ ] Backend 단계 명시
- [ ] Database 상호작용 명시
- [ ] Third-party services 상호작용 명시 (필요시)
- [ ] 관련 컴포넌트 명시
- [ ] 비개발자 스토리텔링 설명 포함

## 인증 및 권한 관리

- [ ] Authentication flow 상세 정의됨
- [ ] TRD의 auth 솔루션 정확히 사용됨
- [ ] Registration flow 정의
- [ ] Login flow 정의
- [ ] Token/Session 관리 정의
- [ ] Password reset flow 정의
- [ ] Social login flow (필요시) 정의
- [ ] Authorization (권한) 체크 방식 정의
- [ ] 비개발자 비유 설명 포함

## 기능별 아키텍처 (가장 중요!)

### PRD 기능 커버리지
- [ ] **PRD의 모든 핵심 기능이 아키텍처로 설명됨**
- [ ] 각 기능마다 사용되는 컴포넌트 명시
- [ ] 각 기능마다 API endpoints 명시
- [ ] 각 기능마다 database tables 프리뷰 제공
- [ ] 각 기능마다 third-party services 명시 (필요시)
- [ ] 각 기능마다 implementation pattern 설명
- [ ] 각 기능마다 비개발자 스토리텔링 설명

### 특수 기능 아키텍처
- [ ] Authentication 상세 아키텍처 (필요시)
- [ ] File upload/storage 아키텍처 (필요시)
- [ ] Email/notification 아키텍처 (필요시)
- [ ] Payment 처리 아키텍처 (필요시)
- [ ] Real-time 기능 아키텍처 (필요시)
- [ ] Search 기능 아키텍처 (필요시)

## API 아키텍처

- [ ] API 타입 명시 (REST/GraphQL/tRPC - from TRD)
- [ ] Base URL 정의
- [ ] Authentication 방식 명시 (헤더 형식)
- [ ] API versioning 전략 정의
- [ ] 모든 주요 endpoints 카테고리별 정리
  - [ ] Auth endpoints
  - [ ] User endpoints
  - [ ] Feature endpoints (PRD 기능별)
- [ ] Error handling 표준 정의
- [ ] Request/Response 형식 정의
- [ ] Rate limiting 전략 명시
- [ ] CORS policy 명시
- [ ] 비개발자 설명 포함

## 데이터베이스 아키텍처

- [ ] TRD의 database 시스템 사용됨
- [ ] Database hosting 명시 (TRD 기반)
- [ ] Connection strategy 정의 (pooling)
- [ ] Schema approach 명시 (TRD 기반)
- [ ] Migration tool 명시 (TRD 기반)
- [ ] 주요 테이블/컬렉션 프리뷰 제공
  - [ ] users 테이블
  - [ ] 각 PRD 기능별 테이블
- [ ] 테이블 간 관계 프리뷰
- [ ] Indexing 전략 정의
- [ ] Caching 전략 정의 (필요시)
- [ ] 비개발자 비유 설명 포함

## 배포 아키텍처

### 비개발자 설명
- [ ] 배포 과정을 쉬운 언어로 설명
- [ ] 개발/스테이징/프로덕션 환경 설명
- [ ] 스토리텔링 포함

### 배포 구조
- [ ] TRD의 hosting platform 사용됨
- [ ] Frontend 배포 방식 정의
- [ ] Backend 배포 방식 정의
- [ ] Database 배포 정의
- [ ] File storage 설정 정의
- [ ] Environment 구분 (dev/staging/prod)
- [ ] Environment variables 관리 방법
- [ ] Domain 및 SSL 설정 언급

### CI/CD Pipeline
- [ ] CI/CD 도구 선택됨
- [ ] Trigger 조건 정의 (git push 등)
- [ ] Pipeline 단계 정의:
  - [ ] Test 실행
  - [ ] Build
  - [ ] Deploy
  - [ ] Migration 실행
  - [ ] Smoke tests
- [ ] 알림 방법 정의

## 확장성 아키텍처

### 비개발자 설명
- [ ] 확장성을 쉬운 언어로 설명
- [ ] 3단계 비유 (작은 식당 → 중형 → 대형) 사용
- [ ] 각 단계의 비용 명시 (TRD 기반)

### 확장성 전략
- [ ] **Phase 1 (MVP)** 정의:
  - [ ] 사용자 수 목표 (PRD success_metrics 기반)
  - [ ] 아키텍처 구성
  - [ ] 예상 비용 (TRD 기반)
- [ ] **Phase 2 (Growth)** 정의:
  - [ ] 사용자 수 목표
  - [ ] Scaling 전략 (horizontal/vertical)
  - [ ] 추가 컴포넌트 (read replicas, CDN, etc.)
  - [ ] 예상 비용 (TRD 기반)
- [ ] **Phase 3 (Scale)** 정의:
  - [ ] 사용자 수 목표
  - [ ] Advanced scaling (load balancer, sharding, etc.)
  - [ ] 예상 비용 (TRD 기반)
- [ ] Auto-scaling 규칙 정의 (CPU, memory, request rate)

## 보안 아키텍처

- [ ] Network security (HTTPS, CORS, Rate limiting)
- [ ] Authentication security (password hashing, token security)
- [ ] Authorization security (RBAC, permission checks)
- [ ] Data security (encryption at rest, in transit)
- [ ] API security (input validation, SQL injection prevention, XSS, CSRF)
- [ ] File upload security (필요시)
- [ ] Environment security (secrets management)
- [ ] Security monitoring 및 logging
- [ ] 비개발자 비유 설명 (공항 보안 등)

## 모니터링 및 로깅

### Monitoring
- [ ] TRD의 monitoring 도구 사용됨
- [ ] Application monitoring 정의
- [ ] Infrastructure monitoring 정의
- [ ] User analytics 정의
- [ ] Alert 조건 정의 (critical, warning)

### Logging
- [ ] 로깅 대상 정의 (API requests, errors, auth events, etc.)
- [ ] Log levels 정의 (ERROR, WARN, INFO, DEBUG)
- [ ] Log storage 방법 정의
- [ ] Log retention 기간 정의

### 비개발자 설명
- [ ] 모니터링을 쉽게 설명 (CCTV, 온도계 비유)

## 성능 최적화

### Frontend Performance
- [ ] Code splitting 전략
- [ ] Asset optimization (images, minification)
- [ ] Caching 전략
- [ ] CDN 사용 (필요시)

### Backend Performance
- [ ] Database optimization (indexes, connection pooling)
- [ ] Caching (Redis 등, TRD 기반)
- [ ] API optimization (compression, pagination)
- [ ] Background jobs (필요시)

### Performance Targets
- [ ] Page load time 목표 명시
- [ ] API response time 목표 명시

### 비개발자 설명
- [ ] 성능 최적화를 배달 서비스 비유로 설명

## 비용 최적화 아키텍처

### 비개발자 설명
- [ ] 비용 최적화를 쉽게 설명
- [ ] 단계별 전략 설명

### Cost-Saving Strategies
- [ ] Phase 1 (MVP): FREE tier 최대화
  - [ ] FREE tier 한계 명시
  - [ ] 예상 비용 (TRD 기반)
- [ ] Phase 2 (Growth): Smart scaling
  - [ ] Auto-scaling 활용
  - [ ] 예상 비용 (TRD 기반)
- [ ] Phase 3 (Scale): Optimize spend
  - [ ] 장기 계약 할인 등
  - [ ] 예상 비용 (TRD 기반)

### Cost Monitoring
- [ ] Billing alerts 설정 방법
- [ ] Cost attribution 전략

## 개발 환경 아키텍처

- [ ] Prerequisites 명시 (Node.js, runtime, etc.)
- [ ] Repository 구조 설명
- [ ] Environment variables 예시
- [ ] Installation steps 제공
- [ ] Development workflow 설명:
  - [ ] Branch strategy
  - [ ] Code quality tools (linter, formatter)
  - [ ] Testing workflow
- [ ] 비개발자 설명 (요리사의 개인 주방 비유)

## 플랫폼별 아키텍처 (해당시)

### 모바일 (해당시)
- [ ] Mobile framework 명시 (TRD 기반)
- [ ] App architecture 정의
- [ ] Platform-specific features 정의
- [ ] App distribution 전략

### 데스크톱 (해당시)
- [ ] Desktop framework 명시 (TRD 기반)
- [ ] App architecture 정의
- [ ] Platform-specific integrations
- [ ] Installer 전략

### 비개발자 설명
- [ ] 플랫폼 차이를 쉽게 설명

## 다이어그램 및 시각화

- [ ] 전체 시스템 구성도 포함 (Mermaid 또는 ASCII)
- [ ] 주요 데이터 흐름 다이어그램 포함
- [ ] 배포 아키텍처 다이어그램 포함 (선택적)
- [ ] 다이어그램이 명확하고 이해하기 쉬움

## 문서 일관성

- [ ] 컴포넌트 이름이 전체 문서에서 일관됨
- [ ] 기술 스택이 TRD와 100% 일치함
- [ ] PRD의 모든 기능이 다뤄짐
- [ ] UX의 모든 flows가 data flows로 변환됨
- [ ] UI 라이브러리가 frontend architecture에 통합됨

## 검색 품질 (매우 중요!)

### Web Search 실행 확인
- [ ] **유사 서비스 아키텍처 검색이 실제로 수행됨**
- [ ] **4-8개 실제 서비스의 아키텍처가 분석됨**
- [ ] **각 서비스의 실제 링크 포함됨**
- [ ] **최신 정보 (2024년 기준)**

### 정보의 정확성
- [ ] 모든 기술이 TRD와 정확히 일치함
- [ ] 모든 링크가 작동함
- [ ] 모든 버전 번호가 정확함
- [ ] 아키텍처 패턴이 실제 프로젝트 규모에 적합함

## 비개발자 이해도

### 스토리텔링 품질
- [ ] 모든 주요 섹션에 비개발자 설명 포함
- [ ] 실생활 비유 사용 (식당, 아파트, 배달, 도서관 등)
- [ ] "철수" 또는 실제 사용자 예시 포함
- [ ] 기술 용어마다 쉬운 설명 제공

### 이해 가능성
- [ ] 비개발자가 전체 시스템 구조를 이해할 수 있음
- [ ] 비개발자가 왜 이 아키텍처를 선택했는지 이해 가능
- [ ] 비개발자가 확장 전략을 이해 가능
- [ ] 비개발자가 비용 예측을 이해 가능

## 개발자 구현 가능성

- [ ] 개발자가 이 문서만으로 시스템 구조 파악 가능
- [ ] 모든 컴포넌트의 책임이 명확함
- [ ] 모든 API endpoints가 정리됨
- [ ] 데이터베이스 테이블 프리뷰가 충분함
- [ ] 배포 방법이 명확함
- [ ] 개발 환경 설정 가이드가 완전함

## 다음 단계 준비

- [ ] ERD에 필요한 모든 database 정보 포함됨
- [ ] 데이터베이스 테이블/컬렉션 프리뷰 제공됨
- [ ] 테이블 간 관계 힌트 제공됨
- [ ] 문서가 {default_output_file}에 저장됨

---

## 최종 품질 검증

### 비개발자 이해도 테스트
- [ ] 비개발자가 "시스템이 어떻게 구성되는지" 이해할 수 있는가?
- [ ] 각 컴포넌트의 역할이 명확한가?
- [ ] 확장 전략이 이해 가능한가?
- [ ] 비용 예측이 명확한가?

### 개발자 구현 가능성 테스트
- [ ] 개발자가 이 문서만으로 아키텍처를 구현할 수 있는가?
- [ ] 모든 기술적 결정이 명확한가?
- [ ] API 구조가 충분히 정의되었는가?
- [ ] 배포 및 개발 환경 설정이 가능한가?

### 검색 품질 테스트
- [ ] 유사 서비스들이 실제로 관련성이 있는가?
- [ ] 아키텍처 패턴 선택이 합리적인가?
- [ ] 모든 링크가 유효한가?

### 일관성 테스트
- [ ] TRD의 기술 선택이 100% 준수되었는가?
- [ ] PRD의 모든 기능이 아키텍처로 구현되었는가?
- [ ] UX의 모든 flows가 data flows로 변환되었는가?

---

## 검증 완료 후

모든 체크박스가 완료되면:
1. Architecture 문서가 완성됨
2. 비개발자와 개발자 모두 이해 가능
3. 실제 구현 가능한 아키텍처 설계 완료
4. ERD 워크플로우로 넘어갈 준비 완료
`;

/**
 * 완성된 Architecture 워크플로우 프롬프트
 */
export const STARTUP_ARCHITECTURE_PROMPT = `
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
- 출력 파일은 {project-root}/anyon-docs/planning/architecture.md에 저장하세요.
- 먼저 PRD, UX Design, TRD 문서를 읽어서 프로젝트 정보를 파악하세요.

<session_awareness>
이 워크플로우가 처음 시작되면 Step 0부터 진행하세요.
이미 대화가 진행 중이라면 (이전 assistant 응답이 있다면) 현재 진행 중인 Step을 이어서 계속하세요.
절대로 처음부터 다시 시작하지 마세요.
</session_awareness>
`;

/**
 * Architecture 워크플로우 메타데이터
 */
export const STARTUP_ARCHITECTURE_METADATA = {
  id: 'startup-architecture',
  title: 'Architecture',
  description: '시스템 아키텍처 설계 (구조, 데이터 흐름, 확장성, 보안)',
  outputPath: 'anyon-docs/planning/architecture.md',
  filename: 'architecture.md',
};
