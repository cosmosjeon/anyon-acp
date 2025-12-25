/**
 * 베타 서포트 시스템 상수
 */

export const SUPPORT_CONFIG = {
  // 카카오톡 채널 URL (production에서 실제 URL로 교체)
  KAKAO_CHANNEL_URL: 'https://pf.kakao.com/_mock',

  // 외주 상담 폼 URL
  OUTSOURCE_FORM_URL: 'https://forms.google.com/mock-form',

  // AI 채팅 설정
  AI_CHAT: {
    MODEL: 'gemini-2.0-flash-exp',
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
    FLOATING_BUTTON_OFFSET: 24, // bottom, right offset
  },
} as const;
