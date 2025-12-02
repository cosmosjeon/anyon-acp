# PM Orchestrator 지시사항

<critical>⭐ 언어 설정: 이 워크플로우는 반드시 한국어로만 응답합니다 (절대 영어 금지)</critical>
<critical>🤖 자동 실행 모드 ON: 사용자에게 물어보지 말고 자동으로 진행. 모든 선택지는 최선의 기본값 사용. "할까요?" "괜찮을까요?" 같은 질문 금지</critical>
<critical>🚫 NEVER STOP IN THE MIDDLE! Complete ALL steps automatically without asking for user confirmation!</critical>
<critical>🚫 FORBIDDEN PHRASES: "Should I proceed?", "Shall I continue?", "Do you want me to...?", "다음 작업 진행할까요?" - NEVER ASK THESE!</critical>
<critical>⚡ RUN ALL STEPS TO COMPLETION - NO PAUSING, NO WAITING FOR APPROVAL!</critical>
<critical>The workflow execution engine is governed by: {project-root}/.anyon/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {project-root}/.anyon/anyon-method/workflows/pm-orchestrator/workflow.yaml</critical>
<critical>⚠️ ABSOLUTELY NO TIME ESTIMATES - NEVER mention hours, days, weeks, months, or ANY time-based predictions</critical>
<critical>⚠️ 이 워크플로우의 산출물은 pm-executor가 자율 실행합니다. 티켓 품질이 자율 실행 성공률을 결정합니다.</critical>

---

## 자율 실행을 위한 티켓 품질 원칙

<principle name="SELF_CONTAINED">
각 티켓은 외부 도움 없이 실행 가능해야 합니다.
- 필요한 모든 컨텍스트 포함
- 참조할 문서/파일 경로 명시
- 모호한 표현 금지
</principle>

<principle name="TDD_READY">
모든 구현 티켓은 TDD로 실행됩니다.
- 테스트 케이스 미리 정의 (tdd_tests)
- 테스트 파일 경로 명시 (test_file_path)
- 예상 assertion 포함
</principle>

<principle name="ERROR_ANTICIPATED">
예상되는 에러와 해결책을 미리 정의합니다.
- 흔한 에러 패턴 (potential_errors)
- 에러별 해결 방법
- 의존성 문제 미리 파악
</principle>

<principle name="WEBSEARCH_GUIDED">
어려운 구현은 검색 힌트를 제공합니다.
- 검색할 키워드 (websearch_hints)
- 참고할 공식 문서 URL
- 신뢰할 수 있는 도메인 목록
</principle>

---

<step n="0" goal="설계 문서 로딩">
<invoke-protocol name="discover_inputs" />

<critical>6개 문서 모두 필수 - 하나라도 없으면 중단</critical>

<action>필수 문서 검증:
  1. PRD - 제품 요구사항, 비즈니스 로직
  2. UX Design - 사용자 플로우, 페이지 구조
  3. UI Design Guide - 디자인 스펙, 컴포넌트
  4. ERD - 데이터베이스 구조
  5. Architecture - 시스템 아키텍처, 백엔드 아키텍처, 프론트엔드 아키텍처
  6. TRD - 기술 스택, 기술 요구사항, 성능 지표
</action>

<check if="any document missing">
  <action>누락된 문서 목록 출력</action>
  <action>⚠️ 주의: 일부 문서가 누락되었지만, 워크플로우를 계속 진행합니다</action>
  <action>누락된 문서는 자동으로 스킵되고, 수동으로 추가 후 재실행 가능</action>
</check>

<action>로딩된 문서 요약 출력:
```
📂 설계 문서 로딩 완료 (6/6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ PRD: {prd_content 요약 - 주요 기능 수}
✓ UX Design: {ux_content 요약 - 페이지 수, 플로우 수}
✓ UI Design: {ui_content 요약 - 컴포넌트 수}
✓ ERD: {erd_content 요약 - 테이블 수, 관계 수}
✓ Architecture: {architecture_content 요약 - 기술 스택}
✓ TRD: {trd_content 요약 - 성능/보안 요구사항}
```
</action>
</step>

<step n="0b" goal="프로젝트 커스텀 에이전트 동적 생성 (문서 기반)">

<critical>⚠️ 에이전트 템플릿 자동 인식 + 동적 생성! 문서를 분석해서 필요한 에이전트를 스스로 파악</critical>

<action>🔴 **에이전트 템플릿 경로 확인 (자동 인식)**:

경로: {project-root}/.anyon/anyon-method/agent-templates/

자동 감지 프로세스:
1️⃣ 해당 경로의 YAML 파일 목록 스캔
2️⃣ 각 파일명으로 에이전트 이름 추출
   - backend-developer.yaml → backend-developer
   - frontend-developer.yaml → frontend-developer
   - 등등...
3️⃣ 각 YAML 파일의 내용 분석
   - 에이전트 설명, 역할, 전문 분야 파악
4️⃣ 자동으로 로드하여 템플릿 적용

**결과:**
```
✅ 템플릿 자동 감지 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
발견된 템플릿:
  • backend-developer.yaml
  • database-architect.yaml
  • devops-engineer.yaml
  • frontend-developer.yaml
  • integration-engineer.yaml
  • qa-engineer.yaml
  • scaffolding-engineer.yaml
  • security-auditor.yaml

총 8개 기본 템플릿 로드됨
```
</action>

<action>🔴 **문서 심층 분석 - 필요한 에이전트 동적 파악**:

이미 로드된 6개 설계 문서(PRD, UX, UI, ERD, Architecture, TRD)를 깊이 있게 분석해서
프로젝트에 실제로 필요한 에이전트를 파악합니다.

**Step 1: TRD 분석 (기술 스택 기반)**
```yaml
기술 스택 스캔:
  언어/프레임워크:
    - "TypeScript" → 타입스크립트 전문 에이전트 필요?
    - "Next.js" → SSR/API 경험 필요
    - "React Native" → 모바일 특화 필요
  
  데이터베이스:
    - "PostgreSQL" → DB 복잡도 높음
    - "MongoDB" → NoSQL 특화 필요?
  
  외부 서비스:
    - "Twilio" → SMS/전화 전문
    - "Stripe" → 결제 전문
    - "AWS S3" → 파일/미디어 전문
    - "Firebase" → 실시간/클라우드 전문
    - "Auth0" → 인증 전문
  
  인프라/배포:
    - "Docker" → 컨테이너 엔지니어
    - "Kubernetes" → 오케스트레이션 엔지니어
    - "GitHub Actions" → CI/CD 자동화
    - "Vercel" → 엣지 컴퓨팅 특화
  
  특수 기술:
    - "WebSocket" → 실시간 엔지니어
    - "GraphQL" → GraphQL 전문가
    - "Redis" → 캐싱 & 세션 전문
    - "ElasticSearch" → 검색 엔지니어
    - "Kafka" → 메시지 큐 엔지니어
```

**Step 2: Architecture 분석 (설계 패턴 기반)**
```yaml
아키텍처 패턴 스캔:
  마이크로서비스 여부:
    - "마이크로서비스" → 서비스 메시 엔지니어
    - "모놀리식" → 단일 아키텍처 엔지니어
  
  캐싱 전략:
    - "Redis 캐싱" → 캐싱 전문가
    - "CDN" → CDN 최적화 전문가
  
  검색 기능:
    - "ElasticSearch" → 검색 엔지니어
    - "Algolia" → 검색 최적화 전문가
  
  실시간 기능:
    - "WebSocket" → 실시간 엔지니어
    - "Server-Sent Events" → 스트리밍 엔지니어
  
  보안 아키텍처:
    - "OAuth 2.0" → OAuth 전문가
    - "JWT + Refresh Token" → 인증 아키텍처 전문가
    - "API Gateway" → API 보안 전문가
  
  성능 최적화:
    - "Code Splitting" → 번들 최적화 전문가
    - "이미지 최적화" → 이미지 전문가
    - "Database Indexing" → DB 성능 전문가
```

