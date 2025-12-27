# Architecture (시스템 아키텍처) 워크플로우

## 개요

Architecture 워크플로우는 TRD 이후에 시스템 구조를 설계하는 다섯 번째 단계입니다.

**핵심 원칙:**
- **질문 없음**: 모든 결정은 PRD/UX/TRD 기반으로 자동 결정
- **Clean Architecture**: 3-Layer 구조 (Domain → Application → Infrastructure)
- **Spec-Driven Development**: AI가 바로 구현 가능한 수준의 상세 스펙
- **오픈소스 매핑**: 기존 코드를 Clean Architecture 레이어에 매핑

## 파일 위치
- **프롬프트 파일**: `src/constants/workflows/planning/startup-architecture.ts`
- **출력 파일**: `anyon-docs/planning/architecture.md`
- **참조 파일**: PRD, UX Design, TRD

---

## 최종 출력물

```
{project-root}/
└── anyon-docs/planning/
    └── architecture.md    # 메인 출력 (시스템 아키텍처 문서)
```

---

## 워크플로우 진행 순서 (3단계)

### Step 0: 문서 로드 + 자동 분석

AI가 수행하는 작업:
1. PRD, UX Design, TRD 로드
2. 오픈소스 정보 확인 (PRD)
3. 기술 스택 정보 추출 (TRD)
4. 핵심 기능 목록 추출 (PRD)
5. 화면 흐름 추출 (UX)

**오픈소스가 있으면 (상세 분석):**
- 클론된 레포 분석 (TRD에서 이미 클론됨)
- 기존 코드 → Clean Architecture 레이어 매핑

| 오픈소스 코드 | Clean Architecture |
|-------------|-------------------|
| /lib/types/ | Domain/entities |
| /lib/hooks/ | Application/usecases |
| /lib/api/ | Infrastructure/repositories |
| /components/ | Presentation/components |

### Step 0.5: 유사 서비스 아키텍처 연구 (WebSearch)

**검색 쿼리:**
- "{{service_type}} architecture 2025"
- "{{service_type}} tech stack case study"
- "how to build {{service_type}} backend"

**수집 정보:**
- 4-8개 유사 서비스의 실제 아키텍처
- 각 서비스의 규모, 트래픽, 사용 기술
- 아키텍처 패턴 (모놀리식/마이크로서비스/서버리스)
- 실제 링크 (블로그 포스트, 케이스 스터디)

### Step 1: AI 자동 결정 (웹검색 기반)

사용자 질문 없이 AI가 모든 것을 결정:

```
아키텍처를 설계 중이에요...

[웹검색: "{{project_type}} architecture best practices 2025"]
```

**자동 결정 항목:**

| 항목 | 결정 기반 |
|-----|----------|
| 아키텍처 패턴 | TRD(예산, 서버구성) → Monolith/Serverless |
| 시스템 컴포넌트 | TRD 기술 스택 → 자동 구성 |
| 데이터 흐름 | UX 화면 흐름 → 자동 매핑 |
| 배포 구조 | TRD 호스팅 → 자동 구성 |
| 확장성 전략 | TRD 예산 → Phase 1/2/3 자동 설정 |

**패턴 결정 로직:**

| 조건 | 패턴 |
|-----|------|
| 오픈소스 완성형 | 해당 패턴 따라감 |
| BaaS 사용 | Serverless + BFF |
| 직접 만들기 + MVP | Modular Monolith |
| 대규모 예산 | Microservices-ready Monolith |

### Step 2: 아키텍처 문서 생성

```
Architecture 완료!

**저장 위치**: anyon-docs/planning/architecture.md

**요약:**
- 패턴: Clean Architecture + Serverless
- 레이어: Domain / Application / Infrastructure
- Use Cases: [PRD 기능 기반]
- 다이어그램: C4 Level 1, 2 포함

**다음**: ERD 워크플로우
```

---

## Clean Architecture 3-Layer 구조

```
┌─────────────────────────────────────────────┐
│           Infrastructure Layer              │
│  (API, DB, External Services, UI Framework) │
│                    ↓ (depends on)           │
├─────────────────────────────────────────────┤
│           Application Layer                 │
│      (Use Cases, Business Logic)            │
│                    ↓ (depends on)           │
├─────────────────────────────────────────────┤
│             Domain Layer                    │
│    (Entities, Value Objects, Interfaces)    │
└─────────────────────────────────────────────┘
```

