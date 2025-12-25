# 베타 서포트 시스템 기획 계획서

> 개발 계획서: [beta-support-system-dev.md](./beta-support-system-dev.md)

## 개요

기획문서 완료 후 사용자에게 서포트 옵션을 제공하고, 개발 진행 중 언제든 도움을 요청할 수 있는 시스템.

**목표**:
- AI 자동 개발의 한계를 보완
- 사용자 이탈 방지 + 외주 전환 기회 확보
- "밀어붙이는" 느낌 없이 자연스러운 서포트 제공

---

## 사용자 플로우

```
기획문서 6개 완료
        ↓
┌─────────────────────────────────────────┐
│         기획 완료 축하 모달              │
│                                         │
│  • AI 직접 진행 권장                     │
│  • 서포트 옵션 안내 (질문/외주)           │
│                                         │
│  [AI로 직접 진행하기] ← 메인              │
│  [서포트 채널] [외주 상담] ← 보조         │
└─────────────────────────────────────────┘
        ↓
    Development 단계 진행
        ↓
┌─────────────────────────────────────────┐
│     플로팅 헬프 버튼 (우측 하단)          │
│                                         │
│  호버 시:                                │
│  💬 카카오톡 문의 → 사람 상담             │
│  🤖 AI에게 질문 → 인앱 채팅              │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 구조

### 1. PlanningCompleteModal

**위치**: `src/components/modals/PlanningCompleteModal.tsx`

**트리거**: `PlanningDocsPanel`에서 `progress.isAllComplete === true` 감지 시

**Props**:
```typescript
interface PlanningCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;           // AI로 직접 진행
  onOpenSupport: () => void;       // 서포트 채널
  onRequestOutsource: () => void;  // 외주 상담
}
```

**UI 구성**:
```
┌─────────────────────────────────────────────────────┐
│  🎉 기획문서가 모두 완료되었습니다!                   │
│                                                     │
│  이제 AI가 자동으로 개발을 진행합니다.                │
│  직접 진행하시는 걸 권장드려요 — 충분히 하실 수 있어요! │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  🤝 베타 사용자 서포트                               │
│                                                     │
│  베타 기간 동안 이용해주시는 것에 감사드리며,          │
│  두 가지 지원을 제공하고 있어요.                      │
│                                                     │
│  📬 실시간 서포트                                    │
│     진행 중 막히거나 모르는 부분이 있으면 언제든       │
│     질문하세요. 전문 개발팀이 직접 답변해드려요.       │
│                                                     │
│  🛠 외주 개발                                        │
│     바쁘시거나 직접 진행이 어려우시면,                │
│     기획문서 기반으로 1주일 내 프로덕션급 완성해드려요. │
│     (베타 기간 특별가)                               │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [━━━━ AI로 직접 진행하기 ━━━━]  ← Primary          │
│                                                     │
│  [서포트 채널 연결]    [외주 상담하기]  ← Secondary   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2. FloatingHelpButton

**위치**: `src/components/help/FloatingHelpButton.tsx`

**표시 조건**: 항상 표시 (또는 Development 탭 활성화 시)

**상태**:
```typescript
interface FloatingHelpButtonState {
  isExpanded: boolean;      // 호버/클릭 시 확장
  isAIChatOpen: boolean;    // AI 채팅 모달 열림
}
```

**UI 구성**:
```
평소 (접힌 상태):
┌──────┐
│  🎧  │  ← 56x56px, 우측 하단 고정
└──────┘

호버 시 (확장):
┌─────────────────────┐
│  💬 카카오톡 문의    │  → 외부 링크
├─────────────────────┤
│  🤖 AI에게 질문     │  → AIChatModal 열기
└─────────────────────┘
│  🎧  │
└──────┘
```

---

### 3. AIChatModal

**위치**: `src/components/help/AIChatModal.tsx`

**기능**: Claude API 직접 연결, 간단한 채팅 UI

**Props**:
```typescript
interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**상태**:
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
```

**UI 구성**:
```
┌─────────────────────────────────────┐
│  🤖 AI 서포트              [✕]     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 안녕하세요! 개발 진행 중      │   │
│  │ 궁금한 점이 있으시면          │   │
│  │ 편하게 질문해주세요.          │   │
│  └─────────────────────────────┘   │
│                                     │
│        ┌─────────────────────────┐ │
│        │ 에러가 나는데 어떻게    │ │
│        │ 해결하면 되나요?        │ │
│        └─────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 어떤 에러인지 알려주시면     │   │
│  │ 도움드릴게요!                │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [메시지를 입력하세요...]    [전송] │
└─────────────────────────────────────┘
```