**Step 3: PRD 분석 (기능 요구사항 기반)**
```yaml
기능별 에이전트 파악:
  인증/권한:
    - "소셜 로그인" → 소셜 인증 전문가
    - "2FA/MFA" → 멀티팩터 인증 전문가
    - "역할 기반 접근" → RBAC 전문가
  
  파일/미디어:
    - "파일 업로드" → 파일 업로드 전문가
    - "이미지 처리" → 이미지 처리 전문가
    - "비디오 스트리밍" → 비디오 전문가
  
  결제/결제:
    - "결제 시스템" → 결제 전문가
    - "구독 관리" → 구독 전문가
    - "환불 처리" → 결제 로직 전문가
  
  통지/메시징:
    - "푸시 알림" → 푸시 알림 전문가
    - "이메일 발송" → 이메일 전문가
    - "SMS/카카오톡" → 메시징 전문가
  
  검색/필터:
    - "고급 검색" → 검색 엔지니어
    - "필터링" → 필터 로직 전문가
  
  분석/통계:
    - "분석 대시보드" → 데이터 분석 전문가
    - "레포팅" → 레포팅 엔지니어
```

**Step 4: UX/UI 분석 (인터페이스 복잡도)**
```yaml
UI 복잡도별:
  "고급 폼 처리":
    - 다단계 폼 → 폼 전문가
    - 동적 필드 → 폼 검증 전문가
  
  "실시간 협업":
    - 동시 편집 → 실시간 에디터 전문가
    - 채팅 → 채팅 엔지니어
  
  "복잡한 상태 관리":
    - 깊은 상태 구조 → 상태 관리 전문가
    - Undo/Redo → 상태 머신 전문가
  
  "성능 최적화 필요":
    - 가상화 → 성능 최적화 전문가
    - 무한 스크롤 → 메모리 효율 전문가
```

**Step 5: ERD 분석 (데이터 복잡도)**
```yaml
데이터 복잡도별:
  "복잡한 관계":
    - M:N 관계 다수 → 데이터 모델 설계 전문가
    - 다중 조인 쿼리 → DB 성능 최적화 전문가
  
  "대규모 데이터":
    - 100만 행 이상 → 데이터베이스 샤딩 전문가
    - 시계열 데이터 → 시계열 DB 전문가
```

결과적으로, 위의 분석을 종합하여 **프로젝트 특화 에이전트** 목록을 동적으로 생성합니다.
</action>

<action>🟢 **기본 8개 에이전트 + 동적 생성된 특화 에이전트**:

**기본 에이전트 (항상 생성 - 템플릿 기반):**
1. scaffolding-engineer - 프로젝트 초기 구조 생성
2. backend-developer - API, 비즈니스 로직
3. frontend-developer - UI, 사용자 인터페이스
4. database-architect - DB 스키마, 마이그레이션
5. integration-engineer - 외부 서비스 연동
6. devops-engineer - CI/CD, 인프라
7. qa-engineer - 테스트, 품질 검증
8. security-auditor - 보안, 취약점 분석

**동적 생성 에이전트 (문서 분석 기반 - 파일이 없으면 생성):**

### 인증/권한 관련
- auth-engineer.md
  - 언제: "OAuth", "JWT", "인증", "2FA", "권한" 감지 시
  - 역할: 인증 시스템, 권한 관리, 세션 처리
  - 기술: OAuth 2.0, JWT, Passport.js, Auth0, Firebase Auth
  
- social-auth-engineer.md
  - 언제: "구글 로그인", "네이버", "카카오", "깃허브" 감지 시
  - 역할: 소셜 로그인 통합
  - 기술: OAuth 프로바이더 연동

### 실시간 기능
- realtime-engineer.md
  - 언제: "WebSocket", "Socket.io", "실시간", "채팅" 감지 시
  - 역할: 실시간 통신, 라이브 업데이트
  - 기술: WebSocket, Socket.io, Server-Sent Events, Pusher

### 파일/미디어 처리
- media-engineer.md
  - 언제: "파일 업로드", "S3", "CDN", "이미지", "비디오" 감지 시
  - 역할: 파일 업로드, 미디어 처리, 이미지 최적화
  - 기술: AWS S3, Cloudinary, Sharp, FFmpeg

- image-optimization-engineer.md
  - 언제: "이미지 최적화", "WebP", "Responsive Image" 감지 시
  - 역할: 이미지 성능 최적화
  - 기술: Next.js Image, WebP 변환, 이미지 압축

### 결제 시스템
- payment-engineer.md
  - 언제: "결제", "Stripe", "PG", "결제 게이트웨이" 감지 시
  - 역할: 결제 통합, 결제 처리
  - 기술: Stripe, Toss Payments, 카카오페이, 구독 관리

### 메시징/알림
- messaging-engineer.md
  - 언제: "이메일", "SMS", "알림", "Twilio" 감지 시
  - 역할: 메시징 시스템, 알림 발송
  - 기술: Twilio, SendGrid, Firebase Cloud Messaging, FCM

- notification-engineer.md
  - 언제: "푸시 알림", "FCM", "APNs" 감지 시
  - 역할: 푸시 알림 시스템
  - 기술: Firebase Cloud Messaging, APNs, Web Push API

### 검색 및 필터
- search-engineer.md
  - 언제: "검색", "ElasticSearch", "Algolia" 감지 시
  - 역할: 검색 기능, 전문 검색 엔진
  - 기술: ElasticSearch, Algolia, Meilisearch

### 데이터 캐싱 & 성능
- caching-engineer.md
  - 언제: "Redis", "캐싱", "session" 감지 시
  - 역할: 캐싱 전략, 세션 관리
  - 기술: Redis, Memcached, 캐시 무효화 전략

- performance-engineer.md
  - 언제: "성능", "최적화", "번들 크기" 감지 시
  - 역할: 성능 최적화, 로딩 속도 개선
  - 기술: 코드 스플리팅, Lazy Loading, 번들 최적화

### 데이터베이스 특화
- advanced-database-engineer.md
  - 언제: "복잡한 쿼리", "성능", "인덱싱", "N+1" 감지 시
  - 역할: DB 성능 최적화, 고급 쿼리 작성
  - 기술: 쿼리 최적화, 인덱싱, 실행 계획 분석

- timeseries-engineer.md
  - 언제: "시계열", "InfluxDB", "시간별 데이터" 감지 시
  - 역할: 시계열 데이터 처리
  - 기술: InfluxDB, TimescaleDB, Prometheus

### 폼 처리
- form-engineer.md
  - 언제: "복잡한 폼", "다단계", "검증", "React Hook Form" 감지 시
  - 역할: 폼 처리, 검증, 에러 핸들링
  - 기술: React Hook Form, Formik, Zod, Yup

### 상태 관리
- state-management-engineer.md
  - 언제: "복잡한 상태", "Redux", "Zustand", "Context" 감지 시
  - 역할: 상태 관리 아키텍처
  - 기술: Redux, Zustand, Recoil, Jotai

### 위치/지도
- location-engineer.md
  - 언제: "GPS", "지도", "Google Maps", "좌표" 감지 시
  - 역할: 위치 기반 기능, 지도 통합
  - 기술: Google Maps API, MapBox, 좌표 계산

### 분석/대시보드
- analytics-engineer.md
  - 언제: "분석", "대시보드", "리포팅", "Mixpanel" 감지 시
  - 역할: 분석 시스템, 데이터 시각화
  - 기술: 분석 도구 연동, 데이터 시각화

### 모바일 특화
- mobile-specialist-engineer.md
  - 언제: React Native, iOS/Android 네이티브 기능 감지 시
  - 역할: 모바일 플랫폼 최적화
  - 기술: React Native, Expo, Native Modules

### 고급 CI/CD
- platform-engineer.md
  - 언제: "Kubernetes", "Docker Compose", "Infrastructure as Code" 감지 시
  - 역할: 플랫폼 엔지니어링, 인프라 자동화
  - 기술: Kubernetes, Terraform, ArgoCD

### 모니터링/로깅
- observability-engineer.md
  - 언제: "모니터링", "로깅", "Datadog", "New Relic" 감지 시
  - 역할: 모니터링, 로깅, 성능 분석
  - 기술: Datadog, ELK Stack, 분산 추적

### GraphQL 특화
- graphql-engineer.md
  - 언제: "GraphQL", "Apollo", "Relay" 감지 시
  - 역할: GraphQL API 설계 및 구현
  - 기술: Apollo Server, GraphQL, Schema Design
