# PM Orchestrator 개선 완료 - 2025-12-27

## 📋 개요

PM Orchestrator 및 Executor 워크플로우를 개선하여 병렬 실행 아키텍처를 구현하고, 에이전트 템플릿 시스템을 간소화했습니다.

## ✅ 주요 변경 사항

### 1. 에이전트 템플릿 시스템 재구성

#### Before
```
agent-templates/
├── backend-developer.yaml
├── frontend-developer.yaml
├── database-architect.yaml
└── ... (8개 YAML 파일)
```

#### After
```
.anyon/
└── agents/
    ├── backend-developer.md
    ├── frontend-developer.md
    ├── database-architect.md
    └── ... (8개 Markdown 파일)
```

**주요 개선점:**
- ✅ YAML → Markdown 변환 (더 읽기 쉬운 형식)
- ✅ 경로 간소화: `agent-templates/` → `.anyon/agents/`
- ✅ HTML 주석 기반 변수 주입: `<!-- pm-orchestrator가 TRD 분석 후 자동 주입 -->`
- ✅ TDD 개발 사이클 명시 (RED → GREEN → REFACTOR)

**생성된 에이전트:**
1. backend-developer.md
2. frontend-developer.md
3. database-architect.md
4. scaffolding-engineer.md
5. integration-engineer.md
6. devops-engineer.md
7. qa-engineer.md
8. security-auditor.md

---

### 2. 병렬 실행 아키텍처 구현

#### 티켓 구조 개선 (pm-orchestrator.ts)

**Before:**
```yaml
assigned_agents:
  - agent: "Backend Developer"
    responsibility: "API 구현"
  - agent: "Frontend Developer"
    responsibility: "UI 구현"
```

**After:**
```yaml
assigned_agents:
  primary:
    agent: "Backend Developer"
    responsibility: "Product API 엔드포인트 구현"
    outputs: ["backend/src/routes/products.ts"]

  parallel:
    - agent: "Frontend Developer"
      responsibility: "Product List UI 구현"
      outputs: ["mobile/src/screens/ProductListScreen.tsx"]
      depends_on_primary: false  # primary와 독립적

    - agent: "QA Engineer"
      responsibility: "통합 테스트 작성"
      outputs: ["tests/e2e/product.test.ts"]
      depends_on_primary: true  # primary 완료 후 실행

parallel_execution:
  enabled: true
  mode: "independent"
  max_concurrent: 2
```

**주요 개선점:**
- ✅ Primary/Parallel 에이전트 명확히 구분
- ✅ `depends_on_primary` 필드로 실행 순서 제어
- ✅ `outputs` 필드로 파일 충돌 자동 감지
- ✅ `parallel_execution.mode`: single | independent | after_primary

#### Wave 병렬 그룹 생성 (pm-orchestrator.ts Step 4)

```yaml
Wave 2: 인증 시스템

Group A - Backend (독립 실행):
  - TICKET-004: Auth API [Backend Developer]
  - TICKET-007: Product API [Backend Developer]

Group B - Frontend (독립 실행):
  - TICKET-005: Login UI [Frontend Developer]
  - TICKET-008: Product List UI [Frontend Developer]

병렬 실행 가능: Group A와 Group B는 서로 다른 파일/영역 작업
예상 소요: 6-8시간 (순차 실행 시 12-16시간)
```

**자동 병렬 그룹 생성 조건:**
1. 파일 충돌 없음 (outputs 비교)
2. 다른 에이전트
3. depends_on_primary: false

#### 병렬 실행 로직 (pm-executor.ts Step 3)

```xml
<!-- 단일 메시지에서 복수 Task 도구 병렬 호출 -->
<invoke name="Task">
  <parameter name="prompt">Backend Developer - TICKET-004</parameter>
</invoke>
<invoke name="Task">
  <parameter name="prompt">Frontend Developer - TICKET-005</parameter>
</invoke>
```

**파일 충돌 검증:**
- outputs 필드 교집합 확인
- 중복 파일 있으면 순차 실행
- 중복 없으면 병렬 실행

---

### 3. NPM 의존성 제거

#### Before: NPX 방식
```rust
// NPX 명령 실행
Command::new("npx")
    .arg("anyon-agents@latest")
    .spawn()
```

#### After: 로컬 복사 방식
```rust
// 로컬 .anyon/ 폴더 직접 복사
#[cfg(debug_assertions)]
let template_source = project_root.join(".anyon");

#[cfg(not(debug_assertions))]
let template_source = resource_dir.join(".anyon");

copy_dir_recursive(&template_source, &anyon_dest)?;
```

