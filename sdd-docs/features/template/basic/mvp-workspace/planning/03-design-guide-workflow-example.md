# Design Guide 워크플로우 예시

펫시터 매칭 앱 "펫케어" 프로젝트의 Design Guide 워크플로우 진행 예시입니다.

---

## Step 0: 문서 로드 (자동)

AI가 PRD와 UX Design HTML을 자동으로 로드합니다.

---

## Step 1: 스타일 + 참고 서비스 질문

**Claude:**
```
펫케어의 디자인 가이드를 만들어볼게요!

어떤 느낌이 좋을까요?

1. **미니멀** - 깔끔, 여백, 심플 (예: 애플, 노션)
2. **화려함** - 대담한 색상, 에너지 (예: 인스타, 스포티파이)
3. **전문적** - 비즈니스, 신뢰감 (예: 토스, 링크드인)
4. **친근함** - 따뜻함, 부드러움 (예: 당근마켓, 슬랙)
5. **트렌디** - 그라데이션, 유리효과 (예: 피그마, 리니어)

그리고 **참고하고 싶은 서비스**가 있으면 같이 알려주세요!
(예: '3번, 토스 참고했으면 좋겠어요' 또는 그냥 '4번이요')
```

**User:**
```
4번이요. 당근마켓 느낌으로 가고 싶어요.
```

---

## Step 2: 참고 서비스 분석 + AI 자동 결정

**Claude:**
```
당근마켓 디자인을 분석했어요.

**AI가 결정한 디자인:**

| 항목 | 값 | 이유 |
|-----|-----|-----|
| Primary | #FF6F0F | 당근마켓의 시그니처 오렌지 |
| Secondary | #FFA64D | 밝은 오렌지 (보조) |
| Accent | #10B981 | 신뢰/안전 강조용 그린 |
| Heading Font | Pretendard | 한글 가독성 좋음, 친근함 |
| Body Font | Pretendard | 일관성 유지 |

조정하고 싶은 부분 있으세요?
(없으면 '좋아요'라고 해주세요)
```

**User:**
```
Primary가 너무 당근마켓이랑 똑같은데, 조금 다르게 할 수 있어요?
펫 관련이니까 좀 더 부드러운 색이면 좋겠어요.
```

**Claude:**
```
펫 서비스에 맞게 더 부드러운 색상으로 조정할게요!

**수정된 디자인:**

| 항목 | 값 | 이유 |
|-----|-----|-----|
| Primary | #F97316 | 부드러운 오렌지 (친근함 유지) |
| Secondary | #FDBA74 | 파스텔 오렌지 |
| Accent | #10B981 | 신뢰/안전 강조용 그린 |
| Heading Font | Pretendard | 한글 가독성 좋음 |
| Body Font | Pretendard | 일관성 유지 |

이 정도면 어떠세요?
```

**User:**
```
좋아요!
```

---

## Step 3: 다크모드 질문

**Claude:**
```
다크모드 지원할까요?

1. 네 (다크모드 색상도 자동 생성)
2. 아니오 (라이트 모드만)
3. 나중에 결정
```

**User:**
```
2번이요. 일단 라이트 모드만
```

---

## Step 4: 문서 생성 + 완료

**Claude:**
```
디자인 가이드가 완성됐어요!

**저장 위치**: anyon-docs/planning/design-guide.md

**요약:**
- 스타일: 친근함 (당근마켓 참고)
- Primary: #F97316
- Secondary: #FDBA74
- Accent: #10B981
- 폰트: Pretendard
- 다크모드: 미지원

**다음**: TRD (기술 스택) 워크플로우
```

---

## 생성된 문서 예시 (design-guide.md)

```markdown
---
document_type: Design Guide
project_name: 펫케어
created_date: 2024-01-15
design_style: 친근함
colors:
  primary: "#F97316"
  secondary: "#FDBA74"
  accent: "#10B981"
fonts:
  heading: Pretendard
  body: Pretendard
dark_mode: false
---

# 펫케어 - Design Guide

## 디자인 스타일

**스타일**: 친근함

**참고 서비스**: 당근마켓

---

## 색상 시스템

### Primary Color
#F97316 (부드러운 오렌지)
- 용도: 버튼, 링크, 주요 강조

### Secondary Color
#FDBA74 (파스텔 오렌지)
- 용도: 보조 버튼, 배지, 배경 강조

### Accent Color
#10B981 (그린)
- 용도: 신뢰/안전 강조, 검증 배지, 성공 상태

### Semantic Colors
| 용도 | 색상 |
|-----|------|
| Success | #10B981 |
| Error | #EF4444 |
| Warning | #F59E0B |
| Info | #3B82F6 |

---

## 타이포그래피

| 용도 | 폰트 | 비고 |
|-----|------|-----|
| Heading | Pretendard | Bold (700) |
| Body | Pretendard | Regular (400) |
| Caption | Pretendard | Light (300) |

---

## 다크모드

현재 미지원 (라이트 모드만)
```

---

## 예시 2: URL로 참고 서비스 제공

**User:**
```
3번이요. https://linear.app 이 사이트 참고하고 싶어요.
```

**Claude:**
```
Linear 디자인을 분석 중이에요...

[npx dembrandt https://linear.app --json-only 실행]

Linear 디자인을 분석했어요.

**AI가 결정한 디자인:**

| 항목 | 값 | 이유 |
|-----|-----|-----|
| Primary | #5E6AD2 | Linear의 시그니처 퍼플 |
| Secondary | #8B5CF6 | 밝은 퍼플 |
| Accent | #06B6D4 | 시안 (강조용) |
| Heading Font | Inter | Linear 스타일 영문 폰트 |
| Body Font | Pretendard | 한글 가독성 |

조정하고 싶은 부분 있으세요?
```

---

## 예시 3: 참고 서비스 없이 진행

**User:**
```
1번이요
```

**Claude:**
```
미니멀 스타일에 맞게 디자인을 결정했어요.

**AI가 결정한 디자인:**

| 항목 | 값 | 이유 |
|-----|-----|-----|
| Primary | #000000 | 미니멀의 기본, 블랙 |
| Secondary | #6B7280 | 뉴트럴 그레이 |
| Accent | #3B82F6 | 포인트 블루 |
| Heading Font | Pretendard | 깔끔한 한글 폰트 |
| Body Font | Pretendard | 일관성 |

조정하고 싶은 부분 있으세요?
```

---

## 핵심 포인트

1. **질문은 최소화**: 스타일 + 참고 서비스를 한 번에 질문
2. **AI가 결정**: 색상/폰트는 AI가 자동 결정, 사용자는 확인/조정만
3. **조정 가능**: "좀 더 진하게", "다른 색으로" 등 자연어로 조정 요청
4. **dembrandt 활용**: URL 제공 시 실제 사이트 분석