</action>

<action>🔵 **에이전트 자동 생성 프로세스**:

문서 분석이 완료되면:

1️⃣ 기본 8개 에이전트 템플릿 로드
   - {project-root}/.anyon/anyon-method/agent-templates/*.yaml에서 로드

2️⃣ 필요한 특화 에이전트 결정
   - 문서 분석 결과와 위의 조건 비교
   - 필요한 에이전트 목록 생성

3️⃣ 각 에이전트별로:
   - {project-root}/.claude/agents/{{agent-name}}.md 파일 존재 여부 확인
   - 없으면 자동 생성
   - 있으면 기존 파일 유지 (덮어쓰지 않음)

4️⃣ 에이전트 파일 생성 형식:
   ```markdown
   ---
   name: {{에이전트명}}
   description: "{{설명}}"
   tools: Read, Write, Edit, Bash, Glob, Grep
   model: sonnet
   ---

   # {{에이전트명}} 에이전트

   ## 역할
   {{역할 설명}}

   ## 전문 분야
   {{기술 스택}}

   ## 주요 책임
   {{프로젝트 문서에서 추출한 구체적 책임}}

   {{프로젝트 기술 스택, 컨벤션, 도메인 지식 포함}}
   ```

5️⃣ 생성 완료 시 요약 출력
</action>

<action>결과 출력 예시:
```
🤖 프로젝트 커스텀 에이전트 동적 생성 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 기본 에이전트 (8개 - 템플릿 기반 로드):
  ✓ scaffolding-engineer.md
  ✓ backend-developer.md
  ✓ frontend-developer.md
  ✓ database-architect.md
  ✓ integration-engineer.md
  ✓ devops-engineer.md
  ✓ qa-engineer.md
  ✓ security-auditor.md

🎯 문서 분석 기반 동적 생성 에이전트 (15개):
  ✓ auth-engineer.md - JWT, OAuth 인증 전문
  ✓ realtime-engineer.md - WebSocket, 실시간 통신
  ✓ media-engineer.md - 파일/미디어 처리
  ✓ payment-engineer.md - Stripe, 결제 시스템
  ✓ messaging-engineer.md - 이메일, SMS 통지
  ✓ notification-engineer.md - 푸시 알림 (FCM)
  ✓ search-engineer.md - ElasticSearch, 검색 기능
  ✓ caching-engineer.md - Redis 캐싱, 세션
  ✓ performance-engineer.md - 성능 최적화
  ✓ advanced-database-engineer.md - DB 성능 튜닝
  ✓ form-engineer.md - 복잡한 폼 처리
  ✓ state-management-engineer.md - 상태 관리 아키텍처
  ✓ location-engineer.md - 지도, GPS 기능
  ✓ analytics-engineer.md - 분석 및 대시보드
  ✓ mobile-specialist-engineer.md - React Native 최적화

📊 요약:
  • 총 에이전트: 23개 (기본 8개 + 특화 15개)
  • 기술 영역: 인증, 실시간, 미디어, 결제, 메시징, 검색, 캐싱, 성능 등
  • 생성 위치: .claude/agents/

📁 각 에이전트는:
  • 프로젝트 기술 스택 포함
  • 아키텍처 컨벤션 포함
  • 도메인 지식 포함
  • 즉시 사용 가능한 상태
```
</action>

</step>

<step n="1" goal="프로젝트 분석 및 규모 산정">

<action>PRD에서 추출:
  - 프로젝트 이름과 핵심 목적
  - 주요 기능 목록 (Feature List)
  - 비즈니스 로직 요구사항
  - 사용자 유형 (역할)
</action>

<action>Architecture에서 추출:
  - 시스템 아키텍처 (전체 구조, 레이어 구성)
  - 백엔드 아키텍처 (API 구조, 서비스 레이어, 미들웨어)
  - 프론트엔드 아키텍처 (상태 관리, 라우팅, 컴포넌트 구조)
  - 외부 서비스 연동 목록 (OAuth, 결제, 이메일 등)
  - 배포 환경
</action>

<action>ERD에서 추출:
  - 테이블/엔티티 목록
  - 주요 관계 (1:N, M:N 등)
  - 핵심 필드들
</action>

<action>UX Design에서 추출:
  - 페이지/화면 목록
  - 사용자 플로우
  - 주요 인터랙션
  - 네비게이션 구조
</action>

<action>UI Design Guide에서 추출:
  - 디자인 시스템 (색상, 타이포그래피)
  - 컴포넌트 목록
  - 레이아웃 패턴
  - 반응형 브레이크포인트
</action>

<action>TRD에서 추출:
  - 기술 스택 (프레임워크, 언어, DB, 인프라)
  - 성능 요구사항 (응답 시간, 처리량)
  - 보안 요구사항 (인증, 권한, 암호화)
  - 확장성 요구사항
  - 모니터링/로깅 요구사항
</action>

<action>프로젝트 규모 산정:

**Small** (티켓 5-10개):
  - 페이지 1-3개
  - API 엔드포인트 1-5개
  - DB 테이블 1-3개
  - 외부 연동 0-1개

**Medium** (티켓 10-20개):
  - 페이지 4-8개
  - API 엔드포인트 6-15개
  - DB 테이블 4-8개
  - 외부 연동 1-3개

**Large** (티켓 20-30개):
  - 페이지 9개 이상
  - API 엔드포인트 16개 이상
  - DB 테이블 9개 이상
  - 외부 연동 4개 이상
</action>

<action>분석 결과 출력:
```
📊 프로젝트 분석 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로젝트: {{project_name}}
규모: {{project_size}} (Small/Medium/Large)

📈 규모 지표:
  • 페이지 수: X개
  • API 엔드포인트: X개
  • DB 테이블: X개
  • 외부 연동: X개

🔧 기술 스택:
  • Frontend: {{frontend_stack}}
  • Backend: {{backend_stack}}
  • Database: {{database}}
  • 배포: {{deployment}}

🔗 외부 서비스:
  {{external_services 목록}}
```
</action>

<template-output-autoupdate>자동 저장됨 (사용자 승인 요청 없음)</template-output-autoupdate>
</step>

<step n="2" goal="Epic 식별">

<action>PRD의 기능 요구사항을 기반으로 Epic 분류:

Epic 분류 기준:
1. **인증/사용자 관리** - 로그인, 회원가입, 프로필, 권한
2. **핵심 도메인 기능** - PRD의 주요 기능들 (예: 프로젝트 관리, 상품 관리)
3. **협업/소셜 기능** - 팀, 초대, 공유, 알림
4. **관리자 기능** - 대시보드, 통계, 설정
5. **인프라** - 프로젝트 설정, CI/CD, 모니터링
6. **품질 보증** - 테스트, 보안, 성능
</action>

<action>각 Epic에 비중(%) 할당:
- 전체 작업량 대비 각 Epic의 비중 추정
- 비중 합계 = 100%
</action>

<action>Epic 목록 출력:
```
🎯 Epic 식별 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. {{epic_1_name}} ({{비중}}%)
   - 포함 기능: {{기능들}}

2. {{epic_2_name}} ({{비중}}%)
   - 포함 기능: {{기능들}}

... (3-6개 Epic)
```
</action>

<template-output-autoupdate>자동 저장됨 (사용자 승인 요청 없음)</template-output-autoupdate>
</step>

<step n="3" goal="티켓 생성">

<critical>⚠️ TDD 필수: 모든 구현 티켓은 TDD 개발 플로우를 포함해야 합니다</critical>

<action>티켓 생성 규칙 적용:

**1. 인프라 티켓 (항상 생성)**
- TICKET-001: 프로젝트 스캐폴딩
- TICKET-XXX: CI/CD 파이프라인 설정

**2. 데이터베이스 티켓 (ERD 기반)**
- 각 엔티티 그룹별로 스키마 티켓 생성
- 복잡한 관계가 있으면 별도 마이그레이션 티켓

**3. API 티켓 (PRD + Architecture 기반)**
- CRUD 그룹 단위로 티켓 생성
- 인증이 필요한 API는 인증 티켓 이후로 배치

**4. UI 티켓 (UX + UI 기반)**
- 페이지 단위 또는 기능 단위로 티켓 생성
- 공통 컴포넌트는 별도 티켓

**5. 통합 티켓 (외부 서비스별)**
- OAuth, 결제, 이메일 등 외부 연동별 티켓

**6. 품질 티켓 (TRD 기반)**
- 테스트 작성
- 보안 감사
- 성능 최적화
</action>

<action>TDD 개발 플로우 적용 (모든 구현 티켓):

**RED (테스트 먼저 작성)**:
- 정상 케이스 테스트 정의
- 엣지 케이스 테스트 정의
- 에러 케이스 테스트 정의
- 테스트 파일 경로 명시 (예: tests/unit/{{feature}}.test.ts)

**GREEN (최소 구현)**:
- 테스트를 통과하는 최소한의 코드 작성
- 모든 테스트 통과 확인

**REFACTOR (코드 개선)**:
- 중복 제거
- 네이밍 개선
- 코드 구조 정리
- 테스트 여전히 통과 확인
</action>

<action>티켓별 TDD 가이드라인:

**Database 티켓**:
- 스키마/모델 생성 테스트
- CRUD 연산 테스트
- 제약 조건 테스트

**API 티켓**:
- 엔드포인트 응답 테스트
- 입력 검증 테스트
- 인증/인가 테스트

**UI 티켓**:
- 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트
- 상태 변화 테스트

**Integration 티켓**:
- 모킹된 외부 서비스 테스트
- 에러/타임아웃 처리 테스트
- 재시도 로직 테스트
</action>

<action>각 티켓에 대해 {ticket_template} 형식으로 생성 (상세하고 자율 실행 가능한 수준):

**필수 구성 요소:**
- ticket_id, title, epic, type, priority, description
- assigned_agents, input_documents, acceptance_criteria, output_artifacts

**자율 실행을 위한 상세 필드 (TDD + 구체적 명세):**

```yaml
# ============================================================
# 1. 기본 정보
# ============================================================
difficulty: easy | medium | hard
estimated_files: 3  # 예상 파일 수
wave: 1  # 실행 순서

# ============================================================
# 2. API 명세 (API 티켓만 - 매우 구체적!)
# ============================================================
api_specification:
  endpoint:
    path: "/api/auth/send-code"
    method: "POST"
    authentication: "None (공개)"
    rate_limiting: "1분 3회 제한"
  
  request:
    content_type: "application/json"
    body:
      - field: "phone"
        type: "string"
        required: true
        validation: "/^01[0-9]{8,9}$/"
        description: "사용자 전화번호 (11자)"
  
  response_success:
    status: 200
    body:
      success: true
      data:
        expiresIn: 300  # 초 단위
        codeLength: 6
  
  response_errors:
    - status: 400
      code: "INVALID_PHONE"
      message: "유효한 전화번호를 입력하세요"
    - status: 429
      code: "RATE_LIMIT_EXCEEDED"
      message: "1분 내 요청이 너무 많습니다"
    - status: 500
      code: "SMS_SEND_FAILED"
      message: "SMS 발송 실패"
  
  side_effects:
    - "SMS 발송 (Twilio API)"
    - "AuthCode DB 저장 (phone, code, expiresAt)"
    - "만료 시간: 현재 + 5분"

# ============================================================
# 3. 데이터베이스 스키마 (Database 티켓)
# ============================================================
database_schema:
  models:
    - name: "User"
      fields:
        - "id: String @id @default(cuid())"
        - "phone: String @unique"
        - "nickname: String?"
        - "createdAt: DateTime @default(now())"
        - "updatedAt: DateTime @updatedAt"
      relationships:
        - "authCodes: AuthCode[]"
        - "authTokens: AuthToken[]"
      indexes:
        - "@@index([phone])"
    
    - name: "AuthCode"
      fields:
        - "id: String @id @default(cuid())"
        - "phone: String  # User.phone 과 일치"
        - "code: String  # 6자리 숫자"
        - "attempts: Int @default(0)"
        - "expiresAt: DateTime"
        - "createdAt: DateTime @default(now())"
      indexes:
        - "@@index([phone])"
        - "@@index([expiresAt])  # 만료된 코드 정리용"
  
  migration:
    name: "20240115_add_auth_models"
    description: "인증 시스템 필수 모델 추가"

# ============================================================
# 4. 파일 구조 (정확한 경로)
# ============================================================
file_structure:
  backend:
    - "src/routes/auth.ts  # 라우트 정의"
    - "src/controllers/authController.ts  # HTTP 요청 처리"
    - "src/services/authService.ts  # 비즈니스 로직"
    - "src/repositories/authRepository.ts  # DB 조작 (Prisma)"
    - "src/utils/validators.ts  # 입력값 검증"
    - "src/utils/codeGenerator.ts  # 6자리 코드 생성"
    - "src/middleware/authMiddleware.ts  # JWT 검증"
    - "src/config/authConfig.ts  # 설정 상수"
    - "src/types/auth.ts  # 타입 정의"
    - "src/routes/__tests__/auth.test.ts  # TDD 테스트"
  
  frontend:
    - "src/screens/LoginScreen.tsx"
    - "src/screens/__tests__/LoginScreen.test.tsx"
    - "src/hooks/useTimer.ts"

# ============================================================
# 5. 비즈니스 로직 (Pseudocode)
# ============================================================
business_logic:
  POST_send_code:
    - "1. phone 필드 추출 및 검증"
    - "2. 정규식 검증: /^01[0-9]{8,9}$/"
    - "3. Redis에서 rate limiting 확인 (1분 3회)"
    - "4. 기존 코드 정리 (expiresAt < now())"
    - "5. 6자리 숫자 코드 생성"
    - "6. AuthCode.create({ phone, code, expiresAt: now()+5min })"
    - "7. Twilio로 SMS 발송"
    - "8. 응답 반환: { success: true, data: { expiresIn, codeLength } }"
  
  POST_verify:
    - "1. phone, code 필드 추출"
    - "2. AuthCode 조회 및 검증"
    - "3. attempts 업데이트 (attempts >= 5 → 403 반환)"
    - "4. 만료 시간 확인 (expiresAt < now() → 401 반환)"
    - "5. User 조회 또는 생성"
    - "6. JWT 토큰 생성 (expiresIn: 30d)"
    - "7. AuthToken DB 저장 (선택)"
    - "8. AuthCode 삭제"
    - "9. 응답: { success, data: { token, user } }"

# ============================================================
# 6. UI 명세 (Frontend 티켓 - Component Tree)
# ============================================================
ui_specification:
  component_tree: |
    LoginScreen
    ├── SafeAreaView
    ├── ScrollView
    │   ├── Header
    │   │   ├── Title: "로그인"
    │   │   └── Subtitle: "전화번호로 시작하세요"
    │   ├── {step === 'phone' && (
    │   │   ├── PhoneInput
    │   │   │   ├── placeholder: "01012345678"
    │   │   │   ├── maxLength: 11
    │   │   │   ├── keyboardType: "phone-pad"
    │   │   │   └── borderColor={isValid ? 'blue' : 'red'}
    │   │   ├── SendButton (disabled={!isValid || isLoading})
    │   │   └── ErrorText
    │   │ )}
    │   └── {step === 'code' && (
    │       ├── CodeInput (length: 6, autoFocus: true)
    │       ├── Timer (MM:SS 형식)
    │       ├── ResendButton (cooldown 제한)
    │       └── ErrorText
    │     )}
    └── BottomBar
  
  states:
    - "step: 'phone' | 'code'"
    - "phone: string"
    - "code: string"
    - "isLoading: boolean"
    - "timeRemaining: number (초)"
    - "error: string | null"
    - "attempts: number"
  
  interactions:
    - "phone 입력 시 isPhoneValid 판단"
    - "SendButton 클릭 → API 호출 → step 전환"
    - "code 6자 자동 입력 → 자동 제출"
    - "타이머 카운트다운 (5분)"
    - "ResendButton cooldown 3초"

# ============================================================
# 7. 환경 변수 & 설정
# ============================================================
configuration:
  env_variables:
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db"
    JWT_SECRET: "min-32-characters-key"
    JWT_EXPIRATION: "30d"
    TWILIO_ACCOUNT_SID: "AC..."
    TWILIO_AUTH_TOKEN: "token"
    TWILIO_PHONE_NUMBER: "+821234567890"
    REDIS_URL: "redis://localhost:6379"
    PORT: 3000
    NODE_ENV: "development"
  
  constants:
    CODE_LENGTH: 6
    CODE_EXPIRATION_MINUTES: 5
    SMS_RATE_LIMIT_WINDOW_MS: 60000  # 1분
    SMS_RATE_LIMIT_MAX: 3  # 최대 3회
    CODE_VERIFY_MAX_ATTEMPTS: 5

# ============================================================
# 8. TDD 테스트 (상세하게!)
# ============================================================
tdd_tests:
  api_tests:
    - name: "POST /auth/send-code - 정상 케이스"
      given: "유효한 phone = '01012345678'"
      when: "API 호출"
      then: "200 + success: true 반환"
    
    - name: "POST /auth/send-code - 형식 오류"
      given: "invalid phone = '123'"
      when: "API 호출"
      then: "400 + INVALID_PHONE 반환"
    
    - name: "POST /auth/send-code - Rate limit"
      given: "같은 phone으로 1분 내 4회 요청"
      when: "4번째 API 호출"
      then: "429 + RATE_LIMIT_EXCEEDED 반환"
    
    - name: "POST /auth/verify - 정상 케이스"
      given: "유효한 phone + code"
      when: "API 호출"
      then: "200 + token + user 반환"
    
    - name: "POST /auth/verify - 코드 만료"
      given: "phone + code 하지만 5분 경과"
      when: "API 호출"
      then: "401 + CODE_EXPIRED 반환"
    
    - name: "POST /auth/verify - 5회 실패"
      given: "phone + 잘못된 code 5회 시도"
      when: "6번째 시도"
      then: "403 + TOO_MANY_ATTEMPTS 반환"
  
  ui_tests:
    - name: "LoginScreen 렌더링"
      when: "화면 진입"
      then: "전화번호 입력 필드 표시"
    
    - name: "phone 입력 시 버튼 활성화"
      given: "phone = '01012345678'"
      then: "SendButton disabled={false}"
    
    - name: "SendButton 클릭 → 타이머 시작"
      given: "유효한 phone"
      when: "SendButton 클릭"
      then: "step === 'code' && timeRemaining === 300"
    
    - name: "code 6자 입력 시 자동 제출"
      given: "step === 'code'"
      when: "code 6자 입력"
      then: "자동으로 verify API 호출"
    
    - name: "로그인 성공 → HomeScreen 이동"
      given: "verify API 성공"
      when: "응답 수신"
      then: "navigation.replace('Home')"

test_file_path: "backend/src/routes/__tests__/auth.test.ts"

# ============================================================
# 9. 테스트 데이터 (Mock/Fixtures)
# ============================================================
test_fixtures:
  mock_user:
    id: "user-123"
    phone: "01012345678"
    nickname: "테스트사용자"
  
  mock_auth_code:
    id: "code-123"
    phone: "01012345678"
    code: "123456"
    attempts: 0
    expiresAt: "{{ now() + 5min }}"
  
  mock_jwt: "eyJhbGc..."

# ============================================================
# 10. 예상 에러 & 해결책
# ============================================================
potential_errors:
  - error: "Cannot find module 'twilio'"
    type: import_error
    cause: "Twilio 라이브러리 미설치"
    fix:
      - "npm install twilio"
      - ".env에 Twilio 환경변수 설정"
  
  - error: "JWT secret not found"
    type: config_error
    cause: "JWT_SECRET 환경변수 미설정"
    fix:
      - ".env에 JWT_SECRET 추가 (32자 이상)"
      - "npm run dev 재시작"
  
  - error: "connect ECONNREFUSED 127.0.0.1:5432"
    type: database_error
    cause: "PostgreSQL 미실행"
    fix:
      - "PostgreSQL 서비스 시작"
      - "DATABASE_URL 확인"
  
  - error: "Unique constraint failed on phone"
    type: test_error
    cause: "테스트 데이터 미정리"
    fix:
      - "beforeEach에서 db.user.deleteMany() 실행"

# ============================================================
# 11. WebSearch 힌트 (매우 구체적!)
# ============================================================
websearch_hints:
  categories:
    sms_auth:
      queries:
        - "Node.js Express SMS authentication Twilio 2024"
        - "Twilio SMS API Node.js example"
        - "rate limiting Node.js redis npm"
      domains: ["twilio.com", "nodejs.org"]
      docs:
        - "https://www.twilio.com/docs/sms/quickstart/node"
        - "https://expressjs.com/en/guide/routing.html"
    
    jwt_implementation:
      queries:
        - "JWT token implementation Node.js Express 2024"
        - "jsonwebtoken npm best practices"
      domains: ["jwt.io", "npm.org"]
    
    prisma_orm:
      queries:
        - "Prisma unique constraint phone field"
        - "Prisma migration timestamps"
      domains: ["prisma.io"]
    
    testing:
      queries:
        - "Jest testing Node.js Express API 2024"
        - "supertest API endpoint testing"
      domains: ["jestjs.io"]

# ============================================================
# 12. 검증 명령어
# ============================================================
validation_commands:
  - command: "npm run test -- auth.test.ts"
    expected: "PASS.*All tests passed"
    timeout: 30s
  
  - command: "npm run build"
    expected: "Build completed"
    timeout: 60s
  
  - command: "npm run lint src/routes/auth.ts"
    expected: "No linting errors"
    timeout: 15s
  
  - command: "curl -X POST http://localhost:3000/api/auth/send-code -H 'Content-Type: application/json' -d '{\"phone\": \"01012345678\"}'"
    expected: "200.*success"
    timeout: 10s

# ============================================================
# 13. 의존성 & 선행 조건
# ============================================================
dependencies:
  required_technologies:
    - name: "jsonwebtoken"
      version: "^9.1.0"
      install: "npm install jsonwebtoken"
    - name: "twilio"
      version: "^4.10.0"
      install: "npm install twilio"
    - name: "rate-limiter-flexible"
      version: "^2.4.1"
      install: "npm install rate-limiter-flexible redis"
  
  required_files:
    - "backend/prisma/schema.prisma"
    - "backend/.env"
  
  required_apis: []  # Wave 1 티켓이므로 의존 API 없음

# ============================================================
# 14. 에러 처리 매트릭스
# ============================================================
error_matrix:
  - status: 400
    code: "INVALID_PHONE"
    user_message: "유효한 전화번호를 입력하세요 (예: 01012345678)"
    action: "사용자 재입력 요청"
  
  - status: 401
    code: "INVALID_CODE"
    user_message: "잘못된 인증 코드입니다"
    action: "attempts +1, 재시도 유도"
  
  - status: 401
    code: "CODE_EXPIRED"
    user_message: "인증 코드가 만료되었습니다. 재발송하세요"
    action: "재발송 화면으로 돌아가기"
  
  - status: 403
    code: "TOO_MANY_ATTEMPTS"
    user_message: "너무 많은 실패. 60초 후 재시도 가능"
    action: "버튼 비활성화 + 카운트다운"
  
  - status: 429
    code: "RATE_LIMIT_EXCEEDED"
    user_message: "요청이 많습니다. 1분 후 다시 시도하세요"
    action: "재시도 버튼 비활성화"
```
</action>

<action>UI 티켓에 사용자 플로우/로직 반영 (critical):

<critical>⚠️ 디자인이 아닌 "로직"에 집중: 이걸 누르면 어디로 가고, 무슨 일이 일어나는지</critical>

UX Design 문서에서 해당 화면의 **동작 로직** 추출:

1. **user_actions**: 사용자가 할 수 있는 모든 액션
   - 어떤 요소를 탭하면 → 어디로 이동 / 무엇이 실행
   - 조건부 동작 (로그인 상태에 따라 다른 동작 등)

2. **navigation_flow**: 화면 이동 로직
   - 진입 경로: 어디서 이 화면으로 올 수 있는지
   - 이탈 경로: 이 화면에서 어디로 갈 수 있는지
   - 뒤로가기 동작

3. **data_flow**: 데이터 흐름
   - 어떤 API를 호출해서 데이터를 가져오는지
   - 사용자 입력이 어디로 전송되는지
   - 실시간 업데이트가 필요한지 (소켓)

4. **state_transitions**: 상태 변화
   - 버튼 클릭 시 상태 변화 (활성/비활성)
   - 데이터 로딩 전/후 상태
   - 성공/실패 시 다음 동작

5. **validation_logic**: 검증 로직
   - 입력값 검증 규칙 (필수, 형식, 길이 등)
   - 검증 실패 시 동작

6. **business_rules**: 비즈니스 규칙
   - 본인 상품만 수정/삭제 가능
   - 인증 필요 여부
   - 권한 체크
</action>

<action>UI 티켓 템플릿 예시 (로직 중심):

```yaml
ticket_id: T04-009
title: 홈 화면 (Frontend)
type: ui
assigned_agents:
  - agent: "Frontend Developer"
    responsibility: "화면 구현, API 연동"

# 사용자 플로우 로직 (from UX Design 문서)
user_flow:
  # 사용자가 할 수 있는 액션과 결과
  user_actions:
    - action: "상품 카드 탭"
      result: "ProductDetailScreen으로 이동 (productId 전달)"

    - action: "검색 아이콘 탭"
      result: "SearchScreen으로 이동"

    - action: "+ 플로팅 버튼 탭"
      condition: "로그인 상태"
      result_if_true: "ProductRegisterScreen으로 이동"
      result_if_false: "LoginScreen으로 이동 (returnUrl 저장)"

    - action: "알림 아이콘 탭"
      result: "NotificationScreen으로 이동"
      badge: "unreadCount > 0이면 뱃지 표시"

    - action: "동네명 탭"
      result: "LocationSelectModal 열기"

    - action: "카테고리 필터 탭"
      result: "CategoryFilterModal 열기"

    - action: "아래로 스크롤 (하단 도달)"
      result: "다음 페이지 API 호출 (cursor 기반)"

    - action: "위에서 아래로 당기기"
      result: "목록 새로고침 (첫 페이지부터)"

  # 데이터 흐름
  data_flow:
    on_mount:
      - "GET /api/products?limit=20 호출"
      - "응답 데이터를 products 상태에 저장"

    on_scroll_end:
      - "nextCursor가 있으면 GET /api/products?cursor={nextCursor} 호출"
      - "기존 products에 추가"

    on_refresh:
      - "GET /api/products?limit=20 호출 (처음부터)"
      - "products 상태 교체"

  # 상태 관리
  states:
    - "products: Product[] - 상품 목록"
    - "isLoading: boolean - 초기 로딩 중"
    - "isRefreshing: boolean - 새로고침 중"
    - "isFetchingMore: boolean - 추가 로딩 중"
    - "nextCursor: string | null - 다음 페이지 커서"
    - "error: Error | null - 에러 상태"

  # 조건부 렌더링
  conditional_rendering:
    - condition: "isLoading && products.length === 0"
      render: "로딩 표시"

    - condition: "!isLoading && products.length === 0"
      render: "빈 상태 ('아직 등록된 물품이 없어요')"

    - condition: "error"
      render: "에러 상태 (재시도 버튼)"

    - condition: "products.length > 0"
      render: "상품 리스트"

# TDD 테스트
tdd_tests:
  - "홈 화면 렌더링 테스트"
  - "상품 목록 로딩 테스트"
  - "무한 스크롤 테스트"
  - "새로고침 테스트"
  - "빈 상태 표시 테스트"
  - "에러 상태 표시 테스트"

test_file_path: "mobile/src/screens/__tests__/HomeScreen.test.tsx"

# 자율 실행 지원 필드
difficulty: medium
estimated_files: 3

potential_errors:
  - error: "Cannot find module '@/components/ProductCard'"
    cause: "공통 컴포넌트 미구현"
    fix: "ProductCard 컴포넌트 먼저 구현 또는 모킹"
  - error: "useInfiniteQuery is not a function"
    cause: "@tanstack/react-query 미설치"
    fix: "npm install @tanstack/react-query"

validation_commands:
  - "npm run test -- HomeScreen.test.tsx"
  - "npx expo start --no-dev --minify"

rollback_files:
  - "mobile/src/screens/HomeScreen.tsx"
  - "mobile/src/screens/__tests__/HomeScreen.test.tsx"

websearch_hints:
  - "React Native FlatList infinite scroll"
  - "useInfiniteQuery React Native example"

# 서브에이전트 호출
subagent_invocation:
  agent_file: ".claude/agents/frontend-developer.md"
  task_prompt: |
    ## 작업: 홈 화면 구현

    ### 핵심 로직
    - 위 user_flow 참조하여 모든 액션/상태/조건 구현
    - API 명세: docs/api-spec.md#get-apiproducts

    ### TDD
    1. RED: 각 user_action에 대한 테스트 작성
    2. GREEN: 로직 구현
    3. REFACTOR: 코드 정리

    ### 자율 실행 주의사항
    - 에러 발생 시 potential_errors 참고하여 자가 수정
    - validation_commands로 성공 검증
    - 3회 실패 시 blocked 처리하고 다음 티켓으로
```
</action>

<action>Epic별 티켓 파일 생성:
- {epics_folder} 디렉토리 생성
- 각 Epic마다 하나의 통합 MD 파일 생성: EPIC-001-{epic_name}.md, EPIC-002-{epic_name}.md, ...
- 각 Epic 파일 내에서 ## TICKET-XXX: 형식으로 티켓 섹션 구분 (마크다운 제목)
- 각 섹션 내 전체 상세 내용 유지 (TDD, 에러 처리, WebSearch, 의존성, 에이전트 할당 등)

**파일 구조 예시:**
```
anyon-docs/conversation/epics/
├── EPIC-001-인증시스템.md
│   ├── ## TICKET-001: 인증 API 구현
│   │   ├── 설명
│   │   ├── TDD 테스트
│   │   ├── 예상 에러
│   │   └── ...
│   ├── ## TICKET-002: 로그인 UI
│   │   ├── 설명
│   │   ├── TDD 테스트
│   │   └── ...
│   └── ## TICKET-003: 프로필 UI
│       └── ...
│
├── EPIC-002-상품관리.md
│   ├── ## TICKET-004: 상품 API
│   └── ## TICKET-005: 상품 UI
│
└── EPIC-003-결제시스템.md
    └── ...
```

**마크다운 형식:**
```markdown
# EPIC-001: 인증시스템 (XX% 비중)

## TICKET-001: 인증 API 구현

### 기본 정보
- ticket_id: TICKET-001
- type: api
- priority: critical
- 담당 에이전트: Backend Developer

### 설명
...

### TDD 테스트
...

### 예상 에러와 해결책
...

---

## TICKET-002: 로그인 UI

### 기본 정보
...

```
</action>

<action>✅ Epic별 통합 티켓 파일 자동 생성 완료 (사용자 확인 불필요):
```
📋 생성된 Epic별 통합 티켓 파일: {{total_epics}}개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ EPIC-001-인증시스템.md (XX% 비중) - 3개 티켓
  • TICKET-001: 인증 API 구현 [Backend]
  • TICKET-002: 로그인 UI [Frontend]
  • TICKET-003: 프로필 UI [Frontend]

✓ EPIC-002-상품관리.md (XX% 비중) - 2개 티켓
  • TICKET-004: 상품 CRUD API [Backend]
  • TICKET-005: 상품 목록 화면 [Frontend]

✓ EPIC-003-결제시스템.md (XX% 비중) - 2개 티켓
  • TICKET-006: 결제 API [Backend + Integration]
  • TICKET-007: 결제 화면 [Frontend]

... (총 {{total_tickets}}개 티켓, {{total_epics}}개 Epic 파일)

📁 저장 위치: anyon-docs/conversation/epics/
```
</action>

<template-output-autoupdate>자동 저장됨 (사용자 승인 요청 없음)</template-output-autoupdate>
</step>

<step n="3b" goal="기술 스택 검증 (WebSearch)">

<critical>버전 호환성 문제 방지를 위해 웹검색으로 실제 구현 가능성을 검증합니다</critical>

<action>TRD의 기술 스택에서 주요 라이브러리 목록 추출</action>

<for-each library="주요 라이브러리">
  <action>WebSearch 실행:
    - 검색어: "{{library}} latest version 2024 2025 install"
    - 검색어: "{{library}} {{관련_라이브러리}} compatibility"
  </action>

  <action>검증 항목:
    - 최신 안정 버전 확인
    - 설치 명령어 확인
    - 다른 라이브러리와 호환성 (예: React 18 + React Native Paper)
    - breaking changes 확인
    - Node.js 버전 요구사항
  </action>
</for-each>

<action>검증 결과를 티켓에 반영:
```yaml
# 각 티켓에 추가
dependencies:
  - name: "prisma"
    version: "^5.22.0"  # 검증된 최신 안정 버전
    install_command: "npm install prisma @prisma/client"
    compatibility_notes: "Node.js 18+ 필요, PostgreSQL 15+ 권장"
  - name: "express"
    version: "^4.21.0"
    install_command: "npm install express"
    compatibility_notes: "TypeScript 사용 시 @types/express 필요"
```
</action>

<action>호환성 이슈 발견 시:
  - 티켓에 주의사항 추가
  - 대안 라이브러리 제안
  - TRD 문서 업데이트 권장
</action>

<action>검증 결과 요약 출력:
```
🔍 기술 스택 검증 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 검증 완료:
  • prisma@5.22.0 - PostgreSQL 15+ 호환
  • express@4.21.0 - Node.js 18+ 필요
  • react-native@0.73.0 - Expo SDK 50 호환
  • socket.io@4.7.0 - express 4.x 호환

⚠️ 주의사항:
  • React Native Paper 5.x는 React Native 0.72+ 필요
  • JWT 라이브러리 jsonwebtoken은 ESM 미지원, jose 권장

📝 티켓에 설치 명령어 및 버전 정보 반영 완료
```
</action>

</step>

<step n="4" goal="의존성 분석 및 Wave 구성">

<action>의존성 규칙 적용:

**하드 의존성 (blocked_by)**:
- UI 티켓 → 해당 API 티켓에 의존
- API 티켓 → 해당 DB 스키마 티켓에 의존
- 인증이 필요한 기능 → 인증 티켓에 의존
- 통합 테스트 → 관련 구현 티켓들에 의존

**소프트 의존성 (권장 순서)**:
- 핵심 기능 먼저, 부가 기능 나중
- 공통 컴포넌트 먼저, 특화 컴포넌트 나중
</action>

<action>각 티켓에 의존성 정보 추가:
- blocked_by: 이 티켓 시작 전 완료되어야 할 티켓들
- blocks: 이 티켓 완료 후 시작 가능한 티켓들
- parallel_with: 같은 Wave에서 병렬 실행 가능한 티켓들
</action>

<action>Wave 구성:

**Wave 할당 알고리즘**:
1. blocked_by가 없는 티켓 → Wave 1
2. Wave 1 티켓에만 의존하는 티켓 → Wave 2
3. Wave 1-2 티켓에만 의존하는 티켓 → Wave 3
4. 반복...

**병렬 실행 가능 조건**:
- 같은 Wave 내 티켓
- 서로 의존성 없음
- 다른 에이전트 또는 독립적 파일 작업
</action>

<action>의존성 그래프 생성 (Mermaid 형식):
```mermaid
graph TD
    subgraph Wave1[Wave 1: 기반 작업]
        T001[TICKET-001: Scaffolding]
        T002[TICKET-002: DB Schema]
        T003[TICKET-003: CI/CD]
    end

    subgraph Wave2[Wave 2: 인증]
        T004[TICKET-004: OAuth API]
        T005[TICKET-005: Login UI]
    end

    T002 --> T004
    T001 --> T005
    T004 --> T006[TICKET-006: 통합 테스트]
    T005 --> T006

    ...
```
</action>

<action>✅ {dependency_graph_file}에 자동 저장 완료 (사용자 확인 없이 진행)</action>

<template-output-autoupdate>자동 저장됨 (사용자 승인 요청 없음)</template-output-autoupdate>
</step>

<step n="5" goal="에이전트 할당">

<action>에이전트 할당 규칙:

**티켓 타입 → 에이전트 매핑**:
- scaffolding → Scaffolding Engineer
- database → Database Architect, Backend Developer (순차)
- api → Backend Developer
- api + auth → Backend Developer, Security Auditor (병렬 검토)
- api + external → Backend Developer, Integration Engineer
- ui → Frontend Developer
- integration → Integration Engineer, Backend Developer
- cicd → DevOps Engineer
- test → QA Engineer
- security → Security Auditor
- performance → Backend Developer, Frontend Developer (각자 영역)
</action>

<action>각 티켓에 에이전트 할당 및 역할 명시:
```yaml
assigned_agents:
  - agent: "Backend Developer"
    responsibility: "NextAuth.js 설정, API 라우트 구현"
    order: 1
  - agent: "Integration Engineer"
    responsibility: "Google Cloud Console 설정 가이드"
    order: 2

# 병렬 실행 가능 여부 명시
parallel_agents:
  enabled: false  # 순차 실행 필요 시
  reason: "Integration Engineer는 Backend 완료 후 작업"
```

병렬 가능한 경우:
```yaml
assigned_agents:
  - agent: "Backend Developer"
    responsibility: "API 엔드포인트 구현"
    outputs: ["backend/src/routes/products.ts"]
  - agent: "Frontend Developer"
    responsibility: "UI 컴포넌트 구현"
    outputs: ["mobile/src/screens/ProductScreen.tsx"]

parallel_agents:
  enabled: true  # 서로 다른 파일 작업, 동시 실행 가능
  reason: "Backend API와 Frontend UI가 독립적"
```
</action>

<action>에이전트별 작업량 요약:
```
🤖 에이전트별 할당 현황
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend Developer: 6개 티켓
  Wave 1: TICKET-002
  Wave 2: TICKET-004
  Wave 3: TICKET-007, TICKET-010
  Wave 4: TICKET-012
  Wave 5: TICKET-015

Frontend Developer: 4개 티켓
  Wave 2: TICKET-005
  Wave 3: TICKET-008, TICKET-011
  Wave 4: TICKET-012

...
```
</action>

<action>✅ 모든 티켓 파일 자동 업데이트 완료 (에이전트 정보 추가)</action>

<template-output-autoupdate>자동 저장됨 (사용자 승인 요청 없음)</template-output-autoupdate>
</step>

<step n="5b" goal="API 명세서 생성">

<critical>프론트엔드-백엔드 간 소통을 위한 API 명세서를 별도 파일로 생성합니다</critical>

<action>모든 API 티켓에서 엔드포인트 정보 추출</action>

<action>API 명세서 파일 생성: {output_folder}/api-spec.md

```markdown
# API 명세서

## 기본 정보
- Base URL: `http://localhost:3000/api`
- 인증 방식: Bearer Token (JWT)
- 응답 형식: `{ success: boolean, data?: T, message?: string }`

---

## 인증 API

### POST /api/auth/send-code
SMS 인증 코드 발송

**Request:**
```json
{
  "phone": "010-1234-5678"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "인증 코드가 발송되었습니다"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "유효하지 않은 전화번호입니다"
}
```

---

### POST /api/auth/verify
인증 코드 검증 및 로그인

**Request:**
```json
{
  "phone": "010-1234-5678",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "phone": "010-1234-5678",
      "nickname": "사용자"
    }
  }
}
```

---

## 상품 API

### GET /api/products
상품 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | number | N | 페이지 번호 (기본값: 1) |
| limit | number | N | 페이지당 개수 (기본값: 20) |
| category | string | N | 카테고리 ID |
| search | string | N | 검색어 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

... (모든 API 엔드포인트)
```
</action>

<action>각 API 티켓에 명세서 참조 추가:
```yaml
api_spec_reference: "docs/api-spec.md#post-apiproducts"
```
</action>

<action>각 Frontend 티켓에 사용할 API 명세 참조 추가:
```yaml
uses_api:
  - endpoint: "POST /api/products"
    spec_reference: "docs/api-spec.md#post-apiproducts"
  - endpoint: "GET /api/products"
    spec_reference: "docs/api-spec.md#get-apiproducts"
```
</action>

<action>API 명세서 생성 완료 출력:
```
📄 API 명세서 생성 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 파일: {output_folder}/api-spec.md

📊 API 현황:
  • 총 엔드포인트: {{total_endpoints}}개
  • 인증 필요: {{auth_required}}개
  • 공개 API: {{public_api}}개

🔗 카테고리별:
  • Auth: {{auth_count}}개
  • Products: {{products_count}}개
  • Chat: {{chat_count}}개
  • Transactions: {{transactions_count}}개
  ...

✅ 모든 티켓에 API 명세 참조 추가 완료
```
</action>

</step>

<step n="6" goal="실행 계획 문서 생성">

<action>{execution_plan_template}을 기반으로 **통합 실행 계획** 생성 (pm-executor가 읽을 마스터 문서):

**execution-plan.md 구조 (이것이 모든 것의 중심)**:

```markdown
# 프로젝트 실행 계획

## 1️⃣ 프로젝트 개요
- 프로젝트명, 목표, 규모 (Small/Medium/Large)
- 주요 기능 수, API 수, DB 테이블 수
- 외부 연동 서비스 목록
- 기술 스택 요약

## 2️⃣ 기술 스택 (Step 3b 검증 결과 포함)
- 프론트엔드: React Native 0.73, Expo 50
- 백엔드: Node.js 18+, Express 4.21, Prisma 5.22
- 데이터베이스: PostgreSQL 15+
- 인프라: Docker, GitHub Actions
- 외부 서비스: Twilio, SendGrid 등

**주의사항**:
- React Native Paper 5.x는 RN 0.72+ 필요
- JWT는 jose 권장 (ESM 지원)
- Redis 필수 (Rate limiting)

## 3️⃣ 프로젝트 커스텀 에이전트 (Step 0b)
- Backend Developer: API, 비즈니스 로직
- Frontend Developer: UI, 상태 관리
- Database Architect: 스키마, 마이그레이션
- 등등... (생성된 에이전트 목록)

**위치**: .claude/agents/*.md
**특징**: 프로젝트별 기술 스택, 컨벤션, 도메인 지식 포함

## 4️⃣ Epic 분류 (Step 2)
| Epic | 비중 | 티켓 수 | 포함 기능 |
|------|------|--------|---------|
| EPIC-001-인증 | 15% | 3개 | SMS, 로그인, 프로필 |
| EPIC-002-상품 | 35% | 5개 | 목록, 상세, 등록, 수정 |
| 등등... | | | |

## 5️⃣ 전체 티켓 (Step 3 - Epic별 통합 파일)

**위치**: anyon-docs/conversation/epics/
- EPIC-001-인증시스템.md (## TICKET-001, ## TICKET-002, ...)
- EPIC-002-상품관리.md
- 등등...

**각 티켓 포함 내용**:
- API 명세 (Request/Response)
- DB 스키마 (Prisma)
- 파일 구조
- 비즈니스 로직
- UI 상세사항
- TDD 테스트
- WebSearch 힌트
- 에러 처리
- 의존성 정보

## 6️⃣ Wave별 실행 계획 (Step 4 의존성 분석)

### Wave 1 (병렬 실행 가능 - 3개 티켓)
- TICKET-001: 프로젝트 스캐폴딩 [Scaffolding]
- TICKET-002: DB 스키마 [Database]
- TICKET-003: CI/CD 설정 [DevOps]

**특징**: 
- 선행 작업 없음 (blocked_by: [])
- 병렬 실행 가능
- 예상 소요: 4-6시간

### Wave 2 (Wave 1 완료 후 - 4개 티켓)
- TICKET-004: SMS 인증 API [Backend]
- TICKET-005: 로그인 UI [Frontend]
- TICKET-006: 프로필 UI [Frontend]
- TICKET-007: 알림 설정 [Backend]

**특징**:
- TICKET-001, 002 의존
- Frontend-Backend 병렬 가능
- 예상 소요: 6-8시간

### Wave 3 (Wave 2 완료 후 - 5개 티켓)
...

**의존성 그래프** (Mermaid):
```mermaid
graph TD
  subgraph W1["Wave 1"]
    T001[TICKET-001: Scaffolding]
    T002[TICKET-002: DB Schema]
    T003[TICKET-003: CI/CD]
  end
  
  subgraph W2["Wave 2"]
    T004[TICKET-004: Auth API]
    T005[TICKET-005: Login UI]
  end
  
  T001 --> T004
  T002 --> T004
  T001 --> T005
  T004 --> T005
```

## 7️⃣ API 명세 (Step 5b)

**위치**: anyon-docs/conversation/api-spec.md

**주요 엔드포인트**:
- POST /api/auth/send-code (SMS 발송)
- POST /api/auth/verify (로그인)
- GET /api/products (목록)
- POST /api/products (등록)
- 등등...

**각 엔드포인트 포함**:
- Request/Response 형식
- Validation 규칙
- Error codes
- Rate limiting 정책

## 8️⃣ 에이전트 할당 (Step 5)

| 에이전트 | 담당 | Wave별 | 병렬 가능 |
|---------|------|--------|---------|
| Backend | API 6개 | W1(1), W2(2), W3(2) | O |
| Frontend | UI 5개 | W2(2), W3(2) | O |
| Database | Schema 1개 | W1(1) | X |
| DevOps | CI/CD 1개 | W1(1) | O |

**상세**:
- Backend Developer: TICKET-004, 007, ... 담당
  - 순서: TDD RED → GREEN → REFACTOR
  - WebSearch: Twilio, JWT, Rate limiting
  - 예상: 8시간
  
- Frontend Developer: TICKET-005, 006, ... 담당
  - 순서: Component 설계 → TDD → 구현
  - WebSearch: React Native, Hooks
  - 예상: 6시간

## 9️⃣ 자율 실행을 위한 핵심 정보

### 환경 변수 (모든 에이전트가 사용)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
REDIS_URL=redis://localhost:6379
```

### 프로젝트 폴더 구조
```
backend/
├── src/routes
├── src/controllers
├── src/services
├── src/repositories
├── prisma/schema.prisma
└── src/__tests__

frontend/
├── src/screens
├── src/components
├── src/hooks
└── src/__tests__
```

### 검증 전략
```bash
# 각 Wave마다 실행
npm run test
npm run build
npm run lint

# 통합 테스트
npm run test:e2e
```

## 🔟 pm-executor가 실행할 작업 순서

1. **execution-plan.md 로드** (이 파일)
2. **Wave 1 시작**: TICKET-001, 002, 003 동시 실행
   - 각 에이전트에 담당 EPIC 파일 전달
   - Epic 파일에서 자신의 TICKET만 추출 실행
3. **Wave 1 완료 대기**
4. **Wave 2 시작**: TICKET-004, 005, 006, 007
5. **... (모든 Wave)**
6. **최종 통합 테스트**: npm run test:e2e
```

</action>

<action>✅ {default_output_file}에 자동 저장 완료 (사용자 승인 없이 진행)</action>

<action>**pm-executor 자동 실행 안내**:

이 워크플로우 완료 후, Anyon 백엔드가 자동으로 pm-executor를 시작합니다.

자동 실행 흐름:
1. pm-orchestrator 완료 감지
2. pm-executor 자동 시작 (Wave 1부터)
3. pm-executor → pm-reviewer → pm-executor... 반복
4. 모든 Epic 완료 시 자동 종료

이를 통해:
- 생성된 실행 계획 (execution-plan.md) 로드
- 모든 티켓을 Wave별로 자동 실행
- 각 에이전트에 작업 위임
- 프로젝트 자동 구현
</action>

<action>✅ 모든 작업 완료!
```
[ANYON-PMO-COMPLETE] Ready to execute! 🚀

✅ 완료된 산출물:
   📋 실행 계획: anyon-docs/conversation/execution-plan.md
   🤖 커스텀 에이전트: .claude/agents/*.md

⚡ pm-executor 실행 준비 완료
   /anyon:anyon-method:workflows:pm-executor
```
</action>

<template-output-autoupdate>자동 저장됨 (사용자 승인 요청 없음)</template-output-autoupdate>
</step>