**의존성 규칙**: 바깥 → 안쪽만 가능

### 폴더 구조 (프론트엔드)

```
src/
├── domain/           # 핵심 비즈니스 로직 (순수 TS)
│   ├── entities/     # User, Pet, Booking 등
│   └── interfaces/   # Repository 인터페이스
│
├── application/      # Use Cases (순수 TS)
│   ├── usecases/     # CreateBooking, FindPetSitter 등
│   └── services/     # 비즈니스 서비스
│
├── infrastructure/   # 외부 의존성
│   ├── api/          # HTTP 클라이언트
│   ├── repositories/ # 실제 API 호출
│   └── adapters/     # 데이터 변환
│
└── presentation/     # UI (React)
    ├── components/   # UI 컴포넌트
    ├── hooks/        # React Hooks
    └── pages/        # 페이지
```

---

## 출력 문서 구조 (architecture.md)

### 13개 섹션

1. **아키텍처 개요** - 패턴, 의존성 규칙
2. **Domain Layer** - Entities, Value Objects, Interfaces
3. **Application Layer** - Use Cases 목록 및 상세
4. **Infrastructure Layer** - API Client, Repository 구현체
5. **Presentation Layer** - 페이지 구조, 상태 관리
6. **폴더 구조** - 실제 경로
7. **데이터 흐름** - Use Case별 플로우
8. **시스템 구성도** - C4 Level 1, 2
9. **배포 구조** - TRD 호스팅 기반
10. **확장성 전략** - 예산 기반 Phase 1/2/3
11. **보안 전략** - 인증, 권한
12. **오픈소스 활용** - 레이어 매핑 (해당 시)
13. **AI 개발 가이드라인** - 새 기능 추가 방법

---

## PRD → Use Case 자동 매핑

PRD의 기능 목록에서 Use Case를 자동 추출:

| PRD 기능 | Use Case |
|---------|----------|
| 펫시터 검색 | FindPetSitters |
| 예약 생성 | CreateBooking |
| 예약 취소 | CancelBooking |
| 리뷰 작성 | CreateReview |

### Use Case 상세 포맷

```typescript
// Use Case: CreateBooking

// 입력
interface CreateBookingInput {
  petId: string;
  sitterId: string;
  dateRange: DateRange;
}

// 비즈니스 규칙
1. 펫이 존재하는지 확인
2. 펫시터가 해당 기간에 가능한지 확인
3. 예약 생성
4. 알림 발송

// 출력
interface CreateBookingOutput {
  booking: Booking;
}
```

---

## UX → Presentation 자동 매핑

UX Design의 화면에서 페이지 구조를 자동 추출:

| UX 화면 | 페이지 | 사용하는 Use Case |
|--------|-------|-----------------|
| 홈 | / | FindPetSitters |
| 펫시터 상세 | /sitter/:id | GetPetSitter |
| 예약하기 | /booking | CreateBooking |

---

## C4 다이어그램

### Level 1: Context Diagram
- 시스템과 외부 요소 (사용자, 외부 서비스)

### Level 2: Container Diagram
- 앱/서비스 단위 (Frontend, Backend, DB)

---

## 체크리스트 (15개 항목)

- [ ] Clean Architecture 3-Layer 구조 정의됨
- [ ] Domain: 모든 Entity 정의됨
- [ ] Domain: Repository Interface 정의됨
- [ ] Application: PRD 기능별 Use Case 정의됨
- [ ] Application: Use Case 입출력 명시됨
- [ ] Infrastructure: API Client 구조 정의됨
- [ ] Infrastructure: Repository 구현체 매핑됨
- [ ] Presentation: 페이지-UseCase 매핑됨
- [ ] 폴더 구조 실제 경로로 정의됨
- [ ] 데이터 흐름 Use Case별 정의됨
- [ ] C4 다이어그램 포함됨
- [ ] 배포 구조 정의됨
- [ ] 확장성 전략 Phase별 정의됨
- [ ] 오픈소스 활용 가이드 (해당 시)
- [ ] AI 개발 가이드라인 포함됨

---

## 다음 단계

Architecture 완료 후 **ERD (Entity Relationship Diagram)** 워크플로우로 이동합니다.
ERD에서 데이터베이스 스키마를 설계합니다.
