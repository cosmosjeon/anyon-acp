# TRD (기술 요구사항) 워크플로우

## 개요

TRD 워크플로우는 Design Guide 이후에 기술 스택을 선정하는 네 번째 단계입니다.

**핵심 원칙:**
- **핵심 질문만**: 예산, 서버구성, UI Library (3개)
- **AI 자동 결정**: 나머지 기술은 웹검색으로 자동 결정
- **오픈소스 클론**: PRD에서 선택한 오픈소스가 있으면 클론 + 분석
- **비개발자 친화적**: BaaS → 올인원 서비스, Custom → 직접 만들기

## 파일 위치
- **프롬프트 파일**: `src/constants/workflows/planning/startup-trd.ts`
- **출력 파일**: `anyon-docs/planning/trd.md`
- **참조 파일**: PRD, UX Design, Design Guide

---

## 최종 출력물

```
{project-root}/
├── anyon-docs/planning/
│   └── trd.md                    # 메인 출력 (기술 요구사항 문서)
└── {{cloned_repo_name}}/         # 오픈소스 클론 (해당 시)
```

---

## 워크플로우 진행 순서 (5단계)

### Step 0: 문서 로드 + 오픈소스 클론

AI가 수행하는 작업:
1. PRD, UX Design, Design Guide 로드
2. 프로젝트 정보 추출 (project_name, service_type, platform)
3. 오픈소스 정보 확인 (opensource.decision, base_repo 등)
4. **오픈소스가 있으면 클론**:
   ```bash
   git clone {{opensource.base_repo}} {project-root}/{{repo_name}}
   ```
5. 클론된 코드베이스 분석:
   - package.json → 기술 스택 파악
   - 폴더 구조 → 주요 디렉토리 파악
   - PRD 기능과 매핑

### Step 1: 예산 질문

```
월 인프라 예산은 어느 정도인가요?

1. **무료** - 테스트/MVP용
   - 적합: 사용자 100명 이하
   - 일부 기능 제한 있음

2. **소규모 (1-5만원)** - 소규모 실서비스
   - 적합: 사용자 1,000명 이하

3. **중규모 (5-20만원)** - 안정적 운영
   - 적합: 사용자 10,000명 이하

4. **대규모 (20만원+)** - 본격 서비스
   - 적합: 사용자 10,000명 이상

번호로 선택하거나, 궁금한 점 물어보세요!
```

### Step 2: 서버 구성 질문

> 오픈소스가 이미 백엔드를 포함하면 **스킵**

```
서버를 어떻게 구성할까요?

1. **올인원 서비스 사용** (Supabase, Firebase 등)
   - 빠르게 만들 수 있어요
   - 데이터베이스, 로그인, 파일 저장이 한 번에 해결돼요
   - 나중에 복잡한 기능 추가가 어려울 수 있어요

2. **직접 만들기**
   - 원하는 대로 자유롭게 만들 수 있어요
   - 개발 시간이 더 걸려요
   - 장기적으로 유연해요

추천: [PRD 복잡도 기반 추천]

번호로 선택하거나, 궁금한 점 물어보세요!
```

### Step 3: UI Library 질문

Design Guide 참고해서 후보 제시:

```
디자인 가이드를 봤을 때, 이 UI 라이브러리들이 잘 맞을 것 같아요:

1. **shadcn/ui** - 커스터마이징 자유도 높음
   - 디자인 수정하기 가장 쉬워요

2. **MUI** - 완성도 높은 컴포넌트
   - 빠르게 만들 수 있어요

3. **Chakra UI** - 접근성 중심
   - 깔끔하고 사용하기 쉬워요

추천: [Design Guide 스타일 기반] (추천)

번호로 선택하거나, 궁금한 점 물어보세요!
```

### Step 4: AI 자동 결정

사용자에게 묻지 않고 AI가 웹검색으로 결정:

| 항목 | 결정 방식 |
|-----|----------|
| Frontend Framework | 오픈소스 스택 따라감 or PRD 기반 |
| Backend (세부) | 올인원 → Supabase/Firebase, 직접 → Express/FastAPI |
| Database | BaaS 내장 DB or 웹검색으로 선택 |
| Hosting | 예산에 맞게 선택 (Vercel, Railway 등) |
| Desktop Framework | 앱 특성에 맞게 선택 (해당 시) |
| 추가 서비스 | PRD 요구사항 기반 (인증, 결제 등) |

결정 후 사용자에게 결과 표시:
```
기술 스택을 정했어요!

| 분류 | 선택 |
|-----|-----|
| 화면 | Next.js |
| UI | shadcn/ui (선택하신 거) |
| 서버 | Supabase |
| 데이터 저장 | PostgreSQL |
| 호스팅 | Vercel |

다음 단계로 넘어갈까요? 조정하고 싶은 부분이 있으면 말씀해주세요!
```

### Step 5: TRD 문서 생성

```
TRD 완료!

**저장 위치**: anyon-docs/planning/trd.md

**기술 스택 요약:**
| 분류 | 선택 |
|-----|-----|
| Frontend | Next.js |
| UI Library | shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL |
| Hosting | Vercel |

**오픈소스 활용:** (해당 시)
- 기반 프로젝트: cal.com
- 클론 위치: /cal.com
- 활용 가이드가 TRD 문서에 포함되어 있어요!

**다음**: Architecture 워크플로우
```

---

## 질문 분류

| 사용자에게 물어볼 것 | AI가 알아서 결정 |
|-------------------|----------------|
| 예산 | Frontend Framework |
| 서버 구성 (올인원/직접) | Backend 세부 (Supabase vs Firebase) |
| UI Library | Database |
| | Hosting |
| | 추가 서비스 (인증, 결제 등) |

---

## 오픈소스 활용 가이드 (TRD에 포함)

오픈소스가 있을 경우 TRD 문서에 포함되는 섹션:

```markdown
## 오픈소스 활용 가이드

**기반 프로젝트**: cal.com
**클론 위치**: /cal.com

### 코드베이스 구조
- `/apps/web` - 메인 웹앱 (Next.js)
- `/packages/ui` - UI 컴포넌트
- `/packages/lib` - 공용 유틸리티

### 활용 방법

| 우리 기능 | 참고할 부분 | 활용 방식 |
|----------|-----------|----------|
| 예약 캘린더 | `/apps/web/components/booking` | 그대로 사용, 스타일만 수정 |
| 사용자 인증 | `/packages/features/auth` | 로직 참고, UI 커스텀 |
| 알림 시스템 | `/packages/features/notifications` | 구조 참고해서 새로 구현 |

### 수정이 필요한 부분
- 브랜딩 (로고, 색상) → Design Guide 적용
- 한국어 번역 → i18n 파일 수정
- 결제 연동 → Stripe → 토스페이먼츠로 교체
```

---

## 비개발자 용어 변환

| 개발 용어 | 사용할 표현 |
|----------|-----------|
| BaaS | 올인원 서비스 |
| Custom Backend | 직접 만들기 |
| Framework | (언급 안 함) |
| Database | 데이터 저장 |
| Hosting | 호스팅 |

---

## 대화 스타일

- **객관식 기본**: 모든 질문은 선택지 포함 (1, 2, 3...)
- **추가 대화 허용**: "1번이요" 또는 "차이가 뭐야?" 둘 다 OK
- **자연스러운 티키타카**: 딱딱한 설문이 아닌 대화형

---

## 다음 단계

TRD 완료 후 **Architecture 워크플로우**로 이동합니다.
Architecture에서 시스템 구조와 데이터 흐름을 설계합니다.
