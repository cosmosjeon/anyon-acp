/**
 * AI 서포트 채팅 API 클라이언트
 * 서버의 /api/support/chat 엔드포인트와 SSE로 통신
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * AI 서포트 메시지를 스트리밍으로 받아옴
 */
export async function* streamSupportMessage(
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/api/support/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 마지막 불완전한 라인은 버퍼에 유지

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              yield parsed.text;
            }
          } catch (parseError) {
            // JSON 파싱 실패는 무시 (불완전한 청크일 수 있음)
            console.warn('[streamSupportMessage] Parse error:', parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
