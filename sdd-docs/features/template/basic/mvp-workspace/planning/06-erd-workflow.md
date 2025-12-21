# ERD (Entity Relationship Diagram) 워크플로우

## 개요

ERD 워크플로우는 Architecture 이후에 Physical Database Schema를 생성하는 마지막 단계입니다.

**핵심 원칙:**
- **질문 없음**: Architecture/TRD에서 모든 정보 획득
- **자동 변환**: Entity → Table, 타입 매핑, 인덱스/제약조건 자동 생성
- **구현 가능 수준**: AI가 바로 Migration 파일 생성 가능

## 파일 위치
- **프롬프트 파일**: `src/constants/workflows/planning/startup-erd.ts`
- **출력 파일**: `anyon-docs/planning/erd.md`
- **참조 파일**: Architecture, TRD, PRD

---

## 최종 출력물

```
{project-root}/
└── anyon-docs/planning/
    └── erd.md    # 메인 출력 (Physical Database Schema)
```

---

## 워크플로우 진행 순서 (3단계)

### Step 0: 문서 로드 + Entity 추출

AI가 수행하는 작업:
1. Architecture 로드 → Entities, Value Objects, Repository Interfaces
2. TRD 로드 → database, backend_framework → ORM 자동 추론
3. PRD 로드 → success_metrics (확장성 계산용)

**ORM 자동 추론:**
| Backend | Database | ORM |
|---------|----------|-----|
| Next.js | PostgreSQL | Prisma |
| Next.js | Supabase | Supabase Client |
| Express | PostgreSQL | Prisma / TypeORM |
| Tauri | SQLite | SQLx / Diesel |

### Step 1: Physical Schema 자동 생성

**Entity → Table 변환:**
| 변환 규칙 | 예시 |
|----------|------|
| Entity 이름 → 복수형 snake_case | User → users |
| 속성 이름 → snake_case | userId → user_id |
| 관계 필드 → Foreign Key | ownerId → owner_id FK |

**타입 매핑 (PostgreSQL 기준):**
| Logical Type | Physical Type |
|-------------|---------------|
| string (id) | UUID |
| string | TEXT / VARCHAR(255) |
| number | INTEGER |
| boolean | BOOLEAN |
| Date | TIMESTAMPTZ |
| enum | TEXT + CHECK |

**자동 추가:**
- 모든 테이블: id, created_at, updated_at
- FK 필드: INDEX 자동 생성
- email/username: UNIQUE INDEX

### Step 2: ERD 문서 생성

```
ERD 완료!

**저장 위치**: anyon-docs/planning/erd.md

**요약:**
- Tables: 5개
- Foreign Keys: 8개
- Indexes: 15개

**포함된 내용:**
- Mermaid ERD 다이어그램
- 테이블 상세 스펙 (GitHub spec-kit 스타일)
- Migration 코드 스니펫
- 인덱싱 전략
- AI 구현 가이드

**Startup Launchpad 완료!**
```

---

## Architecture → ERD 자동 매핑

### Entity → Table 변환

| Architecture | ERD |
|-------------|-----|
| Entity User | Table users |
| Entity Pet | Table pets |
| Entity Booking | Table bookings |

### 타입 변환 (PostgreSQL)

```
Architecture (Logical)     →    ERD (Physical)
────────────────────────────────────────────────
id: string                 →    id UUID PRIMARY KEY
email: string              →    email VARCHAR(255) UNIQUE NOT NULL
role: UserRole             →    role TEXT CHECK (role IN ('owner', 'sitter'))
createdAt: Date            →    created_at TIMESTAMPTZ DEFAULT NOW()
```

### Repository Interface → Index

| Repository Method | Generated Index |
|------------------|-----------------|
| findByEmail | INDEX(email) |
| findByUserId | INDEX(user_id) |
| findByDateRange | INDEX(start_date, end_date) |

---

## 출력 문서 구조 (erd.md)

### 7개 섹션

1. **ERD 다이어그램** - Mermaid 형식
2. **테이블 스펙** - GitHub spec-kit 스타일
3. **관계 (Relationships)** - FK, ON DELETE
4. **Migration 코드** - ORM별 스니펫
5. **인덱싱 전략** - Use Case 기반
6. **확장성 고려사항** - Phase 1/2/3
7. **AI 구현 가이드** - 테이블 생성 순서, 시드 데이터

---

## GitHub spec-kit 스타일 테이블 스펙

```markdown
### users

> 사용자 정보 저장

**From Architecture**: `User`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| email | VARCHAR(255) | NOT NULL | - | UNIQUE |
| name | VARCHAR(100) | NOT NULL | - | 사용자 이름 |
| role | TEXT | NOT NULL | 'owner' | CHECK (role IN ('owner', 'sitter')) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | 수정일 |

**Indexes:**
- `users_pkey`: id (PRIMARY KEY)
- `users_email_key`: email (UNIQUE)
- `users_created_at_idx`: created_at (정렬용)

**Constraints:**
- `PRIMARY KEY`: id
- `UNIQUE`: email
- `CHECK`: role IN ('owner', 'sitter')
```

---

## 체크리스트 (15개)

### Architecture 연계 (3개)
- [ ] Architecture의 모든 Entity가 테이블로 변환됨
- [ ] Architecture의 Value Object가 반영됨
- [ ] Repository Interface 쿼리가 인덱싱됨

### 테이블 완전성 (4개)
- [ ] 모든 테이블에 id, created_at, updated_at 포함
- [ ] 모든 FK에 인덱스와 ON DELETE 정의됨
- [ ] enum 필드에 CHECK constraint 정의됨
- [ ] 민감 필드 해시 저장 명시됨

### 인덱싱 (3개)
- [ ] PRIMARY KEY 모든 테이블에 존재
- [ ] Use Case 기반 인덱스 정의됨
- [ ] 자주 정렬되는 필드 인덱싱됨

### 구현 가능성 (3개)
- [ ] Migration 코드 스니펫 포함됨
- [ ] 테이블 생성 순서 명시됨
- [ ] 시드 데이터 예시 포함됨

### 문서 품질 (2개)
- [ ] Mermaid ERD 다이어그램 포함됨
- [ ] TRD database/orm 설정과 일치함

---

## Startup Launchpad 완료

ERD는 Startup Launchpad의 **마지막 문서**입니다.

모든 6개 문서가 완성되면:
1. **PRD** - 제품 요구사항
2. **UX Design** - 사용자 경험 설계
3. **UI Design Guide** - UI 디자인 시스템
4. **TRD** - 기술 스택
5. **Architecture** - 시스템 아키텍처
6. **ERD** - 데이터베이스 설계

**이제 개발을 시작할 수 있습니다!**
