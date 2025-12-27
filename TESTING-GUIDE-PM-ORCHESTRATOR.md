# PM Orchestrator 테스트 가이드

## 📋 목차

1. [프로젝트 초기화 테스트](#1-프로젝트-초기화-테스트)
2. [에이전트 템플릿 검증](#2-에이전트-템플릿-검증)
3. [PM Orchestrator 실행 테스트](#3-pm-orchestrator-실행-테스트)
4. [병렬 실행 검증](#4-병렬-실행-검증)
5. [통합 테스트](#5-통합-테스트)

---

## 1. 프로젝트 초기화 테스트

### 목표
Tauri 앱에서 새 프로젝트 생성 시 `.anyon/agents/` 템플릿이 올바르게 복사되는지 확인

### 테스트 절차

#### 1.1 개발 모드에서 테스트

```bash
# 1. Tauri 앱 개발 모드 실행
cd /Users/cosmos/12.24/anyon-claude
npm run dev

# 2. 앱에서 새 프로젝트 생성
# - 프로젝트 경로: /tmp/test-project
# - "Create Project" 버튼 클릭
```

#### 1.2 템플릿 복사 확인

```bash
# 생성된 프로젝트 확인
cd /tmp/test-project

# .anyon/agents/ 폴더 존재 확인
ls -la .anyon/agents/

# 예상 결과: 8개 Markdown 파일
# - backend-developer.md
# - frontend-developer.md
# - database-architect.md
# - scaffolding-engineer.md
# - integration-engineer.md
# - devops-engineer.md
# - qa-engineer.md
# - security-auditor.md

# .claude/agents/ 폴더 존재 확인
ls -la .claude/agents/

# 예상 결과: 빈 폴더 (pm-orchestrator 실행 후 채워짐)
```

#### 1.3 템플릿 내용 검증

```bash
# 템플릿 파일이 올바르게 복사되었는지 확인
cat .anyon/agents/backend-developer.md

# 확인 사항:
# ✅ Markdown 형식
# ✅ HTML 주석 플레이스홀더 존재
#    <!-- pm-orchestrator가 TRD 분석 후 자동 주입 -->
# ✅ TDD 개발 사이클 섹션 존재
# ✅ 기본 스킬 목록 존재
```

#### 1.4 로그 확인

```bash
# Rust 로그 확인 (Tauri 앱 콘솔)
# 예상 로그:
# [Rust] Installing Anyon templates locally (no NPM)
# [Rust] Template source: /Users/cosmos/12.24/anyon-claude/.anyon
# [Rust] Copying .anyon to /tmp/test-project/.anyon
# [Rust] Creating .claude/agents directory
```

### 성공 기준
- ✅ `.anyon/agents/` 폴더 생성됨
- ✅ 8개 Markdown 파일 모두 존재
- ✅ `.claude/agents/` 폴더 생성됨
- ✅ 에러 없이 완료

---

## 2. 에이전트 템플릿 검증

### 목표
각 에이전트 템플릿이 올바른 구조를 가지고 있는지 확인

### 테스트 절차

#### 2.1 템플릿 구조 검증

```bash
cd /Users/cosmos/12.24/anyon-claude/.anyon/agents

# 모든 템플릿 파일 순회하며 필수 섹션 확인
for file in *.md; do
  echo "=== $file ==="

  # 필수 섹션 존재 확인
  grep -q "## 역할" "$file" && echo "✅ 역할" || echo "❌ 역할"
  grep -q "## 설명" "$file" && echo "✅ 설명" || echo "❌ 설명"
  grep -q "## 기본 스킬" "$file" && echo "✅ 기본 스킬" || echo "❌ 기본 스킬"
  grep -q "## 기본 원칙" "$file" && echo "✅ 기본 원칙" || echo "❌ 기본 원칙"
  grep -q "## TDD 개발 사이클" "$file" && echo "✅ TDD" || echo "❌ TDD"
  grep -q "<!-- pm-orchestrator가" "$file" && echo "✅ 주입 플레이스홀더" || echo "❌ 주입 플레이스홀더"

  echo ""
done
```

#### 2.2 특정 에이전트 상세 검증

```bash
# Backend Developer 템플릿 검증
cat backend-developer.md

# 확인 사항:
# ✅ TDD 필수 원칙 명시
# ✅ RED → GREEN → REFACTOR 사이클 설명
# ✅ API 엔드포인트 TDD 패턴
# ✅ 비즈니스 로직 TDD 패턴
# ✅ 프로젝트 기술 스택 주입 섹션
# ✅ 프로젝트 컨벤션 주입 섹션
```

### 성공 기준
- ✅ 모든 템플릿에 필수 섹션 존재
- ✅ TDD 관련 내용 명시
- ✅ HTML 주석 플레이스홀더 존재

---

## 3. PM Orchestrator 실행 테스트

### 목표
pm-orchestrator가 `.anyon/agents/` 템플릿을 올바르게 스캔하고 처리하는지 확인

### 준비 사항

#### 3.1 테스트 프로젝트 설정

```bash
# 테스트용 디렉토리 생성
mkdir -p /tmp/pm-test-project
cd /tmp/pm-test-project

# 기획 문서 폴더 생성
mkdir -p anyon-docs/planning

# 샘플 PRD 생성
cat > anyon-docs/planning/prd.md << 'EOF'
# 펫시터 매칭 플랫폼

## 1. 프로젝트 개요
펫 소유자와 펫시터를 연결하는 모바일 앱

## 2. 주요 기능
- 사용자 인증 (전화번호 SMS)
- 펫시터 검색 및 예약
- 실시간 알림

## 3. 비즈니스 로직
- 예약 24시간 전 취소 가능
- 펫시터 평점 3.5 이상만 노출
EOF

# 샘플 TRD 생성
cat > anyon-docs/planning/trd.md << 'EOF'
# 기술 요구사항 문서

## 기술 스택
- **Language**: TypeScript
- **Framework**: Next.js 14
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Test Runner**: Vitest
- **Package Manager**: bun
EOF

# 샘플 Architecture 생성
cat > anyon-docs/planning/architecture.md << 'EOF'
# 아키텍처 문서

## API 응답 형식
{ success: boolean, data?: T, error?: string }

## 폴더 구조
/app/api/

## 에러 핸들링
try-catch + Result type
EOF
```

#### 3.2 템플릿 복사

```bash
# .anyon/agents 복사 (실제 앱에서는 자동)
cp -r /Users/cosmos/12.24/anyon-claude/.anyon .
```

### 실행 테스트

#### 3.3 Claude Code로 pm-orchestrator 실행

```bash
# Claude Code 세션 시작
cd /tmp/pm-test-project
claude

# pm-orchestrator 워크플로우 실행
# (Claude Code 프롬프트에서 실행)
```

**프롬프트:**
```
/Users/cosmos/12.24/anyon-claude/src/constants/workflows/development/pm-orchestrator.ts 워크플로우를 실행해줘
```

#### 3.4 Step 0b 검증

**확인 사항:**
1. `.anyon/agents/` 스캔 성공
2. TRD에서 변수 추출:
   - `tech_stack.language: "TypeScript"`
   - `tech_stack.framework: "Next.js 14"`
   - `tech_stack.database: "PostgreSQL"`
3. Architecture에서 변수 추출:
   - `conventions.api_response_format: "{ success, data, error }"`
4. PRD에서 도메인 지식 추출:
   - `["펫시터 매칭", "예약 시스템", "실시간 알림"]`

#### 3.5 템플릿 주입 확인

```bash
# 생성된 커스터마이징 템플릿 확인
cat .claude/agents/backend-developer.md

# 확인 사항:
# ✅ HTML 주석이 실제 값으로 치환됨
# ✅ 프로젝트 기술 스택 섹션:
#    - **Language**: TypeScript
#    - **Framework**: Next.js 14
#    - **Database**: PostgreSQL
# ✅ 프로젝트 컨벤션 섹션:
#    - **API 응답 형식**: { success, data, error }
```

### 성공 기준
- ✅ `.anyon/agents/` 스캔 성공
- ✅ 변수 추출 성공 (로그 확인)
- ✅ `.claude/agents/`에 커스터마이징된 파일 생성
- ✅ 플레이스홀더가 실제 값으로 치환

---

## 4. 병렬 실행 검증

### 목표
pm-orchestrator가 병렬 실행 가능한 티켓을 올바르게 식별하고 구조화하는지 확인

### 테스트 절차

#### 4.1 티켓 생성 확인

```bash
# Epic 파일 확인
cat anyon-docs/dev-plan/epics/epic-001-인증시스템.md

# 병렬 실행 구조 확인
# 예상 티켓 구조:
```

```yaml
## TICKET-004: Auth API

assigned_agents:
  primary:
    agent: "Backend Developer"
    responsibility: "인증 API 구현"
    outputs: ["backend/src/routes/auth.ts"]

  parallel:
    - agent: "Frontend Developer"
      responsibility: "로그인 UI 구현"
      outputs: ["mobile/src/screens/LoginScreen.tsx"]
      depends_on_primary: false

parallel_execution:
  enabled: true
  mode: "independent"
```

#### 4.2 Wave 병렬 그룹 확인

```bash
# execution-plan.md 확인
cat anyon-docs/dev-plan/execution-plan.md

# Wave 섹션에서 병렬 그룹 찾기
# 예상 구조:
```

```markdown
### Wave 2: 인증 시스템

**Group A - Backend (독립 실행)**
- TICKET-004: Auth API [Backend Developer]
- TICKET-007: Product API [Backend Developer]

**Group B - Frontend (독립 실행)**
- TICKET-005: Login UI [Frontend Developer]
- TICKET-008: Product List UI [Frontend Developer]

**병렬 실행 가능**: Group A와 Group B는 서로 다른 파일/영역 작업
**예상 소요**: 6-8시간 (순차 실행 시 12-16시간)
```

### 성공 기준
- ✅ primary/parallel agents 구조로 티켓 생성
- ✅ `parallel_execution.enabled: true` 설정
- ✅ Wave에 병렬 그룹 정보 포함
- ✅ 예상 소요 시간 계산 포함

---

## 5. 통합 테스트

### 목표
전체 워크플로우 (pm-orchestrator → pm-executor) 통합 검증

### 테스트 절차

#### 5.1 pm-executor 실행

```bash
# pm-executor로 Wave 1 실행
# (Claude Code 프롬프트에서 실행)
```

**프롬프트:**
```
/Users/cosmos/12.24/anyon-claude/src/constants/workflows/development/pm-executor.ts 워크플로우를 실행해줘. Wave 1부터 시작.
```

#### 5.2 병렬 Task 호출 확인

**Claude Code 실행 로그에서 확인:**
```xml
<!-- 병렬 실행 예시 -->
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="prompt">
    에이전트: Backend Developer
    티켓: TICKET-004
    ...
  </parameter>
</invoke>

<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="prompt">
    에이전트: Frontend Developer
    티켓: TICKET-005
    ...
  </parameter>
</invoke>
```

#### 5.3 파일 충돌 검증

```bash
# 병렬 실행된 티켓들의 outputs 확인
# TICKET-004 outputs: ["backend/src/routes/auth.ts"]
# TICKET-005 outputs: ["mobile/src/screens/LoginScreen.tsx"]

# 중복 없음 → 병렬 실행 성공
```

### 성공 기준
- ✅ pm-executor가 병렬 가능 티켓 감지
- ✅ 단일 메시지에서 복수 Task 호출
- ✅ 각 에이전트가 독립적으로 작업 완료
- ✅ 파일 충돌 없음

---

## 🐛 트러블슈팅

### 문제 1: 템플릿 복사 실패

**증상:**
```
Error: Template source not found: /path/to/.anyon
```

**해결:**
1. 개발 모드에서 프로젝트 루트 경로 확인
2. `.anyon/agents/` 폴더 존재 확인
3. Rust 로그에서 `template_source` 경로 확인

### 문제 2: 템플릿 주입 실패

**증상:**
플레이스홀더가 치환되지 않음

**해결:**
1. TRD/Architecture/PRD 파일 존재 확인
2. pm-orchestrator Step 0b 로그 확인
3. 변수 추출 로직 디버깅

### 문제 3: 병렬 실행 안 됨

**증상:**
순차 실행으로 처리됨

**해결:**
1. `parallel_execution.enabled: true` 확인
2. `depends_on_primary: false` 확인
3. outputs 필드 중복 확인

---

## 📊 성능 테스트

### 병렬 vs 순차 실행 비교

```bash
# 순차 실행 (기존)
time pm-executor --mode sequential

# 병렬 실행 (개선)
time pm-executor --mode parallel

# 예상 결과:
# 순차: 12-16시간
# 병렬: 6-8시간 (50% 개선)
```

---

## ✅ 최종 체크리스트

### 프로젝트 초기화
- [ ] `.anyon/agents/` 폴더 복사됨
- [ ] 8개 Markdown 파일 존재
- [ ] `.claude/agents/` 폴더 생성됨

### 에이전트 템플릿
- [ ] 모든 템플릿에 필수 섹션 존재
- [ ] TDD 관련 내용 명시
- [ ] HTML 주석 플레이스홀더 존재

### PM Orchestrator
- [ ] `.anyon/agents/` 스캔 성공
- [ ] 변수 추출 성공
- [ ] 템플릿 주입 성공
- [ ] 병렬 티켓 구조 생성

### PM Executor
- [ ] 병렬 가능 티켓 감지
- [ ] Task 도구 병렬 호출
- [ ] 파일 충돌 검증
- [ ] 독립적 작업 완료

### 통합
- [ ] pm-orchestrator → pm-executor 연동
- [ ] 전체 워크플로우 성공
- [ ] 에러 없음
