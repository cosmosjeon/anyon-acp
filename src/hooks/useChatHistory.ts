import { useState, useCallback, useEffect } from 'react';
import { SUPPORT_CONFIG } from '@/constants/support';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(SUPPORT_CONFIG.HISTORY.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        // 스트리밍 상태 초기화 (이전 세션에서 남은 것)
        return parsed
          .slice(-SUPPORT_CONFIG.HISTORY.MAX_MESSAGES)
          .map((m) => ({ ...m, isStreaming: false }));
      }
    } catch (e) {
      console.error('[useChatHistory] Failed to load history:', e);
    }
    return [];
  });

  // localStorage에 저장
  useEffect(() => {
    try {
      const toSave = messages
        .slice(-SUPPORT_CONFIG.HISTORY.MAX_MESSAGES)
        .map(({ isStreaming, ...rest }) => rest); // 스트리밍 상태는 저장하지 않음
      localStorage.setItem(
        SUPPORT_CONFIG.HISTORY.STORAGE_KEY,
        JSON.stringify(toSave)
      );
    } catch (e) {
      console.error('[useChatHistory] Failed to save history:', e);
    }
  }, [messages]);

  const addMessage = useCallback(
    (
      message: Omit<Message, 'id' | 'timestamp'>
    ): Message => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    []
  );

  const updateMessage = useCallback(
    (id: string, updates: Partial<Omit<Message, 'id' | 'timestamp'>>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(SUPPORT_CONFIG.HISTORY.STORAGE_KEY);
  }, []);

  return {
    messages,
    addMessage,
    updateMessage,
    clearHistory,
  };
}
