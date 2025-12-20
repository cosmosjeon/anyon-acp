# Development 워크플로우 개선 계획

> 작성일: 2025-12-20
> 상태: 계획 수립 완료, 구현 대기

---

## 1. 배경 및 목표

### 1.1 현재 문제점

| 워크플로우 | 현재 라인 수 | 현재 단계 수 | 문제점 |
|-----------|-------------|-------------|--------|
| pm-orchestrator | 1998줄 | 11단계 | 과도하게 복잡, 티켓 YAML 1000줄+ |
| pm-executor | 1123줄 | 9단계 | Wave 단위 실행, 병렬화 약함 |
| pm-reviewer | 957줄 | 6단계 | MVP 완료 기준 없음 |

### 1.2 개선 목표

- **100% 자율주행**: MVP 완성까지 사용자 개입 없음
- **Contract-First 병렬화**: API 명세 기반 Backend/Frontend 동시 개발
- **자동 스모크 테스트**: Unit + E2E + 앱 실행 확인으로 MVP 완료 판정

### 1.3 참고 자료 (2025 AI-Driven Development Best Practices)

- [Addy Osmani - My LLM Coding Workflow](https://addyo.substack.com/p/my-llm-coding-workflow-going-into)
- [Anthropic - Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- OpenSpec: Delta 기반 변경 관리, BDD Scenario
- Shotgun: Research-First, Router + Sub-agents
- GitHub Spec-Kit: 5-Layer 아키텍처, Intent as Source of Truth

---

## 2. 핵심 결정 사항

### 2.1 자율성 수준
- **100% 자율주행**
- 사용자 개입: MVP 완료 시점에만

### 2.2 개발 계획서 상세도
- **의사코드 불필요**
- AI가 로직/코딩은 자율 판단
- Planning 문서 참조 포인터만 제공

### 2.3 병렬 실행 전략: Contract-First

```
1단계: API 명세(Contract) 확정
    ↓
2단계: Backend + Frontend 동시 개발
       Backend → 실제 API 구현
       Frontend → Mock 서버로 개발 (Contract 기반)
    ↓
3단계: 통합 (Mock → 실제 API 연결)
```

### 2.4 MVP 완료 기준: 자동 스모크 테스트

```yaml
mvp_completion:
  tasks:
    - all_tasks_completed: true
    - blocked_tasks: 0

  tests:
    - unit_tests_pass: true
    - e2e_tests_pass: true
    - test_coverage: ">= 70%"

  build:
    - build_success: true
    - no_typescript_errors: true
    - lint_pass: true

  smoke:
    - app_starts: true
    - no_console_errors: true
    - core_flows_work: true
    - screenshots_saved: true
```

---

## 3. pm-orchestrator 개선 계획

### 3.1 현재 → 개선

| 항목 | 현재 | 개선 |
|------|------|------|
| 라인 수 | 1998줄 | ~500줄 |
| 단계 수 | 11단계 | **3단계** |
| 티켓 상세도 | 1000줄+ YAML | ~20줄 포인터 |
| 출력물 | Epic별 파일 다수 | **단일 execution-plan.md** |

### 3.2 새로운 3단계 구조

#### Step 1: 분석 (Analyze)
- 6개 Planning 문서 로드
- 기능 목록 추출 (PRD)
- API 엔드포인트 목록 (Architecture)
- DB 테이블 목록 (ERD)
- 페이지 목록 (UX)
- 프로젝트 규모 산정 (Small/Medium/Large)

#### Step 2: 태스크 생성 (Generate Tasks)
- Scaffolding 태스크 (1개)
- Database 태스크들 (ERD 기반)
- Backend API 태스크들 (Architecture 기반)
- Frontend 태스크들 (UX 기반)
- Integration 태스크들 (외부 서비스)
- E2E 테스트 태스크 (마지막)

#### Step 3: 의존성 & Contract 정의 (Dependencies)
- 태스크별 depends_on 설정
- API Contract 추출 (Backend/Frontend 공유)
- 병렬 실행 가능 그룹 식별
- execution-plan.md 생성

### 3.3 새로운 태스크 형식 (간소화)

```yaml
tasks:
  - id: T001
    title: "프로젝트 스캐폴딩"
    type: scaffolding
    agent: scaffolding-engineer
    depends_on: []
    refs:
      - trd.md#tech-stack
      - architecture.md#folder-structure
    acceptance:
      - "npm install 성공"
      - "npm run dev 실행 가능"

  - id: T002
    title: "인증 API"
    type: backend
    agent: backend-developer
    depends_on: [T001]
    refs:
      - architecture.md#auth-api
      - erd.md#users-table
    contract:  # Frontend와 공유할 API 명세
      endpoint: POST /api/auth/login
      request: { phone: string, code: string }
      response: { token: string, user: User }
    acceptance:
      - "테스트 통과"

  - id: T003
    title: "로그인 UI"
    type: frontend
    agent: frontend-developer
    depends_on: [T001]  # API 완료 안 기다림!
    refs:
      - ui-ux.html:245-320
      - design-guide.md#buttons
    uses_contract: T002  # Mock으로 개발
    acceptance:
      - "컴포넌트 테스트 통과"
```

### 3.4 핵심 변화

- `refs`: Planning 문서 참조 (AI가 알아서 읽음)
- `contract`: API 명세 (Backend가 정의, Frontend가 Mock으로 사용)
- `uses_contract`: 어떤 Contract를 사용하는지
- `depends_on`: 세밀한 의존성 (Wave가 아닌 개별 태스크)

---

## 4. pm-executor 개선 계획

### 4.1 현재 → 개선

| 항목 | 현재 | 개선 |
|------|------|------|
| 라인 수 | 1123줄 | ~400줄 |
| 단계 수 | 9단계 | **4단계** |
| 실행 단위 | Wave | **Dependency Graph** |
| 역할 | 직접 실행 | **Router (위임)** |

### 4.2 새로운 4단계 구조

#### Step 1: 로드 & 준비 (Load)
- execution-plan.md 로드
- 완료된 태스크 확인 (execution-progress.md)
- Ready Queue 생성 (depends_on 해결된 것들)
- 병렬 실행 가능 태스크 그룹핑

#### Step 2: 병렬 실행 (Execute)
- Ready Queue에서 태스크 선택
- 각 태스크를 해당 Agent에 위임 (Task tool 병렬 호출)
- TDD 루프 (테스트 → 구현 → 검증)
- 3회 실패 시 스킵 & 기록

#### Step 3: 상태 업데이트 (Update)
- 완료된 태스크 기록
- 의존성 해결 → 새 태스크 Ready Queue로
- execution-progress.md 업데이트
- CLAUDE.md 컨텍스트 업데이트

#### Step 4: 반복 또는 완료 (Loop or Complete)
- Ready Queue 남았으면 → Step 2로
- 모든 태스크 완료 → pm-reviewer 호출
- 블로킹 태스크만 남으면 → 보고 & 중단

### 4.3 병렬 실행 예시

```
execution-plan.md 로드
    ↓
Ready Queue: [T001]  (depends_on: [])
    ↓
T001 실행 (scaffolding-engineer)
    ↓
T001 완료 → Ready Queue: [T002, T003, T004, T005]
    ↓
병렬 실행 (하나의 메시지에서 4개 Task tool 호출):
├── Task: backend-developer → T002 (DB 스키마)
├── Task: frontend-developer → T003 (공통 컴포넌트)
├── Task: frontend-developer → T004 (로그인 UI)
└── Task: frontend-developer → T005 (홈 UI)
    ↓
각자 완료되면 → 다음 Ready 태스크 실행
```

---

## 5. pm-reviewer 개선 계획

### 5.1 현재 → 개선

| 항목 | 현재 | 개선 |
|------|------|------|
| 라인 수 | 957줄 | ~300줄 |
| 단계 수 | 6단계 | **3단계** |
| 리뷰 시점 | Wave 완료 후 | **배치 완료 후** |
| 추가 | 없음 | **MVP 완료 체크** |

### 5.2 새로운 3단계 구조

#### Step 1: 변경사항 수집 (Collect)
- 마지막 리뷰 이후 변경된 파일
- 완료된 태스크 목록
- 테스트 결과 수집

#### Step 2: 병렬 리뷰 (Review)
- 4개 리뷰어 동시 실행:
  - Code Quality (DRY, 네이밍, 복잡도)
  - Architecture (레이어 분리, 설계 패턴)
  - Security (OWASP Top 10)
  - Test Coverage (엣지 케이스)
- 이슈 발견 시 자동 수정 (3회 시도)
- 수정 불가 시 기록

#### Step 3: MVP 체크 (Completion)
- 모든 태스크 완료?
- 유닛 테스트 통과?
- E2E 테스트 통과?
- 앱 실행 성공?
- 스모크 테스트 통과?
- 모두 OK → MVP 완료 선언!

---

## 6. 전체 자율 실행 흐름

```
사용자: "/pm-orchestrator" (또는 자동 트리거)
    ↓
pm-orchestrator: execution-plan.md 생성
    ↓
pm-executor: 태스크 실행 시작
    ↓
    ┌─────────────────────────────────────┐
    │  자율 실행 루프 (사용자 개입 없음)    │
    │                                     │
    │  1. Ready 태스크 병렬 실행           │
    │  2. TDD: 테스트 → 구현 → 검증        │
    │  3. 실패 시 자동 수정 (3회)          │
    │  4. 배치 완료 → pm-reviewer         │
    │  5. 리뷰 & 자동 수정                │
    │  6. MVP 체크 실패 → 1로 돌아감       │
    │                                     │
    └─────────────────────────────────────┘
    ↓
MVP 체크 통과!
    ↓
MVP_COMPLETE.md + 스크린샷 생성
    ↓
사용자: "오 됐네!" (첫 확인)
```

---

## 7. 구현 순서

1. **pm-orchestrator 개선** (우선순위 1)
   - 3단계 구조로 재작성
   - 태스크 형식 간소화
   - Contract 정의 추가

2. **pm-executor 개선** (우선순위 2)
   - 4단계 구조로 재작성
   - Router 패턴 적용
   - 병렬 실행 강화

3. **pm-reviewer 개선** (우선순위 3)
   - 3단계 구조로 재작성
   - MVP 완료 체크 추가
   - 자동 스모크 테스트 통합

4. **문서화 및 테스트**
   - 각 워크플로우 문서 작성
   - 예시 프로젝트로 테스트

---

## 8. 예상 결과

| 워크플로우 | 현재 → 개선 | 단계 수 | 핵심 변화 |
|-----------|------------|--------|----------|
| pm-orchestrator | 1998줄 → ~500줄 | 11 → 3 | 포인터 기반 태스크 |
| pm-executor | 1123줄 → ~400줄 | 9 → 4 | Router + 병렬 실행 |
| pm-reviewer | 957줄 → ~300줄 | 6 → 3 | MVP 완료 체크 |
| **총합** | **4078줄 → ~1200줄** | **26 → 10** | **70% 감소** |

---

## 참고: Planning 워크플로우 개선 패턴

Planning 워크플로우에서 적용된 패턴들 (동일하게 적용 예정):

1. **Step Goal-First Design**: `<step n="1" goal="분석">`
2. **Config/Instructions/Template/Checklist 분리**
3. **조건부 분기**: `<step if="condition">`
4. **품질 체크리스트**: 섹션별 구조화
5. **변수 명명 규칙**: `{{project_name}}`, `{{has_feature}}`
6. **문서 체인 일관성 검증**
7. **Metadata Export**: 프로그래밍 가능한 구성