**주요 개선점:**
- ✅ NPM 패키지 의존성 제거
- ✅ 네트워크 불필요 (오프라인 설치 가능)
- ✅ 설치 속도 향상
- ✅ 개발/프로덕션 환경 자동 대응
- ✅ 함수명 변경: `run_npx_anyon_agents` → `install_anyon_templates`

---

## 📁 수정된 파일 목록

### TypeScript/Workflow
1. **src/constants/workflows/development/pm-orchestrator.ts**
   - Line 5: description에서 "의존성 그래프" 제거
   - Line 31: `dev_dependency_graph` 경로 삭제
   - Line 97: `dependency_graph` 출력 설정 삭제
   - Line 106: `dependency_graph_file` 참조 삭제
   - Line 47: 경로 변경 `agent_templates_path: "{project-root}/.anyon/agents"`
   - Step 0b: 문서 분석 및 템플릿 주입 로직 추가
   - Step 3: 병렬 티켓 구조 개선
   - Step 4: Wave 병렬 그룹 생성 (의존성 그래프 자동 생성 로직 제거)
   - Step 5: Primary/Parallel 에이전트 할당

2. **src/constants/workflows/development/pm-executor.ts**
   - Step 3: 병렬 실행 감지 및 Task 도구 병렬 호출
   - 파일 충돌 검증
   - depends_on_primary 기반 실행 전략

### Rust/Backend
3. **src-tauri/src/commands/claude/settings.rs**
   - 함수명: `run_npx_anyon_agents` → `install_anyon_templates`
   - NPX 실행 코드 제거
   - `copy_dir_recursive` 헬퍼 함수 추가
   - 개발/프로덕션 환경 분기

4. **src-tauri/src/commands/claude/mod.rs**
   - Export 이름 변경

5. **src-tauri/src/main.rs**
   - Tauri command 등록 이름 변경

### 에이전트 템플릿
6. **.anyon/agents/** (8개 파일 생성)
   - backend-developer.md
   - frontend-developer.md
   - database-architect.md
   - scaffolding-engineer.md
   - integration-engineer.md
   - devops-engineer.md
   - qa-engineer.md
   - security-auditor.md

### 삭제
7. **agent-templates/** (8개 YAML 파일 삭제)

---

## 🔄 마이그레이션 가이드

### 기존 프로젝트에서 사용 시

1. **에이전트 템플릿 경로 변경**
   - 기존: `{project-root}/.anyon/anyon-method/agent-templates`
   - 신규: `{project-root}/.anyon/agents`

2. **티켓 구조 업데이트**
   - 기존 `assigned_agents` 배열을 primary/parallel 구조로 변경
   - `parallel_execution` 필드 추가
   - `depends_on_primary` 필드 추가

3. **프로젝트 초기화**
   - Tauri 앱에서 `install_anyon_templates` 호출
   - `.anyon/agents/` 자동 복사됨

---

## ✅ 검증 체크리스트

### 코드 레벨
- [x] pm-orchestrator.ts 경로 수정
- [x] pm-orchestrator.ts 의존성 그래프 관련 코드 제거
- [x] pm-orchestrator.ts Step 0b 템플릿 주입 로직
- [x] pm-orchestrator.ts Step 3-5 병렬 티켓 구조
- [x] pm-executor.ts 병렬 실행 로직
- [x] Rust install_anyon_templates 함수
- [x] 8개 에이전트 Markdown 템플릿 생성
- [x] agent-templates/ 폴더 삭제
- [x] Rust 빌드 성공
- [x] 문서 업데이트 (의존성 그래프 제거)

### 실행 레벨 (테스트 필요)
- [ ] pm-orchestrator 실행 시 .anyon/agents/ 스캔
- [ ] 템플릿 변수 주입
- [ ] 병렬 티켓 생성
- [ ] pm-executor 병렬 Task 호출
- [ ] 프로젝트 초기화 시 템플릿 복사

---

## 🚀 다음 단계

1. **통합 테스트**
   - 샘플 프로젝트로 전체 워크플로우 실행
   - pm-orchestrator → pm-executor 연동 확인

2. **성능 측정**
   - 순차 실행 vs 병렬 실행 시간 비교
   - 병렬 그룹 효율성 검증

3. **문서화**
   - 사용자 가이드 작성
   - 에이전트 템플릿 커스터마이징 가이드

---

## 📚 참고 문서

- 플랜 파일: `.claude/plans/dynamic-plotting-stream.md`
- PM Orchestrator: `src/constants/workflows/development/pm-orchestrator.ts`
- PM Executor: `src/constants/workflows/development/pm-executor.ts`
- 에이전트 템플릿: `.anyon/agents/`
