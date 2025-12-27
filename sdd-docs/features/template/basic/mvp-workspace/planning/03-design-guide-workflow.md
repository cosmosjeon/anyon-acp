# Design Guide (UI 디자인 가이드) 워크플로우

## 개요

Design Guide 워크플로우는 UX Design을 바탕으로 시각적 디자인 가이드라인을 만드는 세 번째 단계입니다.

**핵심 원칙:**
- 색상/폰트는 **AI가 자동 결정** (사용자에게 하나하나 묻지 않음)
- 참고 서비스 제공 시 **dembrandt로 분석** 후 디자인 토큰 추출
- 사용자는 **최종 결과만 확인**하고 필요시 조정

## 파일 위치
- **프롬프트 파일**: `src/constants/workflows/planning/startup-ui.ts`
- **출력 파일**: `anyon-docs/planning/design-guide.md`
- **참조 파일**: PRD, UX Design

---

## 워크플로우 진행 순서 (4단계)

### Step 0: 문서 로드 (자동)

AI가 수행하는 작업:
- PRD 문서 로드
- UX Design HTML 로드
- 프로젝트 정보 추출 (project_name, service_type, platform)

### Step 1: 스타일 + 참고 서비스 질문 (하나의 질문)

```
"펫시터 매칭 앱의 디자인 가이드를 만들어볼게요!

어떤 느낌이 좋을까요?

1. **미니멀** - 깔끔, 여백, 심플 (예: 애플, 노션)
2. **화려함** - 대담한 색상, 에너지 (예: 인스타, 스포티파이)
3. **전문적** - 비즈니스, 신뢰감 (예: 토스, 링크드인)
4. **친근함** - 따뜻함, 부드러움 (예: 당근마켓, 슬랙)
5. **트렌디** - 그라데이션, 유리효과 (예: 피그마, 리니어)

그리고 **참고하고 싶은 서비스**가 있으면 같이 알려주세요!
(예: '3번, 토스 참고했으면 좋겠어요' 또는 그냥 '4번이요')
"
```

### Step 2: 참고 서비스 분석 + AI 자동 결정

**참고 서비스가 URL인 경우:**
1. `npx dembrandt <url> --json-only` 실행
2. JSON 결과에서 색상 팔레트, 타이포그래피 추출
3. 추출된 값 기반으로 디자인 결정

**참고 서비스가 잘 알려진 서비스인 경우:**
| 서비스 | Primary | Secondary | 스타일 |
|--------|---------|-----------|--------|
| 토스 | #3182F6 | #4E5968 | 전문적, 미니멀 |
| 당근마켓 | #FF6F0F | #FFA64D | 친근함, 따뜻함 |
| 배민 | #2AC1BC | #35C5F0 | 친근함, 재치 |
| 노션 | #000000 | #37352F | 미니멀 |
| 리니어 | #5E6AD2 | #8B5CF6 | 트렌디 |
| 피그마 | #F24E1E | #A259FF | 트렌디 |

**참고 서비스가 없는 경우:**
스타일 선택에 따라 AI가 자동으로 색상/폰트 결정

**결과 표시:**
```
토스 디자인을 분석했어요.

**AI가 결정한 디자인:**

| 항목 | 값 | 이유 |
|-----|-----|-----|
| Primary | #3182F6 | 토스의 시그니처 컬러 |
| Secondary | #4E5968 | 전문적인 느낌의 다크그레이 |
| Accent | #00C471 | 성공/확인 액션용 그린 |
| Heading Font | Pretendard | 한글 가독성 좋음, 모던 |
| Body Font | Pretendard | 일관성 유지 |

조정하고 싶은 부분 있으세요?
(없으면 '좋아요'라고 해주세요)
```

### Step 3: 다크모드 질문

```
"다크모드 지원할까요?

1. 네 (다크모드 색상도 자동 생성)
2. 아니오 (라이트 모드만)
3. 나중에 결정
"
```

다크모드 선택 시 자동 생성:
- Background: #0F0F0F
- Surface: #1A1A1A
- Text: #F3F4F6
- Primary: 기존 색상의 밝기 조정

### Step 4: 문서 생성 + 완료

```
"디자인 가이드가 완성됐어요!

**저장 위치**: anyon-docs/planning/design-guide.md

**요약:**
- 스타일: 전문적 (토스 참고)
- Primary: #3182F6
- Secondary: #4E5968
- Accent: #00C471
- 폰트: Pretendard
- 다크모드: 지원

**다음**: TRD (기술 스택) 워크플로우
"
```

---

## dembrandt 도구

GitHub: https://github.com/dembrandt/dembrandt (참고용)

### 사용법
```bash
npx dembrandt <url> --json-only
```

**참고**: dembrandt가 실행되지 않을 경우, 잘 알려진 서비스 테이블 또는 스타일 선택 기반으로 자동 결정됩니다.

### 추출 항목
- 색상 팔레트 + CSS 변수 + 호버/포커스 상태
- 타이포그래피 (폰트, 크기, 굵기)
- 간격 (마진/패딩 스케일)
- 테두리 (반경, 스타일)
- 그림자
- 버튼/인풋/링크/배지 스타일
- 반응형 브레이크포인트
- 아이콘 시스템 감지
- 프레임워크 감지 (Tailwind, MUI 등)

---

## 사용자와 논의할 것 vs 안 할 것

| 논의할 것 | 논의 안 함 (AI가 결정) |
|----------|----------------------|
| 전체 스타일 방향 | Primary Color 세부 값 |
| 참고 서비스 | Secondary Color |
| 다크모드 지원 여부 | Accent Color |
| 최종 결과 확인/조정 | 폰트 선택 |

---

## 출력 문서 구조 (design-guide.md)

```markdown
# [프로젝트명] Design Guide

## 디자인 스타일
- 스타일: 전문적
- 참고 서비스: 토스

## 색상 시스템

### Primary Color
#3182F6
- 용도: 버튼, 링크, 주요 강조

### Secondary Color
#4E5968
- 용도: 보조 버튼, 배지

### Accent Color
#00C471
- 용도: 특별 강조, CTA

### Semantic Colors
| 용도 | 색상 |
|-----|------|
| Success | #10B981 |
| Error | #EF4444 |
| Warning | #F59E0B |
| Info | #3B82F6 |

## 타이포그래피
| 용도 | 폰트 |
|-----|------|
| Heading | Pretendard |
| Body | Pretendard |

## 다크모드
- Background: #0F0F0F
- Surface: #1A1A1A
- Text: #F3F4F6
```

---

## 다음 단계

Design Guide 완료 후 **TRD (Technical Requirements Document)** 워크플로우로 이동합니다.
TRD에서 기술 스택(React, MUI 등)을 결정합니다.