**핵심 기능**:
- 스트리밍 응답 (ChatGPT처럼 글자가 하나씩 나오는 UX)
- 대화 히스토리 저장 (localStorage)
- 자동 스크롤 (새 메시지 시)
- 에러 처리 및 재시도

**Phase 2 - RAG 추가** (나중에):
- anyon-docs/ 문서 임베딩
- 관련 문서 검색 후 컨텍스트 주입

---

## 파일 구조

```
src/
├── components/
│   ├── modals/
│   │   └── PlanningCompleteModal.tsx    # 기획 완료 모달
│   │
│   └── help/
│       ├── FloatingHelpButton.tsx       # 플로팅 버튼
│       ├── AIChatModal.tsx              # AI 채팅 모달
│       └── index.ts                     # 배럴 export
│
├── lib/
│   └── api/
│       └── support-chat.ts              # AI 채팅 API
│
└── constants/
    └── support.ts                       # 상수 (카톡 URL 등)
```

---

## 상수 정의

```typescript
// src/constants/support.ts

export const SUPPORT_CONFIG = {
  // 카카오톡 채널 URL (mock)
  KAKAO_CHANNEL_URL: 'https://pf.kakao.com/_xxxxx',

  // 외주 상담 URL (mock)
  OUTSOURCE_FORM_URL: 'https://forms.google.com/xxxxx',

  // AI 채팅 설정
  AI_CHAT: {
    MODEL: 'claude-sonnet-4-20250514',
    MAX_TOKENS: 1024,
    SYSTEM_PROMPT: `당신은 Anyon 서비스의 AI 서포트입니다.
사용자가 AI 자동 개발 도구를 사용하다가 막히거나 궁금한 점이 있을 때 도움을 줍니다.
친절하고 간결하게 한국어로 답변해주세요.`,
  },
};
```

---

## 구현 순서

### Phase 1: 기본 구조 (MVP)

| 순서 | 작업 | 예상 파일 |
|------|------|----------|
| 1 | 상수 파일 생성 | `src/constants/support.ts` |
| 2 | PlanningCompleteModal 컴포넌트 | `src/components/modals/PlanningCompleteModal.tsx` |
| 3 | PlanningDocsPanel에 모달 트리거 연결 | `src/components/planning/PlanningDocsPanel.tsx` |
| 4 | FloatingHelpButton 컴포넌트 | `src/components/help/FloatingHelpButton.tsx` |
| 5 | AIChatModal 컴포넌트 (UI만) | `src/components/help/AIChatModal.tsx` |
| 6 | AI 채팅 API 연결 | `src/lib/api/support-chat.ts` |
| 7 | MvpWorkspace에 FloatingHelpButton 추가 | `src/components/MvpWorkspace.tsx` |

### Phase 2: 개선

| 작업 | 비고 |
|------|------|
| AI 채팅 RAG 구현 | anyon-docs 문서 기반 |
| 에러 보고 자동 수집 | 콘솔 에러 캡처 |
| 외주 견적 자동 생성 | 기획문서 기반 분석 |

> ⚠️ **변경사항**: 대화 히스토리 저장은 Phase 1으로 이동 (조사 결과 기본 기능으로 필요)

---

## 디자인 참고

### 색상
- Primary 버튼: `bg-primary` (#d97757)
- Secondary 버튼: `bg-secondary` 또는 `border` 스타일
- 플로팅 버튼: `bg-primary` with shadow

### 애니메이션
- 플로팅 버튼 확장: `transition-all duration-200`
- 모달 등장: `animate-in fade-in`
- 채팅 메시지: `animate-in slide-in-from-bottom`

### 위치
- 플로팅 버튼: `fixed bottom-6 right-6 z-50`
- 모달: 화면 중앙, `max-w-md`

---

## Mock 데이터

```typescript
// 테스트용 카톡 채널 URL
KAKAO_CHANNEL_URL: 'https://pf.kakao.com/_mock'

// 테스트용 외주 폼 URL
OUTSOURCE_FORM_URL: 'https://example.com/outsource-form'
```

---

## 체크리스트

- [ ] 상수 파일 생성
- [ ] PlanningCompleteModal 구현
- [ ] PlanningDocsPanel 트리거 연결
- [ ] FloatingHelpButton 구현
- [ ] AIChatModal UI 구현
- [ ] AI 채팅 API 연결
- [ ] MvpWorkspace에 플로팅 버튼 추가
- [ ] 스타일 조정 및 반응형 처리
- [ ] 테스트
