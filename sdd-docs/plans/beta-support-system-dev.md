# 베타 서포트 시스템 - 개발 계획서

> 기획 계획서: [beta-support-system.md](./beta-support-system.md)

## 조사 결과 요약

### 참고 서비스 분석

| 서비스 | 특징 | 우리에게 적용할 점 |
|--------|------|-------------------|
| [채널톡](https://developers.channel.io/reference/sdk-kr) | 커스텀 버튼 지원, 뱃지 카운트, 이벤트 기반 API | 호버 시 확장 메뉴, 알림 뱃지 |
| [Notion AI](https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai) | 우측 하단 원형 아이콘, Shift+Cmd+J 단축키, 파란 테두리로 입력창 강조 | 인앱 AI 채팅, 키보드 단축키 |
| [Intercom](https://www.intercom.com/) | 고급 라우팅, 개인화, 프로액티브 메시지 | 사용자 세그먼트별 다른 경험 (나중에) |
| [Crisp](https://crisp.chat/) | 164KB 경량 위젯, 쉬운 커스터마이징 | 가벼운 구현, 빠른 로딩 |

### 기술 스택 결정

| 영역 | 선택 | 근거 |
|------|------|------|
| 채팅 UI | [shadcn-chatbot-kit](https://github.com/Blazity/shadcn-chatbot-kit) | shadcn/ui 호환, 스트리밍 지원, MIT 라이선스 |
| **LLM** | **Gemini 2.0 Flash** | 가장 저렴 ($0.10/1M input), 빠름, 서포트 채팅에 충분한 품질 |
| 스트리밍 | Google AI SDK | SSE 스트리밍 지원 |
| 애니메이션 | Framer Motion | 프로젝트에 이미 설치됨, FAB 확장 패턴 지원 |
| 상태 관리 | React useState + localStorage | 간단한 대화 히스토리만 필요 |

### LLM 가격 비교 (2025년 12월)

| 모델 | Input (1M 토큰) | Output (1M 토큰) | 비고 |
|------|----------------|-----------------|------|
| **Gemini 2.0 Flash** | $0.10 | $0.40 | ✅ 선택 |
| GPT-4o Mini | $0.15 | $0.60 | 2위 |
| Claude 3 Haiku | $0.25 | $1.25 | 3위 |
| Claude 3.5 Haiku | $0.80 | $4.00 | 비쌈 |

> Sources: [LLM API Pricing 2025](https://intuitionlabs.ai/articles/llm-api-pricing-comparison-2025), [DocsBot Calculator](https://docsbot.ai/tools/gpt-openai-api-pricing-calculator)

---

## 컴포넌트 상세 설계

### 1. FloatingHelpButton

**파일**: `src/components/help/FloatingHelpButton.tsx`

```typescript
interface FloatingHelpButtonProps {
  onOpenAIChat: () => void;
  onOpenKakao: () => void;
}

interface FloatingHelpButtonState {
  isExpanded: boolean;
  hasUnread: boolean;  // 나중에 알림 뱃지용
}
```

**UI 동작**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  평소 (idle):                                                │
│  ┌──────┐                                                   │
│  │  🎧  │  56x56px, border-radius: 50%                      │
│  └──────┘  shadow-lg, bg-primary                            │
│            position: fixed, bottom: 24px, right: 24px       │
│                                                             │
│  호버 시 (expanded):                                         │
│  ┌─────────────────────┐                                    │
│  │  💬 카카오톡 문의    │  ← 메뉴 아이템 1                    │
│  ├─────────────────────┤                                    │
│  │  🤖 AI에게 질문     │  ← 메뉴 아이템 2                    │
│  └─────────────────────┘                                    │
│  ┌──────┐                                                   │
│  │  ✕   │  닫기 아이콘으로 변경 (rotate 45deg)               │
│  └──────┘                                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**애니메이션 (Framer Motion)**:
```typescript
const menuVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    transition: { duration: 0.15 }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05  // 메뉴 아이템 순차 등장
    }
  }
};

const buttonVariants = {
  idle: { rotate: 0 },
  expanded: { rotate: 45 }  // + → × 변환
};
```

**접근성**:
- `aria-label="도움말 메뉴"`
- `aria-expanded={isExpanded}`
- ESC 키로 닫기
- 포커스 트랩 (메뉴 열린 상태)

---

### 2. AIChatModal

**파일**: `src/components/help/AIChatModal.tsx`

**의존성**: shadcn-chatbot-kit 또는 직접 구현

```typescript
interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface AIChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  inputValue: string;
}
```

**UI 구조**:
```
┌─────────────────────────────────────────┐
│  🤖 AI 서포트                    [─][✕] │  ← 헤더 (드래그 가능, 최소화)
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 안녕하세요! 개발 진행 중         │   │  ← 시스템 웰컴 메시지
│  │ 궁금한 점이 있으시면 질문해주세요.│   │
│  └─────────────────────────────────┘   │
│                                         │
│        ┌─────────────────────────────┐ │
│        │ 에러가 발생했는데요         │ │  ← 사용자 메시지 (우측)
│        └─────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 어떤 에러인지 알려주시면 ▊      │   │  ← AI 응답 (스트리밍 커서)
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  [  메시지를 입력하세요...    ] [전송]  │  ← 입력창
└─────────────────────────────────────────┘

크기: 400x500px (기본), 리사이즈 가능
위치: 우측 하단 (플로팅 버튼 위)
```

**핵심 기능**:

1. **스트리밍 응답**
   - Anthropic SDK `stream: true` 옵션 사용
   - 청크 단위로 메시지 업데이트
   - 타이핑 인디케이터 표시

2. **자동 스크롤**
   - 새 메시지 시 자동 스크롤
   - 사용자가 위로 스크롤하면 자동 스크롤 비활성화
   - 새 메시지 알림 표시 ("↓ 새 메시지")

3. **대화 히스토리**
   - localStorage에 저장 (키: `anyon-support-chat-history`)
   - 최근 50개 메시지만 유지
   - 세션 시작 시 불러오기

4. **에러 처리**
   - API 에러 시 재시도 버튼
   - 네트워크 끊김 감지 및 알림
   - 타임아웃 처리 (30초)

---

### 3. PlanningCompleteModal

**파일**: `src/components/modals/PlanningCompleteModal.tsx`

```typescript
interface PlanningCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;           // AI로 직접 진행
  onOpenSupport: () => void;       // 서포트 채널 열기
  onRequestOutsource: () => void;  // 외주 상담
}
```

**UI**: 기획 문서의 디자인 그대로 구현

**트리거 로직** (PlanningDocsPanel.tsx):
```typescript
// 기존 코드
const { progress } = usePlanningDocs();

// 추가할 코드
const [showCompleteModal, setShowCompleteModal] = useState(false);
const hasShownModal = useRef(false);

useEffect(() => {
  if (progress.isAllComplete && !hasShownModal.current) {
    hasShownModal.current = true;
    setShowCompleteModal(true);
  }
}, [progress.isAllComplete]);
```

---

### 4. API 레이어 (서버)

AI 채팅은 서버를 경유해서 호출 (API 키 보호, 로깅, 나중에 RAG 추가 용이)

**서버 엔드포인트**: `server/routes/support.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Router } from 'express';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

router.post('/chat', async (req, res) => {
  const { messages } = req.body;

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: SUPPORT_SYSTEM_PROMPT,
    });

    const result = await chat.sendMessageStream(messages.at(-1).content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

export default router;
```

**클라이언트**: `src/lib/api/support-chat.ts`

```typescript
export async function* streamSupportMessage(
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const response = await fetch('/api/support/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;

      const parsed = JSON.parse(data);
      if (parsed.text) yield parsed.text;
    }
  }
}
```

---

### 5. 상수 정의

**파일**: `src/constants/support.ts`

```typescript
export const SUPPORT_CONFIG = {
  // 카카오톡 채널 URL (production에서 실제 URL로 교체)
  KAKAO_CHANNEL_URL: 'https://pf.kakao.com/_mock',

  // 외주 상담 폼 URL
  OUTSOURCE_FORM_URL: 'https://forms.google.com/mock-form',

  // AI 채팅 설정
  AI_CHAT: {
    MODEL: 'gemini-2.0-flash',
    MAX_TOKENS: 1024,
    SYSTEM_PROMPT: `당신은 Anyon 서비스의 AI 서포트입니다.
사용자가 AI 자동 개발 도구를 사용하다가 막히거나 궁금한 점이 있을 때 도움을 줍니다.

역할:
- 에러 메시지 분석 및 해결 방법 안내
- 워크플로우 사용법 설명
- 기획문서 작성 팁 제공
- 개발 진행 상황 관련 질문 답변

톤:
- 친근하고 격려하는 톤 유지
- 기술 용어는 쉽게 풀어서 설명
- 모르는 것은 솔직히 "잘 모르겠어요"라고 답변
- 복잡한 문제는 카카오톡 상담 권유

제약:
- 코드를 직접 작성해주지 않음 (개발 워크플로우가 처리)
- 외부 서비스 관련 질문은 답변 불가
- 민감한 정보 요청 거부`,

    // 웰컴 메시지
    WELCOME_MESSAGE: `안녕하세요! 👋

개발 진행 중 궁금한 점이 있으시면 편하게 질문해주세요.
에러가 발생했거나, 사용법이 궁금하시거나, 어떤 질문이든 괜찮아요!

복잡한 문제는 카카오톡으로 전문 개발팀에게 직접 문의하실 수도 있어요.`,
  },

  // 대화 히스토리 설정
  HISTORY: {
    STORAGE_KEY: 'anyon-support-chat-history',
    MAX_MESSAGES: 50,
  },

  // UI 설정
  UI: {
    MODAL_WIDTH: 400,
    MODAL_HEIGHT: 500,
    MODAL_MIN_HEIGHT: 300,
    FLOATING_BUTTON_SIZE: 56,
    FLOATING_BUTTON_OFFSET: 24,  // bottom, right offset
  },
};
```

---

## 파일 구조

```
src/
├── components/
│   ├── modals/
│   │   └── PlanningCompleteModal.tsx    # 기획 완료 모달
│   │
│   ├── help/
│   │   ├── FloatingHelpButton.tsx       # 플로팅 FAB
│   │   ├── AIChatModal.tsx              # AI 채팅 모달
│   │   ├── ChatMessage.tsx              # 개별 메시지 컴포넌트
│   │   ├── ChatInput.tsx                # 입력창 컴포넌트
│   │   └── index.ts                     # 배럴 export
│   │
│   └── planning/
│       └── PlanningDocsPanel.tsx        # 수정: 모달 트리거 추가
│
├── lib/
│   └── api/
│       └── support-chat.ts              # 클라이언트 API (SSE 소비)
│
├── hooks/
│   └── useChatHistory.ts                # 대화 히스토리 훅
│
├── constants/
│   └── support.ts                       # 서포트 관련 상수
│
└── MvpWorkspace.tsx                     # 수정: FloatingHelpButton 추가

server/
├── routes/
│   └── support.ts                       # Gemini API 호출 + SSE 스트리밍
└── index.ts                             # 수정: support 라우트 추가
```

---

## 구현 순서

### Phase 1: 기본 구조 (Day 1)

| # | 작업 | 파일 | 예상 |
|---|------|------|------|
| 1 | 상수 파일 생성 | `constants/support.ts` | 10분 |
| 2 | FloatingHelpButton 기본 UI | `help/FloatingHelpButton.tsx` | 30분 |
| 3 | 호버 확장 애니메이션 | 위 파일에 Framer Motion 추가 | 20분 |
| 4 | MvpWorkspace에 버튼 추가 | `MvpWorkspace.tsx` | 10분 |

### Phase 2: AI 채팅 (Day 1-2)

| # | 작업 | 파일 | 예상 |
|---|------|------|------|
| 5 | **서버 엔드포인트** | `server/routes/support.ts` | 30분 |
| 6 | AIChatModal 기본 UI | `help/AIChatModal.tsx` | 40분 |
| 7 | ChatMessage 컴포넌트 | `help/ChatMessage.tsx` | 20분 |
| 8 | ChatInput 컴포넌트 | `help/ChatInput.tsx` | 20분 |
| 9 | 클라이언트 SSE 연결 | `api/support-chat.ts` | 30분 |
| 10 | 대화 히스토리 훅 | `hooks/useChatHistory.ts` | 20분 |
| 11 | 자동 스크롤 구현 | AIChatModal에 추가 | 20분 |

### Phase 3: 기획 완료 모달 (Day 2)

| # | 작업 | 파일 | 예상 |
|---|------|------|------|
| 12 | PlanningCompleteModal UI | `modals/PlanningCompleteModal.tsx` | 30분 |
| 13 | PlanningDocsPanel 트리거 연결 | `planning/PlanningDocsPanel.tsx` | 15분 |
| 14 | 외부 링크 연결 (카톡, 외주폼) | 각 버튼에 연결 | 10분 |

### Phase 4: 마무리 (Day 2)

| # | 작업 | 파일 | 예상 |
|---|------|------|------|
| 15 | 에러 처리 및 로딩 상태 | 전체 | 30분 |
| 16 | 반응형 & 다크모드 확인 | 전체 | 20분 |
| 17 | 키보드 단축키 (Cmd+Shift+H) | FloatingHelpButton | 15분 |
| 18 | 테스트 및 버그 수정 | - | 30분 |

---

## 기술적 고려사항

### 1. 스트리밍 구현

```typescript
// React에서 스트리밍 처리
const [streamingContent, setStreamingContent] = useState('');

const handleSend = async (content: string) => {
  // 사용자 메시지 추가
  addMessage({ role: 'user', content });

  // 빈 어시스턴트 메시지 추가 (스트리밍용)
  const assistantId = addMessage({
    role: 'assistant',
    content: '',
    isStreaming: true
  });

  try {
    let fullContent = '';
    for await (const chunk of streamSupportMessage(messages)) {
      fullContent += chunk;
      updateMessage(assistantId, { content: fullContent });
    }
    updateMessage(assistantId, { isStreaming: false });
  } catch (error) {
    updateMessage(assistantId, {
      content: '죄송해요, 오류가 발생했어요. 다시 시도해주세요.',
      isStreaming: false,
      isError: true
    });
  }
};
```

### 2. 자동 스크롤 (스마트)

```typescript
const useAutoScroll = (containerRef: RefObject<HTMLDivElement>, deps: any[]) => {
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, deps);

  return { isAtBottom, scrollToBottom: () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }};
};
```

### 3. localStorage 히스토리

```typescript
const useChatHistory = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem(SUPPORT_CONFIG.HISTORY.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.slice(-SUPPORT_CONFIG.HISTORY.MAX_MESSAGES);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      SUPPORT_CONFIG.HISTORY.STORAGE_KEY,
      JSON.stringify(messages.slice(-SUPPORT_CONFIG.HISTORY.MAX_MESSAGES))
    );
  }, [messages]);

  return { messages, addMessage, updateMessage, clearHistory };
};
```

---

## 디자인 토큰

```css
/* 플로팅 버튼 */
--fab-size: 56px;
--fab-offset: 24px;
--fab-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
--fab-hover-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);

/* 채팅 모달 */
--chat-width: 400px;
--chat-height: 500px;
--chat-radius: 16px;
--chat-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

/* 메시지 버블 */
--bubble-user-bg: var(--primary);
--bubble-user-text: white;
--bubble-assistant-bg: var(--muted);
--bubble-assistant-text: var(--foreground);
--bubble-radius: 12px;
--bubble-padding: 12px 16px;
```

---

## 테스트 체크리스트

### 기능 테스트
- [ ] 플로팅 버튼 호버 시 메뉴 확장
- [ ] 카카오톡 링크 새 탭에서 열림
- [ ] AI 채팅 모달 열기/닫기
- [ ] 메시지 전송 및 스트리밍 응답
- [ ] 대화 히스토리 저장/복원
- [ ] 자동 스크롤 (하단 고정)
- [ ] 기획 완료 시 모달 표시
- [ ] 모달에서 각 버튼 동작

### UI/UX 테스트
- [ ] 다크 모드 정상 표시
- [ ] 라이트 모드 정상 표시
- [ ] 모달 외부 클릭 시 닫힘
- [ ] ESC 키로 닫기
- [ ] 키보드 단축키 동작
- [ ] 모바일 뷰포트 대응 (필요시)

### 에러 케이스
- [ ] API 키 없을 때 안내 메시지
- [ ] 네트워크 에러 시 재시도 옵션
- [ ] 타임아웃 처리
- [ ] 빈 메시지 전송 방지

---

## Sources

### 채널톡 / 채팅 위젯
- [채널톡 개발자 문서](https://developers.channel.io/reference/sdk-kr)
- [채널톡 커스텀 버튼 구현](https://lab.naminsik.com/4099)
- [Crisp vs Intercom 비교](https://www.featurebase.app/blog/crisp-vs-intercom)

### Notion AI / 인앱 AI
- [Notion AI 가이드](https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai)
- [Notion Visual Design Principles](https://medium.com/design-bootcamp/how-notion-utilize-visual-and-perceptual-design-principles-to-to-increase-new-ai-features-adoption-82e7f0dfcc4e)
- [Notion 3.0 Agentic AI](https://openai.com/index/notion/)

### React 채팅 구현
- [shadcn-chatbot-kit](https://github.com/Blazity/shadcn-chatbot-kit)
- [shadcn-chat](https://github.com/jakobhoeg/shadcn-chat)
- [Assistant UI](https://github.com/assistant-ui/assistant-ui)
- [Vercel AI SDK Elements](https://ai-sdk.dev/elements/examples/chatbot)

### Framer Motion FAB
- [FAB Animation Tutorial](https://learnreact.design/course-posts/prototyping-react-framer/module7-animation-orchestration/7.4-floating-action-button-animation)
- [Tailwind + React + Framer Motion FAB](https://harpreetsinghsodi041.medium.com/mastering-the-art-of-fab-building-stunning-floating-action-buttons-with-tailwind-css-react-and-1cf4850ec8f3)

### AI 채팅 UX
- [AI Chatbot UX 가이드 2025](https://www.parallelhq.com/blog/ux-ai-chatbots)
- [Conversational UX Handbook](https://medium.com/@avigoldfinger/the-conversational-ux-handbook-2025-98d811bb6fcb)
- [AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/)

### Claude API
- [Claude API 통합 가이드 2025](https://collabnix.com/claude-api-integration-guide-2025-complete-developer-tutorial-with-code-examples/)
- [Claude 4 API 개발자 가이드](https://blog.logrocket.com/getting-started-claude-4-api-developers-walkthrough/)
